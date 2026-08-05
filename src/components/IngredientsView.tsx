import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle, Boxes } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ingredient, IngredientCategory } from '../types';
import { formatIdr, formatNumber } from '../utils/calculator';

export const IngredientsView: React.FC = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    unit: string;
    stock: number;
    minStock: number;
    costPerUnit: number;
  }>({
    name: '',
    category: 'Bahan Utama',
    unit: 'g',
    stock: 0,
    minStock: 100,
    costPerUnit: 0
  });

  const categories = ['All', 'Bahan Utama', 'Bumbu & Rempah', 'Cairan & Susu', 'Kemasan & Stiker', 'Topping & Hiasan', 'Lainnya'];

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ing.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Bahan Utama',
      unit: 'g',
      stock: 1000,
      minStock: 200,
      costPerUnit: 50
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingId(ing.id);
    setFormData({
      name: ing.name,
      category: ing.category,
      unit: ing.unit,
      stock: ing.stock,
      minStock: ing.minStock,
      costPerUnit: ing.costPerUnit
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateIngredient(editingId, formData);
    } else {
      addIngredient({
        ...formData,
        lastPurchasePrice: formData.costPerUnit,
        lastPurchaseDate: new Date().toISOString().slice(0, 10)
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Inventaris Bahan Baku & Modal Unit</h2>
          <p style={{ fontSize: '0.875rem' }}>Master data bahan baku, unit cost (WAC HPP), dan ambang batas stok minimum.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Tambah Bahan Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari nama bahan baku (e.g. Kopi, Susu, Terigu)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kategori:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="form-control"
            style={{ width: 'auto', padding: '0.5rem 0.8rem' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Bahan Baku</th>
              <th>Kategori</th>
              <th>Stok Tersedia</th>
              <th>Batas Min.</th>
              <th>Harga Unit (WAC HPP)</th>
              <th>Total Nilai Stok</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada bahan baku yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredIngredients.map(ing => {
                const isLow = ing.stock <= ing.minStock;
                const totalValue = ing.stock * ing.costPerUnit;

                return (
                  <tr key={ing.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {ing.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-indigo">{ing.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: isLow ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                        {isLow && <AlertCircle size={16} color="var(--accent-rose)" />}
                        {formatNumber(ing.stock)} <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ing.unit}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {formatNumber(ing.minStock)} {ing.unit}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{formatIdr(ing.costPerUnit)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>per {ing.unit}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatIdr(totalValue)}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(ing)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Edit Bahan">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus bahan "${ing.name}"? Resep yang menggunakan bahan ini mungkin perlu penyesuaian.`)) {
                              deleteIngredient(ing.id);
                            }
                          }}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem' }}
                          title="Hapus Bahan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Bahan Baku *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biji Kopi Arabika, Susu Fresh Milk, Dus Roti"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as IngredientCategory })}
                      className="form-control"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Satuan Ukuran *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. g, ml, pcs, kg, liter"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Stok Awal</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min. Alert Stok</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harga Modal per {formData.unit || 'Unit'} (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.costPerUnit}
                      onChange={e => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div style={{ padding: '0.85rem', background: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534' }}>
                  💡 <strong>Info Enterprise:</strong> Saat Anda melakukan transaksi Kulakan nanti, Harga Modal Unit (HPP) akan dihitung otomatis menggunakan formula <i>Weighted Average Cost (WAC)</i>.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
