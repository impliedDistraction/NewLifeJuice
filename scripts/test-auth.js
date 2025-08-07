// Test the authentication system by registering a test user
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function testAuth() {
    console.log('🔐 Testing authentication system...')
    
    try {
        // Test user registration
        const testEmail = 'test@newlifejuice.com'
        const testPassword = 'TestPassword123!'
        
        console.log(`📝 Attempting to register user: ${testEmail}`)
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    role: 'platform_owner' // Start with platform owner to bypass RLS
                }
            }
        })
        
        if (signUpError) {
            console.error('❌ Registration failed:', signUpError.message)
            
            // If user already exists, try to sign in
            if (signUpError.message.includes('already registered')) {
                console.log('🔄 User exists, trying to sign in...')
                
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                })
                
                if (signInError) {
                    console.error('❌ Sign in failed:', signInError.message)
                } else {
                    console.log('✅ Sign in successful!')
                    console.log('👤 User:', signInData.user.email)
                    console.log('🎫 Session:', signInData.session ? 'Active' : 'None')
                    
                    // Now try to access clients table
                    const { data: clients, error: clientsError } = await supabase
                        .from('clients')
                        .select('*')
                    
                    if (clientsError) {
                        console.error('❌ Cannot access clients:', clientsError.message)
                    } else {
                        console.log(`✅ Can access clients table! Found ${clients?.length || 0} clients`)
                    }
                }
            }
        } else {
            console.log('✅ Registration successful!')
            console.log('👤 User:', signUpData.user?.email)
            console.log('📧 Confirm email:', signUpData.user?.email_confirmed_at ? 'Confirmed' : 'Needs confirmation')
            
            if (signUpData.session) {
                console.log('🎫 Session active, testing access...')
                
                const { data: clients, error: clientsError } = await supabase
                    .from('clients')
                    .select('*')
                
                if (clientsError) {
                    console.error('❌ Cannot access clients:', clientsError.message)
                } else {
                    console.log(`✅ Can access clients table! Found ${clients?.length || 0} clients`)
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

testAuth()
