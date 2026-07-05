'use client'

import { useActionState } from 'react'
import { applyToJob } from '@/app/actions/applications'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function ApplyButton({ jobId }: { jobId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      const result = await applyToJob(formData)
      if (result.success) setShowForm(false)
      return result
    },
    null,
  )

  if (!showForm) {
    return (
      <div className="space-y-2">
        <Button className="w-full" onClick={() => setShowForm(true)}>
          応募する
        </Button>
        {state?.success && (
          <p className="text-xs text-green-600 text-center">{state.success}</p>
        )}
        {state?.error && (
          <p className="text-xs text-destructive text-center">{state.error}</p>
        )}
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-xs rounded-lg px-3 py-2">
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="resume_url" className="text-xs">履歴書URL (任意)</Label>
        <Input id="resume_url" name="resume_url" type="url" placeholder="https://..." className="h-8 text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cover_letter" className="text-xs">カバーレター (任意)</Label>
        <Textarea
          id="cover_letter"
          name="cover_letter"
          placeholder="自己紹介や志望動機..."
          rows={4}
          className="text-sm"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? '送信中...' : '応募を送信'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
