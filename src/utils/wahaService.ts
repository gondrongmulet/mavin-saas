import { WahaConfig, Ingredient } from '../types';

// ============================================================
// WAHA WhatsApp Gateway Service
// Sends messages via self-hosted WAHA API
// ============================================================

const THROTTLE_KEY = 'mavin_waha_last_stock_alert';
const THROTTLE_HOURS = 6;

function getWahaConfig(): WahaConfig | null {
  const stored = localStorage.getItem('mavin_waha_config');
  if (!stored) return null;
  try {
    const config = JSON.parse(stored);
    if (config.url && config.apiKey && config.session && config.enabled) {
      return config;
    }
  } catch (e) {}
  return null;
}

// Format phone number to WhatsApp format (62xxx)
function formatPhone(phone: string): string {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('08')) {
    clean = '62' + clean.substring(1);
  } else if (clean.startsWith('+62')) {
    clean = clean.substring(1);
  }
  return clean + '@c.us';
}

// Send a WhatsApp message via WAHA API
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  config?: WahaConfig | null
): Promise<{ success: boolean; error?: string }> {
  const wahaConfig = config || getWahaConfig();
  if (!wahaConfig || !wahaConfig.enabled) {
    return { success: false, error: 'WAHA tidak aktif' };
  }

  const chatId = formatPhone(phone);
  const url = `${wahaConfig.url.replace(/\/+$/, '')}/api/sendText`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': wahaConfig.apiKey
      },
      body: JSON.stringify({
        session: wahaConfig.session,
        chatId,
        text: message
      })
    });

    if (res.ok) {
      return { success: true };
    } else {
      const errText = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

// Test connection to WAHA server
export async function testWahaConnection(
  config: WahaConfig
): Promise<{ success: boolean; error?: string }> {
  const url = `${config.url.replace(/\/+$/, '')}/api/sessions`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': config.apiKey
      }
    });

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${res.status}` };
    }
  } catch (e: any) {
    return { success: false, error: e.message || 'Tidak dapat terhubung ke server WAHA' };
  }
}

// Send stock alert via WhatsApp (with throttle)
export async function sendStockAlertWA(
  lowStockItems: Ingredient[],
  phone: string,
  storeName: string
): Promise<{ sent: boolean; reason?: string }> {
  // Check throttle
  const lastSent = localStorage.getItem(THROTTLE_KEY);
  if (lastSent) {
    const elapsed = Date.now() - parseInt(lastSent, 10);
    const throttleMs = THROTTLE_HOURS * 60 * 60 * 1000;
    if (elapsed < throttleMs) {
      const remainHrs = ((throttleMs - elapsed) / 3600000).toFixed(1);
      return { sent: false, reason: `Throttled. Kirim berikutnya dalam ${remainHrs} jam` };
    }
  }

  if (lowStockItems.length === 0) {
    return { sent: false, reason: 'Tidak ada stok menipis' };
  }

  const config = getWahaConfig();
  if (!config || !config.enabled) {
    return { sent: false, reason: 'WAHA tidak aktif' };
  }

  // Build message
  const itemLines = lowStockItems
    .map(i => `⚠️ ${i.name}: ${i.stock} ${i.unit} (min: ${i.minStock} ${i.unit})`)
    .join('\n');

  const message = `🔔 *PERINGATAN STOK MENIPIS*\n📍 ${storeName}\n📅 ${new Date().toLocaleDateString('id-ID')}\n\n${itemLines}\n\nSegera lakukan pembelian bahan baku untuk menghindari kehabisan stok.\n\n_Dikirim otomatis oleh MAVIN_`;

  const result = await sendWhatsAppMessage(phone, message, config);

  if (result.success) {
    localStorage.setItem(THROTTLE_KEY, Date.now().toString());
    return { sent: true };
  }

  return { sent: false, reason: result.error };
}
