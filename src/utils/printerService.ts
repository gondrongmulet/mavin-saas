// ============================================================
// MAVIN Thermal Printer Service
// Universal Seamless Android APK & Web Printing
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

// 1. Direct Web Bluetooth ESC/POS Printing
export async function printDirectBluetoothESC(options?: PrintOptions): Promise<boolean> {
  const nav = navigator as any;

  if (!nav.bluetooth) {
    return false;
  }

  try {
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
      await device.gatt.disconnect();
      return false;
    }

    const text = formatPlainTextReceipt(options);
    const encoder = new TextEncoder();
    const initCmd = new Uint8Array([0x1b, 0x40]);
    const feedCutCmd = new Uint8Array([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x41, 0x03]);

    await targetChar.writeValue(initCmd);
    const textBytes = encoder.encode(text);

    for (let i = 0; i < textBytes.length; i += 100) {
      const chunk = textBytes.slice(i, i + 100);
      await targetChar.writeValue(chunk);
    }
    await targetChar.writeValue(feedCutCmd);

    await device.gatt.disconnect();
    return true;
  } catch (e: any) {
    console.warn('[PrinterService] Web Bluetooth print error:', e);
    return false;
  }
}

// 2. Seamless Universal Print (No Annoying Alert Boxes!)
export async function printReceipt(elementId: string, options?: PrintOptions): Promise<void> {
  // Try Web Bluetooth first if available
  const nav = navigator as any;
  if (nav.bluetooth) {
    const ok = await printDirectBluetoothESC(options);
    if (ok) return;
  }

  // Fallback to Native System Print Spooler (window.print)
  try {
    window.print();
  } catch (e) {
    console.warn('[PrinterService] window.print fallback error:', e);
  }
}

// 3. Web Share API (Android Native Share Sheet)
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
