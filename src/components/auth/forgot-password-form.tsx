'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return await resetPassword(formData)
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
      {state?.success && (
        <div className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 border border-green-200">
          {state.success}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '送信中...' : 'リセットメールを送信'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-foreground hover:underline font-medium">
          ログインに戻る
        </Link>
      </p>
    </form>
  )
}
