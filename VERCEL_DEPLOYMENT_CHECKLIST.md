# Vercel Deployment Checklist for DopaForge

## Pre-Deployment Requirements

### 1. Environment Variables (Required)
Configure these in Vercel Dashboard → Settings → Environment Variables:

#### Essential Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `GEMINI_API_KEY` - Google Gemini API key for AI features

#### Optional Variables:
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - For admin operations (if needed)
- [ ] `REDIS_URL` - For distributed rate limiting (recommended for production)

### 2. Supabase Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run database migrations (see APPLY_MIGRATIONS.md)
- [ ] Enable Email Auth in Supabase Dashboard
- [ ] Configure redirect URLs in Supabase:
  - Add `https://your-domain.vercel.app/auth/callback`
  - Add `http://localhost:3000/auth/callback` (for local development)

### 3. Build Configuration
Vercel should auto-detect these, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` or `turbo build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `npm install`
- **Root Directory**: `apps/web`

### 4. Domain Configuration
- [ ] Add custom domain (optional)
- [ ] Configure SSL (automatic with Vercel)
- [ ] Update Supabase redirect URLs with production domain

### 5. Security Checklist
- [ ] ✅ API keys removed from client-side code
- [ ] ✅ Environment variables in .gitignore
- [ ] ✅ Content Security Policy configured
- [ ] ✅ Rate limiting implemented
- [ ] ✅ CSRF protection enabled
- [ ] ✅ XSS vulnerabilities fixed

### 6. Performance Optimization
- [ ] ✅ Image optimization configured
- [ ] ✅ Code splitting implemented
- [ ] ✅ Service Worker for offline support
- [ ] ✅ Bundle size optimized

### 7. Testing Before Deploy
```bash
# Run locally with production build
npm run build
npm run start

# Run tests
npm test

# Check for TypeScript errors
npm run type-check
```

### 8. Post-Deployment Verification
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test AI task breakdown feature
- [ ] Test offline functionality
- [ ] Check all API endpoints are working
- [ ] Verify rate limiting is active
- [ ] Monitor error logs in Vercel dashboard

### 9. Monitoring Setup (Recommended)
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up Redis monitoring (if using Redis)

## Common Issues and Solutions

### Issue: "Missing environment variables"
**Solution**: Double-check all variables in Vercel dashboard, ensure no trailing spaces

### Issue: "Supabase connection failed"
**Solution**: 
1. Verify Supabase URL format: `https://[project-ref].supabase.co`
2. Check API keys are correct
3. Ensure redirect URLs are configured in Supabase

### Issue: "Build failed"
**Solution**: 
1. Check Node.js version compatibility (requires 18+)
2. Clear cache: `vercel --force`
3. Check build logs for specific errors

### Issue: "AI features not working"
**Solution**: 
1. Verify GEMINI_API_KEY is set correctly
2. Check API key has not exceeded quota
3. Test API key at https://makersuite.google.com

## Deployment Commands

### Initial Deployment
```bash
# From project root
cd apps/web
vercel

# Or deploy entire monorepo
vercel --cwd apps/web
```

### Update Deployment
```bash
# Automatic deployment on git push to main branch
git push origin main

# Manual deployment
vercel --prod
```

## Environment-Specific Settings

### Production
- Ensure `NODE_ENV=production` (set automatically by Vercel)
- All security headers active
- Generic error messages enabled
- Rate limiting enforced

### Preview
- Each PR gets a preview deployment
- Uses same environment variables as production
- Useful for testing before merge

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- DopaForge Issues: https://github.com/mistrzwujo098/dopaforge/issues