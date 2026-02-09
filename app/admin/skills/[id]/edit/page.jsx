import { getSkillById, getSkillCategories } from '@/lib/actions/skills'
import { SkillForm } from '@/components/admin/skills/skill-form'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Skill | Admin',
}

export const dynamic = 'force-dynamic'

export default async function EditSkillPage({
  params,
}) {
  const { skill } = await getSkillById(params.id)
  const categories = await getSkillCategories()

  if (!skill) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Skill</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update skill information
        </p>
      </div>

      <SkillForm categories={categories} skill={skill} mode="edit" />
    </div>
  )
}
