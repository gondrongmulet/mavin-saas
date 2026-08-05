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
  Layers,
  Plus,
  X,
  Database,
  QrCode,
  Landmark,
  Phone,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIdr } from '../utils/calculator';
import { TenantAccount } from '../types';

export const SaasAdminView: React.FC = () => {
  const { tenantAccounts, updateTenantStatus, addTenantAccount } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'tenants' | 'payment_setup'>('tenants');

  // Tenant Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');

  // Payment Setup State (Loaded & Saved to LocalStorage)
  const [qrisNmid, setQrisNmid] = useState(() => localStorage.getItem('mavin_saas_qris_nmid') || 'ID1029384756102');
  const [qrisImageUrl, setQrisImageUrl] = useState(() => localStorage.getItem('mavin_saas_qris_image') || '');
  
  const [bank1Name, setBank1Name] = useState(() => localStorage.getItem('mavin_saas_bank1_name') || 'Bank Mandiri');
  const [bank1Account, setBank1Account] = useState(() => localStorage.getItem('mavin_saas_bank1_account') || '137-00-1234567-8');
  const [bank1Owner, setBank1Owner] = useState(() => localStorage.getItem('mavin_saas_bank1_owner') || 'PT MAVIN TEKNOLOGI JUARA');

  const [bank2Name, setBank2Name] = useState(() => localStorage.getItem('mavin_saas_bank2_name') || 'Bank BCA');
  const [bank2Account, setBank2Account] = useState(() => localStorage.getItem('mavin_saas_bank2_account') || '841-098-7654');
  const [bank2Owner, setBank2Owner] = useState(() => localStorage.getItem('mavin_saas_bank2_owner') || 'PT MAVIN TEKNOLOGI JUARA');

  const [adminWaPhone, setAdminWaPhone] = useState(() => localStorage.getItem('mavin_saas_admin_wa') || '6281234567890');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const totalTenants = tenantAccounts.length;
  const activeTenants = tenantAccounts.filter(t => t.status === 'Aktif').length;
  const totalMrr = tenantAccounts.reduce((sum, t) => sum + (t.status === 'Aktif' ? t.monthlyFee : 0), 0);
  const totalOutletsCount = tenantAccounts.reduce((sum, t) => sum + t.outletCount, 0);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = newPlan === 'Enterprise' ? 149000 : newPlan === 'Pro' ? 69000 : 0;
    const newTenant: Omit<TenantAccount, 'id'> = {
      storeName: newStoreName,
      ownerName: newOwnerName,
      email: newEmail,
      phone: newPhone,
      plan: newPlan,
      status: 'Aktif',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyFee: fee,
      outletCount: newPlan === 'Enterprise' ? 5 : newPlan === 'Pro' ? 2 : 1,
      registerDate: new Date().toISOString().split('T')[0]
    };

    addTenantAccount(newTenant);
    setIsAddModalOpen(false);

    setNewStoreName('');
    setNewOwnerName('');
    setNewEmail('');
    setNewPhone('');
    setNewPlan('Pro');
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mavin_saas_qris_nmid', qrisNmid);
    localStorage.setItem('mavin_saas_qris_image', qrisImageUrl);
    
    localStorage.setItem('mavin_saas_bank1_name', bank1Name);
    localStorage.setItem('mavin_saas_bank1_account', bank1Account);
    localStorage.setItem('mavin_saas_bank1_owner', bank1Owner);

    localStorage.setItem('mavin_saas_bank2_name', bank2Name);
    localStorage.setItem('mavin_saas_bank2_account', bank2Account);
    localStorage.setItem('mavin_saas_bank2_owner', bank2Owner);

    localStorage.setItem('mavin_saas_admin_wa', adminWaPhone);

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleQrisImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ Ukuran gambar QRIS maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setQrisImageUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

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
            Pusat Pengelolaan Pelanggan & Pembayaran SaaS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '650px' }}>
            Di modul ini, Anda mengelola seluruh tenant toko yang mendaftar, mengatur nomor QRIS/Rekening Bank pembayaran langganan, dan memantau omset bulanan (MRR).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-emerald"
            style={{ padding: '0.75rem 1.25rem', fontWeight: 800, fontSize: '0.9rem' }}
          >
            <Plus size={18} /> Tambah Tenant Toko Baru
          </button>

          <div style={{ background: '#334155', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #475569' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>MONTHLY RECURRING REVENUE (MRR)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
              {formatIdr(totalMrr)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#cbd5e1' }}>/ bulan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Sub Tabs */}
      <div className="sub-tabs-container">
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('tenants')}
          className={`sub-tab-pill ${activeAdminSubTab === 'tenants' ? 'active' : ''}`}
        >
          <Building size={16} /> Daftar Tenant Toko ({totalTenants})
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('payment_setup')}
          className={`sub-tab-pill ${activeAdminSubTab === 'payment_setup' ? 'active' : ''}`}
        >
          <QrCode size={16} /> Setup QRIS & Rekening Bank SaaS
        </button>
      </div>

      {/* KPI Cards Grid */}
      {activeAdminSubTab === 'tenants' && (
        <>
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
          </div>

          {/* Real Subscribed Tenants Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3>Daftar Tenant Toko & Status Langganan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelola aktivasi, perpanjangan, atau penangguhan akun toko pelanggan Anda.</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary"
                style={{ fontWeight: 700 }}
              >
                <Plus size={16} /> Tambah Akun Toko Baru
              </button>
            </div>

            {tenantAccounts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed var(--border-color)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Database size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Belum Ada Tenant Toko Terdaftar
                </h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  Database Super Admin saat ini bersih & kosong. Toko baru yang mendaftar dari website atau yang Anda tambahkan manual akan langsung muncul di sini.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.4rem', fontWeight: 800 }}
                >
                  <Plus size={18} /> Daftarkan Toko Pertama Sekarang
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>NAMA TOKO / UMKM</th>
                      <th>PEMILIK TOKO</th>
                      <th>KONTAK & EMAIL</th>
                      <th>PAKET</th>
                      <th>BIAYA / BLN</th>
                      <th>OUTLET</th>
                      <th>STATUS</th>
                      <th>EXPIRY DATE</th>
                      <th>AKSI AKSES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantAccounts.map((tenant) => (
                      <tr key={tenant.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{tenant.storeName}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tgl Daftar: {tenant.registerDate}</span>
                        </td>
                        <td>{tenant.ownerName}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{tenant.email}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tenant.phone}</span>
                        </td>
                        <td>
                          <span className={`badge ${tenant.plan === 'Enterprise' ? 'badge-amber' : tenant.plan === 'Pro' ? 'badge-indigo' : 'badge-emerald'}`}>
                            {tenant.plan}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatIdr(tenant.monthlyFee)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{tenant.outletCount} Cabang</td>
                        <td>
                          <span className={`badge ${tenant.status === 'Aktif' ? 'badge-emerald' : 'badge-rose'}`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{tenant.expiryDate}</td>
                        <td>
                          {tenant.status === 'Aktif' ? (
                            <button
                              onClick={() => updateTenantStatus(tenant.id, 'Expired')}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-rose)', borderColor: '#fca5a5' }}
                            >
                              Suspend (Nonaktifkan)
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTenantStatus(tenant.id, 'Aktif')}
                              className="btn btn-emerald"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Aktifkan Kembali
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* SETUP PAYMENT & REKENING BANK SAAS TAB */}
      {activeAdminSubTab === 'payment_setup' && (
        <form onSubmit={handleSavePaymentSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isSavedNotice && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={20} /> Pengaturan Rekening Bank & QRIS SaaS Berhasil Disimpan!
            </div>
          )}

          {/* QRIS Merchant Configuration */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <QrCode color="var(--primary)" size={20} /> Konfigurasi QRIS Merchant SaaS
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Atur nomor NMID QRIS dan unggah gambar Barcode QRIS resmi milik platform SaaS Anda untuk menerima pembayaran upgrade dari toko.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nomor NMID / Merchant ID QRIS *</label>
                <input
                  type="text"
                  required
                  value={qrisNmid}
                  onChange={e => setQrisNmid(e.target.value)}
                  className="form-control"
                  placeholder="e.g. ID1029384756102"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Upload Gambar Barcode QRIS Resmi</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisImageUpload}
                  className="form-control"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Format PNG/JPG (Maksimal 2MB).</span>
              </div>
            </div>
          </div>

          {/* Bank Accounts Configuration */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Landmark color="var(--primary)" size={20} /> Konfigurasi Rekening Bank Pembayaran
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Atur daftar nomor rekening bank resmi milik PT/Platform Anda yang muncul pada modal invoice upgrade toko.
            </p>

            {/* Bank 1 */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>🏦 Rekening Bank Utam (Bank 1)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Bank</label>
                  <input
                    type="text"
                    value={bank1Name}
                    onChange={e => setBank1Name(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Bank Mandiri"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor Rekening</label>
                  <input
                    type="text"
                    value={bank1Account}
                    onChange={e => setBank1Account(e.target.value)}
                    className="form-control"
                    placeholder="137-00-XXXXXXX"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Atas Nama (Pemilik Rekening)</label>
                  <input
                    type="text"
                    value={bank1Owner}
                    onChange={e => setBank1Owner(e.target.value)}
                    className="form-control"
                    placeholder="PT MAVIN TEKNOLOGI JUARA"
                  />
                </div>
              </div>
            </div>

            {/* Bank 2 */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>🏦 Rekening Bank Sekunder (Bank 2)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Bank</label>
                  <input
                    type="text"
                    value={bank2Name}
                    onChange={e => setBank2Name(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Bank BCA"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor Rekening</label>
                  <input
                    type="text"
                    value={bank2Account}
                    onChange={e => setBank2Account(e.target.value)}
                    className="form-control"
                    placeholder="841-098-XXXX"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Atas Nama (Pemilik Rekening)</label>
                  <input
                    type="text"
                    value={bank2Owner}
                    onChange={e => setBank2Owner(e.target.value)}
                    className="form-control"
                    placeholder="PT MAVIN TEKNOLOGI JUARA"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Support WhatsApp */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Phone color="var(--primary)" size={20} /> Nomor WhatsApp Admin Konfirmasi Pembayaran
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Nomor WhatsApp ini akan otomatis dituju ketika toko mengeklik tombol *Kirim Bukti Transfer via WhatsApp*.
            </p>

            <div className="form-group" style={{ maxWidth: '400px', marginBottom: 0 }}>
              <label className="form-label">Nomor WhatsApp Admin (Format 628xxx) *</label>
              <input
                type="text"
                required
                value={adminWaPhone}
                onChange={e => setAdminWaPhone(e.target.value)}
                className="form-control"
                placeholder="6281234567890"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.25rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> Simpan Pengaturan Pembayaran SaaS
            </button>
          </div>
        </form>
      )}

      {/* Modal Add New Tenant */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={20} color="var(--primary)" /> Daftarkan Tenant Toko Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Toko / UMKM *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kopi Senja Lembang"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Pemilik *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pak Budi"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Pemilik *</label>
                <input
                  type="email"
                  required
                  placeholder="budi@kopisenja.id"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp Aktif *</label>
                <input
                  type="text"
                  required
                  placeholder="0812-XXXX-XXXX"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilihan Paket Langganan *</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="form-control"
                  style={{ fontWeight: 700 }}
                >
                  <option value="Starter">🎁 Starter (Rp 0 / bln - 1 Outlet)</option>
                  <option value="Pro">⚡ Paket PRO (Rp 69.000 / bln - 2 Outlet)</option>
                  <option value="Enterprise">🏆 Enterprise (Rp 149.000 / bln - 5 Outlet)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.7rem' }}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.7rem', fontWeight: 800 }}>
                  Simpan & Aktifkan Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
