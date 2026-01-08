import { getAllArticlesForSitemap } from '@/lib/actions/articles'
import { i18nConfig } from '@/lib/i18n-config'

const baseUrl = 'https://hasanshiri.online'

export default async function sitemap() {
  // Get all published articles
  const articles = await getAllArticlesForSitemap()

  // Static pages for each locale
  const staticPages = ['', '/blog']

  // Generate static page entries for all locales
  const staticEntries = i18nConfig.locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'daily',
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: i18nConfig.locales.reduce((acc, loc) => {
          acc[loc] = `${baseUrl}/${loc}${page}`
          return acc
        }, {}),
      },
    }))
  )

  // Generate article entries for all locales
  const articleEntries = i18nConfig.locales.flatMap((locale) =>
    articles.map((article) => ({
      url: `${baseUrl}/${locale}/blog/${article.slug}`,
      lastModified: article.updated_at || article.published_at,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: i18nConfig.locales.reduce((acc, loc) => {
          acc[loc] = `${baseUrl}/${loc}/blog/${article.slug}`
          return acc
        }, {}),
      },
    }))
  )

  // Combine all entries
  return [...staticEntries, ...articleEntries]
}
