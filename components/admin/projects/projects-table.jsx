'use client'

import { AdminTable } from '@/components/admin/shared/admin-table'
import Link from 'next/link'
import { Pencil, Trash2, Github as GithubIcon } from 'lucide-react'

/**
 * Projects Table Component
 * Columns are defined internally to avoid serialization issues
 */
export function ProjectsTable({ projects, onDelete }) {
  // Define columns internally to avoid serialization across component boundaries
  const columns = [
    {
      key: 'title_en',
      label: 'Project Title',
      render: (value, row) => (
        <div>
          <p className="font-medium text-foreground">{value}</p>
          {row.title_fa && row.title_fa !== value && (
            <p className="text-sm text-muted-foreground" dir="rtl">{row.title_fa}</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          active: 'bg-green-500/10 text-green-500',
          draft: 'bg-yellow-500/10 text-yellow-500',
          archived: 'bg-gray-500/10 text-gray-500',
        }
        return (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            statusColors[value] || 'bg-gray-500/10 text-gray-500'
          )}>
            {value}
          </span>
        )
      }
    },
    {
      key: 'is_github_synced',
      label: 'GitHub',
      render: (value) => {
        if (value) {
          return (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GithubIcon size={14} />
              Synced
            </div>
          )
        }
        return <span className="text-xs text-muted-foreground">—</span>
      }
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (value) => value ? '⭐' : '—'
    },
    {
      key: 'sort_order',
      label: 'Order'
    }
  ]

  return (
    <AdminTable
      columns={columns}
      data={projects}
      emptyMessage="No projects found. Create your first project to get started."
      renderActions={(project) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/projects/${project.id}/edit`}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                onDelete(project.id)
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
