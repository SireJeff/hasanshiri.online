import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from './admin-sidebar'
import { FloatingAIAssistant } from '@/components/admin/shared/FloatingAIAssistant'
import { AIProvider } from '@/components/admin/shared/AIContext'

export const metadata = {
  title: 'Admin Dashboard',
  default: 'Admin | %s | Admin',
  template: '%s | Admin',
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/admin')
  }

  // Get user profile to check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // You can add role checking here if needed

  return (
    <div className="min-h-screen bg-background">
      <AIProvider>
        <AdminSidebar user={user} profile={profile} />
        <FloatingAIAssistant />
        <div className="lg:pl-64">
          <main className="p-6">{children}</main>
        </div>
      </AIProvider>
    </div>
  )
}
