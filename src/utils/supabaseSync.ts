import { TenantAccount } from '../types';

// ============================================================
// MAVIN SaaS - Realtime 2-Way Cloud Database Sync
// JsonBlob REST endpoints (free, no auth, full CRUD)
// ============================================================
const CLOUD_TENANTS_URL = 'https://jsonblob.com/api/jsonBlob/019fd236-7dda-7667-b4ad-7913f0ef8bf6';
const CLOUD_USERS_URL = 'https://jsonblob.com/api/jsonBlob/019fd23b-5ffc-77dd-9e13-8aa3d63c5643';
const CLOUD_STORE_DATA_URL = 'https://jsonblob.com/api/jsonBlob/019fd501-6e45-7c88-93d6-1b2f6c3dd140';

export interface StoreDataPayload {
  ingredients?: any[];
  recipes?: any[];
  purchases?: any[];
  productions?: any[];
  sales?: any[];
  storeSettings?: any;
}

// Helper: Get sanitized key for a store
function getStoreDataKey(): string {
  const sessionStr = localStorage.getItem('mavin_active_user_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.email && session.email.trim()) {
        return 'user_' + session.email.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
      }
      if (session.storeName && session.storeName.trim()) {
        return 'store_' + session.storeName.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
      }
    } catch (e) {}
  }
  const settingsStr = localStorage.getItem('mavin_store_settings');
  if (settingsStr) {
    try {
      const settings = JSON.parse(settingsStr);
      if (settings.storeName && settings.storeName.trim()) {
        return 'store_' + settings.storeName.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
      }
    } catch (e) {}
  }
  return 'global_mavin_store';
}

