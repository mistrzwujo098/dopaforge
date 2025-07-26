# Admin Setup Instructions

## Creating Admin Account

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mlbfizagbfaolrqdwtjt

2. Navigate to **Authentication > Users**

3. Click **Add user** → **Create new user**

4. Enter the following:
   - Email: `admin@dopaforge.com`
   - Password: `DopaForge2024!`
   - Auto Confirm User: ✓ (checked)

5. Click **Create user**

6. The user profile will be created automatically when you first log in.

## Testing Locally

```bash
# Start the development server
pnpm dev --filter=web

# Open http://localhost:3000
# Sign in with admin@dopaforge.com / DopaForge2024!
```

## Important Security Notes

- Change the admin password after first login
- Don't commit real passwords to the repository
- Use environment variables for production credentials
- Enable 2FA for admin accounts in production