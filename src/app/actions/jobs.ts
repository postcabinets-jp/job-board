'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  closeJobSchema,
  deleteJobSchema,
} from '@/lib/validations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export async function createJob(formData: FormData) {
  const raw = {
    companyId: formData.get('companyId'),
    title: formData.get('title'),
    description: formData.get('description'),
    requirements: formData.get('requirements'),
    salary_min: formData.get('salary_min') ? Number(formData.get('salary_min')) : null,
    salary_max: formData.get('salary_max') ? Number(formData.get('salary_max')) : null,
    currency: formData.get('currency') || 'JPY',
    location: formData.get('location'),
    remote_type: formData.get('remote_type'),
    employment_type: formData.get('employment_type'),
    category: formData.get('category'),
    expires_at: formData.get('expires_at'),
  }

  const parsed = createJobSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  // Verify company ownership
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', parsed.data.companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return { error: '会社が見つかりません' }

  const { companyId, ...fields } = parsed.data
  let slug = slugify(fields.title)
  if (!slug) slug = `job-${Date.now()}`

  const { data: existing } = await supabase
    .from('jobs')
    .select('slug')
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: companyId,
      ...fields,
      slug,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, jobId: data.id }
}

export async function updateJob(formData: FormData) {
  const raw = {
    jobId: formData.get('jobId'),
    companyId: formData.get('companyId'),
    title: formData.get('title'),
    description: formData.get('description'),
    requirements: formData.get('requirements'),
    salary_min: formData.get('salary_min') ? Number(formData.get('salary_min')) : null,
    salary_max: formData.get('salary_max') ? Number(formData.get('salary_max')) : null,
    currency: formData.get('currency') || 'JPY',
    location: formData.get('location'),
    remote_type: formData.get('remote_type'),
    employment_type: formData.get('employment_type'),
    category: formData.get('category'),
    status: formData.get('status') || undefined,
    expires_at: formData.get('expires_at'),
  }

  const parsed = updateJobSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId, companyId, ...fields } = parsed.data

  // Verify company ownership
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return { error: '会社が見つかりません' }

  const { error } = await supabase
    .from('jobs')
    .update(fields)
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/jobs/${jobId}`)
  return { success: true }
}

export async function publishJob(formData: FormData) {
  const parsed = publishJobSchema.safeParse({
    jobId: formData.get('jobId'),
    companyId: formData.get('companyId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId, companyId } = parsed.data

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return { error: '会社が見つかりません' }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'published' })
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/jobs')
  return { success: true }
}

export async function closeJob(formData: FormData) {
  const parsed = closeJobSchema.safeParse({
    jobId: formData.get('jobId'),
    companyId: formData.get('companyId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId, companyId } = parsed.data

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return { error: '会社が見つかりません' }

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'closed' })
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/jobs')
  return { success: true }
}

export async function deleteJob(formData: FormData) {
  const parsed = deleteJobSchema.safeParse({
    jobId: formData.get('jobId'),
    companyId: formData.get('companyId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId, companyId } = parsed.data

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!company) return { error: '会社が見つかりません' }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/jobs')
  return { success: true }
}
