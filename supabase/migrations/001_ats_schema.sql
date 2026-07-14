-- ================================================================
-- ATS (Applicant Tracking System) Schema
-- Migration 001: Initial ATS schema
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ================================================================
-- COMPANIES
-- ================================================================
create table if not exists public.companies (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  domain          text,
  logo_url        text,
  website_url     text,
  description     text,
  industry        text,
  size_range      text check (size_range in ('1-10','11-50','51-200','201-500','500+')),
  plan            text not null default 'free' check (plan in ('free','cloud')),
  plan_expires_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "company_members_select"
  on public.companies for select
  using (
    id in (
      select company_id from public.memberships where user_id = auth.uid()
    )
  );

create policy "company_admin_update"
  on public.companies for update
  using (
    id in (
      select company_id from public.memberships
       where user_id = auth.uid() and role = 'admin'
    )
  );

-- ================================================================
-- MEMBERSHIPS
-- ================================================================
create table if not exists public.memberships (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'recruiter'
              check (role in ('admin','recruiter','hiring_manager','interviewer')),
  invited_by  uuid references auth.users(id),
  accepted_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (company_id, user_id)
);

alter table public.memberships enable row level security;

create policy "members_select_own"
  on public.memberships for select
  using (user_id = auth.uid());

create policy "admin_manage_memberships"
  on public.memberships for all
  using (
    company_id in (
      select company_id from public.memberships
       where user_id = auth.uid() and role = 'admin'
    )
  );

-- Also allow initial insert (self-join when creating company)
create policy "members_insert_self"
  on public.memberships for insert
  with check (user_id = auth.uid());

-- ================================================================
-- JOBS
-- ================================================================
create table if not exists public.jobs (
  id              uuid primary key default uuid_generate_v4(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  created_by      uuid references auth.users(id),
  title           text not null,
  slug            text not null,
  department      text,
  location        text,
  remote_policy   text check (remote_policy in ('onsite','remote','hybrid')),
  employment_type text check (employment_type in ('full_time','part_time','contract','internship')),
  salary_min      integer,
  salary_max      integer,
  salary_currency text default 'JPY',
  description     text,
  requirements    text,
  benefits        text,
  status          text not null default 'draft'
                  check (status in ('draft','published','closed','archived')),
  published_at    timestamptz,
  closed_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (company_id, slug)
);

alter table public.jobs enable row level security;

create policy "jobs_public_select"
  on public.jobs for select
  using (status = 'published');

create policy "jobs_members_select"
  on public.jobs for select
  using (
    company_id in (
      select company_id from public.memberships where user_id = auth.uid()
    )
  );

create policy "jobs_recruiter_insert"
  on public.jobs for insert
  with check (
    company_id in (
      select company_id from public.memberships
       where user_id = auth.uid() and role in ('admin','recruiter')
    )
  );

create policy "jobs_recruiter_update"
  on public.jobs for update
  using (
    company_id in (
      select company_id from public.memberships
       where user_id = auth.uid() and role in ('admin','recruiter')
    )
  );

create policy "jobs_recruiter_delete"
  on public.jobs for delete
  using (
    company_id in (
      select company_id from public.memberships
       where user_id = auth.uid() and role in ('admin','recruiter')
    )
  );

create index if not exists idx_jobs_company_status on public.jobs(company_id, status);
create index if not exists idx_jobs_published on public.jobs(published_at) where status = 'published';

-- ================================================================
-- PIPELINE STAGES
-- ================================================================
create table if not exists public.pipeline_stages (
  id         uuid primary key default uuid_generate_v4(),
  job_id     uuid not null references public.jobs(id) on delete cascade,
  name       text not null,
  position   integer not null,
  color      text default '#6B7280',
  created_at timestamptz not null default now()
);

alter table public.pipeline_stages enable row level security;

create policy "pipeline_stages_members"
  on public.pipeline_stages for all
  using (
    job_id in (
      select j.id from public.jobs j
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid() and m.role in ('admin','recruiter')
    )
  );

create policy "pipeline_stages_read_all_members"
  on public.pipeline_stages for select
  using (
    job_id in (
      select j.id from public.jobs j
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid()
    )
  );

create index if not exists idx_pipeline_stages_job on public.pipeline_stages(job_id, position);

-- ================================================================
-- CANDIDATES
-- ================================================================
create table if not exists public.candidates (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  email         text not null,
  first_name    text,
  last_name     text,
  phone         text,
  location      text,
  linkedin_url  text,
  website_url   text,
  resume_url    text,
  tags          text[] default '{}',
  source        text check (source in ('careers_page','linkedin','referral','indeed','manual','other')),
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(location, '')
    )
  ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (company_id, email)
);

alter table public.candidates enable row level security;

create policy "candidates_members"
  on public.candidates for all
  using (
    company_id in (
      select company_id from public.memberships where user_id = auth.uid()
    )
  );

create index if not exists idx_candidates_company on public.candidates(company_id);
create index if not exists idx_candidates_search on public.candidates using gin(search_vector);
create index if not exists idx_candidates_tags on public.candidates using gin(tags);

-- ================================================================
-- APPLICATIONS
-- ================================================================
create table if not exists public.applications (
  id               uuid primary key default uuid_generate_v4(),
  job_id           uuid not null references public.jobs(id) on delete cascade,
  candidate_id     uuid not null references public.candidates(id) on delete cascade,
  stage_id         uuid references public.pipeline_stages(id) on delete set null,
  assigned_to      uuid references auth.users(id) on delete set null,
  status           text not null default 'active'
                   check (status in ('active','hired','rejected','withdrawn')),
  rejection_reason text,
  cover_letter     text,
  answers          jsonb default '{}',
  rating           integer check (rating between 1 and 5),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (job_id, candidate_id)
);

alter table public.applications enable row level security;

create policy "applications_members"
  on public.applications for all
  using (
    job_id in (
      select j.id from public.jobs j
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid()
    )
  );

create index if not exists idx_applications_job on public.applications(job_id, status);
create index if not exists idx_applications_stage on public.applications(stage_id);
create index if not exists idx_applications_candidate on public.applications(candidate_id);

-- ================================================================
-- APPLICATION STAGE HISTORY
-- ================================================================
create table if not exists public.application_stage_history (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_stage_id  uuid references public.pipeline_stages(id) on delete set null,
  to_stage_id    uuid references public.pipeline_stages(id) on delete set null,
  moved_by       uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

alter table public.application_stage_history enable row level security;

create policy "stage_history_members"
  on public.application_stage_history for select
  using (
    application_id in (
      select a.id from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid()
    )
  );

create policy "stage_history_insert"
  on public.application_stage_history for insert
  with check (moved_by = auth.uid());

-- ================================================================
-- NOTES
-- ================================================================
create table if not exists public.notes (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id      uuid not null references auth.users(id) on delete cascade,
  body           text not null,
  is_private     boolean default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "notes_members_read"
  on public.notes for select
  using (
    is_private = false
    and application_id in (
      select a.id from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid()
    )
  );

create policy "notes_recruiter_read_private"
  on public.notes for select
  using (
    is_private = true
    and application_id in (
      select a.id from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid() and m.role in ('admin','recruiter')
    )
  );

create policy "notes_author_insert"
  on public.notes for insert
  with check (author_id = auth.uid());

create policy "notes_author_update"
  on public.notes for update
  using (author_id = auth.uid());

create policy "notes_author_delete"
  on public.notes for delete
  using (author_id = auth.uid());

create index if not exists idx_notes_application on public.notes(application_id, created_at);

-- ================================================================
-- INTERVIEWS
-- ================================================================
create table if not exists public.interviews (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.applications(id) on delete cascade,
  title          text not null,
  scheduled_at   timestamptz not null,
  duration_min   integer default 60,
  location       text,
  interviewers   uuid[] default '{}',
  scorecard      jsonb default '{}',
  overall_rating integer check (overall_rating between 1 and 5),
  status         text default 'scheduled'
                 check (status in ('scheduled','completed','cancelled')),
  google_event_id text,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.interviews enable row level security;

create policy "interviews_members"
  on public.interviews for all
  using (
    application_id in (
      select a.id from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid()
    )
  );

create index if not exists idx_interviews_application on public.interviews(application_id);
create index if not exists idx_interviews_scheduled on public.interviews(scheduled_at);

-- ================================================================
-- EMAIL TEMPLATES
-- ================================================================
create table if not exists public.email_templates (
  id         uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name       text not null,
  subject    text not null,
  body       text not null,
  trigger    text check (trigger in ('application_received','stage_change','manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;

create policy "email_templates_members"
  on public.email_templates for all
  using (
    company_id in (
      select company_id from public.memberships where user_id = auth.uid()
    )
  );

-- ================================================================
-- EMAIL LOGS
-- ================================================================
create table if not exists public.email_logs (
  id             uuid primary key default uuid_generate_v4(),
  company_id     uuid not null references public.companies(id),
  application_id uuid references public.applications(id),
  candidate_id   uuid references public.candidates(id),
  template_id    uuid references public.email_templates(id),
  sent_by        uuid references auth.users(id),
  subject        text not null,
  body           text not null,
  status         text default 'sent' check (status in ('sent','failed','bounced')),
  sent_at        timestamptz not null default now()
);

alter table public.email_logs enable row level security;

create policy "email_logs_members"
  on public.email_logs for select
  using (
    company_id in (
      select company_id from public.memberships where user_id = auth.uid()
    )
  );

create index if not exists idx_email_logs_application on public.email_logs(application_id);

-- ================================================================
-- JOB FORM QUESTIONS
-- ================================================================
create table if not exists public.job_form_questions (
  id         uuid primary key default uuid_generate_v4(),
  job_id     uuid not null references public.jobs(id) on delete cascade,
  question   text not null,
  type       text not null check (type in ('text','textarea','select','boolean','file')),
  options    text[],
  required   boolean default false,
  position   integer not null,
  created_at timestamptz not null default now()
);

alter table public.job_form_questions enable row level security;

create policy "form_questions_recruiter_manage"
  on public.job_form_questions for all
  using (
    job_id in (
      select j.id from public.jobs j
      join public.memberships m on m.company_id = j.company_id
       where m.user_id = auth.uid() and m.role in ('admin','recruiter')
    )
  );

create policy "form_questions_public_select"
  on public.job_form_questions for select
  using (
    job_id in (select id from public.jobs where status = 'published')
  );

create index if not exists idx_form_questions_job on public.job_form_questions(job_id, position);

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at before update on public.companies
  for each row execute procedure public.handle_updated_at();
create trigger jobs_updated_at before update on public.jobs
  for each row execute procedure public.handle_updated_at();
create trigger candidates_updated_at before update on public.candidates
  for each row execute procedure public.handle_updated_at();
create trigger applications_updated_at before update on public.applications
  for each row execute procedure public.handle_updated_at();
create trigger notes_updated_at before update on public.notes
  for each row execute procedure public.handle_updated_at();
create trigger interviews_updated_at before update on public.interviews
  for each row execute procedure public.handle_updated_at();
create trigger email_templates_updated_at before update on public.email_templates
  for each row execute procedure public.handle_updated_at();
