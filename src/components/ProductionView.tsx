import React, { useState } from 'react';
import { Factory, Play, AlertCircle, CheckCircle, Clock, ChefHat } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateRecipeHppDetails, formatIdr, formatNumber } from '../utils/calculator';

export const ProductionView: React.FC = () => {
  const { recipes, ingredients, productions, executeProductionBatch } = useApp();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  // Check ingredient requirements for selected recipe & batch count
  const ingMap = new Map(ingredients.map(i => [i.id, i]));
  const ingredientRequirements = selectedRecipe ? selectedRecipe.ingredients.map(ri => {
    const ing = ingMap.get(ri.ingredientId);
    const needed = ri.quantity * Math.max(1, batchCount);
    const available = ing ? ing.stock : 0;
    const isSufficient = available >= needed;
    return {
      ingredientName: ing?.name || ri.ingredientId,
      unit: ing?.unit || '',
      needed,
      available,
      isSufficient
    };
  }) : [];

  const allSufficient = ingredientRequirements.length > 0 && ingredientRequirements.every(i => i.isSufficient);

  const hppDetails = selectedRecipe ? calculateRecipeHppDetails(selectedRecipe, ingredients) : null;
  const totalProductionCost = hppDetails ? hppDetails.totalBatchHpp * Math.max(1, batchCount) : 0;
  const totalYieldProduced = selectedRecipe ? selectedRecipe.batchYield * Math.max(1, batchCount) : 0;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    const res = executeProductionBatch(selectedRecipeId, batchCount, notes);
    setFeedback(res);

    if (res.success) {
      setNotes('');
      // Auto clear feedback after 5 seconds
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2>Manajemen Produksi Batch</h2>
        <p style={{ fontSize: '0.875rem' }}>Proses produksi resep untuk mengonversi stok bahan baku menjadi stok produk jadi yang siap dijual di Kasir POS.</p>
      </div>

      {/* Production Form & Inspector Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Execution Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Factory color="var(--primary)" size={20} /> Form Eksekusi Produksi
          </h3>

          <form onSubmit={handleExecute} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Pilih Resep yang Ingin Diproduksi *</label>
              <select
                value={selectedRecipeId}
                onChange={e => setSelectedRecipeId(e.target.value)}
                className="form-control"
              >
                {recipes.map(r => (
                  <option key={r.id} value={r.id} style={{ fontWeight: 700 }}>
                    🍳 {r.name.toUpperCase()} (1 Batch = {r.batchYield} {r.yieldUnit} | Stok: {r.finishedStock} {r.yieldUnit})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Jumlah Batch *</label>
                <input
                  type="number"
                  min="1"
                  value={batchCount}
                  onChange={e => setBatchCount(Number(e.target.value))}
                  className="form-control"
                  style={{ fontWeight: 700, fontSize: '1.1rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hasil Siap Jual</label>
                <div className="form-control" style={{ background: '#f8fafc', fontWeight: 800, color: 'var(--primary)' }}>
                  {totalYieldProduced} {selectedRecipe?.yieldUnit || 'unit'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan Produksi (Opsional)</label>
              <input
                type="text"
                placeholder="e.g. Batch shift pagi / Pesanan khusus kantor"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-control"
              />
            </div>

            {feedback && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: feedback.success ? '#ecfdf5' : '#fff1f2',
                color: feedback.success ? '#047857' : '#be123c',
                border: `1px solid ${feedback.success ? '#a7f3d0' : '#fecdd3'}`,
                fontSize: '0.85rem',
                whiteSpace: 'pre-line'
              }}>
                {feedback.success ? '✅ ' : '⚠️ '} {feedback.message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!allSufficient || !selectedRecipeId}
              style={{
                padding: '0.875rem',
                fontSize: '1rem',
                background: allSufficient ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : '#cbd5e1'
              }}
            >
              <Play size={18} /> Mulai Produksi & Potong Stok Bahan
            </button>
          </form>
        </div>

        {/* Right: Ingredient Stock Requirement Inspector */}
        <div className="card" style={{ background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Inspeksi Kebutuhan Bahan Baku</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Kebutuhan bahan untuk memproduksi {batchCount} batch ({totalYieldProduced} {selectedRecipe?.yieldUnit}):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {ingredientRequirements.map((req, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'white',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${req.isSufficient ? 'var(--border-color)' : '#fecdd3'}`
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{req.ingredientName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Dibutuhkan: <strong>{formatNumber(req.needed)} {req.unit}</strong> | Tersedia: {formatNumber(req.available)} {req.unit}
                  </div>
                </div>

                <div>
                  {req.isSufficient ? (
                    <span className="badge badge-emerald"><CheckCircle size={12} /> Cukup</span>
                  ) : (
                    <span className="badge badge-rose"><AlertCircle size={12} /> Kurang</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span>Estimasi Biaya Produksi Batch:</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{formatIdr(totalProductionCost)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Estimasi HPP per {selectedRecipe?.yieldUnit}:</span>
              <strong style={{ color: 'var(--primary)' }}>{formatIdr(hppDetails?.hppPerUnit || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Production History Log Table */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Riwayat Log Produksi ({productions.length} Batch Runs)</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu Produksi</th>
                <th>Resep Produk</th>
                <th>Jumlah Batch</th>
                <th>Hasil Ditambahkan</th>
                <th>Total Biaya Produksi</th>
                <th>HPP Snapshot / Unit</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {productions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada riwayat produksi recorded.
                  </td>
                </tr>
              ) : (
                productions.map(prod => (
                  <tr key={prod.id}>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {prod.date}
                    </td>
                    <td><strong style={{ color: 'var(--primary)' }}>{prod.recipeName}</strong></td>
                    <td>{prod.batchCount} batch</td>
                    <td>
                      <span className="badge badge-emerald">+{prod.totalProduced} {prod.yieldUnit}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatIdr(prod.totalProductionCost)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{formatIdr(prod.hppPerUnit)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prod.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
