import React, { useEffect, useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { IngredientsView } from './components/IngredientsView';
import { PurchasesView } from './components/PurchasesView';
import { RecipesView } from './components/RecipesView';
import { ProductionView } from './components/ProductionView';
import { PosView } from './components/PosView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { SaasAdminView } from './components/SaasAdminView';
import { LandingPageView } from './components/LandingPageView';
import { AuthModal } from './components/AuthModal';
import { UserRole } from './types';
import { Lock, Award, ShieldAlert, ArrowRight } from 'lucide-react';

export function AppContent() {
  // Strict Authentication Guard State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mavin_is_logged_in') === 'true';
  });

  // Detect Capacitor Native Android Platform
  const isNativeApk =
    Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
    Boolean((window as any).Capacitor?.getPlatform?.() === 'android') ||
    Boolean((window as any).Capacitor?.platform === 'android');

  // Preserve session on page refresh (don't log out or return to landing page on refresh!)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    if (isNativeApk || localStorage.getItem('mavin_is_logged_in') === 'true') {
      return 'app';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { currentRole, setCurrentRole, hasTabAccess, storeSettings } = useApp();

  useEffect(() => {
    if (isNativeApk) {
      setViewMode('app');
      if (!isLoggedIn) {
        setIsAuthOpen(true);
      }
    } else if (isLoggedIn) {
      setViewMode('app');
    }
  }, [isNativeApk, isLoggedIn]);

  // Dynamically update primary color and background theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const color = storeSettings.primaryColor || '#4f46e5';
    root.style.setProperty('--primary', color);
    root.style.setProperty('--primary-hover', color);
    root.style.setProperty('--primary-light', `${color}15`);
    root.style.setProperty('--border-color-focus', color);

    const bgTheme = storeSettings.appBackground || 'slate';
    document.body.className = `bg-theme-${bgTheme}`;
  }, [storeSettings.primaryColor, storeSettings.appBackground]);

  // Role permissions map
  const allowedTabs: { [role: string]: NavTab[] } = {
    saas_admin: ['saas_admin', 'dashboard', 'settings'],
    owner: ['dashboard', 'ingredients', 'purchases', 'recipes', 'production', 'pos', 'reports', 'settings'],
    manager: ['ingredients', 'purchases', 'recipes', 'production'],
    cashier: ['pos']
  };

  // Redirect to permitted tab if activeTab is not allowed
  useEffect(() => {
    if (!isLoggedIn) return;
    const permitted = allowedTabs[currentRole] || allowedTabs.owner;
    if (!permitted.includes(activeTab)) {
      if (currentRole === 'cashier') {
        setActiveTab('pos');
      } else if (currentRole === 'manager') {
        setActiveTab('recipes');
      } else if (currentRole === 'saas_admin') {
        setActiveTab('saas_admin');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, activeTab, isLoggedIn]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (role: UserRole) => {
    setIsLoggedIn(true);
    localStorage.setItem('mavin_is_logged_in', 'true');
    setCurrentRole(role);
    setViewMode('app');
    setIsAuthOpen(false);

    if (role === 'saas_admin') {
      setActiveTab('saas_admin');
    } else if (role === 'cashier') {
      setActiveTab('pos');
    } else if (role === 'manager') {
      setActiveTab('recipes');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem('mavin_is_logged_in');
    setCurrentRole('owner');

    if (isNativeApk) {
      setViewMode('app');
      setIsAuthOpen(true);
    } else {
      setViewMode('landing');
      setIsAuthOpen(false);
    }
  }, [isNativeApk, setCurrentRole]);

  // -----------------------------------------------------------------
  // ⏱️ 5-MINUTE INACTIVITY AUTO LOGOUT TIMER
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert('🔒 Sesi Anda telah berakhir karena tidak ada aktivitas selama 5 menit. Silakan login kembali untuk melanjutkan.');
        handleLogout();
      }, INACTIVITY_LIMIT_MS);
    };

    // User activity listeners
    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

    // Initialize timer on mount or login
    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [isLoggedIn, handleLogout]);

  // 1. Landing Page View (Web Only when NOT Logged In)
  if (viewMode === 'landing' && !isNativeApk && !isLoggedIn) {
    return (
      <>
        <LandingPageView
          onOpenAuth={handleOpenAuth}
          onEnterApp={(role) => {
            handleLoginSuccess(role);
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => {
            if (!isLoggedIn) {
              setIsAuthOpen(false);
            }
          }}
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          allowClose={true}
        />
      </>
    );
  }

  // 2. UNAUTHENTICATED MANDATORY LOGIN SCREEN (APK / Web Direct App Access)
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
          }}>
            <Award size={36} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            MAVIN SaaS POS
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Aplikasi Manajemen & Kasir UMKM Juara. Silakan login untuk mengelola toko Anda.
          </p>
        </div>

        <button
          onClick={() => handleOpenAuth('login')}
          className="btn btn-primary"
          style={{
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <Lock size={20} /> Masuk Ke Akun Toko <ArrowRight size={20} />
        </button>

        {/* Mandatory Auth Modal (No Close Button when Unauthenticated!) */}
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
          allowClose={!isNativeApk && isLoggedIn}
        />
      </div>
    );
  }

  // 3. AUTHENTICATED APP WORKSPACE (Preserved on Refresh!)
  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLanding={() => setViewMode('landing')}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'saas_admin' && currentRole === 'saas_admin' && <SaasAdminView />}
        {activeTab === 'dashboard' && hasTabAccess(currentRole, 'dashboard') && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'ingredients' && hasTabAccess(currentRole, 'ingredients') && <IngredientsView />}
        {activeTab === 'purchases' && hasTabAccess(currentRole, 'purchases') && <PurchasesView />}
        {activeTab === 'recipes' && hasTabAccess(currentRole, 'recipes') && <RecipesView />}
        {activeTab === 'production' && hasTabAccess(currentRole, 'production') && <ProductionView />}
        {activeTab === 'pos' && hasTabAccess(currentRole, 'pos') && <PosView />}
        {activeTab === 'reports' && hasTabAccess(currentRole, 'reports') && <ReportsView />}
        {activeTab === 'settings' && hasTabAccess(currentRole, 'settings') && <SettingsView setActiveTab={setActiveTab} />}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        allowClose={true}
      />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
export default App;
