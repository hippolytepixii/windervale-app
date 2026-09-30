import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initializeDatabase } from './db.js';
import { authenticate, optionalAuthenticate, requireProjectAccess, JWT_SECRET, AuthRequest } from './authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Dedicated uploads folder for profile pictures & verification IDs
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Helper for unique IDs
function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

// -------------------------------------------------------------
// FILE UPLOADS (Profile Pictures & Government ID Verification)
// -------------------------------------------------------------

app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { file, filename } = req.body;
    if (!file || typeof file !== 'string') {
      return res.status(400).json({ error: 'No file data provided' });
    }

    let buffer: Buffer;
    let ext = 'png';

    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('pdf')) ext = 'pdf';
    } else {
      buffer = Buffer.from(file, 'base64');
      if (filename && filename.includes('.')) {
        ext = filename.split('.').pop() || 'png';
      }
    }

    const uniqueName = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const targetPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    return res.json({ url: publicUrl, filename: uniqueName });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to process file upload' });
  }
});


const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  calcutta: { lat: 22.5726, lng: 88.3639 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  nyc: { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  la: { lat: 34.0522, lng: -118.2437 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  seoul: { lat: 37.5665, lng: 126.9780 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
};

function resolveCoordinates(cityName?: string): { lat: number; lng: number } {
  if (!cityName) return { lat: 19.0760, lng: 72.8777 };
  const cleaned = cityName.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_COORDINATES)) {
    if (cleaned.includes(k) || k.includes(cleaned)) {
      return v;
    }
  }
  return { lat: 19.0760, lng: 72.8777 };
}

// -------------------------------------------------------------
// AUTHENTICATION & SESSIONS
// -------------------------------------------------------------

// Register with mandatory versioned legal consent
app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    email, password, name, disciplines, location, country, bio,
    latitude, longitude, acceptances,
    avatar_url, avatar_public, id_document_url, id_document_type, portfolio_url, offerings, collaboration_interests
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  if (!acceptances || !acceptances.terms || !acceptances.privacy || !acceptances.guidelines) {
    return res.status(400).json({ error: 'Explicit acceptance of Terms, Privacy Policy, and Community Guidelines is required' });
  }

  const userId = generateId('u');
  const now = new Date().toISOString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'creative', 1, ?, ?)
  `);

  const resolvedCoords = (latitude && longitude)
    ? { lat: Number(latitude), lng: Number(longitude) }
    : resolveCoordinates(location);

  const insertProfile = db.prepare(`
    INSERT INTO profiles (
      user_id, display_name, handle, avatar_url, location, country,
      latitude, longitude, bio, disciplines, roles_list, practices,
      interests, selected_works, external_links, availability,
      collaboration_interests, visibility, location_visibility,
      avatar_public, id_document_url, id_document_type,
      id_verification_status, verification_status, verification_submitted_at,
      approval_status, portfolio_url, offerings, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 1, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `);

  const insertAcceptance = db.prepare(`
    INSERT INTO legal_acceptances (id, user_id, doc_type, doc_version, accepted_at, status, ip_hint)
    VALUES (?, ?, ?, ?, ?, 'accepted', ?)
  `);

  const isVerifiedId = !!id_document_url;
  const userAvatar = avatar_url || null;
  const isAvatarPublic = avatar_public !== undefined ? (avatar_public ? 1 : 0) : 1;

  const runTransaction = db.transaction(() => {
    insertUser.run(userId, email.toLowerCase().trim(), hash, name, now, now);
    insertProfile.run(
      userId,
      name,
      handle,
      userAvatar,
      location || 'Global',
      country || 'Global',
      resolvedCoords.lat, resolvedCoords.lng,
      bio || 'Independent creative operating on Windervale.',
      JSON.stringify(disciplines || ['Artist']),
      JSON.stringify(disciplines || ['Artist']),
      JSON.stringify(['Experimental Practice', 'Cross-Medium Research']),
      JSON.stringify(['Independent Publishing', 'Cinema', 'Sound']),
      JSON.stringify([]),
      JSON.stringify([]),
      'Available for projects',
      'Open to independent collaborations and cross-disciplinary projects.',
      isAvatarPublic,
      id_document_url || null,
      id_document_type || null,
      isVerifiedId ? 'pending' : 'unverified',
      isVerifiedId ? 'pending' : 'unverified',
      isVerifiedId ? now : null, portfolio_url || null, offerings || null, now);

    insertAcceptance.run(generateId('acc'), userId, 'terms', acceptances.termsVersion || '1.0', now, req.ip || '127.0.0.1');
    insertAcceptance.run(generateId('acc'), userId, 'privacy', acceptances.privacyVersion || '1.0', now, req.ip || '127.0.0.1');
    insertAcceptance.run(generateId('acc'), userId, 'guidelines', acceptances.guidelinesVersion || '1.0', now, req.ip || '127.0.0.1');
  });

  runTransaction();

  const token = jwt.sign({ id: userId, email, name, role: 'creative' }, JWT_SECRET, { expiresIn: '7d' });
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

  return res.status(201).json({
    token,
    user: { id: userId, email, name, role: 'creative', email_verified: 1 },
    profile: parseProfile(profile)
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
  const acceptances = db.prepare('SELECT * FROM legal_acceptances WHERE user_id = ?').all(user.id);

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified },
    profile: parseProfile(profile),
    legal_acceptances: acceptances
  });
});

// -------------------------------------------------------------
// OAUTH (Google & Apple Authentication)
// -------------------------------------------------------------
app.post('/api/auth/oauth', (req: Request, res: Response) => {
  try {
    const { provider, email, name, avatar_url } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for authentication' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;
    const now = new Date().toISOString();

    if (!user) {
      // Practitioner is not registered yet.
      // Only registered practitioners enter the map directly.
      // New users must complete the admission application.
      return res.json({
        registered: false,
        isNewUser: true,
        email: cleanEmail,
        name: name || '',
        message: 'No registered account found for this email. Please complete the admission application.'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    const acceptances = db.prepare('SELECT * FROM legal_acceptances WHERE user_id = ?').all(user.id);

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified },
      profile: parseProfile(profile),
      legal_acceptances: acceptances
    });
  } catch (err: any) {
    console.error('OAuth error:', err);
    return res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

// -------------------------------------------------------------
// LEGAL COVENANTS & POLICIES (Terms, Privacy, Cookies, Guidelines)
// -------------------------------------------------------------
app.get('/api/legal/documents', (req: Request, res: Response) => {
  const documents = [
    {
      doc_type: 'terms_of_service',
      title: 'Terms of Creative Covenant & Studio Protocol',
      version: '2.0',
      last_updated: '2026-09-01',
      summary: 'Windervale is an autonomous studio operating environment for unmediated creative work. Mutual consensus, project intellectual property retention, and verified colophon attribution govern all collaborations.',
      content: `1. AUTONOMOUS CREATIVE INTEGRITY\nWindervale provides infrastructure for genuine creative practitioners. Projects, media assets, scripts, stems, and rough cuts remain 100% the intellectual property of their respective creators and designated project rights ledgers.\n\n2. RIGHTS & EQUITABLE WATERFALLS\nAll project collaborations created inside the Workspace are governed by structured rights covenants. Ownership percentages and revenue splits are immutable records registered by consensus.\n\n3. NON-ALGORITHMIC PROTOCOL\nWindervale operates without algorithmic feeds, vanity metrics, or synthetic ranking. Collaboration requests and curation desk submissions are unmediated exchanges between human practitioners.`
    },
    {
      doc_type: 'privacy_policy',
      title: 'Practitioner Privacy & Data Autonomy Covenant',
      version: '2.0',
      last_updated: '2026-09-01',
      summary: 'We respect practitioner data sovereignty. No tracking pixels, no advertising cookies, no data brokerage, and zero surveillance telemetry.',
      content: `1. DATA COLLECTION PRINCIPLE\nWe collect only essential account information (name, email, portfolio links, and creative disciplines) required to maintain your studio presence on the Human Map.\n\n2. REPOSITORY & ENCRYPTION\nYour project communications, draft scripts, financial waterfall ledgers, and identity verification credentials are encrypted and never commercialized.\n\n3. RIGHT TO ERASURE & ARCHIVE EXPORT\nYou retain complete autonomy to export your project dossier and request permanent account erasure at any time.`
    },
    {
      doc_type: 'cookie_policy',
      title: 'Cookie & Local Storage Policy',
      version: '2.0',
      last_updated: '2026-09-01',
      summary: 'Windervale uses strictly essential cookies and local storage tokens for active session authentication and rights ratification. We never use third-party marketing or cross-site tracking cookies.',
      content: `1. ESSENTIAL COOKIES ONLY\nWe use secure HTTP session tokens and local storage keys (windervale_token) solely to maintain your verified creative session.\n\n2. ZERO THIRD-PARTY TRACKING\nWe do not integrate Google Analytics advertising beacons, Facebook Meta pixels, or surveillance telemetry.\n\n3. BROWSER CONTROLS\nYou can clear session tokens at any time via your browser preferences.`
    },
    {
      doc_type: 'community_guidelines',
      title: 'Community Guidelines & Practitioner Standards',
      version: '2.0',
      last_updated: '2026-09-01',
      summary: 'Guidelines fostering genuine craft, mutual respect, verified accreditation, and creative protection across global hubs.',
      content: `1. RESPECT FOR CRAFT\nEngage with fellow practitioners with professional rigor and creative respect.\n\n2. UNCOMPROMISING ATTRIBUTION\nNever appropriate, misattribute, or repurpose fellow collaborators unreleased stems, rushes, or drafts without confirmed rights ledger permissions.`
    }
  ];

  return res.json({ documents });
});

app.post('/api/legal/accept', authenticate, (req: AuthRequest, res: Response) => {
  const { doc_type, doc_version } = req.body;
  if (!doc_type) {
    return res.status(400).json({ error: 'Document type is required' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO legal_acceptances (id, user_id, doc_type, doc_version, accepted_at, status, ip_hint)
    VALUES (?, ?, ?, ?, ?, 'accepted', ?)
  `).run(generateId('acc'), req.user!.id, doc_type, doc_version || '2.0', now, req.ip || '127.0.0.1');

  return res.json({ success: true, message: 'Legal covenant recorded' });
});

// Get current session
app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, email, name, role, email_verified, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
  const acceptances = db.prepare('SELECT * FROM legal_acceptances WHERE user_id = ?').all(user.id);

  return res.json({
    user,
    profile: parseProfile(profile),
    legal_acceptances: acceptances,
    sessions: [
      { id: 'sess-current', device: 'Current Browser Session', location: 'Active', lastActive: new Date().toISOString() }
    ]
  });
});

