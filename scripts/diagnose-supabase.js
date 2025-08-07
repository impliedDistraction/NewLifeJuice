// Comprehensive Supabase setup verification
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Comprehensive Supabase Setup Verification')
console.log('==============================================')

// Check environment variables
console.log('\n📋 Environment Variables:')
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Present' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('\n❌ Missing required environment variables')
    process.exit(1)
}

// Test with anon key
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Test with service key (if available)
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

async function testSupabaseSetup() {
    console.log('\n🔍 Testing Supabase Configuration...')
    
    try {
        // 1. Test basic connection
        console.log('\n1️⃣ Testing basic connection...')
        const { data: sessionData, error: sessionError } = await supabaseAnon.auth.getSession()
        
        if (sessionError) {
            console.error('❌ Auth connection failed:', sessionError.message)
            return
        }
        console.log('✅ Auth connection successful')
        
        // 2. Test if our schema exists
        console.log('\n2️⃣ Testing schema deployment...')
        const { data: tables, error: tablesError } = await supabaseAnon
            .from('clients')
            .select('id')
            .limit(1)
        
        if (tablesError) {
            console.error('❌ Schema not found:', tablesError.message)
            console.log('💡 This means the database schema hasn\'t been deployed yet')
            
            // Check what the error actually is
            if (tablesError.message.includes('relation "clients" does not exist')) {
                console.log('\n🚨 ISSUE FOUND: Database schema not deployed')
                console.log('📝 You need to run the SQL schema in Supabase dashboard')
                return 'SCHEMA_MISSING'
            } else if (tablesError.message.includes('row-level security')) {
                console.log('\n⚠️ Schema exists but RLS is blocking access (this is good!)')
                console.log('💡 Schema is deployed correctly, we just need auth')
                return 'SCHEMA_EXISTS_RLS_ACTIVE'
            }
        } else {
            console.log('✅ Schema exists and accessible')
            return 'SCHEMA_EXISTS_ACCESSIBLE'
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
        return 'ERROR'
    }
}

async function testServiceRoleAccess() {
    if (!supabaseService) {
        console.log('\n⚠️ No service role key provided, skipping admin tests')
        return
    }
    
    console.log('\n3️⃣ Testing service role access...')
    
    try {
        // Try to access with service role (bypasses RLS)
        const { data: clients, error: clientsError } = await supabaseService
            .from('clients')
            .select('*')
            .limit(1)
        
        if (clientsError) {
            console.error('❌ Service role access failed:', clientsError.message)
            
            if (clientsError.message.includes('relation "clients" does not exist')) {
                console.log('💡 Confirmed: Schema not deployed')
                return 'SCHEMA_MISSING'
            } else if (clientsError.message.includes('Invalid API key')) {
                console.log('💡 Service role key is incorrect')
                return 'INVALID_SERVICE_KEY'
            }
        } else {
            console.log('✅ Service role access working')
            console.log(`📊 Found ${clients?.length || 0} existing clients`)
            return 'SERVICE_ROLE_OK'
        }
        
    } catch (error) {
        console.error('❌ Service role test failed:', error.message)
        return 'ERROR'
    }
}

async function checkAuthSettings() {
    console.log('\n4️⃣ Checking Supabase Auth settings...')
    
    try {
        // Test user creation (this will tell us about auth configuration)
        const testEmail = 'setup-test@example.com'
        const { data, error } = await supabaseAnon.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!',
            options: {
                data: { role: 'test' }
            }
        })
        
        if (error) {
            if (error.message.includes('Email not confirmed')) {
                console.log('✅ Auth working - email confirmation required')
                return 'AUTH_OK_CONFIRM_REQUIRED'
            } else if (error.message.includes('already registered')) {
                console.log('✅ Auth working - user already exists')
                return 'AUTH_OK_USER_EXISTS'
            } else if (error.message.includes('Invalid login credentials')) {
                console.log('⚠️ Auth configuration issue:', error.message)
                return 'AUTH_CONFIG_ISSUE'
            } else {
                console.log('⚠️ Auth error:', error.message)
                return 'AUTH_ERROR'
            }
        } else {
            console.log('✅ Auth working - user created successfully')
            return 'AUTH_OK'
        }
        
    } catch (error) {
        console.error('❌ Auth test failed:', error.message)
        return 'ERROR'
    }
}

// Run all tests
async function runDiagnostics() {
    const schemaResult = await testSupabaseSetup()
    const serviceResult = await testServiceRoleAccess()
    const authResult = await checkAuthSettings()
    
    console.log('\n🎯 DIAGNOSIS SUMMARY')
    console.log('===================')
    console.log('Schema Status:', schemaResult)
    console.log('Service Role:', serviceResult || 'Not tested')
    console.log('Auth Status:', authResult)
    
    console.log('\n💡 RECOMMENDED NEXT STEPS:')
    
    if (schemaResult === 'SCHEMA_MISSING') {
        console.log('1. 🚨 CRITICAL: Deploy database schema to Supabase')
        console.log('   - Go to Supabase Dashboard → SQL Editor')
        console.log('   - Copy/paste contents of database/supabase-schema.sql')
        console.log('   - Execute the SQL to create tables')
        console.log('')
    }
    
    if (serviceResult === 'INVALID_SERVICE_KEY') {
        console.log('2. 🔑 Update service role key in .env file')
        console.log('   - Go to Supabase Dashboard → Settings → API')
        console.log('   - Copy the service_role key (not anon key)')
        console.log('')
    }
    
    if (authResult?.includes('AUTH_OK')) {
        console.log('3. ✅ Authentication is working correctly')
    } else {
        console.log('3. ⚠️ Check Supabase Auth settings if needed')
    }
    
    console.log('\n🚀 Once schema is deployed, you can:')
    console.log('   - Test user registration/login in the dashboard')
    console.log('   - Insert sample data for New Life Juice')
    console.log('   - Begin testing the full application')
}

runDiagnostics()
