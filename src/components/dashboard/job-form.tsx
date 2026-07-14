'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createJob, updateJob } from '@/app/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Job } from '@/lib/supabase/types'

const categories = [
  { value: 'engineering', label: 'エンジニアリング' },
  { value: 'design', label: 'デザイン' },
  { value: 'marketing', label: 'マーケティング' },
  { value: 'sales', label: '営業' },
  { value: 'operations', label: '運用' },
  { value: 'finance', label: '経理・財務' },
  { value: 'hr', label: '人事' },
  { value: 'legal', label: '法務' },
  { value: 'support', label: 'サポート' },
  { value: 'other', label: 'その他' },
]

const remoteTypes = [
  { value: 'onsite', label: 'オンサイト' },
  { value: 'hybrid', label: 'ハイブリッド' },
  { value: 'remote', label: 'フルリモート' },
]

const employmentTypes = [
  { value: 'full-time', label: '正社員' },
  { value: 'part-time', label: 'パートタイム' },
  { value: 'contract', label: '業務委託' },
  { value: 'internship', label: 'インターン' },
]

type Props = {
  companyId: string
  job?: Job
}

export function JobForm({ companyId, job }: Props) {
  const router = useRouter()
  const isEdit = !!job

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; jobId?: string } | null, formData: FormData) => {
      const result = isEdit ? await updateJob(formData) : await createJob(formData)
      if ('success' in result && result.success) {
        router.push('/dashboard')
      }
      return result
    },
    null,
  )

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <input type="hidden" name="companyId" value={companyId} />
      {isEdit && <input type="hidden" name="jobId" value={job.id} />}

      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">求人タイトル *</Label>
        <Input id="title" name="title" required defaultValue={job?.title || ''} placeholder="例: シニアフロントエンドエンジニア" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">仕事内容 *</Label>
        <Textarea id="description" name="description" required rows={8} defaultValue={job?.description || ''} placeholder="仕事内容の詳細を記入..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">応募条件</Label>
        <Textarea id="requirements" name="requirements" rows={5} defaultValue={job?.requirements || ''} placeholder="必須スキル、歓迎スキル等..." />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ *</Label>
          <select
            id="category"
            name="category"
            required
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue={'engineering'}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remote_policy">勤務形態 *</Label>
          <select
            id="remote_policy"
            name="remote_policy"
            required
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue={job?.remote_policy || 'onsite'}
          >
            {remoteTypes.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employment_type">雇用形態 *</Label>
          <select
            id="employment_type"
            name="employment_type"
            required
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue={job?.employment_type || 'full-time'}
          >
            {employmentTypes.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">勤務地</Label>
        <Input id="location" name="location" defaultValue={job?.location || ''} placeholder="例: 東京都渋谷区" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salary_min">下限給与</Label>
          <Input id="salary_min" name="salary_min" type="number" min={0} defaultValue={job?.salary_min || ''} placeholder="例: 5000000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">上限給与</Label>
          <Input id="salary_max" name="salary_max" type="number" min={0} defaultValue={job?.salary_max || ''} placeholder="例: 8000000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_currency">通貨</Label>
          <Input id="salary_currency" name="salary_currency" defaultValue={job?.salary_currency || 'JPY'} placeholder="JPY" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? '保存中...' : isEdit ? '求人を更新' : '求人を作成'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
