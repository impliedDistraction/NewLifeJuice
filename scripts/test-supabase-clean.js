// Simple Supabase connection test
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('🔧 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    try {
        // Test basic connection with auth
        console.log('📡 Testing database connection...')
        
        // Try to get session first (this tests the connection)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
            console.error('❌ Auth connection failed:', sessionError.message)
            return false
        }
        
        console.log('✅ Auth connection successful!')
        console.log('👤 Current session:', sessionData.session ? 'Active' : 'No session (expected)')
        
        // Test if our schema exists by trying to access clients table
        console.log('\n🔍 Checking for our custom tables...')
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('count')
            .limit(1)
        
        if (clientsError) {
            console.log('⚠️  Custom tables not found:', clientsError.message)
            console.log('\n📋 Next Steps:')
            console.log('   1. Go to your Supabase Dashboard: https://app.supabase.com/project/hgfbogaljsgqzgrfeqmn')
            console.log('   2. Navigate to SQL Editor')
            console.log('   3. Copy and run the contents of database/supabase-schema.sql')
            console.log('   4. Run this test again')
            return true // Connection works, just need schema
        } else {
            console.log('✅ Custom tables found!')
            console.log('📊 Ready for multi-tenant operations')
            
            // Check if sample data exists
            const { data: sampleClient } = await supabase
                .from('clients')
                .select('name')
                .eq('name', 'New Life Juice')
                .single()
            
            if (sampleClient) {
                console.log('🧪 Sample client "New Life Juice" found')
            } else {
                console.log('💡 No sample data found - you can run the setup script to populate')
            }
        }
        
        return true
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
        console.log('🔍 Error details:', error)
        return false
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\n🎉 Supabase connection test completed!')
        console.log('   Next: Deploy your schema using the Supabase Dashboard')
    } else {
        console.log('\n💥 Connection test failed')
        console.log('   Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env')
    }
    process.exit(success ? 0 : 1)
})
