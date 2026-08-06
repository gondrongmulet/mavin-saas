// ============================================================
// MAVIN Thermal Printer Service
// Triple-Action Thermal Printer Hardware Engine for Android APK
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

export function printReceipt(elementId: string, options?: PrintOptions): void {
  const plainText = formatPlainTextReceipt(options);
  if (!plainText) {
    alert('⚠️ Data nota struk tidak valid.');
    return;
  }

  const base64Text = btoa(unescape(encodeURIComponent(plainText)));

  // CHANNEL 1: Send directly to Bluetooth Thermal Printer Socket (RawBT Local Server 127.0.0.1:40213)
  fetch('http://127.0.0.1:40213/print', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: plainText
  }).catch(() => {});

  // CHANNEL 2: Launch Android Thermal Printer Intent (intent:base64,...)
  try {
    const intentUrl = 'intent:base64,' + base64Text + '#Intent;scheme=rawbt;package=ru.a404m.rawbt;end;';
    const a = document.createElement('a');
    a.href = intentUrl;
    a.target = '_system';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 500);
  } catch (e) {}

  // CHANNEL 3: Trigger Layanan Cetak Android (window.print)
  try {
    window.print();
  } catch (e) {}
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
    alert('📋 Teks Struk Nota berhasil disalin!');
    return true;
  } catch (e) {
    console.warn('[PrinterService] Clipboard copy error:', e);
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
