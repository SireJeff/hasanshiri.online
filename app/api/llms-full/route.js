// app/api/llms-full/route.js
// Dynamic endpoint for AI/LLM crawlers - always returns current data from database
import { getSkillsGroupedByCategory } from '@/lib/actions/skills'
import { getAllProjectSlugs } from '@/lib/actions/projects'
import { getAllArticlesForSitemap } from '@/lib/actions/articles'
import { NAME_VARIANTS, ORGANIZATIONS, SOCIAL_PROFILES } from '@/lib/config/seo-config'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const isRtl = locale === 'fa'
  const baseUrl = 'https://www.hasanshiri.online'

  // Fetch all dynamic data in parallel
  const [skillsGrouped, projectSlugs, articles] = await Promise.all([
    getSkillsGroupedByCategory(),
    getAllProjectSlugs(),
    getAllArticlesForSitemap(),
  ])

  // Build skills section
  const skillsSection = skillsGrouped.map(group => {
    const categoryName = isRtl ? group.name_fa : group.name_en
    const skills = group.skills.map(skill => {
      const name = isRtl ? (skill.name_fa || skill.name_en) : skill.name_en
      const proficiency = skill.proficiency_level ? ` (${skill.proficiency_level}%)` : ''
      return `- ${name}${proficiency}`
    }).join('\n')

    return `### ${categoryName}\n${skills}`
  }).join('\n\n')

  // Build projects section
  const projectsSection = projectSlugs.length > 0
    ? `### Active Projects\n${projectSlugs.map(slug =>
        `- ${baseUrl}/${locale}/projects/${slug}`
      ).join('\n')}`
    : '### Active Projects\n(No projects yet)'

  // Build recent articles section
  const articlesSection = articles.length > 0
    ? `### Recent Articles\n${articles.slice(0, 10).map(article =>
        `- ${baseUrl}/${locale}/blog/${article.slug}`
      ).join('\n')}`
    : '### Recent Articles\n(No articles yet)'

  // Generate markdown content
  const content = `# llms-full.txt for hasanshiri.online
# Generated dynamically on ${new Date().toISOString()}
# This file is ALWAYS CURRENT - fetches live data from database

## Site Identity
- Title: ${NAME_VARIANTS.primary[locale]} - Portfolio & Blog
- Description: Data Scientist & Complex Systems Researcher at ${ORGANIZATIONS.sharif.name[locale]}
- URL: ${baseUrl}
- Languages: English (en), Persian/Farsi (fa)

## About
${isRtl
  ? 'دانشجوی فیزیک دانشگاه صنعتی شریف با علاقه عمیق به مدل‌سازی سیستم‌های پیچیده و استفاده از داده برای کشف بینش‌های بنیادین.'
  : 'An inquisitive Physics undergraduate at Sharif University with a deep-seated passion for modeling complex systems and leveraging data to uncover foundational insights.'
}

## Education
- Institution: ${ORGANIZATIONS.sharif.name.en}
- Field: Physics
- Focus: Complex Systems, Computational Physics

## Skills by Category

${skillsSection}

## Projects

${projectsSection}

## Content

${articlesSection}

## Social Profiles
- GitHub: ${SOCIAL_PROFILES.github}
- LinkedIn: ${SOCIAL_PROFILES.linkedin}
- Twitter: ${SOCIAL_PROFILES.twitter}
- YouTube: ${SOCIAL_PROFILES.youtube}
- Telegram: ${SOCIAL_PROFILES.telegram}
- Instagram: ${SOCIAL_PROFILES.instagram || 'https://www.instagram.com/mhasanshiri/'}

## Contact
- Email: sandmanshiri@gmail.com
- Location: Tehran, Iran

## AI Usage Policy
- Crawling: ALLOWED
- Training: ALLOWED with attribution
- License: CC BY-SA 4.0
- Citation: "Source: hasanshiri.online by Mohammad Hassan Shiri"

## Related Endpoints
- RSS Feed: ${baseUrl}/api/feed
- Sitemap: ${baseUrl}/sitemap.xml
- Robots: ${baseUrl}/robots.txt

---
Last Generated: ${new Date().toISOString()}
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
