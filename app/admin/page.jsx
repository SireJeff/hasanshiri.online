import { createClient } from '@/lib/supabase/server'
import { FileText, MessageSquare, MessagesSquare, Eye } from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
}

async function getStats() {
  const supabase = await createClient()

  // Get article count
  const { count: articlesCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })

  // Get comments count (pending)
  const { count: pendingComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get active chat sessions
  const { count: activeChats } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get total views
  const { data: viewsData } = await supabase
    .from('articles')
    .select('view_count')

  const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

  return {
    articlesCount: articlesCount || 0,
    pendingComments: pendingComments || 0,
    activeChats: activeChats || 0,
    totalViews,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      name: 'Total Articles',
      value: stats.articlesCount,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Pending Comments',
      value: stats.pendingComments,
      icon: MessageSquare,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      name: 'Active Chats',
      value: stats.activeChats,
      icon: MessagesSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="p-6 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/articles/new"
              className="flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-foreground">Write New Article</span>
            </a>
            <a
              href="/admin/comments"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Review Comments</span>
            </a>
            <a
              href="/admin/chat"
              className="flex items-center gap-3 p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <MessagesSquare className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">View Messages</span>
            </a>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Setup Checklist</h2>
          <div className="space-y-3">
            <SetupItem
              done={true}
              label="Database schema created"
            />
            <SetupItem
              done={true}
              label="Authentication configured"
            />
            <SetupItem
              done={false}
              label="Create your first article"
            />
            <SetupItem
              done={false}
              label="Configure email notifications"
            />
            <SetupItem
              done={false}
              label="Set up storage buckets"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SetupItem({ done, label }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          done ? 'bg-green-500' : 'bg-muted'
        }`}
      >
        {done && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className={done ? 'text-muted-foreground line-through' : 'text-foreground'}>
        {label}
      </span>
    </div>
  )
}
