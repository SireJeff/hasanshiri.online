import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// System font class
const fontClass = 'font-sans'

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontClass}>
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
