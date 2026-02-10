'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAdminSkills, getSkillCategories, deleteSkill } from '@/lib/actions/skills'
import { SkillsTable } from '@/components/admin/skills/skills-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Note: Client components cannot export metadata
// Page title is handled by the admin layout

export default function SkillsAdminPage() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category') || null

  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { skills: skillsData } = await getAdminSkills({ categoryId })
      const categoriesData = await getSkillCategories()
      setSkills(skillsData || [])
      setCategories(categoriesData || [])
      setLoading(false)
    }
    loadData()
  }, [categoryId])

  const handleDelete = async (id) => {
    const result = await deleteSkill(id)
    if (result.error) {
      alert(result.error)
    } else {
      // Refresh data
      const { skills: skillsData } = await getAdminSkills({ categoryId })
      setSkills(skillsData || [])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

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
      <SkillsTable
        skills={skills}
        categories={categories}
        onDelete={handleDelete}
        categoryFilter={categoryId}
      />
    </div>
  )
}
