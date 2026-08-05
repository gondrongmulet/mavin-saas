import { TenantAccount } from '../types';

const SUPABASE_URL = 'https://ppqejdloowbzngfcsdqd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcWVqZGxvb3diem5nZmNzZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MTU5MjQsImV4cCI6MjEwMTQ5MTkyNH0.1L2Qi_v7M8syvOO4f_hIh0NEg4eRR-ngiMdD8FDjPc4';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
};

// 1. Tenant Accounts Cloud Sync
export async function syncCloudTenantsFetch(): Promise<TenantAccount[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=*`, {
      method: 'GET',
      headers: HEADERS
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted: TenantAccount[] = data.map((t: any) => ({
          id: t.id || `TNT-${t.email}`,
          storeName: t.store_name || t.storeName || 'Toko UMKM',
          ownerName: t.owner_name || t.ownerName || 'Pemilik Toko',
          email: t.email,
          phone: t.phone || '',
          plan: t.plan || 'Pro',
          status: t.status || 'Aktif',
          expiryDate: t.expiry_date || '2026-12-31',
          monthlyFee: t.plan === 'Enterprise' ? 149000 : 69000,
          outletCount: 1,
          registerDate: t.created_at ? t.created_at.split('T')[0] : '2026-08-05'
        }));
        localStorage.setItem('mavin_tenants_v5', JSON.stringify(formatted));
        return formatted;
      }
    }
  } catch (e) {
    console.warn('Supabase cloud fetch fallback:', e);
  }

  const saved = localStorage.getItem('mavin_tenants_v5');
  const regUsersStr = localStorage.getItem('mavin_registered_users');
  let list: TenantAccount[] = saved ? JSON.parse(saved) : [];

  if (regUsersStr) {
    try {
      const regUsers = JSON.parse(regUsersStr);
      regUsers.forEach((u: any) => {
        if (u.email && u.email !== 'admin@mavin.id' && !list.some(t => t.email.trim().toLowerCase() === u.email.trim().toLowerCase())) {
          list.push({
            id: `TNT-REG-${Date.now()}`,
            storeName: u.storeName || 'Toko UMKM',
            ownerName: u.ownerName || 'Pemilik Toko',
            email: u.email,
            phone: u.phone || '08123456789',
            plan: 'Pro',
            status: 'Aktif',
            expiryDate: '2026-12-31',
            monthlyFee: 69000,
            outletCount: 1,
            registerDate: new Date().toISOString().split('T')[0]
          });
        }
      });
    } catch (e) {}
  }

  return list;
}

export async function syncCloudTenantSave(tenant: TenantAccount): Promise<void> {
  try {
    const payload = {
      store_name: tenant.storeName,
      owner_name: tenant.ownerName,
      email: tenant.email,
      phone: tenant.phone,
      plan: tenant.plan,
      status: tenant.status
    };

    await fetch(`${SUPABASE_URL}/rest/v1/tenants`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Supabase cloud save error:', e);
  }
}

// 2. Registered Users Cloud Sync
export async function syncCloudUsersFetch(): Promise<any[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/registered_users?select=*`, {
      method: 'GET',
      headers: HEADERS
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('mavin_registered_users', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn('Supabase cloud fetch fallback to local:', e);
  }
  const saved = localStorage.getItem('mavin_registered_users');
  return saved ? JSON.parse(saved) : [];
}

export async function syncCloudUserSave(user: any): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/registered_users`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(user)
    });
  } catch (e) {
    console.warn('Supabase cloud save user error:', e);
  }
}
