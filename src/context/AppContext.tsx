import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ingredient,
  Recipe,
  PurchaseRecord,
  ProductionBatch,
  SaleTransaction,
  UserRole,
  Outlet,
  Supplier,
  StoreSettings,
  RolePermissions,
  StaffUser,
  TenantAccount
} from '../types';
import {
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_PURCHASES,
  INITIAL_PRODUCTIONS,
  INITIAL_SALES,
  INITIAL_OUTLETS,
  INITIAL_SUPPLIERS,
  INITIAL_STORE_SETTINGS
} from '../utils/sampleData';
import { calculateRecipeHppDetails } from '../utils/calculator';

const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  manager: {
    dashboard: false,
    ingredients: true,
    purchases: true,
    recipes: true,
    production: true,
    pos: false,
    reports: false,
    settings: false
  },
  cashier: {
    dashboard: false,
    ingredients: false,
    purchases: false,
    recipes: false,
    production: false,
    pos: true,
    reports: false,
    settings: false
  }
};

const INITIAL_STAFF_USERS: StaffUser[] = [
  { id: 'st-1', name: 'Pak Andi (Pemilik)', email: 'owner@mavin.id', role: 'owner', outletName: 'Pusat Sudirman', status: 'Aktif' },
  { id: 'st-2', name: 'Chef Juna', email: 'dapur@mavin.id', role: 'manager', outletName: 'Central Kitchen', status: 'Aktif' },
  { id: 'st-3', name: 'Budi Kasir', email: 'kasir1@mavin.id', role: 'cashier', outletName: 'Pusat Sudirman', status: 'Aktif' }
];

const INITIAL_TENANT_ACCOUNTS: TenantAccount[] = [
  {
    id: 't-101',
    storeName: 'MAVIN Kopi & Bakery (Usaha Anda)',
    ownerName: 'Pak Andi',
    email: 'owner@mavin.id',
    phone: '0812-3456-7890',
    plan: 'Enterprise',
    status: 'Aktif',
    expiryDate: '2027-12-31',
    monthlyFee: 149000,
    outletCount: 2,
    registerDate: '2026-01-10'
  },
  {
    id: 't-102',
    storeName: 'Roti Bakar Juara Lembang',
    ownerName: 'Bu Siska Rahma',
    email: 'siska@rotijuara.com',
    phone: '0813-9876-5432',
    plan: 'Pro',
    status: 'Aktif',
    expiryDate: '2026-11-15',
    monthlyFee: 69000,
    outletCount: 1,
    registerDate: '2026-02-14'
  },
  {
    id: 't-103',
    storeName: 'Dimsum Ayam Express Senopati',
    ownerName: 'Mas Hendra',
    email: 'hendra@dimsumexpress.id',
    phone: '0857-1122-3344',
    plan: 'Pro',
    status: 'Aktif',
    expiryDate: '2026-10-01',
    monthlyFee: 69000,
    outletCount: 2,
    registerDate: '2026-03-01'
  },
  {
    id: 't-104',
    storeName: 'Warung Es Teh Solo Mantap',
    ownerName: 'Mbak Dewi',
    email: 'dewi@estehsolo.com',
    phone: '0878-4455-6677',
    plan: 'Starter',
    status: 'Trial',
    expiryDate: '2026-08-15',
    monthlyFee: 0,
    outletCount: 1,
    registerDate: '2026-08-01'
  }
];

interface AppContextType {
  // Role & Permissions
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  rolePermissions: RolePermissions;
  updateRolePermission: (role: 'manager' | 'cashier', moduleKey: string, allowed: boolean) => void;
  hasTabAccess: (role: UserRole, tabId: string) => boolean;

  // SaaS Master Admin Tenants Management
  tenantAccounts: TenantAccount[];
  updateTenantStatus: (id: string, status: 'Aktif' | 'Trial' | 'Expired', plan?: 'Starter' | 'Pro' | 'Enterprise') => void;

