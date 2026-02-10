'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAdminProjects, getProjectTags, deleteProject } from '@/lib/actions/projects'
import { AdminTable } from '@/components/admin/shared/admin-table'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Github as GithubIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Projects | Admin',
}

export default function ProjectsAdminPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || null

  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [tags, setTags] = useState([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { projects: projectsData } = await getAdminProjects({ status })
      const tagsData = await getProjectTags()
      setProjects(projectsData || [])
      setTags(tagsData || [])
      setLoading(false)
    }
    loadData()
  }, [status])

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

  const handleDelete = async (id) => {
    const result = await deleteProject(id)
    if (result.error) {
      alert(result.error)
    } else {
      // Refresh data
      const { projects: projectsData } = await getAdminProjects({ status })
      setProjects(projectsData || [])
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
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your portfolio projects ({projects.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/SireJeff"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/70 transition-colors"
          >
            <GithubIcon size={16} />
            View GitHub
          </a>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/projects"
          className={cn(
            "px-3 py-1 rounded-full text-sm transition-colors",
            !status
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          All
        </Link>
        <Link
          href="/admin/projects?status=active"
          className={cn(
            "px-3 py-1 rounded-full text-sm transition-colors",
            status === 'active'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          Active
        </Link>
        <Link
          href="/admin/projects?status=draft"
          className={cn(
            "px-3 py-1 rounded-full text-sm transition-colors",
            status === 'draft'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          Draft
        </Link>
      </div>

      {/* Projects Table */}
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
                  handleDelete(project.id)
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
    </div>
  )
}
