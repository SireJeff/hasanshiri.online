import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import PWARegistrar from './components/pwa-registrar'

// Root metadata - will be overridden by locale layouts
export const metadata = {
  metadataBase: new URL('https://hasanshiri.online'),
  title: {
    default: 'Mohammad Hassan Shiri | Portfolio & Blog',
    template: '%s | Mohammad Hassan Shiri',
  },
  description:
    'Mohammad Hassan Shiri (MHS) - Physics Student at Sharif University, Data Scientist & Complex Systems Researcher.',
  openGraph: {
    images: [
      {
        url: '/og-image-default.png',
        width: 1200,
        height: 630,
        alt: 'Mohammad Hassan Shiri | Portfolio & Blog',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Portfolio',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

// Viewport settings for mobile
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href="https://supabase.co" />
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        {/* Theme Color */}
        <meta name="theme-color" content="#667eea" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-background text-foreground relative">
            {children}
          </div>
        </Providers>
        <PWARegistrar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
