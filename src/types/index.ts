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

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_locked: number;
  has_pin: boolean;
  sensitive_lock_enabled: number;
  has_sensitive_pin: boolean;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'admin' | 'editor' | 'member' | 'viewer';
  project_count?: number;
  member_count?: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'member' | 'viewer';
  name: string;
  email: string;
  avatar_url?: string;
  joined_at: string;
}

export interface RightsHistoryItem {
  id: string;
  right_id: string;
  project_id: string;
  version: number;
  changes_summary: string;
  changed_by: string;
  contributor_name?: string;
  role?: string;
  timestamp: string;
}

export interface WorkspaceActivityItem {
  id: string;
  workspace_id?: string;
  project_id?: string;
  user_id: string;
  user_name: string;
  module_key: string;
  action_type: string;
  title: string;
  details?: string;
  created_at: string;
}

export interface Project {
  id: string;
  workspace_id?: string;
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
  responsibilities?: string;
  contribution_area: string;
  contribution?: string;
  status?: 'active' | 'invited' | 'archived';
  agreement_status?: 'unsigned' | 'pending' | 'signed';
  ownership_percentage?: number;
  distribution_percentage?: number;
  credit_title?: string;
  notes?: string;
  is_archived?: number;
  joined_at: string;
  name: string;
  email: string;
  avatar_url?: string;
  disciplines?: string[];
  location?: string;
}

// 04. BUILD
export interface WorkspaceTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'urgent' | 'normal' | 'low';
  assignee_id?: string;
  assignee_name?: string;
  milestone_id?: string;
  milestone_title?: string;
  category?: string;
  notes?: string;
  deadline?: string;
  is_archived?: number;
  created_at: string;
  updated_at: string;
}

// 05. CAPTURE
export interface CaptureItem {
  id: string;
  project_id: string;
  title: string;
  content: string;
  capture_type: 'idea' | 'thought' | 'note' | 'reference' | 'link' | 'fragment';
  tags: string[];
  attachments?: any[];
  references_list?: any[];
  is_pinned: number;
  is_archived?: number;
  last_edited_at?: string;
  created_by: string;
  author_name?: string;
  converted_to?: 'task' | 'asset' | 'deliverable' | 'note' | string;
  converted_id?: string;
  created_at: string;
}

// 06. STUDIO
export interface StudioAsset {
  id: string;
  project_id: string;
  name: string;
  asset_type: 'script' | 'moodboard' | 'audio' | 'video' | 'reference' | 'document' | 'master';
  file_url: string;
  file_size?: string;
  tags?: string[];
  version?: string;
  notes?: string;
  uploaded_by: string;
  uploader_name?: string;
  contributor_id?: string;
  rights_id?: string;
  version_number?: string;
  is_master?: number;
  approval_status?: 'pending' | 'approved' | 'in_review';
  is_archived?: number;
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
  deliverable?: string;
  assigned_to?: string;
  notes?: string;
  responsible_person?: string;
  approval_state?: string;
  linked_tasks_count?: number;
  completed_tasks_count?: number;
  is_archived?: number;
  created_at: string;
}

// 12. MEMORY
export interface ProjectMemoryItem {
  id: string;
  project_id: string;
  title: string;
  event_date: string;
  event_type: 'milestone' | 'change' | 'pivot' | 'insight' | 'archival' | string;
  summary: string;
  full_context?: string;
  source_module?: string;
  recorded_by: string;
  recorder_name?: string;
  is_archived?: number;
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
  work_title?: string;
  contribution_type?: string;
  creator?: string;
  rights_holder?: string;
  license_type?: string;
  license_duration?: string;
  territory?: string;
  exclusivity?: 'exclusive' | 'non-exclusive';
  usage_rights?: string;
  revenue_share_percentage?: number;
  effective_date?: string;
  expiration_date?: string;
  asset_name?: string;
  asset_type?: string;
  permissions?: string[];
  duration?: string;
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
  is_archived?: number;
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
  parties?: string;
  rights_covered?: string;
  ownership_terms?: string;
  revenue_terms?: string;
  signed_by: { user_id: string; name: string; signed_at: string }[];
  effective_date?: string;
  expiry_date?: string;
  attached_document_url?: string;
  notes?: string;
  is_archived?: number;
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
  recipient_user_id?: string;
  recipient_collaborator_name?: string;
  receipt_url?: string;
  recorded_by: string;
  recorder_name?: string;
  is_approved?: number;
  is_recoupable?: number;
  recouped_amount?: number;
  deduction_amount?: number;
  recipient_name?: string;
  status?: 'pending' | 'approved' | 'paid';
  is_archived?: number;
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
  license_type?: string;
  license_duration?: string;
  audience_reach?: number;
  revenue_generated?: number;
  duration?: string;
  fee?: number;
  exclusivity?: 'exclusive' | 'non-exclusive';
  approval_status?: 'pending' | 'approved' | 'declined';
  agreement_ref?: string;
  is_archived?: number;
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
  audience_reach?: number;
  revenue_generated?: number;
  awards?: string;
  festival_selections?: string;
  press_mentions?: string;
  lessons_learned?: string;
  is_archived?: number;
  created_at: string;
}

// 10. CREDITS
export interface CreditItem {
  id: string;
  project_id: string;
  role_title: string;
  contributor_name: string;
  credit_type?: 'principal' | 'head_of_dept' | 'crew' | 'cast' | 'special_thanks';
  display_name?: string;
  user_id?: string;
  linked_user_name?: string;
  avatar_url?: string;
  notes?: string;
  display_order: number;
  is_archived?: number;
  created_at: string;
}

export interface WorkspaceSearchResult {
  query: string;
  results: {
    tasks: any[];
    captures: any[];
    assets: any[];
    milestones: any[];
    crew: any[];
    rights: any[];
    agreements: any[];
    money: any[];
    distribution: any[];
    credits: any[];
    outcomes: any[];
    memory: any[];
  };
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
