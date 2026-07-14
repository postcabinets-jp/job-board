-- ================================================================
-- Seed data for ATS development / demo
-- ================================================================
-- Note: Run after migration. Auth users must be created separately via Supabase Auth.
-- These are placeholder UUIDs for local dev; replace with actual auth.users IDs.

-- Demo company
insert into public.companies (id, name, slug, website_url, description, industry, size_range, plan)
values (
  '11111111-1111-1111-1111-111111111111',
  'TechVentures Japan',
  'techventures-japan',
  'https://techventures.jp',
  'SaaSプロダクトを開発するスタートアップ。設立5年目、シリーズB調達済み。エンジニア組織を急拡大中。',
  'テクノロジー',
  '51-200',
  'cloud'
);

-- Demo jobs (NOTE: company_id and created_by must match real data in production)
insert into public.jobs (id, company_id, title, slug, department, location, remote_policy, employment_type, salary_min, salary_max, salary_currency, description, requirements, status, published_at)
values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'シニアバックエンドエンジニア（Go/PostgreSQL）',
  'senior-backend-go',
  'エンジニアリング',
  '東京都渋谷区',
  'hybrid',
  'full_time',
  8000000,
  12000000,
  'JPY',
  '<p>TechVenturesのバックエンドチームを技術的にリードするシニアエンジニアを募集しています。</p><p>主にGo言語でAPIサーバーを開発し、PostgreSQL・Redisを活用したスケーラブルなシステム設計をリードしていただきます。</p>',
  '<ul><li>Go言語での開発経験3年以上</li><li>PostgreSQL/MySQL等RDBMSでの設計・運用経験</li><li>RESTful API/gRPCの設計・実装経験</li><li>Dockerを用いたコンテナ環境での開発経験</li></ul>',
  'published',
  now() - interval '14 days'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'プロダクトマネージャー',
  'product-manager',
  'プロダクト',
  '東京都渋谷区',
  'hybrid',
  'full_time',
  7000000,
  10000000,
  'JPY',
  '<p>BtoBプロダクトのPMとして、ユーザーリサーチからロードマップ策定、エンジニア・デザイナーとの協業まで一貫して担っていただきます。</p>',
  '<ul><li>BtoBプロダクトのPM経験2年以上</li><li>SQL/Looker等データ分析ツールでの分析経験</li><li>ステークホルダーマネジメント経験</li></ul>',
  'published',
  now() - interval '7 days'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'フロントエンドエンジニア（React/Next.js）',
  'frontend-react',
  'エンジニアリング',
  '東京都渋谷区',
  'remote',
  'full_time',
  6000000,
  9000000,
  'JPY',
  '<p>Next.js App Routerを用いたSaaS UIの開発をリードするエンジニアを募集。Tailwind CSS + shadcn/uiを使い、高品質なプロダクト体験を作り上げていただきます。</p>',
  '<ul><li>React/Next.jsでの商用開発経験2年以上</li><li>TypeScriptでの開発経験</li><li>Figmaからの実装経験</li><li>Web Vitals最適化の知識</li></ul>',
  'draft',
  null
);

-- Pipeline stages for job aaaaaaaa
insert into public.pipeline_stages (job_id, name, position, color)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '書類選考', 0, '#6B7280'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '一次面接', 1, '#3B82F6'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '技術課題', 2, '#F59E0B'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '最終面接', 3, '#8B5CF6'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'オファー', 4, '#10B981');

-- Pipeline stages for job bbbbbbbb
insert into public.pipeline_stages (job_id, name, position, color)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '書類選考', 0, '#6B7280'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '一次面接', 1, '#3B82F6'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '最終面接', 2, '#8B5CF6'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'オファー', 3, '#10B981');

-- Candidates
insert into public.candidates (id, company_id, email, first_name, last_name, phone, location, linkedin_url, source, tags)
values
(
  'cand-0001-0001-0001-000100010001',
  '11111111-1111-1111-1111-111111111111',
  'takashi.yamamoto@example.com',
  '隆',
  '山本',
  '090-1234-5678',
  '東京都目黒区',
  'https://linkedin.com/in/takashi-yamamoto-dev',
  'careers_page',
  ARRAY['Go', 'PostgreSQL', 'Docker', 'Kubernetes']
),
(
  'cand-0002-0002-0002-000200020002',
  '11111111-1111-1111-1111-111111111111',
  'keiko.nakamura@example.com',
  '恵子',
  '中村',
  '080-9876-5432',
  '神奈川県横浜市',
  null,
  'linkedin',
  ARRAY['React', 'TypeScript', 'Next.js', 'Figma']
),
(
  'cand-0003-0003-0003-000300030003',
  '11111111-1111-1111-1111-111111111111',
  'hiroshi.sato@example.com',
  '洋',
  '佐藤',
  '070-1111-2222',
  '東京都新宿区',
  'https://linkedin.com/in/hiroshi-sato-pm',
  'referral',
  ARRAY['プロダクトマネジメント', 'BtoB SaaS', 'データ分析']
),
(
  'cand-0004-0004-0004-000400040004',
  '11111111-1111-1111-1111-111111111111',
  'yuki.tanaka@example.com',
  '雪',
  '田中',
  '090-3333-4444',
  '大阪府大阪市',
  null,
  'indeed',
  ARRAY['Go', 'AWS', 'Terraform']
);

-- Email templates
insert into public.email_templates (company_id, name, subject, body, trigger)
values
(
  '11111111-1111-1111-1111-111111111111',
  '応募受付完了',
  '【{{company_name}}】ご応募ありがとうございます',
  '<p>{{candidate_name}} 様</p><p>この度は{{job_title}}へご応募いただきありがとうございます。</p><p>書類選考の結果は、1週間以内にご連絡いたします。</p><p>{{company_name}} 採用チーム</p>',
  'application_received'
),
(
  '11111111-1111-1111-1111-111111111111',
  '一次面接ご案内',
  '【{{company_name}}】一次面接のご案内',
  '<p>{{candidate_name}} 様</p><p>書類選考の結果、ぜひ一次面接にお越しいただきたく存じます。</p><p>■ 日時：{{interview_date}}<br>■ 場所：{{interview_location}}</p><p>ご都合が合わない場合は、別の候補日をご連絡ください。</p><p>{{company_name}} 採用チーム</p>',
  'manual'
),
(
  '11111111-1111-1111-1111-111111111111',
  '選考通過のご連絡',
  '【{{company_name}}】{{job_title}}の選考結果について',
  '<p>{{candidate_name}} 様</p><p>先日の面接ではお時間をいただきありがとうございました。</p><p>選考の結果、次のステップにお進みいただきたくご連絡いたしました。</p><p>引き続きよろしくお願いいたします。</p><p>{{company_name}} 採用チーム</p>',
  'stage_change'
),
(
  '11111111-1111-1111-1111-111111111111',
  '不合格通知',
  '【{{company_name}}】{{job_title}}の選考結果について',
  '<p>{{candidate_name}} 様</p><p>この度は弊社の採用選考にご参加いただきありがとうございました。</p><p>慎重に検討いたしました結果、誠に残念ながら今回は採用見送りとさせていただくことになりました。</p><p>ご経歴・ご経験は高く評価しておりますが、現在の採用要件との兼ね合いから、このような結果となりました。</p><p>今後のご活躍をお祈り申し上げます。</p><p>{{company_name}} 採用チーム</p>',
  'manual'
);
