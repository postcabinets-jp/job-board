'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { saveJobSchema, unsaveJobSchema } from '@/lib/validations'

export async function saveJob(formData: FormData) {
  const parsed = saveJobSchema.safeParse({
    jobId: formData.get('jobId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId } = parsed.data

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: '既に保存済みです' }
  }

  const { error } = await supabase
    .from('saved_jobs')
    .insert({
      job_id: jobId,
      user_id: user.id,
    })

  if (error) return { error: error.message }

  revalidatePath('/jobs')
  return { success: '求人を保存しました' }
}

export async function unsaveJob(formData: FormData) {
  const parsed = unsaveJobSchema.safeParse({
    jobId: formData.get('jobId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { jobId } = parsed.data

  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('job_id', jobId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/jobs')
  return { success: '保存を解除しました' }
}
