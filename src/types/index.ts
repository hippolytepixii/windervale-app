export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: number;
  created_at: string;
}

export interface SelectedWork {
  title: string;
  year: string;
  role: string;
  description: string;
  link?: string;
}

export interface ExternalLink {
  platform: string;
  url: string;
}

export interface Profile {
  user_id: string;
  display_name: string;
  handle: string;
  avatar_url?: string;
  location?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  disciplines: string[];
  roles_list: string[];
  practices: string[];
  interests: string[];
  selected_works: SelectedWork[];
  external_links: ExternalLink[];
  availability: string;
  collaboration_interests?: string;
  visibility: 'public' | 'members' | 'private';
  location_visibility: number;
  avatar_public?: number;
  id_document_url?: string;
  id_document_type?: string;
  id_verification_status?: string;
  approval_status?: string;
  verification_status?: string;
  portfolio_url?: string;
  offerings?: string;
  match_percentage?: number;
  match_badge?: string;
  match_type?: 'peer' | 'complementary' | 'inquiry';
  synergy_label?: string;
  match_reasons?: { category: string; score?: string; detail: string }[];
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  doc_type: 'terms' | 'privacy' | 'guidelines';
  version: string;
  title: string;
  content: string;
  effective_date: string;
}

export interface LegalAcceptance {
  id: string;
  user_id: string;
  doc_type: string;
  doc_version: string;
  accepted_at: string;
  status: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  partner_disciplines: string[];
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  project_type: string;
  status: 'idea' | 'forming' | 'planning' | 'in progress' | 'in production' | 'completed' | 'released' | 'archived';
  description?: string;
  statement?: string;
  intent?: string;
  format?: string;
  expected_outputs?: string;
  project_owner?: string;
  cover_image?: string;
  location?: string;
  target_date?: string;
  visibility: 'private' | 'collaborators' | 'unlisted' | 'public';
  created_by: string;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'member' | 'viewer';
  member_count?: number;
  pending_tasks_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'viewer';
  project_role?: string;
  contribution_area: string;
  contribution?: string;
  joined_at: string;
  name: string;
  email: string;
  avatar_url?: string;
  disciplines?: string[];
  location?: string;
}

// 01. BUILD
export interface WorkspaceTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'urgent' | 'normal' | 'low';
  assignee_id?: string;
  assignee_name?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

// 06. CAPTURE
export interface CaptureItem {
  id: string;
  project_id: string;
  title: string;
  content: string;
  capture_type: 'idea' | 'thought' | 'note' | 'reference' | 'link' | 'fragment';
  tags: string[];
  is_pinned: number;
  created_by: string;
  author_name?: string;
  converted_to?: 'task' | 'asset' | 'deliverable' | 'note' | string;
  converted_id?: string;
  created_at: string;
}

// 05. STUDIO
export interface StudioAsset {
  id: string;
  project_id: string;
  name: string;
  asset_type: 'script' | 'moodboard' | 'audio' | 'video' | 'reference' | 'document' | 'master';
  file_url: string;
  file_size?: string;
  notes?: string;
  uploaded_by: string;
  uploader_name?: string;
  contributor_id?: string;
  rights_id?: string;
  version_number?: string;
  is_master?: number;
  approval_status?: 'pending' | 'approved' | 'in_review';
  created_at: string;
}

// 07. MILESTONES
export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  progress: number;
  deliverables?: string;
  responsible_person?: string;
  approval_state?: string;
  created_at: string;
}

// 12. MEMORY
export interface ProjectMemoryItem {
  id: string;
  project_id: string;
  title: string;
  event_date: string;
  event_type: 'milestone' | 'change' | 'pivot' | 'insight' | 'archival';
  summary: string;
  full_context?: string;
  recorded_by: string;
  recorder_name?: string;
  created_at: string;
}

// DECISIONS (Archived & Accessible in Memory / Build)
export interface DecisionItem {
  id: string;
  project_id: string;
  title: string;
  decision_date: string;
  why_context: string;
  details?: string;
  made_by: string;
  category?: string;
  created_at: string;
}

// 02. RIGHTS (Structured Rights Ledger)
export interface RightRecord {
  id: string;
  project_id: string;
  contributor_name: string;
  user_id?: string;
  role: string;
  ownership_percentage: number;
  asset_name?: string;
  asset_type?: string;
  permissions?: string[]; // 'reproduce', 'distribute', 'license', 'adapt', 'publish', 'exhibit', 'sync', 'sublicense', 'monetize'
  territory?: string;
  duration?: string;
  exclusivity?: 'exclusive' | 'non-exclusive';
  restrictions?: string;
  approval_requirements?: string;
  revenue_splits?: {
    streaming?: number;
    sync?: number;
    licensing?: number;
    merchandise?: number;
    other?: number;
  };
  category?: 'ownership' | 'licensing' | 'revenue' | 'usage';
  rights_details?: string;
  notes?: string;
  status?: string;
  created_at: string;
}

