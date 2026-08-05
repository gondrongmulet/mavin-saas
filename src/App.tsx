import React, { useEffect, useState } from 'react';
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

export function AppContent() {
  // Public visitors default to the Landing Page!
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { currentRole, setCurrentRole, hasTabAccess, storeSettings } = useApp();

  // Dynamically update primary color and background theme CSS variables!
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
    saas_admin: ['saas_admin', 'dashboard', 'ingredients', 'purchases', 'recipes', 'production', 'pos', 'reports', 'settings'],
    owner: ['dashboard', 'ingredients', 'purchases', 'recipes', 'production', 'pos', 'reports', 'settings'],
    manager: ['ingredients', 'purchases', 'recipes', 'production'],
    cashier: ['pos']
  };

  // Smart Fallback Redirect: If activeTab is not allowed for currentRole, redirect automatically!
  useEffect(() => {
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
  }, [currentRole, activeTab]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (role: UserRole) => {
    setViewMode('app');
    if (role === 'cashier') setActiveTab('pos');
    else if (role === 'manager') setActiveTab('recipes');
    else if (role === 'saas_admin') setActiveTab('saas_admin');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    // Return to public Landing Page upon logout
    setViewMode('landing');
    setIsAuthOpen(false);
  };

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPageView
          onOpenAuth={handleOpenAuth}
          onEnterApp={(role) => {
            setCurrentRole(role);
            handleLoginSuccess(role);
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLanding={() => setViewMode('landing')}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'saas_admin' && (currentRole === 'saas_admin' || currentRole === 'owner') && <SaasAdminView />}
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
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
