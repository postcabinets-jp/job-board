'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await signIn(formData)
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
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">パスワード</Label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            パスワードを忘れた場合
          </Link>
        </div>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'ログイン中...' : 'ログイン'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        アカウントをお持ちでない場合は{' '}
        <Link href="/register" className="text-foreground hover:underline font-medium">
          新規登録
        </Link>
      </p>
    </form>
  )
}
