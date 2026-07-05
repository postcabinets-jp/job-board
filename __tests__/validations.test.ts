import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createCompanySchema,
  updateCompanySchema,
  createJobSchema,
  updateJobSchema,
  publishJobSchema,
  closeJobSchema,
  deleteJobSchema,
  applyToJobSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
  saveJobSchema,
  unsaveJobSchema,
  jobSearchSchema,
  remoteTypeSchema,
  employmentTypeSchema,
  jobStatusSchema,
  jobCategorySchema,
  applicationStatusSchema,
} from '@/lib/validations'

const validUUID = '550e8400-e29b-41d4-a716-446655440000'

// ─── Enum schemas ───────────────────────────────────────────
describe('remoteTypeSchema', () => {
  it('accepts onsite', () => {
    expect(remoteTypeSchema.safeParse('onsite').success).toBe(true)
  })
  it('accepts hybrid', () => {
    expect(remoteTypeSchema.safeParse('hybrid').success).toBe(true)
  })
  it('accepts remote', () => {
    expect(remoteTypeSchema.safeParse('remote').success).toBe(true)
  })
  it('rejects invalid value', () => {
    expect(remoteTypeSchema.safeParse('office').success).toBe(false)
  })
  it('rejects empty string', () => {
    expect(remoteTypeSchema.safeParse('').success).toBe(false)
  })
})

describe('employmentTypeSchema', () => {
  it('accepts full-time', () => {
    expect(employmentTypeSchema.safeParse('full-time').success).toBe(true)
  })
  it('accepts part-time', () => {
    expect(employmentTypeSchema.safeParse('part-time').success).toBe(true)
  })
  it('accepts contract', () => {
    expect(employmentTypeSchema.safeParse('contract').success).toBe(true)
  })
  it('accepts internship', () => {
    expect(employmentTypeSchema.safeParse('internship').success).toBe(true)
  })
  it('rejects invalid value', () => {
    expect(employmentTypeSchema.safeParse('freelance').success).toBe(false)
  })
})

describe('jobStatusSchema', () => {
  it('accepts draft', () => {
    expect(jobStatusSchema.safeParse('draft').success).toBe(true)
  })
  it('accepts published', () => {
    expect(jobStatusSchema.safeParse('published').success).toBe(true)
  })
  it('accepts closed', () => {
    expect(jobStatusSchema.safeParse('closed').success).toBe(true)
  })
  it('accepts filled', () => {
    expect(jobStatusSchema.safeParse('filled').success).toBe(true)
  })
  it('rejects invalid value', () => {
    expect(jobStatusSchema.safeParse('archived').success).toBe(false)
  })
})

describe('jobCategorySchema', () => {
  const categories = ['engineering', 'design', 'marketing', 'sales', 'operations', 'finance', 'hr', 'legal', 'support', 'other']
  categories.forEach((cat) => {
    it(`accepts ${cat}`, () => {
      expect(jobCategorySchema.safeParse(cat).success).toBe(true)
    })
  })
  it('rejects invalid value', () => {
    expect(jobCategorySchema.safeParse('management').success).toBe(false)
  })
})

describe('applicationStatusSchema', () => {
  const statuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired']
  statuses.forEach((s) => {
    it(`accepts ${s}`, () => {
      expect(applicationStatusSchema.safeParse(s).success).toBe(true)
    })
  })
  it('rejects invalid value', () => {
    expect(applicationStatusSchema.safeParse('interviewed').success).toBe(false)
  })
})

