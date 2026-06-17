# MeraEhsaas — Deployment Guide

## Prerequisites

1. A Supabase project with all migrations run
2. A Vercel account (or any Node.js hosting)
3. GitHub repository

## Environment Variables (Required)

Set these in Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Supabase Setup

### 1. Run Migrations (in order)

In Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/rls-policies.sql`
3. `supabase/seed.sql`
4. `supabase/migrations/add-category-description-icon.sql`
5. `supabase/migrations/create-notifications-table.sql`
6. `supabase/migrations/add-banned-role.sql`
7. `supabase/migrations/create-print-orders-table.sql`

### 2. Storage Buckets

Create in Supabase Dashboard → Storage:

- `post-images` (Public)
- `avatars` (Public)

### 3. Storage Policies

Run the commented SQL at the bottom of `rls-policies.sql` to add storage policies.

### 4. Authentication

- Enable Email (Magic Link) provider
- Enable Google OAuth provider
- Set redirect URL to `https://your-domain.com/auth/callback`

### 5. Realtime

Enable Realtime for the `comments` table:
Dashboard → Database → Replication → Enable for `comments`

### 6. Email Templates

Upload the templates from `supabase/email-templates/` in:
Dashboard → Authentication → Email Templates

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard for auto-deploys
```

### Security Headers

Add these to your Vercel project settings or use middleware:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Post-Deploy Checklist

- [ ] Verify login/signup works
- [ ] Verify Google OAuth redirects correctly
- [ ] Test image uploads
- [ ] Check dark mode
- [ ] Test on mobile
- [ ] Set your user as admin: `UPDATE profiles SET role='admin' WHERE username='you';`
- [ ] Verify admin panel access
- [ ] Test print order flow

## Performance

- Images use Next.js `<Image>` with AVIF/WebP
- Infinite scroll reduces initial payload
- Server components handle data fetching
- Client components are minimal and focused
