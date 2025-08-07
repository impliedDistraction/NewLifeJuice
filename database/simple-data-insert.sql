-- Simplified manual data insertion for New Life Juice
-- Run these commands in the Supabase SQL Editor

-- Step 1: Make test user a platform owner
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'), 
    '{role}', 
    '"platform_owner"'
)
WHERE email = 'test@newlifejuice.com';

-- Step 2: Insert client and store the ID
DO $$
DECLARE
    new_client_id UUID;
BEGIN
    -- Insert New Life Juice client
    INSERT INTO clients (name, domain, business_type, business_info, branding, settings)
    VALUES (
        'New Life Juice',
        'newlifejuice.com', 
        'juice-bar',
        '{"tagline": "Fresh. Natural. Delivered.", "phone": "(555) 123-JUICE", "email": "orders@newlifejuice.com"}',
        '{"primary_color": "#10B981", "secondary_color": "#F59E0B", "accent_color": "#EF4444"}',
        '{"features": ["online_ordering", "ai_content", "analytics"]}'
    ) RETURNING id INTO new_client_id;
    
    -- Insert sample products
    INSERT INTO client_products (client_id, name, description, price, category, image_url, is_active, sort_order)
    VALUES 
        (new_client_id, 'Green Goddess', 'Kale, spinach, cucumber, green apple, lemon, ginger', 18.00, 'Green Juice', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', true, 1),
        (new_client_id, 'Tropical Paradise', 'Pineapple, mango, coconut water, lime, mint', 18.00, 'Fruit Juice', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', true, 2),
        (new_client_id, 'Citrus Burst', 'Orange, grapefruit, lemon, turmeric, black pepper', 18.00, 'Citrus Juice', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', true, 3),
        (new_client_id, 'Berry Antioxidant', 'Blueberry, strawberry, raspberry, pomegranate, acai', 18.00, 'Berry Juice', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', true, 4),
        (new_client_id, 'Root Wellness', 'Carrot, beet, ginger, turmeric, lemon, cayenne', 18.00, 'Wellness Shot', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', true, 5);
    
    -- Insert sample content blocks
    INSERT INTO client_content (client_id, type, title, content, metadata, is_active, sort_order)
    VALUES 
        (new_client_id, 'hero', 'Fresh. Natural. Delivered.', 'Premium cold-pressed juices made from the finest organic ingredients, delivered fresh to your door.', '{"cta_text": "Order Now", "background_image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"}', true, 1),
        (new_client_id, 'about', 'Our Story', 'Founded on the belief that everyone deserves access to fresh, nutritious beverages, New Life Juice sources only the finest organic ingredients to create our signature cold-pressed juices.', '{}', true, 2),
        (new_client_id, 'benefits', 'Why Choose New Life Juice?', 'Our cold-press process preserves maximum nutrients and enzymes, delivering unparalleled taste and health benefits in every bottle.', '{"features": ["Organic ingredients only", "Cold-pressed for maximum nutrition", "No added sugars or preservatives", "Delivered fresh daily", "Eco-friendly packaging"]}', true, 3);
    
    -- Show results
    RAISE NOTICE 'Created client with ID: %', new_client_id;
END $$;
