import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  Zap,
  ArrowRight,
  Boxes,
  ChefHat,
  Factory,
  Store,
  FileBarChart,
  ShieldCheck,
  Calculator,
  MessageSquare,
  Sparkles,
  Users,
  Check,
  Star,
  Smartphone,
  Download,
  QrCode,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIdr } from '../utils/calculator';
import { UserRole } from '../types';

interface LandingPageViewProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterApp: (role: UserRole) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenAuth, onEnterApp }) => {
  const { storeSettings } = useApp();

  // Interactive Mini HPP Calculator Demo on Landing Page
  const [demoCoffeePrice, setDemoCoffeePrice] = useState(220000); // Rp 220rb/kg
  const [demoMilkPrice, setDemoMilkPrice] = useState(18000); // Rp 18rb/liter
  const [demoSellingPrice, setDemoSellingPrice] = useState(22000);

  // Calculated demo values
  const coffeeCost = (demoCoffeePrice / 1000) * 18; // 18g
  const milkCost = (demoMilkPrice / 1000) * 120; // 120ml
  const overheadCost = 1500; // Cup + Sedotan + Listrik
  const totalHpp = Math.round(coffeeCost + milkCost + overheadCost);
  const profit = demoSellingPrice - totalHpp;
  const marginPercent = Math.round((profit / demoSellingPrice) * 100);

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/MAVIN_SaaS_v2.4_Installer.apk';
    link.download = 'MAVIN_SaaS_v2.4_Installer.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: 'var(--text-main)' }}>
      {/* 1. Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: storeSettings.primaryColor || 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: storeSettings.primaryColor || 'var(--primary)', lineHeight: 1 }}>MAVIN</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Manajemen UMKM Juara</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleDownloadApk}
            className="btn btn-emerald"
            style={{ fontWeight: 700, fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
          >
            <Smartphone size={16} /> Download APK
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="btn btn-outline"
            style={{ fontWeight: 700 }}
          >
            Masuk
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            <Zap size={16} /> Coba Gratis 14 Hari
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <span className="badge badge-indigo" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} /> Instant Trial PRO 14 Hari • Otomatis ke Starter Gratis Selamanya
        </span>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
          Kelola Kulakan, Hitung <span style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '0 0.4rem', borderRadius: '8px' }}>HPP Otomatis</span>, Hingga POS Kasir dalam 1 Aplikasi
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          Tidak ada lagi tekor karena harga bahan naik! MAVIN menghitung ulang HPP resep saat kulakan, mengatur stok produksi batch, dan mengirim struk POS langsung ke WhatsApp pelanggan.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenAuth('register')}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem', fontWeight: 800 }}
          >
            Mulai Trial PRO 14 Hari <ArrowRight size={20} />
          </button>

          <button
            onClick={handleDownloadApk}
            className="btn btn-emerald"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1.05rem', fontWeight: 800 }}
          >
            <Smartphone size={20} /> Download APK Android
          </button>

          <button
            onClick={() => onEnterApp('owner')}
            className="btn btn-outline"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1.05rem', fontWeight: 700 }}
          >
            🚀 Demo Simulasi Toko
          </button>
        </div>
      </section>

      {/* 3. Android Mobile App Showcase Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '290px' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Smartphone size={14} /> Aplikasi Android POS Kasir & Tablet
            </span>
            <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              Gunakan MAVIN di Tablet Kasir & HP Android Anda
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Unduh installer `.APK` resmi untuk langsung dipasang pada HP Android staf dapur atau tablet kasir outlet tanpa perlu install dari PlayStore.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#334155', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #475569' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
              <QrCode size={64} color="#0f172a" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700 }}>SCAN / DOWNLOAD DIRECT:</div>
              <button
                onClick={handleDownloadApk}
                className="btn btn-emerald"
                style={{ marginTop: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                <Download size={16} /> Download APK (v2.4)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Dynamic Interactive HPP Calculator Showcase */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>⚡ SIMULASI INTERAKTIF</span>
            <h2>Coba Kalkulator HPP Otomatis MAVIN Di Sini!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Geser atau ubah harga bahan di bawah untuk melihat keajaiban kalkulasi HPP & margin otomatis:</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            {/* Left Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>📖 Resep: Kopi Susu Gula Aren</h3>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Biji Kopi Arabika (/kg)</span>
                  <span>{formatIdr(demoCoffeePrice)}</span>
                </div>
                <input
                  type="range"
                  min="150000"
                  max="350000"
                  step="10000"
                  value={demoCoffeePrice}
                  onChange={e => setDemoCoffeePrice(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Susu Fresh Milk (/liter)</span>
                  <span>{formatIdr(demoMilkPrice)}</span>
                </div>
                <input
                  type="range"
                  min="12000"
                  max="30000"
                  step="1000"
                  value={demoMilkPrice}
                  onChange={e => setDemoMilkPrice(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Harga Jual per Cup</span>
                  <span>{formatIdr(demoSellingPrice)}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="35000"
                  step="1000"
                  value={demoSellingPrice}
                  onChange={e => setDemoSellingPrice(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>

            {/* Right Live HPP Output */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>ESTIMASI HPP PER CUP:</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '0.2rem 0 1rem 0' }}>
                  {formatIdr(totalHpp)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LABA KOTOR / CUP</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {formatIdr(profit)}
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MARGIN PROFIT</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {marginPercent}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', marginTop: '1rem', background: '#ecfdf5', padding: '0.6rem', borderRadius: 'var(--radius-sm)', color: '#047857' }}>
                ✅ Setiap kali Anda mencatat kulakan baru, HPP seluruh resep di atas otomatis diperbarui oleh MAVIN!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core SaaS Features */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>Fitur Powerful & Enterprise untuk Pelaku Usaha</h2>
          <p style={{ color: 'var(--text-muted)' }}>Solusi lengkap mulai dari pembelian, produksi dapur, hingga kasir penjualan.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Boxes size={24} />
            </div>
            <h3>Stok & Weighted Average Cost (WAC)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Perhitungan harga pokok persediaan berbasis rata-rata tertimbang yang diperbarui otomatis saat kulakan dari supplier.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ChefHat size={24} />
            </div>
            <h3>Resep Yield Batch & Overhead Cost</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Susun resep per batch (misal 10 cup), alokasikan biaya cup + sedotan + gas, dan tentukan target harga jual berdasar margin profit.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Store size={24} />
            </div>
            <h3>POS Kasir & WA Direct Struk</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Kasir POS cepat dengan pendeteksi stok habis, kembalian tunai, pajak PB1, cetak nota, dan pengiriman nota transaksi via WhatsApp.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Factory size={24} />
            </div>
            <h3>Manajemen Produksi Batch</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Eksekusi produksi batch di dapur: stok bahan baku otomatis terpotong dan stok produk siap jual di kasir langsung bertambah.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Multi-Role RBAC & Multi-Outlet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Batasi akses staf kasir dan staf dapur secara terpisah, serta kelola banyak cabang outlet dalam satu akun Pemilik.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calculator size={24} />
            </div>
            <h3>Target BEP & Laporan Laba Bersih</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Kalkulator Break Even Point (BEP) harian/bulanan untuk menghitung berapa porsi minimal yang wajib terjual agar toko tidak rugi.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Subscription Pricing Table */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid var(--border-color)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Pilih Paket Langganan Hemat MAVIN SaaS</h2>
            <p style={{ color: 'var(--text-muted)' }}>Mulai dengan Trial PRO 14 Hari Gratis. Otomatis beralih ke Starter Gratis Selamanya jika tidak upgrade.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Starter Plan */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>🎁 Starter (Gratis Selamanya)</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rp 0 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ selamanya</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Paket otomatis saat masa Trial PRO 14 Hari selesai jika belum upgrade.</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> 1 Outlet Cabang</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Hingga 5 Resep Menu</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> POS Kasir Dasar</li>
                </ul>
              </div>

              <button onClick={() => onOpenAuth('register')} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Daftar & Pakai Starter
              </button>
            </div>

            {/* PRO Plan - Recommended */}
            <div className="card" style={{ border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-lg)' }}>
              <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--primary)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                PALING POPULER
              </span>

              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>⚡ Paket PRO (Trial 14 Hari)</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Rp 69.000 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ bulan</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Gratis Akses PRO 14 Hari Pertama Saat Mendaftar!</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Multi-Outlet (Hingga 3 Cabang)</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Resep & HPP WAC Otomatis Unlimited</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Produksi Batch Dapur</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>POS Kasir & WA Direct Struk</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> <strong>Matriks Hak Akses RBAC Staf</strong></li>
                </ul>
              </div>

              <button onClick={() => onOpenAuth('register')} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', fontWeight: 800 }}>
                Coba Akses PRO 14 Hari Gratis
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>🏆 Enterprise</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Rp 149.000 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ bulan</span></h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Untuk jaringan franchise / kemitraan skala besar.</p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Cabang Outlet Unlimited</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Custom White-Label Logo & Warna</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={16} color="#16a34a" /> Priority Support WA 24/7</li>
                </ul>
              </div>

              <button onClick={() => onOpenAuth('register')} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Daftar Paket Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 2rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.2rem' }}>MAVIN - Manajemen UMKM Juara</h3>
            <p style={{ fontSize: '0.8rem' }}>Solusi SaaS terintegrasi untuk bisnis kuliner & retail Indonesia.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', alignItems: 'center' }}>
            <button onClick={handleDownloadApk} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 700 }}>📱 Download APK</button>
            <button onClick={() => onOpenAuth('login')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>Masuk (Login)</button>
            <button onClick={() => onEnterApp('owner')} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>Demo Toko</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
