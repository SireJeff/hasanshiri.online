# hasanshiri.online

A modern bilingual blog and portfolio platform built with Next.js 14 and Supabase.

**Live Site:** [hasanshiri.online](https://hasanshiri.online)

## Features

- **Bilingual Support** - Full English and Persian (Farsi) with RTL support
- **Blog Platform** - Full CRUD for articles with TipTap rich text editor
- **Comments System** - Threaded comments with guest and authenticated users
- **Real-time Chat** - Floating chat widget with admin dashboard
- **Admin Dashboard** - Manage articles, comments, categories, tags, media, and settings
- **SEO Optimized** - Dynamic sitemap, robots.txt, JSON-LD structured data, hreflang tags
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Analytics** - Vercel Analytics and Speed Insights integration
- **Error Tracking** - Sentry integration (optional)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email + GitHub OAuth)
- **Styling:** Tailwind CSS
- **Editor:** TipTap
- **Hosting:** Vercel
- **Testing:** Jest + React Testing Library, Playwright (E2E)

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── [locale]/         # Localized public pages (en, fa)
│   ├── admin/            # Admin dashboard
│   ├── auth/             # Authentication pages
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities and actions
│   ├── actions/          # Server actions
│   └── supabase/         # Supabase client setup
├── public/               # Static assets
├── supabase/             # Database schema
├── __tests__/            # Unit tests
├── e2e/                  # E2E tests
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/SireJeff/hasanshiri.online.git
   cd hasanshiri.online
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run `supabase/schema.sql` in the SQL Editor
   - Create storage buckets: `articles` and `avatars` (public)

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |

## Documentation

- [Complete Setup Guide](docs/COMPLETE_SETUP_GUIDE.md) - Full Supabase + Vercel setup
- [Testing & Launch Guide](docs/TESTING_AND_LAUNCH.md) - Testing setup and pre-launch checklist

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Author

**Mohammad Hassan Shiri**

- Website: [hasanshiri.online](https://hasanshiri.online)
- Email: sandmanshiri@gmail.com
- LinkedIn: [mohammad-hasan-shiri-35b21119a](https://www.linkedin.com/in/mohammad-hasan-shiri-35b21119a)
- Twitter: [@jeffthedeafreff](https://x.com/jeffthedeafreff)

## License

This project is private. All rights reserved.
