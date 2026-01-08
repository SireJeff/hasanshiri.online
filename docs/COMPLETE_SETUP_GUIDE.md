# Complete Setup Guide: Supabase + Vercel

This guide walks you through setting up your blog platform from scratch.

---

## Part 1: Supabase Setup (Database & Backend)

### Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and click "Start your project"
2. Sign up with GitHub (recommended) or email
3. Click "New Project"
4. Fill in:
   - **Organization**: Create one or select existing
   - **Project name**: `hasanshiri-blog` (or your preference)
   - **Database Password**: Generate a strong password and **SAVE IT**
   - **Region**: Choose closest to your users (e.g., Frankfurt for EU/ME)
5. Click "Create new project" and wait 2-3 minutes

### Step 2: Get Your API Credentials

1. Once project is ready, go to **Settings** (gear icon) → **API**
2. Copy and save these values:

```
Project URL:           https://xxxxx.supabase.co
anon public key:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key:      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

### Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard (left sidebar)
2. Click "New query"
3. Copy the ENTIRE contents of `supabase/schema.sql` from your project
4. Paste into the SQL editor
5. Click "Run" (or Ctrl+Enter)
6. You should see "Success. No rows returned" - this is correct!

### Step 4: Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click "New bucket"
3. Create bucket called `articles`:
   - Name: `articles`
   - Public bucket: ✅ **ON**
   - Click "Create bucket"
4. Create bucket called `avatars`:
   - Name: `avatars`
   - Public bucket: ✅ **ON**
   - Click "Create bucket"

### Step 5: Configure Storage Policies

For **articles** bucket:
1. Click on `articles` bucket
2. Click "Policies" tab
3. Click "New policy" → "For full customization"
4. Create these policies:

**Policy 1 - Public Read:**
```sql
Name: Allow public read
Allowed operation: SELECT
Target roles: (leave empty for all)
USING expression: true
```

**Policy 2 - Admin Upload:**
```sql
Name: Allow admin upload
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression:
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
)
```

**Policy 3 - Admin Delete:**
```sql
Name: Allow admin delete
Allowed operation: DELETE
Target roles: authenticated
USING expression:
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
)
```

Repeat the same for **avatars** bucket.

### Step 6: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** (should be enabled by default)
3. (Optional) Enable **GitHub**:
   - Go to GitHub → Settings → Developer Settings → OAuth Apps → New
   - Application name: `hasanshiri.online`
   - Homepage URL: `https://hasanshiri.online`
   - Callback URL: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### Step 7: Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - Site URL: `https://hasanshiri.online` (or `http://localhost:3000` for now)
   - Redirect URLs: Add these:
     ```
     http://localhost:3000/**
     https://hasanshiri.online/**
     https://*.vercel.app/**
     ```

### Step 8: Create Your Admin Account

1. Go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter your email and a password
4. Click "Create user"
5. Now go to **SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Step 9: Enable Realtime (for Chat)

1. Go to **Database** → **Replication**
2. Under "Realtime", enable these tables:
   - `chat_sessions`
   - `chat_messages`
   - `comments`

---

## Part 2: Vercel Setup (Hosting)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find `SireJeff/hasanshiri.online` and click "Import"
4. **Important**: If you haven't merged the PR yet, go to GitHub first and merge it

### Step 3: Configure Project Settings

On the import screen:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

### Step 4: Add Environment Variables

Click "Environment Variables" and add each of these:

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | From Supabase Settings → API (secret!) |
| `NEXT_PUBLIC_SITE_URL` | `https://hasanshiri.online` | Your domain |

**Add each one by:**
1. Enter Name
2. Enter Value
3. Keep "Production", "Preview", "Development" all checked
4. Click "Add"

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. If successful, you'll see a preview URL like `hasanshiri-online-xxx.vercel.app`

### Step 6: Configure Custom Domain

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Enter `hasanshiri.online` and click "Add"
4. Vercel will show you DNS records to add

### Step 7: Update DNS Records

Go to your domain registrar (where you bought hasanshiri.online) and add:

**Option A - Using Vercel Nameservers (Recommended):**
Change nameservers to:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B - Using A/CNAME Records:**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

Wait 5-60 minutes for DNS to propagate.

### Step 8: Update Supabase Redirect URLs

Go back to Supabase → Authentication → URL Configuration:
1. Change Site URL to: `https://hasanshiri.online`
2. Make sure redirect URLs include: `https://hasanshiri.online/**`

---

## Part 3: Post-Deployment Verification

### Test These Features:

- [ ] Homepage loads at `https://hasanshiri.online`
- [ ] Language toggle works (EN/FA)
- [ ] Theme toggle works (dark/light)
- [ ] Blog page loads at `/en/blog`
- [ ] Login works at `/auth/login`
- [ ] After login, admin dashboard loads at `/admin`
- [ ] Can create a test article
- [ ] Can upload an image
- [ ] Chat widget appears on homepage
- [ ] Comments can be submitted

### If Something Doesn't Work:

1. **Check Vercel logs**: Project → Deployments → Click latest → "Functions" tab
2. **Check browser console**: Right-click → Inspect → Console tab
3. **Verify env vars**: Vercel Settings → Environment Variables
4. **Check Supabase**: Dashboard → Logs (if API errors)

---

## Part 4: Optional - Sentry Error Tracking

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up (free tier is generous)
3. Create a new project → Select "Next.js"

### Step 2: Get Credentials

1. In project settings, find:
   - **DSN**: `https://xxx@xxx.ingest.sentry.io/xxx`
   - **Org slug**: Your organization name (URL)
   - **Project slug**: Your project name

2. Create auth token:
   - Settings → Auth Tokens → Create New Token
   - Scopes: `project:releases`, `org:read`

### Step 3: Add to Vercel

Add these environment variables in Vercel:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Your DSN |
| `SENTRY_ORG` | Your org slug |
| `SENTRY_PROJECT` | Your project slug |
| `SENTRY_AUTH_TOKEN` | Your auth token |

### Step 4: Redeploy

Go to Vercel → Deployments → click "..." on latest → "Redeploy"

---

## Quick Reference: All Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://hasanshiri.online

# Optional - Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx

# Optional - EmailJS (if using contact form email)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxx
```

---

## Troubleshooting

### "Invalid API key" error
- Double-check the `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure there are no extra spaces

### "relation does not exist" error
- Schema wasn't run properly
- Go to SQL Editor and run schema.sql again

### Images not uploading
- Check storage bucket policies
- Make sure buckets are set to "Public"

### Can't login
- Verify user exists in Supabase → Authentication → Users
- Check redirect URLs in Supabase auth settings

### Admin dashboard shows nothing
- Make sure your user has `role = 'admin'` in profiles table
- Run the SQL to update your role (Step 8 of Supabase setup)

---

**You're done!** Your blog platform should now be live. 🎉
