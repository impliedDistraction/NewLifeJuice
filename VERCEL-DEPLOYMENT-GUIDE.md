# Vercel Deployment Guide

## Environment Variables Setup

In your Vercel dashboard, set these environment variables:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI API (for AI assistant features)
OPENAI_API_KEY=your_openai_api_key

# Admin Access
ADMIN_PASSWORD=your_secure_admin_password
```

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Security Notes

- Never commit real API keys to git history
- Use environment variables for all sensitive data
- Rotate keys regularly
- Monitor usage and access logs

## Testing After Deployment

- Test authentication flow
- Verify Supabase connection
- Check admin dashboard access
- Validate form submissions
