import { getSkillCategories } from '@/lib/actions/skills'
import { SkillForm } from '@/components/admin/skills/skill-form'

export const metadata = {
  title: 'New Skill | Admin',
}

export const dynamic = 'force-dynamic'

export default async function NewSkillPage() {
  const categories = await getSkillCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Skill</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new skill for your portfolio
        </p>
      </div>

      <SkillForm categories={categories} mode="create" />
    </div>
  )
}
