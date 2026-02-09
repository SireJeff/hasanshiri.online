import { getProjectForEdit, getProjectTags } from '@/lib/actions/projects'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Project | Admin',
}

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({
  params,
}) {
  const { project } = await getProjectForEdit(params.id)
  const { tags } = await getProjectTags()

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update project information
        </p>
      </div>

      <ProjectForm tags={tags} project={project} mode="edit" />
    </div>
  )
}
