import React, { useState } from 'react';
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Building,
  Key,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIdr, formatNumber } from '../utils/calculator';

export const SaasAdminView: React.FC = () => {
  const { tenantAccounts, updateTenantStatus } = useApp();

  const totalTenants = tenantAccounts.length;
  const activeTenants = tenantAccounts.filter(t => t.status === 'Aktif').length;
  const totalMrr = tenantAccounts.reduce((sum, t) => sum + (t.status === 'Aktif' ? t.monthlyFee : 0), 0);
  const totalOutletsCount = tenantAccounts.reduce((sum, t) => sum + t.outletCount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* SaaS Master Admin Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        color: 'white',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge badge-amber" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Crown size={14} /> SaaS Master Admin Portal (Pemilik Platform MAVIN)
          </span>
          <h1 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.35rem' }}>
            Pusat Pengelolaan Pelanggan SaaS MAVIN
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px' }}>
            Di modul ini, Anda (sebagai pemilik MAVIN SaaS) mengelola seluruh tenant UMKM yang mendaftar, memantau status langganan, dan pendapatan bulanan (MRR).
          </p>
        </div>

        <div style={{ background: '#334155', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #475569' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MONTHLY RECURRING REVENUE (MRR)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
            {formatIdr(totalMrr)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#cbd5e1' }}>/ bulan</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Building size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total UMKM Terdaftar</span>
            <span className="stat-value">{totalTenants} Toko</span>
            <span className="stat-subtitle" style={{ color: 'var(--accent-emerald)' }}>
              {activeTenants} Berlangganan Aktif
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Estimasi Omset Tahunan (ARR)</span>
            <span className="stat-value" style={{ color: '#16a34a' }}>{formatIdr(totalMrr * 12)}</span>
            <span className="stat-subtitle" style={{ color: '#16a34a' }}>
              Dari berlangganan bulanan
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Cabang Outlet UMKM</span>
            <span className="stat-value">{totalOutletsCount} Cabang</span>
            <span className="stat-subtitle" style={{ color: 'var(--text-muted)' }}>
              Terhubung di cloud MAVIN
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Paket Favorit UMKM</span>
            <span className="stat-value">Paket PRO</span>
            <span className="stat-subtitle" style={{ color: 'var(--text-muted)' }}>
              Rp 69.000 / bulan
            </span>
          </div>
        </div>
      </div>

      {/* Tenants Table Management */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Daftar Akun UMKM Berlangganan (Tenants)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Setiap UMKM memiliki database sandbox terisolasi. Anda dapat mengaktifkan atau memperpanjang paket mereka.</p>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama Toko / UMKM</th>
                <th>Pemilik (Owner)</th>
                <th>Kontak & WA</th>
                <th>Paket SaaS</th>
                <th>Status Langganan</th>
                <th>Masa Berlaku s/d</th>
                <th>Biaya / Bulan</th>
                <th style={{ textAlign: 'right' }}>Aksi Admin SaaS</th>
              </tr>
            </thead>
            <tbody>
              {tenantAccounts.map(tenant => (
                <tr key={tenant.id}>
                  <td>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>{tenant.storeName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {tenant.id} &bull; Reg: {tenant.registerDate}</div>
                  </td>
                  <td>{tenant.ownerName}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    <div>✉️ {tenant.email}</div>
                    <div>📞 {tenant.phone}</div>
                  </td>
                  <td>
                    {tenant.plan === 'Enterprise' && <span className="badge badge-amber">🏆 Enterprise</span>}
                    {tenant.plan === 'Pro' && <span className="badge badge-indigo">⚡ PRO</span>}
                    {tenant.plan === 'Starter' && <span className="badge badge-emerald">🎁 Starter</span>}
                  </td>
                  <td>
                    {tenant.status === 'Aktif' && <span className="badge badge-emerald">🟢 Aktif</span>}
                    {tenant.status === 'Trial' && <span className="badge badge-amber">🟡 Masa Trial</span>}
                    {tenant.status === 'Expired' && <span className="badge badge-rose">🔴 Kadaluarsa</span>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{tenant.expiryDate}</td>
                  <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatIdr(tenant.monthlyFee)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      {tenant.status !== 'Aktif' ? (
                        <button
                          onClick={() => updateTenantStatus(tenant.id, 'Aktif', 'Pro')}
                          className="btn btn-emerald"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={12} /> Aktifkan Pro
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTenantStatus(tenant.id, 'Expired')}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Nonaktifkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud Multi-Tenant Architecture Explanation Box */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <ShieldCheck size={20} /> Panduan Teknis Pengelolaan Multi-Tenant Cloud untuk Anda
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>1. Isolasi Data UMKM (Multi-Tenancy)</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Setiap kali UMKM baru mendaftar di domain MAVIN Anda, server otomatis membuat kolom <code>tenant_id</code> unik. Data resep dan keuangan Pak Budi **100% aman dan tidak pernah bisa dilihat oleh toko lain**.
            </p>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>2. Pembayaran Otomatis via QRIS / VA</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Saat masa trial UMKM habis, sistem akan menampilkan pop-up tagihan QRIS. Setelah kustomer membayar via GoPay/ShopeePay/BCA, Payment Gateway (Xendit/Midtrans) otomatis memperpanjang masa aktif akun mereka.
            </p>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>3. Kemudahan Pengelolaan dari 1 Portal</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              Anda tidak perlu menyetting ulang server untuk setiap toko baru. Cukup pantau pendaftaran kustomer baru, status pembayaran, dan total MRR usaha SaaS Anda dari Master Admin Portal ini!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
