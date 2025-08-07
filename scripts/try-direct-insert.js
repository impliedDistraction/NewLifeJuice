// Simple data insertion using SQL commands through Supabase RPC
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Use service role key for admin operations
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function insertDataDirectly() {
    console.log('🚀 Attempting direct data insertion...')
    
    try {
        // Try to insert data directly using SQL
        const { data: result, error } = await supabase.rpc('exec_sql', {
            query: `
                INSERT INTO clients (name, domain, business_type, business_info, branding, settings)
                VALUES (
                    'New Life Juice',
                    'newlifejuice.com', 
                    'juice-bar',
                    '{"tagline": "Fresh. Natural. Delivered.", "phone": "(555) 123-JUICE", "email": "orders@newlifejuice.com"}',
                    '{"primary_color": "#10B981", "secondary_color": "#F59E0B"}',
                    '{"features": ["online_ordering", "ai_content"]}'
                )
                RETURNING id, name;
            `
        })
        
        if (error) {
            console.error('❌ RPC method failed:', error.message)
            console.log('💡 This is expected - RPC exec_sql probably doesn\'t exist')
        } else {
            console.log('✅ Data inserted via RPC:', result)
        }
        
    } catch (error) {
        console.error('❌ RPC approach failed')
    }
    
    // Alternative: Try a simpler approach with minimal data
    console.log('\n🔄 Trying minimal data insertion...')
    
    try {
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                name: 'New Life Juice',
                business_type: 'juice-bar'
            })
            .select('id, name')
        
        if (clientError) {
            console.error('❌ Minimal insertion failed:', clientError.message)
            console.log('💡 RLS is definitely blocking. We need to create a platform owner first.')
            
            // Let's see if we can query the auth users
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
            
            if (authError) {
                console.error('❌ Cannot list auth users:', authError.message)
            } else {
                console.log(`📋 Found ${authUsers.users?.length || 0} auth users`)
                if (authUsers.users?.length > 0) {
                    console.log('   First user:', authUsers.users[0].email)
                }
            }
            
        } else {
            console.log('✅ Success! Client created:', client)
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

insertDataDirectly()