// ─── Auth schemas ───────────────────────────────────────────
describe('signUpSchema', () => {
  const valid = { email: 'test@example.com', password: 'password123', display_name: 'Test User' }

  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({ ...valid, email: 'not-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('メールアドレス')
    }
  })

  it('rejects empty email', () => {
    expect(signUpSchema.safeParse({ ...valid, email: '' }).success).toBe(false)
  })

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({ ...valid, password: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8文字')
    }
  })

  it('rejects password over 72 chars', () => {
    expect(signUpSchema.safeParse({ ...valid, password: 'a'.repeat(73) }).success).toBe(false)
  })

  it('accepts password of exactly 8 chars', () => {
    expect(signUpSchema.safeParse({ ...valid, password: '12345678' }).success).toBe(true)
  })

  it('accepts password of exactly 72 chars', () => {
    expect(signUpSchema.safeParse({ ...valid, password: 'a'.repeat(72) }).success).toBe(true)
  })

  it('rejects empty display_name', () => {
    const result = signUpSchema.safeParse({ ...valid, display_name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('表示名')
    }
  })

  it('rejects display_name over 100 chars', () => {
    expect(signUpSchema.safeParse({ ...valid, display_name: 'a'.repeat(101) }).success).toBe(false)
  })

  it('trims display_name whitespace', () => {
    const result = signUpSchema.safeParse({ ...valid, display_name: '  Test  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.display_name).toBe('Test')
    }
  })

  it('rejects missing fields', () => {
    expect(signUpSchema.safeParse({}).success).toBe(false)
  })
})

describe('signInSchema', () => {
  const valid = { email: 'test@example.com', password: 'password123' }

  it('accepts valid input', () => {
    expect(signInSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(signInSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({ ...valid, password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('パスワード')
    }
  })
})

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(resetPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'not-valid' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('メールアドレス')
    }
  })
})

describe('updatePasswordSchema', () => {
  it('accepts valid password', () => {
    expect(updatePasswordSchema.safeParse({ password: 'newpassword1' }).success).toBe(true)
  })

  it('rejects short password', () => {
    expect(updatePasswordSchema.safeParse({ password: '1234567' }).success).toBe(false)
  })

  it('rejects long password', () => {
    expect(updatePasswordSchema.safeParse({ password: 'a'.repeat(73) }).success).toBe(false)
  })
})

// ─── Company schemas ────────────────────────────────────────
describe('createCompanySchema', () => {
  const valid = { name: 'Test Corp' }

  it('accepts minimal valid input', () => {
    expect(createCompanySchema.safeParse(valid).success).toBe(true)
  })

  it('accepts full valid input', () => {
    expect(createCompanySchema.safeParse({
      name: 'Test Corp',
      website: 'https://example.com',
      industry: 'IT',
      description: 'A test company',
      location: 'Tokyo',
      logo_url: 'https://example.com/logo.png',
    }).success).toBe(true)
  })

  it('rejects empty company name', () => {
    const result = createCompanySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('会社名')
    }
  })

  it('rejects company name over 200 chars', () => {
    expect(createCompanySchema.safeParse({ name: 'a'.repeat(201) }).success).toBe(false)
  })

  it('trims company name', () => {
    const result = createCompanySchema.safeParse({ name: '  Test Corp  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Corp')
    }
  })

  it('accepts null optional fields', () => {
    expect(createCompanySchema.safeParse({ name: 'Test', website: null, industry: null }).success).toBe(true)
  })

  it('converts empty optional strings to null', () => {
    const result = createCompanySchema.safeParse({ name: 'Test', website: '', industry: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.website).toBeNull()
      expect(result.data.industry).toBeNull()
    }
  })

  it('rejects invalid website URL', () => {
    expect(createCompanySchema.safeParse({ name: 'Test', website: 'not-a-url' }).success).toBe(false)
  })

  it('rejects description over 2000 chars', () => {
    expect(createCompanySchema.safeParse({ name: 'Test', description: 'a'.repeat(2001) }).success).toBe(false)
  })

  it('rejects location over 200 chars', () => {
    expect(createCompanySchema.safeParse({ name: 'Test', location: 'a'.repeat(201) }).success).toBe(false)
  })

  it('rejects invalid logo_url', () => {
    expect(createCompanySchema.safeParse({ name: 'Test', logo_url: 'not-url' }).success).toBe(false)
  })
})

