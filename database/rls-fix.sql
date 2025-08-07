-- 🔧 RLS Policy Fix for User Registration
-- This addresses the circular dependency in user registration

-- Drop existing client_users policy
DROP POLICY IF EXISTS "client_users_access" ON client_users;

-- Create new policy that allows user registration
CREATE POLICY "client_users_access" ON client_users
    FOR ALL USING (
        -- Users can see their own record
        id = auth.uid() OR
        -- Users can see users in their client
        client_id = get_user_client_id() OR 
        -- Platform owners see all
        is_platform_owner()
    );

-- Allow INSERT for new user registration (first user becomes platform owner)
CREATE POLICY "client_users_insert" ON client_users
    FOR INSERT WITH CHECK (
        -- User can insert their own record
        id = auth.uid() OR
        -- Platform owners can insert any record
        is_platform_owner()
    );

-- Fix the URL configuration issue by updating Supabase redirect URLs
-- This needs to be done in the Supabase Dashboard manually:
-- 1. Go to: https://app.supabase.com/project/[PROJECT_ID]/auth/url-configuration
-- 2. Update Site URL to: http://localhost:4323
-- 3. Add redirect URLs: http://localhost:4323, http://localhost:4323/admin/dashboard

-- Add a comment to remind us to update the Supabase dashboard
SELECT 'RLS policies updated! Next: Update Supabase Site URL in dashboard' AS reminder;
