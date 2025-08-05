// Database schema for multi-client platform
// This will be used with Vercel Postgres in production

-- Core platform tables for multi-client architecture

-- Clients table (businesses like New Life Juice)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE, -- e.g., newlifejuice.com
    subdomain VARCHAR(100) UNIQUE, -- e.g., newlifejuice.yourplatform.com
    business_type VARCHAR(100), -- juice-bar, insurance, restaurant, etc.
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Business information
    business_info JSONB DEFAULT '{}', -- name, tagline, description, phone, email, address
    branding JSONB DEFAULT '{}', -- colors, fonts, logo_url
    settings JSONB DEFAULT '{}' -- features enabled, integrations, etc.
);

-- Client users (people who manage each client's account)
CREATE TABLE client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, editor, viewer
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Services for each client
CREATE TABLE client_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    image_url VARCHAR(500),
    images JSONB DEFAULT '[]', -- array of image URLs
    metadata JSONB DEFAULT '{}', -- ingredients, features, etc.
    status VARCHAR(50) DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Website content for each client
CREATE TABLE client_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL, -- hero, about, contact, etc.
    content_type VARCHAR(50) NOT NULL, -- text, html, json
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, section)
);

-- Orders/Leads for each client
CREATE TABLE client_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File uploads (images, documents) for each client
CREATE TABLE client_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    storage_url VARCHAR(500) NOT NULL, -- Google Cloud Storage URL
    thumbnail_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated content history
CREATE TABLE ai_content_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES client_users(id),
    prompt TEXT NOT NULL,
    content_type VARCHAR(100), -- product-description, hero-content, etc.
    generated_content TEXT NOT NULL,
    model_used VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform admin users (for managing the entire platform)
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- super_admin, admin, support
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for security and debugging
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    user_id UUID, -- could be client_user or platform_admin
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100), -- product, content, order, etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_clients_domain ON clients(domain);
CREATE INDEX idx_clients_subdomain ON clients(subdomain);
CREATE INDEX idx_client_users_client_id ON client_users(client_id);
CREATE INDEX idx_client_users_email ON client_users(email);
CREATE INDEX idx_client_products_client_id ON client_products(client_id);
CREATE INDEX idx_client_content_client_id ON client_content(client_id);
CREATE INDEX idx_client_orders_client_id ON client_orders(client_id);
CREATE INDEX idx_client_orders_created_at ON client_orders(created_at);
CREATE INDEX idx_client_files_client_id ON client_files(client_id);
CREATE INDEX idx_ai_content_history_client_id ON ai_content_history(client_id);
CREATE INDEX idx_activity_logs_client_id ON activity_logs(client_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Sample data for New Life Juice
INSERT INTO clients (name, domain, business_type, business_info, branding) VALUES (
    'New Life Juice',
    'newlifejuice.com',
    'juice-bar',
    '{
        "name": "New Life Juice",
        "tagline": "Premium Fresh Juice",
        "description": "Premium fresh juice delivery service committed to your health and wellness journey.",
        "phone": "(555) 123-JUICE",
        "email": "orders@newlifejuice.com"
    }',
    '{
        "primary_color": "#4CAF50",
        "secondary_color": "#FF6B35",
        "font_family": "Poppins"
    }'
);
