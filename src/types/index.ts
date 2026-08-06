export type UserRole = 'owner' | 'manager' | 'cashier' | 'saas_admin';

export interface TenantAccount {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  status: 'Aktif' | 'Trial' | 'Expired';
  expiryDate: string;
  monthlyFee: number;
  outletCount: number;
  registerDate: string;
}

export interface RolePermissions {
  manager: { [key: string]: boolean };
  cashier: { [key: string]: boolean };
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  outletName: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  footerNote: string;
  taxPercent: number;
  servicePercent: number;
  activeOutletId: string;
  // Custom Branding & Theme
  logoType: 'preset' | 'custom';
  logoIcon: 'Award' | 'Coffee' | 'ChefHat' | 'Store' | 'ShoppingBag' | 'Utensils';
  customLogoUrl?: string; // Base64 data URL or image URL
  primaryColor: string; // e.g. '#4f46e5'
  appBackground: 'slate' | 'white' | 'cream' | 'mint' | 'sky';
  // Thermal Printer & Receipt Settings
  printerConnectionType?: 'bluetooth' | 'usb' | 'web_dialog';
  printerPaperWidth?: '58mm' | '80mm';
  printerAutoPrint?: boolean;
  printerShowLogo?: boolean;
  receiptHeaderMessage?: string;
  receiptFooterMessage?: string;
}

export type IngredientCategory = 'Bahan Utama' | 'Bumbu & Rempah' | 'Cairan & Susu' | 'Kemasan & Stiker' | 'Topping & Hiasan' | 'Lainnya';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory | string;
  unit: string; // e.g. 'g', 'ml', 'pcs', 'kg', 'liter'
  stock: number;
  minStock: number;
  costPerUnit: number; // Weighted average cost per unit
  lastPurchasePrice: number; // Price from latest purchase
  lastPurchaseDate?: string;
}

export interface PurchaseItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  totalPrice: number; // Total spending for this line item
  unitPrice: number; // Calculated unit cost (totalPrice / quantity)
}

export interface PurchaseRecord {
  id: string;
  date: string;
  supplier: string;
  items: PurchaseItem[];
  totalCost: number;
  notes?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // Quantity needed per batch
}

export interface OverheadCost {
  id: string;
  name: string; // e.g., 'Cup + Sedotan + Stiker', 'Gas & Listrik', 'Tenaga Kerja Batch'
  cost: number; // Total Rp cost per batch
}

export interface Recipe {
  id: string;
  name: string;
  category: string; // e.g. 'Minuman', 'Makanan', 'Bakery', 'Camilan'
  batchYield: number; // e.g., 10 (produces 10 portions per batch)
  yieldUnit: string; // 'porsi', 'pcs', 'cup', 'box', 'botol'
  ingredients: RecipeIngredient[];
  overheads: OverheadCost[];
  targetMargin: number; // Percentage, e.g. 50 (%)
  sellingPrice: number; // Set selling price per portion
  finishedStock: number; // Stock of finished goods ready for POS sale
  description?: string;
  imageUrl?: string;
}

export interface ProductionBatch {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string;
  batchCount: number; // How many batches cooked
  totalProduced: number; // batchCount * batchYield
  yieldUnit: string;
  totalProductionCost: number;
  hppPerUnit: number;
  notes?: string;
}

export interface SaleItem {
  recipeId: string;
  recipeName: string;
  quantity: number;
  pricePerUnit: number;
  hppPerUnit: number;
  subtotal: number;
  totalHpp: number;
  profit: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNo: string;
  date: string;
  customerName?: string;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank' | 'E-Wallet';
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discount: number;
  grandTotal: number;
  totalHpp: number;
  grossProfit: number;
  cashPaid?: number;
  change?: number;
  outletId?: string;
}

export interface AppMetrics {
  totalRevenue: number;
  totalGrossProfit: number;
  totalHppSold: number;
  averageMarginPercent: number;
  lowStockCount: number;
}

export interface WahaConfig {
  url: string;        // URL server WAHA (e.g. https://waha.example.com)
  apiKey: string;     // API Key WAHA
  session: string;    // Session name WAHA
  enabled: boolean;   // Toggle aktif/nonaktif
}
