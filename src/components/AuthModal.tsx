import React, { useState, useEffect } from 'react';
import {
  Award,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess
}) => {
  const { setCurrentRole, storeSettings, staffUsers } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Production Security: All fields default to empty strings!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [storeNameInput, setStoreNameInput] = useState('');
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Reset form inputs every time the modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setStoreNameInput('');
      setOwnerNameInput('');
      setPhoneInput('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Production Automatic Role Resolution based on Email
    const cleanEmail = email.trim().toLowerCase();
    let assignedRole: UserRole = 'owner';

    // 1. Check if email matches SaaS Super Admin
    if (cleanEmail === 'admin@mavin.id' || cleanEmail.includes('admin')) {
      assignedRole = 'saas_admin';
    } 
    // 2. Check registered staff users list in AppContext
    else {
      const foundStaff = staffUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (foundStaff) {
        assignedRole = foundStaff.role;
      } else if (cleanEmail.includes('dapur')) {
        assignedRole = 'manager';
      } else if (cleanEmail.includes('kasir')) {
        assignedRole = 'cashier';
      } else {
        assignedRole = 'owner';
      }
    }

    setCurrentRole(assignedRole);
    onLoginSuccess(assignedRole);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '430px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Production Header Banner */}
        <div style={{
          background: storeSettings.primaryColor || 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          padding: '1.5rem 1.5rem',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
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
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.5rem auto',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <Award size={28} />
          </div>

          <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '0.15rem' }}>
            MAVIN SaaS
          </h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            {mode === 'login' ? 'Masuk ke Platform MAVIN' : 'Daftar Akun UMKM Baru (Free 14-Day Trial)'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : 'none'
            }}
          >
            🔑 Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : 'none'
            }}
          >
            🚀 Daftar Baru (Register)
          </button>
        </div>

        {/* Scrollable Clean Form Body */}
        <div style={{ padding: '1.35rem', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mode === 'register' && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Usaha / Toko *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kopi Susu Senja"
                    value={storeNameInput}
                    onChange={e => setStoreNameInput(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Pemilik Usaha *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pak Budi"
                    value={ownerNameInput}
                    onChange={e => setOwnerNameInput(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor WhatsApp Aktif *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-XXXX-XXXX"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alamat Email *</label>
              <input
                type="email"
                required
                placeholder="nama@toko.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kata Sandi (Password) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.35rem', fontSize: '0.95rem', fontWeight: 800 }}
            >
              {mode === 'login' ? 'Masuk Sekarang' : 'Daftar & Mulai Trial 14 Hari'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Clean Production Footer Info */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Butuh bantuan? Hubungi Support MAVIN di </span>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              WhatsApp 24/7
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
