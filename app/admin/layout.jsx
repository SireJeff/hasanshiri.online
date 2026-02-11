import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from './admin-sidebar'

export const metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin',
  },
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/admin')
  }

  // Get user profile to check admin role
  // Note: Profile might not exist for all users, handle gracefully
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

  // You can add role checking here if needed
  // For now, any authenticated user can access

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar user={user} profile={profile} />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
