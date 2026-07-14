import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompanySettingsForm } from '@/components/dashboard/company-settings-form'
import type { Company } from '@/lib/supabase/types'

export default async function CompanySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role, company:companies(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const company = (membership?.company as unknown as Company) ?? null
  const isAdmin = membership?.role === 'admin'

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">会社設定</h1>

      {!company ? (
        <CompanySettingsForm company={null} isAdmin={true} />
      ) : (
        <CompanySettingsForm company={company} isAdmin={isAdmin} />
      )}
    </div>
  )
}
