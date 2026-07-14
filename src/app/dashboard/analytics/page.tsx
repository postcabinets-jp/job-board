import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Users, Briefcase } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) return null

  const companyId = membership.company_id

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, status, created_at')
    .eq('company_id', companyId)

  const jobIds = (jobs ?? []).map(j => j.id)

  const { data: applications } = await supabase
    .from('applications')
    .select('id, job_id, status, created_at')
    .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])

  const apps = applications ?? []
  const totalApps = apps.length
  const activeApps = apps.filter(a => a.status === 'active').length
  const hiredApps = apps.filter(a => a.status === 'hired').length
  const rejectedApps = apps.filter(a => a.status === 'rejected').length
  const conversionRate = totalApps > 0 ? ((hiredApps / totalApps) * 100).toFixed(1) : '0'

  // Apps by job
  const appsByJob = (jobs ?? []).map(job => ({
    job,
    count: apps.filter(a => a.job_id === job.id).length,
    hired: apps.filter(a => a.job_id === job.id && a.status === 'hired').length,
  })).sort((a, b) => b.count - a.count)

  // Apps by source via candidates
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, source')
    .eq('company_id', companyId)

  const sourceCount: Record<string, number> = {}
  for (const c of candidates ?? []) {
    const s = c.source ?? 'other'
    sourceCount[s] = (sourceCount[s] ?? 0) + 1
  }
  const sourceLabels: Record<string, string> = {
    careers_page: 'キャリアページ',
    linkedin: 'LinkedIn',
    referral: '紹介',
    indeed: 'Indeed',
    manual: '手動追加',
    other: 'その他',
  }

  const stats = [
    { label: '総応募数', value: totalApps, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: '選考中', value: activeApps, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: '採用数', value: hiredApps, icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
    { label: '採用転換率', value: `${conversionRate}%`, icon: BarChart3, color: 'text-violet-600 bg-violet-50' },
  ]

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">採用分析</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white border border-neutral-200 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">選考ファネル</h2>
        <div className="space-y-3">
          {[
            { label: '応募', value: totalApps, color: 'bg-neutral-900' },
            { label: '選考中', value: activeApps, color: 'bg-blue-500' },
            { label: '採用', value: hiredApps, color: 'bg-emerald-500' },
            { label: '不採用', value: rejectedApps, color: 'bg-red-400' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 w-16 shrink-0">{item.label}</span>
              <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full flex items-center px-2 ${item.color}`}
                  style={{ width: totalApps > 0 ? `${Math.max((item.value / totalApps) * 100, 4)}%` : '4%' }}
                >
                  <span className="text-xs text-white font-medium">{item.value}</span>
                </div>
              </div>
              <span className="text-xs text-neutral-400 w-12 text-right shrink-0">
                {totalApps > 0 ? `${((item.value / totalApps) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By job */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">求人別応募数</h2>
          <div className="space-y-3">
            {appsByJob.slice(0, 8).map(({ job, count, hired }) => (
              <div key={job.id} className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 flex-1 truncate">{job.title}</span>
                <span className="text-xs text-emerald-600">{hired}採用</span>
                <span className="text-xs font-medium text-neutral-900 w-10 text-right">{count}件</span>
              </div>
            ))}
            {appsByJob.length === 0 && (
              <p className="text-xs text-neutral-400">データなし</p>
            )}
          </div>
        </div>

        {/* By source */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">チャネル別候補者</h2>
          <div className="space-y-3">
            {Object.entries(sourceCount)
              .sort(([,a], [,b]) => b - a)
              .map(([source, count]) => (
                <div key={source} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 flex-1">{sourceLabels[source] ?? source}</span>
                  <span className="text-xs font-medium text-neutral-900">{count}名</span>
                </div>
              ))}
            {Object.keys(sourceCount).length === 0 && (
              <p className="text-xs text-neutral-400">データなし</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
