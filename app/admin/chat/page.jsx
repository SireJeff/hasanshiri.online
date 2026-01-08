import { getAdminChatSessions, getChatStats } from '@/lib/actions/chat'
import { ChatDashboard } from './chat-dashboard'

export const metadata = {
  title: 'Chat Messages',
}

export const dynamic = 'force-dynamic'

export default async function AdminChatPage() {
  const [{ sessions, total }, stats] = await Promise.all([
    getAdminChatSessions({ limit: 50 }),
    getChatStats(),
  ])

  return (
    <ChatDashboard
      initialSessions={sessions}
      totalSessions={total}
      stats={stats}
    />
  )
}