// Update Profile
app.put('/api/auth/profile', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    display_name, avatar_url, location, country, latitude, longitude,
    bio, disciplines, roles_list, practices, interests, selected_works,
    external_links, availability, collaboration_interests
  } = req.body;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE profiles SET
      display_name = COALESCE(?, display_name),
      avatar_url = COALESCE(?, avatar_url),
      location = COALESCE(?, location),
      country = COALESCE(?, country),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude),
      bio = COALESCE(?, bio),
      disciplines = COALESCE(?, disciplines),
      roles_list = COALESCE(?, roles_list),
      practices = COALESCE(?, practices),
      interests = COALESCE(?, interests),
      selected_works = COALESCE(?, selected_works),
      external_links = COALESCE(?, external_links),
      availability = COALESCE(?, availability),
      collaboration_interests = COALESCE(?, collaboration_interests),
      updated_at = ?
    WHERE user_id = ?
  `).run(
    display_name,
    avatar_url,
    location,
    country,
    latitude,
    longitude,
    bio,
    disciplines ? JSON.stringify(disciplines) : null,
    roles_list ? JSON.stringify(roles_list) : null,
    practices ? JSON.stringify(practices) : null,
    interests ? JSON.stringify(interests) : null,
    selected_works ? JSON.stringify(selected_works) : null,
    external_links ? JSON.stringify(external_links) : null,
    availability,
    collaboration_interests,
    now,
    userId
  );

  if (display_name) {
    db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?').run(display_name, now, userId);
  }

  const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  return res.json({ profile: parseProfile(updatedProfile) });
});

// Update Privacy Settings
app.put('/api/auth/privacy', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { visibility, location_visibility } = req.body;

  db.prepare(`
    UPDATE profiles SET
      visibility = COALESCE(?, visibility),
      location_visibility = COALESCE(?, location_visibility),
      updated_at = ?
    WHERE user_id = ?
  `).run(visibility, location_visibility !== undefined ? (location_visibility ? 1 : 0) : null, new Date().toISOString(), userId);

  return res.json({ success: true, message: 'Privacy preferences updated successfully' });
});

// Verify Email
app.post('/api/auth/verify-email', authenticate, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), req.user!.id);
  return res.json({ success: true, message: 'Email address verified' });
});

// Password Reset / Change
app.post('/api/auth/reset-password', authenticate, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
  if (currentPassword && !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(hash, new Date().toISOString(), req.user!.id);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// Account Deletion Workflow
app.delete('/api/auth/account', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return res.json({ success: true, message: 'Your Windervale account and all associated personal data have been completely deleted.' });
});

// -------------------------------------------------------------
// LEGAL AND CONSENT
// -------------------------------------------------------------

app.get('/api/legal/documents', (req: Request, res: Response) => {
  const docs = db.prepare('SELECT * FROM legal_documents ORDER BY doc_type').all();
  return res.json({ documents: docs });
});

app.post('/api/legal/accept', authenticate, (req: AuthRequest, res: Response) => {
  const { doc_type, doc_version } = req.body;
  if (!doc_type || !doc_version) {
    return res.status(400).json({ error: 'Document type and version are required' });
  }

  const id = generateId('acc');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO legal_acceptances (id, user_id, doc_type, doc_version, accepted_at, status, ip_hint)
    VALUES (?, ?, ?, ?, ?, 'accepted', ?)
  `).run(id, req.user!.id, doc_type, doc_version, now, req.ip || '127.0.0.1');

  return res.json({ success: true, acceptance: { id, doc_type, doc_version, accepted_at: now } });
});

// -------------------------------------------------------------
// HUMAN MAP & DISCOVERY
// -------------------------------------------------------------

app.get('/api/map/creatives', optionalAuthenticate, (req: Request, res: Response) => {
  const { discipline, location, search } = req.query;
  const currentUserId = (req as any).user?.id;

  let currentProfile: any = null;
  if (currentUserId) {
    const raw = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(currentUserId);
    currentProfile = parseProfile(raw);
  }

  let query = `
    SELECT u.id as user_id, u.name, p.display_name, p.handle, p.avatar_url,
           p.location, p.country, p.latitude, p.longitude, p.bio,
           p.disciplines, p.roles_list, p.practices, p.interests,
           p.selected_works, p.external_links, p.availability,
           p.collaboration_interests, p.location_visibility,
           p.avatar_public, p.approval_status, p.verification_status,
           p.portfolio_url, p.offerings
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.visibility = 'public' AND p.approval_status = 'approved'
  `;

  const params: any[] = [];

  if (location) {
    query += ` AND (p.location LIKE ? OR p.country LIKE ?)`;
    params.push(`%${location}%`, `%${location}%`);
  }

  const rows = db.prepare(query).all(...params) as any[];
  let results = rows.map(r => {
    const parsed = parseProfile(r);
    if (r.avatar_public === 0) {
      parsed.avatar_url = null;
    }
    const compat = calculateCompatibility(currentProfile || { disciplines: ['Filmmaker'], location: 'Mumbai' }, parsed);
    if (!compat) return null;
    return {
      ...parsed,
      match_percentage: compat.match_percentage,
      match_badge: compat.match_badge,
      match_type: compat.match_type,
      synergy_label: compat.synergy_label,
      match_reasons: compat.match_reasons
    };
  }).filter(Boolean) as any[];

  // Exclude current user from candidate nodes (current user is rendered as YOU in the center)
  if (currentUserId) {
    results = results.filter(r => r.user_id !== currentUserId);
  }

  if (discipline) {
    const discStr = (discipline as string).toLowerCase();
    results = results.filter(r =>
      r.disciplines && r.disciplines.some((d: string) => d.toLowerCase().includes(discStr))
    );
  }

  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter(r =>
      r.name?.toLowerCase().includes(s) ||
      r.display_name?.toLowerCase().includes(s) ||
      r.bio?.toLowerCase().includes(s) ||
      (r.disciplines && r.disciplines.some((d: string) => d.toLowerCase().includes(s)))
    );
  }

  return res.json({
    creatives: results,
    current_user: currentProfile
  });
});

// Single Creative Profile
app.get('/api/profile/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = db.prepare('SELECT id, name, created_at FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'Creative not found' });
  }

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  const credits = db.prepare(`
    SELECT c.*, p.title as project_title, p.project_type
    FROM credits c
    JOIN projects p ON p.id = c.project_id
    WHERE c.user_id = ?
  `).all(userId);

  return res.json({
    user,
    profile: parseProfile(profile),
    credits
  });
});


// -------------------------------------------------------------
// ADMIN CURATION & APPROVALS
// -------------------------------------------------------------

const WINDERVALE_ADMIN_KEY = process.env.WINDERVALE_ADMIN_KEY || 'windervale-curation-desk-2026';

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (adminKey === WINDERVALE_ADMIN_KEY) {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized: Invalid administrative passkey' });
}

app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { adminKey } = req.body;
  if (adminKey === WINDERVALE_ADMIN_KEY) {
    return res.json({ valid: true, adminKey: WINDERVALE_ADMIN_KEY });
  }
  return res.status(401).json({ valid: false, error: 'Incorrect administrative passkey' });
});

app.get('/api/admin/pending-users', verifyAdmin, (req: Request, res: Response) => {
  const pending = db.prepare(`
    SELECT u.id as user_id, u.email, u.name, u.created_at,
           p.display_name, p.handle, p.avatar_url, p.location, p.country,
           p.latitude, p.longitude, p.bio, p.disciplines, p.roles_list,
           p.practices, p.interests, p.avatar_public, p.id_document_url,
           p.id_document_type, p.id_verification_status, p.approval_status,
           p.verification_status, p.portfolio_url, p.offerings, p.collaboration_interests
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE p.approval_status = 'pending'
    ORDER BY u.created_at DESC
  `).all();

  return res.json({
    pending: pending.map(parseProfile)
  });
});

app.post('/api/admin/approve-user', verifyAdmin, (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE profiles SET
      approval_status = 'approved',
      verification_status = 'verified',
      updated_at = ?
    WHERE user_id = ?
  `).run(now, userId);

  const notifId = generateId('notif');
  try {
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
      VALUES (?, ?, 'system', 'Profile Approved', 'Your profile has been approved by the Windervale curation team. Welcome to the independent creative network.', '/map', 0, ?)
    `).run(notifId, userId, now);
  } catch {}

  return res.json({ success: true, message: 'Creative approved successfully' });
});

app.post('/api/admin/reject-user', verifyAdmin, (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE profiles SET
      approval_status = 'rejected',
      updated_at = ?
    WHERE user_id = ?
  `).run(now, userId);

  return res.json({ success: true, message: 'Creative application declined' });
});

// -------------------------------------------------------------
// CONNECTIONS
// -------------------------------------------------------------

app.get('/api/connections', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const connections = db.prepare(`
    SELECT c.*,
           CASE WHEN c.requester_id = ? THEN u2.name ELSE u1.name END as partner_name,
           CASE WHEN c.requester_id = ? THEN p2.avatar_url ELSE p1.avatar_url END as partner_avatar,
           CASE WHEN c.requester_id = ? THEN p2.disciplines ELSE p1.disciplines END as partner_disciplines,
           CASE WHEN c.requester_id = ? THEN c.recipient_id ELSE c.requester_id END as partner_id
    FROM connections c
    JOIN users u1 ON u1.id = c.requester_id
    JOIN users u2 ON u2.id = c.recipient_id
    JOIN profiles p1 ON p1.user_id = c.requester_id
    JOIN profiles p2 ON p2.user_id = c.recipient_id
    WHERE c.requester_id = ? OR c.recipient_id = ?
    ORDER BY c.created_at DESC
  `).all(userId, userId, userId, userId, userId, userId) as any[];

  const parsed = connections.map(c => ({
    ...c,
    partner_disciplines: safeParseJson(c.partner_disciplines, [])
  }));

  return res.json({ connections: parsed });
});

app.post('/api/connections', authenticate, (req: AuthRequest, res: Response) => {
  const requesterId = req.user!.id;
  const { recipient_id, message } = req.body;

  if (!recipient_id || !message) {
    return res.status(400).json({ error: 'Recipient and connection intent message required' });
  }

  if (requesterId === recipient_id) {
    return res.status(400).json({ error: 'You cannot connect with yourself' });
  }

  const existing = db.prepare(`
    SELECT id, status FROM connections
    WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)
  `).get(requesterId, recipient_id, recipient_id, requesterId) as any;

  if (existing) {
    return res.status(409).json({ error: `Connection request already exists (${existing.status})` });
  }

  const id = generateId('conn');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO connections (id, requester_id, recipient_id, message, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, requesterId, recipient_id, message, now, now);

  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, 'connection', 'New Connection Request', ?, ?, 0, ?)
  `).run(
    generateId('notif'),
    recipient_id,
    `${req.user!.name} requested to connect: "${message.substring(0, 60)}..."`,
    `/profile/${requesterId}`,
    now
  );

  const newConn = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
  return res.status(201).json({ success: true, connectionId: id, connection: newConn });
});

app.put('/api/connections/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const connId = req.params.id;

  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as any;
  if (!conn) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  if (conn.recipient_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized to respond to this connection' });
  }

  db.prepare('UPDATE connections SET status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), connId);
  return res.json({ success: true, status });
});

app.post('/api/connections/:id/accept', authenticate, (req: AuthRequest, res: Response) => {
  const connId = req.params.id;
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as any;
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.recipient_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE connections SET status = 'accepted', updated_at = ? WHERE id = ?").run(now, connId);
  return res.json({ success: true, status: 'accepted' });
});

app.post('/api/connections/:id/decline', authenticate, (req: AuthRequest, res: Response) => {
  const connId = req.params.id;
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as any;
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.recipient_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE connections SET status = 'declined', updated_at = ? WHERE id = ?").run(now, connId);
  return res.json({ success: true, status: 'declined' });
});

