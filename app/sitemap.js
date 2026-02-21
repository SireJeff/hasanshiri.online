import { getAllArticlesForSitemap } from '@/lib/actions/articles'
import { getAllProjectSlugs } from '@/lib/actions/projects'
import { i18nConfig } from '@/lib/i18n-config'

const getBaseUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hasanshiri.online'

export default async function sitemap() {
  const baseUrl = getBaseUrl()

  // Get all published articles and projects
  const [articles, projectSlugs] = await Promise.all([
    getAllArticlesForSitemap(),
    getAllProjectSlugs(),
  ])

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

  // Generate project entries for all locales
  const projectEntries = i18nConfig.locales.flatMap((locale) =>
    projectSlugs.map((project) => ({
      url: `${baseUrl}/${locale}/projects/${project.slug}`,
      lastModified: project.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: i18nConfig.locales.reduce((acc, loc) => {
          acc[loc] = `${baseUrl}/${loc}/projects/${project.slug}`
          return acc
        }, {}),
      },
    }))
  )

  // Combine all entries
  return [...staticEntries, ...articleEntries, ...projectEntries]
}
