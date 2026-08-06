import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Boxes,
  PieChart as PieChartIcon,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Factory,
  Store,
  ChefHat,
  Award,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateRecipeHppDetails, formatIdr, formatNumber } from '../utils/calculator';
import { sendStockAlertWA } from '../utils/wahaService';
import { forcePushStoreDataToCloud, syncCloudStoreDataFetch } from '../utils/supabaseSync';
import type { NavTab } from './Sidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { ingredients, recipes, sales, storeSettings, wahaConfig, darkMode } = useApp();
  
  const [dismissed, setDismissed] = useState(false);
  const [waSent, setWaSent] = useState(false);

  // Metrics Calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalHppSold = sales.reduce((sum, s) => sum + s.totalHpp, 0);
  const totalGrossProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
  const avgMargin = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalRawMaterialValue = ingredients.reduce((sum, ing) => sum + (ing.stock * ing.costPerUnit), 0);
  const lowStockIngredients = ingredients.filter(i => i.stock <= i.minStock);
  const lowStockItems = ingredients.filter(i => i.stock <= i.minStock && i.minStock > 0);

  useEffect(() => {
    if (lowStockItems.length > 0 && wahaConfig?.enabled && !waSent && storeSettings?.phone) {
      sendStockAlertWA(lowStockItems, storeSettings.phone, storeSettings.storeName || 'Toko MAVIN');
      setWaSent(true);
    }
  }, [lowStockItems, wahaConfig, storeSettings, waSent]);

  // Data preparation for charts
  const recipeHppData = recipes.map(recipe => {
    const details = calculateRecipeHppDetails(recipe, ingredients);
    const profit = recipe.sellingPrice - details.hppPerUnit;
    const margin = recipe.sellingPrice > 0 ? ((profit / recipe.sellingPrice) * 100).toFixed(1) : 0;
    return {
      name: recipe.name.length > 15 ? recipe.name.substring(0, 15) + '...' : recipe.name,
      'HPP per Unit': details.hppPerUnit,
      'Laba per Unit': profit,
      'Harga Jual': recipe.sellingPrice,
      margin: Number(margin)
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const pushed = await forcePushStoreDataToCloud();
    const fetched = await syncCloudStoreDataFetch();
    if (pushed || fetched) {
      alert('⚡ Berhasil menyinkronkan data toko dengan Cloud Database! Semua Device & Web dengan akun ini sudah tersinkronisasi.');
      window.location.reload();
    } else {
      alert('⚠️ Gagal terhubung ke Cloud Database. Pastikan perangkat terhubung ke internet.');
    }
    setIsSyncing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {lowStockItems.length > 0 && !dismissed && (
        <div style={{
          background: darkMode ? 'linear-gradient(135deg, #451a03, #4c0519)' : 'linear-gradient(135deg, #fef2f2, #fff7ed)',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                ⚠️ {lowStockItems.length} Bahan Baku Stok Menipis!
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {lowStockItems.slice(0, 5).map(item => (
                  <span key={item.id} style={{
                    background: '#fee2e2', color: '#b91c1c',
                    padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem', fontWeight: 600
                  }}>
                    {item.name}: {item.stock} {item.unit}
                  </span>
                ))}
                {lowStockItems.length > 5 && (
                  <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>
                    +{lowStockItems.length - 5} lainnya
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setDismissed(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#b91c1c', fontSize: '1.2rem', padding: '0'
            }}>×</button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={14} /> MAVIN Enterprise Engine
          </span>
          <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.35rem' }}>
            MAVIN — Manajemen UMKM Juara
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.95rem', maxWidth: '600px', margin: 0 }}>
            Aplikasi serba bisa untuk menghitung HPP dinamis, mengelola stok bahan baku kulakan, produksi batch, hingga penjualan POS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="btn btn-outline"
            style={{
              padding: '0.75rem 1.1rem',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              background: 'rgba(255, 255, 255, 0.1)',
              fontWeight: 700
            }}
            title="Sinkronkan data lokal device ini ke Cloud Server"
          >
            <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Proses Sinkron...' : '⚡ Sinkronkan Cloud'}
          </button>
          <button onClick={() => setActiveTab('pos')} className="btn btn-emerald" style={{ padding: '0.75rem 1.25rem' }}>
            <Store size={18} /> Buka Kasir POS
          </button>
          <button onClick={() => setActiveTab('purchases')} className="btn btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
            <PlusCircle size={18} /> Catat Kulakan
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Total Pendapatan */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Omset Penjualan</span>
            <span className="stat-value">{formatIdr(totalRevenue)}</span>
            <span className="stat-subtitle" style={{ color: 'var(--text-muted)' }}>
              Dari {sales.length} transaksi POS
            </span>
          </div>
        </div>

        {/* Card 2: Total Laba Kotor */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Laba Kotor (Gross Profit)</span>
            <span className="stat-value" style={{ color: '#16a34a' }}>{formatIdr(totalGrossProfit)}</span>
            <span className="stat-subtitle" style={{ color: '#16a34a' }}>
              Rata-rata Margin: <strong>{avgMargin}%</strong>
            </span>
          </div>
        </div>

        {/* Card 3: Total HPP Terjual */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <PieChartIcon size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">HPP Terjual (COGS)</span>
            <span className="stat-value">{formatIdr(totalHppSold)}</span>
            <span className="stat-subtitle" style={{ color: 'var(--text-muted)' }}>
              Total modal bahan & overhead
            </span>
          </div>
        </div>

        {/* Card 4: Nilai Aset Bahan Baku */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Boxes size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Nilai Aset Stok Bahan</span>
            <span className="stat-value">{formatIdr(totalRawMaterialValue)}</span>
            <span className="stat-subtitle" style={{ color: 'var(--text-muted)' }}>
              {ingredients.length} jenis bahan baku
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Low Stock Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* HPP & Profit per Recipe Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>Analisis HPP vs Harga Jual Produk</h3>
              <p style={{ fontSize: '0.825rem' }}>Komposisi Modal (HPP) vs Margin Keuntungan</p>
            </div>
            <button onClick={() => setActiveTab('recipes')} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              Resep <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recipeHppData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => formatIdr(Number(val))}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="HPP per Unit" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Laba per Unit" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Low Stock Widget */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--accent-rose)" />
                <h3 style={{ fontSize: '1rem' }}>Peringatan Stok Bahan Menipis</h3>
              </div>
              <span className="badge badge-rose">{lowStockIngredients.length} Bahan</span>
            </div>

            {lowStockIngredients.length === 0 ? (
              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', color: '#047857', fontSize: '0.85rem' }}>
                ✅ Semua stok bahan baku berada di tingkat aman di atas threshold minimum.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                {lowStockIngredients.map(ing => (
                  <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#fff1f2', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Sisa Stok: <strong style={{ color: 'var(--accent-rose)' }}>{formatNumber(ing.stock)} {ing.unit}</strong> (Min: {ing.minStock} {ing.unit})
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('purchases')}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Kulakan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem' }}>Aksi Cepat MAVIN</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('recipes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ChefHat size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Kalkulasi Resep</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hitung HPP & Margin</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('production')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Factory size={20} color="var(--accent-amber)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Produksi Batch</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Masak & potong stok</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
