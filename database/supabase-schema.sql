-- Supabase Multi-Tenant Database Schema
-- Compatible with Supabase PostgreSQL with Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Platform owner table (YOU)
CREATE TABLE platform_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (businesses like New Life Juice, Insurance agencies)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE, -- e.g., newlifejuice.com
    subdomain VARCHAR(100) UNIQUE, -- e.g., newlifejuice.yourplatform.com
    business_type VARCHAR(100) NOT NULL DEFAULT 'generic', -- juice-bar, insurance, restaurant, etc.
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Business information (JSONB for flexibility)
    business_info JSONB DEFAULT '{}', -- name, tagline, description, phone, email, address
    branding JSONB DEFAULT '{}', -- colors, fonts, logo_url
    settings JSONB DEFAULT '{}' -- features enabled, integrations, etc.
);

-- Client admin users (people who manage each client's account)
-- This integrates with Supabase Auth
CREATE TABLE client_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin', -- admin, editor, viewer
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Services for each client
CREATE TABLE client_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    image_url VARCHAR(500),
    images JSONB DEFAULT '[]', -- array of image URLs
    metadata JSONB DEFAULT '{}', -- ingredients, features, nutritional info, etc.
    status VARCHAR(50) DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website content for each client
CREATE TABLE client_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL, -- hero, about, contact, etc.
    content_type VARCHAR(50) NOT NULL, -- text, html, json
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, section)
);

-- AI-generated content history
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    content_type VARCHAR(100), -- product-description, hero-content, marketing-copy, etc.
    content TEXT NOT NULL,
    model_used VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
    tokens_used INTEGER,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders/Leads for each client
CREATE TABLE client_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    order_data JSONB NOT NULL, -- products, quantities, totals, etc.
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File storage references (Supabase Storage integration)
CREATE TABLE client_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    storage_path VARCHAR(500) NOT NULL, -- Path in Supabase Storage
    public_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- End customers (people who buy from your clients)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    preferences JSONB DEFAULT '{}',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, email)
);

-- Activity logs for security and debugging
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100), -- product, content, order, etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_domain ON clients(domain);
CREATE INDEX idx_clients_subdomain ON clients(subdomain);
CREATE INDEX idx_clients_business_type ON clients(business_type);
CREATE INDEX idx_client_users_client_id ON client_users(client_id);
CREATE INDEX idx_client_products_client_id ON client_products(client_id);
CREATE INDEX idx_client_products_status ON client_products(status);
CREATE INDEX idx_client_content_client_id ON client_content(client_id);
CREATE INDEX idx_ai_generations_client_id ON ai_generations(client_id);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at);
CREATE INDEX idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX idx_client_orders_created_at ON client_orders(created_at DESC);
CREATE INDEX idx_client_files_client_id ON client_files(client_id);
CREATE INDEX idx_customers_client_id ON customers(client_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_activity_logs_client_id ON activity_logs(client_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT client_id 
        FROM client_users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM platform_owners 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for client isolation

-- Clients: Users can only see their own client, platform owners see all
CREATE POLICY "client_access" ON clients
    FOR ALL USING (
        id = get_user_client_id() OR is_platform_owner()
    );

-- Client Users: Users can see users in their client, platform owners see all
CREATE POLICY "client_users_access" ON client_users
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Products: Users can only access their client's products
CREATE POLICY "client_products_access" ON client_products
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Content: Users can only access their client's content
CREATE POLICY "client_content_access" ON client_content
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- AI Generations: Users can only access their client's AI content
CREATE POLICY "ai_generations_access" ON ai_generations
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Orders: Users can only access their client's orders
CREATE POLICY "client_orders_access" ON client_orders
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Files: Users can only access their client's files
CREATE POLICY "client_files_access" ON client_files
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Customers: Users can only access their client's customers
CREATE POLICY "customers_access" ON customers
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Activity Logs: Users can only see their client's logs, platform owners see all
CREATE POLICY "activity_logs_access" ON activity_logs
    FOR ALL USING (
        client_id = get_user_client_id() OR is_platform_owner()
    );

-- Platform owners table - only platform owners can access
CREATE POLICY "platform_owners_access" ON platform_owners
    FOR ALL USING (is_platform_owner());

-- Insert sample data for New Life Juice
INSERT INTO clients (name, domain, business_type, business_info, branding, settings) VALUES (
    'New Life Juice',
    'newlifejuice.com',
    'juice-bar',
    '{
        "name": "New Life Juice",
        "tagline": "Premium Fresh Juice Delivered",
        "description": "Premium fresh juice delivery service committed to your health and wellness journey. We use only the finest organic ingredients to create delicious, nutritious juices that fuel your active lifestyle.",
        "phone": "(555) 123-JUICE",
        "email": "orders@newlifejuice.com",
        "address": "123 Health Street, Wellness City, CA 90210"
    }',
    '{
        "primary_color": "#4CAF50",
        "secondary_color": "#FF6B35",
        "accent_color": "#FFC107",
        "font_family": "Poppins",
        "logo_url": "/images/logo.png"
    }',
    '{
        "features": ["ai_content", "ordering", "analytics"],
        "integrations": ["formspree", "openai"],
        "theme": "health-focused"
    }'
);

