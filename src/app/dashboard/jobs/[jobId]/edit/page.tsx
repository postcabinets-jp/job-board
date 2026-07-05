import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobForm } from '@/components/dashboard/job-form'
import type { Job } from '@/lib/supabase/types'

export const metadata = { title: '求人編集 — Job Board' }

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
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

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-6">求人を編集</h1>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <JobForm companyId={company.id} job={job as unknown as Job} />
      </div>
    </div>
  )
}
