# DopaForge Deployment Guide

## Prerequisites
- Vercel account connected to your GitHub repository
- Supabase project with database setup
- Environment variables from Supabase dashboard

## Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your DopaForge project
3. Go to Settings → API
4. Copy these values:
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key → SUPABASE_SERVICE_ROLE_KEY (keep this secret!)

## Step 2: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your DopaForge project
3. Go to Settings → Environment Variables
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase Project URL | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon key | Production, Preview, Development |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key | Production, Preview, Development |

## Step 3: Redeploy

1. After adding all environment variables, go to the Deployments tab
2. Click on the three dots (...) next to the latest deployment
3. Select "Redeploy"
4. Wait for the deployment to complete

## Step 4: Verify Deployment

1. Once deployed, visit your Vercel URL
2. The dashboard should now load properly
3. Test all features to ensure they're working correctly

## Troubleshooting

### If deployment still fails:

1. Check the build logs in Vercel for any errors
2. Ensure all environment variables are correctly set
3. Try clearing Vercel cache: Settings → Advanced → Clear Cache

### If features don't work after deployment:

1. Check browser console for errors
2. Ensure your Supabase database has the correct schema
3. Verify RLS policies are properly configured in Supabase

## Database Setup (if needed)

If you haven't set up your Supabase database yet:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the migration scripts from `/supabase/migrations/`
4. Set up Row Level Security (RLS) policies as needed

## Performance Optimization

The app includes:
- Service Worker for offline functionality
- PWA manifest for installability
- Optimized caching headers
- Next.js automatic code splitting

## Monitoring

After deployment:
1. Monitor the Vercel Functions tab for API performance
2. Check Supabase dashboard for database usage
3. Use Vercel Analytics to track user engagement