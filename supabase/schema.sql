-- ========================================================
-- MAVIN SaaS Enterprise - Supabase Multi-Tenant Database Schema
-- Row Level Security (RLS) Enabled for 100% Tenant Isolation
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tenants Table (Daftar UMKM Berlangganan)
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

-- 3. Staff Users Table
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

-- 4. Master Ingredients Table (Stok & WAC HPP)
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

-- 5. Recipes Catalog Table
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

-- 6. Purchases Log Table (Kulakan)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cost NUMERIC(12, 2) NOT NULL,
    notes TEXT
);

-- 7. Batch Production Log Table
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

-- 8. POS Sales Transactions Table
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

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR MULTI-TENANCY ISOLATION
-- ========================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies (Allow access matching user's tenant_id)
CREATE POLICY tenant_isolation_ingredients ON ingredients
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_recipes ON recipes
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_purchases ON purchases
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_productions ON productions
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY tenant_isolation_sales ON sales_transactions
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
