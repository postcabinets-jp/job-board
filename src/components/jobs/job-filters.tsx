'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

const categories = [
  { value: '', label: 'すべて' },
  { value: 'engineering', label: 'エンジニア' },
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
  { value: '', label: 'すべて' },
  { value: 'remote', label: 'リモート' },
  { value: 'hybrid', label: 'ハイブリッド' },
  { value: 'onsite', label: 'オンサイト' },
]

const employmentTypes = [
  { value: '', label: 'すべて' },
  { value: 'full-time', label: '正社員' },
  { value: 'part-time', label: 'パートタイム' },
  { value: 'contract', label: '業務委託' },
  { value: 'internship', label: 'インターン' },
]

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/jobs?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    router.push('/jobs')
  }, [router])

  const hasFilters =
    searchParams.get('q') ||
    searchParams.get('category') ||
    searchParams.get('remote_type') ||
    searchParams.get('employment_type') ||
    searchParams.get('location')

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="キーワードで検索..."
          className="pl-9"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateParams('q', e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">カテゴリ</Label>
          <select
            className="w-full h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={searchParams.get('category') || ''}
            onChange={(e) => updateParams('category', e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">勤務形態</Label>
          <select
            className="w-full h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={searchParams.get('remote_type') || ''}
            onChange={(e) => updateParams('remote_type', e.target.value)}
          >
            {remoteTypes.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">雇用形態</Label>
          <select
            className="w-full h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={searchParams.get('employment_type') || ''}
            onChange={(e) => updateParams('employment_type', e.target.value)}
          >
            {employmentTypes.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500">勤務地</Label>
          <Input
            placeholder="東京、大阪..."
            className="h-8"
            defaultValue={searchParams.get('location') || ''}
            onChange={(e) => updateParams('location', e.target.value)}
          />
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-neutral-500">
          <X className="w-3 h-3 mr-1" />
          フィルタをクリア
        </Button>
      )}
    </div>
  )
}