app.get('/api/connections/:id/messages', authenticate, (req: AuthRequest, res: Response) => {
  const connId = req.params.id;
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as any;
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.requester_id !== req.user!.id && conn.recipient_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name
    FROM connection_messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.connection_id = ?
    ORDER BY m.created_at ASC
  `).all(connId);

  return res.json({ messages });
});

app.post('/api/connections/:id/messages', authenticate, (req: AuthRequest, res: Response) => {
  const connId = req.params.id;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content required' });
  }

  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(connId) as any;
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.requester_id !== req.user!.id && conn.recipient_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const id = generateId('msg');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO connection_messages (id, connection_id, sender_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, connId, req.user!.id, content.trim(), now);

  const created = db.prepare(`
    SELECT m.*, u.name as sender_name
    FROM connection_messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
  `).get(id);

  return res.status(201).json({ message: created });
});

// Admin Approval & Verification simulation endpoints
app.post('/api/admin/approve-user/:id', authenticate, (req: AuthRequest, res: Response) => {
  db.prepare("UPDATE profiles SET approval_status = 'approved', updated_at = ? WHERE user_id = ?").run(new Date().toISOString(), req.params.id);
  return res.json({ success: true, approval_status: 'approved' });
});

app.post('/api/auth/submit-verification', authenticate, (req: AuthRequest, res: Response) => {
  const now = new Date().toISOString();
  db.prepare("UPDATE profiles SET verification_status = 'pending', verification_submitted_at = ?, updated_at = ? WHERE user_id = ?").run(now, now, req.user!.id);
  return res.json({ success: true, verification_status: 'pending' });
});

// -------------------------------------------------------------
// PROJECTS (The Central Creative Entity)
// -------------------------------------------------------------

app.get('/api/projects', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const projects = db.prepare(`
    SELECT p.*, pm.role as user_role,
           (SELECT count(*) FROM project_members WHERE project_id = p.id) as member_count,
           (SELECT count(*) FROM workspace_tasks WHERE project_id = p.id AND status != 'completed') as pending_tasks_count
    FROM projects p
    LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
    WHERE pm.user_id IS NOT NULL OR p.visibility = 'public'
    ORDER BY p.updated_at DESC
  `).all(userId);

  return res.json({ projects });
});

app.post('/api/projects', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, project_type, description, cover_image, location, target_date, visibility } = req.body;

  if (!title || !project_type) {
    return res.status(400).json({ error: 'Project title and type are required' });
  }

  const projId = generateId('proj');
  const now = new Date().toISOString();

  const insertProj = db.prepare(`
    INSERT INTO projects (
      id, title, project_type, status, description, cover_image,
      location, target_date, visibility, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, 'idea', ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMember = db.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at)
    VALUES (?, ?, ?, 'owner', 'Project Lead / Creator', ?)
  `);

  const tx = db.transaction(() => {
    insertProj.run(
      projId,
      title,
      project_type,
      description || '',
      cover_image || null,
      location || '',
      target_date || '',
      visibility || 'private',
      userId,
      now,
      now
    );
    insertMember.run(generateId('pm'), projId, userId, now);

    // Auto-seed Standard Studio Covenant upon project creation
    db.prepare(`
      INSERT INTO agreements (id, project_id, title, terms, status, participants, signed_by, effective_date, created_at)
      VALUES (?, ?, 'Standard Studio Covenant & Rights Charter', ?, 'open', ?, ?, ?, ?)
    `).run(
      generateId('agr'),
      projId,
      STANDARD_COVENANT_TERMS,
      JSON.stringify([req.user!.name || 'Practitioner']),
      JSON.stringify([]),
      now.split('T')[0],
      now
    );
  });

  tx();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projId);
  return res.status(201).json({ project });
});

app.get('/api/projects/:id', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const projectId = req.params.id;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  const members = db.prepare(`
    SELECT pm.*, u.name, u.email, p.avatar_url, p.disciplines
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    LEFT JOIN profiles p ON p.user_id = pm.user_id
    WHERE pm.project_id = ?
  `).all(projectId) as any[];

  const userRole = members.find(m => m.user_id === req.user!.id)?.role || 'viewer';

  return res.json({
    project,
    members: members.map(m => ({ ...m, disciplines: safeParseJson(m.disciplines, []) })),
    userRole
  });
});

app.put('/api/projects/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const projectId = req.params.id;
  const {
    title, project_type, status, description,
    statement, intent, format, expected_outputs, project_owner,
    cover_image, location, target_date, visibility
  } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE projects SET
      title = COALESCE(?, title),
      project_type = COALESCE(?, project_type),
      status = COALESCE(?, status),
      description = COALESCE(?, description),
      statement = COALESCE(?, statement),
      intent = COALESCE(?, intent),
      format = COALESCE(?, format),
      expected_outputs = COALESCE(?, expected_outputs),
      project_owner = COALESCE(?, project_owner),
      cover_image = COALESCE(?, cover_image),
      location = COALESCE(?, location),
      target_date = COALESCE(?, target_date),
      visibility = COALESCE(?, visibility),
      updated_at = ?
    WHERE id = ?
  `).run(
    title, project_type, status, description,
    statement, intent, format, expected_outputs, project_owner,
    cover_image, location, target_date, visibility,
    now, projectId
  );

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  return res.json({ project: updated });
});

app.delete('/api/projects/:id', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  const projectId = req.params.id;
  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
  return res.json({ success: true, message: 'Project deleted' });
});

// Project Members
app.get('/api/projects/:projectId/members', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const members = db.prepare(`
    SELECT pm.*, u.name, u.email, p.avatar_url, p.disciplines, p.location
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    LEFT JOIN profiles p ON p.user_id = pm.user_id
    WHERE pm.project_id = ?
  `).all(req.params.projectId) as any[];

  return res.json({
    members: members.map(m => ({ ...m, disciplines: safeParseJson(m.disciplines, []) }))
  });
});

app.post('/api/projects/:projectId/members/invite', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  const { user_id, role, project_role, contribution_area, contribution } = req.body;
  const projectId = req.params.projectId;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const existing = db.prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?').get(projectId, user_id);
  if (existing) {
    return res.status(409).json({ error: 'User is already a project member' });
  }

  const id = generateId('pm');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role, project_role, contribution_area, contribution, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    projectId,
    user_id,
    role || 'member',
    project_role || 'Collaborator',
    contribution_area || 'Creative Contributor',
    contribution || contribution_area || '',
    now
  );

  const project = db.prepare('SELECT title FROM projects WHERE id = ?').get(projectId) as any;
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, 'project_invite', 'Project Invitation', ?, ?, 0, ?)
  `).run(
    generateId('notif'),
    user_id,
    `You have been added to "${project.title}" as ${project_role || role || 'collaborator'}.`,
    `/workspace/${projectId}`,
    now
  );

  return res.status(201).json({ success: true, memberId: id });
});

app.put('/api/projects/:projectId/members/:memberId', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { projectId, memberId } = req.params;
  const { role, project_role, contribution_area, contribution } = req.body;

  db.prepare(`
    UPDATE project_members SET
      role = COALESCE(?, role),
      project_role = COALESCE(?, project_role),
      contribution_area = COALESCE(?, contribution_area),
      contribution = COALESCE(?, contribution)
    WHERE id = ? AND project_id = ?
  `).run(role, project_role, contribution_area, contribution, memberId, projectId);

  const updated = db.prepare('SELECT * FROM project_members WHERE id = ?').get(memberId);
  return res.json({ member: updated });
});

// -------------------------------------------------------------
// WORKSPACE: THE CORE 12 TOOLS & STUDIO HOME
// -------------------------------------------------------------

app.get('/api/projects/:projectId/workspace/summary', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const projectId = req.params.projectId;

  const urgentTasks = db.prepare(`
    SELECT * FROM workspace_tasks
    WHERE project_id = ? AND status != 'completed'
    ORDER BY priority = 'urgent' DESC, deadline ASC
    LIMIT 4
  `).all(projectId);

  const recentTasks = db.prepare(`
    SELECT 'Task updated: ' || title as text, updated_at as time
    FROM workspace_tasks WHERE project_id = ?
    ORDER BY updated_at DESC LIMIT 2
  `).all(projectId) as any[];

  const recentDecisions = db.prepare(`
    SELECT 'Decision recorded: ' || title as text, created_at as time
    FROM decisions WHERE project_id = ?
    ORDER BY created_at DESC LIMIT 2
  `).all(projectId) as any[];

  const recentMemory = db.prepare(`
    SELECT 'Memory logged: ' || title as text, created_at as time
    FROM project_memory WHERE project_id = ?
    ORDER BY created_at DESC LIMIT 2
  `).all(projectId) as any[];

  const recentMembers = db.prepare(`
    SELECT u.name || ' joined crew (' || pm.contribution_area || ')' as text, pm.joined_at as time
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ?
    ORDER BY pm.joined_at DESC LIMIT 2
  `).all(projectId) as any[];

  const allActivity = [...recentTasks, ...recentDecisions, ...recentMemory, ...recentMembers]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  const toolCounts = {
    build: (db.prepare('SELECT count(*) as c FROM workspace_tasks WHERE project_id = ?').get(projectId) as any).c,
    crew: (db.prepare('SELECT count(*) as c FROM project_members WHERE project_id = ?').get(projectId) as any).c,
    capture: (db.prepare('SELECT count(*) as c FROM captures WHERE project_id = ?').get(projectId) as any).c,
    studio: (db.prepare('SELECT count(*) as c FROM studio_assets WHERE project_id = ?').get(projectId) as any).c,
    milestones: (db.prepare('SELECT count(*) as c FROM milestones WHERE project_id = ?').get(projectId) as any).c,
    memory: (db.prepare('SELECT count(*) as c FROM project_memory WHERE project_id = ?').get(projectId) as any).c,
    decisions: (db.prepare('SELECT count(*) as c FROM decisions WHERE project_id = ?').get(projectId) as any).c,
    rights: (db.prepare('SELECT count(*) as c FROM rights WHERE project_id = ?').get(projectId) as any).c,
    agreement: (db.prepare('SELECT count(*) as c FROM agreements WHERE project_id = ?').get(projectId) as any).c,
    money: (db.prepare('SELECT count(*) as c FROM financial_transactions WHERE project_id = ?').get(projectId) as any).c,
    outcome: (db.prepare('SELECT count(*) as c FROM outcomes WHERE project_id = ?').get(projectId) as any).c,
    credits: (db.prepare('SELECT count(*) as c FROM credits WHERE project_id = ?').get(projectId) as any).c,
  };

  return res.json({
    urgentTasks,
    recentActivity: allActivity,
    toolCounts
  });
});

// 01. BUILD
app.get('/api/projects/:projectId/workspace/tasks', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name
    FROM workspace_tasks t
    LEFT JOIN users u ON u.id = t.assignee_id
    WHERE t.project_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.projectId);
  return res.json({ tasks });
});

app.post('/api/projects/:projectId/workspace/tasks', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, assignee_id, deadline } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const id = generateId('t');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO workspace_tasks (id, project_id, title, description, status, priority, assignee_id, deadline, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, description || '', status || 'todo', priority || 'normal', assignee_id || null, deadline || null, now, now);

  const created = db.prepare('SELECT * FROM workspace_tasks WHERE id = ?').get(id);
  return res.status(201).json({ task: created });
});

app.put('/api/projects/:projectId/workspace/tasks/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, description, status, priority, assignee_id, deadline } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE workspace_tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      assignee_id = COALESCE(?, assignee_id),
      deadline = COALESCE(?, deadline),
      updated_at = ?
    WHERE id = ? AND project_id = ?
  `).run(title, description, status, priority, assignee_id, deadline, now, req.params.id, req.params.projectId);

  const updated = db.prepare('SELECT * FROM workspace_tasks WHERE id = ?').get(req.params.id);
  return res.json({ task: updated });
});

