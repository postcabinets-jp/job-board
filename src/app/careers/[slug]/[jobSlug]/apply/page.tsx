import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { ApplyForm } from '@/components/careers/apply-form'
import type { Company, Job } from '@/lib/supabase/types'

export default async function ApplyPage({
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
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center">
          <Link
            href={`/careers/${slug}/${jobSlug}`}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            求人詳細に戻る
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="mb-6">
            <p className="text-xs text-neutral-400 mb-1">{typedCompany.name}</p>
            <h1 className="text-lg font-bold text-neutral-900">{typedJob.title}に応募する</h1>
          </div>

          <ApplyForm
            jobId={typedJob.id}
            companyId={typedCompany.id}
            companySlug={slug}
            jobSlug={jobSlug}
          />
        </div>
      </main>
    </div>
  )
}
