import Link from 'next/link'
import { Briefcase, LayoutDashboard, PlusCircle, Settings } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-neutral-900">Job Board</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                求人管理
              </Link>
              <Link
                href="/dashboard/jobs/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                新規掲載
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                設定
              </Link>
            </div>
          </div>
          <DashboardHeader />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
