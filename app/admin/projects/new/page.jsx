import { getProjectTags } from '@/lib/actions/projects'
import { ProjectForm } from '@/components/admin/projects/project-form'

export const metadata = {
  title: 'New Project | Admin',
}

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const { tags } = await getProjectTags()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new project to your portfolio
        </p>
      </div>

      <ProjectForm tags={tags} mode="create" />
    </div>
  )
}
