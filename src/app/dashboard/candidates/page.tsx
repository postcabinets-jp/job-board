import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, Search, MapPin, Mail } from 'lucide-react'
import type { Candidate } from '@/lib/supabase/types'

const sourceLabels: Record<string, string> = {
  careers_page: 'キャリアページ',
  linkedin: 'LinkedIn',
  referral: '紹介',
  indeed: 'Indeed',
  manual: '手動追加',
  other: 'その他',
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>
}) {
  const { q, source } = await searchParams
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

  let query = supabase
    .from('candidates')
    .select(`
      *,
      applications:applications(count, job:jobs(title))
    `)
    .eq('company_id', membership.company_id)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
  }
  if (source) {
    query = query.eq('source', source)
  }

  const { data: candidatesRaw } = await query.limit(100)
  const candidates = (candidatesRaw ?? []) as (Candidate & {
    applications: { count: number; job: { title: string } | null }[]
  })[]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">候補者データベース</h1>
        <span className="text-sm text-neutral-500">{candidates.length}名</span>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="名前・メールで検索"
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
        <select
          name="source"
          defaultValue={source}
          className="text-sm border border-neutral-200 rounded-xl bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">すべてのソース</option>
          {Object.entries(sourceLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
        >
          検索
        </button>
      </form>

      {candidates.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-white">
          <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">
            {q || source ? '該当する候補者が見つかりません' : 'まだ候補者がいません'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left">
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs">候補者</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs hidden md:table-cell">所在地</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs hidden lg:table-cell">ソース</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs">応募数</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs hidden md:table-cell">タグ</th>
                  <th className="px-4 py-3 font-medium text-neutral-500 text-xs">登録日</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const name = [candidate.last_name, candidate.first_name].filter(Boolean).join(' ') || candidate.email
                  const appCount = candidate.applications?.[0]?.count ?? 0
                  return (
                    <tr
                      key={candidate.id}
                      className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/candidates/${candidate.id}`} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-neutral-600">
                              {name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 hover:text-neutral-600">{name}</p>
                            <p className="text-xs text-neutral-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {candidate.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                        {candidate.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {candidate.location}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 hidden lg:table-cell">
                        {candidate.source ? sourceLabels[candidate.source] ?? candidate.source : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">
                          {appCount}件
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(candidate.tags ?? []).slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                          {(candidate.tags ?? []).length > 3 && (
                            <span className="text-xs text-neutral-400">+{(candidate.tags ?? []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {new Date(candidate.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
