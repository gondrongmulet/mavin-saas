import React, { useState } from 'react';
import { Download, Upload, FileText, TrendingUp, Calendar, RefreshCw, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIdr, formatNumber } from '../utils/calculator';

export const ReportsView: React.FC = () => {
  const { sales, purchases, ingredients, recipes, exportDataJson, importDataJson, resetToSampleData } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const totalSalesRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalSalesHpp = sales.reduce((s, x) => s + x.totalHpp, 0);
  const totalGrossProfit = sales.reduce((s, x) => s + x.grossProfit, 0);
  const totalPurchaseCost = purchases.reduce((s, x) => s + x.totalCost, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importDataJson(json);
      if (success) {
        setImportStatus('✅ Berhasil mengimpor data dari file JSON!');
      } else {
        setImportStatus('❌ Gagal mengimpor file. Pastikan format file JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  const exportSalesCsv = () => {
    let csv = 'Invoice,Tanggal,Pelanggan,Metode Bayar,Total Omset,Total HPP,Laba Kotor\n';
    sales.forEach(s => {
      csv += `"${s.invoiceNo}","${s.date}","${s.customerName || '-'}","${s.paymentMethod}",${s.grandTotal},${s.totalHpp},${s.grossProfit}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Penjualan_UMKM_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Laporan Keuangan & Manajemen Data</h2>
          <p style={{ fontSize: '0.875rem' }}>Ekspor laporan laba rugi, riwayat transaksi kasir, dan backup data bisnis UMKM Anda.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportSalesCsv} className="btn btn-outline">
            <FileText size={16} /> Ekspor CSV Penjualan
          </button>
          <button onClick={exportDataJson} className="btn btn-primary">
            <Download size={16} /> Backup Semua Data (JSON)
          </button>
        </div>
      </div>

      {/* Financial Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Omset Penjualan</span>
            <span className="stat-value">{formatIdr(totalSalesRevenue)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">HPP Terjual</span>
            <span className="stat-value">{formatIdr(totalSalesHpp)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Laba Kotor</span>
            <span className="stat-value" style={{ color: '#16a34a' }}>{formatIdr(totalGrossProfit)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Belanja Kulakan</span>
            <span className="stat-value">{formatIdr(totalPurchaseCost)}</span>
          </div>
        </div>
      </div>

      {/* Sales Transactions History */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Riwayat Transaksi Penjualan ({sales.length} Transaksi)</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Tanggal & Waktu</th>
                <th>Pelanggan</th>
                <th>Metode Bayar</th>
                <th>Item Terjual</th>
                <th>Total Omset</th>
                <th>Total HPP</th>
                <th>Laba Kotor</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada transaksi penjualan recorded.
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{sale.invoiceNo}</strong></td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{sale.date}</td>
                    <td>{sale.customerName || '-'}</td>
                    <td><span className="badge badge-indigo">{sale.paymentMethod}</span></td>
                    <td>{sale.items.map(i => `${i.recipeName} (${i.quantity})`).join(', ')}</td>
                    <td style={{ fontWeight: 700 }}>{formatIdr(sale.grandTotal)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatIdr(sale.totalHpp)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>+{formatIdr(sale.grossProfit)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup & Import Tools Section */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cadangkan & Pulihkan Data UMKM</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Seluruh data bahan baku, resep, kulakan, dan penjualan disimpan di peramban lokal (LocalStorage). Anda dapat mengimpor/mengekspor data ini secara aman.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Impor Data JSON
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={() => {
              if (confirm('RESET DATA SAMPEL:\nSemua data kustom akan terhapus dan diganti dengan data sampel UMKM awal. Lanjutkan?')) {
                resetToSampleData();
              }
            }}
            className="btn btn-outline"
            style={{ color: 'var(--accent-rose)' }}
          >
            <RefreshCw size={16} /> Reset ke Data Sampel
          </button>
        </div>

        {importStatus && (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};
