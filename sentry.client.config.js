import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sampling rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Replay sampling rates
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Environment
  environment: process.env.NODE_ENV,

  // Filter out common benign errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
    // Cancel errors
    'AbortError',
    'cancelled',
    // User-triggered errors
    'User denied',
  ],

  // Before sending error
  beforeSend(event) {
    // Filter out errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames
      const hasExtensionFrame = frames.some(
        (frame) =>
          frame.filename?.includes('extension') ||
          frame.filename?.includes('chrome-extension') ||
          frame.filename?.includes('moz-extension')
      )
      if (hasExtensionFrame) {
        return null
      }
    }
    return event
  },
})
