import { z } from 'zod'

// ─── Enums ──────────────────────────────────────────────────
export const remoteTypeSchema = z.enum(['onsite', 'hybrid', 'remote'])
export const employmentTypeSchema = z.enum(['full-time', 'part-time', 'contract', 'internship'])
export const jobStatusSchema = z.enum(['draft', 'published', 'closed', 'filled'])
export const jobCategorySchema = z.enum([
  'engineering',
  'design',
  'marketing',
  'sales',
  'operations',
  'finance',
  'hr',
  'legal',
  'support',
  'other',
])
export const applicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'shortlisted',
  'rejected',
  'hired',
])

// ─── UUID (reusable) ────────────────────────────────────────
const uuid = z.string().uuid('有効なUUIDを入力してください')

// FormData.get() returns null for absent fields. Coerce null → undefined
// so z.string().optional() works correctly.
const optStr = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? undefined)

// ─── Auth ───────────────────────────────────────────────────
export const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .max(72, 'パスワードは72文字以内にしてください'),
  display_name: z
    .string()
    .min(1, '表示名は必須です')
    .max(100, '表示名は100文字以内にしてください')
    .transform((v) => v.trim()),
})

export const signInSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'パスワードは8文字以上必要です')
    .max(72, 'パスワードは72文字以内にしてください'),
})

// ─── Companies ──────────────────────────────────────────────
export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, '会社名は必須です')
    .max(200, '会社名は200文字以内にしてください')
    .transform((v) => v.trim()),
  website: optStr.pipe(
    z
      .string()
      .url('有効なURLを入力してください')
      .optional()
      .or(z.literal(''))
      .transform((v) => v?.trim() || null),
  ),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  description: optStr.pipe(
    z
      .string()
      .max(2000, '説明は2000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  location: optStr.pipe(
    z
      .string()
      .max(200, '所在地は200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  logo_url: optStr.pipe(
    z
      .string()
      .url('有効なURLを入力してください')
      .optional()
      .or(z.literal(''))
      .transform((v) => v?.trim() || null),
  ),
})

