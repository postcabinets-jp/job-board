import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ApplicationActions } from '@/components/dashboard/application-actions'
import type { Application, Job } from '@/lib/supabase/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: '未審査', className: 'bg-neutral-100 text-neutral-600' },
  reviewing: { label: '審査中', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  shortlisted: { label: '候補', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  rejected: { label: '不採用', className: 'bg-red-50 text-red-700 border-red-200' },
  hired: { label: '採用', className: 'bg-green-50 text-green-700 border-green-200' },
}

export default async function ApplicationsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/dashboard/settings')

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!job) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false })

  const typedJob = job as unknown as Job
  const typedApps = (applications || []) as unknown as Application[]

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        求人管理に戻る
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{typedJob.title}</h1>
          <p className="text-sm text-neutral-500">応募者一覧 ({typedApps.length}件)</p>
        </div>
      </div>

      {typedApps.length === 0 && (
        <div className="text-center py-16 border border-neutral-200 rounded-2xl bg-white">
          <p className="text-neutral-500">まだ応募がありません</p>
        </div>
      )}

      {typedApps.length > 0 && (
        <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-4 py-3 font-medium text-neutral-500">応募者ID</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">ステータス</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">応募日</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">カバーレター</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {typedApps.map((app) => {
                  const status = statusLabels[app.status] || statusLabels.pending
                  return (
                    <tr key={app.id} className="border-b border-neutral-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                        {app.applicant_id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(app.applied_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">
                        {app.cover_letter || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationActions applicationId={app.id} jobId={jobId} currentStatus={app.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
