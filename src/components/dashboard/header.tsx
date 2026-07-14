'use client'

import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut, ExternalLink, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

interface DashboardHeaderProps {
  userEmail: string
  companyId?: string
}

export function DashboardHeader({ userEmail, companyId }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-700">
            {userEmail.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block max-w-32 truncate">{userEmail}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-neutral-100">
            <p className="text-xs text-neutral-500 truncate">{userEmail}</p>
          </div>
          {companyId && (
            <Link
              href="/dashboard/settings/company"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              会社設定
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              ログアウト
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
