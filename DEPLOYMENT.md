# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [x] Database schema migrated (`supabase/schema-portfolio-cms.sql`)
- [ ] Site settings configured in admin panel
- [ ] Skills migrated to database
- [ ] Projects migrated to database

### 2. Environment Variables (Vercel)
These must be set in Vercel Project Settings → Environment Variables:

```
CRON_SECRET=rbSbCuGJWxX2+hA1f9CRdxTWfcDVRPc+NtbGUCa7dD0=
GITHUB_TOKEN=ghp_your-token-here (optional)
```

Already configured (from existing deployment):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- EmailJS settings
- Admin emails

### 3. Build Configuration
- [x] `next.config.js` - ESLint disabled during build
- [x] `vercel.json` - Cron job configured (daily at 2 AM UTC)
- [x] Production build tested successfully

### 4. Assets
- [x] Hero photo updated (`/public/your-photo.jpg`)
- [x] PWA icons generated (8 sizes: 72x72 to 512x512)
- [x] PWA manifest configured
- [x] Service worker configured

---

## 🚀 Deploy to Vercel

### Option 1: Automatic Deploy (Git Push)
```bash
git add .
git commit -m "feat: portfolio CMS implementation with PWA support"
git push origin main
```
Vercel will automatically deploy.

### Option 2: Manual Deploy via CLI
```bash
npx vercel --prod
```

### Option 3: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy" if needed

---

## 🔧 Post-Deployment Configuration

### 1. Configure Cron Job in Vercel
1. Go to Project → Settings → Cron Jobs
2. Add cron:
   - **Path**: `/api/cron`
   - **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

### 2. Test Production Site
Visit: https://hasanshiri.online

Check:
- [ ] Homepage loads correctly
- [ ] Hero photo displays
- [ ] Skills section shows database content
- [ ] Projects section shows database content
- [ ] Contact form works
- [ ] Admin panel accessible
- [ ] PWA installable (check browser install icon)

### 3. Test Admin Features
Visit: https://hasanshiri.online/admin

Test:
- [ ] Create new skill
- [ ] Create new project with GitHub auto-fill
- [ ] Edit page content
- [ ] Update site settings (contact, social)
- [ ] Upload images to media library

### 4. Test Cron Endpoint
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://hasanshiri.online/api/cron
```

Expected response:
```json
{
  "timestamp": "2026-02-09T...",
  "githubSync": { "success": true, ... },
  "scheduledPublish": { "success": true, ... }
}
```

---

## 📊 Performance Monitoring

### Vercel Analytics
- Check build duration
- Monitor First Load JS (target: <200KB)
- Check edge function response times

### PWA Testing
1. Open Chrome DevTools → Application
2. Check Manifest - should show app info
3. Check Service Workers - should be active
4. Test install prompt (Ctrl+Shift+P for profile)

---

## 🐛 Troubleshooting

### Build Failures
- Check `vercel.json` syntax
- Verify environment variables in Vercel dashboard
- Check deployment logs in Vercel dashboard

### Runtime Errors
- Check Vercel Function Logs
- Check Supabase logs
- Verify RLS policies are correct
- Test cron endpoint with valid Bearer token

### PWA Issues
- Clear browser cache
- Verify manifest.json is accessible
- Check service worker registration in console
- Ensure icons exist in `/public/icons/`

---

## 🔄 Rollback Plan

If issues occur:

1. **Quick Rollback**: Go to Vercel dashboard → Deployments → Click "Rollback" on previous successful deployment

2. **Database Rollback**: Run this SQL in Supabase:
   ```sql
   DROP TABLE IF EXISTS public.github_sync_logs CASCADE;
   DROP TABLE IF EXISTS public.page_content CASCADE;
   DROP TABLE IF EXISTS public.site_settings CASCADE;
   DROP TABLE IF EXISTS public.project_tag_relations CASCADE;
   DROP TABLE IF EXISTS public.project_tags CASCADE;
   DROP TABLE IF EXISTS public.projects CASCADE;
   DROP TABLE IF EXISTS public.skills CASCADE;
   DROP TABLE IF EXISTS public.skill_categories CASCADE;
   ```

3. **Code Rollback**: Revert to commit before CMS changes

---

## 📞 Support

For issues:
- Check Supabase logs for database errors
- Check Vercel logs for build/runtime errors
- Check browser console for client-side errors
- Review migration guide: `docs/portfolio-cms-migration-guide.md`

---

## ✨ New Features Live

After deployment, these features will be available:

- ✅ **Portfolio CMS** - Full admin control over skills, projects, content
- ✅ **GitHub Integration** - Auto-sync project stats from GitHub
- ✅ **Scheduled Publishing** - Articles publish automatically at scheduled time
- ✅ **PWA Support** - Installable as desktop/mobile app
- ✅ **Bilingual Content** - Full English/Persian support in admin
- ✅ **Contact Management** - Edit contact info from admin
- ✅ **Social Links** - Manage all social media links from admin

---

*Ready for production deployment!*
*Build tested successfully ✓*