// 03. AGREEMENT
export interface AgreementItem {
  id: string;
  project_id: string;
  title: string;
  terms: string;
  status: 'draft' | 'open' | 'agreed' | 'archived';
  participants: string[];
  signed_by: { user_id: string; name: string; signed_at: string }[];
  effective_date?: string;
  clauses?: {
    parties?: string[];
    contributions?: string;
    assets?: string;
    ownership?: string;
    rights?: string;
    revenue?: string;
    expenses?: string;
    recoupment?: string;
    decision_rights?: string;
    term?: string;
    territory?: string;
    exit?: string;
    dispute_process?: string;
  };
  created_at: string;
}

// 08. MONEY & WATERFALL
export interface FinancialTransaction {
  id: string;
  project_id: string;
  type: 'funding' | 'expense' | 'payment' | 'revenue';
  amount: number;
  currency: string;
  category: string;
  description?: string;
  transaction_date: string;
  recorded_by: string;
  recorder_name?: string;
  is_approved?: number;
  is_recoupable?: number;
  recouped_amount?: number;
  deduction_amount?: number;
  recipient_name?: string;
  status?: 'pending' | 'approved' | 'paid';
  created_at: string;
}

export interface WaterfallStep {
  label: string;
  amount: number;
  type: 'gross' | 'deduction' | 'expense' | 'distributable' | 'split';
  formula?: string;
  notes?: string;
}

export interface ContributorPayout {
  contributorName: string;
  role: string;
  splitPercentage: number;
  grossAllocation: number;
  priorRecoupmentDeduction: number;
  netPayout: number;
  status: 'pending' | 'approved' | 'paid';
  formula: string;
}

export interface WaterfallReport {
  grossRevenue: number;
  deductions: number;
  approvedExpenses: number;
  distributableRevenue: number;
  currency: string;
  payouts: ContributorPayout[];
  steps: WaterfallStep[];
}

export interface MoneySummary {
  funding: number;
  expenses: number;
  revenue: number;
  remaining: number;
  currency: string;
}

// 09. DISTRIBUTION
export interface DistributionRecord {
  id: string;
  project_id: string;
  title: string;
  category: 'release' | 'festival' | 'licensing' | 'audience' | 'windervale';
  status: 'planned' | 'submitted' | 'selected' | 'active' | 'completed';
  target_date?: string;
  platform_or_partner?: string;
  territory_or_details?: string;
  notes?: string;
  external_url?: string;
  asset_id?: string;
  licensee?: string;
  duration?: string;
  fee?: number;
  exclusivity?: 'exclusive' | 'non-exclusive';
  approval_status?: 'pending' | 'approved' | 'declined';
  agreement_ref?: string;
  created_at: string;
  is_legacy?: boolean;
}

// CROSS-PROJECT PENDING ACTIONS
export interface PendingActionItem {
  id: string;
  moduleKey: string;
  title: string;
  description: string;
  urgency: 'high' | 'normal';
  linkModule: string;
}

// 11. OUTCOME
export interface OutcomeItem {
  id: string;
  project_id: string;
  title: string;
  outcome_type: 'award' | 'press' | 'sales' | 'collaboration' | 'continuation' | 'creator_outcome' | 'impact_note' | string;
  event_date: string;
  venue_or_channel?: string;
  impact_notes?: string;
  external_url?: string;
  created_at: string;
}

// 12. CREDITS
export interface CreditItem {
  id: string;
  project_id: string;
  role_title: string;
  contributor_name: string;
  user_id?: string;
  linked_user_name?: string;
  avatar_url?: string;
  notes?: string;
  display_order: number;
  created_at: string;
}

export interface LibraryArticle {
  id: string;
  title: string;
  subtitle?: string;
  author_name: string;
  author_id?: string;
  category: 'essay' | 'interview' | 'poetry' | 'photography' | 'research' | 'manifesto';
  content: string;
  reading_time: string;
  cover_image?: string;
  tags: string[];
  published_at: string;
}

export interface FundGrant {
  id: string;
  title: string;
  funder_name: string;
  grant_amount: number;
  currency: string;
  deadline: string;
  status: 'open' | 'reviewing' | 'awarded';
  description: string;
  eligibility: string;
  criteria: string[];
  supported_disciplines: string[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}
