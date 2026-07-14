'use client'

import { useTransition } from 'react'
import { publishJob, closeJob, deleteJob } from '@/app/actions/jobs'
import { MoreHorizontal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import type { JobStatus } from '@/lib/supabase/types'

interface JobActionsProps {
  jobId: string
  companyId: string
  status: JobStatus
}

export function JobActions({ jobId, companyId, status }: JobActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
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

  function action(fn: (formData: FormData) => Promise<{ error?: string; success?: boolean }>) {
    return () => {
      setOpen(false)
      const formData = new FormData()
      formData.set('jobId', jobId)
      formData.set('companyId', companyId)
      startTransition(async () => {
        const result = await fn(formData)
        if (result.error) toast.error(result.error)
        else toast.success('更新しました')
      })
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
          {status === 'draft' && (
            <button
              onClick={action(publishJob)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              公開する
            </button>
          )}
          {status === 'published' && (
            <button
              onClick={action(closeJob)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              締め切る
            </button>
          )}
          {status === 'closed' && (
            <button
              onClick={action(publishJob)}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              再公開する
            </button>
          )}
          <button
            onClick={() => {
              if (!confirm('この求人を削除しますか？')) return
              action(deleteJob)()
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            削除する
          </button>
        </div>
      )}
    </div>
  )
}
