'use client'

import { useTransition, useState } from 'react'
import { submitApplication } from '@/app/actions/candidates'
import { toast } from 'sonner'

interface ApplyFormProps {
  jobId: string
  companyId: string
  companySlug: string
  jobSlug: string
}

export function ApplyForm({ jobId, companyId, companySlug, jobSlug }: ApplyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitApplication(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">応募が完了しました</h2>
        <p className="text-sm text-neutral-500">
          ご応募ありがとうございます。採用チームより追ってご連絡いたします。
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="companyId" value={companyId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            姓
          </label>
          <input
            name="last_name"
            placeholder="山田"
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            名
          </label>
          <input
            name="first_name"
            placeholder="太郎"
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="yamada@example.com"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          電話番号
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="090-0000-0000"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          志望動機・自己紹介
        </label>
        <textarea
          name="cover_letter"
          rows={4}
          placeholder="このポジションへの志望動機や、これまでの経験について教えてください。"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {isPending ? '送信中...' : '応募する'}
      </button>

      <p className="text-xs text-neutral-400 text-center">
        応募情報は採用担当者のみが確認できます
      </p>
    </form>
  )
}