  // Staff Users
  staffUsers: StaffUser[];
  addStaffUser: (user: Omit<StaffUser, 'id'>) => void;
  updateStaffUser: (id: string, fields: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;

  // Master Data & Config
  outlets: Outlet[];
  suppliers: Supplier[];
  storeSettings: StoreSettings;
  
  addOutlet: (outlet: Omit<Outlet, 'id'>) => void;
  updateOutlet: (id: string, outlet: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  // Inventory & Core SaaS Entities
  ingredients: Ingredient[];
  recipes: Recipe[];
  purchases: PurchaseRecord[];
  productions: ProductionBatch[];
  sales: SaleTransaction[];
  
  // Ingredient actions
  addIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, ing: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Purchase (Kulakan) actions
  addPurchase: (purchase: Omit<PurchaseRecord, 'id'>) => void;

  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'finishedStock'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Production actions
  executeProductionBatch: (recipeId: string, batchCount: number, notes?: string) => { success: boolean; message: string };

  // Sales (POS) actions
  addSaleTransaction: (sale: Omit<SaleTransaction, 'id' | 'invoiceNo'>) => SaleTransaction;

  // Utilities
  resetToSampleData: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'mavin_current_role_v1',
  ROLE_PERMISSIONS: 'mavin_role_permissions_v2',
  STAFF: 'mavin_staff_v1',
  TENANTS: 'mavin_tenants_v1',
  OUTLETS: 'mavin_outlets_v1',
  SUPPLIERS: 'mavin_suppliers_v1',
  SETTINGS: 'mavin_settings_v1',
  INGREDIENTS: 'mavin_ingredients_v1',
  RECIPES: 'mavin_recipes_v1',
  PURCHASES: 'mavin_purchases_v1',
  PRODUCTIONS: 'mavin_productions_v1',
  SALES: 'mavin_sales_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'owner';
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });

