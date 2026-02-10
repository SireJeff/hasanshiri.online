/**
 * Centralized SEO Configuration
 *
 * This file contains all name variants and SEO-related data to maintain
 * consistency across the website and follow DRY principles.
 *
 * When adding/modifying name variants, update ONLY this file.
 *
 * @see docs/seo-analysis-and-recommendations.md
 */

// Name variants for SEO optimization
// These are used in: JSON-LD schema, meta keywords, OpenGraph, and content
export const NAME_VARIANTS = {
  // Primary name (official legal name)
  primary: {
    en: 'Mohammad Hassan Shiri',
    fa: 'محمد حسن شیری',
  },

  // Alternate name variants for search engines
  // Schema.org alternateName accepts array of strings
  alternate: {
    en: [
      'Hasan Shiri',          // Common nickname
      'Hassan Shiri',         // Alternative spelling
      'Mohamad Hasan Shiri',  // Alternative spelling
      'Muhammed Hassan Shiri',// Alternative spelling
      'Muhammad Hassan Shiri',// Alternative spelling
      'MHS',                  // Initials
      'M. H. Shiri',          // Abbreviated
      'Mohammad H. Shiri',    // Abbreviated
    ],
    fa: [
      'حسن شیری',            // Common nickname
      'محمدحسن شیری',        // Without space
      'محمد شیری',           // First name + last name
    ],
  },

  // Initials in both scripts
  initials: {
    en: 'MHS',
    fa: 'ام اچ اس',
  },

  // Short form (nickname only)
  short: {
    en: 'Hasan Shiri',
    fa: 'حسن شیری',
  },

  // Last name only
  lastName: {
    en: 'Shiri',
    fa: 'شیری',
  },
}

// Social media profile URLs
// Used in JSON-LD sameAs array and other references
export const SOCIAL_PROFILES = {
  github: 'https://github.com/SireJeff',
  linkedin: 'https://www.linkedin.com/in/mohammadhasanshiri',
  twitter: 'https://x.com/MHasanshiri',
  youtube: 'https://www.youtube.com/@sire_jeff',
  telegram: 'https://t.me/Mhasanshiri',
  // Add more social profiles as needed
}

// Twitter handle for twitter.creator meta tag
// Note: Should NOT include @ symbol
export const TWITTER_HANDLE = 'MHasanshiri'

// Organization affiliations
export const ORGANIZATIONS = {
  sharif: {
    name: {
      en: 'Sharif University of Technology',
      fa: 'دانشگاه صنعتی شریف',
    },
    shortName: {
      en: 'Sharif University',
      fa: 'دانشگاه شریف',
    },
    url: 'https://en.sharif.edu/',
  },
  isfahan: {
    name: {
      en: 'University of Isfahan',
      fa: 'دانشگاه اصفهان',
    },
    url: 'https://en.ui.ac.ir/',
  },
}

// Helper function to get all name variants as a flat array
// Useful for meta keywords generation
export function getAllNameVariants(locale = 'en') {
  const isRtl = locale === 'fa'

  return [
    NAME_VARIANTS.primary[locale],
    ...NAME_VARIANTS.alternate[locale],
    NAME_VARIANTS.initials[locale],
    NAME_VARIANTS.short[locale],
  ]
}

// Helper function to get comma-separated keywords string
// Useful for legacy SEO fields that require comma-separated values
export function getKeywordString(locale = 'en') {
  return getAllNameVariants(locale).join(', ')
}

// Helper function to get person schema data
// Returns the complete alternateName array for Schema.org
export function getPersonSchemaAlternateNames() {
  return [
    ...NAME_VARIANTS.alternate.en,
    ...NAME_VARIANTS.alternate.fa,
    NAME_VARIANTS.initials.en,
    NAME_VARIANTS.initials.fa,
  ]
}

// Helper function to get sameAs array for JSON-LD
// Returns properly formatted social profile URLs
export function getSameAsArray() {
  return Object.values(SOCIAL_PROFILES).filter(Boolean)
}

// Helper function to get creator name for metadata
// Returns locale-appropriate creator name
export function getCreatorName(locale = 'en') {
  return NAME_VARIANTS.primary[locale]
}

// Default export for convenience
export default {
  NAME_VARIANTS,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
  ORGANIZATIONS,
  getAllNameVariants,
  getKeywordString,
  getPersonSchemaAlternateNames,
  getSameAsArray,
  getCreatorName,
}
