#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * Initializes the multi-tenant database schema and sample data
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   SUPABASE_URL=', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY=', supabaseServiceKey ? '✅' : '❌')
    console.error('\nPlease add these to your .env file')
    process.exit(1)
}

// Create Supabase client with service role (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function executeSQLFile(filename) {
    try {
        console.log(`📝 Executing ${filename}...`)
        
        const sqlPath = path.join(__dirname, '..', 'database', filename)
        const sql = fs.readFileSync(sqlPath, 'utf8')
        
        // Split SQL into individual statements (rough approach)
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        for (const statement of statements) {
            if (statement.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: statement })
                if (error) {
                    console.error(`❌ Error executing statement:`, error)
                    console.error(`Statement:`, statement.substring(0, 100) + '...')
                    throw error
                }
            }
        }
        
        console.log(`✅ ${filename} executed successfully`)
    } catch (error) {
        console.error(`❌ Failed to execute ${filename}:`, error.message)
        throw error
    }
}

async function testDatabaseConnection() {
    try {
        console.log('🔌 Testing database connection...')
        
        const { data, error } = await supabase
            .from('clients')
            .select('count(*)')
            .limit(1)
        
        if (error) {
            throw error
        }
        
        console.log('✅ Database connection successful')
        return true
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        return false
    }
}

async function createStorageBuckets() {
    try {
        console.log('🪣 Creating storage buckets...')
        
        // Create client-assets bucket for file storage
        const { data, error } = await supabase.storage.createBucket('client-assets', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
            fileSizeLimit: 10485760 // 10MB
        })
        
        if (error && !error.message.includes('already exists')) {
            throw error
        }
        
        console.log('✅ Storage buckets created')
    } catch (error) {
        console.error('❌ Failed to create storage buckets:', error.message)
        throw error
    }
}

async function insertSampleData() {
    try {
        console.log('📊 Inserting sample data...')
        
        // Check if New Life Juice client already exists
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('name', 'New Life Juice')
            .single()
        
        if (existingClient) {
            console.log('✅ New Life Juice client already exists')
            return existingClient.id
        }
        
        // Create New Life Juice client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                name: 'New Life Juice',
                domain: 'newlifejuice.com',
                business_type: 'juice-bar',
                business_info: {
                    name: 'New Life Juice',
                    tagline: 'Premium Fresh Juice Delivered',
                    description: 'Premium fresh juice delivery service committed to your health and wellness journey.',
                    phone: '(555) 123-JUICE',
                    email: 'orders@newlifejuice.com',
                    address: '123 Health Street, Wellness City, CA 90210'
                },
                branding: {
                    primary_color: '#4CAF50',
                    secondary_color: '#FF6B35',
                    accent_color: '#FFC107',
                    font_family: 'Poppins'
                },
                settings: {
                    features: ['ai_content', 'ordering', 'analytics'],
                    integrations: ['formspree', 'openai'],
                    theme: 'health-focused'
                }
            })
            .select()
            .single()
        
        if (clientError) throw clientError
        
        console.log('✅ New Life Juice client created:', client.id)
        
        // Insert sample products
        const products = [
            {
                client_id: client.id,
                name: 'Green Goddess',
                description: 'A powerful blend of kale, spinach, cucumber, green apple, lemon, and ginger.',
                price: 18.00,
                category: 'Green Juices',
                metadata: {
                    ingredients: ['kale', 'spinach', 'cucumber', 'green apple', 'lemon', 'ginger'],
                    benefits: ['detox', 'energy', 'immunity']
                },
                sort_order: 1
            },
            {
                client_id: client.id,
                name: 'Citrus Sunrise',
                description: 'Bright and refreshing mix of orange, grapefruit, lemon, and a hint of mint.',
                price: 18.00,
                category: 'Citrus Juices',
                metadata: {
                    ingredients: ['orange', 'grapefruit', 'lemon', 'mint'],
                    benefits: ['vitamin c', 'hydration', 'mood boost']
                },
                sort_order: 2
            },
            {
                client_id: client.id,
                name: 'Berry Bliss',
                description: 'Antioxidant-rich combination of blueberries, strawberries, raspberries, and pomegranate.',
                price: 18.00,
                category: 'Berry Juices',
                metadata: {
                    ingredients: ['blueberries', 'strawberries', 'raspberries', 'pomegranate'],
                    benefits: ['antioxidants', 'heart health', 'brain function']
                },
                sort_order: 3
            },
            {
                client_id: client.id,
                name: 'Tropical Paradise',
                description: 'Escape to the tropics with pineapple, mango, coconut water, and lime.',
                price: 18.00,
                category: 'Tropical Juices',
                metadata: {
                    ingredients: ['pineapple', 'mango', 'coconut water', 'lime'],
                    benefits: ['hydration', 'digestion', 'vitamin c']
                },
                sort_order: 4
            },
            {
                client_id: client.id,
                name: 'Root Boost',
                description: 'Earthy and invigorating blend of carrot, beet, ginger, turmeric, and apple.',
                price: 18.00,
                category: 'Root Juices',
                metadata: {
                    ingredients: ['carrot', 'beet', 'ginger', 'turmeric', 'apple'],
                    benefits: ['anti-inflammatory', 'liver support', 'stamina']
                },
                sort_order: 5
            }
        ]
        
        const { error: productsError } = await supabase
            .from('client_products')
            .insert(products)
        
        if (productsError) throw productsError
        
        console.log('✅ Sample products created')
        
        return client.id
    } catch (error) {
        console.error('❌ Failed to insert sample data:', error.message)
        throw error
    }
}

async function main() {
    try {
        console.log('🚀 Starting Supabase database setup...')
        console.log('=' .repeat(50))
        
        // Test connection first
        const connected = await testDatabaseConnection()
        if (!connected) {
            console.log('\n💡 The database might not be initialized yet.')
            console.log('   You may need to run the schema manually in Supabase Dashboard first.')
            process.exit(1)
        }
        
        // Create storage buckets
        await createStorageBuckets()
        
        // Insert sample data
        const clientId = await insertSampleData()
        
        console.log('=' .repeat(50))
        console.log('✅ Supabase setup completed successfully!')
        console.log(`📊 New Life Juice Client ID: ${clientId}`)
        console.log('\n🎯 Next steps:')
        console.log('   1. Update your frontend to use Supabase authentication')
        console.log('   2. Test the admin dashboard with the new backend')
        console.log('   3. Migrate existing images to Supabase Storage')
        console.log('\n📖 Documentation: Check SUPABASE-SPRINT-PLAN.md for details')
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message)
        console.log('\n🔧 Troubleshooting:')
        console.log('   1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
        console.log('   2. Check that your Supabase project is active')
        console.log('   3. Run the schema manually in Supabase Dashboard if needed')
        process.exit(1)
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
    process.exit(1)
})

// Run the setup
main()