app.delete('/api/projects/:projectId/workspace/tasks/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM workspace_tasks WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 03. CAPTURE
app.get('/api/projects/:projectId/workspace/captures', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const captures = db.prepare(`
    SELECT c.*, u.name as author_name
    FROM captures c
    JOIN users u ON u.id = c.created_by
    WHERE c.project_id = ?
    ORDER BY c.is_pinned DESC, c.created_at DESC
  `).all(req.params.projectId) as any[];

  return res.json({
    captures: captures.map(c => ({ ...c, tags: safeParseJson(c.tags, []) }))
  });
});

app.post('/api/projects/:projectId/workspace/captures', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, content, capture_type, tags, is_pinned } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const id = generateId('cap');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO captures (id, project_id, title, content, capture_type, tags, is_pinned, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title || 'Fragment', content, capture_type || 'note', JSON.stringify(tags || []), is_pinned ? 1 : 0, req.user!.id, now);

  const created = db.prepare('SELECT * FROM captures WHERE id = ?').get(id) as any;
  return res.status(201).json({ capture: { ...created, tags: safeParseJson(created.tags, []) } });
});

app.delete('/api/projects/:projectId/workspace/captures/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM captures WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 04. STUDIO
app.get('/api/projects/:projectId/workspace/studio', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const assets = db.prepare(`
    SELECT s.*, u.name as uploader_name
    FROM studio_assets s
    JOIN users u ON u.id = s.uploaded_by
    WHERE s.project_id = ?
    ORDER BY s.created_at DESC
  `).all(req.params.projectId);
  return res.json({ assets });
});

app.post('/api/projects/:projectId/workspace/studio', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { name, asset_type, file_url, file_size, notes } = req.body;
  if (!name || !file_url) return res.status(400).json({ error: 'Name and file URL required' });

  const id = generateId('sa');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO studio_assets (id, project_id, name, asset_type, file_url, file_size, notes, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, name, asset_type || 'document', file_url, file_size || '1.0 MB', notes || '', req.user!.id, now);

  const created = db.prepare('SELECT * FROM studio_assets WHERE id = ?').get(id);
  return res.status(201).json({ asset: created });
});

app.delete('/api/projects/:projectId/workspace/studio/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM studio_assets WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 05. MILESTONES
app.get('/api/projects/:projectId/workspace/milestones', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const milestones = db.prepare(`
    SELECT * FROM milestones WHERE project_id = ? ORDER BY due_date ASC
  `).all(req.params.projectId);
  return res.json({ milestones });
});

app.post('/api/projects/:projectId/workspace/milestones', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, due_date, status, progress, deliverables } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: 'Title and due date required' });

  const id = generateId('ms');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO milestones (id, project_id, title, due_date, status, progress, deliverables, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, due_date, status || 'upcoming', progress || 0, deliverables || '', now);

  const created = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  return res.status(201).json({ milestone: created });
});

app.put('/api/projects/:projectId/workspace/milestones/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, due_date, status, progress, deliverables } = req.body;
  db.prepare(`
    UPDATE milestones SET
      title = COALESCE(?, title),
      due_date = COALESCE(?, due_date),
      status = COALESCE(?, status),
      progress = COALESCE(?, progress),
      deliverables = COALESCE(?, deliverables)
    WHERE id = ? AND project_id = ?
  `).run(title, due_date, status, progress, deliverables, req.params.id, req.params.projectId);

  const updated = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.id);
  return res.json({ milestone: updated });
});

app.delete('/api/projects/:projectId/workspace/milestones/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM milestones WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 06. PROJECT MEMORY
app.get('/api/projects/:projectId/workspace/memory', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const memories = db.prepare(`
    SELECT m.*, u.name as recorder_name
    FROM project_memory m
    JOIN users u ON u.id = m.recorded_by
    WHERE m.project_id = ?
    ORDER BY m.event_date DESC, m.created_at DESC
  `).all(req.params.projectId);
  return res.json({ memories });
});

app.post('/api/projects/:projectId/workspace/memory', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, event_date, event_type, summary, full_context } = req.body;
  if (!title || !summary) return res.status(400).json({ error: 'Title and summary required' });

  const id = generateId('mem');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO project_memory (id, project_id, title, event_date, event_type, summary, full_context, recorded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, event_date || now.split('T')[0], event_type || 'milestone', summary, full_context || '', req.user!.id, now);

  const created = db.prepare('SELECT * FROM project_memory WHERE id = ?').get(id);
  return res.status(201).json({ memory: created });
});

app.delete('/api/projects/:projectId/workspace/memory/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM project_memory WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 07. DECISIONS
app.get('/api/projects/:projectId/workspace/decisions', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const decisions = db.prepare(`
    SELECT * FROM decisions WHERE project_id = ? ORDER BY decision_date DESC, created_at DESC
  `).all(req.params.projectId);
  return res.json({ decisions });
});

app.post('/api/projects/:projectId/workspace/decisions', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, decision_date, why_context, details, made_by, category } = req.body;
  if (!title || !why_context) return res.status(400).json({ error: 'Title and "Why" rationale required' });

  const id = generateId('dec');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO decisions (id, project_id, title, decision_date, why_context, details, made_by, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, decision_date || now.split('T')[0], why_context, details || '', made_by || req.user!.name, category || 'Creative Direction', now);

  const created = db.prepare('SELECT * FROM decisions WHERE id = ?').get(id);
  return res.status(201).json({ decision: created });
});

app.delete('/api/projects/:projectId/workspace/decisions/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM decisions WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 02. RIGHTS (Structured Rights Ledger)
app.get('/api/projects/:projectId/workspace/rights', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const rows = db.prepare(`
    SELECT * FROM rights WHERE project_id = ? ORDER BY ownership_percentage DESC
  `).all(req.params.projectId) as any[];

  const rights = rows.map(r => ({
    ...r,
    permissions: safeParseJson(r.permissions, ['reproduce', 'distribute']),
    revenue_splits: safeParseJson(r.revenue_splits, { streaming: r.ownership_percentage, sync: r.ownership_percentage, licensing: r.ownership_percentage })
  }));

  const totalPercentage = rights.reduce((acc: number, r: any) => acc + (r.ownership_percentage || 0), 0);
  return res.json({
    rights,
    totalPercentage,
    disclaimer: 'Windervale Rights is an autonomous internal record-keeping tool to establish creative consensus among collaborators. It does not constitute formal legal counsel.'
  });
});

app.post('/api/projects/:projectId/workspace/rights', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  const {
    contributor_name, user_id, role, ownership_percentage,
    asset_name, asset_type, permissions, territory, duration,
    exclusivity, restrictions, approval_requirements, revenue_splits,
    rights_details, notes, status
  } = req.body;

  if (!contributor_name || !role || ownership_percentage === undefined) {
    return res.status(400).json({ error: 'Contributor name, role, and percentage required' });
  }

  const id = generateId('r');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO rights (
      id, project_id, contributor_name, user_id, role, ownership_percentage,
      asset_name, asset_type, permissions, territory, duration,
      exclusivity, restrictions, approval_requirements, revenue_splits,
      rights_details, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, req.params.projectId, contributor_name, user_id || null, role, parseFloat(ownership_percentage),
    asset_name || 'Project IP', asset_type || 'Creative Asset',
    JSON.stringify(permissions || ['reproduce', 'distribute']),
    territory || 'Worldwide', duration || 'Perpetual',
    exclusivity || 'non-exclusive', restrictions || '', approval_requirements || '',
    JSON.stringify(revenue_splits || { streaming: parseFloat(ownership_percentage), sync: parseFloat(ownership_percentage), licensing: parseFloat(ownership_percentage) }),
    rights_details || '', notes || '', status || 'active', now
  );

  const created = db.prepare('SELECT * FROM rights WHERE id = ?').get(id) as any;
  return res.status(201).json({
    right: {
      ...created,
      permissions: safeParseJson(created.permissions, []),
      revenue_splits: safeParseJson(created.revenue_splits, {})
    }
  });
});

app.put('/api/projects/:projectId/workspace/rights/:id', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  const {
    contributor_name, role, ownership_percentage,
    asset_name, asset_type, permissions, territory, duration,
    exclusivity, restrictions, approval_requirements, revenue_splits,
    rights_details, notes, status
  } = req.body;

  db.prepare(`
    UPDATE rights SET
      contributor_name = COALESCE(?, contributor_name),
      role = COALESCE(?, role),
      ownership_percentage = COALESCE(?, ownership_percentage),
      asset_name = COALESCE(?, asset_name),
      asset_type = COALESCE(?, asset_type),
      permissions = COALESCE(?, permissions),
      territory = COALESCE(?, territory),
      duration = COALESCE(?, duration),
      exclusivity = COALESCE(?, exclusivity),
      restrictions = COALESCE(?, restrictions),
      approval_requirements = COALESCE(?, approval_requirements),
      revenue_splits = COALESCE(?, revenue_splits),
      rights_details = COALESCE(?, rights_details),
      notes = COALESCE(?, notes),
      status = COALESCE(?, status)
    WHERE id = ? AND project_id = ?
  `).run(
    contributor_name, role, ownership_percentage !== undefined ? parseFloat(ownership_percentage) : null,
    asset_name, asset_type, permissions ? JSON.stringify(permissions) : null,
    territory, duration, exclusivity, restrictions, approval_requirements,
    revenue_splits ? JSON.stringify(revenue_splits) : null,
    rights_details, notes, status,
    req.params.id, req.params.projectId
  );

  const updated = db.prepare('SELECT * FROM rights WHERE id = ?').get(req.params.id) as any;
  return res.json({
    right: {
      ...updated,
      permissions: safeParseJson(updated.permissions, []),
      revenue_splits: safeParseJson(updated.revenue_splits, {})
    }
  });
});

app.delete('/api/projects/:projectId/workspace/rights/:id', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM rights WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 09. AGREEMENTS
const STANDARD_COVENANT_TERMS = `1. CREATIVE INTEGRITY & AUTONOMY
The creative vision, source materials, and moral rights remain attributed to the contributing practitioners. No unilateral commercial exploitation without mutual consensus.

2. RIGHTS, SPLITS & OWNERSHIP
All intellectual property created within this workspace is held in transparent proportion as recorded in the Rights Registry. Revenue and residuals follow agreed split sheets before project masters leave the studio.

3. CREDITS & HISTORICAL ARCHIVE
Every collaborator who contributes work to this project shall receive formal, immutable cinema-grade credit in the colophon archive.

4. COLLABORATIVE COMMITMENT
All participants agree to maintain open communication, document key milestones and decisions within this Workspace, and conduct production with mutual respect.`;

app.get('/api/projects/:projectId/workspace/agreements', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  let agreements = db.prepare(`
    SELECT * FROM agreements WHERE project_id = ? ORDER BY created_at DESC
  `).all(req.params.projectId) as any[];

  // Auto-seed Standard Studio Covenant if project currently has no agreements
  if (agreements.length === 0) {
    const agrId = generateId('agr');
    const now = new Date().toISOString();
    const members = db.prepare(`
      SELECT pm.*, u.name FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `).all(req.params.projectId) as any[];

    const participantNames = members.map(m => m.name || 'Practitioner');
    db.prepare(`
      INSERT INTO agreements (id, project_id, title, terms, status, participants, signed_by, effective_date, created_at)
      VALUES (?, ?, 'Standard Studio Covenant & Rights Charter', ?, 'open', ?, ?, ?, ?)
    `).run(
      agrId,
      req.params.projectId,
      STANDARD_COVENANT_TERMS,
      JSON.stringify(participantNames),
      JSON.stringify([]),
      now.split('T')[0],
      now
    );

    agreements = db.prepare(`
      SELECT * FROM agreements WHERE project_id = ? ORDER BY created_at DESC
    `).all(req.params.projectId) as any[];
  }

  return res.json({
    agreements: agreements.map(a => ({
      ...a,
      participants: safeParseJson(a.participants, []),
      signed_by: safeParseJson(a.signed_by, [])
    })),
    disclaimer: 'Windervale Agreements document creative intentions and understandings between project members. They reflect mutual consensus and should be reviewed by legal representatives if formal civil enforcement is required.'
  });
});

