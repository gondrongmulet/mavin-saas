import React, { useState } from 'react';
import { Plus, ChefHat, Edit2, Trash2, Calculator, Layers, AlertCircle, Percent, ArrowUpRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Recipe, RecipeIngredient, OverheadCost } from '../types';
import {
  calculateRecipeHppDetails,
  calculateRecommendedPrice,
  calculateMarginFromPrice,
  formatIdr,
  formatNumber
} from '../utils/calculator';

export const RecipesView: React.FC = () => {
  const { recipes, ingredients, addRecipe, updateRecipe, deleteRecipe } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Minuman');
  const [batchYield, setBatchYield] = useState<number>(10);
  const [yieldUnit, setYieldUnit] = useState('cup');
  const [targetMargin, setTargetMargin] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(20000);
  const [description, setDescription] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [overheads, setOverheads] = useState<OverheadCost[]>([]);

  // Calculation mode: 'margin' or 'price'
  const [calcMode, setCalcMode] = useState<'margin' | 'price'>('price');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Minuman');
    setBatchYield(10);
    setYieldUnit('cup');
    setTargetMargin(50);
    setSellingPrice(20000);
    setDescription('');

    // Prepopulate with 1 ingredient if available
    if (ingredients.length > 0) {
      setRecipeIngredients([{ ingredientId: ingredients[0].id, quantity: 100 }]);
    } else {
      setRecipeIngredients([]);
    }
    setOverheads([{ id: 'ov-1', name: 'Kemasan & Stiker', cost: 5000 }]);
    setIsModalOpen(true);
  };

  const openEditModal = (rec: Recipe) => {
    setEditingId(rec.id);
    setName(rec.name);
    setCategory(rec.category);
    setBatchYield(rec.batchYield);
    setYieldUnit(rec.yieldUnit);
    setTargetMargin(rec.targetMargin);
    setSellingPrice(rec.sellingPrice);
    setDescription(rec.description || '');
    setRecipeIngredients(rec.ingredients);
    setOverheads(rec.overheads);
    setIsModalOpen(true);
  };

  // Helper calculations for form state
  const tempRecipe: Recipe = {
    id: 'temp',
    name,
    category,
    batchYield: Math.max(1, batchYield),
    yieldUnit,
    ingredients: recipeIngredients,
    overheads,
    targetMargin,
    sellingPrice,
    finishedStock: 0
  };

  const tempHppDetails = calculateRecipeHppDetails(tempRecipe, ingredients);
  const tempMarginCalc = calculateMarginFromPrice(tempHppDetails.hppPerUnit, sellingPrice);

  const handleTargetMarginChange = (val: number) => {
    setTargetMargin(val);
    if (calcMode === 'margin') {
      const recPrice = calculateRecommendedPrice(tempHppDetails.hppPerUnit, val);
      setSellingPrice(recPrice);
    }
  };

  const handleSellingPriceChange = (val: number) => {
    setSellingPrice(val);
    if (calcMode === 'price') {
      const { marginPercent } = calculateMarginFromPrice(tempHppDetails.hppPerUnit, val);
      setTargetMargin(marginPercent);
    }
  };

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    setRecipeIngredients(prev => [...prev, { ingredientId: ingredients[0].id, quantity: 10 }]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOverheadRow = () => {
    setOverheads(prev => [...prev, { id: `ov-${Date.now()}`, name: 'Biaya Operasional Batch', cost: 1000 }]);
  };

  const handleRemoveOverheadRow = (id: string) => {
    setOverheads(prev => prev.filter(ov => ov.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      category,
      batchYield: Math.max(1, batchYield),
      yieldUnit,
      ingredients: recipeIngredients,
      overheads,
      targetMargin,
      sellingPrice,
      description
    };

    if (editingId) {
      updateRecipe(editingId, payload);
    } else {
      addRecipe(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Katalog Resep & Engine Kalkulator HPP</h2>
          <p style={{ fontSize: '0.875rem' }}>Penyusunan resep batch, alokasi overhead, dan simulasi margin keuntungan secara real-time.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Buat Resep Baru
        </button>
      </div>

      {/* Recipe Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {recipes.map(recipe => {
          const hppDetails = calculateRecipeHppDetails(recipe, ingredients);
          const marginInfo = calculateMarginFromPrice(hppDetails.hppPerUnit, recipe.sellingPrice);
          const isHighMargin = marginInfo.marginPercent >= 50;

          return (
            <div key={recipe.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                {/* Card Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-indigo" style={{ marginBottom: '0.35rem', display: 'inline-flex' }}>
                      {recipe.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem' }}>{recipe.name}</h3>
                  </div>
                  <span className={`badge ${isHighMargin ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                    <Percent size={12} /> {marginInfo.marginPercent}% Margin
                  </span>
                </div>

                {recipe.description && (
                  <p style={{ fontSize: '0.8rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    {recipe.description}
                  </p>
                )}

                {/* Batch Yield Tag */}
                <div style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  ⚙️ Hasil Produksi Batch: <strong>{recipe.batchYield} {recipe.yieldUnit}</strong> / kali masak
                </div>

                {/* HPP & Selling Price Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#fafafa', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>HPP per {recipe.yieldUnit}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                      {formatIdr(hppDetails.hppPerUnit)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                      (Modal Batch: {formatIdr(hppDetails.totalBatchHpp)})
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Harga Jual</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatIdr(recipe.sellingPrice)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'block' }}>
                      + Profit {formatIdr(marginInfo.profitPerUnit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Stok Siap Jual: <strong style={{ color: 'var(--text-main)' }}>{recipe.finishedStock} {recipe.yieldUnit}</strong>
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => openEditModal(recipe)} className="btn btn-outline" style={{ padding: '0.4rem 0.65rem' }}>
                    <Edit2 size={14} /> Edit Resep
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus resep "${recipe.name}"?`)) {
                        deleteRecipe(recipe.id);
                      }
                    }}
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.65rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Recipe Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChefHat size={20} color="var(--primary)" /> {editingId ? 'Edit Resep & Formula HPP' : 'Buat Resep Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* General Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Resep *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kopi Susu Aren, Roti Bakar"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Kategori</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="form-control"
                      placeholder="e.g. Minuman, Bakery"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Hasil Batch</label>
                    <input
                      type="number"
                      min="1"
                      value={batchYield}
                      onChange={e => setBatchYield(Number(e.target.value))}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Satuan</label>
                    <input
                      type="text"
                      value={yieldUnit}
                      onChange={e => setYieldUnit(e.target.value)}
                      className="form-control"
                      placeholder="cup, porsi, pcs"
                    />
                  </div>
                </div>

                {/* 1. Raw Materials Composition Section */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem' }}>1. Komposisi Bahan Baku (per 1 Batch Masak)</h4>
                    <button type="button" onClick={handleAddIngredientRow} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      <Plus size={14} /> Tambah Bahan
                    </button>
                  </div>

                  {recipeIngredients.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Belum ada bahan baku. Klik "Tambah Bahan" di atas.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {recipeIngredients.map((ri, idx) => {
                        const ing = ingredients.find(i => i.id === ri.ingredientId);
                        const lineCost = ing ? ri.quantity * ing.costPerUnit : 0;

                        return (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              value={ri.ingredientId}
                              onChange={e => {
                                const updated = [...recipeIngredients];
                                updated[idx].ingredientId = e.target.value;
                                setRecipeIngredients(updated);
                              }}
                              className="form-control"
                            >
                              {ingredients.map(i => (
                                <option key={i.id} value={i.id}>
                                  {i.name} (HPP: {formatIdr(i.costPerUnit)}/{i.unit})
                                </option>
                              ))}
                            </select>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={ri.quantity}
                                onChange={e => {
                                  const updated = [...recipeIngredients];
                                  updated[idx].quantity = Number(e.target.value);
                                  setRecipeIngredients(updated);
                                }}
                                className="form-control"
                              />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ing?.unit}</span>
                            </div>

                            <div style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '90px', textAlign: 'right' }}>
                              {formatIdr(lineCost)}
                            </div>

                            <button type="button" onClick={() => handleRemoveIngredientRow(idx)} className="btn btn-danger" style={{ padding: '0.3rem 0.5rem' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    Subtotal Biaya Bahan Baku: <span style={{ color: 'var(--primary)' }}>{formatIdr(tempHppDetails.rawMaterialCost)}</span> / batch
                  </div>
                </div>

                {/* 2. Overhead & Operational Cost Section */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem' }}>2. Alokasi Biaya Overhead & Operasional (per Batch)</h4>
                    <button type="button" onClick={handleAddOverheadRow} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      <Plus size={14} /> Tambah Overhead
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {overheads.map(ov => (
                      <div key={ov.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Nama Overhead (e.g. Kemasan, Listrik & Gas)"
                          value={ov.name}
                          onChange={e => {
                            setOverheads(overheads.map(o => o.id === ov.id ? { ...o, name: e.target.value } : o));
                          }}
                          className="form-control"
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Biaya Rp"
                          value={ov.cost}
                          onChange={e => {
                            setOverheads(overheads.map(o => o.id === ov.id ? { ...o, cost: Number(e.target.value) } : o));
                          }}
                          className="form-control"
                        />
                        <button type="button" onClick={() => handleRemoveOverheadRow(ov.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.5rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    Subtotal Biaya Overhead: <span style={{ color: 'var(--accent-amber)' }}>{formatIdr(tempHppDetails.overheadCost)}</span> / batch
                  </div>
                </div>

                {/* 3. Dynamic Calculator Engine Section */}
                <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calculator size={18} /> Kalkulator Harga Jual & Profit Margin Enterprise
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                    {/* HPP Result Box */}
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HASIL HPP RESEP</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                        {formatIdr(tempHppDetails.hppPerUnit)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ {yieldUnit}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Total Modal 1 Batch ({batchYield} {yieldUnit}): {formatIdr(tempHppDetails.totalBatchHpp)}
                      </div>
                    </div>

                    {/* Pricing Input Calculator */}
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <button
                          type="button"
                          className={`btn ${calcMode === 'price' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => setCalcMode('price')}
                        >
                          Patok Harga Jual
                        </button>
                        <button
                          type="button"
                          className={`btn ${calcMode === 'margin' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                          onClick={() => setCalcMode('margin')}
                        >
                          Patok Target Margin %
                        </button>
                      </div>

                      {calcMode === 'price' ? (
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Harga Jual yang Ditetapkan (Rp)</label>
                          <input
                            type="number"
                            step="500"
                            value={sellingPrice}
                            onChange={e => handleSellingPriceChange(Number(e.target.value))}
                            className="form-control"
                            style={{ fontWeight: 700, fontSize: '1.1rem' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Margin Keuntungan (%)</label>
                          <input
                            type="number"
                            min="5"
                            max="95"
                            value={targetMargin}
                            onChange={e => handleTargetMarginChange(Number(e.target.value))}
                            className="form-control"
                            style={{ fontWeight: 700, fontSize: '1.1rem' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Margin Box */}
                  <div style={{ background: '#ecfdf5', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#065f46' }}>Estimasi Laba Bersih per {yieldUnit}:</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                        + {formatIdr(tempMarginCalc.profitPerUnit)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#065f46' }}>Margin Keuntungan:</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>
                        {tempMarginCalc.marginPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Simpan Perubahan Resep' : 'Simpan Resep Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
