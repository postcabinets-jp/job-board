import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, MapPin, Globe, Briefcase, Calendar } from 'lucide-react'
import type { Company, Job } from '@/lib/supabase/types'

const remotePolicyLabels: Record<string, string> = {
  onsite: 'オフィス勤務',
  hybrid: 'ハイブリッド',
  remote: 'フルリモート',
}

const employmentTypeLabels: Record<string, string> = {
  full_time: '正社員',
  part_time: 'パートタイム',
  contract: '契約社員',
  internship: 'インターン',
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string; jobSlug: string }>
}) {
  const { slug, jobSlug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('slug', jobSlug)
    .eq('status', 'published')
    .single()

  if (!job) notFound()

  const typedCompany = company as Company
  const typedJob = job as Job

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/careers/${slug}`}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {typedCompany.name}
          </Link>
          <Link
            href={`/careers/${slug}/${jobSlug}/apply`}
            className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            応募する
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Job header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">{typedJob.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            {typedJob.department && (
              <span className="text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {typedJob.department}
              </span>
            )}
            {typedJob.location && (
              <span className="text-neutral-500 border border-neutral-200 rounded-full px-3 py-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {typedJob.location}
              </span>
            )}
            {typedJob.remote_policy && (
              <span className="text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {remotePolicyLabels[typedJob.remote_policy]}
              </span>
            )}
            {typedJob.employment_type && (
              <span className="text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {employmentTypeLabels[typedJob.employment_type]}
              </span>
            )}
            {(typedJob.salary_min || typedJob.salary_max) && (
              <span className="text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {typedJob.salary_currency === 'JPY' ? '¥' : '$'}
                {typedJob.salary_min ? `${(typedJob.salary_min / 10000).toFixed(0)}万` : ''}
                {typedJob.salary_min && typedJob.salary_max ? '〜' : ''}
                {typedJob.salary_max ? `${(typedJob.salary_max / 10000).toFixed(0)}万` : ''}
              </span>
            )}
          </div>
          {typedJob.published_at && (
            <p className="text-xs text-neutral-400 mt-3 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              掲載開始: {new Date(typedJob.published_at).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>

        {/* Job content */}
        <div className="prose prose-neutral max-w-none space-y-8">
          {typedJob.description && (
            <section>
              <h2 className="text-base font-semibold text-neutral-900 mb-3">仕事内容</h2>
              <div
                className="text-sm text-neutral-700 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: typedJob.description }}
              />
            </section>
          )}

          {typedJob.requirements && (
            <section>
              <h2 className="text-base font-semibold text-neutral-900 mb-3">応募条件</h2>
              <div
                className="text-sm text-neutral-700 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: typedJob.requirements }}
              />
            </section>
          )}

          {typedJob.benefits && (
            <section>
              <h2 className="text-base font-semibold text-neutral-900 mb-3">待遇・福利厚生</h2>
              <div
                className="text-sm text-neutral-700 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: typedJob.benefits }}
              />
            </section>
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 pt-8 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-500 mb-4">このポジションに興味がありますか？</p>
          <Link
            href={`/careers/${slug}/${jobSlug}/apply`}
            className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            応募する
          </Link>
        </div>
      </main>
    </div>
  )
}
