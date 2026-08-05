-- ========================================================
-- MAVIN SaaS Enterprise - Supabase PostgreSQL Database Schema
-- Multi-Tenant Database Architecture with Row Level Security
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS sales_transactions CASCADE;
DROP TABLE IF EXISTS productions CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- 1. Tenants Table (Daftar Toko / UMKM Berlangganan)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    plan TEXT NOT NULL DEFAULT 'Pro',
    status TEXT NOT NULL DEFAULT 'Aktif',
    expiry_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    logo_type TEXT DEFAULT 'preset',
    logo_icon TEXT DEFAULT 'Award',
    custom_logo_url TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    app_background TEXT DEFAULT 'slate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Staff Users Table
CREATE TABLE staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'saas_admin')),
    outlet_name TEXT,
    status TEXT DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Master Ingredients Table (Stok & WAC HPP)
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    stock NUMERIC(12, 2) DEFAULT 0,
    min_stock NUMERIC(12, 2) DEFAULT 0,
    cost_per_unit NUMERIC(12, 2) DEFAULT 0,
    last_purchase_price NUMERIC(12, 2) DEFAULT 0,
    last_purchase_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recipes Catalog Table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    batch_yield NUMERIC(10, 2) NOT NULL DEFAULT 1,
    yield_unit TEXT NOT NULL DEFAULT 'porsi',
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    overheads JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_margin NUMERIC(5, 2) DEFAULT 50,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    finished_stock NUMERIC(10, 2) DEFAULT 0,
    description TEXT,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Purchases Log Table (Kulakan)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cost NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- 6. Batch Production Log Table
CREATE TABLE productions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    recipe_name TEXT NOT NULL,
    production_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    batch_count INT NOT NULL,
    total_produced NUMERIC(10, 2) NOT NULL,
    yield_unit TEXT NOT NULL,
    total_production_cost NUMERIC(12, 2) NOT NULL,
    hpp_per_unit NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- 7. POS Sales Transactions Table
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_no TEXT NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT,
    payment_method TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    service_amount NUMERIC(12, 2) DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    total_hpp NUMERIC(12, 2) NOT NULL,
    gross_profit NUMERIC(12, 2) NOT NULL,
    cash_paid NUMERIC(12, 2),
    change NUMERIC(12, 2)
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
