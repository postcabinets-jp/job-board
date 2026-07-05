'use client'

import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function DashboardHeader() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="sm" className="text-neutral-500">
        <LogOut className="w-3.5 h-3.5 mr-1.5" />
        ログアウト
      </Button>
    </form>
  )
}