app.post('/api/projects/:projectId/workspace/agreements', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  const { title, terms, participants, effective_date } = req.body;
  if (!title || !terms) return res.status(400).json({ error: 'Title and terms required' });

  const id = generateId('agr');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO agreements (id, project_id, title, terms, status, participants, signed_by, effective_date, created_at)
    VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, terms, JSON.stringify(participants || []), JSON.stringify([]), effective_date || null, now);

  const created = db.prepare('SELECT * FROM agreements WHERE id = ?').get(id) as any;
  return res.status(201).json({
    agreement: {
      ...created,
      participants: safeParseJson(created.participants, []),
      signed_by: safeParseJson(created.signed_by, [])
    }
  });
});

app.put('/api/projects/:projectId/workspace/agreements/:id/sign', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const agreement = db.prepare('SELECT * FROM agreements WHERE id = ? AND project_id = ?').get(req.params.id, req.params.projectId) as any;
  if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

  const signatures = safeParseJson(agreement.signed_by, []);
  if (signatures.some((s: any) => s.user_id === req.user!.id)) {
    return res.status(400).json({ error: 'You have already confirmed this agreement' });
  }

  signatures.push({
    user_id: req.user!.id,
    name: req.user!.name,
    signed_at: new Date().toISOString()
  });

  const memberCount = (db.prepare('SELECT count(*) as c FROM project_members WHERE project_id = ?').get(req.params.projectId) as any)?.c || 1;
  // Ratified when all members have signed, or if at least 1 member signs in single-person projects
  const status = signatures.length >= memberCount ? 'agreed' : 'open';
  db.prepare('UPDATE agreements SET signed_by = ?, status = ? WHERE id = ?').run(JSON.stringify(signatures), status, req.params.id);

  return res.json({ success: true, signed_by: signatures, status });
});

app.delete('/api/projects/:projectId/workspace/agreements/:id', authenticate, requireProjectAccess('owner'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM agreements WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 08. MONEY & WATERFALL (Transparent Creative Project Economics)
app.get('/api/projects/:projectId/workspace/money', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const transactions = db.prepare(`
    SELECT m.*, u.name as recorder_name
    FROM financial_transactions m
    JOIN users u ON u.id = m.recorded_by
    WHERE m.project_id = ?
    ORDER BY m.transaction_date DESC, m.created_at DESC
  `).all(req.params.projectId) as any[];

  let totalFunding = 0;
  let totalExpenses = 0;
  let totalRevenue = 0;
  let totalDeductions = 0;
  let totalApprovedExpenses = 0;
  let totalRecoupable = 0;
  let totalRecouped = 0;

  for (const t of transactions) {
    if (t.type === 'funding') {
      totalFunding += t.amount;
    } else if (t.type === 'expense' || t.type === 'payment') {
      totalExpenses += t.amount;
      if (t.is_approved !== 0) {
        totalApprovedExpenses += t.amount;
      }
      if (t.is_recoupable === 1) {
        totalRecoupable += t.amount;
        totalRecouped += (t.recouped_amount || 0);
      }
    } else if (t.type === 'revenue') {
      totalRevenue += t.amount;
      totalDeductions += (t.deduction_amount || 0);
    }
  }

  const remaining = totalFunding + totalRevenue - totalExpenses;
  const currency = transactions[0]?.currency || 'INR';

  // Fetch rights splits for live contractual allocation
  const rightsRows = db.prepare(`
    SELECT * FROM rights WHERE project_id = ? ORDER BY ownership_percentage DESC
  `).all(req.params.projectId) as any[];

  const distributableRevenue = Math.max(0, totalRevenue - totalDeductions - totalApprovedExpenses);

  // Compute transparent payouts per contributor with exact visible math
  const payouts = rightsRows.map(r => {
    const splits = safeParseJson(r.revenue_splits, {});
    const splitPct = splits.streaming !== undefined ? Number(splits.streaming) : (r.ownership_percentage || 0);
    const grossAllocation = Math.round((splitPct / 100) * distributableRevenue);
    const netPayout = grossAllocation;

    return {
      contributorName: r.contributor_name,
      role: r.role,
      splitPercentage: splitPct,
      grossAllocation,
      priorRecoupmentDeduction: 0,
      netPayout,
      status: distributableRevenue > 0 ? 'approved' : 'pending',
      formula: `${currency} ${distributableRevenue.toLocaleString()} * ${splitPct}% = ${currency} ${netPayout.toLocaleString()}`
    };
  });

  const steps = [
    {
      label: 'Gross Project Revenue',
      amount: totalRevenue,
      type: 'gross',
      notes: 'Total gross receipts across all revenue streams'
    },
    {
      label: 'Permitted Deductions',
      amount: totalDeductions,
      type: 'deduction',
      notes: 'Distribution fees, platform commissions & processing costs'
    },
    {
      label: 'Approved Recoverable Expenses',
      amount: totalApprovedExpenses,
      type: 'expense',
      notes: 'Direct production expenses approved by project lead'
    },
    {
      label: 'Distributable Net Revenue',
      amount: distributableRevenue,
      type: 'distributable',
      formula: `Gross (${totalRevenue.toLocaleString()}) - Deductions (${totalDeductions.toLocaleString()}) - Expenses (${totalApprovedExpenses.toLocaleString()}) = ${distributableRevenue.toLocaleString()}`,
      notes: 'Net pool available for contractual split distribution'
    }
  ];

  return res.json({
    summary: {
      funding: totalFunding,
      expenses: totalExpenses,
      revenue: totalRevenue,
      remaining,
      currency
    },
    recoupment: {
      totalRecoupable,
      totalRecouped,
      remainingToRecoup: Math.max(0, totalRecoupable - totalRecouped)
    },
    waterfall: {
      grossRevenue: totalRevenue,
      deductions: totalDeductions,
      approvedExpenses: totalApprovedExpenses,
      distributableRevenue,
      currency,
      payouts,
      steps
    },
    transactions
  });
});

app.post('/api/projects/:projectId/workspace/money', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const {
    type, amount, currency, category, description, transaction_date,
    is_approved, is_recoupable, deduction_amount, recipient_name, status
  } = req.body;

  if (!type || !amount || !category) return res.status(400).json({ error: 'Type, amount, and category required' });

  const id = generateId('mny');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO financial_transactions (
      id, project_id, type, amount, currency, category, description,
      transaction_date, recorded_by, is_approved, is_recoupable,
      recouped_amount, deduction_amount, recipient_name, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, req.params.projectId, type, parseFloat(amount), currency || 'INR', category, description || '',
    transaction_date || now.split('T')[0], req.user!.id,
    is_approved !== undefined ? Number(is_approved) : 1,
    is_recoupable !== undefined ? Number(is_recoupable) : 0,
    0,
    deduction_amount !== undefined ? parseFloat(deduction_amount) : 0,
    recipient_name || '',
    status || 'approved',
    now
  );

  const created = db.prepare('SELECT * FROM financial_transactions WHERE id = ?').get(id);
  return res.status(201).json({ transaction: created });
});

app.put('/api/projects/:projectId/workspace/money/:id/approve', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare(`
    UPDATE financial_transactions SET is_approved = 1, status = 'approved'
    WHERE id = ? AND project_id = ?
  `).run(req.params.id, req.params.projectId);

  const updated = db.prepare('SELECT * FROM financial_transactions WHERE id = ?').get(req.params.id);
  return res.json({ transaction: updated });
});

app.delete('/api/projects/:projectId/workspace/money/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM financial_transactions WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 11. OUTCOME
app.get('/api/projects/:projectId/workspace/outcomes', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const outcomes = db.prepare(`
    SELECT * FROM outcomes WHERE project_id = ? ORDER BY event_date DESC
  `).all(req.params.projectId);
  return res.json({ outcomes });
});

app.post('/api/projects/:projectId/workspace/outcomes', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, outcome_type, event_date, venue_or_channel, impact_notes, external_url } = req.body;
  if (!title || !outcome_type || !event_date) return res.status(400).json({ error: 'Title, type, and date required' });

  const id = generateId('out');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO outcomes (id, project_id, title, outcome_type, event_date, venue_or_channel, impact_notes, external_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, title, outcome_type, event_date, venue_or_channel || '', impact_notes || '', external_url || '', now);

  const created = db.prepare('SELECT * FROM outcomes WHERE id = ?').get(id);
  return res.status(201).json({ outcome: created });
});

app.delete('/api/projects/:projectId/workspace/outcomes/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM outcomes WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// 09. DISTRIBUTION
app.get('/api/projects/:projectId/workspace/distribution', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const records = db.prepare(`
    SELECT * FROM distribution_records WHERE project_id = ? ORDER BY created_at DESC
  `).all(req.params.projectId) as any[];

  const legacyOutcomes = db.prepare(`
    SELECT * FROM outcomes 
    WHERE project_id = ? AND outcome_type IN ('release', 'screening', 'festival', 'exhibition', 'publication', 'distribution')
    ORDER BY event_date DESC
  `).all(req.params.projectId) as any[];

  const legacyConverted = legacyOutcomes.map((o) => ({
    id: `legacy-${o.id}`,
    project_id: o.project_id,
    title: o.title,
    category: o.outcome_type === 'festival' ? 'festival' : 'release',
    status: 'completed',
    target_date: o.event_date,
    platform_or_partner: o.venue_or_channel || '',
    territory_or_details: '',
    notes: o.impact_notes || '',
    external_url: o.external_url || '',
    created_at: o.created_at,
    is_legacy: true
  }));

  return res.json({ distribution: [...records, ...legacyConverted] });
});

app.post('/api/projects/:projectId/workspace/distribution', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const {
    title, category, status, target_date, platform_or_partner, territory_or_details,
    notes, external_url, asset_id, licensee, duration, fee, exclusivity, approval_status, agreement_ref
  } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Title and category required' });

  const id = generateId('dst');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO distribution_records (
      id, project_id, title, category, status, target_date, platform_or_partner,
      territory_or_details, notes, external_url, asset_id, licensee, duration,
      fee, exclusivity, approval_status, agreement_ref, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, req.params.projectId, title, category, status || 'planned',
    target_date || null, platform_or_partner || '', territory_or_details || '',
    notes || '', external_url || '', asset_id || null, licensee || null,
    duration || null, fee ? parseFloat(fee) : 0, exclusivity || 'non-exclusive',
    approval_status || 'approved', agreement_ref || null, now
  );

  const created = db.prepare('SELECT * FROM distribution_records WHERE id = ?').get(id);
  return res.status(201).json({ record: created });
});

