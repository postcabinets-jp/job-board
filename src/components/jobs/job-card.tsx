import Link from 'next/link'
import { Building2, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { JobWithCompany } from '@/lib/supabase/types'

const remoteLabels: Record<string, string> = {
  onsite: 'オンサイト',
  hybrid: 'ハイブリッド',
  remote: 'リモート',
}

const employmentLabels: Record<string, string> = {
  'full-time': '正社員',
  'part-time': 'パートタイム',
  contract: '業務委託',
  internship: 'インターン',
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

export function JobCard({ job }: { job: JobWithCompany }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency)

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 mb-0.5 truncate">{job.title}</h3>
          <p className="text-xs text-neutral-500 mb-2">{job.company.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
            )}
            <Badge variant="secondary" className="text-xs">
              {remoteLabels[job.remote_type] || job.remote_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {employmentLabels[job.employment_type] || job.employment_type}
            </Badge>
            {salary && (
              <span className="text-xs text-neutral-600 font-medium">{salary}</span>
            )}
          </div>
        </div>
        <div className="flex items-start">
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </Link>
  )
}
