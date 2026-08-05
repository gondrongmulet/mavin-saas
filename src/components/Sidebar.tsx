import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  ChefHat,
  Factory,
  Store,
  FileBarChart,
  Settings,
  RotateCcw,
  Download,
  AlertTriangle,
  Award,
  UserCheck,
  Crown,
  Coffee,
  ShoppingBag,
  Utensils,
  Globe,
  LogOut,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export type NavTab = 'dashboard' | 'ingredients' | 'purchases' | 'recipes' | 'production' | 'pos' | 'reports' | 'settings' | 'saas_admin';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenLanding?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onOpenLanding, onLogout }) => {
  const { ingredients, resetToSampleData, exportDataJson, currentRole, setCurrentRole, storeSettings, hasTabAccess } = useApp();

  const lowStockCount = ingredients.filter(i => i.stock <= i.minStock).length;

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/MAVIN_SaaS_v2.4_Installer.apk';
    link.download = 'MAVIN_SaaS_v2.4_Installer.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper render logo (preset icon or custom uploaded image)
  const renderLogo = (size = 24) => {
    if (storeSettings.logoType === 'custom' && storeSettings.customLogoUrl) {
      return (
        <img
          src={storeSettings.customLogoUrl}
          alt="Logo Toko"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
        />
      );
    }

    switch (storeSettings.logoIcon) {
      case 'Coffee': return <Coffee size={size} />;
      case 'ChefHat': return <ChefHat size={size} />;
      case 'Store': return <Store size={size} />;
      case 'ShoppingBag': return <ShoppingBag size={size} />;
      case 'Utensils': return <Utensils size={size} />;
      case 'Award':
      default: return <Award size={size} />;
    }
  };

  // Distinct Navigation items based on role!
  const storeNavItems: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard Toko', shortLabel: 'Beranda', icon: <LayoutDashboard size={20} /> },
    { id: 'ingredients', label: 'Bahan Baku', shortLabel: 'Stok', icon: <Boxes size={20} />, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'purchases', label: 'Kulakan / Restock', shortLabel: 'Kulakan', icon: <ShoppingCart size={20} /> },
    { id: 'recipes', label: 'Resep & HPP', shortLabel: 'Resep', icon: <ChefHat size={20} /> },
    { id: 'production', label: 'Produksi Batch', shortLabel: 'Produksi', icon: <Factory size={20} /> },
    { id: 'pos', label: 'Kasir (POS)', shortLabel: 'Kasir', icon: <Store size={20} /> },
    { id: 'reports', label: 'Laporan & Profit', shortLabel: 'Laporan', icon: <FileBarChart size={20} /> },
    { id: 'settings', label: 'Pengaturan Toko', shortLabel: 'Setting', icon: <Settings size={20} /> },
  ];

  const saasAdminNavItems: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'saas_admin', label: '👑 Portal Admin SaaS', shortLabel: 'Master', icon: <Crown size={20} /> },
    { id: 'dashboard', label: '📊 Ringkasan Platform', shortLabel: 'Beranda', icon: <LayoutDashboard size={20} /> },
    { id: 'settings', label: '⚙️ Konfigurasi Sistem', shortLabel: 'Setting', icon: <Settings size={20} /> },
  ];

  // Select navigation list cleanly
  const rawNavItems = currentRole === 'saas_admin' ? saasAdminNavItems : storeNavItems;
  const navItems = rawNavItems.filter(item => hasTabAccess(currentRole, item.id));
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* 1. Mobile Top Header Bar */}
      <header className="mobile-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: currentRole === 'saas_admin' ? '#312e81' : (storeSettings.primaryColor || 'var(--primary)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {currentRole === 'saas_admin' ? <Crown size={18} /> : renderLogo(18)}
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', lineHeight: '1.1', color: currentRole === 'saas_admin' ? '#312e81' : (storeSettings.primaryColor || 'var(--primary)'), letterSpacing: '0.01em' }}>
              {currentRole === 'saas_admin' ? 'MAVIN SaaS' : storeSettings.storeName.split(' ')[0]}
            </h2>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {currentRole === 'saas_admin' ? '👑 Master Admin' : currentRole === 'owner' ? '🏢 Pemilik' : currentRole === 'manager' ? '👨‍🍳 Dapur' : '🛒 Kasir'}
            </span>
          </div>
        </div>

        {/* Mobile Header Logout & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-outline"
              style={{
                fontSize: '0.72rem',
                padding: '0.35rem 0.6rem',
                color: 'var(--accent-rose)',
                borderColor: '#fca5a5',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <LogOut size={13} /> Keluar
            </button>
          )}
        </div>
      </header>

      {/* 2. Desktop Sidebar Component */}
      <aside className="sidebar" style={{ background: currentRole === 'saas_admin' ? '#f5f3ff' : '#ffffff' }}>
        {/* Brand Header */}
        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: currentRole === 'saas_admin' ? '#4338ca' : (storeSettings.primaryColor || 'var(--primary)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {currentRole === 'saas_admin' ? <Crown size={24} /> : renderLogo(24)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '1.15rem', lineHeight: '1.1', color: currentRole === 'saas_admin' ? '#312e81' : (storeSettings.primaryColor || 'var(--primary)'), letterSpacing: '0.02em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentRole === 'saas_admin' ? 'MAVIN SaaS' : 'MAVIN'}
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentRole === 'saas_admin' ? 'Platform Control Panel' : storeSettings.storeName}
              </span>
            </div>
          </div>

          {/* Role Status Badge Box */}
          <div style={{
            background: currentRole === 'saas_admin' ? '#e0e7ff' : '#f8fafc',
            padding: '0.5rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            border: currentRole === 'saas_admin' ? '1px solid #c7d2fe' : '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.68rem', color: currentRole === 'saas_admin' ? '#3730a3' : 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserCheck size={12} /> HAK AKSES PERAN AKTIF:
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: currentRole === 'saas_admin' ? '#4338ca' : 'var(--text-main)', marginTop: '0.15rem' }}>
              {currentRole === 'saas_admin' ? '👑 Master Admin SaaS Platform' : currentRole === 'owner' ? '🏢 Pemilik Toko (Owner)' : currentRole === 'manager' ? '👨‍🍳 Staf Dapur' : '🛒 Staf Kasir'}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? (currentRole === 'saas_admin' ? '#ddd6fe' : 'var(--primary-light)') : 'transparent',
                  color: isActive ? (currentRole === 'saas_admin' ? '#4c1d95' : (storeSettings.primaryColor || 'var(--primary)')) : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="badge badge-rose" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                    <AlertTriangle size={12} /> {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Utilities & APK Link */}
        <div style={{ padding: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#fafafa' }}>
          <button
            onClick={handleDownloadApk}
            className="btn btn-emerald"
            style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', fontWeight: 700 }}
          >
            <Smartphone size={14} /> Download APK Android
          </button>

          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', color: 'var(--primary)', borderColor: 'var(--border-color-focus)' }}
            >
              <Globe size={14} /> Lihat Landing Page SaaS
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', color: 'var(--accent-rose)', borderColor: '#fca5a5' }}
            >
              <LogOut size={14} /> Keluar (Logout)
            </button>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.2rem' }}>
            <button
              onClick={exportDataJson}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.35rem', color: 'var(--text-muted)' }}
              title="Backup Data JSON"
            >
              <Download size={12} /> Backup
            </button>

            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengembalikan data sampel awal MAVIN? Data kustom Anda akan ter-reset.')) {
                  resetToSampleData();
                }
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.35rem', color: 'var(--text-muted)' }}
              title="Reset Data Sampel"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Mobile Bottom Sticky Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.shortLabel}</span>
              {item.badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '25%',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-rose)'
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
