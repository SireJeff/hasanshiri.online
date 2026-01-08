import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Root metadata - will be overridden by locale layouts
export const metadata = {
  metadataBase: new URL('https://hasanshiri.online'),
  title: {
    default: 'Mohammad Hassan Shiri | Portfolio & Blog',
    template: '%s | Mohammad Hassan Shiri',
  },
  description:
    'Mohammad Hassan Shiri (MHS) - Physics Student at Sharif University, Data Scientist & Complex Systems Researcher.',
  robots: {
    index: true,
    follow: true,
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
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-background text-foreground relative">
            {children}
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
