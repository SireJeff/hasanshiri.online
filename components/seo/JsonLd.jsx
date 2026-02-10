// JSON-LD Structured Data Components for SEO

// Import centralized SEO configuration
import {
  NAME_VARIANTS,
  getPersonSchemaAlternateNames,
  getSameAsArray,
  ORGANIZATIONS,
} from '@/lib/config/seo-config'

// Base JSON-LD script component
function JsonLdScript({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Article/BlogPosting JSON-LD
export function ArticleJsonLd({ article, locale = 'en', url }) {
  const isRtl = locale === 'fa'
  const title = isRtl ? (article.title_fa || article.title_en) : article.title_en
  const description = isRtl
    ? (article.excerpt_fa || article.excerpt_en || '')
    : (article.excerpt_en || '')

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: article.featured_image || article.og_image,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author?.full_name || NAME_VARIANTS.primary.en,
      url: 'https://hasanshiri.online',
    },
    publisher: {
      '@type': 'Organization',
      name: NAME_VARIANTS.short.en,
      logo: {
        '@type': 'ImageObject',
        url: 'https://hasanshiri.online/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url: url,
    inLanguage: isRtl ? 'fa-IR' : 'en-US',
    ...(article.category && {
      articleSection: isRtl
        ? (article.category.name_fa || article.category.name_en)
        : article.category.name_en,
    }),
    ...(article.tags?.length > 0 && {
      keywords: article.tags
        .map((t) => (isRtl ? (t.name_fa || t.name_en) : t.name_en))
        .join(', '),
    }),
    ...(article.reading_time_minutes && {
      timeRequired: `PT${article.reading_time_minutes}M`,
    }),
    ...(article.view_count > 0 && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: article.view_count,
      },
    }),
  }

  return <JsonLdScript data={data} />
}

// Person JSON-LD (for about page / profile)
export function PersonJsonLd({ locale = 'en' }) {
  const isRtl = locale === 'fa'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: NAME_VARIANTS.primary[locale],
    alternateName: getPersonSchemaAlternateNames(),
    url: 'https://hasanshiri.online',
    image: 'https://hasanshiri.online/your-photo.jpg',
    jobTitle: isRtl ? 'دانشجوی فیزیک و دانشمند داده' : 'Physics Student & Data Scientist',
    worksFor: {
      '@type': 'Organization',
      name: ORGANIZATIONS.sharif.name[locale],
      url: ORGANIZATIONS.sharif.url,
    },
    alumniOf: {
      '@type': 'Organization',
      name: ORGANIZATIONS.sharif.name.en,
      url: ORGANIZATIONS.sharif.url,
    },
    knowsAbout: [
      'Physics',
      'Data Science',
      'Machine Learning',
      'Complex Systems',
      'Python',
      'Data Analysis',
    ],
    sameAs: getSameAsArray(),
  }

  return <JsonLdScript data={data} />
}

// Organization JSON-LD
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: NAME_VARIANTS.short.en,
    url: 'https://hasanshiri.online',
    logo: 'https://hasanshiri.online/logo.png',
    sameAs: getSameAsArray(),
  }

  return <JsonLdScript data={data} />
}

// WebSite JSON-LD (for search box enhancement)
export function WebSiteJsonLd({ locale = 'en' }) {
  // Reserved for future RTL-specific schema enhancements
  // eslint-disable-next-line no-unused-vars -- Reserved for future RTL enhancements
  const isRtl = locale === 'fa'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: NAME_VARIANTS.primary[locale],
    alternateName: [
      NAME_VARIANTS.short.en,
      NAME_VARIANTS.initials.en,
      NAME_VARIANTS.short.fa,
    ],
    url: 'https://hasanshiri.online',
    inLanguage: ['en-US', 'fa-IR'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://hasanshiri.online/${locale}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return <JsonLdScript data={data} />
}

// Blog JSON-LD (for blog listing page)
export function BlogJsonLd({ locale = 'en' }) {
  const isRtl = locale === 'fa'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: isRtl ? `بلاگ ${NAME_VARIANTS.short.fa}` : `${NAME_VARIANTS.short.en} Blog`,
    description: isRtl
      ? 'مقالاتی درباره فناوری، علم داده، فیزیک و سیستم‌های پیچیده'
      : 'Articles about technology, data science, physics, and complex systems',
    url: `https://hasanshiri.online/${locale}/blog`,
    inLanguage: isRtl ? 'fa-IR' : 'en-US',
    author: {
      '@type': 'Person',
      name: NAME_VARIANTS.primary.en,
      url: 'https://hasanshiri.online',
    },
    publisher: {
      '@type': 'Organization',
      name: NAME_VARIANTS.short.en,
      url: 'https://hasanshiri.online',
    },
  }

  return <JsonLdScript data={data} />
}

// FAQ JSON-LD (if you have FAQ content)
// eslint-disable-next-line no-unused-vars
export function FAQJsonLd({ faqs, locale = 'en' }) {
  if (!faqs?.length) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return <JsonLdScript data={data} />
}
