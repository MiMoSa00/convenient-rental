# Vercel Deployment Guide

## Environment Variables Required

Before deploying to Vercel, you **must** set the following environment variables in your Vercel project dashboard:

### Supabase Configuration (REQUIRED)
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous public key

You can also use:
- `NEXT_PUBLIC_SUPABASE_URL` (will be used as fallback)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (will be used as fallback)

### NextAuth Configuration (REQUIRED)
- `NEXTAUTH_SECRET` - A secure random string for session encryption. Generate with:
  ```bash
  openssl rand -base64 32
  ```
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-domain.com`)

### Optional Environment Variables
- `NODE_ENV` - Set to `production` (usually auto-set by Vercel)

## How to Set Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Key: (variable name)
   - Value: (variable value)
   - Environments: Select **Production** (and **Preview** if desired)
4. Click **Save**
5. Redeploy your project: **Deployments** → **Redeploy** on latest commit

## How to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Click **Settings** → **API**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` (public) key → `SUPABASE_ANON_KEY`

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix: lazy load Supabase client for build compatibility"
   git push origin master
   ```

2. **Set environment variables in Vercel dashboard** (see steps above)

3. **Trigger a redeploy** in Vercel (or wait for auto-deploy from GitHub)

4. **Check build logs** - go to **Deployments** and check if the build succeeded

5. **Test the deployed site**:
   - Try registering a new account
   - Try logging in
   - Check the browser console for errors

## Troubleshooting

### Build fails with "supabaseUrl is required"
- **Cause**: Environment variables are not set in Vercel
- **Solution**: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the Vercel dashboard (see steps above)

### Login doesn't work
- **Cause**: `NEXTAUTH_URL` is not set to your production domain
- **Solution**: Set `NEXTAUTH_URL` in Vercel dashboard to your exact domain (e.g., `https://my-app.vercel.app`)

### "Invalid email or password" error after deployment
- **Cause**: User account was registered on development Supabase, but production uses different Supabase project
- **Solution**: Make sure you use the **same Supabase project** for both local dev and production. Or register a new account on the production site.

## Local Development

To run locally with the same setup:

1. Create a `.env.local` file in the project root:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXTAUTH_SECRET=your-random-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000
