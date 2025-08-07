# 🔧 Supabase Configuration Fix

## Issue: Email confirmation URL pointing to wrong localhost port

### Problem
- Email confirmation URL: `http://localhost:3000/#access_token=...`
- Current dev server: `http://localhost:4323`

### Solution
You need to update the Site URL in your Supabase project:

1. **Go to Supabase Dashboard**: https://app.supabase.com/project/hgfbogaljsgqzgrfeqmn
2. **Navigate to**: Settings → Auth → URL Configuration  
3. **Update Site URL** to: `http://localhost:4323`
4. **Add Redirect URLs**:
   - `http://localhost:4323`
   - `http://localhost:4323/admin`
   - `http://localhost:4323/admin/dashboard`
   - `https://newlifejuice.com` (for production)
   - `https://www.newlifejuice.com` (for production)

### Current Status
- ✅ Fixed RLS policy issue (first user becomes platform owner)
- ✅ Authentication system working
- ⚠️ Need to update Supabase Site URL
- ⚠️ Need to add client onboarding flow (Day 8-10)

### Next Steps
1. Update Supabase Site URL
2. Test email confirmation flow
3. Build client onboarding system for business registration
