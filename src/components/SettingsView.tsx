import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Truck,
  ShieldCheck,
  Calculator,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Building,
  UserCheck,
  Info,
  Check,
  X,
  Lock,
  Sparkles,
  Palette,
  Award,
  Coffee,
  ChefHat,
  ShoppingBag,
  Utensils,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, StaffUser } from '../types';
import { formatIdr, formatNumber } from '../utils/calculator';
import type { NavTab } from './Sidebar';

interface SettingsViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ setActiveTab }) => {
  const {
    storeSettings,
    updateStoreSettings,
    outlets,
    addOutlet,
    updateOutlet,
    deleteOutlet,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    currentRole,
    setCurrentRole,
    rolePermissions,
    updateRolePermission,
    staffUsers,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'store' | 'outlets' | 'suppliers' | 'roles' | 'bep'>('store');

  // Store settings form state
  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [tagline, setTagline] = useState(storeSettings.tagline);
  const [address, setAddress] = useState(storeSettings.address);
  const [phone, setPhone] = useState(storeSettings.phone);
  const [footerNote, setFooterNote] = useState(storeSettings.footerNote);
  const [taxPercent, setTaxPercent] = useState(storeSettings.taxPercent);
  const [servicePercent, setServicePercent] = useState(storeSettings.servicePercent);

  // Branding & Theme state
  const [logoType, setLogoType] = useState<'preset' | 'custom'>(storeSettings.logoType || 'preset');
  const [logoIcon, setLogoIcon] = useState(storeSettings.logoIcon || 'Award');
  const [customLogoUrl, setCustomLogoUrl] = useState(storeSettings.customLogoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(storeSettings.primaryColor || '#4f46e5');
  const [appBackground, setAppBackground] = useState(storeSettings.appBackground || 'slate');

  // Outlet modal
  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);
  const [outletName, setOutletName] = useState('');
  const [outletAddress, setOutletAddress] = useState('');
  const [outletPhone, setOutletPhone] = useState('');

  // Supplier modal
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supCategory, setSupCategory] = useState('Biji Kopi & Roastery');

