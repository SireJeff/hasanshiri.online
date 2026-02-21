import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProjectBySlug } from '@/lib/actions/projects'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { ProjectJsonLd } from '@/components/seo/JsonLd'
import { ArrowLeft, Calendar, ExternalLink, Github, Tag, Home } from 'lucide-react'
import { generateAlternateUrls } from '@/lib/i18n-config'

// Force dynamic rendering to avoid cookies() error in generateStaticParams
export const dynamic = 'force-dynamic'

// Generate metadata
export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const { project } = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project Not Found' }
  }

  const isRtl = locale === 'fa'
  const baseUrl = 'https://hasanshiri.online'
  const alternates = generateAlternateUrls(`/projects/${slug}`, baseUrl)

  const title = isRtl
    ? (project.title_fa || project.title_en)
    : project.title_en
  const description = isRtl
    ? (project.description_fa || project.description_en || project.long_description_fa || project.long_description_en || '')
    : (project.description_en || project.long_description_en || '')

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/projects/${slug}`,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: isRtl ? 'fa_IR' : 'en_US',
      url: `${baseUrl}/${locale}/projects/${slug}`,
      images: project.featured_image ? [
        {
          url: project.featured_image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.featured_image ? [project.featured_image] : [],
    },
  }
}

export default async function ProjectPage({ params }) {
  const { locale, slug } = await params
  const { project, error } = await getProjectBySlug(slug)

  if (error || !project) {
    notFound()
  }

  // Check if project is active (for non-admin users)
  if (project.status !== 'active') {
    notFound()
  }

  const isRtl = locale === 'fa'
  const title = isRtl ? (project.title_fa || project.title_en) : project.title_en
  const description = isRtl ? (project.description_fa || project.description_en) : project.description_en
  const longDescription = isRtl
    ? (project.long_description_fa || project.long_description_en || description)
    : (project.long_description_en || description)

  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString(
        isRtl ? 'fa-IR' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null

  // Breadcrumb items
  const breadcrumbItems = [
    { label: isRtl ? 'خانه' : 'Home', href: `/${locale}` },
    { label: isRtl ? 'پروژه‌ها' : 'Projects', href: `/${locale}#projects` },
    { label: title },
  ]

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ProjectJsonLd project={project} locale={locale} />

      <div className="min-h-screen bg-background">
      {/* Header / Hero */}
      <header className="relative">
        {/* Featured Image */}
        {project.featured_image && (
          <div className="relative h-[40vh] md:h-[50vh] w-full">
            <Image
              src={project.featured_image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}

        {/* Title area */}
        <div className="container relative">
          <div className={`max-w-4xl mx-auto ${project.featured_image ? '-mt-32 relative z-10' : 'pt-12'}`}>
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} locale={locale} />

            {/* Navigation links */}
            <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary"
                title={isRtl ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{isRtl ? 'خانه' : 'Home'}</span>
              </Link>
              <Link
                href={`/${locale}#projects`}
                className={`inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                {isRtl ? 'بازگشت به پروژه‌ها' : 'Back to projects'}
              </Link>
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                className="text-xl text-muted-foreground mb-6"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {description}
              </p>
            )}

            {/* Meta */}
            <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Date */}
              {formattedDate && (
                <span className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <Tag className="w-4 h-4 text-muted-foreground" />
                {project.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="text-sm px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
                  >
                    {isRtl ? (tag.name_fa || tag.name_en) : tag.name_en}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex flex-wrap gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cosmic-button flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  {isRtl ? 'مشاهده دمو' : 'View Demo'}
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                >
                  <Github size={18} />
                  {isRtl ? 'مشاهده در گیت‌هاب' : 'View on GitHub'}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Long Description */}
          <article
            className="prose prose-lg dark:prose-invert max-w-none"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {longDescription ? (
              <div
                className="project-content"
                dangerouslySetInnerHTML={{ __html: longDescription }}
              />
            ) : (
              <p className="text-muted-foreground">
                {isRtl ? 'توضیحات بیشتری برای این پروژه موجود نیست.' : 'No additional details available for this project.'}
              </p>
            )}
          </article>

          {/* Tech Stack / Additional Info */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2
                className="text-2xl font-bold mb-4"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {isRtl ? 'فناوری‌های استفاده شده' : 'Technologies Used'}
              </h2>
              <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {project.tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  )
}
