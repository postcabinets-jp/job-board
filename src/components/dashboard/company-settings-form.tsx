'use client'

import { useActionState } from 'react'
import { createCompany, updateCompany } from '@/app/actions/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Company } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface CompanySettingsFormProps {
  company: Company | null
  isAdmin: boolean
}

export function CompanySettingsForm({ company, isAdmin }: CompanySettingsFormProps) {
  const isEdit = !!company
  const action = isEdit ? updateCompany : createCompany
  const router = useRouter()

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; companyId?: string } | null, formData: FormData) => {
      return await action(formData)
    },
    null,
  )

  useEffect(() => {
    if (state?.success && !isEdit) {
      router.push('/dashboard')
    }
  }, [state?.success, isEdit, router])

  return (
    <form action={formAction} className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-6">
      {isEdit && <input type="hidden" name="companyId" value={company.id} />}

      {state?.error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 border border-emerald-200">
          保存しました
        </div>
      )}

      <div>
        <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
          会社名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          disabled={!isAdmin}
          defaultValue={company?.name ?? ''}
          placeholder="例: 株式会社TechVentures"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="industry" className="text-sm font-medium text-neutral-700">業種</Label>
        <Input
          id="industry"
          name="industry"
          disabled={!isAdmin}
          defaultValue={company?.industry ?? ''}
          placeholder="例: テクノロジー、金融、製造業"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="size_range" className="text-sm font-medium text-neutral-700">従業員数</Label>
        <select
          id="size_range"
          name="size_range"
          disabled={!isAdmin}
          defaultValue={company?.size_range ?? ''}
          className="mt-1 w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
        >
          <option value="">選択してください</option>
          <option value="1-10">1〜10名</option>
          <option value="11-50">11〜50名</option>
          <option value="51-200">51〜200名</option>
          <option value="201-500">201〜500名</option>
          <option value="500+">500名以上</option>
        </select>
      </div>

      <div>
        <Label htmlFor="website_url" className="text-sm font-medium text-neutral-700">Webサイト</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          disabled={!isAdmin}
          defaultValue={company?.website_url ?? ''}
          placeholder="https://example.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="logo_url" className="text-sm font-medium text-neutral-700">ロゴURL</Label>
        <Input
          id="logo_url"
          name="logo_url"
          type="url"
          disabled={!isAdmin}
          defaultValue={company?.logo_url ?? ''}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-neutral-700">会社紹介</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          disabled={!isAdmin}
          defaultValue={company?.description ?? ''}
          placeholder="会社の事業内容、カルチャー、ビジョンなど..."
          className="mt-1"
        />
      </div>

      {isAdmin && (
        <div className="pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? '保存中...' : isEdit ? '変更を保存' : '会社を登録する'}
          </Button>
        </div>
      )}

      {!isAdmin && (
        <p className="text-xs text-neutral-400">※ 会社設定の変更は管理者のみ可能です</p>
      )}

      {isEdit && (
        <div className="pt-4 border-t border-neutral-100">
          <p className="text-xs font-medium text-neutral-500 mb-2">キャリアページURL</p>
          <a
            href={`/careers/${company.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-mono"
          >
            /careers/{company.slug}
          </a>
        </div>
      )}
    </form>
  )
}
