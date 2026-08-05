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

  const allNavItems: { id: NavTab; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Beranda', icon: <LayoutDashboard size={20} /> },
    { id: 'ingredients', label: 'Bahan Baku', shortLabel: 'Stok', icon: <Boxes size={20} />, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'purchases', label: 'Kulakan / Restock', shortLabel: 'Kulakan', icon: <ShoppingCart size={20} /> },
    { id: 'recipes', label: 'Resep & HPP', shortLabel: 'Resep', icon: <ChefHat size={20} /> },
    { id: 'production', label: 'Produksi Batch', shortLabel: 'Produksi', icon: <Factory size={20} /> },
    { id: 'pos', label: 'Kasir (POS)', shortLabel: 'Kasir', icon: <Store size={20} /> },
    { id: 'reports', label: 'Laporan & Profit', shortLabel: 'Laporan', icon: <FileBarChart size={20} /> },
    { id: 'settings', label: 'Pengaturan SaaS', shortLabel: 'Setting', icon: <Settings size={20} /> },
    { id: 'saas_admin', label: 'Portal Admin SaaS', shortLabel: 'Master', icon: <Crown size={20} /> },
  ];

  // Filter items dynamically based on currentRole and customizable rolePermissions!
  const navItems = allNavItems.filter(item => hasTabAccess(currentRole, item.id));
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* 1. Mobile Top Header Bar */}
      <header className="mobile-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: storeSettings.primaryColor || 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}>
            {renderLogo(20)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', lineHeight: '1.1', color: storeSettings.primaryColor || 'var(--primary)', letterSpacing: '0.01em' }}>
              {storeSettings.storeName.split(' ')[0] || 'MAVIN'}
            </h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {currentRole === 'saas_admin' ? '👑 Master Admin' : currentRole === 'owner' ? '🏢 Pemilik' : currentRole === 'manager' ? '👨‍🍳 Dapur' : '🛒 Kasir'}
            </span>
          </div>
        </div>

        {/* Quick Role Switcher Mobile */}
        <select
          value={currentRole}
          onChange={e => setCurrentRole(e.target.value as UserRole)}
          className="form-control"
          style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}
        >
          <option value="owner">🏢 Pemilik Toko</option>
          <option value="manager">👨‍🍳 Staf Dapur</option>
          <option value="cashier">🛒 Staf Kasir</option>
          <option value="saas_admin">👑 Master Admin SaaS</option>
        </select>
      </header>

      {/* 2. Desktop Sidebar Component */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: storeSettings.primaryColor || 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {renderLogo(24)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ fontSize: '1.15rem', lineHeight: '1.1', color: storeSettings.primaryColor || 'var(--primary)', letterSpacing: '0.02em', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                MAVIN
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {storeSettings.storeName}
              </span>
            </div>
          </div>

          {/* Cleaned Role Switcher Widget Box */}
          <div style={{ background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserCheck size={12} /> HAK AKSES PERAN:
            </div>
            <select
              value={currentRole}
              onChange={e => {
                const newRole = e.target.value as UserRole;
                setCurrentRole(newRole);
                if (newRole === 'cashier') setActiveTab('pos');
                else if (newRole === 'manager') setActiveTab('recipes');
                else if (newRole === 'saas_admin') setActiveTab('saas_admin');
                else setActiveTab('dashboard');
              }}
              className="form-control"
              style={{
                padding: '0.4rem 0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                width: '100%',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="owner">👑 Pemilik Toko</option>
              <option value="manager">👨‍🍳 Staf Dapur</option>
              <option value="cashier">🛒 Staf Kasir</option>
              <option value="saas_admin">🌐 Master Admin SaaS</option>
            </select>
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
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? (storeSettings.primaryColor || 'var(--primary)') : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
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
