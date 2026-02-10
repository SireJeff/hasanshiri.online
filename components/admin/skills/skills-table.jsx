'use client'

import { AdminTable } from '@/components/admin/shared/admin-table'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Skills Table Component
 * Columns are defined internally to avoid serialization issues
 */
export function SkillsTable({ skills, categories, onDelete, categoryFilter }) {
  // Create category map for rendering
  const categoryMap = Object.fromEntries(
    categories.map(c => [c.id, c])
  )

  // Define columns internally to avoid serialization across component boundaries
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
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this skill?')) {
                onDelete(skill.id)
              }
            }}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    />
  )
}
