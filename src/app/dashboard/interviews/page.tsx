import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarDays, Clock, MapPin } from 'lucide-react'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}
const statusLabels: Record<string, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: 'キャンセル',
}

export default async function InterviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) return null

  // Get all job IDs for this company
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('company_id', membership.company_id)

  const jobIds = (jobs ?? []).map(j => j.id)

  const { data: interviewsRaw } = await supabase
    .from('interviews')
    .select(`
      *,
      application:applications(
        id,
        candidate:candidates(first_name, last_name, email),
        job:jobs(id, title)
      )
    `)
    .in(
      'application_id',
      jobIds.length > 0
        ? (await supabase.from('applications').select('id').in('job_id', jobIds)).data?.map(a => a.id) ?? []
        : ['00000000-0000-0000-0000-000000000000']
    )
    .order('scheduled_at', { ascending: true })

  const interviews = interviewsRaw ?? []

  const upcoming = interviews.filter(i =>
    i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date()
  )
  const past = interviews.filter(i =>
    i.status !== 'scheduled' || new Date(i.scheduled_at) < new Date()
  )

  function InterviewRow({ interview }: { interview: (typeof interviews)[0] }) {
    const app = interview.application as { id: string; candidate: { first_name: string | null; last_name: string | null; email: string } | null; job: { id: string; title: string } | null } | null
    const candidate = app?.candidate
    const name = candidate
      ? [candidate.last_name, candidate.first_name].filter(Boolean).join(' ') || candidate.email
      : '—'

    return (
      <div className="flex items-start gap-4 p-4 border border-neutral-200 rounded-2xl bg-white">
        <div className="text-center shrink-0 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 min-w-14">
          <p className="text-xs text-neutral-400">
            {new Date(interview.scheduled_at).toLocaleDateString('ja-JP', { month: 'short' })}
          </p>
          <p className="text-xl font-bold text-neutral-900 leading-none">
            {new Date(interview.scheduled_at).getDate()}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{interview.title}</p>
              <p className="text-xs text-neutral-500">{name}</p>
              {app?.job && (
                <p className="text-xs text-neutral-400">{app.job.title}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColors[interview.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
              {statusLabels[interview.status] ?? interview.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(interview.scheduled_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              {' — '}
              {interview.duration_min}分
            </span>
            {interview.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {interview.location}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">面接スケジュール</h1>

      {interviews.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-white">
          <CalendarDays className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">スケジュール済みの面接はありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-neutral-500 mb-3">今後の面接</h2>
              <div className="space-y-3">
                {upcoming.map(i => <InterviewRow key={i.id} interview={i} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-neutral-500 mb-3">過去の面接</h2>
              <div className="space-y-3 opacity-70">
                {past.map(i => <InterviewRow key={i.id} interview={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
