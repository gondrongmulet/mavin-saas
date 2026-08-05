import React, { useState } from 'react';
import { Plus, ShoppingCart, Calendar, Truck, ArrowUpRight, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseItem } from '../types';
import { formatIdr, formatNumber } from '../utils/calculator';

export const PurchasesView: React.FC = () => {
  const { ingredients, purchases, addPurchase, recipes } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Current item being added to form
  const [selectedIngId, setSelectedIngId] = useState('');
  const [itemQty, setItemQty] = useState<number>(0);
  const [itemTotalCost, setItemTotalCost] = useState<number>(0);

  const openAddModal = () => {
    setSupplier('');
    setNotes('');
    setItems([]);
    if (ingredients.length > 0) {
      setSelectedIngId(ingredients[0].id);
    }
    setItemQty(100);
    setItemTotalCost(5000);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const ing = ingredients.find(i => i.id === selectedIngId);
    if (!ing || itemQty <= 0 || itemTotalCost <= 0) return;

    const unitPrice = Math.round(itemTotalCost / itemQty);

    // Check if already added
    const existingIdx = items.findIndex(i => i.ingredientId === ing.id);
    if (existingIdx !== -1) {
      const updated = [...items];
      const newQty = updated[existingIdx].quantity + itemQty;
      const newTotal = updated[existingIdx].totalPrice + itemTotalCost;
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: newQty,
        totalPrice: newTotal,
        unitPrice: Math.round(newTotal / newQty)
      };
      setItems(updated);
    } else {
      setItems(prev => [
        ...prev,
        {
          ingredientId: ing.id,
          ingredientName: ing.name,
          quantity: itemQty,
          unit: ing.unit,
          totalPrice: itemTotalCost,
          unitPrice
        }
      ]);
    }

    // Reset current item inputs
    setItemQty(0);
    setItemTotalCost(0);
  };

  const handleRemoveItem = (ingId: string) => {
    setItems(prev => prev.filter(i => i.ingredientId !== ingId));
  };

  const grandTotalPurchaseCost = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Tambahkan minimal 1 bahan baku yang dibeli saat kulakan!');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

    addPurchase({
      date: dateStr,
      supplier: supplier || 'Supplier Umum',
      items,
      totalCost: grandTotalPurchaseCost,
      notes
    });

    setIsModalOpen(false);
    alert('✅ Kulakan berhasil dicatat! Stok & HPP seluruh resep terkait telah diperbarui secara otomatis.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Pembelian & Kulakan Bahan Baku</h2>
          <p style={{ fontSize: '0.875rem' }}>Catat pengeluaran restock bahan. Sistem akan memperbarui HPP per unit (WAC) & harga resep secara otomatis.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
          <Plus size={18} /> Catat Kulakan Baru
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        border: '1px solid #6ee7b7',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ width: '40px', height: '40px', background: '#059669', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp size={20} />
        </div>
        <div style={{ color: '#064e3b', fontSize: '0.9rem' }}>
          <strong>Bagaimana Engine HPP Dinamis Bekerja saat Kulakan?</strong>
          <br />
          Saat harga beli bahan di pasar naik/turun, input transaksi kulakan Anda akan langsung menghitung ulang nilai <em>Weighted Average Cost</em>. Seluruh resep yang mengandung bahan ini akan otomatis diperbarui nilai HPP & marginnya tanpa perlu dihitung ulang secara manual!
        </div>
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
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
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
                  Detail Bahan Baku Dibelii:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {pur.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <div>
                        <strong>{item.ingredientName}</strong> &bull; {formatNumber(item.quantity)} {item.unit}
                      </div>
                      <div>
                        {formatIdr(item.totalPrice)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({formatIdr(item.unitPrice)}/{item.unit})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="var(--accent-emerald)" /> Input Transaksi Kulakan / Restock
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Supplier / Toko Kulakan</label>
                    <input
                      type="text"
                      placeholder="e.g. Toko Bahan Kue Maju, Pasar Central, Distributor"
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

                {/* Section for adding items */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Tambah Item Bahan Baku</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Pilih Bahan</label>
                      <select
                        value={selectedIngId}
                        onChange={e => setSelectedIngId(e.target.value)}
                        className="form-control"
                      >
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (Stok: {ing.stock} {ing.unit} | HPP Saat ini: {formatIdr(ing.costPerUnit)}/{ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Jumlah Beli</label>
                      <input
                        type="number"
                        min="1"
                        value={itemQty || ''}
                        onChange={e => setItemQty(Number(e.target.value))}
                        className="form-control"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Total Harga Beli (Rp)</label>
                      <input
                        type="number"
                        min="1"
                        value={itemTotalCost || ''}
                        onChange={e => setItemTotalCost(Number(e.target.value))}
                        className="form-control"
                        placeholder="Total Rp"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn btn-emerald"
                      style={{ padding: '0.625rem 1rem' }}
                    >
                      <Plus size={16} /> Tambah
                    </button>
                  </div>

                  {itemQty > 0 && itemTotalCost > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      💡 Estimasi Harga Beli per Unit: <strong>{formatIdr(itemTotalCost / itemQty)}</strong> / {ingredients.find(i => i.id === selectedIngId)?.unit}
                    </div>
                  )}
                </div>

                {/* List of items in current purchase */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Daftar Bahan dalam Nota ini ({items.length} Item)</h4>
                  {items.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Belum ada bahan baku yang ditambahkan ke nota kulakan.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Bahan Baku</th>
                            <th>Jumlah</th>
                            <th>Harga Unit Baru</th>
                            <th>Total Beli</th>
                            <th>Estimasi Dampak HPP WAC</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => {
                            const currentIng = ingredients.find(i => i.id === item.ingredientId);
                            if (!currentIng) return null;

                            // Calculate expected new WAC
                            const newStock = currentIng.stock + item.quantity;
                            const newWac = newStock > 0
                              ? Math.round(((currentIng.stock * currentIng.costPerUnit) + item.totalPrice) / newStock)
                              : item.unitPrice;

                            const diffWac = newWac - currentIng.costPerUnit;

                            return (
                              <tr key={item.ingredientId}>
                                <td><strong>{item.ingredientName}</strong></td>
                                <td>{formatNumber(item.quantity)} {item.unit}</td>
                                <td>{formatIdr(item.unitPrice)}</td>
                                <td style={{ fontWeight: 700 }}>{formatIdr(item.totalPrice)}</td>
                                <td>
                                  <div style={{ fontSize: '0.8rem' }}>
                                    {formatIdr(currentIng.costPerUnit)} ➔ <strong style={{ color: 'var(--primary)' }}>{formatIdr(newWac)}</strong>
                                    {diffWac !== 0 && (
                                      <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem', color: diffWac > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                                        ({diffWac > 0 ? `+${diffWac}` : diffWac})
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.ingredientId)}
                                    className="btn btn-danger"
                                    style={{ padding: '0.25rem 0.5rem' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <div style={{ marginRight: 'auto', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Pengeluaran Nota:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {formatIdr(grandTotalPurchaseCost)}
                  </div>
                </div>

                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-emerald" disabled={items.length === 0}>
                  <CheckCircle2 size={16} /> Simpan & Update HPP Otomatis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