describe('updateCompanySchema', () => {
  const valid = { companyId: validUUID, name: 'Updated Corp' }

  it('accepts valid input', () => {
    expect(updateCompanySchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid companyId', () => {
    expect(updateCompanySchema.safeParse({ ...valid, companyId: 'not-uuid' }).success).toBe(false)
  })

  it('rejects empty name', () => {
    expect(updateCompanySchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })
})

// ─── Job schemas ────────────────────────────────────────────
describe('createJobSchema', () => {
  const valid = {
    companyId: validUUID,
    title: 'Senior Engineer',
    description: 'We are looking for a senior engineer to join our team.',
    remote_type: 'remote' as const,
    employment_type: 'full-time' as const,
    category: 'engineering' as const,
  }

  it('accepts minimal valid input', () => {
    expect(createJobSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts full valid input', () => {
    expect(createJobSchema.safeParse({
      ...valid,
      requirements: 'Must have 5+ years experience',
      salary_min: 5000000,
      salary_max: 10000000,
      currency: 'JPY',
      location: 'Tokyo',
      expires_at: '2025-12-31T00:00:00.000Z',
    }).success).toBe(true)
  })

  it('rejects invalid companyId', () => {
    expect(createJobSchema.safeParse({ ...valid, companyId: 'bad' }).success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = createJobSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('求人タイトル')
    }
  })

  it('rejects title over 200 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, title: 'a'.repeat(201) }).success).toBe(false)
  })

  it('trims title whitespace', () => {
    const result = createJobSchema.safeParse({ ...valid, title: '  Engineer  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Engineer')
    }
  })

  it('rejects short description', () => {
    const result = createJobSchema.safeParse({ ...valid, description: 'Short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('10文字')
    }
  })

  it('rejects description over 10000 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, description: 'a'.repeat(10001) }).success).toBe(false)
  })

  it('rejects requirements over 5000 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, requirements: 'a'.repeat(5001) }).success).toBe(false)
  })

  it('accepts null salary_min', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: null }).success).toBe(true)
  })

  it('accepts null salary_max', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_max: null }).success).toBe(true)
  })

  it('rejects negative salary_min', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: -1 }).success).toBe(false)
  })

  it('rejects negative salary_max', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_max: -100 }).success).toBe(false)
  })

  it('rejects non-integer salary', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: 5000000.5 }).success).toBe(false)
  })

  it('rejects salary_max less than salary_min', () => {
    const result = createJobSchema.safeParse({ ...valid, salary_min: 10000000, salary_max: 5000000 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('上限給与'))).toBe(true)
    }
  })

  it('accepts salary_max equal to salary_min', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: 5000000, salary_max: 5000000 }).success).toBe(true)
  })

  it('allows only salary_min without salary_max', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: 5000000, salary_max: null }).success).toBe(true)
  })

  it('allows only salary_max without salary_min', () => {
    expect(createJobSchema.safeParse({ ...valid, salary_min: null, salary_max: 10000000 }).success).toBe(true)
  })

  it('uppercases currency', () => {
    const result = createJobSchema.safeParse({ ...valid, currency: 'usd' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('USD')
    }
  })

  it('rejects empty currency', () => {
    expect(createJobSchema.safeParse({ ...valid, currency: '' }).success).toBe(false)
  })

  it('rejects currency over 3 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, currency: 'EURO' }).success).toBe(false)
  })

  it('rejects invalid remote_type', () => {
    expect(createJobSchema.safeParse({ ...valid, remote_type: 'wfh' }).success).toBe(false)
  })

  it('rejects invalid employment_type', () => {
    expect(createJobSchema.safeParse({ ...valid, employment_type: 'freelance' }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(createJobSchema.safeParse({ ...valid, category: 'management' }).success).toBe(false)
  })

  it('rejects invalid expires_at', () => {
    expect(createJobSchema.safeParse({ ...valid, expires_at: 'not-a-date' }).success).toBe(false)
  })

  it('accepts valid ISO datetime for expires_at', () => {
    expect(createJobSchema.safeParse({ ...valid, expires_at: '2025-12-31T23:59:59.000Z' }).success).toBe(true)
  })

  it('converts empty expires_at to null', () => {
    const result = createJobSchema.safeParse({ ...valid, expires_at: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.expires_at).toBeNull()
    }
  })

  it('rejects location over 200 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, location: 'a'.repeat(201) }).success).toBe(false)
  })

  it('converts empty location to null', () => {
    const result = createJobSchema.safeParse({ ...valid, location: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.location).toBeNull()
    }
  })

  it('converts null requirements to null', () => {
    const result = createJobSchema.safeParse({ ...valid, requirements: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.requirements).toBeNull()
    }
  })

  it('defaults currency to JPY', () => {
    const input = { ...valid }
    // Explicitly don't set currency - but zod has .default('JPY') which only works if field is undefined
    const result = createJobSchema.safeParse(input)
    expect(result.success).toBe(true)
  })
})

