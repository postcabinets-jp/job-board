import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Briefcase, Users, CalendarDays, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return null // handled by layout
  }

  const companyId = membership.company_id

  // Fetch stats in parallel
  const [jobsRes, applicationsRes, candidatesRes, interviewsRes, recentAppsRes] = await Promise.all([
    supabase.from('jobs').select('id, status', { count: 'exact' }).eq('company_id', companyId),
    supabase.from('applications').select('id, status, created_at', { count: 'exact' }).in(
      'job_id',
      (await supabase.from('jobs').select('id').eq('company_id', companyId)).data?.map(j => j.id) ?? []
    ),
    supabase.from('candidates').select('id', { count: 'exact' }).eq('company_id', companyId),
    supabase
      .from('interviews')
      .select('id', { count: 'exact' })
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString()),
    supabase
      .from('applications')
      .select('id, created_at, status, candidate:candidates(first_name, last_name, email), job:jobs(title, id)')
      .in(
        'job_id',
        (await supabase.from('jobs').select('id').eq('company_id', companyId)).data?.map(j => j.id) ?? []
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const jobs = jobsRes.data ?? []
  const totalJobs = jobs.length
  const publishedJobs = jobs.filter(j => j.status === 'published').length

  const applications = applicationsRes.data ?? []
  const totalApplications = applications.length
  const activeApplications = applications.filter(a => a.status === 'active').length

  const totalCandidates = candidatesRes.count ?? 0
  const scheduledInterviews = interviewsRes.count ?? 0
  const recentApps = recentAppsRes.data ?? []

  const stats = [
    {
      label: '公開中の求人',
      value: publishedJobs,
      sub: `全${totalJobs}件`,
      icon: Briefcase,
      href: '/dashboard/jobs',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: '候補者',
      value: totalCandidates,
      sub: `応募${totalApplications}件`,
      icon: Users,
      href: '/dashboard/candidates',
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: '進行中の選考',
      value: activeApplications,
      sub: `採用${applications.filter(a => a.status === 'hired').length}名`,
      icon: TrendingUp,
      href: '/dashboard/candidates',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: '今後の面接',
      value: scheduledInterviews,
      sub: 'スケジュール済',
      icon: CalendarDays,
      href: '/dashboard/interviews',
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">ダッシュボード</h1>
        <Link href="/dashboard/jobs/new">
          <Button size="sm">
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            求人を作成
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-neutral-200 rounded-2xl p-4 hover:border-neutral-300 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white border border-neutral-200 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">最近の応募</h2>
          <Link href="/dashboard/candidates" className="text-xs text-neutral-500 hover:text-neutral-900">
            すべて見る
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            まだ応募がありません
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {recentApps.map((app) => {
              const candidate = app.candidate as unknown as { first_name: string | null; last_name: string | null; email: string } | null
              const job = app.job as unknown as { title: string; id: string } | null
              const name = candidate
                ? [candidate.last_name, candidate.first_name].filter(Boolean).join(' ') || candidate.email
                : '—'
              const statusColors: Record<string, string> = {
                active: 'bg-blue-50 text-blue-700',
                hired: 'bg-emerald-50 text-emerald-700',
                rejected: 'bg-red-50 text-red-700',
                withdrawn: 'bg-neutral-100 text-neutral-500',
              }
              const statusLabels: Record<string, string> = {
                active: '選考中',
                hired: '採用',
                rejected: '不採用',
                withdrawn: '辞退',
              }
              return (
                <div key={app.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-neutral-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {job?.title ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[app.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                      {statusLabels[app.status] ?? app.status}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(app.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/dashboard/jobs/new"
          className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 transition-colors"
        >
          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">求人を作成</p>
            <p className="text-xs text-neutral-400">新しいポジションを追加</p>
          </div>
        </Link>
        <Link
          href="/dashboard/templates"
          className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 transition-colors"
        >
          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">メールテンプレート</p>
            <p className="text-xs text-neutral-400">定型文を管理</p>
          </div>
        </Link>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 transition-colors"
        >
          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">採用分析</p>
            <p className="text-xs text-neutral-400">ファネルと指標を確認</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
