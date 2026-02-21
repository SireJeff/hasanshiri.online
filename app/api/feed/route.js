// app/api/feed/route.js
// RSS Feed endpoint for content syndication
import { getArticles } from '@/lib/actions/articles'
import { NAME_VARIANTS } from '@/lib/config/seo-config'

const BASE_URL = 'https://hasanshiri.online'

export async function GET() {
  const { articles } = await getArticles({ limit: 50 })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NAME_VARIANTS.short.en} Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Articles about technology, data science, physics, and complex systems by Mohammad Hassan Shiri</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/api/feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${articles.map(article => `
    <item>
      <title>${escapeXml(article.title_en)}</title>
      <link>${BASE_URL}/en/blog/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/en/blog/${article.slug}</guid>
      <description>${escapeXml(article.excerpt_en || '')}</description>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <author>sandmanshiri@gmail.com (${NAME_VARIANTS.primary.en})</author>
      ${article.category ? `<category>${escapeXml(article.category.name_en)}</category>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
