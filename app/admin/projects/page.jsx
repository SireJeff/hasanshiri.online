'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAdminProjects, getProjectTags, deleteProject } from '@/lib/actions/projects'
import { ProjectsTable } from '@/components/admin/projects/projects-table'
import Link from 'next/link'
import { Plus, Github as GithubIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Note: Client components cannot export metadata
// Page title is handled by the admin layout

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
      <ProjectsTable
        projects={projects}
        onDelete={handleDelete}
        statusFilter={status}
      />
    </div>
  )
}
