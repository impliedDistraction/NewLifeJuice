-- Verify existing client_files table and add missing RLS policy if needed
-- Run this in your Supabase SQL Editor

-- Check if client_files table structure is correct
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'client_files' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'client_files';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'client_files';

-- If RLS policy doesn't exist, create it:
DO $$
BEGIN
    -- Only create the policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'client_files' 
        AND policyname = 'client_files_access'
    ) THEN
        CREATE POLICY "client_files_access" ON client_files
            FOR ALL USING (
                client_id = get_user_client_id() OR is_platform_owner()
            );
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
