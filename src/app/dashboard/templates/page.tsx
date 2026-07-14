import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Mail, PlusCircle } from 'lucide-react'
import type { EmailTemplate } from '@/lib/supabase/types'

const triggerLabels: Record<string, string> = {
  application_received: '応募受付時',
  stage_change: 'ステージ変更時',
  manual: '手動送信',
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) return null

  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .eq('company_id', membership.company_id)
    .order('created_at', { ascending: false })

  const typedTemplates = (templates ?? []) as EmailTemplate[]
  const canManage = membership.role === 'admin' || membership.role === 'recruiter'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">メールテンプレート</h1>
        {canManage && (
          <button className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
            新規テンプレート
          </button>
        )}
      </div>

      {/* Variable reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-800">
        <p className="font-medium mb-1">利用可能な変数</p>
        <p className="font-mono">
          {'{{candidate_name}}'} • {'{{job_title}}'} • {'{{company_name}}'} •
          {'{{interview_date}}'} • {'{{interview_location}}'}
        </p>
      </div>

      {typedTemplates.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded-2xl bg-white">
          <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">メールテンプレートがありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {typedTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-neutral-900">{template.name}</h3>
                    {template.trigger && (
                      <span className="text-xs bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
                        {triggerLabels[template.trigger] ?? template.trigger}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">件名: {template.subject}</p>
                </div>
                {canManage && (
                  <button className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors">
                    編集
                  </button>
                )}
              </div>
              <div className="mt-3 bg-neutral-50 rounded-xl p-3">
                <div
                  className="text-xs text-neutral-600 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: template.body }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
