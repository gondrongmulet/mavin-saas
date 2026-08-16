// ============================================================
// MAVIN Thermal Printer Service
// Native Android Bluetooth SPP Driver & Universal Fallback
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

export interface PairedPrinterDevice {
  name: string;
  address: string;
}

// Check if Native Android Bluetooth Bridge is present in APK
export function isNativeBluetoothPrinterAvailable(): boolean {
  const nativePrinter = (window as any).AndroidBluetoothPrinter;
  return Boolean(nativePrinter && typeof nativePrinter.printReceipt === 'function');
}

// Get list of paired Bluetooth devices on Android phone
export function getNativePairedPrinters(): PairedPrinterDevice[] {
  const nativePrinter = (window as any).AndroidBluetoothPrinter;
  if (nativePrinter && typeof nativePrinter.getPairedDevices === 'function') {
    try {
      const jsonStr = nativePrinter.getPairedDevices();
      return JSON.parse(jsonStr || '[]');
    } catch (e) {
      console.warn('[PrinterService] Error parsing paired devices:', e);
      return [];
    }
  }
  return [];
}

// Primary Print Function
export async function printReceipt(elementId: string, options?: PrintOptions): Promise<{ success: boolean; message: string }> {
  const plainText = formatPlainTextReceipt(options);
  if (!plainText) {
    return { success: false, message: 'Data struk nota tidak valid.' };
  }

  // 1. Native Android Bluetooth Bridge (Primary for APK - ZERO third party apps!)
  const nativePrinter = (window as any).AndroidBluetoothPrinter;
  if (nativePrinter && typeof nativePrinter.printReceipt === 'function') {
    try {
      const selectedMac = localStorage.getItem('mavin_selected_printer_mac') || '';
      const result: string = nativePrinter.printReceipt(plainText, selectedMac);
      if (result && result.startsWith('SUCCESS')) {
        return { success: true, message: result };
      } else {
        alert(result || '⚠️ Gagal mencetak ke printer Bluetooth.');
        return { success: false, message: result };
      }
    } catch (e: any) {
      alert('⚠️ Gagal mengirim data ke Bluetooth Printer: ' + (e?.message || e));
      return { success: false, message: String(e) };
    }
  }

  // 2. Web Bluetooth Direct (For Chrome Browser on Android / Desktop)
  const nav = navigator as any;
  if (typeof navigator !== 'undefined' && nav.bluetooth) {
    const ok = await printDirectBluetoothESC(options);
    if (ok) return { success: true, message: 'Berhasil mencetak via Web Bluetooth' };
  }

  // 3. Fallback: window.print() (For Web Desktop)
  try {
    window.print();
    return { success: true, message: 'Membuka dialog cetak sistem' };
  } catch (e) {
    return { success: false, message: 'Gagal mencetak' };
  }
}

// Web Bluetooth ESC/POS Direct (Chrome Web Browser)
export async function printDirectBluetoothESC(options?: PrintOptions): Promise<boolean> {
  const nav = navigator as any;
  if (!nav || !nav.bluetooth) return false;

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

// Format Plain Text Struk Receipt
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
