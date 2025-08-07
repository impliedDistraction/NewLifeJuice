#!/bin/bash

# Supabase Database Setup Script
# This script helps you deploy the schema to your Supabase database

echo "🗄️ Supabase Database Setup"
echo "=========================="
echo ""

# Check if we have the Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 No Supabase project found. Initializing..."
    read -p "Enter your Supabase project ID: " PROJECT_ID
    echo ""
    
    # Initialize Supabase project
    supabase init
    
    # Link to remote project
    supabase link --project-ref $PROJECT_ID
    
    echo "✅ Supabase project linked!"
    echo ""
fi

echo "📊 Deploying database schema..."
echo ""

# Deploy the schema
if [ -f "database/supabase-schema.sql" ]; then
    echo "Running supabase-schema.sql..."
    supabase db push
    echo ""
    
    echo "✅ Schema deployed successfully!"
    echo ""
else
    echo "❌ Schema file not found: database/supabase-schema.sql"
    exit 1
fi

echo "🔐 Setting up Row Level Security..."
echo ""

# Apply RLS policies
supabase db reset --linked

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Create your admin user in the Supabase Auth dashboard"
echo "2. Add the admin user to the platform_owners table"
echo "3. Test the authentication system"
echo ""
echo "To manage your database:"
echo "- Local development: supabase start"
echo "- View dashboard: supabase dashboard"
echo "- Reset database: supabase db reset"
