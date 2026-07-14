import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Mail, Phone, MapPin, Globe, Star, Calendar, FileText, ExternalLink } from 'lucide-react'
import { NoteForm } from '@/components/dashboard/note-form'
import type { Candidate, Application, Job, PipelineStage, Note } from '@/lib/supabase/types'

const statusColors: Record<string, string> = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  withdrawn: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}
const statusLabels: Record<string, string> = {
  active: '選考中',
  hired: '採用',
  rejected: '不採用',
  withdrawn: '辞退',
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ candidateId: string }>
}) {
  const { candidateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .eq('company_id', membership.company_id)
    .single()

  if (!candidate) notFound()

  const { data: applicationsRaw } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(id, title, status),
      stage:pipeline_stages(name, color),
      notes:notes(*)
    `)
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false })

  const typedCandidate = candidate as Candidate
  const applications = (applicationsRaw ?? []) as (Application & {
    job: { id: string; title: string; status: string } | null
    stage: { name: string; color: string } | null
    notes: Note[]
  })[]

  const name = [typedCandidate.last_name, typedCandidate.first_name].filter(Boolean).join(' ') || typedCandidate.email

  return (
    <div className="max-w-4xl">
      <Link
        href="/dashboard/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        候補者一覧
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-neutral-600">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-bold text-neutral-900">{name}</h1>
                {typedCandidate.location && (
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {typedCandidate.location}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <a href={`mailto:${typedCandidate.email}`} className="hover:text-neutral-900 truncate">
                  {typedCandidate.email}
                </a>
              </div>
              {typedCandidate.phone && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <a href={`tel:${typedCandidate.phone}`} className="hover:text-neutral-900">
                    {typedCandidate.phone}
                  </a>
                </div>
              )}
              {typedCandidate.linkedin_url && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <a
                    href={typedCandidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 truncate"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              {typedCandidate.website_url && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <a
                    href={typedCandidate.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 truncate"
                  >
                    Website
                  </a>
                </div>
              )}
              {typedCandidate.resume_url && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <a
                    href={typedCandidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900"
                  >
                    履歴書を見る
                  </a>
                </div>
              )}
            </div>

            {(typedCandidate.tags ?? []).length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-medium text-neutral-500 mb-2">タグ</p>
                <div className="flex flex-wrap gap-1">
                  {typedCandidate.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5">
            <p className="text-xs font-medium text-neutral-500 mb-1">登録日</p>
            <p className="text-sm text-neutral-700">
              {new Date(typedCandidate.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right: Applications & Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Applications */}
          <div className="bg-white border border-neutral-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900">応募履歴</h2>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">応募履歴なし</p>
            ) : (
              <div className="divide-y divide-neutral-50">
                {applications.map(app => (
                  <div key={app.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/jobs/${app.job?.id}/pipeline`}
                          className="text-sm font-medium text-neutral-900 hover:text-neutral-600"
                        >
                          {app.job?.title ?? '—'}
                        </Link>
                        {app.stage && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: app.stage.color }}
                            />
                            <span className="text-xs text-neutral-500">{app.stage.name}</span>
                          </div>
                        )}
                        {app.rating && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1,2,3,4,5].map(i => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i <= app.rating! ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[app.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                          {statusLabels[app.status] ?? app.status}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(app.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    {/* Notes for this application */}
                    {app.notes && app.notes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {app.notes.map(note => (
                          <div key={note.id} className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700">
                            {note.is_private && (
                              <span className="text-xs text-amber-600 font-medium block mb-1">非公開メモ</span>
                            )}
                            {note.body}
                            <p className="text-xs text-neutral-400 mt-1">
                              {new Date(note.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add note form */}
                    <div className="mt-3">
                      <NoteForm applicationId={app.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