  // Staff User Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('cashier');
  const [staffStatus, setStaffStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  // BEP Calculator State
  const [bepFixedCosts, setBepFixedCosts] = useState({
    labor: 5000000,
    rent: 2000000,
    utilities: 1000000,
    marketing: 500000
  });
  const [bepSellingPrice, setBepSellingPrice] = useState(22000);
  const [bepHppPerUnit, setBepHppPerUnit] = useState(8500);
  const [operatingDays, setOperatingDays] = useState(26);

  // File Upload Reader Handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoUrl(event.target.result as string);
        setLogoType('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      storeName,
      tagline,
      address,
      phone,
      footerNote,
      taxPercent,
      servicePercent,
      logoType,
      logoIcon,
      customLogoUrl,
      primaryColor,
      appBackground
    });
    alert('✅ Profil Toko & Tema Branding Aplikasi berhasil disimpan!');
  };

  // Preset Color Palettes
  const presetColors = [
    { name: 'Indigo Enterprise', hex: '#4f46e5' },
    { name: 'Emerald Fresh', hex: '#059669' },
    { name: 'Warm Amber Coffee', hex: '#d97706' },
    { name: 'Passion Rose', hex: '#e11d48' },
    { name: 'Royal Purple', hex: '#7c3aed' },
    { name: 'Slate Midnight', hex: '#334155' }
  ];

  const presetBackgrounds: { id: 'slate' | 'white' | 'cream' | 'mint' | 'sky'; name: string; hex: string }[] = [
    { id: 'slate', name: 'Abu Slate Soft', hex: '#f1f5f9' },
    { id: 'white', name: 'Putih Murni', hex: '#ffffff' },
    { id: 'cream', name: 'Krem Warm Coffee', hex: '#fdfbf7' },
    { id: 'mint', name: 'Hijau Mint Soft', hex: '#f0fdf4' },
    { id: 'sky', name: 'Biru Soft Ice', hex: '#f0f9ff' }
  ];

  // Explicit demo role switch with clear intent
  const handleSimulateRoleLogin = (role: UserRole) => {
    if (confirm(`Apakah Anda ingin masuk dalam Mode Demo sebagai ${role === 'cashier' ? 'Kasir' : role === 'manager' ? 'Dapur' : 'Pemilik'}?\n\nAnda akan diarahkan ke halaman yang sesuai.`)) {
      setCurrentRole(role);
      if (role === 'cashier') setActiveTab('pos');
      else if (role === 'manager') setActiveTab('recipes');
      else setActiveTab('dashboard');
    }
  };

  // Staff Submit (Add / Edit)
  const openAddStaffModal = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('cashier');
    setStaffStatus('Aktif');
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (st: StaffUser) => {
    setEditingStaffId(st.id);
    setStaffName(st.name);
    setStaffEmail(st.email);
    setStaffRole(st.role);
    setStaffStatus(st.status);
    setIsStaffModalOpen(true);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingStaffId) {
      updateStaffUser(editingStaffId, {
        name: staffName,
        email: staffEmail,
        role: staffRole,
        status: staffStatus
      });
    } else {
      addStaffUser({
        name: staffName,
        email: staffEmail || `${staffName.toLowerCase().replace(/\s+/g, '')}@mavin.id`,
        role: staffRole,
        outletName: storeSettings.storeName,
        status: staffStatus
      });
    }

    setIsStaffModalOpen(false);
  };

  // Outlet Form Submits
  const handleOutletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim()) return;
    if (editingOutletId) {
      updateOutlet(editingOutletId, { name: outletName, address: outletAddress, phone: outletPhone });
    } else {
      addOutlet({ name: outletName, address: outletAddress, phone: outletPhone, isMain: outlets.length === 0 });
    }
    setIsOutletModalOpen(false);
  };

  // Supplier Form Submits
  const handleSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    if (editingSupId) {
      updateSupplier(editingSupId, { name: supName, phone: supPhone, address: supAddress, category: supCategory });
    } else {
      addSupplier({ name: supName, phone: supPhone, address: supAddress, category: supCategory });
    }
    setIsSupModalOpen(false);
  };

  // BEP Calculation Logic
  const totalFixedCost = bepFixedCosts.labor + bepFixedCosts.rent + bepFixedCosts.utilities + bepFixedCosts.marketing;
  const marginPerUnit = Math.max(1, bepSellingPrice - bepHppPerUnit);
  const bepUnitsMonth = Math.ceil(totalFixedCost / marginPerUnit);
  const bepUnitsDay = Math.ceil(bepUnitsMonth / operatingDays);
  const bepRevenueMonth = bepUnitsMonth * bepSellingPrice;

  // Modules list for Interactive RBAC matrix table
  const modulesList: { key: string; name: string; description: string }[] = [
    { key: 'dashboard', name: '📊 Dashboard & Ringkasan Laba', description: 'Melihat statistik omset, laba kotor, dan total aset' },
    { key: 'ingredients', name: '🧪 Bahan Baku & HPP WAC', description: 'Mengelola master data bahan baku & unit cost' },
    { key: 'purchases', name: '🛒 Restock & Kulakan Bahan', description: 'Mencatat pembelian bahan baku dari supplier' },
    { key: 'recipes', name: '📖 Resep & Kalkulator Margin', description: 'Menyusun resep, alokasi overhead & target harga jual' },
    { key: 'production', name: '⚡ Manajemen Produksi Batch', description: 'Memasak batch resep dan menambah stok siap jual' },
    { key: 'pos', name: '🛍️ Kasir POS & Kirim WA Struk', description: 'Mencatat transaksi checkout pesanan & cetak struk' },
    { key: 'reports', name: '📈 Laporan Keuangan & Backup', description: 'Melihat laporan penjualan, ekspor CSV & backup JSON' },
    { key: 'settings', name: '⚙️ Pengaturan Enterprise SaaS', description: 'Kelola profil toko, outlet, supplier & RBAC' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2>Pengaturan Enterprise MAVIN SaaS</h2>
        <p style={{ fontSize: '0.875rem' }}>Kelola profil usaha, kustomisasi logo & tema tampilan, cabang outlet, data supplier, matrik RBAC, dan BEP.</p>
      </div>

      {/* Sub Tabs Bar - Styled Modern Pills */}
      <div className="sub-tabs-container">
        <button
          type="button"
          onClick={() => setActiveSubTab('store')}
          className={`sub-tab-pill ${activeSubTab === 'store' ? 'active' : ''}`}
        >
          <Building size={16} /> Profil Toko & Tema Branding
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('roles')}
          className={`sub-tab-pill ${activeSubTab === 'roles' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} /> Matriks Peran & RBAC
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('outlets')}
          className={`sub-tab-pill ${activeSubTab === 'outlets' ? 'active' : ''}`}
        >
          <MapPin size={16} /> Multi-Outlet ({outlets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('suppliers')}
          className={`sub-tab-pill ${activeSubTab === 'suppliers' ? 'active' : ''}`}
        >
          <Truck size={16} /> Master Supplier ({suppliers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('bep')}
          className={`sub-tab-pill ${activeSubTab === 'bep' ? 'active' : ''}`}
        >
          <Calculator size={16} /> Kalkulator BEP
        </button>
      </div>

      {/* TAB 1: Store & Tax Settings + White-Label Branding Customization */}
      {activeSubTab === 'store' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {/* Form Settings */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} color="var(--primary)" /> Informasi Profil Usaha Toko
            </h3>

            <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Usaha / Toko *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slogan / Tagline Usaha</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Alamat Utama Usaha</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp Toko</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pajak PB1 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={taxPercent}
                    onChange={e => setTaxPercent(Number(e.target.value))}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Charge (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={servicePercent}
                    onChange={e => setServicePercent(Number(e.target.value))}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pesan Footer Struk Nota</label>
                <textarea
                  rows={2}
                  value={footerNote}
                  onChange={e => setFooterNote(e.target.value)}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                <CheckCircle2 size={16} /> Simpan Profil & Branding Toko
              </button>
            </form>
          </div>

          {/* White-Label Branding & Theme Customizer */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                <Palette size={20} /> Kustomisasi Tema & Logo Aplikasi (White-Labeling)
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Upload gambar logo kustom usaha Anda atau pilih ikon bawaan, sesuaikan warna brand & background aplikasi!
              </p>
            </div>

            {/* 1. Logo Selector Tabs (Preset vs Upload Custom) */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Logo Toko (Upload File / Preset):</label>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setLogoType('preset')}
                  className={`btn ${logoType === 'preset' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Award size={14} /> Pilihan Ikon Preset
                </button>

                <button
                  type="button"
                  onClick={() => setLogoType('custom')}
                  className={`btn ${logoType === 'custom' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Upload size={14} /> Upload Gambar Logo
                </button>
              </div>

              {/* Mode A: Preset Icons */}
              {logoType === 'preset' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'Award', label: 'Medal', icon: <Award size={18} /> },
                    { id: 'Coffee', label: 'Kopi', icon: <Coffee size={18} /> },
                    { id: 'ChefHat', label: 'Chef', icon: <ChefHat size={18} /> },
                    { id: 'Store', label: 'Toko', icon: <Store size={18} /> },
                    { id: 'ShoppingBag', label: 'Bag', icon: <ShoppingBag size={18} /> },
                    { id: 'Utensils', label: 'Resto', icon: <Utensils size={18} /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoIcon(item.id as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: logoIcon === item.id ? `2px solid ${primaryColor}` : '1px solid var(--border-color)',
                        background: logoIcon === item.id ? '#ffffff' : '#f1f5f9',
                        color: logoIcon === item.id ? primaryColor : 'var(--text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Mode B: Custom File Upload */}
              {logoType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <label
                      htmlFor="logo-file-input"
                      className="btn btn-emerald"
                      style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Upload size={14} /> Pilih File Gambar...
                    </label>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoFileUpload}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: PNG, JPG, SVG (Maks 3MB)</span>
                  </div>

                  {/* Custom URL text fallback */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>atau Masukkan Direct Image URL (HTTPS):</label>
                    <input
                      type="text"
                      placeholder="https://domain.com/logo.png"
                      value={customLogoUrl}
                      onChange={e => setCustomLogoUrl(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Primary Color Picker */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Pilih Warna Tema Utama Usaha (Brand Color):</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                {presetColors.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPrimaryColor(c.hex)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: primaryColor === c.hex ? '3px solid #0f172a' : '2px solid #ffffff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                    title={c.name}
                  />
                ))}

                {/* Custom Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{primaryColor}</span>
                </div>
              </div>
            </div>

            {/* 3. Background Theme Picker */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Pilih Warna Background Aplikasi:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {presetBackgrounds.map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setAppBackground(bg.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: appBackground === bg.id ? `2px solid ${primaryColor}` : '1px solid var(--border-color)',
                      background: bg.hex,
                      color: '#0f172a',
                      fontWeight: appBackground === bg.id ? 800 : 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Card */}
            <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>PREVIEW TAMPILAN BRANDING ANDA:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: primaryColor, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {logoType === 'custom' && customLogoUrl ? (
                    <img src={customLogoUrl} alt="Preview Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      {logoIcon === 'Coffee' && <Coffee size={22} />}
                      {logoIcon === 'ChefHat' && <ChefHat size={22} />}
                      {logoIcon === 'Store' && <Store size={22} />}
                      {logoIcon === 'ShoppingBag' && <ShoppingBag size={22} />}
                      {logoIcon === 'Utensils' && <Utensils size={22} />}
                      {logoIcon === 'Award' && <Award size={22} />}
                    </>
                  )}
                </div>
                <div>
                  <h4 style={{ color: primaryColor, fontSize: '1.05rem', margin: 0 }}>{storeName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tagline || 'Manajemen UMKM Juara'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: User & Role RBAC Matrix (INTERACTIVE & EDITABLE) */}
      {activeSubTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Section 1: Staff User Accounts Management */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3>Manajemen Pengguna & Pengelola Usaha ({staffUsers.length} Akun)</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Daftar staf, kasir, dan pengelola usaha serta alokasi hak akses masing-masing.</p>
              </div>
              <button onClick={openAddStaffModal} className="btn btn-primary">
                <Plus size={16} /> Tambah Akun Staf Baru
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nama Pengguna</th>
                    <th>Email Login</th>
                    <th>Hak Akses Peran (Role)</th>
                    <th>Cabang Outlet</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {staffUsers.map(st => (
                    <tr key={st.id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{st.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{st.email}</td>
                      <td>
                        {st.role === 'owner' && <span className="badge badge-amber">👑 Pemilik (Super Admin)</span>}
                        {st.role === 'manager' && <span className="badge badge-indigo">👨‍🍳 Dapur & Operasional</span>}
                        {st.role === 'cashier' && <span className="badge badge-emerald">🛒 Kasir (POS)</span>}
                      </td>
                      <td>{st.outletName}</td>
                      <td>
                        <span className={`badge ${st.status === 'Aktif' ? 'badge-emerald' : 'badge-rose'}`}>
                          {st.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button onClick={() => openEditStaffModal(st)} className="btn btn-outline" style={{ padding: '0.3rem 0.5rem' }} title="Edit Staf">
                            <Edit2 size={14} /> Edit
                          </button>
                          {st.role !== 'owner' && (
                            <button onClick={() => deleteStaffUser(st.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.5rem' }} title="Hapus Staf">
                              <Trash2 size={14} />
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

          {/* Section 2: FULLY INTERACTIVE & EDITABLE RBAC PERMISSION MATRIX */}
          <div className="card" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  <ShieldCheck size={22} /> Matriks Hak Akses Peran (Interaktif & Dapat Diedit)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Centang atau hilangkan centang pada sakelar modul di bawah ini untuk mengatur izin akses <strong>Dapur</strong> & <strong>Kasir</strong> secara langsung!
                </p>
              </div>

              <span className="badge badge-indigo" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Sparkles size={14} /> Realtime Auto-Save
              </span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Modul Fitur MAVIN</th>
                    <th style={{ textAlign: 'center', width: '220px' }}>👑 PEMILIK (OWNER)</th>
                    <th style={{ textAlign: 'center', width: '240px' }}>👨‍🍳 DAPUR & OPS</th>
                    <th style={{ textAlign: 'center', width: '240px' }}>🛒 KASIR (CASHIER)</th>
                  </tr>
                </thead>
                <tbody>
                  {modulesList.map(mod => {
                    const isManagerAllowed = Boolean(rolePermissions.manager?.[mod.key]);
                    const isCashierAllowed = Boolean(rolePermissions.cashier?.[mod.key]);

                    return (
                      <tr key={mod.key}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{mod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mod.description}</div>
                        </td>

                        {/* Owner Column - Always Locked ON */}
                        <td style={{ textAlign: 'center', background: '#fefce8' }}>
                          <span className="badge badge-amber" style={{ padding: '0.35rem 0.65rem' }}>
                            <Lock size={12} /> Akses Penuh
                          </span>
                        </td>

                        {/* Manager / Dapur Column - INTERACTIVE CHECKBOX */}
                        <td style={{ textAlign: 'center' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              padding: '0.4rem 0.8rem',
                              borderRadius: 'var(--radius-sm)',
                              background: isManagerAllowed ? '#ecfdf5' : '#fff1f2',
                              border: `1px solid ${isManagerAllowed ? '#a7f3d0' : '#fecdd3'}`,
                              transition: 'all 0.2s ease',
                              userSelect: 'none'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isManagerAllowed}
                              onChange={e => updateRolePermission('manager', mod.key, e.target.checked)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isManagerAllowed ? '#047857' : '#be123c' }}>
                              {isManagerAllowed ? 'Dizinkan' : 'Terkunci'}
                            </span>
                          </label>
                        </td>

                        {/* Cashier Column - INTERACTIVE CHECKBOX */}
                        <td style={{ textAlign: 'center' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              padding: '0.4rem 0.8rem',
                              borderRadius: 'var(--radius-sm)',
                              background: isCashierAllowed ? '#ecfdf5' : '#fff1f2',
                              border: `1px solid ${isCashierAllowed ? '#a7f3d0' : '#fecdd3'}`,
                              transition: 'all 0.2s ease',
                              userSelect: 'none'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isCashierAllowed}
                              onChange={e => updateRolePermission('cashier', mod.key, e.target.checked)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCashierAllowed ? '#047857' : '#be123c' }}>
                              {isCashierAllowed ? 'Dizinkan' : 'Terkunci'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Explicit Role Simulation Tester */}
          <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem' }}>Simulasi Pengujian Login Role (Demo Mode)</h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Ubah hak akses di atas lalu klik tombol simulasi untuk melihat perubahan navigasi saat login sebagai staf Dapur atau Kasir:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSimulateRoleLogin('manager')}
              >
                👨‍🍳 Uji Tampilan Role Dapur
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSimulateRoleLogin('cashier')}
              >
                🛒 Uji Tampilan Role Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Outlet Management */}
      {activeSubTab === 'outlets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Daftar Cabang / Outlet ({outlets.length})</h3>
            <button
              onClick={() => {
                setEditingOutletId(null);
                setOutletName('');
                setOutletAddress('');
                setOutletPhone('');
                setIsOutletModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Tambah Cabang Baru
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {outlets.map(out => (
              <div key={out.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem' }}>{out.name}</h4>
                    {out.isMain ? (
                      <span className="badge badge-emerald">Pusat / Main</span>
                    ) : (
                      <span className="badge badge-indigo">Cabang</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>📍 {out.address || 'Alamat belum disetting'}</p>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>📞 {out.phone || '-'}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setEditingOutletId(out.id);
                      setOutletName(out.name);
                      setOutletAddress(out.address);
                      setOutletPhone(out.phone);
                      setIsOutletModalOpen(true);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.5rem' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  {!out.isMain && (
                    <button
                      onClick={() => deleteOutlet(out.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.3rem 0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Master Supplier */}
      {activeSubTab === 'suppliers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Master Data Supplier / Pemasok Bahan ({suppliers.length})</h3>
            <button
              onClick={() => {
                setEditingSupId(null);
                setSupName('');
                setSupPhone('');
                setSupAddress('');
                setSupCategory('Biji Kopi & Roastery');
                setIsSupModalOpen(true);
              }}
              className="btn btn-emerald"
            >
              <Plus size={16} /> Tambah Supplier Baru
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Supplier</th>
                  <th>Kategori Pasokan</th>
                  <th>Telepon / WhatsApp</th>
                  <th>Alamat</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{sup.name}</strong></td>
                    <td><span className="badge badge-indigo">{sup.category}</span></td>
                    <td>{sup.phone}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{sup.address}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setEditingSupId(sup.id);
                            setSupName(sup.name);
                            setSupPhone(sup.phone);
                            setSupAddress(sup.address);
                            setSupCategory(sup.category);
                            setIsSupModalOpen(true);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteSupplier(sup.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BEP Calculator */}
      {activeSubTab === 'bep' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Operational Inputs */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calculator size={20} color="var(--primary)" /> Biaya Operasional Tetap Bulanan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gaji Pegawai / Karyawan (Rp/bln)</label>
                <input
                  type="number"
                  step="100000"
                  value={bepFixedCosts.labor}
                  onChange={e => setBepFixedCosts({ ...bepFixedCosts, labor: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sewa Tempat / Outlet (Rp/bln)</label>
                <input
                  type="number"
                  step="100000"
                  value={bepFixedCosts.rent}
                  onChange={e => setBepFixedCosts({ ...bepFixedCosts, rent: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Listrik, Air, Es & Wifi (Rp/bln)</label>
                <input
                  type="number"
                  step="50000"
                  value={bepFixedCosts.utilities}
                  onChange={e => setBepFixedCosts({ ...bepFixedCosts, utilities: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Promosi & Marketing Ads (Rp/bln)</label>
                <input
                  type="number"
                  step="50000"
                  value={bepFixedCosts.marketing}
                  onChange={e => setBepFixedCosts({ ...bepFixedCosts, marketing: Number(e.target.value) })}
                  className="form-control"
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Rata-rata Harga Jual</label>
                    <input
                      type="number"
                      step="500"
                      value={bepSellingPrice}
                      onChange={e => setBepSellingPrice(Number(e.target.value))}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Rata-rata HPP per Unit</label>
                    <input
                      type="number"
                      step="500"
                      value={bepHppPerUnit}
                      onChange={e => setBepHppPerUnit(Number(e.target.value))}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Breakdown */}
          <div className="card" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Hasil Target Titik Impas (BEP)</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Jumlah porsi minimum yang harus terjual untuk menutup seluruh operasional toko:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL BIAYA TETAP BULANAN</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                    {formatIdr(totalFixedCost)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BEP TARGET BULANAN</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatNumber(bepUnitsMonth)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>unit</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Omset: {formatIdr(bepRevenueMonth)}</span>
                  </div>

                  <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TARGET HARIAN ({operatingDays} hari)</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {formatNumber(bepUnitsDay)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>unit/hari</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Minimal per hari</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#e0e7ff', borderRadius: 'var(--radius-sm)', color: '#3730a3', fontSize: '0.8rem' }}>
              💡 <strong>Tips Sukses MAVIN:</strong> Untuk meraih keuntungan bersih Rp 5.000.000/bulan, Anda perlu menjual tambahan sekitar <strong>{Math.ceil(5000000 / marginPerUnit)} unit</strong> di atas target BEP harian Anda.
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingStaffId ? 'Edit Akun Staf Pengguna' : 'Tambah Akun Staf Pengguna Baru'}</h3>
              <button onClick={() => setIsStaffModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleStaffSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Staf / Karyawan *</label>
                  <input type="text" required placeholder="e.g. Siska Kasir" value={staffName} onChange={e => setStaffName(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Login</label>
                  <input type="email" placeholder="siska@mavin.id" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alokasi Peran (Role Hak Akses)</label>
                  <select value={staffRole} onChange={e => setStaffRole(e.target.value as UserRole)} className="form-control">
                    <option value="cashier">🛒 Kasir (Akses POS)</option>
                    <option value="manager">👨‍🍳 Dapur & Operasional (Akses Resep & Stok)</option>
                    <option value="owner">👑 Pemilik (Akses Penuh Super Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status Akun</label>
                  <select value={staffStatus} onChange={e => setStaffStatus(e.target.value as 'Aktif' | 'Non-Aktif')} className="form-control">
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Staf</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outlet Modal */}
      {isOutletModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingOutletId ? 'Edit Outlet Cabang' : 'Tambah Outlet Cabang Baru'}</h3>
              <button onClick={() => setIsOutletModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleOutletSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Outlet Cabang *</label>
                  <input type="text" required placeholder="e.g. MAVIN Branch Lembang" value={outletName} onChange={e => setOutletName(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat Outlet</label>
                  <input type="text" placeholder="Jl. Raya Lembang No. 45" value={outletAddress} onChange={e => setOutletAddress(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon Outlet</label>
                  <input type="text" placeholder="0813-XXXX-XXXX" value={outletPhone} onChange={e => setOutletPhone(e.target.value)} className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsOutletModalOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Outlet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingSupId ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}</h3>
              <button onClick={() => setIsSupModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <form onSubmit={handleSupSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nama Supplier / Toko *</label>
                  <input type="text" required placeholder="e.g. PT Kopi Nusantara" value={supName} onChange={e => setSupName(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori Pasokan</label>
                  <input type="text" placeholder="e.g. Biji Kopi, Susu, Kemasan" value={supCategory} onChange={e => setSupCategory(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon / WhatsApp</label>
                  <input type="text" placeholder="0811-XXXX-XXXX" value={supPhone} onChange={e => setSupPhone(e.target.value)} className="form-control" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat / Lokasi</label>
                  <input type="text" placeholder="Kawasan Industri Cikarang" value={supAddress} onChange={e => setSupAddress(e.target.value)} className="form-control" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsSupModalOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-emerald">Simpan Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
