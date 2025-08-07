-- Manual data insertion for New Life Juice
-- Run these commands in the Supabase SQL Editor to bypass RLS

-- First, let's make our test user a platform owner
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'), 
    '{role}', 
    '"platform_owner"'
)
WHERE email = 'test@newlifejuice.com';

-- Insert New Life Juice client
INSERT INTO clients (name, domain, business_type, business_info, branding, settings)
VALUES (
    'New Life Juice',
    'newlifejuice.com', 
    'juice-bar',
    '{"tagline": "Fresh. Natural. Delivered.", "phone": "(555) 123-JUICE", "email": "orders@newlifejuice.com", "address": "123 Fresh Street, Health City, CA 90210"}',
    '{"primary_color": "#10B981", "secondary_color": "#F59E0B", "accent_color": "#EF4444", "logo_url": ""}',
    '{"features": ["online_ordering", "ai_content", "analytics"], "delivery_enabled": true, "payment_methods": ["stripe", "paypal"]}'
);

-- Get the client ID for the next inserts
-- (You'll need to replace 'YOUR_CLIENT_ID_HERE' below with the actual UUID from the insert above)

-- Insert sample products (replace YOUR_CLIENT_ID_HERE with actual client ID)
INSERT INTO client_products (client_id, name, description, price, category, image_url, is_active, sort_order)
VALUES 
    ('YOUR_CLIENT_ID_HERE', 'Green Goddess', 'Kale, spinach, cucumber, green apple, lemon, ginger', 18.00, 'Green Juice', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true, 1),
    ('YOUR_CLIENT_ID_HERE', 'Tropical Paradise', 'Pineapple, mango, coconut water, lime, mint', 18.00, 'Fruit Juice', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', true, 2),
    ('YOUR_CLIENT_ID_HERE', 'Citrus Burst', 'Orange, grapefruit, lemon, turmeric, black pepper', 18.00, 'Citrus Juice', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', true, 3),
    ('YOUR_CLIENT_ID_HERE', 'Berry Antioxidant', 'Blueberry, strawberry, raspberry, pomegranate, acai', 18.00, 'Berry Juice', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', true, 4),
    ('YOUR_CLIENT_ID_HERE', 'Root Wellness', 'Carrot, beet, ginger, turmeric, lemon, cayenne', 18.00, 'Wellness Shot', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', true, 5);

-- Insert sample content blocks (replace YOUR_CLIENT_ID_HERE with actual client ID)
INSERT INTO client_content (client_id, type, title, content, metadata, is_active, sort_order)
VALUES 
    ('YOUR_CLIENT_ID_HERE', 'hero', 'Fresh. Natural. Delivered.', 'Premium cold-pressed juices made from the finest organic ingredients, delivered fresh to your door.', '{"cta_text": "Order Now", "background_image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"}', true, 1),
    ('YOUR_CLIENT_ID_HERE', 'about', 'Our Story', 'Founded on the belief that everyone deserves access to fresh, nutritious beverages, New Life Juice sources only the finest organic ingredients to create our signature cold-pressed juices.', '{}', true, 2),
    ('YOUR_CLIENT_ID_HERE', 'benefits', 'Why Choose New Life Juice?', 'Our cold-press process preserves maximum nutrients and enzymes, delivering unparalleled taste and health benefits in every bottle.', '{"features": ["Organic ingredients only", "Cold-pressed for maximum nutrition", "No added sugars or preservatives", "Delivered fresh daily", "Eco-friendly packaging"]}', true, 3);

-- Verify the data was inserted
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM client_products
UNION ALL
SELECT 'Content' as table_name, COUNT(*) as count FROM client_content;
