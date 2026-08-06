// ============================================================
// MAVIN Thermal Printer Service
// Universal receipt printing for Android APK (Bluetooth/USB) & Web Desktop
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
  connectionType?: 'bluetooth' | 'usb' | 'web_dialog';
  headerNote?: string;
  footerNote?: string;
}

export function printReceipt(elementId: string, options?: PrintOptions): void {
  const isAndroid = /Android/i.test(navigator.userAgent) || Boolean((window as any).Capacitor);
  const connType = options?.connectionType || 'bluetooth';

  // 1. If connectionType is Bluetooth / USB or on Android APK, trigger RawBT Bluetooth Thermal Printer Scheme
  if ((connType === 'bluetooth' || connType === 'usb' || isAndroid) && connType !== 'web_dialog') {
    const plainText = formatPlainTextReceipt(options);
    if (plainText) {
      const base64Text = btoa(unescape(encodeURIComponent(plainText)));
      
      // Try RawBT Protocol Anchor Click (Safe for Capacitor Android WebView)
      try {
        const rawbtLink = document.createElement('a');
        rawbtLink.href = 'rawbt:base64,' + base64Text;
        rawbtLink.style.display = 'none';
        document.body.appendChild(rawbtLink);
        rawbtLink.click();
        
        setTimeout(() => {
          if (document.body.contains(rawbtLink)) {
            document.body.removeChild(rawbtLink);
          }
        }, 500);
        return;
      } catch (e) {
        console.warn('[PrinterService] RawBT link click error:', e);
      }
    }
  }

  // 2. System Print Spooler Popup (Works in Android System Spooler & Desktop Browser)
  const el = document.getElementById(elementId);
  const contentHtml = el ? el.innerHTML : '';
  const paperPx = options?.paperWidth === '80mm' ? '320px' : '230px';

  // Try Window Popup first (Best for Android WebView & Native Print Spoolers)
  const printWin = window.open('', '_blank', 'width=380,height=600');
  if (printWin) {
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Nota</title>
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
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
    return;
  }

  // 3. Fallback to hidden iframe print
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Nota</title>
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
              window.print();
              setTimeout(function() { if (window.frameElement) window.frameElement.remove(); }, 1200);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  }
}

function formatPlainTextReceipt(options?: PrintOptions): string {
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
  txt += '\n\n\n'; // Feed paper
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
