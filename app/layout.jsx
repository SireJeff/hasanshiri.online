import './globals.css'
import { Providers } from './providers'

// System font class
const fontClass = 'font-sans'

export const metadata = {
  title: {
    default: 'Mohammad Hassan Shiri | Portfolio & Blog',
    template: '%s | Mohammad Hassan Shiri',
  },
  description:
    'Mohammad Hassan Shiri (MHS) - Physics Student at Sharif University, Data Scientist & Complex Systems Researcher. Expertise in Data Analysis and Machine Learning.',
  keywords: [
    'Mohammad Hassan Shiri',
    'Hasan Shiri',
    'MHS',
    'Physics Student',
    'Data Scientist',
    'Sharif University',
    'Complex Systems',
    'Python',
    'Data Analysis',
    'Machine Learning',
    'Blog',
  ],
  authors: [{ name: 'Mohammad Hassan Shiri' }],
  creator: 'Mohammad Hassan Shiri',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fa_IR',
    url: 'https://hasanshiri.online',
    siteName: 'Mohammad Hassan Shiri',
    title: 'Mohammad Hassan Shiri | Portfolio & Blog',
    description:
      'Physics Student at Sharif University, Data Scientist & Complex Systems Researcher.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohammad Hassan Shiri | Portfolio & Blog',
    description:
      'Physics Student at Sharif University, Data Scientist & Complex Systems Researcher.',
  },
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
      </body>
    </html>
  )
}