-- Get the client ID for New Life Juice to create sample products
DO $$
DECLARE
    client_uuid UUID;
BEGIN
    SELECT id INTO client_uuid FROM clients WHERE name = 'New Life Juice';
    
    -- Insert sample products
    INSERT INTO client_products (client_id, name, description, price, category, metadata, sort_order) VALUES 
    (client_uuid, 'Green Goddess', 'A powerful blend of kale, spinach, cucumber, green apple, lemon, and ginger. Packed with vitamins and minerals to energize your day.', 18.00, 'Green Juices', '{"ingredients": ["kale", "spinach", "cucumber", "green apple", "lemon", "ginger"], "benefits": ["detox", "energy", "immunity"]}', 1),
    (client_uuid, 'Citrus Sunrise', 'Bright and refreshing mix of orange, grapefruit, lemon, and a hint of mint. Perfect morning pick-me-up loaded with vitamin C.', 18.00, 'Citrus Juices', '{"ingredients": ["orange", "grapefruit", "lemon", "mint"], "benefits": ["vitamin c", "hydration", "mood boost"]}', 2),
    (client_uuid, 'Berry Bliss', 'Antioxidant-rich combination of blueberries, strawberries, raspberries, and pomegranate. Sweet, delicious, and incredibly nutritious.', 18.00, 'Berry Juices', '{"ingredients": ["blueberries", "strawberries", "raspberries", "pomegranate"], "benefits": ["antioxidants", "heart health", "brain function"]}', 3),
    (client_uuid, 'Tropical Paradise', 'Escape to the tropics with pineapple, mango, coconut water, and lime. Hydrating and naturally sweet with enzymes for digestion.', 18.00, 'Tropical Juices', '{"ingredients": ["pineapple", "mango", "coconut water", "lime"], "benefits": ["hydration", "digestion", "vitamin c"]}', 4),
    (client_uuid, 'Root Boost', 'Earthy and invigorating blend of carrot, beet, ginger, turmeric, and apple. Anti-inflammatory powerhouse with natural sweetness.', 18.00, 'Root Juices', '{"ingredients": ["carrot", "beet", "ginger", "turmeric", "apple"], "benefits": ["anti-inflammatory", "liver support", "stamina"]}', 5);
    
    -- Insert sample content
    INSERT INTO client_content (client_id, section, content_type, content, is_published) VALUES
    (client_uuid, 'hero', 'json', '{"title": "Premium Fresh Juice Delivered", "subtitle": "Fuel your wellness journey with our cold-pressed, organic juices made from the finest ingredients.", "cta_text": "Order Now", "background_image": "/images/hero-bg.jpg"}', true),
    (client_uuid, 'about', 'json', '{"title": "About New Life Juice", "description": "We believe that proper nutrition is the foundation of a healthy, vibrant life. Our cold-pressed juices are made fresh daily using only organic, locally-sourced ingredients.", "image": "/images/about.jpg"}', true);
END $$;
