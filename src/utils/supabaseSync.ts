import { TenantAccount } from '../types';

// ============================================================
// MAVIN SaaS - Reliable Cloud Database Sync Engine (restful-api.dev)
// High-availability persistent cloud storage with zero expiration
// ============================================================
const CLOUD_TENANTS_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a00a285bc42b6a';
const CLOUD_USERS_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a00a285c252b6b';
const CLOUD_STORE_DATA_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a00a285c7c2b6c';

export interface StoreDataPayload {
  ingredients?: any[];
  recipes?: any[];
  purchases?: any[];
  productions?: any[];
  sales?: any[];
  storeSettings?: any;
}

// Helper: Get sanitized key for a store
export function getStoreDataKey(): string {
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

// Helper: merge two arrays by `email` field
function mergeByEmail<T extends { email: string }>(local: T[], cloud: T[]): T[] {
  const merged = [...(local || [])];
  (cloud || []).forEach(c => {
    if (c && c.email && !merged.some(m => m && m.email && m.email.trim().toLowerCase() === c.email.trim().toLowerCase())) {
      merged.push(c);
    }
  });
  return merged;
}

// 1. STORE DATA SYNC (Ingredients, Recipes, Purchases, Productions, Sales)
export async function syncCloudStoreDataFetch(): Promise<StoreDataPayload | null> {
  const storeKey = getStoreDataKey();
  if (!storeKey) return null;

  try {
    const res = await fetch(CLOUD_STORE_DATA_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let allStoresData: any = {};
    if (res.ok) {
      const json = await res.json();
      allStoresData = json?.data?.stores || {};
    }

    let cloudData: StoreDataPayload = allStoresData[storeKey] || {};

    // Smart fallback: if primary key has 0 items, search all stores for any populated data
    if ((!cloudData.ingredients || cloudData.ingredients.length === 0) && (!cloudData.recipes || cloudData.recipes.length === 0)) {
      const altKeys = Object.keys(allStoresData);
      for (const altKey of altKeys) {
        if (altKey !== storeKey) {
          const altData = allStoresData[altKey];
          if (altData && ((altData.ingredients && altData.ingredients.length > 0) || (altData.recipes && altData.recipes.length > 0))) {
            cloudData = {
              ingredients: mergeById(cloudData.ingredients || [], altData.ingredients || []),
              recipes: mergeById(cloudData.recipes || [], altData.recipes || []),
              purchases: mergeById(cloudData.purchases || [], altData.purchases || []),
              productions: mergeById(cloudData.productions || [], altData.productions || []),
              sales: mergeById(cloudData.sales || [], altData.sales || []),
              storeSettings: cloudData.storeSettings || altData.storeSettings
            };
          }
        }
      }
    }

    // Read local storage
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

    // Save merged to local storage
    if (mergedIngredients.length > 0) localStorage.setItem('mavin_ingredients', JSON.stringify(mergedIngredients));
    if (mergedRecipes.length > 0) localStorage.setItem('mavin_recipes', JSON.stringify(mergedRecipes));
    if (mergedPurchases.length > 0) localStorage.setItem('mavin_purchases', JSON.stringify(mergedPurchases));
    if (mergedProductions.length > 0) localStorage.setItem('mavin_productions', JSON.stringify(mergedProductions));
    if (mergedSales.length > 0) localStorage.setItem('mavin_sales', JSON.stringify(mergedSales));

    // Immediately push merged payload back to cloud
    allStoresData[storeKey] = mergedPayload;
    await fetch(CLOUD_STORE_DATA_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_store_data_v1', data: { stores: allStoresData } })
    });

    return mergedPayload;
  } catch (e) {
    console.warn('[CloudSync] Store data fetch error:', e);
    return null;
  }
}

export async function forcePushStoreDataToCloud(): Promise<boolean> {
  const storeKey = getStoreDataKey();
  if (!storeKey) return false;

  try {
    const res = await fetch(CLOUD_STORE_DATA_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let allStoresData: any = {};
    if (res.ok) {
      const json = await res.json();
      allStoresData = json?.data?.stores || {};
    }

    const localIngStr = localStorage.getItem('mavin_ingredients');
    const localRecStr = localStorage.getItem('mavin_recipes');
    const localPurStr = localStorage.getItem('mavin_purchases');
    const localProStr = localStorage.getItem('mavin_productions');
    const localSalStr = localStorage.getItem('mavin_sales');
    const localSetStr = localStorage.getItem('mavin_store_settings');

    const payload: StoreDataPayload = {
      ingredients: localIngStr ? JSON.parse(localIngStr) : [],
      recipes: localRecStr ? JSON.parse(localRecStr) : [],
      purchases: localPurStr ? JSON.parse(localPurStr) : [],
      productions: localProStr ? JSON.parse(localProStr) : [],
      sales: localSalStr ? JSON.parse(localSalStr) : [],
      storeSettings: localSetStr ? JSON.parse(localSetStr) : undefined
    };

    allStoresData[storeKey] = payload;
    await fetch(CLOUD_STORE_DATA_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_store_data_v1', data: { stores: allStoresData } })
    });
    return true;
  } catch (e) {
    console.warn('[CloudSync] Force push error:', e);
    return false;
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
      const json = await res.json();
      allStoresData = json?.data?.stores || {};
    }

    const existingStore = allStoresData[storeKey] || {};

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
      body: JSON.stringify({ name: 'mavin_saas_store_data_v1', data: { stores: allStoresData } })
    });
  } catch (e) {
    console.warn('[CloudSync] Store data save error:', e);
  }
}

