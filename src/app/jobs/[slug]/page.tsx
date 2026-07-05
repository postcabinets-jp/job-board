import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Building2, MapPin, Clock, Globe, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import type { JobWithCompany } from '@/lib/supabase/types'
import { ApplyButton } from '@/components/jobs/apply-button'

const remoteLabels: Record<string, string> = {
  onsite: 'オンサイト',
  hybrid: 'ハイブリッド',
  remote: 'フルリモート',
}

const employmentLabels: Record<string, string> = {
  'full-time': '正社員',
  'part-time': 'パートタイム',
  contract: '業務委託',
  internship: 'インターン',
}

const categoryLabels: Record<string, string> = {
  engineering: 'エンジニアリング',
  design: 'デザイン',
  marketing: 'マーケティング',
  sales: '営業',
  operations: '運用',
  finance: '経理・財務',
  hr: '人事',
  legal: '法務',
  support: 'サポート',
  other: 'その他',
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null
  const fmt = (n: number) => {
    if (currency === 'JPY') return `${Math.round(n / 10000)}万`
    return new Intl.NumberFormat('ja-JP').format(n)
  }
  if (min && max) return `${fmt(min)}〜${fmt(max)}${currency === 'JPY' ? '円' : ` ${currency}`}`
  if (min) return `${fmt(min)}${currency === 'JPY' ? '円〜' : `+ ${currency}`}`
  if (max) return `〜${fmt(max)}${currency === 'JPY' ? '円' : ` ${currency}`}`
  return null
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) notFound()

  const job = data as unknown as JobWithCompany
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency)

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-neutral-900">Job Board</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">ログイン</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          求人一覧に戻る
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">{job.title}</h1>
              <Link href={`/companies/${job.company.slug}`} className="text-sm text-neutral-500 hover:text-neutral-900">
                {job.company.name}
              </Link>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{remoteLabels[job.remote_type]}</Badge>
                <Badge variant="outline">{employmentLabels[job.employment_type]}</Badge>
                <Badge variant="outline">{categoryLabels[job.category]}</Badge>
              </div>
            </div>

            <Separator />

            <div className="prose prose-neutral prose-sm max-w-none">
              <h2 className="text-base font-semibold text-neutral-900">仕事内容</h2>
              <div className="whitespace-pre-wrap text-neutral-600">{job.description}</div>
            </div>

            {job.requirements && (
              <div className="prose prose-neutral prose-sm max-w-none">
                <h2 className="text-base font-semibold text-neutral-900">応募条件</h2>
                <div className="whitespace-pre-wrap text-neutral-600">{job.requirements}</div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-neutral-200 rounded-xl p-4 space-y-4">
              <ApplyButton jobId={job.id} />

              <div className="space-y-3 text-sm">
                {job.location && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    {job.location}
                  </div>
                )}
                {salary && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="text-neutral-400 text-xs font-medium w-4 text-center">¥</span>
                    {salary}
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  {new Date(job.created_at).toLocaleDateString('ja-JP')} 掲載
                </div>
                {job.expires_at && (
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    掲載期限: {new Date(job.expires_at).toLocaleDateString('ja-JP')}
                  </div>
                )}
              </div>
            </div>

            {/* Company card */}
            <Link
              href={`/companies/${job.company.slug}`}
              className="block border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{job.company.name}</p>
                  {job.company.industry && (
                    <p className="text-xs text-neutral-500">{job.company.industry}</p>
                  )}
                </div>
              </div>
              {job.company.description && (
                <p className="text-xs text-neutral-500 line-clamp-2">{job.company.description}</p>
              )}
              {job.company.website && (
                <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                  <Globe className="w-3 h-3" />
                  {job.company.website.replace(/^https?:\/\//, '')}
                </div>
              )}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
