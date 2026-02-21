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

// Project JSON-LD for SoftwareSourceCode schema
export function ProjectJsonLd({ project, locale = 'en' }) {
  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'
  const projectUrl = `${baseUrl}/${locale}/projects/${project.slug}`

  const title = isRtl
    ? (project.title_fa || project.title_en)
    : project.title_en
  const description = isRtl
    ? (project.description_fa || project.description_en)
    : project.description_en

  const keywords = [
    ...(project.tech_stack || []),
    ...(project.tags?.map(t => isRtl ? (t.name_fa || t.name_en) : t.name_en) || [])
  ]

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: title,
    description: description,
    url: projectUrl,
    codeRepository: project.github_url,
    ...(project.demo_url && { screenshot: project.demo_url }),
    ...(project.github_language && { programmingLanguage: project.github_language }),
    ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(project.created_at && { dateCreated: project.created_at }),
    ...(project.updated_at && { dateModified: project.updated_at }),
    author: {
      '@type': 'Person',
      name: 'Mohammad Hassan Shiri',
      url: baseUrl
    },
  }

  return <JsonLdScript data={data} />
}

// Dynamic Person JSON-LD with database skills (Async Component)
export async function PersonJsonLdDynamic({ locale = 'en' }) {
  const isRtl = locale === 'fa'

  // Dynamic import to avoid issues
  const { getSkillsGroupedByCategory } = await import('@/lib/actions/skills')
  const skillsGrouped = await getSkillsGroupedByCategory()

  const skillNames = skillsGrouped.flatMap(group =>
    group.skills.map(skill => isRtl ? (skill.name_fa || skill.name_en) : skill.name_en)
  )

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
    knowsAbout: skillNames,
    sameAs: getSameAsArray(),
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Bachelor Degree',
      recognizedBy: {
        '@type': 'Organization',
        name: ORGANIZATIONS.sharif.name[locale],
      },
      about: 'Physics',
    },
    hasSkill: skillsGrouped.flatMap(group =>
      group.skills.slice(0, 10).map(skill => ({
        '@type': 'Skill',
        name: isRtl ? (skill.name_fa || skill.name_en) : skill.name_en,
        ...(skill.proficiency_level && {
          proficiency: {
            '@type': 'QuantitativeValue',
            value: skill.proficiency_level,
            unitText: 'Percent',
          },
        }),
      }))
    ),
  }

  return <JsonLdScript data={data} />
}

// SpeakableSpecification for voice search optimization
export function SpeakableJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    cssSelector: [
      '#hero h1',
      '#hero p',
      '#about h2',
      '#about p',
      '#skills h2',
    ],
    xpath: [
      '/html/body/main/section[@id="hero"]/h1',
      '/html/body/main/section[@id="hero"]/p',
      '/html/body/main/section[@id="about"]/div/h2',
      '/html/body/main/section[@id="about"]/div/p',
    ],
  }

  return <JsonLdScript data={data} />
}

// HowTo schema for tutorial content (future use)
export function HowToJsonLd({ howTo, locale = 'en' }) {
  const isRtl = locale === 'fa'

  if (!howTo?.steps?.length) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: isRtl ? (howTo.name_fa || howTo.name_en) : howTo.name_en,
    description: isRtl ? (howTo.description_fa || howTo.description_en) : howTo.description_en,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: isRtl ? (step.name_fa || step.name_en) : step.name_en,
      text: isRtl ? (step.text_fa || step.text_en) : step.text_en,
    })),
  }

  return <JsonLdScript data={data} />
}
