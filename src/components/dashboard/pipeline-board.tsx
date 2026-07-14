'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Star, User, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { moveApplicationStage, updateApplicationStatus } from '@/app/actions/candidates'
import type { PipelineStage, ApplicationWithRelations } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface PipelineBoardProps {
  jobId: string
  stages: PipelineStage[]
  applications: ApplicationWithRelations[]
  canManage: boolean
}

export function PipelineBoard({ jobId, stages, applications, canManage }: PipelineBoardProps) {
  const [apps, setApps] = useState(applications)
  const [isPending, startTransition] = useTransition()

  // Group apps by stage
  function getAppsForStage(stageId: string | null) {
    if (stageId === null) {
      return apps.filter(a => a.stage_id === null && a.status === 'active')
    }
    return apps.filter(a => a.stage_id === stageId && a.status === 'active')
  }

  const rejectedApps = apps.filter(a => a.status === 'rejected')
  const hiredApps = apps.filter(a => a.status === 'hired')

  function handleMoveStage(applicationId: string, stageId: string) {
    // Optimistic update
    setApps(prev => prev.map(a =>
      a.id === applicationId ? { ...a, stage_id: stageId } : a
    ))

    const formData = new FormData()
    formData.set('applicationId', applicationId)
    formData.set('stageId', stageId)

    startTransition(async () => {
      const result = await moveApplicationStage(formData)
      if (result.error) {
        toast.error(result.error)
        setApps(applications) // revert
      }
    })
  }

  function handleStatusChange(applicationId: string, status: string) {
    setApps(prev => prev.map(a =>
      a.id === applicationId ? { ...a, status: status as 'active' | 'hired' | 'rejected' | 'withdrawn' } : a
    ))

    const formData = new FormData()
    formData.set('applicationId', applicationId)
    formData.set('status', status)

    startTransition(async () => {
      const result = await updateApplicationStatus(formData)
      if (result.error) {
        toast.error(result.error)
        setApps(applications)
      }
    })
  }

  function CandidateName({ app }: { app: ApplicationWithRelations }) {
    const c = app.candidate
    if (!c) return <span className="text-neutral-400">不明</span>
    const name = [c.last_name, c.first_name].filter(Boolean).join(' ') || c.email
    return <span>{name}</span>
  }

  function ApplicationCard({ app }: { app: ApplicationWithRelations }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const c = app.candidate
    const name = c
      ? [c.last_name, c.first_name].filter(Boolean).join(' ') || c.email
      : '不明'
    const initial = name.charAt(0).toUpperCase()

    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-3 hover:border-neutral-300 transition-colors relative group">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-neutral-600">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/candidates/${c?.id}`}
              className="text-sm font-medium text-neutral-900 truncate block hover:text-neutral-600"
            >
              {name}
            </Link>
            {c?.location && (
              <p className="text-xs text-neutral-400 truncate">{c.location}</p>
            )}
            {app.rating && (
              <div className="flex items-center gap-0.5 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    className={cn('w-2.5 h-2.5', i <= app.rating! ? 'fill-amber-400 text-amber-400' : 'text-neutral-200')}
                  />
                ))}
              </div>
            )}
          </div>
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-700 p-0.5 transition-opacity"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    ステージ移動
                  </div>
                  {stages.map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => { handleMoveStage(app.id, stage.id); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                      {app.stage_id === stage.id && <Check className="w-3 h-3 ml-auto text-emerald-500" />}
                    </button>
                  ))}
                  <div className="border-t border-neutral-100 mt-1 pt-1">
                    <button
                      onClick={() => { handleStatusChange(app.id, 'hired'); setMenuOpen(false) }}
                      className="w-full text-left px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50"
                    >
                      採用する
                    </button>
                    <button
                      onClick={() => { handleStatusChange(app.id, 'rejected'); setMenuOpen(false) }}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      不採用にする
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-neutral-400">
          {new Date(app.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 h-full pb-4" style={{ minWidth: `${(stages.length + 2) * 220}px` }}>
        {stages.map(stage => {
          const stageApps = getAppsForStage(stage.id)
          return (
            <div key={stage.id} className="w-52 shrink-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs font-semibold text-neutral-700 truncate">{stage.name}</span>
                <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                  {stageApps.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {stageApps.length === 0 ? (
                  <div className="h-20 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-neutral-300">なし</span>
                  </div>
                ) : (
                  stageApps.map(app => (
                    <ApplicationCard key={app.id} app={app} />
                  ))
                )}
              </div>
            </div>
          )
        })}

        {/* Hired column */}
        <div className="w-52 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 truncate">採用</span>
            <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
              {hiredApps.length}
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {hiredApps.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </div>

        {/* Rejected column */}
        <div className="w-52 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-red-400" />
            <span className="text-xs font-semibold text-neutral-500 truncate">不採用</span>
            <span className="ml-auto text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
              {rejectedApps.length}
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {rejectedApps.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