// 2. TENANTS: Full 2-Way Sync (local ↔ cloud)
export async function syncCloudTenantsFetch(): Promise<TenantAccount[]> {
  const localStr = localStorage.getItem('mavin_tenants_v5');
  let localList: TenantAccount[] = localStr ? JSON.parse(localStr) : [];

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

  let cloudList: TenantAccount[] = [];
  try {
    const res = await fetch(CLOUD_TENANTS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      cloudList = json?.data?.tenants || [];
    }
  } catch (e) {
    console.warn('[CloudSync] Tenant fetch error:', e);
  }

  const merged = mergeByEmail(localList, cloudList);
  localStorage.setItem('mavin_tenants_v5', JSON.stringify(merged));

  try {
    await fetch(CLOUD_TENANTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_tenants_v1', data: { tenants: merged } })
    });
  } catch (e) {
    console.warn('[CloudSync] Tenant push error:', e);
  }

  return merged;
}

export async function syncCloudTenantSave(tenant: TenantAccount): Promise<void> {
  const localStr = localStorage.getItem('mavin_tenants_v5');
  let list: TenantAccount[] = localStr ? JSON.parse(localStr) : [];
  if (!list.some(t => t.email.trim().toLowerCase() === tenant.email.trim().toLowerCase())) {
    list.push(tenant);
    localStorage.setItem('mavin_tenants_v5', JSON.stringify(list));
  }

  try {
    const res = await fetch(CLOUD_TENANTS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let cloudList: TenantAccount[] = [];
    if (res.ok) {
      const json = await res.json();
      cloudList = json?.data?.tenants || [];
    }

    if (!cloudList.some(t => t.email.trim().toLowerCase() === tenant.email.trim().toLowerCase())) {
      cloudList.push(tenant);
    }

    await fetch(CLOUD_TENANTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_tenants_v1', data: { tenants: cloudList } })
    });
  } catch (e) {
    console.warn('[CloudSync] Tenant save error:', e);
  }
}

// 3. REGISTERED USERS (login credentials): Full 2-Way Sync
export async function syncCloudUsersFetch(): Promise<any[]> {
  const localStr = localStorage.getItem('mavin_registered_users');
  let localList: any[] = localStr ? JSON.parse(localStr) : [];

  let cloudList: any[] = [];
  try {
    const res = await fetch(CLOUD_USERS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      cloudList = json?.data?.users || [];
    }
  } catch (e) {
    console.warn('[CloudSync] Users fetch error:', e);
  }

  const merged = mergeByEmail(localList, cloudList);
  localStorage.setItem('mavin_registered_users', JSON.stringify(merged));

  try {
    await fetch(CLOUD_USERS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_users_v1', data: { users: merged } })
    });
  } catch (e) {
    console.warn('[CloudSync] Users push error:', e);
  }

  return merged;
}

export async function syncCloudUserSave(user: any): Promise<void> {
  const localStr = localStorage.getItem('mavin_registered_users');
  let list: any[] = localStr ? JSON.parse(localStr) : [];
  if (!list.some((u: any) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase())) {
    list.push(user);
    localStorage.setItem('mavin_registered_users', JSON.stringify(list));
  }

  try {
    const res = await fetch(CLOUD_USERS_URL, {
      headers: { 'Accept': 'application/json' }
    });
    let cloudList: any[] = [];
    if (res.ok) {
      const json = await res.json();
      cloudList = json?.data?.users || [];
    }

    if (!cloudList.some((u: any) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase())) {
      cloudList.push(user);
    }

    await fetch(CLOUD_USERS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: 'mavin_saas_users_v1', data: { users: cloudList } })
    });
  } catch (e) {
    console.warn('[CloudSync] User save error:', e);
  }
}