app.put('/api/projects/:projectId/workspace/distribution/:id/approve', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare(`
    UPDATE distribution_records SET approval_status = 'approved', status = 'active'
    WHERE id = ? AND project_id = ?
  `).run(req.params.id, req.params.projectId);

  const updated = db.prepare('SELECT * FROM distribution_records WHERE id = ?').get(req.params.id);
  return res.json({ record: updated });
});

app.post('/api/projects/:projectId/workspace/distribution/submit-windervale', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { title, program, format_details, notes, external_url, target_date } = req.body;
  if (!title || !program) return res.status(400).json({ error: 'Title and program required' });

  const id = generateId('dst');
  const now = new Date().toISOString();
  const fullNotes = [
    format_details ? `Format: ${format_details}` : '',
    notes ? `Curatorial Statement: ${notes}` : ''
  ].filter(Boolean).join('\n\n');

  db.prepare(`
    INSERT INTO distribution_records (id, project_id, title, category, status, target_date, platform_or_partner, territory_or_details, notes, external_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.params.projectId,
    title,
    'windervale',
    'submitted',
    target_date || now.split('T')[0],
    'Windervale Editorial Board & Archive',
    `Program: ${program}`,
    fullNotes,
    external_url || '',
    now
  );

  // Notify submitting user
  const notifId = generateId('ntf');
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, 'system', 'Work Submitted to Windervale', ?, ?, 0, ?)
  `).run(
    notifId,
    req.user!.id,
    `Work "${title}" was submitted to the Windervale Editorial Board (${program}).`,
    `/workspace/${req.params.projectId}`,
    now
  );

  const created = db.prepare('SELECT * FROM distribution_records WHERE id = ?').get(id);
  return res.status(201).json({ record: created });
});

app.delete('/api/projects/:projectId/workspace/distribution/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  if (req.params.id.startsWith('legacy-')) {
    const rawId = req.params.id.replace('legacy-', '');
    db.prepare('DELETE FROM outcomes WHERE id = ? AND project_id = ?').run(rawId, req.params.projectId);
  } else {
    db.prepare('DELETE FROM distribution_records WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  }
  return res.json({ success: true });
});

// 06. CAPTURE CONVERSION
app.post('/api/projects/:projectId/workspace/captures/:id/convert', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { projectId, id } = req.params;
  const { targetType, title } = req.body;
  const capture = db.prepare('SELECT * FROM captures WHERE id = ? AND project_id = ?').get(id, projectId) as any;
  if (!capture) return res.status(404).json({ error: 'Capture fragment not found' });

  const now = new Date().toISOString();
  let createdRecord: any = null;

  if (targetType === 'task') {
    const taskId = generateId('tsk');
    db.prepare(`
      INSERT INTO workspace_tasks (id, project_id, title, description, status, priority, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'todo', 'normal', ?, ?)
    `).run(taskId, projectId, title || capture.title, capture.content, now, now);
    createdRecord = { id: taskId, type: 'task' };
  } else if (targetType === 'asset') {
    const assetId = generateId('ast');
    db.prepare(`
      INSERT INTO studio_assets (id, project_id, name, asset_type, file_url, notes, uploaded_by, created_at)
      VALUES (?, ?, ?, 'reference', '', ?, ?, ?)
    `).run(assetId, projectId, title || capture.title, capture.content, req.user!.id, now);
    createdRecord = { id: assetId, type: 'asset' };
  } else if (targetType === 'milestone') {
    const milestoneId = generateId('mls');
    db.prepare(`
      INSERT INTO milestones (id, project_id, title, due_date, status, progress, deliverables, created_at)
      VALUES (?, ?, ?, ?, 'upcoming', 0, ?, ?)
    `).run(milestoneId, projectId, title || capture.title, now.split('T')[0], capture.content, now);
    createdRecord = { id: milestoneId, type: 'milestone' };
  }

  db.prepare('UPDATE captures SET converted_to = ?, converted_id = ? WHERE id = ?').run(
    targetType, createdRecord?.id || 'converted', id
  );

  return res.json({ success: true, converted_to: targetType, record: createdRecord });
});

// CROSS-PROJECT PENDING ACTIONS
app.get('/api/projects/:projectId/workspace/pending-actions', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const pendingActions: any[] = [];

  // 1. Unsigned agreements
  const agreements = db.prepare('SELECT * FROM agreements WHERE project_id = ?').all(projectId) as any[];
  const members = db.prepare('SELECT * FROM project_members WHERE project_id = ?').all(projectId) as any[];
  for (const agr of agreements) {
    const signed = safeParseJson(agr.signed_by, []);
    const unsignedCount = Math.max(0, members.length - signed.length);
    if (agr.status !== 'agreed' || unsignedCount > 0) {
      pendingActions.push({
        id: `pending-agr-${agr.id}`,
        moduleKey: '03_AGREEMENT',
        title: 'Covenant Signature Required',
        description: `${signed.length}/${members.length} collaborators have signed "${agr.title}"`,
        urgency: 'high',
        linkModule: '03_AGREEMENT'
      });
    }
  }

  // 2. Unapproved expenses
  const pendingExpenses = db.prepare(`
    SELECT * FROM financial_transactions 
    WHERE project_id = ? AND (type = 'expense' OR type = 'payment') AND (is_approved = 0 OR status = 'pending')
  `).all(projectId) as any[];
  for (const exp of pendingExpenses) {
    pendingActions.push({
      id: `pending-exp-${exp.id}`,
      moduleKey: '08_MONEY',
      title: 'Expense Awaiting Approval',
      description: `${exp.currency} ${exp.amount.toLocaleString()} for "${exp.category} : ${exp.description || 'Production'}"`,
      urgency: 'high',
      linkModule: '08_MONEY'
    });
  }

  // 3. Pending Licenses or Distribution records
  const pendingDist = db.prepare(`
    SELECT * FROM distribution_records
    WHERE project_id = ? AND (status = 'submitted' OR approval_status = 'pending')
  `).all(projectId) as any[];
  for (const dst of pendingDist) {
    pendingActions.push({
      id: `pending-dst-${dst.id}`,
      moduleKey: '09_DISTRIBUTION',
      title: 'License / Release Review Pending',
      description: `"${dst.title}" (${dst.category}) awaiting confirmation`,
      urgency: 'normal',
      linkModule: '09_DISTRIBUTION'
    });
  }

  return res.json({ pendingActions });
});

// 10. CREDITS
app.get('/api/projects/:projectId/workspace/credits', authenticate, requireProjectAccess('viewer'), (req: AuthRequest, res: Response) => {
  const credits = db.prepare(`
    SELECT c.*, u.name as linked_user_name, p.avatar_url
    FROM credits c
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN profiles p ON p.user_id = c.user_id
    WHERE c.project_id = ?
    ORDER BY c.display_order ASC, c.created_at ASC
  `).all(req.params.projectId);
  return res.json({ credits });
});

app.post('/api/projects/:projectId/workspace/credits', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { role_title, contributor_name, user_id, notes, display_order } = req.body;
  if (!role_title || !contributor_name) return res.status(400).json({ error: 'Role title and contributor name required' });

  const id = generateId('crd');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO credits (id, project_id, role_title, contributor_name, user_id, notes, display_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.projectId, role_title.toUpperCase(), contributor_name, user_id || null, notes || '', display_order || 0, now);

  const created = db.prepare('SELECT * FROM credits WHERE id = ?').get(id);
  return res.status(201).json({ credit: created });
});

app.post('/api/projects/:projectId/workspace/credits/sync-crew', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const members = db.prepare(`
    SELECT pm.*, u.name 
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ?
  `).all(projectId) as any[];

  const existingCredits = db.prepare('SELECT contributor_name, role_title FROM credits WHERE project_id = ?').all(projectId) as any[];
  let addedCount = 0;

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const roleTitle = (m.project_role || m.contribution_area || 'CREATIVE COLLABORATOR').toUpperCase();
    const alreadyExists = existingCredits.some(c => c.contributor_name === m.name && c.role_title === roleTitle);

    if (!alreadyExists) {
      db.prepare(`
        INSERT INTO credits (id, project_id, role_title, contributor_name, user_id, notes, display_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        generateId('crd'),
        projectId,
        roleTitle,
        m.name,
        m.user_id,
        m.contribution ? `Contribution: ${m.contribution}` : (m.contribution_area ? `Area: ${m.contribution_area}` : ''),
        i + 1,
        new Date().toISOString()
      );
      addedCount++;
    }
  }

  const credits = db.prepare(`
    SELECT c.*, u.name as linked_user_name, p.avatar_url
    FROM credits c
    LEFT JOIN users u ON u.id = c.user_id
    LEFT JOIN profiles p ON p.user_id = c.user_id
    WHERE c.project_id = ?
    ORDER BY c.display_order ASC, c.created_at ASC
  `).all(projectId);

  return res.json({ success: true, addedCount, credits });
});

app.delete('/api/projects/:projectId/workspace/credits/:id', authenticate, requireProjectAccess('member'), (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM credits WHERE id = ? AND project_id = ?').run(req.params.id, req.params.projectId);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// LIBRARY
// -------------------------------------------------------------

app.get('/api/library', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM library_posts';
  const params: any[] = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY published_at DESC';
  const posts = db.prepare(query).all(...params) as any[];

  let results = posts.map(p => ({
    ...p,
    tags: safeParseJson(p.tags, [])
  }));

  if (search) {
    const s = (search as string).toLowerCase();
    results = results.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s) || p.author_name.toLowerCase().includes(s));
  }

  return res.json({ articles: results });
});

app.get('/api/library/:id', (req: Request, res: Response) => {
  const post = db.prepare('SELECT * FROM library_posts WHERE id = ?').get(req.params.id) as any;
  if (!post) return res.status(404).json({ error: 'Article not found' });
  return res.json({ article: { ...post, tags: safeParseJson(post.tags, []) } });
});

app.post('/api/library', authenticate, (req: AuthRequest, res: Response) => {
  const { title, subtitle, category, content, reading_time, cover_image, tags } = req.body;
  if (!title || !content || !category) return res.status(400).json({ error: 'Title, content, and category required' });

  const id = generateId('lib');
  const now = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO library_posts (id, title, subtitle, author_name, author_id, category, content, reading_time, cover_image, tags, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, subtitle || '', req.user!.name, req.user!.id, category, content,
    reading_time || '5 min read',
    cover_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    JSON.stringify(tags || []), now
  );

  const created = db.prepare('SELECT * FROM library_posts WHERE id = ?').get(id) as any;
  return res.status(201).json({ article: { ...created, tags: safeParseJson(created.tags, []) } });
});

// -------------------------------------------------------------
// FUND
// -------------------------------------------------------------

app.get('/api/fund/grants', (req: Request, res: Response) => {
  const grants = db.prepare('SELECT * FROM fund_grants ORDER BY deadline ASC').all() as any[];
  return res.json({
    grants: grants.map(g => ({
      ...g,
      criteria: safeParseJson(g.criteria, []),
      supported_disciplines: safeParseJson(g.supported_disciplines, [])
    }))
  });
});

app.post('/api/fund/apply', authenticate, (req: AuthRequest, res: Response) => {
  const { grant_id, project_id, proposal, requested_amount } = req.body;
  if (!grant_id || !project_id || !proposal || !requested_amount) {
    return res.status(400).json({ error: 'Grant ID, project ID, proposal, and amount required' });
  }

  const id = generateId('app');
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO fund_applications (id, grant_id, project_id, applicant_id, proposal, requested_amount, status, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?)
  `).run(id, grant_id, project_id, req.user!.id, proposal, parseFloat(requested_amount), now);

  return res.status(201).json({ success: true, applicationId: id });
});

