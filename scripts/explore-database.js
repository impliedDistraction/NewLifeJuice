// Check what data already exists in Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function exploreDatabase() {
    console.log('🔍 Exploring existing database content...')
    
    try {
        // Check clients
        console.log('\n📋 CLIENTS:')
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('*')
        
        if (clientsError) {
            console.error('❌ Error fetching clients:', clientsError.message)
        } else {
            console.log(`Found ${clients.length} clients:`)
            clients.forEach((client, i) => {
                console.log(`  ${i + 1}. ${client.name} (${client.business_type})`)
                console.log(`     Domain: ${client.domain || 'Not set'}`)
                console.log(`     ID: ${client.id}`)
            })
        }
        
        // Check products for each client
        if (clients && clients.length > 0) {
            for (const client of clients) {
                console.log(`\n🧃 PRODUCTS for ${client.name}:`)
                const { data: products, error: productsError } = await supabase
                    .from('client_products')
                    .select('*')
                    .eq('client_id', client.id)
                
                if (productsError) {
                    console.error('❌ Error fetching products:', productsError.message)
                } else {
                    console.log(`  Found ${products.length} products:`)
                    products.forEach(p => {
                        console.log(`    - ${p.name}: $${p.price} (${p.is_active ? 'Active' : 'Inactive'})`)
                    })
                }
            }
        }
        
        // Check content
        if (clients && clients.length > 0) {
            for (const client of clients) {
                console.log(`\n📄 CONTENT for ${client.name}:`)
                const { data: content, error: contentError } = await supabase
                    .from('client_content')
                    .select('*')
                    .eq('client_id', client.id)
                
                if (contentError) {
                    console.error('❌ Error fetching content:', contentError.message)
                } else {
                    console.log(`  Found ${content.length} content blocks:`)
                    content.forEach(c => {
                        console.log(`    - ${c.type}: ${c.title}`)
                    })
                }
            }
        }
        
        // Check auth users
        console.log('\n👥 AUTH USERS:')
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
            console.error('❌ Error fetching users:', authError.message)
        } else {
            console.log(`Found ${authData.users.length} registered users:`)
            authData.users.forEach((user, i) => {
                console.log(`  ${i + 1}. ${user.email} (${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'})`)
                console.log(`     Role: ${user.raw_user_meta_data?.role || 'Not set'}`)
                console.log(`     Created: ${new Date(user.created_at).toLocaleDateString()}`)
            })
        }
        
        console.log('\n🎯 DATABASE STATUS SUMMARY:')
        console.log(`✅ Clients: ${clients?.length || 0}`)
        console.log(`✅ Auth Users: ${authData?.users?.length || 0}`)
        console.log('\n💡 If you see New Life Juice data, your setup is COMPLETE!')
        console.log('🚀 You can now test the admin dashboard directly!')
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

exploreDatabase()
