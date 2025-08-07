// Insert sample data for New Life Juice
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Use service role key to bypass RLS for initial setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function insertSampleData() {
    console.log('🚀 Inserting sample data for New Life Juice...')
    
    try {
        // Insert New Life Juice client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                name: 'New Life Juice',
                domain: 'newlifejuice.com',
                business_type: 'juice-bar',
                business_info: {
                    tagline: 'Fresh. Natural. Delivered.',
                    phone: '(555) 123-JUICE',
                    email: 'orders@newlifejuice.com',
                    address: '123 Fresh Street, Health City, CA 90210'
                },
                branding: {
                    primary_color: '#10B981',
                    secondary_color: '#F59E0B',
                    accent_color: '#EF4444',
                    logo_url: ''
                },
                settings: {
                    features: ['online_ordering', 'ai_content', 'analytics'],
                    delivery_enabled: true,
                    payment_methods: ['stripe', 'paypal']
                }
            })
            .select()
            .single()
        
        if (clientError) {
            console.error('❌ Error inserting client:', clientError.message)
            return
        }
        
        console.log('✅ Created client:', client.name)
        const clientId = client.id
        
        // Insert sample products
        const products = [
            {
                client_id: clientId,
                name: 'Green Goddess',
                description: 'Kale, spinach, cucumber, green apple, lemon, ginger',
                price: 18.00,
                category: 'Green Juice',
                image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
                is_active: true,
                sort_order: 1
            },
            {
                client_id: clientId,
                name: 'Tropical Paradise',
                description: 'Pineapple, mango, coconut water, lime, mint',
                price: 18.00,
                category: 'Fruit Juice',
                image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
                is_active: true,
                sort_order: 2
            },
            {
                client_id: clientId,
                name: 'Citrus Burst',
                description: 'Orange, grapefruit, lemon, turmeric, black pepper',
                price: 18.00,
                category: 'Citrus Juice',
                image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400',
                is_active: true,
                sort_order: 3
            },
            {
                client_id: clientId,
                name: 'Berry Antioxidant',
                description: 'Blueberry, strawberry, raspberry, pomegranate, acai',
                price: 18.00,
                category: 'Berry Juice',
                image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
                is_active: true,
                sort_order: 4
            },
            {
                client_id: clientId,
                name: 'Root Wellness',
                description: 'Carrot, beet, ginger, turmeric, lemon, cayenne',
                price: 18.00,
                category: 'Wellness Shot',
                image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400',
                is_active: true,
                sort_order: 5
            }
        ]
        
        const { data: insertedProducts, error: productError } = await supabase
            .from('client_products')
            .insert(products)
            .select()
        
        if (productError) {
            console.error('❌ Error inserting products:', productError.message)
            return
        }
        
        console.log(`✅ Inserted ${insertedProducts.length} products`)
        
        // Insert sample content blocks
        const contentBlocks = [
            {
                client_id: clientId,
                type: 'hero',
                title: 'Fresh. Natural. Delivered.',
                content: 'Premium cold-pressed juices made from the finest organic ingredients, delivered fresh to your door.',
                metadata: {
                    cta_text: 'Order Now',
                    background_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
                },
                is_active: true,
                sort_order: 1
            },
            {
                client_id: clientId,
                type: 'about',
                title: 'Our Story',
                content: 'Founded on the belief that everyone deserves access to fresh, nutritious beverages, New Life Juice sources only the finest organic ingredients to create our signature cold-pressed juices.',
                is_active: true,
                sort_order: 2
            },
            {
                client_id: clientId,
                type: 'benefits',
                title: 'Why Choose New Life Juice?',
                content: 'Our cold-press process preserves maximum nutrients and enzymes, delivering unparalleled taste and health benefits in every bottle.',
                metadata: {
                    features: [
                        'Organic ingredients only',
                        'Cold-pressed for maximum nutrition',
                        'No added sugars or preservatives',
                        'Delivered fresh daily',
                        'Eco-friendly packaging'
                    ]
                },
                is_active: true,
                sort_order: 3
            }
        ]
        
        const { data: insertedContent, error: contentError } = await supabase
            .from('client_content')
            .insert(contentBlocks)
            .select()
        
        if (contentError) {
            console.error('❌ Error inserting content:', contentError.message)
            return
        }
        
        console.log(`✅ Inserted ${insertedContent.length} content blocks`)
        
        console.log('\n🎉 Sample data successfully created!')
        console.log('📋 Summary:')
        console.log(`   - Client: ${client.name}`)
        console.log(`   - Products: ${insertedProducts.length}`)
        console.log(`   - Content blocks: ${insertedContent.length}`)
        console.log('\n💡 You can now test the authentication system!')
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
        console.error('Full error:', error)
    }
}

insertSampleData()