app.get('/api/fund/applications', authenticate, (req: AuthRequest, res: Response) => {
  const apps = db.prepare(`
    SELECT a.*, g.title as grant_title, g.funder_name, p.title as project_title
    FROM fund_applications a
    JOIN fund_grants g ON g.id = a.grant_id
    JOIN projects p ON p.id = a.project_id
    WHERE a.applicant_id = ?
    ORDER BY a.submitted_at DESC
  `).all(req.user!.id);
  return res.json({ applications: apps });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

app.get('/api/notifications', authenticate, (req: AuthRequest, res: Response) => {
  const notifs = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30
  `).all(req.user!.id);
  return res.json({ notifications: notifs });
});

app.put('/api/notifications/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// GLOBAL SEARCH
// -------------------------------------------------------------

app.get('/api/search', optionalAuthenticate, (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    return res.json({ creatives: [], projects: [], library: [], fund: [] });
  }

  const creatives = db.prepare(`
    SELECT u.id, u.name, p.handle, p.avatar_url, p.disciplines, p.location
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE (u.name LIKE ? OR p.location LIKE ? OR p.bio LIKE ?) AND p.visibility = 'public'
    LIMIT 5
  `).all(`%${q}%`, `%${q}%`, `%${q}%`) as any[];

  const projects = db.prepare(`
    SELECT id, title, project_type, status, cover_image, description
    FROM projects
    WHERE (title LIKE ? OR description LIKE ?)
    LIMIT 5
  `).all(`%${q}%`, `%${q}%`);

  const library = db.prepare(`
    SELECT id, title, subtitle, author_name, category, reading_time
    FROM library_posts
    WHERE (title LIKE ? OR content LIKE ?)
    LIMIT 5
  `).all(`%${q}%`, `%${q}%`);

  const fund = db.prepare(`
    SELECT id, title, funder_name, grant_amount, currency, deadline
    FROM fund_grants
    WHERE (title LIKE ? OR description LIKE ?)
    LIMIT 5
  `).all(`%${q}%`, `%${q}%`);

  return res.json({
    creatives: creatives.map(c => ({ ...c, disciplines: safeParseJson(c.disciplines, []) })),
    projects,
    library,
    fund
  });
});

// -------------------------------------------------------------
// STATIC ASSET SERVING FOR PRODUCTION SPA
// -------------------------------------------------------------
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.use((req: Request, res: Response, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.resolve(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Helpers
function safeParseJson(data: any, fallback: any) {
  if (!data) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function parseProfile(p: any) {
  if (!p) return null;
  return {
    ...p,
    portfolio_url: p?.portfolio_url || null,
    offerings: p?.offerings || null,
    disciplines: safeParseJson(p.disciplines, []),
    roles_list: safeParseJson(p.roles_list, []),
    practices: safeParseJson(p.practices, []),
    interests: safeParseJson(p.interests, []),
    selected_works: safeParseJson(p.selected_works, []),
    external_links: safeParseJson(p.external_links, [])
  };
}

interface MatchReason {
  category: string;
  score: string;
  detail: string;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'what', 'can', 'you',
  'want', 'offer', 'seeking', 'looking', 'open', 'project', 'projects', 'independent',
  'collaboration', 'collaborations', 'cross', 'disciplinary', 'work', 'works', 'working',
  'make', 'making', 'help', 'someone', 'people', 'creative', 'creatives', 'good', 'new',
  'things', 'all', 'any', 'some', 'interested', 'interests', 'experience', 'experienced',
  'practice', 'practices', 'craft', 'medium', 'field', 'area', 'based', 'time', 'like',
  'together', 'also', 'have', 'been', 'about', 'more', 'both', 'will', 'just', 'such'
]);

function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Craft alias groups for matching intentions to disciplines and offerings
const CRAFT_ALIASES: Record<string, string[]> = {
  'music': ['musician', 'sound artist', 'sound designer', 'composer', 'songwriting', 'audio', 'producer', 'score', 'scoring'],
  'musician': ['music', 'sound artist', 'sound designer', 'composer', 'songwriting', 'vocalist', 'producer', 'instrumentalist'],
  'sound artist': ['music', 'musician', 'sound designer', 'composer', 'audio', 'sound design', 'sound'],
  'sound designer': ['sound artist', 'sound design', 'sound', 'audio', 'composer', 'music', 'foley'],
  'producer': ['music producer', 'film producer', 'producer', 'production', 'audio engineer', 'mixing'],
  'filmmaker': ['director', 'cinema', 'film', 'filmmaking', 'video', 'cinematographer', 'editor', 'screenwriter'],
  'director': ['filmmaker', 'film', 'cinema', 'directing', 'cinematographer', 'screenwriter'],
  'cinematographer': ['camera', 'dop', 'lighting', 'cinematography', 'videographer', 'director of photography'],
  'writer': ['screenwriter', 'screenplay', 'script', 'scriptwriting', 'author', 'poet', 'writing'],
  'screenwriter': ['writer', 'screenplay', 'script', 'scriptwriting', 'script writing', 'story'],
  'editor': ['video editing', 'film editor', 'post production', 'colorist', 'editing'],
  'creative coder': ['coding', 'code', 'software', 'generative art', 'interactive', 'shader', 'developer', 'web'],
  'visual artist': ['painter', 'sculptor', 'printmaker', 'illustrator', 'art', 'artist', 'installation'],
  'ceramicist': ['ceramics', 'pottery', 'clay', 'sculptor'],
  'sculptor': ['sculpture', 'ceramicist', 'spatial designer', 'installation'],
  'architect': ['architecture', 'spatial design', 'set design', 'interior design'],
  'photographer': ['photography', 'photo', 'darkroom', 'portrait', 'camera']
};

// Check if a skill or role is mentioned in text
function matchesCraftNeed(needText: string, offerText: string, disciplines: string[]): string | null {
  const needWords = extractKeywords(needText);
  if (needWords.length === 0) return null;

  // Check against disciplines
  for (const disc of disciplines) {
    const discLower = disc.toLowerCase();
    if (needWords.some(w => discLower.includes(w) || w.includes(discLower))) {
      return disc;
    }
    const aliases = CRAFT_ALIASES[discLower] || [];
    for (const alias of aliases) {
      if (needWords.some(w => alias.includes(w) || w.includes(alias))) {
        return `${disc} (${alias})`;
      }
    }
  }

  // Check against offering words
  const offerWords = extractKeywords(offerText);
  for (const nw of needWords) {
    for (const ow of offerWords) {
      if (nw === ow || (nw.length >= 4 && (ow.includes(nw) || nw.includes(ow)))) {
        return ow;
      }
    }
  }

  return null;
}

function calculateCompatibility(userProfile: any, targetProfile: any): {
  match_percentage: number;
  match_badge: string;
  match_type: 'peer' | 'complementary' | 'inquiry';
  synergy_label: string;
  match_reasons: MatchReason[];
} | null {
  const userDiscs: string[] = (userProfile?.disciplines || []).map((d: string) => String(d).toLowerCase().trim());
  const targetDiscs: string[] = (targetProfile?.disciplines || []).map((d: string) => String(d).toLowerCase().trim());

  const activeUserDiscs = userDiscs.length > 0 ? userDiscs : ['creative'];
  const activeTargetDiscs = targetDiscs.length > 0 ? targetDiscs : ['creative'];

  const userOffer: string = String(userProfile?.offerings || '').toLowerCase();
  const targetOffer: string = String(targetProfile?.offerings || '').toLowerCase();

  const userSeek: string = String(userProfile?.collaboration_interests || '').toLowerCase();
  const targetSeek: string = String(targetProfile?.collaboration_interests || '').toLowerCase();

  const userCity: string = String(userProfile?.location || '').toLowerCase();
  const targetCity: string = String(targetProfile?.location || '').toLowerCase();
  const userCountry: string = String(userProfile?.country || '').toLowerCase();
  const targetCountry: string = String(targetProfile?.country || '').toLowerCase();

  // Strict cross-production studio complement pairs (only undeniable industry production workflows)
  const crossSynergies: Record<string, string[]> = {
    'filmmaker': ['cinematographer', 'sound designer', 'composer', 'screenwriter', 'editor', 'colorist', 'producer', 'actor'],
    'director': ['cinematographer', 'sound designer', 'composer', 'screenwriter', 'editor', 'producer', 'actor'],
    'cinematographer': ['director', 'filmmaker', 'editor', 'lighting designer', 'colorist'],
    'musician': ['producer', 'audio engineer', 'mixing', 'mastering', 'vocalist', 'songwriter'],
    'sound artist': ['sound designer', 'composer', 'filmmaker', 'audio engineer'],
    'sound designer': ['filmmaker', 'director', 'game developer', 'animator', 'editor'],
    'composer': ['filmmaker', 'director', 'musician', 'orchestrator'],
    'writer': ['director', 'filmmaker', 'screenwriter', 'publisher', 'editor'],
    'screenwriter': ['director', 'filmmaker', 'producer'],
    'visual artist': ['sculptor', 'ceramicist', 'curator', 'gallerist'],
    'photographer': ['art director', 'publisher', 'magazine', 'fashion designer'],
    'creative coder': ['creative coder'],
    'ceramicist': ['sculptor', 'architect'],
    'sculptor': ['ceramicist', 'architect'],
    'architect': ['sculptor', 'ceramicist', 'interior designer', 'spatial designer']
  };

  // -------------------------------------------------------------
  // STEP 1: WHAT THEY WANT VS WHAT YOU CAN OFFER (PRIMARY FACTOR - UP TO 60%)
  // -------------------------------------------------------------
  const reasons: MatchReason[] = [];
  let offerNeedScore = 0;

  // Check if target offers what user seeks
  const targetFulfillsUser = matchesCraftNeed(userSeek, targetOffer, activeTargetDiscs);
  if (targetFulfillsUser) {
    offerNeedScore += 30;
    reasons.push({
      category: 'They Offer What You Seek',
      score: '+30%',
      detail: `They offer "${targetFulfillsUser}", directly matching your collaboration inquiry`
    });
  }

  // Check if user offers what target seeks
  const userFulfillsTarget = matchesCraftNeed(targetSeek, userOffer, activeUserDiscs);
  if (userFulfillsTarget) {
    offerNeedScore += 30;
    reasons.push({
      category: 'You Offer What They Seek',
      score: '+30%',
      detail: `Your craft and offerings fulfill what they are actively looking for: "${userFulfillsTarget}"`
    });
  }

  // -------------------------------------------------------------
  // STEP 2: DISCIPLINE SYNERGY (UP TO 20%)
  // -------------------------------------------------------------
  let disciplineScore = 0;
  let matchType: 'peer' | 'complementary' | 'inquiry' | null = null;
  let matchBadge = '';
  let crossLabel = '';

  // Check Peer Craft (Both in the same exact discipline)
  const shared = activeUserDiscs.filter(ud => activeTargetDiscs.some(td => td.includes(ud) || ud.includes(td)));
  if (shared.length > 0) {
    matchType = 'peer';
    matchBadge = 'PEER CRAFT';
    crossLabel = `Shared Medium: ${shared.map(capitalize).join(', ')}`;
    disciplineScore = 20;
    reasons.push({
      category: 'Main Discipline: Peer Craft',
      score: '+20%',
      detail: `Both practitioners work in ${shared.map(capitalize).join(', ')} (peer studio alliance)`
    });
  }

  // Check Complementary Production Craft (Natural studio pairings)
  if (!matchType) {
    for (const ud of activeUserDiscs) {
      const complementaries = crossSynergies[ud] || [];
      for (const td of activeTargetDiscs) {
        if (complementaries.some(c => td.includes(c) || c.includes(td))) {
          matchType = 'complementary';
          matchBadge = 'COMPLEMENTARY CRAFT';
          crossLabel = `${capitalize(ud)} × ${capitalize(td)}`;
          disciplineScore = 15;
          reasons.push({
            category: 'Main Discipline: Complementary Craft',
            score: '+15%',
            detail: `${crossLabel} (recognized production workflow pairing)`
          });
          break;
        }
      }
      if (matchType) break;
    }
  }

  // If there's an explicit offer/need match across crafts, mark as Project Collaborator
  if (!matchType && (targetFulfillsUser || userFulfillsTarget)) {
    matchType = 'inquiry';
    matchBadge = 'PROJECT COLLABORATOR';
    crossLabel = `${capitalize(activeUserDiscs[0])} → ${capitalize(activeTargetDiscs[0])}`;
    disciplineScore = 10;
    reasons.push({
      category: 'Project Collaboration Aligned',
      score: '+10%',
      detail: 'Stated project needs and offerings match across disciplines'
    });
  }

  // -------------------------------------------------------------
  // STRICT REJECTION: SENSELESS MATCH FILTER
  // If NEITHER person's inquiry is satisfied, AND they are NOT
  // in peer craft, AND they are NOT in complementary production craft:
  // REJECT IMMEDIATELY! (Zero match, do not show on map)
  // -------------------------------------------------------------
  if (!matchType && !targetFulfillsUser && !userFulfillsTarget) {
    return null;
  }

  // -------------------------------------------------------------
  // STEP 3: AREA & LOCATION PROXIMITY (SECONDARY FACTOR - UP TO 20%)
  // -------------------------------------------------------------
  let locationScore = 0;
  if (userCity && targetCity && (userCity.includes(targetCity) || targetCity.includes(userCity))) {
    locationScore = 20;
    reasons.push({
      category: 'Base Area: Same City',
      score: '+20%',
      detail: `Both based in ${capitalize(userProfile?.location || 'City')} (enables physical studio sessions and shared production)`
    });
  } else if (userCountry && targetCountry && (userCountry.includes(targetCountry) || targetCountry.includes(userCountry))) {
    locationScore = 10;
    reasons.push({
      category: 'Regional Area: Same Country',
      score: '+10%',
      detail: `Both located in ${capitalize(userProfile?.country || 'Region')} (regional access)`
    });
  } else {
    locationScore = 5;
    reasons.push({
      category: 'Area: Global Exchange',
      score: '+5%',
      detail: 'Remote production and digital studio exchange'
    });
  }

  const totalPoints = offerNeedScore + disciplineScore + locationScore;
  const finalPercentage = Math.min(100, Math.max(30, Math.round(totalPoints)));

  return {
    match_percentage: finalPercentage,
    match_badge: matchBadge || 'CRAFT ALLY',
    match_type: matchType || 'inquiry',
    synergy_label: crossLabel || `${capitalize(activeUserDiscs[0])} × ${capitalize(activeTargetDiscs[0])}`,
    match_reasons: reasons
  };
}

// -------------------------------------------------------------
// ADMINISTRATIVE CURATION DESK & APPLICATION MANAGEMENT
// -------------------------------------------------------------

const ADMIN_PASSKEY = process.env.ADMIN_KEY || 'windervale-curation-desk-2026';

function requireAdmin(req: Request, res: Response, next: () => void) {
  const key = req.headers['x-admin-key'] || req.body?.adminKey || req.query?.adminKey;
  if (key !== ADMIN_PASSKEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid administrative curation passkey' });
  }
  next();
}

// Verify admin passkey (supports /api/admin/verify and /api/admin/verify-key)
const handleAdminVerify = (req: Request, res: Response) => {
  const { adminKey } = req.body;
  if (adminKey === ADMIN_PASSKEY) {
    return res.json({ success: true, valid: true, message: 'Administrative access granted' });
  }
  return res.status(401).json({ error: 'Invalid administrative passkey', valid: false });
};
app.post('/api/admin/verify', handleAdminVerify);
app.post('/api/admin/verify-key', handleAdminVerify);

// View all applications with filtering and search
app.get('/api/admin/applications', requireAdmin, (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const search = (req.query.search as string || '').toLowerCase().trim();

    let query = `
      SELECT 
        u.id as user_id,
        u.email,
        u.name,
        u.role,
        u.email_verified,
        u.created_at as registered_at,
        p.display_name,
        p.handle,
        p.avatar_url,
        p.avatar_public,
        p.location,
        p.country,
        p.latitude,
        p.longitude,
        p.bio,
        p.disciplines,
        p.practices,
        p.offerings,
        p.collaboration_interests,
        p.portfolio_url,
        p.selected_works,
        p.id_document_url,
        p.id_document_type,
        p.id_verification_status,
        p.approval_status,
        p.verification_status,
        p.verification_submitted_at,
        p.rejection_reason,
        p.reviewed_at,
        p.reviewed_by,
        p.updated_at
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.role != 'admin'
    `;

    const params: any[] = [];

    if (status !== 'all') {
      query += ` AND p.approval_status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (
        LOWER(u.name) LIKE ? OR
        LOWER(u.email) LIKE ? OR
        LOWER(p.location) LIKE ? OR
        LOWER(p.disciplines) LIKE ? OR
        LOWER(p.offerings) LIKE ?
      )`;
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild, wild);
    }

    query += ` ORDER BY u.created_at DESC`;

    const rows = db.prepare(query).all(...params) as any[];

    // Fetch legal acceptances for each applicant
    const acceptancesStmt = db.prepare(`
      SELECT doc_type, doc_version, accepted_at
      FROM legal_acceptances
      WHERE user_id = ?
    `);

    const applications = rows.map(r => {
      let disciplines: string[] = [];
      let practices: string[] = [];
      let selectedWorks: any[] = [];

      try { disciplines = JSON.parse(r.disciplines || '[]'); } catch {}
      try { practices = JSON.parse(r.practices || '[]'); } catch {}
      try { selectedWorks = JSON.parse(r.selected_works || '[]'); } catch {}

      const acceptances = acceptancesStmt.all(r.user_id);

      return {
        ...r,
        disciplines,
        practices,
        selected_works: selectedWorks,
        acceptances
      };
    });

    return res.json({ applications });
  } catch (err: any) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// Legacy / compatibility alias for pending users
app.get('/api/admin/pending-users', requireAdmin, (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT 
        u.id as user_id,
        u.email,
        u.name,
        u.created_at as registered_at,
        p.*
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE p.approval_status = 'pending'
      ORDER BY u.created_at DESC
    `).all() as any[];

    const pending = rows.map(r => parseProfile(r));
    return res.json({ pending });
  } catch (err: any) {
    console.error('Error fetching pending users:', err);
    return res.status(500).json({ error: 'Failed to retrieve pending users' });
  }
});

