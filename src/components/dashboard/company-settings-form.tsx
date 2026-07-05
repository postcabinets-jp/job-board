'use client'

import { useActionState } from 'react'
import { createCompany, updateCompany } from '@/app/actions/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Company } from '@/lib/supabase/types'

export function CompanySettingsForm({ company }: { company?: Company }) {
  const isEdit = !!company
  const action = isEdit ? updateCompany : createCompany

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await action(formData)
    },
    null,
  )

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {isEdit && <input type="hidden" name="companyId" value={company.id} />}

      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 border border-green-200">
          保存しました
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">会社名 *</Label>
        <Input id="name" name="name" required defaultValue={company?.name || ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">業種</Label>
        <Input id="industry" name="industry" defaultValue={company?.industry || ''} placeholder="例: IT・Web" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">所在地</Label>
        <Input id="location" name="location" defaultValue={company?.location || ''} placeholder="例: 東京都渋谷区" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Webサイト</Label>
        <Input id="website" name="website" type="url" defaultValue={company?.website || ''} placeholder="https://example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo_url">ロゴURL</Label>
        <Input id="logo_url" name="logo_url" type="url" defaultValue={company?.logo_url || ''} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">会社紹介</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={company?.description || ''} placeholder="会社の事業内容、カルチャーなど..." />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? '保存中...' : isEdit ? '更新' : '登録'}
      </Button>
    </form>
  )
}
