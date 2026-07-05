import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobForm } from '@/components/dashboard/job-form'

export const metadata = { title: '新規求人掲載 — Job Board' }

export default async function NewJobPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) redirect('/dashboard/settings')

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-6">新規求人掲載</h1>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <JobForm companyId={company.id} />
      </div>
    </div>
  )
}