// Approve applicant
app.post('/api/admin/approve-user', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const now = new Date().toISOString();
    const update = db.prepare(`
      UPDATE profiles
      SET 
        approval_status = 'approved',
        verification_status = 'verified',
        id_verification_status = 'verified',
        reviewed_at = ?,
        reviewed_by = 'Curation Desk',
        updated_at = ?
      WHERE user_id = ?
    `);

    const result = update.run(now, now, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      success: true,
      message: 'Applicant successfully approved and monograph verified for the Human Map.'
    });
  } catch (err: any) {
    console.error('Error approving user:', err);
    return res.status(500).json({ error: 'Failed to approve applicant' });
  }
});

// Reject applicant
app.post('/api/admin/reject-user', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const now = new Date().toISOString();
    const update = db.prepare(`
      UPDATE profiles
      SET 
        approval_status = 'rejected',
        rejection_reason = ?,
        reviewed_at = ?,
        reviewed_by = 'Curation Desk',
        updated_at = ?
      WHERE user_id = ?
    `);

    const result = update.run(reason || 'Does not currently meet curation criteria', now, now, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      success: true,
      message: 'Applicant status updated to rejected.'
    });
  } catch (err: any) {
    console.error('Error rejecting user:', err);
    return res.status(500).json({ error: 'Failed to update applicant status' });
  }
});

// Application Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  try {
    const totalUsers = (db.prepare("SELECT count(*) as c FROM users WHERE role != 'admin'").get() as any).c;
    const pending = (db.prepare("SELECT count(*) as c FROM profiles WHERE approval_status = 'pending'").get() as any).c;
    const approved = (db.prepare("SELECT count(*) as c FROM profiles WHERE approval_status = 'approved'").get() as any).c;
    const rejected = (db.prepare("SELECT count(*) as c FROM profiles WHERE approval_status = 'rejected'").get() as any).c;
    const totalProjects = (db.prepare("SELECT count(*) as c FROM projects").get() as any).c;

    return res.json({
      stats: {
        total_applications: totalUsers,
        pending,
        approved,
        rejected,
        total_projects: totalProjects
      }
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Export applications to CSV
app.get('/api/admin/export', requireAdmin, (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.created_at as registered_at,
        p.location,
        p.country,
        p.disciplines,
        p.offerings,
        p.collaboration_interests,
        p.portfolio_url,
        p.id_document_type,
        p.approval_status,
        p.reviewed_at
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `).all() as any[];

    let csv = 'User ID,Name,Email,Registered At,Location,Country,Disciplines,Offerings,Collaboration Seeking,Portfolio URL,ID Document Type,Approval Status,Reviewed At\n';

    for (const r of rows) {
      let discs = '';
      try { discs = JSON.parse(r.disciplines || '[]').join('; '); } catch { discs = r.disciplines || ''; }

      const sanitize = (val: string | null | undefined) => {
        if (!val) return '""';
        return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      };

      csv += [
        sanitize(r.user_id),
        sanitize(r.name),
        sanitize(r.email),
        sanitize(r.registered_at),
        sanitize(r.location),
        sanitize(r.country),
        sanitize(discs),
        sanitize(r.offerings),
        sanitize(r.collaboration_interests),
        sanitize(r.portfolio_url),
        sanitize(r.id_document_type),
        sanitize(r.approval_status),
        sanitize(r.reviewed_at)
      ].join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="windervale_applications_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err: any) {
    console.error('Error exporting applications CSV:', err);
    return res.status(500).json({ error: 'Failed to export applications' });
  }
});

// Serve frontend assets from dist in production
const candidateDistDirs = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, 'dist')
];

const distDir = candidateDistDirs.find(d => fs.existsSync(path.join(d, 'index.html')));

if (distDir) {
  console.log(`[WINDERVALE] Serving static production bundle from: ${distDir}`);
  app.use(express.static(distDir));
  // Express 5 compatible SPA fallback middleware
  app.use((req: Request, res: Response, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn('[WINDERVALE WARNING] No production dist directory found. Checked:', candidateDistDirs);
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Windervale - Initializing</title></head>
        <body style="background:#0a0a0c;color:#f3efe6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h1 style="letter-spacing:0.2em;text-transform:uppercase;">Windervale</h1>
            <p style="color:#888;">Compiling production assets... Please refresh in a moment.</p>
          </div>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, () => {
  console.log(`[WINDERVALE API] Creative Operating Environment Server running on port ${PORT}`);
});

