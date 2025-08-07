// Test if sample data exists in Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Create Supabase client directly for testing
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing')
    console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Found' : '❌ Missing')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSampleData() {
    console.log('🔍 Checking for sample data...')
    console.log('🔗 Supabase URL:', supabaseUrl)
    
    try {
        // First test basic connection
        console.log('📡 Testing connection...')
        const { data: testData, error: testError } = await supabase
            .from('clients')
            .select('id')
            .limit(1)
        
        if (testError) {
            console.error('❌ Connection failed:', testError.message)
            console.error('❌ Full error:', testError)
            return
        }
        
        console.log('✅ Connection successful!')
        
        // Check for New Life Juice client
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('name', 'New Life Juice')
        
        if (clientError) {
            console.error('❌ Error fetching clients:', clientError.message)
            console.error('❌ Full error:', clientError)
            return
        }
        
        if (clients && clients.length > 0) {
            console.log('✅ Found New Life Juice client!')
            console.log('📋 Client info:', {
                id: clients[0].id,
                name: clients[0].name,
                domain: clients[0].domain,
                business_type: clients[0].business_type
            })
            
            // Check for sample products
            const { data: products, error: productError } = await supabase
                .from('client_products')
                .select('*')
                .eq('client_id', clients[0].id)
            
            if (productError) {
                console.error('❌ Error fetching products:', productError.message)
                return
            }
            
            console.log(`🧃 Found ${products?.length || 0} sample products`)
            if (products && products.length > 0) {
                console.log('📋 Sample products:')
                products.forEach(p => console.log(`   - ${p.name} ($${p.price})`))
            }
            
        } else {
            console.log('⚠️  No New Life Juice client found')
            console.log('💡 The sample data INSERT might have failed')
            console.log('   You can manually add a client or re-run the INSERT statements')
        }
        
        // Check auth users
        const { data: authData, error: authError } = await supabase.auth.getSession()
        console.log('🔐 Auth status:', authData.session ? 'Active session' : 'No session')
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

checkSampleData()
