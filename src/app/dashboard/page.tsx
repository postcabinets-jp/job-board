import Link from 'next/link'
import { PlusCircle, Eye, Users, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/supabase/types'

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: '下書き', className: 'bg-neutral-100 text-neutral-600' },
  published: { label: '公開中', className: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: '締切', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  filled: { label: '採用済', className: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  let jobs: Job[] = []
  if (company) {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    jobs = (data || []) as unknown as Job[]
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">求人管理</h1>
        <Link href="/dashboard/jobs/new">
          <Button size="sm">
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            新規掲載
          </Button>
        </Link>
      </div>

      {!company && (
        <div className="text-center py-16 border border-neutral-200 rounded-2xl bg-white">
          <p className="text-neutral-500 mb-4">まず企業プロフィールを登録してください</p>
          <Link href="/dashboard/settings">
            <Button>企業プロフィールを設定</Button>
          </Link>
        </div>
      )}

      {company && jobs.length === 0 && (
        <div className="text-center py-16 border border-neutral-200 rounded-2xl bg-white">
          <p className="text-neutral-500 mb-4">まだ求人がありません</p>
          <Link href="/dashboard/jobs/new">
            <Button>最初の求人を作成</Button>
          </Link>
        </div>
      )}

      {company && jobs.length > 0 && (
        <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-4 py-3 font-medium text-neutral-500">求人タイトル</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">ステータス</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">作成日</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const status = statusLabels[job.status] || statusLabels.draft
                  return (
                    <tr key={job.id} className="border-b border-neutral-50 last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">{job.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {new Date(job.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/jobs/${job.id}/applications`}>
                            <Button variant="ghost" size="icon-xs" title="応募者一覧">
                              <Users className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/jobs/${job.slug}`} target="_blank">
                            <Button variant="ghost" size="icon-xs" title="プレビュー">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/jobs/${job.id}/edit`}>
                            <Button variant="ghost" size="icon-xs" title="編集">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
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
