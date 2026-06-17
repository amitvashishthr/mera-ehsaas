# MeraEhsaas - 5-Day Development Roadmap

## Day 1: Foundation & Auth
- [ ] Set up Supabase project (create tables, enable RLS)
- [ ] Run `schema.sql` and `rls-policies.sql` in SQL Editor
- [ ] Run `seed.sql` for default categories & tags
- [ ] Configure Google OAuth in Supabase Dashboard
- [ ] Set up Storage buckets: `post-images` (public), `avatars` (public)
- [ ] `npm install` and configure `.env.local`
- [ ] Verify login/signup flow (Email OTP + Google)
- [ ] Verify profile auto-creation on signup

## Day 2: Core Posting Features
- [ ] Test creating text posts with categories and tags
- [ ] Test image upload to Supabase Storage
- [ ] Verify home feed displays posts with author info
- [ ] Test single post detail view
- [ ] Test like functionality (like/unlike toggle)
- [ ] Test comment section (add/delete comments)

## Day 3: Social Features
- [ ] Test user profile page (/user/username)
- [ ] Test follow/unfollow functionality
- [ ] Verify follower/following counts display correctly
- [ ] Test profile editing page
- [ ] Test category filtering (/category/slug)

## Day 4: Collections & Print Requests
- [ ] Test creating collections
- [ ] Test saving posts into collections
- [ ] Verify collection detail view shows saved posts
- [ ] Test deleting collections
- [ ] Test print request submission
- [ ] Verify print request status display

## Day 5: Admin Dashboard & Polish
- [ ] Set your user as admin: `UPDATE profiles SET role='admin' WHERE username='your_username';`
- [ ] Test admin dashboard stats
- [ ] Test admin user management (toggle roles)
- [ ] Test admin post moderation (hide/delete)
- [ ] Test admin print request management (approve/reject)
- [ ] Test admin categories/tags management
- [ ] Mobile responsiveness check
- [ ] Deploy to Vercel

---

## Supabase Setup Checklist

### 1. Create Project
- Go to https://supabase.com → New Project
- Note your `Project URL` and `Anon Key`

### 2. Run SQL Scripts (in order)
1. `supabase/schema.sql` - Creates all tables, indexes, triggers
2. `supabase/rls-policies.sql` - Enables Row Level Security
3. `supabase/seed.sql` - Inserts default categories & tags

### 3. Authentication Setup
- Dashboard → Authentication → Providers
- Enable **Email** (with OTP/Magic Link)
- Enable **Google** (add OAuth client ID from Google Cloud Console)
- Set redirect URL: `http://localhost:3000/auth/callback`

### 4. Storage Setup
- Dashboard → Storage → New Bucket
- Create `post-images` (Public)
- Create `avatars` (Public)
- Add storage policies (see commented section in rls-policies.sql)

### 5. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy
5. Update Supabase auth redirect URL to production domain

---

## Future Enhancements (Post-MVP)
- Real-time feed updates with Supabase Realtime
- Notifications system
- Search functionality
- Direct messaging
- Report/flag posts
- Analytics dashboard
- PWA support for mobile
- Dark mode
- Share to WhatsApp/Instagram
