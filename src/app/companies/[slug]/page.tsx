import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Building2, Globe, MapPin, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/jobs/job-card'
import type { Company, JobWithCompany } from '@/lib/supabase/types'

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
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
    .select('*, company:companies(*)')
    .eq('company_id', company.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const typedCompany = company as unknown as Company
  const typedJobs = (jobs || []) as unknown as JobWithCompany[]

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
            <Link href="/jobs">
              <Button variant="outline" size="sm">求人を探す</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          求人一覧に戻る
        </Link>

        {/* Company header */}
        <div className="border border-neutral-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-neutral-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-neutral-900">{typedCompany.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-neutral-500">
                {typedCompany.industry && <span>{typedCompany.industry}</span>}
                {typedCompany.size_range && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {typedCompany.size_range}名
                  </span>
                )}
                {typedCompany.website_url && (
                  <a
                    href={typedCompany.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-neutral-900"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {typedCompany.website_url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              {typedCompany.description && (
                <p className="text-sm text-neutral-600 mt-3 whitespace-pre-wrap">{typedCompany.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company jobs */}
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          公開中の求人 ({typedJobs.length})
        </h2>
        <div className="space-y-3">
          {typedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {typedJobs.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-sm">
              現在公開中の求人はありません
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
