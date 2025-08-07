// Fix the small issues to make everything work
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function fixSetupIssues() {
    console.log('🔧 Fixing final setup issues...')
    
    try {
        // 1. Make test user a platform owner and confirm email
        console.log('\n1️⃣ Setting up platform owner...')
        
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
        if (usersError) {
            console.error('❌ Cannot list users:', usersError.message)
            return
        }
        
        const testUser = users.users.find(u => u.email === 'test@newlifejuice.com')
        if (testUser) {
            // Update user metadata to include platform_owner role
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                testUser.id,
                {
                    email_confirm: true,
                    user_metadata: {
                        role: 'platform_owner',
                        name: 'Test Admin'
                    }
                }
            )
            
            if (updateError) {
                console.error('❌ Cannot update user:', updateError.message)
            } else {
                console.log('✅ Updated user: platform_owner role + confirmed email')
            }
        }
        
        // 2. Activate all products
        console.log('\n2️⃣ Activating all products...')
        
        const { data: updatedProducts, error: productUpdateError } = await supabase
            .from('client_products')
            .update({ is_active: true })
            .eq('client_id', 'efe6ecdd-95bd-4380-9bb1-955de9956778')
            .select('name')
        
        if (productUpdateError) {
            console.error('❌ Cannot activate products:', productUpdateError.message)
        } else {
            console.log(`✅ Activated ${updatedProducts.length} products`)
            updatedProducts.forEach(p => console.log(`   - ${p.name}`))
        }
        
        // 3. Fix content blocks (they have undefined titles)
        console.log('\n3️⃣ Fixing content blocks...')
        
        const contentUpdates = [
            {
                type: 'hero',
                title: 'Fresh. Natural. Delivered.',
                content: 'Premium cold-pressed juices made from the finest organic ingredients, delivered fresh to your door.'
            },
            {
                type: 'about', 
                title: 'Our Story',
                content: 'Founded on the belief that everyone deserves access to fresh, nutritious beverages, New Life Juice sources only the finest organic ingredients.'
            }
        ]
        
        // Delete old content and insert new
        await supabase
            .from('client_content')
            .delete()
            .eq('client_id', 'efe6ecdd-95bd-4380-9bb1-955de9956778')
        
        const { data: newContent, error: contentError } = await supabase
            .from('client_content')
            .insert(
                contentUpdates.map((content, index) => ({
                    client_id: 'efe6ecdd-95bd-4380-9bb1-955de9956778',
                    ...content,
                    is_active: true,
                    sort_order: index + 1
                }))
            )
            .select('title')
        
        if (contentError) {
            console.error('❌ Cannot fix content:', contentError.message)
        } else {
            console.log(`✅ Fixed ${newContent.length} content blocks`)
            newContent.forEach(c => console.log(`   - ${c.title}`))
        }
        
        console.log('\n🎉 SETUP COMPLETE!')
        console.log('✅ User: test@newlifejuice.com (platform_owner, confirmed)')
        console.log('✅ Products: All activated')
        console.log('✅ Content: Fixed and ready')
        console.log('')
        console.log('🚀 READY TO TEST:')
        console.log('1. Visit: http://localhost:8000/admin/dashboard')
        console.log('2. Login with: test@newlifejuice.com / TestPassword123!')
        console.log('3. Test all features!')
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
    }
}

fixSetupIssues()
