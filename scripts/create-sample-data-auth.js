// Create sample data with proper authentication
import { supabase } from '../src/lib/supabase.js'
import dotenv from 'dotenv'

dotenv.config()

async function createSampleDataWithAuth() {
    console.log('🔐 Creating sample data with authentication...')
    
    try {
        // First, sign in our test user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@newlifejuice.com',
            password: 'TestPassword123!'
        })
        
        if (authError) {
            console.error('❌ Authentication failed:', authError.message)
            return
        }
        
        console.log('✅ Authenticated as:', authData.user.email)
        
        // Check if client already exists
        const { data: existingClients, error: checkError } = await supabase
            .from('clients')
            .select('*')
            .eq('name', 'New Life Juice')
        
        if (checkError) {
            console.error('❌ Error checking existing clients:', checkError.message)
            return
        }
        
        let client
        
        if (existingClients && existingClients.length > 0) {
            console.log('✅ Found existing New Life Juice client')
            client = existingClients[0]
        } else {
            console.log('📝 Creating New Life Juice client...')
            
            const { data: newClient, error: clientError } = await supabase
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
                        accent_color: '#EF4444'
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
                console.error('❌ Failed to create client:', clientError.message)
                return
            }
            
            client = newClient
            console.log('✅ Created client:', client.name)
        }
        
        // Now create sample products
        console.log('🧃 Creating sample products...')
        
        const products = [
            {
                client_id: client.id,
                name: 'Green Goddess',
                description: 'Kale, spinach, cucumber, green apple, lemon, ginger',
                price: 18.00,
                category: 'Green Juice',
                image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
                is_active: true,
                sort_order: 1
            },
            {
                client_id: client.id,
                name: 'Tropical Paradise',
                description: 'Pineapple, mango, coconut water, lime, mint',
                price: 18.00,
                category: 'Fruit Juice',
                image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
                is_active: true,
                sort_order: 2
            },
            {
                client_id: client.id,
                name: 'Citrus Burst',
                description: 'Orange, grapefruit, lemon, turmeric, black pepper',
                price: 18.00,
                category: 'Citrus Juice',
                image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400',
                is_active: true,
                sort_order: 3
            }
        ]
        
        // Check if products already exist
        const { data: existingProducts } = await supabase
            .from('client_products')
            .select('*')
            .eq('client_id', client.id)
        
        if (existingProducts && existingProducts.length > 0) {
            console.log(`✅ Found ${existingProducts.length} existing products`)
        } else {
            const { data: newProducts, error: productError } = await supabase
                .from('client_products')
                .insert(products)
                .select()
            
            if (productError) {
                console.error('❌ Failed to create products:', productError.message)
            } else {
                console.log(`✅ Created ${newProducts.length} products`)
            }
        }
        
        console.log('\n🎉 Sample data setup complete!')
        console.log('🌐 Visit http://localhost:4322/admin/dashboard to see the result')
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

createSampleDataWithAuth()
