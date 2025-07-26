# Deployment Guide for DopaForge on Vercel

## Prerequisites
- GitHub repository (already set up at https://github.com/mistrzwujo098/dopaforge)
- Supabase project (already created)
- Vercel account

## Deployment Steps

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import the GitHub repository: `mistrzwujo098/dopaforge`
4. Select the repository and click "Import"

### 2. Configure Build Settings

In Vercel project settings, configure:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web` (IMPORTANT: Set this in Vercel dashboard)
- **Build Command**: Leave empty (uses default)
- **Output Directory**: Leave empty (uses default)
- **Install Command**: `pnpm install`

### 3. Set Environment Variables

In the Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://mlbfizagbfaolrqdwtjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYmZpemFnYmZhb2xycWR3dGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjExOTksImV4cCI6MjA2OTA5NzE5OX0.80ABn436DUncFoKuvgqzISQg3m9DIbeQ3QKqxuqNvGE
```

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at the provided Vercel URL

### 5. Configure Supabase Authentication

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your DopaForge project
3. Go to Authentication > URL Configuration
4. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 6. Enable Email Authentication

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired

### 7. Test the Application

1. Visit your deployed URL
2. Sign up with an email address
3. Check your email for the magic link
4. Click the link to sign in
5. Create your first micro-task!

## Custom Domain (Optional)

To add a custom domain:
1. In Vercel project settings, go to "Domains"
2. Add your domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

## Monitoring

- View deployment logs in Vercel dashboard
- Monitor database usage in Supabase dashboard
- Check browser console for any client-side errors

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Authentication Issues
- Verify Supabase URLs are correctly configured
- Check that redirect URLs include your domain
- Ensure email provider is enabled

### Database Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are properly configured

## Support

For issues, create an issue on GitHub: https://github.com/mistrzwujo098/dopaforge/issues