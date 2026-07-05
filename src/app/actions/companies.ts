'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCompanySchema, updateCompanySchema } from '@/lib/validations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function createCompany(formData: FormData) {
  const parsed = createCompanySchema.safeParse({
    name: formData.get('name'),
    website: formData.get('website'),
    industry: formData.get('industry'),
    description: formData.get('description'),
    location: formData.get('location'),
    logo_url: formData.get('logo_url'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { name, website, industry, description, location, logo_url } = parsed.data

  let slug = slugify(name)
  if (!slug) slug = `company-${Date.now()}`

  const { data: existing } = await supabase
    .from('companies')
    .select('slug')
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      user_id: user.id,
      name,
      slug,
      website,
      industry,
      description,
      location,
      logo_url,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, companyId: data.id }
}

export async function updateCompany(formData: FormData) {
  const parsed = updateCompanySchema.safeParse({
    companyId: formData.get('companyId'),
    name: formData.get('name'),
    website: formData.get('website'),
    industry: formData.get('industry'),
    description: formData.get('description'),
    location: formData.get('location'),
    logo_url: formData.get('logo_url'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { companyId, ...fields } = parsed.data

  const { error } = await supabase
    .from('companies')
    .update(fields)
    .eq('id', companyId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}
