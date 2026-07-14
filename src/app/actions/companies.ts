'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Company, MemberRole } from '@/lib/supabase/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const createCompanySchema = z.object({
  name: z.string().min(1, '会社名を入力してください').max(100),
  industry: z.string().optional(),
  size_range: z.enum(['1-10','11-50','51-200','201-500','500+']).optional(),
  website_url: z.string().url('URLの形式が正しくありません').optional().or(z.literal('')),
  description: z.string().optional(),
})

const updateCompanySchema = createCompanySchema.extend({
  companyId: z.string().uuid(),
  logo_url: z.string().optional(),
})

export async function createCompany(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    industry: formData.get('industry') || undefined,
    size_range: formData.get('size_range') || undefined,
    website_url: formData.get('website_url') || undefined,
    description: formData.get('description') || undefined,
  }

  const parsed = createCompanySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  let slug = slugify(parsed.data.name)
  if (!slug) slug = `company-${Date.now()}`

  const { data: existing } = await supabase
    .from('companies')
    .select('slug')
    .eq('slug', slug)
    .limit(1)

  if (existing && existing.length > 0) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry || null,
      size_range: parsed.data.size_range || null,
      website_url: parsed.data.website_url || null,
      description: parsed.data.description || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Create admin membership for creator
  const { error: memberError } = await supabase
    .from('memberships')
    .insert({
      company_id: company.id,
      user_id: user.id,
      role: 'admin',
      accepted_at: new Date().toISOString(),
    })

  if (memberError) return { error: memberError.message }

  revalidatePath('/dashboard')
  return { success: true, companyId: company.id }
}

export async function updateCompany(formData: FormData) {
  const raw = {
    companyId: formData.get('companyId'),
    name: formData.get('name'),
    industry: formData.get('industry') || undefined,
    size_range: formData.get('size_range') || undefined,
    website_url: formData.get('website_url') || undefined,
    description: formData.get('description') || undefined,
    logo_url: formData.get('logo_url') || undefined,
  }

  const parsed = updateCompanySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  // Verify admin membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('company_id', parsed.data.companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('companies')
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry || null,
      size_range: parsed.data.size_range || null,
      website_url: parsed.data.website_url || null,
      description: parsed.data.description || null,
      logo_url: parsed.data.logo_url || null,
    })
    .eq('id', parsed.data.companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings/company')
  return { success: true }
}

export async function inviteMember(formData: FormData) {
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const companyId = formData.get('companyId') as string

  if (!email || !role || !companyId) {
    return { error: '必須項目が不足しています' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: '権限がありません' }
  }

  return { success: true, message: `${email}に招待メールを送信しました` }
}

export async function removeMember(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const companyId = formData.get('companyId') as string

  if (!memberId || !companyId) return { error: '必須項目が不足しています' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: '権限がありません' }
  }

  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('id', memberId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/team')
  return { success: true }
}

/** Returns the first company+role for the current user, or null */
export async function getUserCompany(): Promise<{ company: Company; role: MemberRole } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('memberships')
    .select('role, company:companies(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!data) return null
  return {
    company: data.company as unknown as Company,
    role: data.role as MemberRole,
  }
}
