# MeraEhsaas

A social platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- Authentication (Google + Email OTP)
- User profiles
- Text & image posts
- Categories and tags
- Like & comment on posts
- Follow users
- Collections (save posts)
- Print request page
- Admin dashboard

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage (image uploads)

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies: `npm install`
4. Run dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
