import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Briefcase,
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Mail,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's company via membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('role, company:companies(id, name, slug, logo_url)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const company = (membership?.company as unknown as { id: string; name: string; slug: string; logo_url: string | null }) ?? null

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top nav */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-20 h-14 flex items-center px-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-neutral-900 hidden sm:block">
              {company ? company.name : 'Job Board ATS'}
            </span>
          </Link>
          {company && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              <span className="text-sm text-neutral-500 truncate">採用管理</span>
            </>
          )}
        </div>
        <DashboardHeader userEmail={user.email ?? ''} companyId={company?.id} />
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar companyId={company?.id} />

        {/* Main */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {!company ? (
            <div className="max-w-md mx-auto mt-16 text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-neutral-400" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">会社を設定してください</h2>
              <p className="text-sm text-neutral-500 mb-6">
                ATSを使い始めるには、まず会社情報を登録します。
              </p>
              <Link
                href="/dashboard/settings/company"
                className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                会社を設定する
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
