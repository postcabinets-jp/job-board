'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const jobSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  department: z.string().optional(),
  location: z.string().optional(),
  remote_policy: z.enum(['onsite','remote','hybrid']).optional(),
  employment_type: z.enum(['full_time','part_time','contract','internship']).optional(),
  salary_min: z.coerce.number().int().positive().optional(),
  salary_max: z.coerce.number().int().positive().optional(),
  salary_currency: z.string().default('JPY'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
})

/** Verify that the current user is a recruiter/admin of the company */
async function verifyRecruiter(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string, userId: string) {
  const { data } = await supabase
    .from('memberships')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .single()
  return data?.role === 'admin' || data?.role === 'recruiter'
}

export async function createJob(formData: FormData) {
  const raw = {
    companyId: formData.get('companyId'),
    title: formData.get('title'),
    department: formData.get('department') || undefined,
    location: formData.get('location') || undefined,
    remote_policy: formData.get('remote_policy') || undefined,
    employment_type: formData.get('employment_type') || undefined,
    salary_min: formData.get('salary_min') || undefined,
    salary_max: formData.get('salary_max') || undefined,
    salary_currency: formData.get('salary_currency') || 'JPY',
    description: formData.get('description') || undefined,
    requirements: formData.get('requirements') || undefined,
    benefits: formData.get('benefits') || undefined,
  }

  const parsed = jobSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  if (!await verifyRecruiter(supabase, parsed.data.companyId, user.id)) {
    return { error: '権限がありません' }
  }

  let slug = slugify(parsed.data.title)
  if (!slug) slug = `job-${Date.now()}`

  const { data: existing } = await supabase
    .from('jobs')
    .select('slug')
    .eq('company_id', parsed.data.companyId)
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { companyId, ...fields } = parsed.data

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: companyId,
      created_by: user.id,
      ...fields,
      slug,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Create default pipeline stages
  const defaultStages = [
    { name: '書類選考', position: 0, color: '#6B7280' },
    { name: '一次面接', position: 1, color: '#3B82F6' },
    { name: '最終面接', position: 2, color: '#8B5CF6' },
    { name: 'オファー', position: 3, color: '#10B981' },
  ]

  await supabase.from('pipeline_stages').insert(
    defaultStages.map(s => ({ ...s, job_id: data.id }))
  )

  revalidatePath('/dashboard/jobs')
  return { success: true, jobId: data.id }
}

export async function updateJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const companyId = formData.get('companyId') as string

  if (!jobId || !companyId) return { error: '必須パラメータが不足しています' }

  const raw = {
    companyId,
    title: formData.get('title'),
    department: formData.get('department') || undefined,
    location: formData.get('location') || undefined,
    remote_policy: formData.get('remote_policy') || undefined,
    employment_type: formData.get('employment_type') || undefined,
    salary_min: formData.get('salary_min') || undefined,
    salary_max: formData.get('salary_max') || undefined,
    salary_currency: formData.get('salary_currency') || 'JPY',
    description: formData.get('description') || undefined,
    requirements: formData.get('requirements') || undefined,
    benefits: formData.get('benefits') || undefined,
  }

  const parsed = jobSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  if (!await verifyRecruiter(supabase, companyId, user.id)) {
    return { error: '権限がありません' }
  }

  const { companyId: _cid, ...fields } = parsed.data

  const { error } = await supabase
    .from('jobs')
    .update(fields)
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/jobs')
  revalidatePath(`/dashboard/jobs/${jobId}`)
  return { success: true }
}

export async function publishJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const companyId = formData.get('companyId') as string

  if (!jobId || !companyId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  if (!await verifyRecruiter(supabase, companyId, user.id)) {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}

export async function closeJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const companyId = formData.get('companyId') as string

  if (!jobId || !companyId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  if (!await verifyRecruiter(supabase, companyId, user.id)) {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}

export async function deleteJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const companyId = formData.get('companyId') as string

  if (!jobId || !companyId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  if (!await verifyRecruiter(supabase, companyId, user.id)) {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/jobs')
  return { success: true }
}
