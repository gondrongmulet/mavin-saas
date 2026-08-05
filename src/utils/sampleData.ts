import {
  Ingredient,
  Recipe,
  PurchaseRecord,
  ProductionBatch,
  SaleTransaction,
  Outlet,
  Supplier,
  StoreSettings
} from '../types';

export const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 'out-1',
    name: 'MAVIN Central Kitchen & Flagship Outlet',
    address: 'Jl. Sudirman No. 88, Jakarta Selatan',
    phone: '0812-3456-7890',
    isMain: true
  },
  {
    id: 'out-2',
    name: 'MAVIN Branch Lembang Express',
    address: 'Jl. Raya Lembang No. 45, Bandung',
    phone: '0813-9876-5432',
    isMain: false
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Kopi Nusantara Jaya',
    phone: '0811-2233-4455',
    address: 'Kawasan Industri Cikarang Block C2',
    category: 'Biji Kopi & Roastery'
  },
  {
    id: 'sup-2',
    name: 'Dairy Farm Lembang Direct',
    phone: '0857-1122-3344',
    address: 'Lembang, Kabupaten Bandung Barat',
    category: 'Susu & Fresh Milk'
  },
  {
    id: 'sup-3',
    name: 'Toko Plastik & Kemasan Maju',
    phone: '0878-9900-1122',
    address: 'Pasar Tanah Abang Blok A',
    category: 'Kemasan & Stiker'
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'MAVIN Kopi & Bakery',
  tagline: 'Manajemen UMKM Juara',
  address: 'Jl. Sudirman No. 88, Jakarta',
  phone: '0812-3456-7890',
  footerNote: 'Terima kasih telah berbelanja di MAVIN Store!',
  taxPercent: 10,
  servicePercent: 0,
  activeOutletId: 'out-1',
  logoType: 'preset',
  logoIcon: 'Award',
  customLogoUrl: '',
  primaryColor: '#4f46e5',
  appBackground: 'slate',
  printerConnectionType: 'bluetooth',
  printerPaperWidth: '58mm',
  printerAutoPrint: true,
  printerShowLogo: true,
  receiptHeaderMessage: 'Selamat Datang di Toko Kami!',
  receiptFooterMessage: 'Terima Kasih Atas Kunjungan Anda!\nFollow IG: @mavin.saas'
};

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Biji Kopi Arabika Premium',
    category: 'Bahan Utama',
    unit: 'g',
    stock: 2500,
    minStock: 500,
    costPerUnit: 220,
    lastPurchasePrice: 220,
    lastPurchaseDate: '2026-08-01'
  },
  {
    id: 'ing-2',
    name: 'Susu Fresh Milk Pasteurisasi',
    category: 'Cairan & Susu',
    unit: 'ml',
    stock: 6000,
    minStock: 1000,
    costPerUnit: 18,
    lastPurchasePrice: 18,
    lastPurchaseDate: '2026-08-03'
  },
  {
    id: 'ing-3',
    name: 'Gula Aren Organik Cair',
    category: 'Bumbu & Rempah',
    unit: 'ml',
    stock: 3500,
    minStock: 500,
    costPerUnit: 35,
    lastPurchasePrice: 35,
    lastPurchaseDate: '2026-08-02'
  },
  {
    id: 'ing-4',
    name: 'Sirup Vanila Gourmet',
    category: 'Cairan & Susu',
    unit: 'ml',
    stock: 800,
    minStock: 200,
    costPerUnit: 120,
    lastPurchasePrice: 120,
    lastPurchaseDate: '2026-07-28'
  },
  {
    id: 'ing-5',
    name: 'Tepung Terigu Protein Sedang',
    category: 'Bahan Utama',
    unit: 'g',
    stock: 12000,
    minStock: 2000,
    costPerUnit: 14,
    lastPurchasePrice: 14,
    lastPurchaseDate: '2026-08-04'
  },
  {
    id: 'ing-6',
    name: 'Mentega Butter Anchor Premium',
    category: 'Bahan Utama',
    unit: 'g',
    stock: 1800,
    minStock: 300,
    costPerUnit: 95,
    lastPurchasePrice: 95,
    lastPurchaseDate: '2026-08-01'
  },
  {
    id: 'ing-7',
    name: 'Telur Ayam Segar',
    category: 'Bahan Utama',
    unit: 'pcs',
    stock: 75,
    minStock: 20,
    costPerUnit: 2100,
    lastPurchasePrice: 2100,
    lastPurchaseDate: '2026-08-04'
  },
  {
    id: 'ing-8',
    name: 'Cup Plastik 16oz + Sedotan + Stiker',
    category: 'Kemasan & Stiker',
    unit: 'pcs',
    stock: 350,
    minStock: 50,
    costPerUnit: 900,
    lastPurchasePrice: 900,
    lastPurchaseDate: '2026-07-25'
  },
  {
    id: 'ing-9',
    name: 'Box Dus Kemasan Roti Premium',
    category: 'Kemasan & Stiker',
    unit: 'pcs',
    stock: 120,
    minStock: 30,
    costPerUnit: 1600,
    lastPurchasePrice: 1600,
    lastPurchaseDate: '2026-07-25'
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Kopi Susu Gula Aren Signature',
    category: 'Minuman',
    batchYield: 10,
    yieldUnit: 'cup',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 180 },
      { ingredientId: 'ing-2', quantity: 1200 },
      { ingredientId: 'ing-3', quantity: 300 },
    ],
    overheads: [
      { id: 'ov-1', name: 'Cup 16oz + Sedotan + Stiker Logo', cost: 9000 },
      { id: 'ov-2', name: 'Listrik, Es Batu & Gas Espresso', cost: 4000 }
    ],
    targetMargin: 60,
    sellingPrice: 22000,
    finishedStock: 25,
    description: 'Kopi perpaduan Arabika pilihan, susu segar, dan gula aren asli yang gurih nan manis.',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rec-2',
    name: 'Roti Bakar Butter Aren Special',
    category: 'Bakery',
    batchYield: 5,
    yieldUnit: 'box',
    ingredients: [
      { ingredientId: 'ing-5', quantity: 600 },
      { ingredientId: 'ing-6', quantity: 150 },
      { ingredientId: 'ing-7', quantity: 4 },
      { ingredientId: 'ing-3', quantity: 100 },
    ],
    overheads: [
      { id: 'ov-3', name: 'Box Dus Kemasan Roti', cost: 8000 },
      { id: 'ov-4', name: 'Gas Grill & Paper Wrap', cost: 4500 }
    ],
    targetMargin: 55,
    sellingPrice: 26000,
    finishedStock: 12,
    description: 'Roti empuk buatan sendiri dengan wangi mentega melimpah dan lelehan gula aren.',
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bff?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rec-3',
    name: 'Vanilla Gourmet Cream Latte',
    category: 'Minuman',
    batchYield: 8,
    yieldUnit: 'cup',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 144 },
      { ingredientId: 'ing-2', quantity: 960 },
      { ingredientId: 'ing-4', quantity: 160 },
    ],
    overheads: [
      { id: 'ov-5', name: 'Cup 16oz + Sedotan + Stiker Logo', cost: 7200 },
      { id: 'ov-6', name: 'Operasional Espresso Machine', cost: 3200 }
    ],
    targetMargin: 65,
    sellingPrice: 28000,
    finishedStock: 10,
    description: 'Espresso creamy dengan aroma vanila lembut dan sensasi silky milk foam.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: 'pur-101',
    date: '2026-08-01 10:30',
    supplier: 'PT Kopi Nusantara Jaya',
    items: [
      {
        ingredientId: 'ing-1',
        ingredientName: 'Biji Kopi Arabika Premium',
        quantity: 3000,
        unit: 'g',
        totalPrice: 660000,
        unitPrice: 220
      }
    ],
    totalCost: 660000,
    notes: 'Kulakan stok awal bulan biji kopi roast medium'
  },
  {
    id: 'pur-102',
    date: '2026-08-03 14:15',
    supplier: 'Dairy Farm Lembang Direct',
    items: [
      {
        ingredientId: 'ing-2',
        ingredientName: 'Susu Fresh Milk Pasteurisasi',
        quantity: 10000,
        unit: 'ml',
        totalPrice: 180000,
        unitPrice: 18
      }
    ],
    totalCost: 180000,
    notes: 'Restock rutin susu segar'
  }
];

