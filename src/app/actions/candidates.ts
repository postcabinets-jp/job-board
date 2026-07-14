'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const candidateSchema = z.object({
  companyId: z.string().uuid(),
  email: z.string().email('メールアドレスの形式が正しくありません'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  source: z.enum(['careers_page','linkedin','referral','indeed','manual','other']).optional(),
})

export async function createCandidate(formData: FormData) {
  const raw = {
    companyId: formData.get('companyId'),
    email: formData.get('email'),
    first_name: formData.get('first_name') || undefined,
    last_name: formData.get('last_name') || undefined,
    phone: formData.get('phone') || undefined,
    location: formData.get('location') || undefined,
    linkedin_url: formData.get('linkedin_url') || undefined,
    website_url: formData.get('website_url') || undefined,
    source: formData.get('source') || 'manual',
  }

  const parsed = candidateSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      company_id: parsed.data.companyId,
      email: parsed.data.email,
      first_name: parsed.data.first_name || null,
      last_name: parsed.data.last_name || null,
      phone: parsed.data.phone || null,
      location: parsed.data.location || null,
      linkedin_url: parsed.data.linkedin_url || null,
      website_url: parsed.data.website_url || null,
      source: parsed.data.source || 'manual',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/candidates')
  return { success: true, candidateId: data.id }
}

export async function updateCandidateTags(formData: FormData) {
  const candidateId = formData.get('candidateId') as string
  const companyId = formData.get('companyId') as string
  const tags = JSON.parse(formData.get('tags') as string || '[]') as string[]

  if (!candidateId || !companyId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('candidates')
    .update({ tags })
    .eq('id', candidateId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/candidates/${candidateId}`)
  return { success: true }
}

export async function moveApplicationStage(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const stageId = formData.get('stageId') as string | null

  if (!applicationId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  // Get current stage
  const { data: app } = await supabase
    .from('applications')
    .select('stage_id, job_id')
    .eq('id', applicationId)
    .single()

  if (!app) return { error: '応募が見つかりません' }

  const { error } = await supabase
    .from('applications')
    .update({ stage_id: stageId || null })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  // Log the stage change
  await supabase.from('application_stage_history').insert({
    application_id: applicationId,
    from_stage_id: app.stage_id,
    to_stage_id: stageId || null,
    moved_by: user.id,
  })

  revalidatePath(`/dashboard/jobs/${app.job_id}/pipeline`)
  return { success: true }
}

export async function updateApplicationStatus(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const status = formData.get('status') as string
  const rejection_reason = formData.get('rejection_reason') as string | null

  if (!applicationId || !status) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { data: app } = await supabase
    .from('applications')
    .select('job_id')
    .eq('id', applicationId)
    .single()

  if (!app) return { error: '応募が見つかりません' }

  const { error } = await supabase
    .from('applications')
    .update({
      status,
      rejection_reason: rejection_reason || null,
    })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/jobs/${app.job_id}/pipeline`)
  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function updateApplicationRating(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const rating = Number(formData.get('rating'))

  if (!applicationId || !rating) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('applications')
    .update({ rating })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  return { success: true }
}

export async function createNote(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const body = formData.get('body') as string
  const is_private = formData.get('is_private') === 'true'

  if (!applicationId || !body) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('notes')
    .insert({
      application_id: applicationId,
      author_id: user.id,
      body,
      is_private,
    })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/candidates`)
  return { success: true }
}

export async function deleteNote(formData: FormData) {
  const noteId = formData.get('noteId') as string
  if (!noteId) return { error: '必須パラメータが不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  return { success: true }
}

export async function createInterview(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const title = formData.get('title') as string
  const scheduled_at = formData.get('scheduled_at') as string
  const duration_min = Number(formData.get('duration_min') || 60)
  const location = formData.get('location') as string | null

  if (!applicationId || !title || !scheduled_at) {
    return { error: '必須パラメータが不足しています' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase
    .from('interviews')
    .insert({
      application_id: applicationId,
      title,
      scheduled_at,
      duration_min,
      location: location || null,
      created_by: user.id,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/interviews')
  return { success: true }
}

/** Public: submit application from career page */
export async function submitApplication(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const companyId = formData.get('companyId') as string
  const email = formData.get('email') as string
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const phone = formData.get('phone') as string | null
  const cover_letter = formData.get('cover_letter') as string | null

  if (!jobId || !companyId || !email) {
    return { error: '必須項目を入力してください' }
  }

  if (!z.string().email().safeParse(email).success) {
    return { error: 'メールアドレスの形式が正しくありません' }
  }

  const supabase = await createClient()

  // Upsert candidate
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .upsert({
      company_id: companyId,
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      phone: phone || null,
      source: 'careers_page',
    }, { onConflict: 'company_id,email' })
    .select('id')
    .single()

  if (candidateError) return { error: candidateError.message }

  // Get first pipeline stage for this job
  const { data: firstStage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('job_id', jobId)
    .order('position', { ascending: true })
    .limit(1)
    .single()

  const { error: appError } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: candidate.id,
      stage_id: firstStage?.id || null,
      cover_letter: cover_letter || null,
      status: 'active',
    })

  if (appError) {
    if (appError.code === '23505') {
      return { error: 'この求人には既に応募済みです' }
    }
    return { error: appError.message }
  }

  return { success: true }
}
