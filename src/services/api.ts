import {
  User, Profile, Project, ProjectMember, LegalDocument, LegalAcceptance,
  Connection, WorkspaceTask, CaptureItem, StudioAsset, Milestone,
  ProjectMemoryItem, DecisionItem, RightRecord, AgreementItem,
  FinancialTransaction, MoneySummary, OutcomeItem, CreditItem,
  LibraryArticle, FundGrant, NotificationItem, DistributionRecord,
  WaterfallReport, PendingActionItem
} from '../types';

const API_BASE = '/api';

function getHeaders(auth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = localStorage.getItem('windervale_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Request failed';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // File upload for profile picture and government ID
  async uploadFile(fileBase64: string, filename?: string): Promise<{ url: string; filename: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ file: fileBase64, filename }),
    });
    return handleResponse(res);
  },

  // Auth
  async register(data: any): Promise<{ token: string; user: User; profile: Profile }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async login(email: string, password: string): Promise<{ token: string; user: User; profile: Profile; legal_acceptances: LegalAcceptance[] }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User; profile: Profile; legal_acceptances: LegalAcceptance[]; sessions: any[] }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async updateProfile(data: Partial<Profile>): Promise<{ profile: Profile }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updatePrivacy(data: { visibility?: string; location_visibility?: boolean }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/privacy`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async verifyEmail(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async resetPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/account`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Legal
  async getLegalDocuments(): Promise<{ documents: LegalDocument[] }> {
    const res = await fetch(`${API_BASE}/legal/documents`);
    return handleResponse(res);
  },

  async acceptLegal(doc_type: string, doc_version: string): Promise<any> {
    const res = await fetch(`${API_BASE}/legal/accept`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ doc_type, doc_version }),
    });
    return handleResponse(res);
  },

  // Map & Discovery
  async getCreatives(params?: { discipline?: string; location?: string; search?: string }): Promise<{ creatives: Profile[] }> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/map/creatives?${query}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async getProfile(userId: string): Promise<{ user: User; profile: Profile; credits: any[] }> {
    const res = await fetch(`${API_BASE}/profile/${userId}`);
    return handleResponse(res);
  },

  // Connections
  async getConnections(): Promise<{ connections: Connection[] }> {
    const res = await fetch(`${API_BASE}/connections`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async sendConnection(recipient_id: string, message: string): Promise<{ success: boolean; connectionId: string }> {
    const res = await fetch(`${API_BASE}/connections`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ recipient_id, message }),
    });
    return handleResponse(res);
  },

  async respondConnection(id: string, status: 'accepted' | 'declined'): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`${API_BASE}/connections/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async acceptConnection(id: string): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`${API_BASE}/connections/${id}/accept`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async declineConnection(id: string): Promise<{ success: boolean; status: string }> {
    const res = await fetch(`${API_BASE}/connections/${id}/decline`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async getConnectionMessages(id: string): Promise<{ messages: any[] }> {
    const res = await fetch(`${API_BASE}/connections/${id}/messages`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async sendConnectionMessage(id: string, content: string): Promise<{ message: any }> {
    const res = await fetch(`${API_BASE}/connections/${id}/messages`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },


  async submitVerification(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/auth/submit-verification`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createProject(data: Partial<Project>): Promise<{ project: Project }> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getProject(id: string): Promise<{ project: Project; members: ProjectMember[]; userRole: 'owner' | 'member' | 'viewer' }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<{ project: Project }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Project Members
  async getProjectMembers(projectId: string): Promise<{ members: ProjectMember[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async inviteMember(projectId: string, user_id: string, role: string, contribution_area: string, project_role?: string, contribution?: string): Promise<{ success: boolean; memberId: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members/invite`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ user_id, role, contribution_area, project_role, contribution }),
    });
    return handleResponse(res);
  },

  async updateMember(projectId: string, memberId: string, data: Partial<ProjectMember>): Promise<{ member: ProjectMember }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members/${memberId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Workspace Home Summary
  async getWorkspaceSummary(projectId: string): Promise<{
    urgentTasks: WorkspaceTask[];
    recentActivity: { text: string; time: string }[];
    toolCounts: Record<string, number>;
  }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/summary`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 01. BUILD
  async getTasks(projectId: string): Promise<{ tasks: WorkspaceTask[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/tasks`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createTask(projectId: string, data: Partial<WorkspaceTask>): Promise<{ task: WorkspaceTask }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/tasks`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTask(projectId: string, id: string, data: Partial<WorkspaceTask>): Promise<{ task: WorkspaceTask }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteTask(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 03. CAPTURE
  async getCaptures(projectId: string): Promise<{ captures: CaptureItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/captures`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createCapture(projectId: string, data: Partial<CaptureItem>): Promise<{ capture: CaptureItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/captures`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteCapture(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/captures/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async convertCapture(projectId: string, id: string, targetType: 'task' | 'asset' | 'milestone' | 'note', title?: string): Promise<{ success: boolean; converted_to: string; record: any }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/captures/${id}/convert`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ targetType, title }),
    });
    return handleResponse(res);
  },

  // 04. STUDIO
  async getStudioAssets(projectId: string): Promise<{ assets: StudioAsset[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/studio`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createStudioAsset(projectId: string, data: Partial<StudioAsset>): Promise<{ asset: StudioAsset }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/studio`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteStudioAsset(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/studio/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 05. MILESTONES
  async getMilestones(projectId: string): Promise<{ milestones: Milestone[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/milestones`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createMilestone(projectId: string, data: Partial<Milestone>): Promise<{ milestone: Milestone }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/milestones`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateMilestone(projectId: string, id: string, data: Partial<Milestone>): Promise<{ milestone: Milestone }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/milestones/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteMilestone(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/milestones/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 06. MEMORY
  async getMemories(projectId: string): Promise<{ memories: ProjectMemoryItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/memory`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createMemory(projectId: string, data: Partial<ProjectMemoryItem>): Promise<{ memory: ProjectMemoryItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/memory`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteMemory(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/memory/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 07. DECISIONS
  async getDecisions(projectId: string): Promise<{ decisions: DecisionItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/decisions`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createDecision(projectId: string, data: Partial<DecisionItem>): Promise<{ decision: DecisionItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/decisions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteDecision(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/decisions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 08. RIGHTS
  async getRights(projectId: string): Promise<{ rights: RightRecord[]; totalPercentage: number; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/rights`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createRight(projectId: string, data: Partial<RightRecord>): Promise<{ right: RightRecord }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/rights`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateRight(projectId: string, id: string, data: Partial<RightRecord>): Promise<{ right: RightRecord }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/rights/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteRight(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/rights/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 09. AGREEMENTS
  async getAgreements(projectId: string): Promise<{ agreements: AgreementItem[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/agreements`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createAgreement(projectId: string, data: Partial<AgreementItem>): Promise<{ agreement: AgreementItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/agreements`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async signAgreement(projectId: string, id: string): Promise<{ success: boolean; signed_by: any[]; status: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/agreements/${id}/sign`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async deleteAgreement(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/agreements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 08. MONEY & WATERFALL
  async getMoney(projectId: string): Promise<{
    summary: MoneySummary;
    transactions: FinancialTransaction[];
    waterfall?: WaterfallReport;
    recoupment?: { totalRecoupable: number; totalRecouped: number; remainingToRecoup: number };
  }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/money`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createTransaction(projectId: string, data: Partial<FinancialTransaction>): Promise<{ transaction: FinancialTransaction }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/money`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async approveTransaction(projectId: string, id: string): Promise<{ transaction: FinancialTransaction }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/money/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async deleteTransaction(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/money/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 11. OUTCOME
  async getOutcomes(projectId: string): Promise<{ outcomes: OutcomeItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/outcomes`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createOutcome(projectId: string, data: Partial<OutcomeItem>): Promise<{ outcome: OutcomeItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/outcomes`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteOutcome(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/outcomes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 09. DISTRIBUTION
  async getDistribution(projectId: string): Promise<{ distribution: DistributionRecord[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/distribution`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createDistribution(projectId: string, data: Partial<DistributionRecord>): Promise<{ record: DistributionRecord }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/distribution`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async approveDistribution(projectId: string, id: string): Promise<{ record: DistributionRecord }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/distribution/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async submitToWindervale(projectId: string, data: {
    title: string;
    program: string;
    format_details?: string;
    notes?: string;
    external_url?: string;
    target_date?: string;
  }): Promise<{ record: DistributionRecord }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/distribution/submit-windervale`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteDistribution(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/distribution/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // CROSS-PROJECT PENDING ACTIONS
  async getPendingActions(projectId: string): Promise<{ pendingActions: PendingActionItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/pending-actions`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // 10. CREDITS
  async getCredits(projectId: string): Promise<{ credits: CreditItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/credits`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async createCredit(projectId: string, data: Partial<CreditItem>): Promise<{ credit: CreditItem }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/credits`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async syncCrewCredits(projectId: string): Promise<{ success: boolean; addedCount: number; credits: CreditItem[] }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/credits/sync-crew`, {
      method: 'POST',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async deleteCredit(projectId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/workspace/credits/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Library
  async getArticles(category?: string, search?: string): Promise<{ articles: LibraryArticle[] }> {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (search) query.append('search', search);
    const res = await fetch(`${API_BASE}/library?${query.toString()}`);
    return handleResponse(res);
  },

  async getArticle(id: string): Promise<{ article: LibraryArticle }> {
    const res = await fetch(`${API_BASE}/library/${id}`);
    return handleResponse(res);
  },

  async createArticle(data: Partial<LibraryArticle>): Promise<{ article: LibraryArticle }> {
    const res = await fetch(`${API_BASE}/library`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Fund
  async getGrants(): Promise<{ grants: FundGrant[] }> {
    const res = await fetch(`${API_BASE}/fund/grants`);
    return handleResponse(res);
  },

  async applyGrant(data: { grant_id: string; project_id: string; proposal: string; requested_amount: number }): Promise<{ success: boolean; applicationId: string }> {
    const res = await fetch(`${API_BASE}/fund/apply`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getFundApplications(): Promise<{ applications: any[] }> {
    const res = await fetch(`${API_BASE}/fund/applications`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(true),
    });
    return handleResponse(res);
  },

  // Search
  async searchAll(query: string): Promise<{
    creatives: any[];
    projects: any[];
    library: any[];
    fund: any[];
  }> {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },

  // Admin Curation
  async verifyAdminKey(adminKey: string): Promise<{ valid: boolean; adminKey?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey }),
    });
    return handleResponse(res);
  },

  async getApplications(status: string = 'all', search: string = ''): Promise<{ applications: any[] }> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/admin/applications?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
    });
    return handleResponse(res);
  },

  async getAdminStats(): Promise<{ stats: { total_applications: number; pending: number; approved: number; rejected: number; total_projects: number } }> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
    });
    return handleResponse(res);
  },

  async exportApplicationsCsv(): Promise<Blob> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const res = await fetch(`${API_BASE}/admin/export`, {
      headers: {
        'x-admin-key': adminKey,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to export applications');
    }
    return res.blob();
  },

  async getPendingUsers(): Promise<{ pending: Profile[] }> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const res = await fetch(`${API_BASE}/admin/pending-users`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
    });
    return handleResponse(res);
  },

  async approveUser(userId: string): Promise<{ success: boolean; message: string }> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const res = await fetch(`${API_BASE}/admin/approve-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ userId }),
    });
    return handleResponse(res);
  },

  async rejectUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const adminKey = sessionStorage.getItem('windervale_admin_key') || 'windervale-curation-desk-2026';
    const res = await fetch(`${API_BASE}/admin/reject-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ userId, reason }),
    });
    return handleResponse(res);
  },
};
