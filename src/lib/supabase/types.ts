// ─── Companies ──────────────────────────────────────────────
export type CompanyPlan = 'free' | 'cloud'
export type CompanySizeRange = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

export type Company = {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  website_url: string | null
  description: string | null
  industry: string | null
  size_range: CompanySizeRange | null
  plan: CompanyPlan
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

// ─── Memberships ─────────────────────────────────────────────
export type MemberRole = 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer'

export type Membership = {
  id: string
  company_id: string
  user_id: string
  role: MemberRole
  invited_by: string | null
  accepted_at: string | null
  created_at: string
}

// ─── Jobs ────────────────────────────────────────────────────
export type RemotePolicy = 'onsite' | 'remote' | 'hybrid'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived'

export type Job = {
  id: string
  company_id: string
  created_by: string | null
  title: string
  slug: string
  department: string | null
  location: string | null
  remote_policy: RemotePolicy | null
  employment_type: EmploymentType | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  description: string | null
  requirements: string | null
  benefits: string | null
  status: JobStatus
  published_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export type JobWithCompany = Job & {
  company: Company
}

// ─── Pipeline Stages ─────────────────────────────────────────
export type PipelineStage = {
  id: string
  job_id: string
  name: string
  position: number
  color: string
  created_at: string
}

// ─── Candidates ──────────────────────────────────────────────
export type CandidateSource =
  | 'careers_page'
  | 'linkedin'
  | 'referral'
  | 'indeed'
  | 'manual'
  | 'other'

export type Candidate = {
  id: string
  company_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  website_url: string | null
  resume_url: string | null
  tags: string[]
  source: CandidateSource | null
  created_at: string
  updated_at: string
}

// ─── Applications ─────────────────────────────────────────────
export type ApplicationStatus = 'active' | 'hired' | 'rejected' | 'withdrawn'

export type Application = {
  id: string
  job_id: string
  candidate_id: string
  stage_id: string | null
  assigned_to: string | null
  status: ApplicationStatus
  rejection_reason: string | null
  cover_letter: string | null
  answers: Record<string, string>
  rating: number | null
  created_at: string
  updated_at: string
}

export type ApplicationWithRelations = Application & {
  candidate: Candidate
  stage: PipelineStage | null
  job: Job
}

// ─── Application Stage History ───────────────────────────────
export type ApplicationStageHistory = {
  id: string
  application_id: string
  from_stage_id: string | null
  to_stage_id: string | null
  moved_by: string | null
  created_at: string
}

// ─── Notes ───────────────────────────────────────────────────
export type Note = {
  id: string
  application_id: string
  author_id: string
  body: string
  is_private: boolean
  created_at: string
  updated_at: string
}

// ─── Interviews ──────────────────────────────────────────────
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled'

export type Interview = {
  id: string
  application_id: string
  title: string
  scheduled_at: string
  duration_min: number
  location: string | null
  interviewers: string[]
  scorecard: Record<string, { score: number; comment: string }>
  overall_rating: number | null
  status: InterviewStatus
  google_event_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type InterviewWithRelations = Interview & {
  application: ApplicationWithRelations
}

// ─── Email Templates ─────────────────────────────────────────
export type EmailTemplateTrigger =
  | 'application_received'
  | 'stage_change'
  | 'manual'

export type EmailTemplate = {
  id: string
  company_id: string
  name: string
  subject: string
  body: string
  trigger: EmailTemplateTrigger | null
  created_at: string
  updated_at: string
}

// ─── Email Logs ──────────────────────────────────────────────
export type EmailStatus = 'sent' | 'failed' | 'bounced'

export type EmailLog = {
  id: string
  company_id: string
  application_id: string | null
  candidate_id: string | null
  template_id: string | null
  sent_by: string | null
  subject: string
  body: string
  status: EmailStatus
  sent_at: string
}

// ─── Job Form Questions ──────────────────────────────────────
export type QuestionType = 'text' | 'textarea' | 'select' | 'boolean' | 'file'

export type JobFormQuestion = {
  id: string
  job_id: string
  question: string
  type: QuestionType
  options: string[] | null
  required: boolean
  position: number
  created_at: string
}

// ─── Dashboard Stats ─────────────────────────────────────────
export type DashboardStats = {
  totalJobs: number
  publishedJobs: number
  totalApplications: number
  activeApplications: number
  totalCandidates: number
  scheduledInterviews: number
}