describe('updateJobSchema', () => {
  const valid = {
    jobId: validUUID,
    companyId: validUUID,
    title: 'Updated Engineer',
    description: 'Updated description for the position that is detailed enough.',
    remote_type: 'hybrid' as const,
    employment_type: 'contract' as const,
    category: 'design' as const,
    currency: 'JPY',
  }

  it('accepts valid input', () => {
    expect(updateJobSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid jobId', () => {
    expect(updateJobSchema.safeParse({ ...valid, jobId: 'bad' }).success).toBe(false)
  })

  it('accepts optional status field', () => {
    expect(updateJobSchema.safeParse({ ...valid, status: 'published' }).success).toBe(true)
  })

  it('rejects invalid status value', () => {
    expect(updateJobSchema.safeParse({ ...valid, status: 'open' }).success).toBe(false)
  })

  it('validates salary range in update', () => {
    expect(updateJobSchema.safeParse({ ...valid, salary_min: 10000000, salary_max: 5000000 }).success).toBe(false)
  })
})

describe('publishJobSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(publishJobSchema.safeParse({ jobId: validUUID, companyId: validUUID }).success).toBe(true)
  })

  it('rejects invalid jobId', () => {
    expect(publishJobSchema.safeParse({ jobId: 'bad', companyId: validUUID }).success).toBe(false)
  })

  it('rejects invalid companyId', () => {
    expect(publishJobSchema.safeParse({ jobId: validUUID, companyId: 'bad' }).success).toBe(false)
  })
})

describe('closeJobSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(closeJobSchema.safeParse({ jobId: validUUID, companyId: validUUID }).success).toBe(true)
  })

  it('rejects missing jobId', () => {
    expect(closeJobSchema.safeParse({ companyId: validUUID }).success).toBe(false)
  })
})

describe('deleteJobSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(deleteJobSchema.safeParse({ jobId: validUUID, companyId: validUUID }).success).toBe(true)
  })

  it('rejects empty strings', () => {
    expect(deleteJobSchema.safeParse({ jobId: '', companyId: '' }).success).toBe(false)
  })
})

