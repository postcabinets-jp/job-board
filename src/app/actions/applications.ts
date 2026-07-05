'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  applyToJobSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from '@/lib/validations'

export async function applyToJob(formData: FormData) {
  const parsed = applyToJobSchema.safeParse({
    jobId: formData.get('jobId'),
    resume_url: formData.get('resume_url'),
    cover_letter: formData.get('cover_letter'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId, resume_url, cover_letter } = parsed.data

  // Check job is published
  const { data: job } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', jobId)
    .eq('status', 'published')
    .single()

  if (!job) return { error: 'この求人は現在応募を受け付けていません' }

  // Check for duplicate application
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'この求人には既に応募済みです' }
  }

  const { error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      applicant_id: user.id,
      resume_url,
      cover_letter,
      status: 'pending',
    })

  if (error) return { error: error.message }

  revalidatePath(`/jobs`)
  return { success: '応募が完了しました' }
}

export async function updateApplicationStatus(formData: FormData) {
  const parsed = updateApplicationStatusSchema.safeParse({
    applicationId: formData.get('applicationId'),
    jobId: formData.get('jobId'),
    status: formData.get('status'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { applicationId, jobId, status } = parsed.data

  // Verify ownership through company
  const { data: job } = await supabase
    .from('jobs')
    .select('company_id, companies!inner(user_id)')
    .eq('id', jobId)
    .single()

  if (!job || (job.companies as unknown as { user_id: string }).user_id !== user.id) {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .eq('job_id', jobId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/jobs/${jobId}/applications`)
  return { success: true }
}

export async function withdrawApplication(formData: FormData) {
  const parsed = withdrawApplicationSchema.safeParse({
    applicationId: formData.get('applicationId'),
    jobId: formData.get('jobId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { applicationId, jobId } = parsed.data

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/jobs`)
  return { success: '応募を取り下げました' }
}
