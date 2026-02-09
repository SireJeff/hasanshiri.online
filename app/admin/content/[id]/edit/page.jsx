import { getPageContentForEdit } from '@/lib/actions/page-content'
import { ContentEditor } from '@/components/admin/content/content-editor'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Content | Admin',
}

export const dynamic = 'force-dynamic'

export default async function EditContentPage({
  params,
}) {
  const { content } = await getPageContentForEdit(params.id)

  if (!content) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Page Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update content for {content.page_slug} / {content.section_key}
        </p>
      </div>

      <ContentEditor content={content} mode="edit" />
    </div>
  )
}