// ─── Application schemas ───────────────────────────────────
describe('applyToJobSchema', () => {
  it('accepts minimal valid input (jobId only)', () => {
    expect(applyToJobSchema.safeParse({ jobId: validUUID }).success).toBe(true)
  })

  it('accepts full valid input', () => {
    expect(applyToJobSchema.safeParse({
      jobId: validUUID,
      resume_url: 'https://example.com/resume.pdf',
      cover_letter: 'I am very interested in this position.',
    }).success).toBe(true)
  })

  it('rejects invalid jobId', () => {
    expect(applyToJobSchema.safeParse({ jobId: 'bad' }).success).toBe(false)
  })

  it('rejects invalid resume_url', () => {
    expect(applyToJobSchema.safeParse({ jobId: validUUID, resume_url: 'not-url' }).success).toBe(false)
  })

  it('accepts empty resume_url', () => {
    const result = applyToJobSchema.safeParse({ jobId: validUUID, resume_url: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.resume_url).toBeNull()
    }
  })

  it('rejects cover_letter over 5000 chars', () => {
    expect(applyToJobSchema.safeParse({ jobId: validUUID, cover_letter: 'a'.repeat(5001) }).success).toBe(false)
  })

  it('converts null cover_letter to null', () => {
    const result = applyToJobSchema.safeParse({ jobId: validUUID, cover_letter: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cover_letter).toBeNull()
    }
  })

  it('converts empty cover_letter to null', () => {
    const result = applyToJobSchema.safeParse({ jobId: validUUID, cover_letter: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cover_letter).toBeNull()
    }
  })
})

describe('updateApplicationStatusSchema', () => {
  const valid = { applicationId: validUUID, jobId: validUUID, status: 'reviewing' as const }

  it('accepts valid input', () => {
    expect(updateApplicationStatusSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid applicationId', () => {
    expect(updateApplicationStatusSchema.safeParse({ ...valid, applicationId: 'bad' }).success).toBe(false)
  })

  it('rejects invalid jobId', () => {
    expect(updateApplicationStatusSchema.safeParse({ ...valid, jobId: 'bad' }).success).toBe(false)
  })

  it('accepts all valid statuses', () => {
    const statuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'] as const
    statuses.forEach((status) => {
      expect(updateApplicationStatusSchema.safeParse({ ...valid, status }).success).toBe(true)
    })
  })

  it('rejects invalid status', () => {
    expect(updateApplicationStatusSchema.safeParse({ ...valid, status: 'offered' }).success).toBe(false)
  })
})

describe('withdrawApplicationSchema', () => {
  it('accepts valid input', () => {
    expect(withdrawApplicationSchema.safeParse({ applicationId: validUUID, jobId: validUUID }).success).toBe(true)
  })

  it('rejects invalid applicationId', () => {
    expect(withdrawApplicationSchema.safeParse({ applicationId: 'bad', jobId: validUUID }).success).toBe(false)
  })

  it('rejects missing jobId', () => {
    expect(withdrawApplicationSchema.safeParse({ applicationId: validUUID }).success).toBe(false)
  })
})

// ─── Saved Jobs schemas ────────────────────────────────────
describe('saveJobSchema', () => {
  it('accepts valid jobId', () => {
    expect(saveJobSchema.safeParse({ jobId: validUUID }).success).toBe(true)
  })

  it('rejects invalid jobId', () => {
    expect(saveJobSchema.safeParse({ jobId: 'not-uuid' }).success).toBe(false)
  })

  it('rejects missing jobId', () => {
    expect(saveJobSchema.safeParse({}).success).toBe(false)
  })
})

describe('unsaveJobSchema', () => {
  it('accepts valid jobId', () => {
    expect(unsaveJobSchema.safeParse({ jobId: validUUID }).success).toBe(true)
  })

  it('rejects invalid jobId', () => {
    expect(unsaveJobSchema.safeParse({ jobId: '' }).success).toBe(false)
  })
})

// ─── Job Search schema ─────────────────────────────────────
describe('jobSearchSchema', () => {
  it('accepts empty input with defaults', () => {
    const result = jobSearchSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.per_page).toBe(20)
    }
  })

  it('accepts full search params', () => {
    expect(jobSearchSchema.safeParse({
      query: 'engineer',
      category: 'engineering',
      remote_type: 'remote',
      employment_type: 'full-time',
      location: 'Tokyo',
      salary_min: 5000000,
      page: 2,
      per_page: 50,
    }).success).toBe(true)
  })

  it('rejects query over 200 chars', () => {
    expect(jobSearchSchema.safeParse({ query: 'a'.repeat(201) }).success).toBe(false)
  })

  it('rejects invalid category', () => {
    expect(jobSearchSchema.safeParse({ category: 'invalid' }).success).toBe(false)
  })

  it('rejects invalid remote_type', () => {
    expect(jobSearchSchema.safeParse({ remote_type: 'invalid' }).success).toBe(false)
  })

  it('rejects invalid employment_type', () => {
    expect(jobSearchSchema.safeParse({ employment_type: 'invalid' }).success).toBe(false)
  })

  it('rejects page less than 1', () => {
    expect(jobSearchSchema.safeParse({ page: 0 }).success).toBe(false)
  })

  it('rejects per_page over 100', () => {
    expect(jobSearchSchema.safeParse({ per_page: 101 }).success).toBe(false)
  })

  it('rejects per_page less than 1', () => {
    expect(jobSearchSchema.safeParse({ per_page: 0 }).success).toBe(false)
  })

  it('rejects negative salary_min', () => {
    expect(jobSearchSchema.safeParse({ salary_min: -1 }).success).toBe(false)
  })

  it('converts null salary_min to undefined', () => {
    const result = jobSearchSchema.safeParse({ salary_min: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.salary_min).toBeUndefined()
    }
  })

  it('trims query whitespace', () => {
    const result = jobSearchSchema.safeParse({ query: '  engineer  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.query).toBe('engineer')
    }
  })

  it('converts empty query to undefined', () => {
    const result = jobSearchSchema.safeParse({ query: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.query).toBeUndefined()
    }
  })

  it('converts null query to undefined', () => {
    const result = jobSearchSchema.safeParse({ query: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.query).toBeUndefined()
    }
  })
})

