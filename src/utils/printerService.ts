// ============================================================
// MAVIN Thermal Printer Service
// Direct Bluetooth ESC/POS Printing (Zero Third-Party Apps Needed!)
// ============================================================

export interface PrintOptions {
  storeName?: string;
  items?: Array<{ name?: string; recipeName?: string; quantity?: number; qty?: number; pricePerUnit?: number; price?: number }>;
  subtotal?: number;
  taxAmount?: number;
  serviceAmount?: number;
  discount?: number;
  grandTotal?: number;
  total?: number;
  cashPaid?: number;
  change?: number;
  paymentMethod?: string;
  invoiceNo?: string;
  date?: string;
  paperWidth?: '58mm' | '80mm';
  connectionType?: 'bluetooth' | 'usb' | 'web_dialog' | 'share';
  headerNote?: string;
  footerNote?: string;
}

// Direct Web Bluetooth ESC/POS Thermal Printing (No extra apps needed!)
export async function printDirectBluetoothESC(options?: PrintOptions): Promise<boolean> {
  const nav = navigator as any;

  if (!nav.bluetooth) {
    alert('⚠️ Bluetooth API belum aktif di browser/HP ini. Pastikan Bluetooth & Lokasi HP Anda sudah diaktifkan.');
    return false;
  }

  try {
    // 1. Scan and pick Bluetooth Thermal Printer directly
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00005f9b34fb',
        '00001101-0000-1000-8000-00005f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '0000ff00-0000-1000-8000-00005f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'
      ]
    });

    if (!device) return false;

    const server = await device.gatt.connect();
    const services = await server.getPrimaryServices();
    let targetChar: any = null;

    for (const service of services) {
      const chars = await service.getCharacteristics();
      for (const c of chars) {
        if (c.properties.write || c.properties.writeWithoutResponse) {
          targetChar = c;
          break;
        }
      }
      if (targetChar) break;
    }

    if (!targetChar) {
      alert('⚠️ Gagal menemukan saluran cetak (GATT Characteristic) pada printer Bluetooth ini.');
      await device.gatt.disconnect();
      return false;
    }

    // 2. Format plain text receipt and convert to ESC/POS byte stream
    const text = formatPlainTextReceipt(options);
    const encoder = new TextEncoder();
    const initCmd = new Uint8Array([0x1b, 0x40]); // ESC @ (Initialize Printer)
    const feedCutCmd = new Uint8Array([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x41, 0x03]); // Feed lines & Cut

    await targetChar.writeValue(initCmd);
    const textBytes = encoder.encode(text);

    // Send chunks of 100 bytes directly over Bluetooth
    for (let i = 0; i < textBytes.length; i += 100) {
      const chunk = textBytes.slice(i, i + 100);
      await targetChar.writeValue(chunk);
    }
    await targetChar.writeValue(feedCutCmd);

    await device.gatt.disconnect();
    alert('✅ Struk berhasil dicetak ke printer Bluetooth!');
    return true;
  } catch (e: any) {
    if (e.name !== 'NotFoundError') {
      alert('⚠️ Kendala Bluetooth Printer: ' + (e.message || e));
    }
    return false;
  }
}

export function printReceipt(elementId: string, options?: PrintOptions): void {
  // Trigger Direct Bluetooth Print as default
  printDirectBluetoothESC(options);
}

export async function shareReceiptText(options?: PrintOptions): Promise<boolean> {
  const plainText = formatPlainTextReceipt(options);
  if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `Struk Nota - ${options?.invoiceNo || 'MAVIN'}`,
        text: plainText
      });
      return true;
    } catch (e) {
      console.warn('[PrinterService] Web Share error:', e);
    }
  }

  try {
    await navigator.clipboard.writeText(plainText);
    alert('📋 Teks Struk Nota berhasil disalin ke clipboard!');
    return true;
  } catch (e) {
    alert('⚠️ Gagal menyalin teks struk.');
  }
  return false;
}

export function formatPlainTextReceipt(options?: PrintOptions): string {
  if (!options) return '';
  const width = options.paperWidth === '80mm' ? 48 : 32;
  const line = '='.repeat(width) + '\n';
  const dash = '-'.repeat(width) + '\n';

  let txt = '';
  txt += centerText(options.storeName || 'MAVIN POS', width) + '\n';
  if (options.headerNote) {
    txt += centerText(options.headerNote, width) + '\n';
  }
  txt += line;

  if (options.invoiceNo) {
    txt += leftRight('No:', options.invoiceNo, width) + '\n';
  }
  if (options.date) {
    txt += leftRight('Tgl:', options.date, width) + '\n';
  }
  if (options.invoiceNo || options.date) {
    txt += dash;
  }

  const items = options.items || [];
  items.forEach((item: any) => {
    const name = item.name || item.recipeName || 'Produk';
    const qty = item.quantity || item.qty || 1;
    const price = item.pricePerUnit || item.price || 0;
    const sub = qty * price;

    txt += leftRight(name, formatRp(sub), width) + '\n';
    txt += `   ${qty} x ${formatRp(price)}\n`;
  });

  txt += dash;

  const grandTotal = options.grandTotal || options.total || 0;
  txt += leftRight('TOTAL', formatRp(grandTotal), width) + '\n';

  if (options.paymentMethod) {
    txt += leftRight('Bayar (' + options.paymentMethod + ')', formatRp(options.cashPaid || grandTotal), width) + '\n';
  }
  if (options.change && options.change > 0) {
    txt += leftRight('Kembalian', formatRp(options.change), width) + '\n';
  }

  txt += line;
  if (options.footerNote) {
    txt += centerText(options.footerNote, width) + '\n';
  }
  txt += '\n\n\n';
  return txt;
}

function centerText(str: string, width: number): string {
  if (str.length >= width) return str.substring(0, width);
  const pad = Math.floor((width - str.length) / 2);
  return ' '.repeat(pad) + str;
}

function leftRight(left: string, right: string, width: number): string {
  const maxLeft = width - right.length - 1;
  const l = left.length > maxLeft ? left.substring(0, maxLeft) : left;
  const spaces = width - l.length - right.length;
  return l + ' '.repeat(Math.max(1, spaces)) + right;
}

function formatRp(val: number): string {
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}
