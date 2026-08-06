// ============================================================
// MAVIN Thermal Printer Service
// Direct Bluetooth ESC/POS Driver, System Spooler & Web Share Printing
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

// 1. Direct Web Bluetooth ESC/POS Thermal Printing (Connects directly to paired Bluetooth POS Printer!)
export async function printDirectBluetoothESC(options?: PrintOptions): Promise<boolean> {
  const nav = navigator as any;
  if (!nav.bluetooth) return false;

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

    // Convert formatted plain text receipt to ESC/POS bytes
    const text = formatPlainTextReceipt(options);
    const encoder = new TextEncoder();
    const initCmd = new Uint8Array([0x1b, 0x40]); // ESC @ (Reset)
    const feedCutCmd = new Uint8Array([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x41, 0x03]); // Feed & Cut

    await targetChar.writeValue(initCmd);
    const textBytes = encoder.encode(text);

    // Write in chunks of 100 bytes
    for (let i = 0; i < textBytes.length; i += 100) {
      const chunk = textBytes.slice(i, i + 100);
      await targetChar.writeValue(chunk);
    }
    await targetChar.writeValue(feedCutCmd);

    await device.gatt.disconnect();
    return true;
  } catch (e) {
    console.warn('[PrinterService] Direct Bluetooth print error/cancelled:', e);
    return false;
  }
}

// 2. In-Page System Spooler Printing (Clean hidden iframe print without popups/browser tabs)
export function printReceipt(elementId: string, options?: PrintOptions): void {
  const el = document.getElementById(elementId);
  const contentHtml = el ? el.innerHTML : '';
  const paperPx = options?.paperWidth === '80mm' ? '320px' : '230px';

  // Remove any previously created hidden print iframe
  const existingIframe = document.getElementById('mavin-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // Create a hidden in-page iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'mavin-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = '0px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Nota ${options?.invoiceNo || ''}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { margin: 0; size: auto; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: ${paperPx};
            margin: 0 auto;
            padding: 10px 6px;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
          * { box-sizing: border-box; }
          img { max-width: 100%; height: auto; }
          .modal-footer, button, .no-print { display: none !important; }
        </style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
            }, 150);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 3000);
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