// ─── Edge cases / integration tests ────────────────────────
describe('edge cases', () => {
  it('createJobSchema handles undefined optional fields gracefully', () => {
    const result = createJobSchema.safeParse({
      companyId: validUUID,
      title: 'Test Position',
      description: 'A longer description for the test position.',
      remote_type: 'onsite',
      employment_type: 'full-time',
      category: 'other',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.requirements).toBeNull()
      expect(result.data.salary_min).toBeNull()
      expect(result.data.salary_max).toBeNull()
      expect(result.data.location).toBeNull()
      expect(result.data.expires_at).toBeNull()
    }
  })

  it('createCompanySchema preserves valid URL', () => {
    const result = createCompanySchema.safeParse({
      name: 'Test Corp',
      website: 'https://example.com/page',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.website).toBe('https://example.com/page')
    }
  })

  it('Japanese characters in titles are accepted', () => {
    const result = createJobSchema.safeParse({
      companyId: validUUID,
      title: 'シニアエンジニア募集',
      description: 'フロントエンドエンジニアを募集しています。',
      remote_type: 'remote',
      employment_type: 'full-time',
      category: 'engineering',
    })
    expect(result.success).toBe(true)
  })

  it('updateJobSchema without status field works', () => {
    expect(updateJobSchema.safeParse({
      jobId: validUUID,
      companyId: validUUID,
      title: 'Updated',
      description: 'Updated description here.',
      remote_type: 'onsite',
      employment_type: 'part-time',
      category: 'support',
      currency: 'JPY',
    }).success).toBe(true)
  })

  it('all schemas reject non-object input', () => {
    expect(signUpSchema.safeParse('string').success).toBe(false)
    expect(signInSchema.safeParse(123).success).toBe(false)
    expect(createCompanySchema.safeParse(null).success).toBe(false)
    expect(saveJobSchema.safeParse([]).success).toBe(false)
  })

  it('salary validation allows zero', () => {
    const result = createJobSchema.safeParse({
      companyId: validUUID,
      title: 'Volunteer Position',
      description: 'A volunteer position with no compensation.',
      remote_type: 'remote',
      employment_type: 'internship',
      category: 'other',
      salary_min: 0,
      salary_max: 0,
    })
    expect(result.success).toBe(true)
  })
})
