import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, MapPin, Globe, Building2, ArrowRight } from 'lucide-react'
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

export default async function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const typedCompany = company as Company
  const typedJobs = (jobs ?? []) as Job[]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {typedCompany.logo_url ? (
              <img src={typedCompany.logo_url} alt={typedCompany.name} className="w-7 h-7 rounded object-cover" />
            ) : (
              <div className="w-7 h-7 bg-neutral-900 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-semibold text-sm text-neutral-900">{typedCompany.name}</span>
          </div>
          <span className="text-xs text-neutral-400">採用情報</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Company hero */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{typedCompany.name}で働きませんか</h1>
          {typedCompany.description && (
            <p className="text-neutral-600 leading-relaxed">{typedCompany.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {typedCompany.industry && (
              <span className="text-xs text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {typedCompany.industry}
              </span>
            )}
            {typedCompany.size_range && (
              <span className="text-xs text-neutral-500 border border-neutral-200 rounded-full px-3 py-1">
                {typedCompany.size_range}名
              </span>
            )}
            {typedCompany.website_url && (
              <a
                href={typedCompany.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
              >
                <Globe className="w-3 h-3 inline mr-1" />
                Webサイト
              </a>
            )}
          </div>
        </div>

        {/* Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">募集中のポジション</h2>
            <span className="text-sm text-neutral-400">{typedJobs.length}件</span>
          </div>

          {typedJobs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl">
              <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">現在募集中のポジションはありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {typedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/careers/${slug}/${job.slug}`}
                  className="flex items-center gap-4 p-4 border border-neutral-200 rounded-2xl hover:border-neutral-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                      {job.department && <span>{job.department}</span>}
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
                          {job.salary_currency === 'JPY' ? '¥' : '$'}
                          {job.salary_min ? `${(job.salary_min / 10000).toFixed(0)}万` : ''}
                          {job.salary_min && job.salary_max ? '〜' : ''}
                          {job.salary_max ? `${(job.salary_max / 10000).toFixed(0)}万` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-200 mt-16 py-6 text-center">
        <p className="text-xs text-neutral-400">
          Powered by{' '}
          <Link href="/" className="hover:text-neutral-600">
            Job Board ATS
          </Link>
        </p>
      </footer>
    </div>
  )
}
