import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, Shield, Crown } from 'lucide-react'

const roleConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: '管理者', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Crown },
  recruiter: { label: '採用担当', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Shield },
  hiring_manager: { label: '採用マネージャー', color: 'text-violet-700 bg-violet-50 border-violet-200', icon: Shield },
  interviewer: { label: '面接官', color: 'text-neutral-700 bg-neutral-100 border-neutral-200', icon: Shield },
}

export default async function TeamSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myMembership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!myMembership) return null

  const { data: members } = await supabase
    .from('memberships')
    .select('*')
    .eq('company_id', myMembership.company_id)
    .order('created_at', { ascending: true })

  const isAdmin = myMembership.role === 'admin'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">チーム管理</h1>
        {isAdmin && (
          <button className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
            <Users className="w-3.5 h-3.5" />
            メンバーを招待
          </button>
        )}
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <p className="text-sm font-medium text-neutral-900">{(members ?? []).length}名のメンバー</p>
        </div>
        <div className="divide-y divide-neutral-50">
          {(members ?? []).map(member => {
            const roleInfo = roleConfig[member.role as string] ?? roleConfig.interviewer
            const RoleIcon = roleInfo.icon
            const isCurrentUser = member.user_id === user.id

            return (
              <div key={member.id} className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-neutral-600">
                    {member.user_id.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {member.user_id}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-neutral-400">（あなた）</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {member.accepted_at
                      ? `参加: ${new Date(member.accepted_at).toLocaleDateString('ja-JP')}`
                      : '招待中'}
                  </p>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${roleInfo.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleInfo.label}
                </span>
                {isAdmin && !isCurrentUser && (
                  <button className="text-xs text-neutral-400 hover:text-red-600 px-2 py-1 transition-colors">
                    削除
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-neutral-600 mb-2">権限一覧</h3>
        <div className="space-y-1.5 text-xs text-neutral-500">
          <p><strong>管理者</strong>: 全機能 + チーム管理 + 会社設定</p>
          <p><strong>採用担当</strong>: 求人作成・編集 + 候補者管理 + パイプライン操作</p>
          <p><strong>採用マネージャー</strong>: 求人閲覧 + パイプライン操作 + 面接評価</p>
          <p><strong>面接官</strong>: 担当候補者の閲覧 + 面接評価の記入</p>
        </div>
      </div>
    </div>
  )
}
