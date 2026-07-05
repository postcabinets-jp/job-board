import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import type { JobWithCompany } from '@/lib/supabase/types'

export const metadata = { title: '求人一覧 — Job Board' }

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.remote_type) query = query.eq('remote_type', params.remote_type)
  if (params.employment_type) query = query.eq('employment_type', params.employment_type)
  if (params.location) query = query.ilike('location', `%${params.location}%`)
  if (params.q) query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)

  const page = Number(params.page) || 1
  const perPage = 20
  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data: jobs } = await query

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-neutral-900">Job Board</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">求人を掲載</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">求人一覧</h1>

        <div className="mb-6">
          <JobFilters />
        </div>

        <div className="space-y-3">
          {(jobs as unknown as JobWithCompany[])?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {(!jobs || jobs.length === 0) && (
            <div className="text-center py-16 text-neutral-400">
              <Briefcase className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>該当する求人が見つかりませんでした</p>
            </div>
          )}
        </div>

        {jobs && jobs.length === perPage && (
          <div className="flex justify-center mt-8">
            <Link href={`/jobs?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}>
              <Button variant="outline">次のページ</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
