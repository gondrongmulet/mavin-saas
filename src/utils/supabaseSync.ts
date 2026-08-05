import { TenantAccount } from '../types';

const JSONBLOB_CLOUD_URL = 'https://jsonblob.com/api/jsonBlob/019fd236-7dda-7667-b4ad-7913f0ef8bf6';

// 1. Tenant Accounts Realtime Cloud Sync
export async function syncCloudTenantsFetch(): Promise<TenantAccount[]> {
  const localSaved = localStorage.getItem('mavin_tenants_v5');
  let list: TenantAccount[] = localSaved ? JSON.parse(localSaved) : [];

  try {
    const res = await fetch(JSONBLOB_CLOUD_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const cloudData = await res.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        cloudData.forEach((c: TenantAccount) => {
          if (c.email && !list.some(l => l.email.trim().toLowerCase() === c.email.trim().toLowerCase())) {
            list.push(c);
          }
        });
        localStorage.setItem('mavin_tenants_v5', JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn('JsonBlob cloud fetch warning:', e);
  }

  // Merging registered users
  const regUsersStr = localStorage.getItem('mavin_registered_users');
  if (regUsersStr) {
    try {
      const regUsers = JSON.parse(regUsersStr);
      regUsers.forEach((u: any) => {
        if (u.email && u.email !== 'admin@mavin.id' && !list.some(t => t.email.trim().toLowerCase() === u.email.trim().toLowerCase())) {
          list.push({
            id: `TNT-REG-${Date.now()}`,
            storeName: u.storeName || `Toko ${u.ownerName || 'UMKM'}`,
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

  localStorage.setItem('mavin_tenants_v5', JSON.stringify(list));
  return list;
}

export async function syncCloudTenantSave(tenant: TenantAccount): Promise<void> {
  const localSaved = localStorage.getItem('mavin_tenants_v5');
  let currentList: TenantAccount[] = localSaved ? JSON.parse(localSaved) : [];

  if (!currentList.some(t => t.email.trim().toLowerCase() === tenant.email.trim().toLowerCase())) {
    currentList.push(tenant);
    localStorage.setItem('mavin_tenants_v5', JSON.stringify(currentList));
  }

  try {
    // 1. Fetch current cloud list
    const res = await fetch(JSONBLOB_CLOUD_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let cloudList: TenantAccount[] = [];
    if (res.ok) {
      const parsed = await res.json();
      if (Array.isArray(parsed)) cloudList = parsed;
    }

    if (!cloudList.some(t => t.email.trim().toLowerCase() === tenant.email.trim().toLowerCase())) {
      cloudList.push(tenant);
    }

    // 2. PUT updated array to Realtime Cloud DB
    await fetch(JSONBLOB_CLOUD_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cloudList)
    });
  } catch (e) {
    console.warn('JsonBlob cloud save error:', e);
  }
}

// 2. Registered Users Cloud Sync
export async function syncCloudUsersFetch(): Promise<any[]> {
  const saved = localStorage.getItem('mavin_registered_users');
  return saved ? JSON.parse(saved) : [];
}

export async function syncCloudUserSave(user: any): Promise<void> {
  const registeredUsers = JSON.parse(localStorage.getItem('mavin_registered_users') || '[]');
  if (!registeredUsers.some((u: any) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase())) {
    registeredUsers.push(user);
    localStorage.setItem('mavin_registered_users', JSON.stringify(registeredUsers));
  }
}
