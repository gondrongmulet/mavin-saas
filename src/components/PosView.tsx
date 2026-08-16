import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  Printer,
  X,
  Send,
  RefreshCw,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SaleTransaction, SaleItem } from '../types';
import { calculateRecipeHppDetails, formatIdr } from '../utils/calculator';
import { printReceipt } from '../utils/printerService';

export const PosView: React.FC = () => {
  const { recipes, ingredients, addSaleTransaction, storeSettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer Bank' | 'E-Wallet'>('QRIS');
  const [discount, setDiscount] = useState<number>(0);
  const [cashPaid, setCashPaid] = useState<number>(0);

  // Cart State: Map of recipeId -> quantity
  const [cart, setCart] = useState<{ [recipeId: string]: number }>({});

  // Checkout submission protection
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Completed Receipt Modal State
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);

  // Anti-Double Print States
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCount, setPrintCount] = useState(0);
  const [printFeedback, setPrintFeedback] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [showReprintConfirm, setShowReprintConfirm] = useState(false);

  const categories = ['All', ...Array.from(new Set(recipes.map(r => r.category)))];

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (recipeId: string) => {
    setCart(prev => ({
      ...prev,
      [recipeId]: (prev[recipeId] || 0) + 1
    }));
  };

  const updateCartQty = (recipeId: string, delta: number) => {
    setCart(prev => {
      const current = prev[recipeId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[recipeId];
        return copy;
      }
      return { ...prev, [recipeId]: next };
    });
  };

  const clearCart = () => {
    setCart({});
    setCustomerName('');
    setDiscount(0);
    setCashPaid(0);
  };

  // Cart calculations
  const cartItems: SaleItem[] = Object.entries(cart).map(([recipeId, qty]) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return null as any;

    const hppDetails = calculateRecipeHppDetails(recipe, ingredients);
    const subtotal = recipe.sellingPrice * qty;
    const totalHpp = hppDetails.hppPerUnit * qty;
    const profit = subtotal - totalHpp;

    return {
      recipeId,
      recipeName: recipe.name,
      quantity: qty,
      pricePerUnit: recipe.sellingPrice,
      hppPerUnit: hppDetails.hppPerUnit,
      subtotal,
      totalHpp,
      profit
    };
  }).filter(Boolean);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTotalHpp = cartItems.reduce((sum, item) => sum + item.totalHpp, 0);
  
  const taxAmount = Math.round((cartSubtotal * (storeSettings.taxPercent || 0)) / 100);
  const serviceAmount = Math.round((cartSubtotal * (storeSettings.servicePercent || 0)) / 100);
  const cartGrandTotal = Math.max(0, cartSubtotal + taxAmount + serviceAmount - discount);
  const cartGrossProfit = cartGrandTotal - cartTotalHpp;
  const change = Math.max(0, cashPaid - cartGrandTotal);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isSubmittingCheckout) return;

    if (paymentMethod === 'Tunai' && cashPaid < cartGrandTotal) {
      alert(`Uang tunai kurang! Diperlukan ${formatIdr(cartGrandTotal)}, dibayar ${formatIdr(cashPaid)}.`);
      return;
    }

    setIsSubmittingCheckout(true);

    const saleRecord = addSaleTransaction({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: customerName || 'Pelanggan Umum',
      paymentMethod,
      items: cartItems,
      subtotal: cartSubtotal,
      taxAmount,
      serviceAmount,
      discount,
      grandTotal: cartGrandTotal,
      totalHpp: cartTotalHpp,
      grossProfit: cartGrossProfit,
      cashPaid: paymentMethod === 'Tunai' ? cashPaid : cartGrandTotal,
      change: paymentMethod === 'Tunai' ? change : 0
    });

    setPrintCount(0);
    setPrintFeedback(null);
    setShowReprintConfirm(false);
    setCompletedSale(saleRecord);
    clearCart();
    setIsSubmittingCheckout(false);
  };

  // Safe Print Executor with Anti-Duplicate Logic
  const executePrint = async () => {
    if (!completedSale || isPrinting) return;
    setIsPrinting(true);
    setPrintFeedback({ type: 'info', text: 'Mengirim struk ke printer Bluetooth...' });

    try {
      const res = await printReceipt('printable-receipt', {
        storeName: storeSettings.storeName,
        items: completedSale.items,
        subtotal: completedSale.subtotal,
        taxAmount: completedSale.taxAmount,
        discount: completedSale.discount,
        grandTotal: completedSale.grandTotal,
        cashPaid: completedSale.cashPaid,
        change: completedSale.change,
        paymentMethod: completedSale.paymentMethod,
        invoiceNo: completedSale.invoiceNo,
        date: completedSale.date,
        paperWidth: storeSettings.printerPaperWidth,
        footerNote: storeSettings.footerNote
      });

      if (res.success) {
        setPrintCount(prev => prev + 1);
        setPrintFeedback({ type: 'success', text: `✅ Struk berhasil dicetak (${printCount + 1}x)!` });
      } else {
        setPrintFeedback({ type: 'error', text: '⚠️ ' + (res.message || 'Gagal mencetak') });
      }
    } catch (err: any) {
      setPrintFeedback({ type: 'error', text: '⚠️ Gagal mengirim: ' + (err?.message || err) });
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
      }, 1200);
    }
  };

  // Intercept print click: If already printed once, ask for confirmation to avoid duplicate prints!
  const handlePrintClick = () => {
    if (isPrinting) return;
    if (printCount > 0) {
      setShowReprintConfirm(true);
    } else {
      executePrint();
    }
  };

  const handleSendWhatsApp = () => {
    if (!completedSale) return;

    let itemsText = '';
    completedSale.items.forEach(i => {
      itemsText += `• ${i.quantity}x ${i.recipeName} = ${formatIdr(i.subtotal)}\n`;
    });

    const message = `*${storeSettings.storeName}*\n${storeSettings.address}\n----------------------------------\nInvoice: ${completedSale.invoiceNo}\nTanggal: ${completedSale.date}\nPelanggan: ${completedSale.customerName || 'Umum'}\n----------------------------------\n${itemsText}----------------------------------\nSubtotal: ${formatIdr(completedSale.subtotal)}\n` +
      (completedSale.taxAmount > 0 ? `Pajak PB1 (${storeSettings.taxPercent}%): ${formatIdr(completedSale.taxAmount)}\n` : '') +
      `*GRAND TOTAL: ${formatIdr(completedSale.grandTotal)}*\nMetode Bayar: ${completedSale.paymentMethod}\n----------------------------------\n_${storeSettings.footerNote}_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
  };

  const closeReceiptModal = () => {
    setCompletedSale(null);
    setPrintCount(0);
    setPrintFeedback(null);
    setShowReprintConfirm(false);
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Left: Product Catalog */}
      <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2>Kasir POS Penjualan</h2>
          <p style={{ fontSize: '0.875rem' }}>Pilih produk, catat pesanan pelanggan, dan otomatis hitung laba kotor & potong stok siap jual.</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="card" style={{ padding: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.8rem 0.45rem 2.2rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
          {filteredRecipes.map(recipe => {
            const hppDetails = calculateRecipeHppDetails(recipe, ingredients);
            const isOutOfStock = recipe.finishedStock <= 0;

            return (
              <div
                key={recipe.id}
                className="card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isOutOfStock ? 0.65 : 1,
                  border: cart[recipe.id] ? '2px solid var(--primary)' : undefined
                }}
              >
                <div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.68rem', marginBottom: '0.35rem', display: 'inline-flex' }}>
                    {recipe.category}
                  </span>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{recipe.name}</h4>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {formatIdr(recipe.sellingPrice)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>HPP: {formatIdr(hppDetails.hppPerUnit)}</span>
                    <span style={{ color: isOutOfStock ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                      Stok: {recipe.finishedStock} {recipe.yieldUnit}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(recipe.id)}
                    className="btn btn-primary"
                    disabled={isOutOfStock}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      background: isOutOfStock ? '#cbd5e1' : undefined
                    }}
                  >
                    <Plus size={16} /> {isOutOfStock ? 'Stok Habis' : 'Tambah'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Cart & Payment Checkout Sidebar */}
      <div style={{ flex: '0 0 380px', minWidth: '320px' }}>
        <div className="card" style={{ position: 'sticky', top: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} color="var(--primary)" /> Keranjang Kasir ({cartItems.reduce((s, i) => s + i.quantity, 0)})
            </h3>
            {cartItems.length > 0 && (
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {cartItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Keranjang masih kosong. Klik "+ Tambah" pada produk di sebelah kiri.
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.recipeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.recipeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatIdr(item.pricePerUnit)} x {item.quantity}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button onClick={() => updateCartQty(item.recipeId, -1)} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem' }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.recipeId, 1)} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem' }}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Payment Form */}
          {cartItems.length > 0 && (
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Pelanggan (Opsional)</label>
                <input
                  type="text"
                  placeholder="e.g. Kak Andi"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Metode Pembayaran</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {(['QRIS', 'Tunai', 'Transfer Bank', 'E-Wallet'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      className={`btn ${paymentMethod === method ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.35rem', fontSize: '0.75rem' }}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Tunai' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Uang Diterima (Rp)</label>
                    <input
                      type="number"
                      value={cashPaid || ''}
                      onChange={e => setCashPaid(Number(e.target.value))}
                      className="form-control"
                      placeholder="Bayar"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Kembalian</label>
                    <div className="form-control" style={{ background: '#f8fafc', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {formatIdr(change)}
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Transaction Profit Inspector Box */}
              <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#065f46' }}>
                  <span>Subtotal:</span>
                  <span>{formatIdr(cartSubtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#065f46' }}>
                    <span>Pajak PB1 ({storeSettings.taxPercent}%):</span>
                    <span>+{formatIdr(taxAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#065f46' }}>
                  <span>Modal HPP:</span>
                  <span>{formatIdr(cartTotalHpp)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                  <span>Estimasi Laba Kotor:</span>
                  <span>+{formatIdr(cartGrossProfit)}</span>
                </div>
              </div>

              {/* Total & Checkout Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Bayar:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatIdr(cartGrandTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingCheckout}
                className="btn btn-emerald"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  width: '100%',
                  opacity: isSubmittingCheckout ? 0.7 : 1,
                  cursor: isSubmittingCheckout ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmittingCheckout ? (
                  <>
                    <RefreshCw size={18} className="spin" /> Memproses Transaksi...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Selesaikan Pesanan & Buka Struk
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {completedSale && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '440px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={18} color="var(--primary)" /> Nota Struk Pembayaran
              </h3>
              <button onClick={closeReceiptModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Print Status Feedback Banner */}
            {printFeedback && (
              <div
                style={{
                  margin: '0.75rem 1rem 0',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: printFeedback.type === 'success' ? '#ecfdf5' : printFeedback.type === 'error' ? '#fef2f2' : '#eef2ff',
                  border: `1px solid ${printFeedback.type === 'success' ? '#a7f3d0' : printFeedback.type === 'error' ? '#fca5a5' : '#c7d2fe'}`,
                  color: printFeedback.type === 'success' ? '#065f46' : printFeedback.type === 'error' ? '#b91c1c' : '#3730a3'
                }}
              >
                {printFeedback.text}
              </div>
            )}

            <div className="modal-body" id="printable-receipt" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{storeSettings.storeName}</h2>
                <p style={{ fontSize: '0.75rem', margin: 0 }}>{storeSettings.address}</p>
                <p style={{ fontSize: '0.75rem', margin: 0 }}>{completedSale.date} | {completedSale.invoiceNo}</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>Pelanggan: {completedSale.customerName}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem' }}>
                {completedSale.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <div>{item.recipeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} x {formatIdr(item.pricePerUnit)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatIdr(item.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatIdr(completedSale.subtotal)}</span>
                </div>
                {completedSale.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pajak PB1 ({storeSettings.taxPercent}%):</span>
                    <span>+{formatIdr(completedSale.taxAmount)}</span>
                  </div>
                )}
                {completedSale.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rose)' }}>
                    <span>Diskon:</span>
                    <span>-{formatIdr(completedSale.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.25rem' }}>
                  <span>TOTAL:</span>
                  <span>{formatIdr(completedSale.grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>Metode Bayar:</span>
                  <span>{completedSale.paymentMethod}</span>
                </div>
                {completedSale.paymentMethod === 'Tunai' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Tunai Diterima:</span>
                      <span>{formatIdr(completedSale.cashPaid || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                      <span>Kembalian:</span>
                      <span>{formatIdr(completedSale.change || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                *** {storeSettings.footerNote} ***
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'space-between', padding: '1rem' }}>
              <button
                type="button"
                onClick={closeReceiptModal}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              >
                ✨ Selesai / Kasir Baru
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="btn btn-emerald"
                  style={{ background: '#25D366', fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
                >
                  <Send size={16} /> WA Struk
                </button>

                <button
                  type="button"
                  disabled={isPrinting}
                  onClick={handlePrintClick}
                  className="btn btn-primary"
                  style={{
                    background: printCount > 0 ? '#6366f1' : '#4f46e5',
                    fontSize: '0.85rem',
                    padding: '0.6rem 1rem',
                    opacity: isPrinting ? 0.75 : 1,
                    cursor: isPrinting ? 'not-allowed' : 'pointer'
                  }}
                  title="Cetak langsung ke Printer Bluetooth POS tanpa aplikasi tambahan"
                >
                  {isPrinting ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Mencetak...
                    </>
                  ) : (
                    <>
                      <Printer size={16} /> {printCount > 0 ? `Cetak Salinan (${printCount}x)` : 'Cetak Struk POS'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Prevent Accidental Duplicate Print */}
      {showReprintConfirm && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ background: '#fffbeb', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid #fde68a' }}>
              <AlertTriangle size={28} color="#d97706" />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Konfirmasi Cetak Ulang
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1.25rem' }}>
              Struk invoice <strong>{completedSale?.invoiceNo}</strong> sudah pernah dicetak sebanyak <strong>{printCount} kali</strong>.
              <br />Apakah Anda yakin ingin mencetak salinan struk lagi?
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowReprintConfirm(false)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.6rem' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReprintConfirm(false);
                  executePrint();
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.6rem', background: '#4f46e5' }}
              >
                <Printer size={16} /> Ya, Cetak Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
