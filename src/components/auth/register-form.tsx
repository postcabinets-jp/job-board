'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return await signUp(formData)
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
        <Label htmlFor="display_name">表示名</Label>
        <Input id="display_name" name="display_name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">8文字以上</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '登録中...' : '新規登録'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        既にアカウントをお持ちの場合は{' '}
        <Link href="/login" className="text-foreground hover:underline font-medium">
          ログイン
        </Link>
      </p>
    </form>
  )
}
