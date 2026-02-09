import { getAdminSkills, getSkillCategories } from '@/lib/actions/skills'
import { AdminTable } from '@/components/admin/shared/admin-table'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Skills | Admin',
}

export const dynamic = 'force-dynamic'

export default async function SkillsAdminPage({
  searchParams,
}) {
  const categoryId = searchParams.category || null
  const { skills } = await getAdminSkills({ categoryId })
  const categories = await getSkillCategories()

  const categoryMap = Object.fromEntries(
    categories.map(c => [c.id, c])
  )

  const columns = [
    {
      key: 'name_en',
      label: 'Skill Name',
      render: (value, row) => (
        <div>
          <p className="font-medium text-foreground">{value}</p>
          {row.name_fa && (
            <p className="text-sm text-muted-foreground" dir="rtl">{row.name_fa}</p>
          )}
        </div>
      )
    },
    {
      key: 'category_id',
      label: 'Category',
      render: (value) => {
        const cat = categoryMap[value]
        return cat ? (
          <span
            className="inline-block px-2 py-0.5 text-xs rounded text-white"
            style={{ backgroundColor: cat.color }}
          >
            {cat.name_en}
          </span>
        ) : '—'
      }
    },
    {
      key: 'proficiency_level',
      label: 'Level',
      render: (value) => {
        if (!value) return '—'
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">{value}%</span>
          </div>
        )
      }
    },
    {
      key: 'sort_order',
      label: 'Order'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your skills ({skills.length} total)
          </p>
        </div>
        <Link
          href="/admin/skills/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </Link>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/skills"
            className={cn(
              "px-3 py-1 rounded-full text-sm transition-colors",
              !categoryId
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}
          >
            All Categories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/admin/skills?category=${category.id}`}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                categoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              )}
              style={{
                ...(categoryId !== category.id && {
                  backgroundColor: categoryId === null ? undefined : category.color + '20'
                })
              }}
            >
              {category.name_en}
            </Link>
          ))}
        </div>
      )}

      {/* Skills Table */}
      <AdminTable
        columns={columns}
        data={skills}
        emptyMessage="No skills found. Create your first skill to get started."
        renderActions={(skill) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/skills/${skill.id}/edit`}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Edit"
            >
              <Pencil size={16} />
            </Link>
            <form
              action={async () => {
                'use server'
                const { deleteSkill } = await import('@/lib/actions/skills')
                await deleteSkill(skill.id)
              }}
            >
              <button
                type="submit"
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors"
                title="Delete"
                onClick={(e) => {
                  if (!confirm('Are you sure you want to delete this skill?')) {
                    e.preventDefault()
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        )}
      />
    </div>
  )
}