  const [tenantAccounts, setTenantAccounts] = useState<TenantAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return saved ? JSON.parse(saved) : INITIAL_TENANT_ACCOUNTS;
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF_USERS;
  });

  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OUTLETS);
    return saved ? JSON.parse(saved) : INITIAL_OUTLETS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [productions, setProductions] = useState<ProductionBatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTIONS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTIONS;
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE, currentRole); }, [currentRole]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(rolePermissions)); }, [rolePermissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenantAccounts)); }, [tenantAccounts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffUsers)); }, [staffUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.OUTLETS, JSON.stringify(outlets)); }, [outlets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings)); }, [storeSettings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients)); }, [ingredients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTIONS, JSON.stringify(productions)); }, [productions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales)); }, [sales]);

  // SaaS Master Admin Actions
  const updateTenantStatus = (id: string, status: 'Aktif' | 'Trial' | 'Expired', plan?: 'Starter' | 'Pro' | 'Enterprise') => {
    setTenantAccounts(prev => prev.map(t => {
      if (t.id === id) {
        const nextPlan = plan || t.plan;
        const monthlyFee = nextPlan === 'Enterprise' ? 149000 : nextPlan === 'Pro' ? 69000 : 0;
        return {
          ...t,
          status,
          plan: nextPlan,
          monthlyFee
        };
      }
      return t;
    }));
  };

  // Dynamic Role Permissions Actions
  const updateRolePermission = (role: 'manager' | 'cashier', moduleKey: string, allowed: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleKey]: allowed
      }
    }));
  };

  const hasTabAccess = (role: UserRole, tabId: string): boolean => {
    if (role === 'owner' || role === 'saas_admin') return true; // Owner & SaaS Admin have 100% access
    return Boolean(rolePermissions[role]?.[tabId]);
  };

  // Staff Users Actions
  const addStaffUser = (data: Omit<StaffUser, 'id'>) => {
    const newUser: StaffUser = { ...data, id: `st-${Date.now()}` };
    setStaffUsers(prev => [...prev, newUser]);
  };

  const updateStaffUser = (id: string, fields: Partial<StaffUser>) => {
    setStaffUsers(prev => prev.map(u => u.id === id ? { ...u, ...fields } : u));
  };

  const deleteStaffUser = (id: string) => {
    setStaffUsers(prev => prev.filter(u => u.id !== id));
  };

  // Outlets Actions
  const addOutlet = (data: Omit<Outlet, 'id'>) => {
    const newOutlet: Outlet = { ...data, id: `out-${Date.now()}` };
    setOutlets(prev => [...prev, newOutlet]);
  };

  const updateOutlet = (id: string, fields: Partial<Outlet>) => {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, ...fields } : o));
  };

  const deleteOutlet = (id: string) => {
    setOutlets(prev => prev.filter(o => o.id !== id));
  };

  // Suppliers Actions
  const addSupplier = (data: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...data, id: `sup-${Date.now()}` };
    setSuppliers(prev => [...prev, newSup]);
  };

  const updateSupplier = (id: string, fields: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Settings Action
  const updateStoreSettings = (fields: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...fields }));
  };

  // INGREDIENT ACTIONS
  const addIngredient = (ingData: Omit<Ingredient, 'id'>) => {
    const newId = `ing-${Date.now()}`;
    const newIng: Ingredient = { ...ingData, id: newId };
    setIngredients(prev => [...prev, newIng]);
  };

  const updateIngredient = (id: string, updatedFields: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  // KULAKAN / PURCHASE ACTION (Weighted Average Cost recalculation + Inventory update)
  const addPurchase = (purchaseData: Omit<PurchaseRecord, 'id'>) => {
    const newId = `pur-${Date.now()}`;
    const newPurchase: PurchaseRecord = { ...purchaseData, id: newId };

    setIngredients(prevIngredients => {
      const updated = [...prevIngredients];
      for (const item of purchaseData.items) {
        const idx = updated.findIndex(i => i.id === item.ingredientId);
        if (idx !== -1) {
          const current = updated[idx];
          const currentStock = current.stock;
          const currentCost = current.costPerUnit;
          const addedQty = item.quantity;
          const addedCost = item.unitPrice;

          const newStock = currentStock + addedQty;
          const newCostPerUnit = newStock > 0
            ? Math.round(((currentStock * currentCost) + (addedQty * addedCost)) / newStock)
            : addedCost;

          updated[idx] = {
            ...current,
            stock: newStock,
            costPerUnit: newCostPerUnit,
            lastPurchasePrice: addedCost,
            lastPurchaseDate: purchaseData.date.split(' ')[0]
          };
        }
      }
      return updated;
    });

    setPurchases(prev => [newPurchase, ...prev]);
  };

  // RECIPE ACTIONS
  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'finishedStock'>) => {
    const newId = `rec-${Date.now()}`;
    const newRecipe: Recipe = {
      ...recipeData,
      id: newId,
      finishedStock: 0
    };
    setRecipes(prev => [...prev, newRecipe]);
  };

  const updateRecipe = (id: string, updatedFields: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  // EXECUTE BATCH PRODUCTION
  const executeProductionBatch = (recipeId: string, batchCount: number, notes?: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Resep tidak ditemukan' };
    if (batchCount <= 0) return { success: false, message: 'Jumlah batch harus lebih dari 0' };

    const ingMap = new Map(ingredients.map(i => [i.id, i]));
    const missingItems: string[] = [];

    recipe.ingredients.forEach(ri => {
      const ing = ingMap.get(ri.ingredientId);
      const neededQty = ri.quantity * batchCount;
      if (!ing || ing.stock < neededQty) {
        const available = ing ? `${ing.stock} ${ing.unit}` : '0';
        const name = ing ? ing.name : ri.ingredientId;
        missingItems.push(`${name} (Dibutuhkan: ${neededQty} ${ing?.unit || ''}, Tersedia: ${available})`);
      }
    });

    if (missingItems.length > 0) {
      return {
        success: false,
        message: `Stok bahan baku tidak mencukupi:\n• ` + missingItems.join('\n• ')
      };
    }

    setIngredients(prev => prev.map(ing => {
      const ri = recipe.ingredients.find(item => item.ingredientId === ing.id);
      if (ri) {
        return {
          ...ing,
          stock: Math.max(0, ing.stock - (ri.quantity * batchCount))
        };
      }
      return ing;
    }));

    const hppDetails = calculateRecipeHppDetails(recipe, ingredients);
    const totalProduced = batchCount * recipe.batchYield;
    const totalProductionCost = hppDetails.totalBatchHpp * batchCount;

    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, finishedStock: r.finishedStock + totalProduced } : r));

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const newProduction: ProductionBatch = {
      id: `prod-${Date.now()}`,
      recipeId,
      recipeName: recipe.name,
      date: dateStr,
      batchCount,
      totalProduced,
      yieldUnit: recipe.yieldUnit,
      totalProductionCost,
      hppPerUnit: hppDetails.hppPerUnit,
      notes: notes || `Produksi ${batchCount} batch (${totalProduced} ${recipe.yieldUnit})`
    };

    setProductions(prev => [newProduction, ...prev]);

    return {
      success: true,
      message: `Berhasil memproduksi ${totalProduced} ${recipe.yieldUnit} ${recipe.name}!`
    };
  };

  // ADD POS SALE TRANSACTION
  const addSaleTransaction = (saleData: Omit<SaleTransaction, 'id' | 'invoiceNo'>) => {
    const now = new Date();
    const dateCode = now.toISOString().slice(0,10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const invoiceNo = `INV-${dateCode}-${randNum}`;

    const newSale: SaleTransaction = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo,
      outletId: storeSettings.activeOutletId
    };

    setRecipes(prev => prev.map(r => {
      const soldItem = saleData.items.find(item => item.recipeId === r.id);
      if (soldItem) {
        return {
          ...r,
          finishedStock: Math.max(0, r.finishedStock - soldItem.quantity)
        };
      }
      return r;
    }));

    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  // UTILITIES
  const resetToSampleData = () => {
    setCurrentRole('owner');
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    setTenantAccounts(INITIAL_TENANT_ACCOUNTS);
    setStaffUsers(INITIAL_STAFF_USERS);
    setOutlets(INITIAL_OUTLETS);
    setSuppliers(INITIAL_SUPPLIERS);
    setStoreSettings(INITIAL_STORE_SETTINGS);
    setIngredients(INITIAL_INGREDIENTS);
    setRecipes(INITIAL_RECIPES);
    setPurchases(INITIAL_PURCHASES);
    setProductions(INITIAL_PRODUCTIONS);
    setSales(INITIAL_SALES);
    localStorage.clear();
  };

  const exportDataJson = () => {
    const data = {
      storeSettings,
      tenantAccounts,
      rolePermissions,
      staffUsers,
      outlets,
      suppliers,
      ingredients,
      recipes,
      purchases,
      productions,
      sales,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAVIN_SaaS_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.ingredients && data.recipes) {
        if (data.storeSettings) setStoreSettings(data.storeSettings);
        if (data.tenantAccounts) setTenantAccounts(data.tenantAccounts);
        if (data.rolePermissions) setRolePermissions(data.rolePermissions);
        if (data.staffUsers) setStaffUsers(data.staffUsers);
        if (data.outlets) setOutlets(data.outlets);
        if (data.suppliers) setSuppliers(data.suppliers);
        setIngredients(data.ingredients);
        setRecipes(data.recipes);
        if (data.purchases) setPurchases(data.purchases);
        if (data.productions) setProductions(data.productions);
        if (data.sales) setSales(data.sales);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        rolePermissions,
        updateRolePermission,
        hasTabAccess,
        tenantAccounts,
        updateTenantStatus,
        staffUsers,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        outlets,
        suppliers,
        storeSettings,
        addOutlet,
        updateOutlet,
        deleteOutlet,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateStoreSettings,
        ingredients,
        recipes,
        purchases,
        productions,
        sales,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addPurchase,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        executeProductionBatch,
        addSaleTransaction,
        resetToSampleData,
        exportDataJson,
        importDataJson
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
