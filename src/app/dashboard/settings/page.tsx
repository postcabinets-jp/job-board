import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompanySettingsForm } from '@/components/dashboard/company-settings-form'
import type { Company } from '@/lib/supabase/types'

export const metadata = { title: '企業設定 — Job Board' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-6">企業プロフィール設定</h1>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <CompanySettingsForm company={(company as unknown as Company) ?? null} isAdmin={true} />
      </div>
    </div>
  )
}
