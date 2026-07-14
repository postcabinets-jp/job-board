import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  Eye,
  Pencil,
  Users,
  Globe,
  MapPin,
  Briefcase,
} from 'lucide-react'
import type { Job } from '@/lib/supabase/types'
import { JobActions } from '@/components/dashboard/job-actions'

const statusConfig = {
  draft: { label: '下書き', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  published: { label: '公開中', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: '締切', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived: { label: 'アーカイブ', className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
}

const employmentTypeLabels: Record<string, string> = {
  full_time: '正社員',
  part_time: 'パートタイム',
  contract: '契約社員',
  internship: 'インターン',
}

const remotePolicyLabels: Record<string, string> = {
  onsite: 'オフィス勤務',
  hybrid: 'ハイブリッド',
  remote: 'フルリモート',
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) return null

  const { data: jobsRaw } = await supabase
    .from('jobs')
    .select(`
      *,
      applications:applications(count)
    `)
    .eq('company_id', membership.company_id)
    .order('created_at', { ascending: false })

  const jobs = (jobsRaw ?? []) as (Job & { applications: { count: number }[] })[]

  const canManage = membership.role === 'admin' || membership.role === 'recruiter'

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">求人管理</h1>
        {canManage && (
          <Link href="/dashboard/jobs/new">
            <Button size="sm">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              新規求人
            </Button>
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-white">
          <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-4">まだ求人がありません</p>
          {canManage && (
            <Link href="/dashboard/jobs/new">
              <Button size="sm">最初の求人を作成</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const status = statusConfig[job.status] ?? statusConfig.draft
            const appCount = job.applications?.[0]?.count ?? 0
            return (
              <div
                key={job.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-neutral-900">{job.title}</h3>
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                      {job.department && (
                        <span>{job.department}</span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      {job.remote_policy && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {remotePolicyLabels[job.remote_policy]}
                        </span>
                      )}
                      {job.employment_type && (
                        <span>{employmentTypeLabels[job.employment_type]}</span>
                      )}
                      {(job.salary_min || job.salary_max) && (
                        <span>
                          {job.salary_currency}{' '}
                          {job.salary_min ? `${(job.salary_min / 10000).toFixed(0)}万` : ''}
                          {job.salary_min && job.salary_max ? '〜' : ''}
                          {job.salary_max ? `${(job.salary_max / 10000).toFixed(0)}万` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/jobs/${job.id}/pipeline`}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg px-2.5 py-1.5 hover:border-neutral-300 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {appCount}名
                    </Link>
                    {job.status === 'published' && (
                      <Link
                        href={`/careers/`}
                        target="_blank"
                        className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="キャリアページ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {canManage && (
                      <Link
                        href={`/dashboard/jobs/${job.id}/edit`}
                        className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="編集"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {canManage && (
                      <JobActions
                        jobId={job.id}
                        companyId={membership.company_id}
                        status={job.status}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-50 flex items-center gap-4 text-xs text-neutral-400">
                  <span>作成: {new Date(job.created_at).toLocaleDateString('ja-JP')}</span>
                  {job.published_at && (
                    <span>公開: {new Date(job.published_at).toLocaleDateString('ja-JP')}</span>
                  )}
                  <Link
                    href={`/dashboard/jobs/${job.id}/pipeline`}
                    className="ml-auto text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    パイプラインを見る →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
