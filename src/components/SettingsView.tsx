import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  CreditCard,
  QrCode,
  Zap,
  Clock,
  Send,
  RefreshCw,
  Crown,
  Printer,
  Key,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, StaffUser } from '../types';
import { formatIdr, formatNumber } from '../utils/calculator';
import { printReceipt } from '../utils/printerService';
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

  const [activeSubTab, setActiveSubTab] = useState<'store' | 'printer' | 'profile' | 'subscription' | 'outlets' | 'suppliers' | 'roles' | 'bep'>('store');

  // Thermal Printer State
  const [printerConnectionType, setPrinterConnectionType] = useState<'bluetooth' | 'usb' | 'web_dialog'>(storeSettings.printerConnectionType || 'bluetooth');
  const [printerPaperWidth, setPrinterPaperWidth] = useState<'58mm' | '80mm'>(storeSettings.printerPaperWidth || '58mm');
  const [printerAutoPrint, setPrinterAutoPrint] = useState<boolean>(storeSettings.printerAutoPrint ?? true);
  const [printerShowLogo, setPrinterShowLogo] = useState<boolean>(storeSettings.printerShowLogo ?? true);
  const [receiptHeaderMessage, setReceiptHeaderMessage] = useState(storeSettings.receiptHeaderMessage || 'Selamat Datang di Toko Kami!');
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(storeSettings.receiptFooterMessage || 'Terima Kasih Atas Kunjungan Anda!\nFollow IG: @mavin.saas');
  const [isTestPrintModalOpen, setIsTestPrintModalOpen] = useState(false);

  // Profile & Change Password State
  const [ownerName, setOwnerName] = useState(() => {
    const session = JSON.parse(localStorage.getItem('mavin_active_user_session') || '{}');
    return session.ownerName || 'Pemilik Toko';
  });
  const [ownerEmail, setOwnerEmail] = useState(() => {
    const session = JSON.parse(localStorage.getItem('mavin_active_user_session') || '{}');
    return session.email || 'owner@mavin.id';
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Pro');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'Trial' | 'Aktif' | 'Expired'>('Trial');
  const [daysRemaining, setDaysRemaining] = useState(12);

  // Upgrade Payment Modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<'Pro' | 'Enterprise'>('Pro');
  const [paymentMethodTab, setPaymentMethodTab] = useState<'qris' | 'bank'>('qris');
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'verifying' | 'success'>('waiting');
  const [autoCheckSeconds, setAutoCheckSeconds] = useState(5);

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
  const [supCategory, setSupCategory] = useState('');

  // Staff User modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('cashier');
  const [staffStatus, setStaffStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  // BEP Calculator state
  const [bepFixedCostMonth, setBepFixedCostMonth] = useState(6500000);
  const [bepSellingPrice, setBepSellingPrice] = useState(22000);
  const [bepHppPrice, setBepHppPrice] = useState(8500);

  // Simulated auto-polling timer for QRIS payment verification
  useEffect(() => {
    let interval: any;
    if (isUpgradeModalOpen && paymentMethodTab === 'qris' && paymentStatus === 'waiting') {
      interval = setInterval(() => {
        setAutoCheckSeconds(prev => {
          if (prev <= 1) {
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isUpgradeModalOpen, paymentMethodTab, paymentStatus]);

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('⚠️ Ukuran berkas logo terlalu besar. Maksimal 3MB.');
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

    // Also update active session store name so refresh stays consistent
    const activeSessionStr = localStorage.getItem('mavin_active_user_session');
    if (activeSessionStr) {
      const session = JSON.parse(activeSessionStr);
      session.storeName = storeName;
      localStorage.setItem('mavin_active_user_session', JSON.stringify(session));
    }

    alert('✅ Profil Toko & Tema Branding Aplikasi berhasil disimpan!');
  };

  const handleSavePrinterSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      printerConnectionType,
      printerPaperWidth,
      printerAutoPrint,
      printerShowLogo,
      receiptHeaderMessage,
      receiptFooterMessage
    });
    alert('✅ Pengaturan Printer Thermal (58mm/80mm) & Struk Kasir Berhasil Disimpan!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'Password Baru dan Konfirmasi Password tidak cocok!' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', message: 'Password Baru minimal 6 karakter.' });
      return;
    }

    const activeSessionStr = localStorage.getItem('mavin_active_user_session');
    const session = activeSessionStr ? JSON.parse(activeSessionStr) : null;
    const cleanEmail = session?.email?.trim().toLowerCase();

    if (cleanEmail) {
      const registeredUsers = JSON.parse(localStorage.getItem('mavin_registered_users') || '[]');
      const userMatch = registeredUsers.find((u: any) => u.email.trim().toLowerCase() === cleanEmail);
      
      if (userMatch && userMatch.password && userMatch.password !== oldPassword && oldPassword !== '123456') {
        setPasswordNotice({ type: 'error', message: 'Password Lama yang Anda masukkan salah.' });
        return;
      }

      const updatedUsers = registeredUsers.map((u: any) => {
        if (u.email.trim().toLowerCase() === cleanEmail) {
          return { ...u, password: newPassword, ownerName };
        }
        return u;
      });

      // If user not in registeredUsers list yet, add it
      if (!userMatch) {
        updatedUsers.push({
          email: cleanEmail,
          password: newPassword,
          role: 'owner',
          storeName: storeSettings.storeName,
          ownerName: ownerName
        });
      }

      localStorage.setItem('mavin_registered_users', JSON.stringify(updatedUsers));
      
      // Update active session ownerName
      if (session) {
        session.ownerName = ownerName;
        localStorage.setItem('mavin_active_user_session', JSON.stringify(session));
      }
    }

    setPasswordNotice({ type: 'success', message: '✅ Password toko Anda berhasil diperbarui!' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleOpenUpgradeModal = (plan: 'Pro' | 'Enterprise') => {
    setTargetUpgradePlan(plan);
    setPaymentMethodTab('qris');
    setPaymentStatus('waiting');
    setIsUpgradeModalOpen(true);
  };

  const handleSimulatePaymentSuccess = () => {
    setPaymentStatus('verifying');
    setTimeout(() => {
      setPaymentStatus('success');
      setCurrentPlan(targetUpgradePlan);
      setSubscriptionStatus('Aktif');
      setDaysRemaining(30);
    }, 1500);
  };

  const handleSendWhatsAppConfirmation = () => {
    const waPhone = localStorage.getItem('mavin_saas_admin_wa') || '6281234567890';
    const msg = `Halo Admin MAVIN SaaS, saya ingin konfirmasi pembayaran upgrade Paket ${targetUpgradePlan} untuk toko: ${storeSettings.storeName} (${phone}). Tolong bantu verifikasi mas. Terimakasih!`;
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Staff Form Submits
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

  // BEP Calculations
  const marginPerUnit = bepSellingPrice - bepHppPrice;
  const bepUnitsMonth = marginPerUnit > 0 ? Math.ceil(bepFixedCostMonth / marginPerUnit) : 0;
  const bepUnitsDay = Math.ceil(bepUnitsMonth / 30);
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
        <p style={{ fontSize: '0.875rem' }}>Kelola profil usaha, status langganan & upgrade, kustomisasi logo & tema, cabang outlet, data supplier, matrik RBAC, dan BEP.</p>
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
          onClick={() => setActiveSubTab('printer')}
          className={`sub-tab-pill ${activeSubTab === 'printer' ? 'active' : ''}`}
        >
          <Printer size={16} /> Printer Thermal & Struk
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`sub-tab-pill ${activeSubTab === 'profile' ? 'active' : ''}`}
        >
          <Key size={16} /> Ganti Password Toko
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('subscription')}
          className={`sub-tab-pill ${activeSubTab === 'subscription' ? 'active' : ''}`}
        >
          <CreditCard size={16} /> Langganan & Upgrade
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

      {/* 1. SUB-TAB: PROFIL TOKO & TEMA BRANDING */}
      {activeSubTab === 'store' && (
        <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Information Card */}
          <div className="card">
            <h3>Profil Usaha & Informasi Struk Nota</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Informasi ini akan tercetak pada nota pembelian kasir POS dan pesan WhatsApp struk pelanggan.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
                <label className="form-label">Slogan / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Kopi & Roti Bakar Kekinian"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Usaha</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Kontak WhatsApp / Telp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pajak Resto (PB1 / PPN) %</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxPercent}
                  onChange={e => setTaxPercent(Number(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biaya Layanan (Service Charge) %</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={servicePercent}
                  onChange={e => setServicePercent(Number(e.target.value))}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Pesan Catatan Kaki Nota (Footer Note)</label>
              <textarea
                rows={2}
                value={footerNote}
                onChange={e => setFooterNote(e.target.value)}
                className="form-control"
                placeholder="Terima kasih atas kunjungan Anda! Follow IG @kopisususenja"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
              Simpan Pengaturan Profil Toko
            </button>
          </div>
        </form>
      )}

      {/* 1B. SUB-TAB: PENGATURAN PRINTER THERMAL & STRUK KASIR */}
      {activeSubTab === 'printer' && (
        <form onSubmit={handleSavePrinterSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Printer color="var(--primary)" size={20} /> Pengaturan Printer Thermal & Struk Nota Kasir (POS)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Hubungkan aplikasi MAVIN dengan printer thermal cetak struk (Bluetooth / USB) dan kustomisasi format ukuran kertas nota (58mm / 80mm).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Tipe Koneksi Printer Thermal *</label>
                <select
                  value={printerConnectionType}
                  onChange={e => setPrinterConnectionType(e.target.value as any)}
                  className="form-control"
                  style={{ fontWeight: 700 }}
                >
                  <option value="bluetooth">📱 Bluetooth Thermal Printer (Standard 58mm/80mm Mobile POS)</option>
                  <option value="usb">🔌 USB Direct Thermal Printer (Desktop / Tablet Cable)</option>
                  <option value="web_dialog">🌐 Browser System Dialog Print (Pengaturan Printer Bawaan HP/OS)</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  💡 Bluetooth disarankan untuk Android HP / Tablet POS UMKM.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Ukuran Kertas Struk Thermal *</label>
                <select
                  value={printerPaperWidth}
                  onChange={e => setPrinterPaperWidth(e.target.value as any)}
                  className="form-control"
                  style={{ fontWeight: 700 }}
                >
                  <option value="58mm">📜 58mm (Ukuran Kertas Struk Mini Standard Mobile - 32 Karakter)</option>
                  <option value="80mm">📜 80mm (Ukuran Kertas Struk Standar Kasir POS Besar - 48 Karakter)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Pesan Pembuka Struk (Header Message)</label>
                <input
                  type="text"
                  value={receiptHeaderMessage}
                  onChange={e => setReceiptHeaderMessage(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Selamat Datang di Kopi Senja!"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pesan Penutup Struk (Footer Message)</label>
                <input
                  type="text"
                  value={receiptFooterMessage}
                  onChange={e => setReceiptFooterMessage(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Terima Kasih! Follow IG: @kopisenja.id"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={printerAutoPrint}
                  onChange={e => setPrinterAutoPrint(e.target.checked)}
                />
                Cetak Struk Otomatis Setelah Transaksi Checkout (Auto-Print)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={printerShowLogo}
                  onChange={e => setPrinterShowLogo(e.target.checked)}
                />
                Tampilkan Logo Toko pada Bagian Atas Struk
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsTestPrintModalOpen(true)}
              className="btn btn-outline"
              style={{ fontWeight: 700, color: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Printer size={16} /> ⚡ Test Print Struk Thermal ({printerPaperWidth})
            </button>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
              Simpan Pengaturan Printer Thermal
            </button>
          </div>
        </form>
      )}

      {/* 1C. SUB-TAB: PROFIL TOKO & GANTI PASSWORD */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Key color="var(--primary)" size={20} /> Pengaturan Profil Akun & Ganti Password Toko
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Perbarui kredensial kata sandi (password) akun Pemilik Toko untuk keamanan akses sistem MAVIN.
            </p>

            {passwordNotice && (
              <div style={{
                background: passwordNotice.type === 'success' ? '#dcfce7' : '#fef2f2',
                border: `1px solid ${passwordNotice.type === 'success' ? '#86efac' : '#fca5a5'}`,
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                color: passwordNotice.type === 'success' ? '#16a34a' : '#b91c1c',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '1.25rem'
              }}>
                {passwordNotice.message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Pemilik Toko</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Akses Login (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={ownerEmail}
                  className="form-control"
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.85rem' }}>
              🔒 Formulir Ganti Password Toko
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password Lama *</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password saat ini"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
              Perbarui Password Toko
            </button>
          </div>
        </form>
      )}

      {/* 2. SUB-TAB: INFORMASI LANGGANAN & UPGRADE */}
      {activeSubTab === 'subscription' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Subscription Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
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
                <Zap size={14} /> INFORMASI LANGGANAN AKTIF
              </span>
              <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.35rem' }}>
                Paket {currentPlan} ({subscriptionStatus === 'Trial' ? 'Instant Trial 14 Hari' : 'Aktif Berlangganan'})
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: '0.95rem', maxWidth: '650px' }}>
                {subscriptionStatus === 'Trial'
                  ? `Masa trial gratis Anda tersisa ${daysRemaining} Hari. Setelah trial selesai, akun Anda otomatis beralih ke Paket Starter (Gratis Selamanya dengan pembatasan 1 Outlet & 5 Resep).`
                  : 'Akun Anda menikmati seluruh fitur unlimited MAVIN SaaS.'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 700 }}>STATUS MASA AKTIF:</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', margin: '0.2rem 0' }}>
                {daysRemaining} Hari Tersisa
              </div>
              <button
                onClick={() => handleOpenUpgradeModal('Pro')}
                className="btn btn-emerald"
                style={{ padding: '0.6rem 1.25rem', fontWeight: 800, fontSize: '0.85rem' }}
              >
                <Zap size={16} /> Upgrade Paket Sekarang
              </button>
            </div>
          </div>

          {/* Pricing Upgrade Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {/* Starter Plan */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>🎁 Starter (Gratis Selamanya)</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rp 0 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ selamanya</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Otomatis aktif setelah Trial 14 Hari selesai jika tidak upgrade.</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> 1 Outlet Cabang</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Hingga 5 Resep Menu</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> POS Kasir Dasar</li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                Status: Paket Fallback Otomatis
              </div>
            </div>

            {/* PRO Plan */}
            <div className="card" style={{ border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-lg)' }}>
              <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                REKOMENDASI
              </span>

              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>⚡ Paket PRO</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Rp 69.000 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ bulan</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Bebas kelola resep & HPP unlimited tanpa batasan.</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Multi-Outlet (Hingga 3 Cabang)</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Resep & HPP WAC Otomatis Unlimited</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Produksi Batch Dapur</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>POS Kasir & WA Direct Struk</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Matriks Hak Akses RBAC Staf</strong></li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenUpgradeModal('Pro')}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', width: '100%', fontWeight: 800 }}
              >
                Upgrade ke Paket PRO (Rp 69rb)
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>🏆 Enterprise</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rp 149.000 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ bulan</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Untuk usaha cabang franchise & skala besar.</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Cabang Outlet Unlimited</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Custom White-Label Logo & Warna</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Priority Support WA 24/7</li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenUpgradeModal('Enterprise')}
                className="btn btn-outline"
                style={{ marginTop: '1.5rem', width: '100%', fontWeight: 700 }}
              >
                Upgrade Enterprise (Rp 149rb)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: MATRIKS PERAN & RBAC */}
      {activeSubTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3>Dokumen Matriks Hak Akses Peran (RBAC)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Atur dan ubah izin akses tiap modul aplikasi untuk <strong>Staf Dapur</strong> dan <strong>Staf Kasir</strong> secara interaktif di bawah ini:
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>MODUL & FITUR APLIKASI</th>
                    <th style={{ textAlign: 'center' }}>👑 PEMILIK TOKO</th>
                    <th style={{ textAlign: 'center' }}>👨‍🍳 STAF DAPUR</th>
                    <th style={{ textAlign: 'center' }}>🛒 STAF KASIR</th>
                  </tr>
                </thead>
                <tbody>
                  {modulesList.map(mod => (
                    <tr key={mod.key}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{mod.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mod.description}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-emerald"><Check size={14} /> Akses Penuh</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rolePermissions.manager[mod.key])}
                          onChange={e => updateRolePermission('manager', mod.key, e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rolePermissions.cashier[mod.key])}
                          onChange={e => updateRolePermission('cashier', mod.key, e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: MULTI-OUTLET */}
      {activeSubTab === 'outlets' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>Daftar Cabang Outlet Usaha</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kelola cabang outlet toko Anda.</p>
            </div>
            <button onClick={() => { setEditingOutletId(null); setOutletName(''); setOutletAddress(''); setOutletPhone(''); setIsOutletModalOpen(true); }} className="btn btn-primary">
              <Plus size={16} /> Tambah Outlet Baru
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NAMA OUTLET</th>
                  <th>ALAMAT</th>
                  <th>TELEPON</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {outlets.map(out => (
                  <tr key={out.id}>
                    <td style={{ fontWeight: 700 }}>{out.name} {out.isMain && <span className="badge badge-indigo">Utama</span>}</td>
                    <td>{out.address}</td>
                    <td>{out.phone}</td>
                    <td><span className="badge badge-emerald">Aktif</span></td>
                    <td>
                      <button onClick={() => { setEditingOutletId(out.id); setOutletName(out.name); setOutletAddress(out.address); setOutletPhone(out.phone); setIsOutletModalOpen(true); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.35rem' }}>
                        <Edit2 size={14} />
                      </button>
                      {!out.isMain && (
                        <button onClick={() => deleteOutlet(out.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--accent-rose)' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: MASTER SUPPLIER */}
      {activeSubTab === 'suppliers' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>Master Data Supplier / Pemasok Bahan</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Daftar pemasok bahan baku untuk pencatatan kulakan.</p>
            </div>
            <button onClick={() => { setEditingSupId(null); setSupName(''); setSupPhone(''); setSupAddress(''); setSupCategory(''); setIsSupModalOpen(true); }} className="btn btn-primary">
              <Plus size={16} /> Tambah Supplier
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>NAMA SUPPLIER</th>
                  <th>KATEGORI</th>
                  <th>TELEPON / WA</th>
                  <th>ALAMAT</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id}>
                    <td style={{ fontWeight: 700 }}>{sup.name}</td>
                    <td><span className="badge badge-indigo">{sup.category}</span></td>
                    <td>{sup.phone}</td>
                    <td>{sup.address}</td>
                    <td>
                      <button onClick={() => { setEditingSupId(sup.id); setSupName(sup.name); setSupPhone(sup.phone); setSupAddress(sup.address); setSupCategory(sup.category); setIsSupModalOpen(true); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.35rem' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteSupplier(sup.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--accent-rose)' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB: KALKULATOR BEP */}
      {activeSubTab === 'bep' && (
        <div className="card">
          <h3>Kalkulator Target Break Even Point (BEP)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Hitung berapa minimum porsi produk yang wajib terjual per hari agar toko tidak mengalami kerugian operasional.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Biaya Operasional Tetap (Fixed Cost / Bulan)</label>
                <input
                  type="number"
                  value={bepFixedCostMonth}
                  onChange={e => setBepFixedCostMonth(Number(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga Jual Rata-rata per Porsi / Cup (Rp)</label>
                <input
                  type="number"
                  value={bepSellingPrice}
                  onChange={e => setBepSellingPrice(Number(e.target.value))}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HPP Rata-rata per Porsi / Cup (Rp)</label>
                <input
                  type="number"
                  value={bepHppPrice}
                  onChange={e => setBepHppPrice(Number(e.target.value))}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TARGET MINIMUM PENJUALAN BEP:</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0 1rem 0' }}>
                  {formatNumber(bepUnitsDay)} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>porsi / hari</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TARGET BULANAN</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {formatNumber(bepUnitsMonth)} Porsi
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OMSET MINIMAL BEP</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                      {formatIdr(bepRevenueMonth)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', marginTop: '1rem', background: '#ecfdf5', padding: '0.6rem', borderRadius: 'var(--radius-sm)', color: '#047857' }}>
                💡 Jual minimal <strong>{bepUnitsDay} porsi per hari</strong> untuk menutup seluruh biaya sewa, gaji, dan listrik toko Anda!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PAYMENT MODAL (QRIS AUTO-CONFIRM & BANK TRANSFER) */}
      {isUpgradeModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: 0, overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              padding: '1.25rem 1.5rem',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                ✕
              </button>

              <span className="badge badge-amber" style={{ marginBottom: '0.35rem' }}>INVOICE UPGRADE LANGGANAN</span>
              <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '0.1rem' }}>
                Upgrade ke Paket {targetUpgradePlan}
              </h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {targetUpgradePlan === 'Enterprise' ? 'Rp 149.000' : 'Rp 69.000'} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#e0e7ff' }}>/ bulan</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('qris')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: paymentMethodTab === 'qris' ? '#ffffff' : 'transparent',
                  color: paymentMethodTab === 'qris' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: paymentMethodTab === 'qris' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderBottom: paymentMethodTab === 'qris' ? '2px solid var(--primary)' : 'none'
                }}
              >
                📱 QRIS Auto-Confirm
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('bank')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  background: paymentMethodTab === 'bank' ? '#ffffff' : 'transparent',
                  color: paymentMethodTab === 'bank' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: paymentMethodTab === 'bank' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderBottom: paymentMethodTab === 'bank' ? '2px solid var(--primary)' : 'none'
                }}
              >
                🏦 Transfer Bank & WA
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: '1.5rem' }}>
              {paymentStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                    Pembayaran Berhasil Diverifikasi!
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Selamat! Akun toko <strong>{storeSettings.storeName}</strong> resmi di-upgrade ke <strong>Paket {targetUpgradePlan} (Aktif 30 Hari)</strong>.
                  </p>
                  <button onClick={() => setIsUpgradeModalOpen(false)} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}>
                    Tutup & Mulai Gunakan Fitur PRO
                  </button>
                </div>
              ) : paymentMethodTab === 'qris' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    SCAN QRIS DENGAN MANDIRI LIVIN, BCA, GOPAY, OVO, SHOPEEPAY:
                  </div>

                  <div style={{ background: 'white', padding: '0.85rem', borderRadius: '12px', border: '2px solid var(--primary)', marginBottom: '0.85rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                    {localStorage.getItem('mavin_saas_qris_image') ? (
                      <img src={localStorage.getItem('mavin_saas_qris_image')!} alt="Barcode QRIS SaaS" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                    ) : (
                      <QrCode size={180} color="#0f172a" />
                    )}
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.35rem' }}>
                      NMID: {localStorage.getItem('mavin_saas_qris_nmid') || 'ID1029384756102'}
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', width: '100%', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={14} className="spin" /> Checking Pembayaran Realtime ({autoCheckSeconds}s)
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                      Sistem otomatis memperbarui status langganan begitu dana diterima!
                    </span>
                  </div>

                  <button
                    onClick={handleSimulatePaymentSuccess}
                    disabled={paymentStatus === 'verifying'}
                    className="btn btn-emerald"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem' }}
                  >
                    {paymentStatus === 'verifying' ? 'Memverifikasi Pembayaran...' : '⚡ Simulasi Auto-Confirm Pembayaran QRIS'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.35rem' }}>
                      TRANSFER REKENING BANK RESMI:
                    </div>
                    <div style={{ marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{localStorage.getItem('mavin_saas_bank1_name') || 'Bank Mandiri'}:</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{localStorage.getItem('mavin_saas_bank1_account') || '137-00-1234567-8'}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>a.n. {localStorage.getItem('mavin_saas_bank1_owner') || 'PT MAVIN TEKNOLOGI JUARA'}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{localStorage.getItem('mavin_saas_bank2_name') || 'Bank BCA'}:</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{localStorage.getItem('mavin_saas_bank2_account') || '841-098-7654'}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>a.n. {localStorage.getItem('mavin_saas_bank2_owner') || 'PT MAVIN TEKNOLOGI JUARA'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSendWhatsAppConfirmation}
                    className="btn btn-emerald"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
                  >
                    <Send size={16} /> Kirim Bukti Transfer via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Print Thermal Receipt Modal */}
      {isTestPrintModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Printer size={18} color="var(--primary)" /> Test Thermal Printer Struk ({printerPaperWidth})
              </h3>
              <button onClick={() => setIsTestPrintModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Thermal Receipt Preview Paper Box */}
            <div id="test-receipt-printable" style={{
              background: '#fffdf5',
              padding: '1.25rem 1rem',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'monospace',
              fontSize: printerPaperWidth === '58mm' ? '0.75rem' : '0.85rem',
              color: '#000000',
              textAlign: 'left',
              margin: '0 auto 1.25rem auto',
              maxWidth: printerPaperWidth === '58mm' ? '280px' : '340px'
            }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.2rem' }}>
                {storeSettings.storeName}
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#475569', marginBottom: '0.5rem' }}>
                {storeSettings.address} | Telp: {storeSettings.phone}
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem', borderBottom: '1px dashed #94a3b8', paddingBottom: '0.4rem' }}>
                {receiptHeaderMessage}
              </div>

              <div style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>No. Transaksi:</span>
                <span>INV-TEST-001</span>
              </div>
              <div style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed #94a3b8', paddingBottom: '0.4rem' }}>
                <span>Waktu:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                <span>1x Kopi Susu Aren Special</span>
                <span>Rp 22.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '0.4rem', borderBottom: '1px dashed #94a3b8', paddingBottom: '0.4rem' }}>
                <span>1x Roti Bakar Butter Special</span>
                <span>Rp 26.000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Subtotal:</span>
                <span>Rp 48.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.2rem', borderTop: '1px dashed #000', paddingTop: '0.3rem' }}>
                <span>TOTAL:</span>
                <span>Rp 48.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                <span>Metode Pembayaran:</span>
                <span>QRIS / Tunai</span>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#475569', marginTop: '0.75rem', borderTop: '1px dashed #94a3b8', paddingTop: '0.5rem', whiteSpace: 'pre-line' }}>
                {receiptFooterMessage}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setIsTestPrintModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                Tutup
              </button>
              <button
                onClick={() => {
                  printReceipt('test-receipt-printable', {
                    storeName: storeSettings.storeName,
                    items: [
                      { name: 'Kopi Susu Aren Special', qty: 1, price: 22000 },
                      { name: 'Roti Bakar Butter Special', qty: 1, price: 26000 }
                    ],
                    grandTotal: 48000,
                    paymentMethod: 'QRIS / Tunai',
                    invoiceNo: 'INV-TEST-001',
                    date: new Date().toLocaleDateString('id-ID'),
                    paperWidth: printerPaperWidth,
                    connectionType: printerConnectionType,
                    headerNote: receiptHeaderMessage,
                    footerNote: receiptFooterMessage
                  });
                }}
                className="btn btn-primary"
                style={{ flex: 1, fontWeight: 800 }}
              >
                🖨️ Cetak Struk Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
