import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  MessageSquare,
  MessagesSquare,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
}

async function getStats() {
  const supabase = await createClient()

  // Get article count
  const { count: articlesCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })

  // Get published articles count
  const { count: publishedCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Get draft articles count
  const { count: draftCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  // Get comments count (pending)
  const { count: pendingComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Get total approved comments
  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  // Get active chat sessions
  const { count: activeChats } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get unread messages count
  const { count: unreadMessages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_type', 'visitor')
    .eq('is_read', false)

  // Get total views
  const { data: viewsData } = await supabase
    .from('articles')
    .select('view_count')

  const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0

  // Get views in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentViews } = await supabase
    .from('article_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', sevenDaysAgo.toISOString())

  // Get views in previous 7 days for comparison
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { count: previousViews } = await supabase
    .from('article_views')
    .select('*', { count: 'exact', head: true })
    .gte('viewed_at', fourteenDaysAgo.toISOString())
    .lt('viewed_at', sevenDaysAgo.toISOString())

  return {
    articlesCount: articlesCount || 0,
    publishedCount: publishedCount || 0,
    draftCount: draftCount || 0,
    pendingComments: pendingComments || 0,
    totalComments: totalComments || 0,
    activeChats: activeChats || 0,
    unreadMessages: unreadMessages || 0,
    totalViews,
    recentViews: recentViews || 0,
    previousViews: previousViews || 0,
  }
}

async function getPopularArticles() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title_en, view_count, status, published_at')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(5)

  return articles || []
}

async function getRecentComments() {
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      status,
      created_at,
      guest_name,
      user_id,
      article:articles(id, slug, title_en)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return comments || []
}

async function getRecentActivity() {
  const supabase = await createClient()

  // Get recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, slug, title_en, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(3)

  // Get recent chat messages
  const { data: recentChats } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      visitor_name,
      visitor_email,
      updated_at,
      status
    `)
    .order('updated_at', { ascending: false })
    .limit(3)

  return {
    articles: recentArticles || [],
    chats: recentChats || [],
  }
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function calculateTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function AdminDashboard() {
  const [stats, popularArticles, recentComments, recentActivity] = await Promise.all([
    getStats(),
    getPopularArticles(),
    getRecentComments(),
    getRecentActivity(),
  ])

  const viewsTrend = calculateTrend(stats.recentViews, stats.previousViews)

  const statCards = [
    {
      name: 'Total Articles',
      value: stats.articlesCount,
      subtitle: `${stats.publishedCount} published, ${stats.draftCount} drafts`,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/admin/articles',
    },
    {
      name: 'Views (7 days)',
      value: formatNumber(stats.recentViews),
      subtitle: `${formatNumber(stats.totalViews)} total`,
      trend: viewsTrend,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Pending Comments',
      value: stats.pendingComments,
      subtitle: `${stats.totalComments} approved`,
      icon: MessageSquare,
      color: stats.pendingComments > 0 ? 'text-yellow-500' : 'text-green-500',
      bgColor: stats.pendingComments > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10',
      href: '/admin/comments',
    },
    {
      name: 'Active Chats',
      value: stats.activeChats,
      subtitle: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'All caught up',
      icon: MessagesSquare,
      color: stats.unreadMessages > 0 ? 'text-orange-500' : 'text-green-500',
      bgColor: stats.unreadMessages > 0 ? 'bg-orange-500/10' : 'bg-green-500/10',
      href: '/admin/chat',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your blog's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href || '#'}
            className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.trend !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {Math.abs(stat.trend)}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Articles */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              Popular Articles
            </h2>
            <Link
              href="/admin/articles"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all
            </Link>
          </div>
          {popularArticles.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No published articles yet
            </p>
          ) : (
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="font-medium text-foreground hover:text-primary truncate block"
                    >
                      {article.title_en}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(article.published_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye size={14} />
                    {formatNumber(article.view_count || 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Recent Comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all
            </Link>
          </div>
          {recentComments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No comments yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentComments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground line-clamp-2">
                      {comment.content}
                    </p>
                    <span className={`shrink-0 px-2 py-0.5 text-xs rounded ${
                      comment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                      comment.status === 'approved' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                      'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {comment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{comment.guest_name || 'User'}</span>
                    <span>•</span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/articles/new"
              className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
            >
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <span className="text-foreground font-medium block">New Article</span>
                <span className="text-xs text-muted-foreground">Write a post</span>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/admin/comments"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
            >
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-foreground font-medium block">Comments</span>
                <span className="text-xs text-muted-foreground">{stats.pendingComments} pending</span>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
            >
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-foreground font-medium block">Media</span>
                <span className="text-xs text-muted-foreground">Manage files</span>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
            >
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-foreground font-medium block">Settings</span>
                <span className="text-xs text-muted-foreground">Preferences</span>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.articles.map((article) => (
              <div key={article.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  article.status === 'published' ? 'bg-green-500' :
                  article.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-sm text-foreground hover:text-primary truncate block"
                  >
                    {article.title_en}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Article {article.status === 'published' ? 'published' : 'updated'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(article.updated_at)}
                </span>
              </div>
            ))}
            {recentActivity.chats.map((chat) => (
              <div key={chat.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  chat.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <Link
                    href="/admin/chat"
                    className="text-sm text-foreground hover:text-primary truncate block"
                  >
                    Chat from {chat.visitor_name || chat.visitor_email || 'Anonymous'}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {chat.status === 'active' ? 'Active conversation' : 'Closed'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(chat.updated_at)}
                </span>
              </div>
            ))}
            {recentActivity.articles.length === 0 && recentActivity.chats.length === 0 && (
              <p className="text-muted-foreground py-4 text-center">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
