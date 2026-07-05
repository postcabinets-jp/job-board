// ─── Companies ──────────────────────────────────────────────
export type Company = {
  id: string
  user_id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  industry: string | null
  description: string | null
  location: string | null
  created_at: string
  updated_at: string
}

// ─── Jobs ───────────────────────────────────────────────────
export type RemoteType = 'onsite' | 'hybrid' | 'remote'
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type JobStatus = 'draft' | 'published' | 'closed' | 'filled'
export type JobCategory =
  | 'engineering'
  | 'design'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'legal'
  | 'support'
  | 'other'

export type Job = {
  id: string
  company_id: string
  title: string
  slug: string
  description: string
  requirements: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  location: string | null
  remote_type: RemoteType
  employment_type: EmploymentType
  category: JobCategory
  status: JobStatus
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type JobWithCompany = Job & {
  company: Company
}

// ─── Applications ───────────────────────────────────────────
export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired'

export type Application = {
  id: string
  job_id: string
  applicant_id: string
  resume_url: string | null
  cover_letter: string | null
  status: ApplicationStatus
  applied_at: string
}

export type ApplicationWithJob = Application & {
  job: Job
}

// ─── Saved Jobs ─────────────────────────────────────────────
export type SavedJob = {
  id: string
  job_id: string
  user_id: string
  created_at: string
}
