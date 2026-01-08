import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { i18nConfig } from './lib/i18n-config'

// Get preferred locale from request
function getPreferredLocale(request) {
  // Check cookie first
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && i18nConfig.locales.includes(localeCookie)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((lang) => {
      const [code, priority] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0].toLowerCase(),
        priority: priority ? parseFloat(priority) : 1,
      }
    })

    // Sort by priority
    languages.sort((a, b) => b.priority - a.priority)

    // Find first matching locale
    for (const lang of languages) {
      if (i18nConfig.locales.includes(lang.code)) {
        return lang.code
      }
      // Check for Persian variations
      if (lang.code === 'fa' || lang.code === 'per' || lang.code === 'fas') {
        return 'fa'
      }
    }
  }

  return i18nConfig.defaultLocale
}

// Check if path should skip locale handling
function shouldSkipLocale(pathname) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  )
}

// Handle Supabase session update
async function handleSupabaseSession(request, response) {
  // Skip if Supabase env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }

      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      if (adminEmails.length > 0 && !adminEmails.includes(user.email)) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware Supabase error:', error)
    return response
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Handle locale routing for public pages
  if (!shouldSkipLocale(pathname)) {
    // Check if pathname has a valid locale prefix
    const pathnameHasLocale = i18nConfig.locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (!pathnameHasLocale) {
      // No locale in pathname, redirect to preferred locale
      const preferredLocale = getPreferredLocale(request)
      const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url)
      newUrl.search = request.nextUrl.search

      const response = NextResponse.redirect(newUrl)
      response.cookies.set('NEXT_LOCALE', preferredLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      })

      return response
    }
  }

  // Create base response
  let response = NextResponse.next({ request })

  // Handle Supabase session for all routes
  response = await handleSupabaseSession(request, response)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
