import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Truck, Calendar, ArrowRight, Boxes } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIdr, formatNumber } from '../utils/calculator';
import { PurchaseItem } from '../types';

export const PurchasesView: React.FC = () => {
  const { ingredients, purchases, addPurchase } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Item form input
  const [selectedIngId, setSelectedIngId] = useState<string>(ingredients[0]?.id || '');
  const [itemQty, setItemQty] = useState<number>(0);
  const [itemTotalCost, setItemTotalCost] = useState<number>(0);

  const handleAddItem = () => {
    if (!selectedIngId || itemQty <= 0 || itemTotalCost <= 0) {
      alert('⚠️ Silakan pilih bahan baku, jumlah beli, dan total harga beli yang valid.');
      return;
    }

    const ing = ingredients.find(i => i.id === selectedIngId);
    if (!ing) return;

    const unitPrice = itemTotalCost / itemQty;
    const newItem: PurchaseItem = {
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: itemQty,
      unit: ing.unit,
      totalPrice: itemTotalCost,
      unitPrice
    };

    setItems([...items, newItem]);

    // Reset item inputs
    setItemQty(0);
    setItemTotalCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const grandTotalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('⚠️ Belum ada bahan baku yang ditambahkan ke nota kulakan.');
      return;
    }

    addPurchase({
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      supplier: supplier.trim() || 'Supplier Umum',
      items,
      totalCost: grandTotalCost,
      notes: notes.trim()
    });

    setIsModalOpen(false);
    setSupplier('');
    setNotes('');
    setItems([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Kulakan & Restock Bahan Baku</h2>
          <p style={{ fontSize: '0.875rem' }}>Catat pengeluaran belanja bahan baku dari supplier untuk memperbarui stok & HPP WAC otomatis.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-emerald"
          style={{ padding: '0.75rem 1.5rem', fontWeight: 800 }}
        >
          <Plus size={18} /> Restock / Input Kulakan Baru
        </button>
      </div>

      {/* Purchase Log History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>Riwayat Kulakan Terakhir ({purchases.length} Transaksi)</h3>

        {purchases.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Belum ada riwayat kulakan recorded.
          </div>
        ) : (
          purchases.map(pur => (
            <div key={pur.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>{pur.id}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {pur.date}
                    </span>
                  </div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800 }}>
                    <Truck size={18} color="var(--text-muted)" /> {pur.supplier}
                  </h4>
                  {pur.notes && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.2rem' }}>"{pur.notes}"</p>}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Pengeluaran Kulakan</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {formatIdr(pur.totalCost)}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Detail Bahan Baku Dibeli:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {pur.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <div>
                        <strong style={{ fontWeight: 800, color: '#0f172a' }}>{item.ingredientName}</strong> &bull; <span style={{ color: '#475569', fontWeight: 600 }}>{formatNumber(item.quantity)} {item.unit}</span>
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatIdr(item.totalPrice)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({formatIdr(item.unitPrice)}/{item.unit})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Purchase Modal - Clean Responsive Grid */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="var(--accent-emerald)" /> Input Transaksi Kulakan / Restock
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)', padding: '0.2rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Supplier / Toko Kulakan *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toko Bahan Kue Maju, Pasar Central"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Diskon pembelian grosir / Nota #991"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Section for adding items - Clean Mobile Responsive Stack */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Tambah Item Bahan Baku</h4>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pilih Bahan Baku *</label>
                  <select
                    value={selectedIngId}
                    onChange={e => setSelectedIngId(e.target.value)}
                    className="form-control"
                    style={{ fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        🧪 {ing.name.toUpperCase()} (Stok: {ing.stock} {ing.unit} | HPP Saat ini: {formatIdr(ing.costPerUnit)}/{ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Jumlah Beli *</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty || ''}
                      onChange={e => setItemQty(Number(e.target.value))}
                      className="form-control"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total Harga Beli (Rp) *</label>
                    <input
                      type="number"
                      min="1"
                      value={itemTotalCost || ''}
                      onChange={e => setItemTotalCost(Number(e.target.value))}
                      className="form-control"
                      placeholder="e.g. 50000"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-emerald"
                    style={{ padding: '0.7rem 1.25rem', width: '100%', fontWeight: 800 }}
                  >
                    <Plus size={16} /> + Tambah Item
                  </button>
                </div>

                {itemQty > 0 && itemTotalCost > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    💡 Estimasi Harga Beli per Unit: <strong>{formatIdr(itemTotalCost / itemQty)}</strong> / {ingredients.find(i => i.id === selectedIngId)?.unit}
                  </div>
                )}
              </div>

              {/* List of items in current purchase */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Daftar Bahan dalam Nota ini ({items.length} Item)
                </h4>
                {items.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Belum ada bahan baku yang ditambahkan ke nota kulakan.
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>BAHAN BAKU</th>
                          <th>JUMLAH</th>
                          <th>TOTAL HARGA (RP)</th>
                          <th>HPP/UNIT BARU</th>
                          <th>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 800, color: '#0f172a' }}>{item.ingredientName}</td>
                            <td>{formatNumber(item.quantity)} {item.unit}</td>
                            <td style={{ fontWeight: 700 }}>{formatIdr(item.totalPrice)}</td>
                            <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                              {formatIdr(item.unitPrice)} / {item.unit}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.5rem', color: 'var(--accent-rose)', borderColor: '#fca5a5' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total Summary & Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Pengeluaran Nota:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {formatIdr(grandTotalCost)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.75rem' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-emerald"
                    style={{ flex: 2, padding: '0.75rem', fontWeight: 800 }}
                  >
                    ✓ Simpan & Update HPP Otomatis
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
