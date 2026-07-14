import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Star, User } from 'lucide-react'
import { PipelineBoard } from '@/components/dashboard/pipeline-board'
import type { Job, PipelineStage, ApplicationWithRelations } from '@/lib/supabase/types'

export default async function PipelinePage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', membership.company_id)
    .single()

  if (!job) notFound()

  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('job_id', jobId)
    .order('position', { ascending: true })

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidates(*),
      stage:pipeline_stages(*)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  const typedJob = job as Job
  const typedStages = (stages ?? []) as PipelineStage[]
  const typedApps = (applications ?? []) as ApplicationWithRelations[]

  const canManage = membership.role === 'admin' || membership.role === 'recruiter'

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)]">
      {/* Breadcrumb + title */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          求人一覧
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-sm font-semibold text-neutral-900 truncate">{typedJob.title}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-500">
          {typedApps.length}名
        </span>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard
        jobId={jobId}
        stages={typedStages}
        applications={typedApps}
        canManage={canManage}
      />
    </div>
  )
}
