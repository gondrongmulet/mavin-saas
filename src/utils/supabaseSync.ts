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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tenant_accounts?select=*`, {
      method: 'GET',
      headers: HEADERS
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('mavin_tenants_v5', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn('Supabase cloud fetch fallback to local:', e);
  }
  const saved = localStorage.getItem('mavin_tenants_v5');
  return saved ? JSON.parse(saved) : [];
}

export async function syncCloudTenantSave(tenant: TenantAccount): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tenant_accounts`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(tenant)
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