// Helper: merge two arrays by `id` field
function mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  (cloud || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
  (local || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
  return Array.from(map.values());
}

export async function syncCloudStoreDataFetch(): Promise<StoreDataPayload | null> {
  const storeKey = getStoreDataKey();
  if (!storeKey) return null;

  try {
    const res = await fetch(CLOUD_STORE_DATA_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;

    const allStoresData = await res.json();
    if (!allStoresData || typeof allStoresData !== 'object') return null;

    const cloudData: StoreDataPayload = allStoresData[storeKey];
    if (!cloudData) return null;

    // Merge with local data
    const localIngStr = localStorage.getItem('mavin_ingredients');
    const localRecStr = localStorage.getItem('mavin_recipes');
    const localPurStr = localStorage.getItem('mavin_purchases');
    const localProStr = localStorage.getItem('mavin_productions');
    const localSalStr = localStorage.getItem('mavin_sales');

    const mergedIngredients = mergeById(localIngStr ? JSON.parse(localIngStr) : [], cloudData.ingredients || []);
    const mergedRecipes = mergeById(localRecStr ? JSON.parse(localRecStr) : [], cloudData.recipes || []);
    const mergedPurchases = mergeById(localPurStr ? JSON.parse(localPurStr) : [], cloudData.purchases || []);
    const mergedProductions = mergeById(localProStr ? JSON.parse(localProStr) : [], cloudData.productions || []);
    const mergedSales = mergeById(localSalStr ? JSON.parse(localSalStr) : [], cloudData.sales || []);

    const mergedPayload: StoreDataPayload = {
      ingredients: mergedIngredients,
      recipes: mergedRecipes,
      purchases: mergedPurchases,
      productions: mergedProductions,
      sales: mergedSales,
      storeSettings: cloudData.storeSettings || (localStorage.getItem('mavin_store_settings') ? JSON.parse(localStorage.getItem('mavin_store_settings')!) : undefined)
    };

    // Save to local storage
    if (mergedIngredients.length > 0) localStorage.setItem('mavin_ingredients', JSON.stringify(mergedIngredients));
    if (mergedRecipes.length > 0) localStorage.setItem('mavin_recipes', JSON.stringify(mergedRecipes));
    if (mergedPurchases.length > 0) localStorage.setItem('mavin_purchases', JSON.stringify(mergedPurchases));
    if (mergedProductions.length > 0) localStorage.setItem('mavin_productions', JSON.stringify(mergedProductions));
    if (mergedSales.length > 0) localStorage.setItem('mavin_sales', JSON.stringify(mergedSales));

    // Push merged back to cloud
    allStoresData[storeKey] = mergedPayload;
    fetch(CLOUD_STORE_DATA_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(allStoresData)
    }).catch(e => console.warn('[CloudSync] Store data push back err:', e));

    return mergedPayload;
  } catch (e) {
    console.warn('[CloudSync] Store data fetch error:', e);
    return null;
  }
}

export async function syncCloudStoreDataSave(payload: StoreDataPayload): Promise<void> {
  const storeKey = getStoreDataKey();
  if (!storeKey) return;

  try {
    const res = await fetch(CLOUD_STORE_DATA_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let allStoresData: any = {};
    if (res.ok) {
      allStoresData = await res.json() || {};
    }

    const existingStore = allStoresData[storeKey] || {};

    // Smart merge: merge incoming payload items with existing cloud items so no device wipes out another's data
    const mergedPayload: StoreDataPayload = {
      ingredients: payload.ingredients !== undefined ? mergeById(existingStore.ingredients || [], payload.ingredients) : existingStore.ingredients,
      recipes: payload.recipes !== undefined ? mergeById(existingStore.recipes || [], payload.recipes) : existingStore.recipes,
      purchases: payload.purchases !== undefined ? mergeById(existingStore.purchases || [], payload.purchases) : existingStore.purchases,
      productions: payload.productions !== undefined ? mergeById(existingStore.productions || [], payload.productions) : existingStore.productions,
      sales: payload.sales !== undefined ? mergeById(existingStore.sales || [], payload.sales) : existingStore.sales,
      storeSettings: payload.storeSettings ? { ...existingStore.storeSettings, ...payload.storeSettings } : existingStore.storeSettings
    };

    allStoresData[storeKey] = mergedPayload;

    await fetch(CLOUD_STORE_DATA_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(allStoresData)
    });
  } catch (e) {
    console.warn('[CloudSync] Store data save error:', e);
  }
}

// Helper: merge two arrays by email (no duplicates)
function mergeByEmail<T extends { email: string }>(local: T[], cloud: T[]): T[] {
  const merged = [...local];
  cloud.forEach(c => {
    if (c.email && !merged.some(m => m.email.trim().toLowerCase() === c.email.trim().toLowerCase())) {
      merged.push(c);
    }
  });
  return merged;
}

// ============================================================
// 1. TENANTS: Full 2-Way Sync (local ↔ cloud)
// Called on app mount. Merges both directions then saves everywhere.
// ============================================================
export async function syncCloudTenantsFetch(): Promise<TenantAccount[]> {
  // A. Read local
  const localStr = localStorage.getItem('mavin_tenants_v5');
  let localList: TenantAccount[] = localStr ? JSON.parse(localStr) : [];

  // Also include registered users as tenants
  const regStr = localStorage.getItem('mavin_registered_users');
  if (regStr) {
    try {
      const regUsers = JSON.parse(regStr);
      regUsers.forEach((u: any) => {
        if (u.email && u.email !== 'admin@mavin.id' &&
            !localList.some(t => t.email.trim().toLowerCase() === u.email.trim().toLowerCase())) {
          localList.push({
            id: `TNT-REG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            storeName: u.storeName || `Toko ${u.ownerName || 'UMKM'}`,
            ownerName: u.ownerName || 'Pemilik Toko',
            email: u.email,
            phone: u.phone || '',
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

  // B. Read cloud
  let cloudList: TenantAccount[] = [];
  try {
    const res = await fetch(CLOUD_TENANTS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) cloudList = data;
    }
  } catch (e) {
    console.warn('[CloudSync] Tenant fetch error:', e);
  }

  // C. Merge both directions
  const merged = mergeByEmail(localList, cloudList);

  // D. Save merged result back to BOTH local and cloud
  localStorage.setItem('mavin_tenants_v5', JSON.stringify(merged));

  // Push merged list to cloud (so APK data becomes visible to Web and vice versa)
  try {
    await fetch(CLOUD_TENANTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(merged)
    });
  } catch (e) {
    console.warn('[CloudSync] Tenant push error:', e);
  }

  return merged;
}

// Save a single new tenant (called when admin adds or user registers)
export async function syncCloudTenantSave(tenant: TenantAccount): Promise<void> {
  // A. Add to local
  const localStr = localStorage.getItem('mavin_tenants_v5');
  let list: TenantAccount[] = localStr ? JSON.parse(localStr) : [];
  if (!list.some(t => t.email.trim().toLowerCase() === tenant.email.trim().toLowerCase())) {
    list.push(tenant);
    localStorage.setItem('mavin_tenants_v5', JSON.stringify(list));
  }

  // B. Fetch current cloud, merge, push back
  try {
    const res = await fetch(CLOUD_TENANTS_URL, {
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

    await fetch(CLOUD_TENANTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(cloudList)
    });
  } catch (e) {
    console.warn('[CloudSync] Tenant save error:', e);
  }
}

// ============================================================
// 2. REGISTERED USERS (login credentials): Full 2-Way Sync
// ============================================================
export async function syncCloudUsersFetch(): Promise<any[]> {
  // A. Read local
  const localStr = localStorage.getItem('mavin_registered_users');
  let localList: any[] = localStr ? JSON.parse(localStr) : [];

  // B. Read cloud
  let cloudList: any[] = [];
  try {
    const res = await fetch(CLOUD_USERS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) cloudList = data;
    }
  } catch (e) {
    console.warn('[CloudSync] Users fetch error:', e);
  }

  // C. Merge both directions
  const merged = mergeByEmail(localList, cloudList);

  // D. Save to both
  localStorage.setItem('mavin_registered_users', JSON.stringify(merged));

  try {
    await fetch(CLOUD_USERS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(merged)
    });
  } catch (e) {
    console.warn('[CloudSync] Users push error:', e);
  }

  return merged;
}

// Save a single new user (called when someone registers)
export async function syncCloudUserSave(user: any): Promise<void> {
  // A. Add to local
  const localStr = localStorage.getItem('mavin_registered_users');
  let list: any[] = localStr ? JSON.parse(localStr) : [];
  if (!list.some((u: any) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase())) {
    list.push(user);
    localStorage.setItem('mavin_registered_users', JSON.stringify(list));
  }

  // B. Fetch cloud, merge, push
  try {
    const res = await fetch(CLOUD_USERS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let cloudList: any[] = [];
    if (res.ok) {
      const parsed = await res.json();
      if (Array.isArray(parsed)) cloudList = parsed;
    }

    if (!cloudList.some((u: any) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase())) {
      cloudList.push(user);
    }

    await fetch(CLOUD_USERS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(cloudList)
    });
  } catch (e) {
    console.warn('[CloudSync] User save error:', e);
  }
}