export const INITIAL_PRODUCTIONS: ProductionBatch[] = [
  {
    id: 'prod-201',
    recipeId: 'rec-1',
    recipeName: 'Kopi Susu Gula Aren Signature',
    date: '2026-08-05 08:00',
    batchCount: 3,
    totalProduced: 30,
    yieldUnit: 'cup',
    totalProductionCost: 254700,
    hppPerUnit: 8490,
    notes: 'Produksi batch pagi persiapan jam buka toko'
  }
];

export const INITIAL_SALES: SaleTransaction[] = [
  {
    id: 'sale-301',
    invoiceNo: 'INV-20260805-001',
    date: '2026-08-05 09:15',
    customerName: 'Kak Budi',
    paymentMethod: 'QRIS',
    items: [
      {
        recipeId: 'rec-1',
        recipeName: 'Kopi Susu Gula Aren Signature',
        quantity: 2,
        pricePerUnit: 22000,
        hppPerUnit: 8490,
        subtotal: 44000,
        totalHpp: 16980,
        profit: 27020
      },
      {
        recipeId: 'rec-2',
        recipeName: 'Roti Bakar Butter Aren Special',
        quantity: 1,
        pricePerUnit: 26000,
        hppPerUnit: 10420,
        subtotal: 26000,
        totalHpp: 10420,
        profit: 15580
      }
    ],
    subtotal: 70000,
    taxAmount: 7000,
    serviceAmount: 0,
    discount: 0,
    grandTotal: 77000,
    totalHpp: 27400,
    grossProfit: 49600,
    cashPaid: 77000,
    change: 0,
    outletId: 'out-1'
  }
];
