// Check the actual table structure in Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function checkTableStructure() {
    console.log('🔍 Checking table structures...')
    
    try {
        // Try to get table info by attempting an insert with all null values
        console.log('\n📋 Testing clients table...')
        const { data: clientTest, error: clientError } = await supabase
            .from('clients')
            .insert({
                name: 'Test Client',
                business_type: 'test'
            })
            .select()
        
        if (clientError) {
            console.error('❌ Clients table error:', clientError.message)
            console.log('💡 This tells us about the expected columns')
        } else {
            console.log('✅ Clients table structure looks good')
            // Clean up test data
            await supabase.from('clients').delete().eq('name', 'Test Client')
        }
        
        // Check what tables exist
        console.log('\n🔍 Checking available tables...')
        const { data: tables, error: tablesError } = await supabase.rpc('get_table_names')
        
        if (tablesError) {
            console.log('⚠️  Could not get table list, but that\'s okay')
        } else {
            console.log('📋 Available tables:', tables)
        }
        
        // Try a simple select to see what columns exist
        console.log('\n📊 Checking clients table columns...')
        const { data: emptyResult, error: selectError } = await supabase
            .from('clients')
            .select('*')
            .limit(1)
            
        if (selectError) {
            console.error('❌ Select error:', selectError.message)
        } else {
            console.log('✅ Clients table accessible')
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

checkTableStructure()
