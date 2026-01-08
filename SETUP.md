# Blog Platform Setup Guide

This document explains how to set up and configure the blog platform for hasanshiri.online.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 14+)                      │
│            App Router, SSR/SSG, React Server Components      │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Supabase)                        │
│       PostgreSQL • Auth • Real-time • Storage                │
├─────────────────────────────────────────────────────────────┤
│                   Deployment (Vercel)                        │
│              Edge Functions • CDN • Analytics                │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Storage | Supabase Storage |
| i18n | i18next (EN/FA) |
| Deployment | Vercel |

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Restrict admin access to specific emails
ADMIN_EMAILS=admin@hasanshiri.online
```

### 3. Run Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create all tables and policies

### 4. Configure Authentication

In Supabase Dashboard > Authentication:

1. **Enable Email Auth:**
   - Go to Providers > Email
   - Enable "Confirm email" if you want email verification

2. **Enable Social Auth (Optional):**
   - Go to Providers > Google
   - Add your Google OAuth credentials
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

3. **Configure Site URL:**
   - Go to URL Configuration
   - Set Site URL: `http://localhost:3000` (or your production URL)
   - Add redirect URLs for OAuth callbacks

### 5. Create Storage Buckets

In Supabase Dashboard > Storage:

1. Create bucket `articles` (public)
2. Create bucket `avatars` (public)

Add these policies for each bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'articles');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'articles'
    AND auth.role() = 'authenticated'
  );
```

### 6. Set Your Admin Role

After signing up, update your profile to admin role:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 7. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` for the main site and `http://localhost:3000/admin` for the admin dashboard.

## Project Structure

```
hasanshiri.online/
├── app/                    # Next.js App Router
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Home page
│   ├── providers.jsx      # Client providers (theme, i18n)
│   ├── globals.css        # Global styles
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── callback/
│   ├── admin/             # Admin dashboard
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   └── ...
│   └── blog/              # Blog pages (Phase 2)
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients
│   │   ├── client.js     # Browser client
│   │   ├── server.js     # Server client
│   │   └── middleware.js # Auth middleware
│   ├── i18n.js           # i18next config
│   ├── utils.js          # Utility functions
│   └── locales/          # Translation files
├── hooks/                 # React hooks
├── supabase/             # Supabase config
│   └── schema.sql        # Database schema
├── public/               # Static assets
├── middleware.js         # Next.js middleware
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind config
└── package.json
```

## Database Schema

### Core Tables

- **profiles** - User profiles (extends auth.users)
- **categories** - Article categories
- **tags** - Article tags
- **articles** - Blog articles (bilingual)
- **article_tags** - Article-tag relations
- **comments** - User comments (supports guest + authenticated)
- **chat_sessions** - Chat conversations
- **chat_messages** - Chat messages
- **article_views** - View analytics

### Key Features

- **Row Level Security (RLS)** - All tables have security policies
- **Bilingual Support** - `*_en` and `*_fa` fields for content
- **Automatic Timestamps** - `created_at` and `updated_at` triggers
- **View Counting** - Automatic view count increment
- **Reading Time** - Calculated from content length

## Authentication Flow

1. User visits `/admin` → Redirected to `/auth/login`
2. User logs in via Email/Google/GitHub
3. Supabase creates session, redirects to `/auth/callback`
4. Callback exchanges code for session
5. User redirected to `/admin` with valid session
6. Middleware validates session on each request

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://hasanshiri.online
ADMIN_EMAILS=admin@hasanshiri.online
```

## Next Steps (Future Phases)

- **Phase 2:** Blog Core Implementation (article CRUD, editor, listing)
- **Phase 3:** Comment System (moderation, spam prevention)
- **Phase 4:** Chat Contact Form (real-time messaging)
- **Phase 5:** SEO Enhancement (structured data, sitemap)
- **Phase 6:** Admin Dashboard (analytics, media library)
- **Phase 7:** Testing & Launch

## Troubleshooting

### "RLS policy violation" errors
- Check that your user has the correct role in profiles table
- Verify RLS policies in Supabase Dashboard

### Auth not working
- Check redirect URLs in Supabase Dashboard
- Verify environment variables are set correctly
- Check browser console for errors

### Styles not loading
- Run `npm run dev` to rebuild
- Clear `.next` folder and restart

## Support

For issues with this setup, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