export const updateCompanySchema = z.object({
  companyId: uuid,
  name: z
    .string()
    .min(1, '会社名は必須です')
    .max(200, '会社名は200文字以内にしてください')
    .transform((v) => v.trim()),
  website: optStr.pipe(
    z
      .string()
      .url('有効なURLを入力してください')
      .optional()
      .or(z.literal(''))
      .transform((v) => v?.trim() || null),
  ),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  description: optStr.pipe(
    z
      .string()
      .max(2000, '説明は2000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  location: optStr.pipe(
    z
      .string()
      .max(200, '所在地は200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  logo_url: optStr.pipe(
    z
      .string()
      .url('有効なURLを入力してください')
      .optional()
      .or(z.literal(''))
      .transform((v) => v?.trim() || null),
  ),
})

// ─── Jobs ───────────────────────────────────────────────────
export const createJobSchema = z
  .object({
    companyId: uuid,
    title: z
      .string()
      .min(1, '求人タイトルは必須です')
      .max(200, '求人タイトルは200文字以内にしてください')
      .transform((v) => v.trim()),
    description: z
      .string()
      .min(10, '求人説明は10文字以上必要です')
      .max(10000, '求人説明は10000文字以内にしてください')
      .transform((v) => v.trim()),
    requirements: optStr.pipe(
      z
        .string()
        .max(5000, '応募条件は5000文字以内にしてください')
        .optional()
        .transform((v) => v?.trim() || null),
    ),
    salary_min: z
      .number({ message: '下限給与は数値で入力してください' })
      .int('下限給与は整数で入力してください')
      .min(0, '下限給与は0以上で入力してください')
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    salary_max: z
      .number({ message: '上限給与は数値で入力してください' })
      .int('上限給与は整数で入力してください')
      .min(0, '上限給与は0以上で入力してください')
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    currency: z
      .string()
      .min(1, '通貨は必須です')
      .max(3, '通貨コードは3文字以内にしてください')
      .default('JPY')
      .transform((v) => v.toUpperCase()),
    location: optStr.pipe(
      z
        .string()
        .max(200, '勤務地は200文字以内にしてください')
        .optional()
        .transform((v) => v?.trim() || null),
    ),
    remote_type: remoteTypeSchema,
    employment_type: employmentTypeSchema,
    category: jobCategorySchema,
    expires_at: optStr.pipe(
      z
        .string()
        .datetime({ message: '有効な日時を入力してください' })
        .optional()
        .or(z.literal(''))
        .transform((v) => (v ? v : null)),
    ),
  })
  .refine(
    (data) => {
      if (data.salary_min !== null && data.salary_max !== null) {
        return data.salary_max >= data.salary_min
      }
      return true
    },
    { message: '上限給与は下限給与以上に設定してください', path: ['salary_max'] },
  )

export const updateJobSchema = z
  .object({
    jobId: uuid,
    companyId: uuid,
    title: z
      .string()
      .min(1, '求人タイトルは必須です')
      .max(200, '求人タイトルは200文字以内にしてください')
      .transform((v) => v.trim()),
    description: z
      .string()
      .min(10, '求人説明は10文字以上必要です')
      .max(10000, '求人説明は10000文字以内にしてください')
      .transform((v) => v.trim()),
    requirements: optStr.pipe(
      z
        .string()
        .max(5000, '応募条件は5000文字以内にしてください')
        .optional()
        .transform((v) => v?.trim() || null),
    ),
    salary_min: z
      .number({ message: '下限給与は数値で入力してください' })
      .int('下限給与は整数で入力してください')
      .min(0, '下限給与は0以上で入力してください')
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    salary_max: z
      .number({ message: '上限給与は数値で入力してください' })
      .int('上限給与は整数で入力してください')
      .min(0, '上限給与は0以上で入力してください')
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    currency: z
      .string()
      .min(1, '通貨は必須です')
      .max(3, '通貨コードは3文字以内にしてください')
      .transform((v) => v.toUpperCase()),
    location: optStr.pipe(
      z
        .string()
        .max(200, '勤務地は200文字以内にしてください')
        .optional()
        .transform((v) => v?.trim() || null),
    ),
    remote_type: remoteTypeSchema,
    employment_type: employmentTypeSchema,
    category: jobCategorySchema,
    status: jobStatusSchema.optional(),
    expires_at: optStr.pipe(
      z
        .string()
        .datetime({ message: '有効な日時を入力してください' })
        .optional()
        .or(z.literal(''))
        .transform((v) => (v ? v : null)),
    ),
  })
  .refine(
    (data) => {
      if (data.salary_min !== null && data.salary_max !== null) {
        return data.salary_max >= data.salary_min
      }
      return true
    },
    { message: '上限給与は下限給与以上に設定してください', path: ['salary_max'] },
  )

export const publishJobSchema = z.object({
  jobId: uuid,
  companyId: uuid,
})

export const closeJobSchema = z.object({
  jobId: uuid,
  companyId: uuid,
})

export const deleteJobSchema = z.object({
  jobId: uuid,
  companyId: uuid,
})

// ─── Applications ───────────────────────────────────────────
export const applyToJobSchema = z.object({
  jobId: uuid,
  resume_url: optStr.pipe(
    z
      .string()
      .url('有効なURLを入力してください')
      .optional()
      .or(z.literal(''))
      .transform((v) => v?.trim() || null),
  ),
  cover_letter: optStr.pipe(
    z
      .string()
      .max(5000, 'カバーレターは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
})

export const updateApplicationStatusSchema = z.object({
  applicationId: uuid,
  jobId: uuid,
  status: applicationStatusSchema,
})

export const withdrawApplicationSchema = z.object({
  applicationId: uuid,
  jobId: uuid,
})

// ─── Saved Jobs ─────────────────────────────────────────────
export const saveJobSchema = z.object({
  jobId: uuid,
})

export const unsaveJobSchema = z.object({
  jobId: uuid,
})

// ─── Search / Filter ────────────────────────────────────────
export const jobSearchSchema = z.object({
  query: optStr.pipe(
    z
      .string()
      .max(200, '検索キーワードは200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  category: jobCategorySchema.optional(),
  remote_type: remoteTypeSchema.optional(),
  employment_type: employmentTypeSchema.optional(),
  location: optStr.pipe(
    z
      .string()
      .max(200)
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  salary_min: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(20),
})
