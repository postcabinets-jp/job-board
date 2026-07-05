'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await updatePassword(formData)
    },
    null,
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">新しいパスワード</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">8文字以上</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '更新中...' : 'パスワードを更新'}
      </Button>
    </form>
  )
}
