import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isTestRun =
  process.env.NODE_ENV === 'test' ||
  process.env.TEST_DB === 'true' ||
  process.argv.some(arg => arg.includes('test.ts') || arg.includes('test.js'));

const dbFile = isTestRun ? 'windervale_test.db' : 'windervale.db';
const dbPath = path.resolve(__dirname, '..', dbFile);
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance & reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'creative',
      email_verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      handle TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      location TEXT,
      country TEXT,
      latitude REAL,
      longitude REAL,
      bio TEXT,
      disciplines TEXT, -- JSON array of strings
      roles_list TEXT, -- JSON array of strings
      practices TEXT, -- JSON array of strings
      interests TEXT, -- JSON array of strings
      selected_works TEXT, -- JSON array of {title, year, role, description, link}
      external_links TEXT, -- JSON array of {platform, url}
      availability TEXT DEFAULT 'Available for projects',
      collaboration_interests TEXT,
      visibility TEXT DEFAULT 'public',
      location_visibility INTEGER DEFAULT 1,
      approval_status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'banned'
      verification_status TEXT DEFAULT 'verified', -- 'unverified', 'pending', 'verified'
      verification_submitted_at TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS legal_documents (
      id TEXT PRIMARY KEY,
      doc_type TEXT NOT NULL, -- 'terms', 'privacy', 'guidelines'
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      effective_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS legal_acceptances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      doc_version TEXT NOT NULL,
      accepted_at TEXT NOT NULL,
      status TEXT DEFAULT 'accepted',
      ip_hint TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS connection_messages (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      project_type TEXT NOT NULL, -- 'film', 'music', 'writing', 'photography', 'art', 'exhibition', 'publication', 'research', 'interdisciplinary', 'other'
      status TEXT NOT NULL, -- 'idea', 'planning', 'in progress', 'completed', 'released', 'archived'
      description TEXT,
      cover_image TEXT,
      location TEXT,
      target_date TEXT,
      visibility TEXT DEFAULT 'private',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'owner', 'member', 'viewer'
      contribution_area TEXT,
      joined_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, user_id)
    );

    -- 01. BUILD Tasks
    CREATE TABLE IF NOT EXISTS workspace_tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed'
      priority TEXT DEFAULT 'normal', -- 'urgent', 'normal', 'low'
      assignee_id TEXT,
      deadline TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 03. CAPTURE
    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      capture_type TEXT DEFAULT 'note', -- 'idea', 'thought', 'note', 'reference', 'link', 'fragment'
      tags TEXT, -- JSON array
      is_pinned INTEGER DEFAULT 0,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 04. STUDIO
    CREATE TABLE IF NOT EXISTS studio_assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      asset_type TEXT NOT NULL, -- 'script', 'moodboard', 'audio', 'video', 'reference', 'document'
      file_url TEXT NOT NULL,
      file_size TEXT,
      notes TEXT,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 05. MILESTONES
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed'
      progress INTEGER DEFAULT 0,
      deliverables TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 06. MEMORY
    CREATE TABLE IF NOT EXISTS project_memory (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_type TEXT DEFAULT 'milestone', -- 'milestone', 'change', 'pivot', 'insight', 'archival'
      summary TEXT NOT NULL,
      full_context TEXT,
      recorded_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 07. DECISIONS
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      decision_date TEXT NOT NULL,
      why_context TEXT NOT NULL,
      details TEXT,
      made_by TEXT NOT NULL,
      category TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 08. RIGHTS
    CREATE TABLE IF NOT EXISTS rights (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      contributor_name TEXT NOT NULL,
      user_id TEXT,
      role TEXT NOT NULL,
      ownership_percentage REAL NOT NULL,
      rights_details TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 09. AGREEMENTS
    CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      terms TEXT NOT NULL,
      status TEXT DEFAULT 'draft', -- 'draft', 'open', 'agreed', 'archived'
      participants TEXT, -- JSON array of strings
      signed_by TEXT, -- JSON array of { user_id, name, signed_at }
      effective_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 10. MONEY
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'funding', 'expense', 'payment', 'revenue'
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      category TEXT NOT NULL,
      description TEXT,
      transaction_date TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 11. OUTCOME
    CREATE TABLE IF NOT EXISTS outcomes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      outcome_type TEXT NOT NULL, -- 'completion', 'release', 'publication', 'screening', 'exhibition', 'festival', 'distribution', 'sale', 'press'
      event_date TEXT NOT NULL,
      venue_or_channel TEXT,
      impact_notes TEXT,
      external_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 09. DISTRIBUTION
    CREATE TABLE IF NOT EXISTS distribution_records (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'release', 'festival', 'licensing', 'audience'
      status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'submitted', 'selected', 'active', 'completed'
      target_date TEXT,
      platform_or_partner TEXT,
      territory_or_details TEXT,
      notes TEXT,
      external_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 12. CREDITS
    CREATE TABLE IF NOT EXISTS credits (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      role_title TEXT NOT NULL, -- e.g. 'DIRECTED BY', 'WRITTEN BY', 'SOUND'
      contributor_name TEXT NOT NULL,
      user_id TEXT,
      notes TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'connection', 'project_invite', 'workspace', 'system'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS library_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      author_name TEXT NOT NULL,
      author_id TEXT,
      category TEXT NOT NULL, -- 'essay', 'interview', 'poetry', 'photography', 'research', 'manifesto'
      content TEXT NOT NULL,
      reading_time TEXT,
      cover_image TEXT,
      tags TEXT, -- JSON array
      published_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fund_grants (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      funder_name TEXT NOT NULL,
      grant_amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      deadline TEXT NOT NULL,
      status TEXT DEFAULT 'open', -- 'open', 'reviewing', 'awarded'
      description TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      criteria TEXT, -- JSON
      supported_disciplines TEXT -- JSON
    );

    CREATE TABLE IF NOT EXISTS fund_applications (
      id TEXT PRIMARY KEY,
      grant_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      applicant_id TEXT NOT NULL,
      proposal TEXT NOT NULL,
      requested_amount REAL NOT NULL,
      status TEXT DEFAULT 'submitted', -- 'draft', 'submitted', 'under_review', 'approved', 'declined'
      submitted_at TEXT NOT NULL,
      FOREIGN KEY (grant_id) REFERENCES fund_grants(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Safe incremental migrations for existing databases
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN approval_status TEXT DEFAULT 'approved'");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'verified'");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN verification_submitted_at TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN avatar_public INTEGER DEFAULT 1");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN id_document_url TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN id_document_type TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN id_verification_status TEXT DEFAULT 'unverified'");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN portfolio_url TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN offerings TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN rejection_reason TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN reviewed_at TEXT");
  } catch {}
  try {
    db.exec("ALTER TABLE profiles ADD COLUMN reviewed_by TEXT");
  } catch {}

  // 00. PROJECT Root Migrations
  try { db.exec("ALTER TABLE projects ADD COLUMN statement TEXT"); } catch {}
  try { db.exec("ALTER TABLE projects ADD COLUMN intent TEXT"); } catch {}
  try { db.exec("ALTER TABLE projects ADD COLUMN format TEXT"); } catch {}
  try { db.exec("ALTER TABLE projects ADD COLUMN expected_outputs TEXT"); } catch {}
  try { db.exec("ALTER TABLE projects ADD COLUMN project_owner TEXT"); } catch {}

  // 01. CREW Migrations (Separating Role & Contribution)
  try { db.exec("ALTER TABLE project_members ADD COLUMN project_role TEXT"); } catch {}
  try { db.exec("ALTER TABLE project_members ADD COLUMN contribution TEXT"); } catch {}

  // 02. RIGHTS Ledger Migrations
  try { db.exec("ALTER TABLE rights ADD COLUMN asset_name TEXT DEFAULT 'Project IP'"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN asset_type TEXT DEFAULT 'Creative Asset'"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN permissions TEXT"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN territory TEXT DEFAULT 'Worldwide'"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN duration TEXT DEFAULT 'Perpetual'"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN exclusivity TEXT DEFAULT 'non-exclusive'"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN restrictions TEXT"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN approval_requirements TEXT"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN revenue_splits TEXT"); } catch {}
  try { db.exec("ALTER TABLE rights ADD COLUMN status TEXT DEFAULT 'active'"); } catch {}

  // 08. MONEY Waterfall & Recoupment Migrations
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN is_approved INTEGER DEFAULT 1"); } catch {}
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN is_recoupable INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN recouped_amount REAL DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN deduction_amount REAL DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN recipient_name TEXT"); } catch {}
  try { db.exec("ALTER TABLE financial_transactions ADD COLUMN status TEXT DEFAULT 'approved'"); } catch {}

  // 09. DISTRIBUTION Rights Cross-Check Migrations
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN asset_id TEXT"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN licensee TEXT"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN duration TEXT"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN fee REAL DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN exclusivity TEXT DEFAULT 'non-exclusive'"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN approval_status TEXT DEFAULT 'approved'"); } catch {}
  try { db.exec("ALTER TABLE distribution_records ADD COLUMN agreement_ref TEXT"); } catch {}

  // 06. CAPTURE Conversion Migrations
  try { db.exec("ALTER TABLE captures ADD COLUMN converted_to TEXT"); } catch {}
  try { db.exec("ALTER TABLE captures ADD COLUMN converted_id TEXT"); } catch {}

  // 07. MILESTONES Approvals & Responsibles Migrations
  try { db.exec("ALTER TABLE milestones ADD COLUMN responsible_person TEXT"); } catch {}
  try { db.exec("ALTER TABLE milestones ADD COLUMN approval_state TEXT"); } catch {}

  // In production database, purge all fake demo data so only real registered users & projects exist
  if (!isTestRun) {
    try {
      db.exec("DELETE FROM users WHERE id IN ('u-maya', 'u-julian', 'u-soraya', 'u-elena', 'u-tariq', 'u-theo', 'u-arjun', 'u-sara', 'u-david', 'u-zeinab') OR email LIKE '%@windervale.art'");
      db.exec("DELETE FROM projects WHERE id IN ('proj-dissolve', 'proj-resonance', 'proj-nocturne') OR id LIKE 'proj-%'");
      db.exec("UPDATE profiles SET avatar_url = NULL WHERE avatar_url LIKE '%unsplash%'");
      db.exec("UPDATE projects SET cover_image = NULL WHERE cover_image LIKE '%unsplash%'");
    } catch (e) {
      console.error('Error cleaning demo fixtures:', e);
    }
  }

  seedData();
}

function seedData() {
  // Check if legal documents exist
  const existingDocs = db.prepare('SELECT count(*) as count FROM legal_documents').get() as { count: number };
  if (existingDocs.count === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO legal_documents (id, doc_type, version, title, content, effective_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertDoc.run(
      'doc-terms-1',
      'terms',
      '1.0',
      'Windervale Terms of Service',
      '# Windervale Terms of Service\n\n**Version 1.0  -  Effective September 2026**\n\nWindervale is an autonomous operating environment built for independent and underrepresented creators. By entering, creating, or collaborating on Windervale, you agree to treat collaborations with integrity.\n\n### 1. Creative Autonomy\nYou retain all rights, title, and ownership of original works created by you. Windervale claims no intellectual property rights over user creations.\n\n### 2. Collaboration and Project Integrity\nProject agreements and rights records created in Windervale serve as structured documentation of creative consensus. While designed to foster transparency, they do not replace formal legal counsel where jurisdictional registration is required.\n\n### 3. Conduct & Mutual Respect\nHarassment, exploitation, wage theft, uncredited appropriation, and bad-faith disruption are strictly prohibited.\n\n### 4. Account Termination\nYou may delete your account and associated data at any time.',
      '2026-09-01'
    );

    insertDoc.run(
      'doc-privacy-1',
      'privacy',
      '1.0',
      'Windervale Privacy Policy',
      '# Windervale Privacy Policy\n\n**Version 1.0  -  Effective September 2026**\n\nWe respect the confidentiality of the creative process.\n\n### 1. Data Collection\nWe collect only information essential to project operation and creative discovery: your account credentials, creative dossier, explicit project collaborations, and communication records.\n\n### 2. Private Workspaces\nWorkspace files, decision logs, financial records, and scratchpad captures are restricted strictly to authorized project members. We do not sell, scrape, or index your private project workspaces.\n\n### 3. Human Map Geolocation\nYour location coordinates on the Human Map are generalized to preserve privacy and can be disabled or modified in your Privacy Settings at any time.',
      '2026-09-01'
    );

    insertDoc.run(
      'doc-guidelines-1',
      'guidelines',
      '1.0',
      'Windervale Community Guidelines',
      '# Windervale Community Guidelines\n\n**Version 1.0  -  Effective September 2026**\n\nWindervale is governed by the ethos: **Find people worth making things with.**\n\n- **Credit Honestly**: Document every contribution accurately in the project credits.\n- **Establish Rights Early**: Use the Rights and Agreement modules before production starts.\n- **Honour Agreements**: Adhere to shared timelines and financial commitments.\n- **Protect Creative Vulnerability**: Scratchpads and works-in-progress are fragile. Respect the safety of private workspaces.',
      '2026-09-01'
    );
  }

  // Fixtures are only loaded when explicitly running automated tests
  if (isTestRun) {
    seedTestFixtures();
  }
}

export function seedTestFixtures() {
  // Check if test users exist
  const existingUsers = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('windervale2026', salt);
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProfile = db.prepare(`
      INSERT INTO profiles (
        user_id, display_name, handle, avatar_url, location, country,
        latitude, longitude, bio, disciplines, roles_list, practices,
        interests, selected_works, external_links, availability,
        collaboration_interests, visibility, location_visibility, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAcceptance = db.prepare(`
      INSERT INTO legal_acceptances (id, user_id, doc_type, doc_version, accepted_at, status, ip_hint)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Maya Rao (Lead Filmmaker & Director)
    insertUser.run('u-maya', 'maya@windervale.art', hash, 'Maya Rao', 'creative', 1, now, now);
    insertProfile.run(
      'u-maya',
      'Maya Rao',
      'mayarao',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'Mumbai / Berlin',
      'India',
      19.0760,
      72.8777,
      'Director and moving-image artist investigating post-industrial spaces, oral histories, and celluloid memory.',
      JSON.stringify(['Filmmaker', 'Director', 'Visual Artist']),
      JSON.stringify(['Director', 'Cinematographer', 'Writer']),
      JSON.stringify(['16mm Film', 'Observational Documentary', 'Archival Research']),
      JSON.stringify(['Slow Cinema', 'Maritime Histories', 'Analogue Grain', 'Sound Design']),
      JSON.stringify([
        { title: 'The Tide Recedes (16mm)', year: '2025', role: 'Director / Editor', description: 'Screened at Oberhausen & Yamagata.', link: 'https://vimeo.com' },
        { title: 'Chamber of Shadows', year: '2023', role: 'Director', description: 'Two-channel video installation at Kochi-Muziris Biennale.', link: 'https://vimeo.com' }
      ]),
      JSON.stringify([
        { platform: 'Portfolio', url: 'https://mayarao.studio' },
        { platform: 'Vimeo', url: 'https://vimeo.com/mayarao' }
      ]),
      'Available for projects',
      'Seeking analogue sound designers and film score composers for a docu-fiction hybrid feature.',
      'public',
      1,
      now
    );
    insertAcceptance.run('acc-1', 'u-maya', 'terms', '1.0', now, 'accepted', '127.0.0.1');
    insertAcceptance.run('acc-2', 'u-maya', 'privacy', '1.0', now, 'accepted', '127.0.0.1');
    insertAcceptance.run('acc-3', 'u-maya', 'guidelines', '1.0', now, 'accepted', '127.0.0.1');

    // 2. Arjun Mehta (Sound Designer & Electronic Musician)
    insertUser.run('u-arjun', 'arjun@windervale.art', hash, 'Arjun Mehta', 'creative', 1, now, now);
    insertProfile.run(
      'u-arjun',
      'Arjun Mehta',
      'arjun_audio',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'Bangalore',
      'India',
      12.9716,
      77.5946,
      'Electroacoustic composer, field recordist, and foley architect. Building tactile soundscapes from contact microphones and tape loops.',
      JSON.stringify(['Musician', 'Sound Artist', 'Producer']),
      JSON.stringify(['Sound Designer', 'Composer', 'Foley Artist']),
      JSON.stringify(['Field Recording', 'Modular Synthesis', 'Reel-to-Reel Tape']),
      JSON.stringify(['Acoustic Ecology', 'Concrete Poetry', 'Sub-bass Frequencies']),
      JSON.stringify([
        { title: 'Hydrophonic Currents', year: '2025', role: 'Composer', description: 'Submerged field recordings published on Subtext.', link: 'https://bandcamp.com' },
        { title: 'Echoes of the Mill', year: '2024', role: 'Sound Designer', description: 'Awarded Best Sound at Mumbai Film Festival.', link: 'https://bandcamp.com' }
      ]),
      JSON.stringify([
        { platform: 'Bandcamp', url: 'https://arjunmehta.bandcamp.com' }
      ]),
      'Available for projects',
      'Eager to collaborate with experimental cinematographers and theatre directors.',
      'public',
      1,
      now
    );
    insertAcceptance.run('acc-4', 'u-arjun', 'terms', '1.0', now, 'accepted', '127.0.0.1');
    insertAcceptance.run('acc-5', 'u-arjun', 'privacy', '1.0', now, 'accepted', '127.0.0.1');
    insertAcceptance.run('acc-6', 'u-arjun', 'guidelines', '1.0', now, 'accepted', '127.0.0.1');

    // 3. Sara Khan (Cinematographer & Photographer)
    insertUser.run('u-sara', 'sara@windervale.art', hash, 'Sara Khan', 'creative', 1, now, now);
    insertProfile.run(
      'u-sara',
      'Sara Khan',
      'sarakhan_dp',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      'Delhi / London',
      'India',
      28.6139,
      77.2090,
      'Cinematographer shooting narrative feature films and medium-format photo essays exploring borderlands, migration, and quiet moments.',
      JSON.stringify(['Photographer', 'Filmmaker', 'Editor']),
      JSON.stringify(['Director of Photography', 'Colorist', 'Photojournalist']),
      JSON.stringify(['35mm Anamorphic', 'Natural Light', 'Darkroom Printing']),
      JSON.stringify(['Post-Colonial Architecture', 'Tectonic Shadows', 'Slow Movement']),
      JSON.stringify([
        { title: 'Dust & Dawn', year: '2025', role: 'Cinematographer', description: 'Premiered in Un Certain Regard.', link: 'https://sarakhan.work' }
      ]),
      JSON.stringify([
        { platform: 'Website', url: 'https://sarakhan.work' }
      ]),
      'Available for projects',
      'Looking for intimate poetic scripts with strong visual rhythm.',
      'public',
      1,
      now
    );

    // 4. Elena Rostova (Typographer & Independent Publisher)
    insertUser.run('u-elena', 'elena@windervale.art', hash, 'Elena Rostova', 'creative', 1, now, now);
    insertProfile.run(
      'u-elena',
      'Elena Rostova',
      'elena_type',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      'Tbilisi',
      'Georgia',
      41.7151,
      44.8271,
      'Type designer, zine publisher, and bookmaker running an underground Risograph press for poetry and political pamphlets.',
      JSON.stringify(['Designer', 'Writer', 'Curator']),
      JSON.stringify(['Type Designer', 'Editorial Art Director', 'Printmaker']),
      JSON.stringify(['Risograph', 'Letterpress', 'Custom Font Engineering']),
      JSON.stringify(['Constructivism', 'Underground Zines', 'Brutalist Typography']),
      JSON.stringify([
        { title: 'Cyrillic Fractures', year: '2024', role: 'Type Designer', description: 'Specimen book & variable font release.', link: 'https://type.ge' }
      ]),
      JSON.stringify([
        { platform: 'Press', url: 'https://coldpress.ge' }
      ]),
      'Available for projects',
      'Seeking essays on independent cinema and cassette culture for an upcoming publication.',
      'public',
      1,
      now
    );

    // 5. David Chen (Visual Artist & Spatial Scenographer)
    insertUser.run('u-david', 'david@windervale.art', hash, 'David Chen', 'creative', 1, now, now);
    insertProfile.run(
      'u-david',
      'David Chen',
      'davidchen_art',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      'Tokyo / Taipei',
      'Japan',
      35.6762,
      139.6503,
      'Sculptor and projection artist examining the decay of digital physical media and obsolete hardware.',
      JSON.stringify(['Artist', 'Researcher', 'Curator']),
      JSON.stringify(['Spatial Designer', 'Installation Artist']),
      JSON.stringify(['CRT Monitors', 'Steel Fabrication', 'Microcontroller Art']),
      JSON.stringify(['Media Archaeology', 'Cybernetic Philosophy']),
      JSON.stringify([
        { title: 'The Dead Channel', year: '2025', role: 'Artist', description: 'Museum of Contemporary Art Tokyo.', link: 'https://davidchen.jp' }
      ]),
      JSON.stringify([
        { platform: 'Archive', url: 'https://davidchen.jp' }
      ]),
      'Limited',
      'Interested in kinetic lighting for sound performances.',
      'public',
      1,
      now
    );

    // 6. Zeinab Al-Husseini (Documentary Poet & Playwright)
    insertUser.run('u-zeinab', 'zeinab@windervale.art', hash, 'Zeinab Al-Husseini', 'creative', 1, now, now);
    insertProfile.run(
      'u-zeinab',
      'Zeinab Al-Husseini',
      'zeinab_poet',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      'Beirut',
      'Lebanon',
      33.8938,
      35.5018,
      'Writer crafting scripts and prose from community interviews, displaced memories, and sonic archives.',
      JSON.stringify(['Writer', 'Researcher']),
      JSON.stringify(['Screenwriter', 'Dramaturg', 'Poet']),
      JSON.stringify(['Oral History', 'Bilingual Verse', 'Dramaturgy']),
      JSON.stringify(['Archival Ephemera', 'Translation Studies']),
      JSON.stringify([
        { title: 'Salt & Concrete', year: '2024', role: 'Author', description: 'Poetry collection on post-war port districts.', link: 'https://zeinab.art' }
      ]),
      JSON.stringify([
        { platform: 'Works', url: 'https://zeinab.art' }
      ]),
      'Available for projects',
      'Open to co-writing fiction feature films and narrative podcasts.',
      'public',
      1,
      now
    );

    // Sample Project: THE DISSOLVE
    const projId = 'proj-dissolve';
    db.prepare(`
      INSERT INTO projects (
        id, title, project_type, status, description, cover_image,
        location, target_date, visibility, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projId,
      'THE DISSOLVE',
      'film',
      'in progress',
      'A 16mm experimental narrative following three estranged archivists uncovering bootleg sound recordings of a lost radio transmission in the desert.',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      'Thar Desert / Mumbai',
      '2026-12-15',
      'private',
      'u-maya',
      now,
      now
    );

    // Project Members
    db.prepare(`INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'pm-1', projId, 'u-maya', 'owner', 'Direction & Screenplay', now
    );
    db.prepare(`INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'pm-2', projId, 'u-arjun', 'member', 'Sound Design & Score', now
    );
    db.prepare(`INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'pm-3', projId, 'u-sara', 'member', 'Cinematography & Lighting', now
    );

    // 01. BUILD Tasks
    const insertTask = db.prepare(`
      INSERT INTO workspace_tasks (id, project_id, title, description, status, priority, assignee_id, deadline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTask.run('t-1', projId, 'Finish screenplay final revisions', 'Lock down dialogue for scene 14 (desert bunker confrontation).', 'in_progress', 'urgent', 'u-maya', '2026-09-30', now, now);
    insertTask.run('t-2', projId, 'Review rough cut of reel 02', 'Analyze pacing and grain consistency between reels 1 and 2.', 'todo', 'urgent', 'u-maya', '2026-10-08', now, now);
    insertTask.run('t-3', projId, 'Source hydrophone & wind baffle kit', 'Acquire contact microphones for high-wind dune acoustic tracking.', 'in_progress', 'normal', 'u-arjun', '2026-10-05', now, now);
    insertTask.run('t-4', projId, 'Test Kodak 500T push-processing', 'Shoot test strip at ISO 1000 in dusk ambient shadows.', 'completed', 'normal', 'u-sara', '2026-09-12', now, now);
    insertTask.run('t-5', projId, 'Scout abandoned salt pan radar station', 'Verify access permits and sun angle at 17:30.', 'completed', 'normal', 'u-maya', '2026-09-08', now, now);

    // 03. CAPTURES
    const insertCapture = db.prepare(`
      INSERT INTO captures (id, project_id, title, content, capture_type, tags, is_pinned, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCapture.run('c-1', projId, 'Radio static cadence', 'The static between frequencies should not feel like white noise. It should feel like weather. Wind blowing through copper coils.', 'thought', JSON.stringify(['sound', 'mood', 'atmosphere']), 1, 'u-arjun', now);
    insertCapture.run('c-2', projId, 'Reference: Chris Marker’s Sans Soleil', 'Re-watch the Tokyo cat temple sequence. The narration is not exposition; it is a letter sent across time.', 'reference', JSON.stringify(['cinema', 'narrative', 'montage']), 1, 'u-maya', now);
    insertCapture.run('c-3', projId, 'Colour note: Rust on sand', 'Avoid the typical warm golden desert hue. The Thar at twilight is cold violet and burnt zinc.', 'note', JSON.stringify(['color', 'palette']), 0, 'u-sara', now);
    insertCapture.run('c-4', projId, 'Dialogue fragment for Elder Archivist', '“We did not record the music because it was beautiful. We recorded it because nobody else would believe the silence afterward.”', 'fragment', JSON.stringify(['dialogue', 'script']), 1, 'u-maya', now);

    // 04. STUDIO
    const insertAsset = db.prepare(`
      INSERT INTO studio_assets (id, project_id, name, asset_type, file_url, file_size, notes, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAsset.run('sa-1', projId, 'The_Dissolve_Treatment_Rev4.pdf', 'script', 'https://windervale.art/docs/treatment_v4.pdf', '2.4 MB', 'Contains complete 18-scene breakdown and visual tone cards.', 'u-maya', now);
    insertAsset.run('sa-2', projId, 'Dune_Wind_TapeLoop_Test01.wav', 'audio', 'https://windervale.art/audio/wind_loop.wav', '18.1 MB', 'Field recording on Nagra 4.2 with custom tape delay.', 'u-arjun', now);
    insertAsset.run('sa-3', projId, 'Kodak_500T_Grain_Lookbook.pdf', 'moodboard', 'https://windervale.art/docs/lookbook.pdf', '8.9 MB', 'Exposure ratios for night scenes with tungsten lamps.', 'u-sara', now);

    // 05. MILESTONES
    const insertMilestone = db.prepare(`
      INSERT INTO milestones (id, project_id, title, due_date, status, progress, deliverables, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMilestone.run('m-1', projId, 'Screenplay & Shotlist Lock', '2026-09-30', 'in_progress', 85, 'Final draft screenplay, floor plans, lens chart', now);
    insertMilestone.run('m-2', projId, 'Principal Photography (Thar Block)', '2026-11-15', 'upcoming', 15, '12 shooting days on 16mm, raw sound stems on DAT', now);
    insertMilestone.run('m-3', projId, 'Lab Processing & Telecine 4K Scan', '2026-11-28', 'upcoming', 0, '16mm negative developed at Film Lab Mumbai', now);
    insertMilestone.run('m-4', projId, 'Sound Design & Final Mix', '2026-12-10', 'upcoming', 0, '5.1 theatrical surround mix & stereo master', now);

    // 06. MEMORY
    const insertMemory = db.prepare(`
      INSERT INTO project_memory (id, project_id, title, event_date, event_type, summary, full_context, recorded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMemory.run('mem-1', projId, 'Project Genesis at Subtext Cafe', '2026-08-14', 'insight', 'Maya and Arjun conceived the concept after listening to 1970s unreleased desert folk reel tapes.', 'Initial discussion centered around the fear of physical audio degradation and the erasure of anonymous voices.', 'u-maya', now);
    insertMemory.run('mem-2', projId, 'Format Pivot from Digital to 16mm', '2026-09-02', 'pivot', 'Decided against Arri Alexa Mini in favor of Arriflex 16SR3.', 'Digital sensor was too clean; the desert dust and heat needed to imprint physically onto the celluloid emulsion.', 'u-sara', now);
    insertMemory.run('mem-3', projId, 'First Sound Stems Recorded in Rajasthan', '2026-09-10', 'milestone', 'Arjun captured 6 hours of desert wind through abandoned telegraph lines.', 'The resonant harmonic frequencies will form the core musical theme of the film score.', 'u-arjun', now);

    // 07. DECISIONS
    const insertDecision = db.prepare(`
      INSERT INTO decisions (id, project_id, title, decision_date, why_context, details, made_by, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDecision.run('dec-1', projId, 'Keep Final Color Grade Monochrome with Violet Undertones', '2026-09-14', 'The visual language should feel archival, tactile, and non-commercial.', 'Agreed unanimously between Maya and Sara after review of test film strips.', 'Maya Rao & Sara Khan', 'Cinematography', now);
    insertDecision.run('dec-2', projId, 'No Synthetic Foley for Wind Elements', '2026-09-08', 'Electronic simulations lack the micro-transients of real airborne sand.', 'All wind sounds will be purely acoustic recordings sourced directly from the Thar salt flats.', 'Arjun Mehta', 'Audio', now);

    // 08. RIGHTS
    const insertRight = db.prepare(`
      INSERT INTO rights (id, project_id, contributor_name, user_id, role, ownership_percentage, rights_details, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertRight.run('r-1', projId, 'Maya Rao', 'u-maya', 'Director / Writer', 45.0, 'Primary author of original screenplay and directorial vision. 45% copyright share.', 'Includes festival prize distribution.', now);
    insertRight.run('r-2', projId, 'Arjun Mehta', 'u-arjun', 'Sound Designer & Composer', 25.0, 'Full publishing rights to original film score + 25% project master share.', 'Score soundtrack release split equally.', now);
    insertRight.run('r-3', projId, 'Sara Khan', 'u-sara', 'Director of Photography', 20.0, 'Co-ownership of visual master & exclusive exhibition stills rights. 20% share.', 'Stills book rights preserved.', now);
    insertRight.run('r-4', projId, 'Windervale Community Co-op', null, 'Preservation & Archival Pool', 10.0, 'Reserved 10% reserve for future film preservation and lab scan maintenance.', 'Autonomous preservation endowment.', now);

    // 09. AGREEMENTS
    const insertAgreement = db.prepare(`
      INSERT INTO agreements (id, project_id, title, terms, status, participants, signed_by, effective_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAgreement.run(
      'agr-1',
      projId,
      'Core Creative & Rights Memorandum of Understanding',
      '1. CREDIT ATTRIBUTION: All three collaborators shall receive equal-tier prominent single-card title cards in opening and closing credits.\n2. ARCHIVAL PRINTS: Two master 16mm prints shall be struck: one for international touring, one for permanent archival preservation.\n3. OPEN RELEASE: Following the 12-month festival circuit, the film will be hosted openly on Windervale Library with free public access.',
      'agreed',
      JSON.stringify(['Maya Rao (Director)', 'Arjun Mehta (Sound)', 'Sara Khan (Cinematography)']),
      JSON.stringify([
        { user_id: 'u-maya', name: 'Maya Rao', signed_at: '2026-09-05' },
        { user_id: 'u-arjun', name: 'Arjun Mehta', signed_at: '2026-09-06' },
        { user_id: 'u-sara', name: 'Sara Khan', signed_at: '2026-09-06' }
      ]),
      '2026-09-06',
      now
    );

    // 10. MONEY
    const insertMoney = db.prepare(`
      INSERT INTO financial_transactions (id, project_id, type, amount, currency, category, description, transaction_date, recorded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMoney.run('mny-1', projId, 'funding', 250000, 'INR', 'Grant', 'Windervale Independent Cinema Seed Grant', '2026-08-20', 'u-maya', now);
    insertMoney.run('mny-2', projId, 'funding', 150000, 'INR', 'Contribution', 'Private Archival Patron Support', '2026-09-01', 'u-maya', now);
    insertMoney.run('mny-3', projId, 'expense', 68000, 'INR', 'Stock', '12 rolls of 16mm Kodak Vision3 500T & 250D', '2026-09-04', 'u-sara', now);
    insertMoney.run('mny-4', projId, 'expense', 32500, 'INR', 'Equipment', 'Arriflex 16SR3 camera package rental deposit', '2026-09-08', 'u-sara', now);
    insertMoney.run('mny-5', projId, 'expense', 18400, 'INR', 'Sound', 'Nagra field recorder service and tape cartridges', '2026-09-10', 'u-arjun', now);

    // 11. OUTCOME
    const insertOutcome = db.prepare(`
      INSERT INTO outcomes (id, project_id, title, outcome_type, event_date, venue_or_channel, impact_notes, external_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertOutcome.run('out-1', projId, 'Work-in-Progress Screening at CineArchive', 'screening', '2026-10-18', 'Kala Ghoda Arts Center, Mumbai', 'Curated closed-room preview for 40 independent filmmakers and film scholars.', 'https://cinearchive.org', now);
    insertOutcome.run('out-2', projId, 'Rotterdam Tiger Short Competition Entry', 'festival', '2027-01-25', 'International Film Festival Rotterdam', 'Targeted international world premiere submission.', 'https://iffr.com', now);

    // 12. CREDITS
    const insertCredit = db.prepare(`
      INSERT INTO credits (id, project_id, role_title, contributor_name, user_id, notes, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCredit.run('crd-1', projId, 'DIRECTED & WRITTEN BY', 'Maya Rao', 'u-maya', 'Original Story and Screenplay', 1, now);
    insertCredit.run('crd-2', projId, 'ORIGINAL SCORE & SOUND DESIGN', 'Arjun Mehta', 'u-arjun', 'Field recordings & tape modulation', 2, now);
    insertCredit.run('crd-3', projId, 'DIRECTOR OF PHOTOGRAPHY', 'Sara Khan', 'u-sara', 'Shot on Kodak 16mm film', 3, now);
    insertCredit.run('crd-4', projId, 'PRINT TYPOGRAPHY & TITLE CARDS', 'Elena Rostova', 'u-elena', 'Custom handset letterpress titles', 4, now);

    // Project 2: BLACKPRINT ZINE
    const projId2 = 'proj-blackprint';
    db.prepare(`
      INSERT INTO projects (
        id, title, project_type, status, description, cover_image,
        location, target_date, visibility, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projId2,
      'BLACKPRINT ISSUE 04: TAPE NOISE',
      'publication',
      'planning',
      'A 64-page Risograph publication exploring underground cassette duplication culture, bootleg aesthetics, and magnetic tape decay.',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      'Tbilisi / Berlin',
      '2026-11-30',
      'public',
      'u-elena',
      now,
      now
    );
    db.prepare(`INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'pm-b1', projId2, 'u-elena', 'owner', 'Editor-in-Chief & Risograph Production', now
    );
    db.prepare(`INSERT INTO project_members (id, project_id, user_id, role, contribution_area, joined_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      'pm-b2', projId2, 'u-arjun', 'member', 'Cassette Archive Essays', now
    );

    // Library Articles
    const insertLibrary = db.prepare(`
      INSERT INTO library_posts (id, title, subtitle, author_name, author_id, category, content, reading_time, cover_image, tags, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLibrary.run(
      'lib-1',
      'The Ethics of Grain: Why Celluloid Still Refuses to Die',
      'A reflection on physical medium permanence, dust artifacts, and why digital sensors cannot imitate human touch.',
      'Maya Rao',
      'u-maya',
      'essay',
      'We live in a culture obsessed with sharpening. Every smartphone sensor claims to eliminate darkness, smoothing skin, erasing shadow noise, interpolating missing details through mathematical averages.\n\nYet grain is not noise. Grain is the physical imprint of silver halide crystals reacting to photon strikes. When you project a 16mm print, you are not looking at a stream of raster lines. You are looking at miniature constellations of metal floating in gelatin.\n\nIn our studio in Mumbai, the film arrives warm from the lab. There is a specific smell - acetic acid, damp paper, warm iron. Every cut is irrevocable. If you cut the negative two frames too early, you cannot press Command-Z.\n\nThis irrevocability is where respect begins. It forces the director to watch the human being in front of the camera, rather than looking at an iPad monitor fifty feet away.',
      '6 min read',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Cinema', '16mm', 'Materiality', 'Analogue']),
      '2026-09-02'
    );

    insertLibrary.run(
      'lib-2',
      'Sub-Bass as Architecture: Notes on Low Frequencies in Industrial Concrete',
      'How physical acoustic waves alter human emotional perception in abandoned spaces.',
      'Arjun Mehta',
      'u-arjun',
      'research',
      'Sound above 1,000 Hz travels like an arrow. You can trace its direction; you can shield your ear with your hand. But sound below 60 Hz does not travel like an arrow - it behaves like water.\n\nWhen we placed contact microphones on the reinforced concrete pillars of the defunct cotton mills in Parel, the meters showed vibration even when the street outside was silent. The earth itself was reverberating from train lines two kilometers away.\n\nLow frequencies vibrate the sternum before they reach the eardrum. They evoke primal somatic memory. In our upcoming collaboration, we treat sub-bass not as an aggressive club tool, but as architectural scaffolding.',
      '8 min read',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Sound', 'Acoustics', 'Concrete', 'Architecture']),
      '2026-08-24'
    );

    insertLibrary.run(
      'lib-3',
      'The Underground Press Manifesto: Type at the Speed of Paper',
      'Why we print on 80gsm newsprint when screens are infinite.',
      'Elena Rostova',
      'u-elena',
      'manifesto',
      'A screen belongs to whoever controls the browser, the operating system, the battery, the server farm in Virginia.\n\nA printed pamphlet in your coat pocket belongs to you.\n\nWhen we produce zines in Tbilisi, we choose high-density soy inks that bleed slightly into the wood pulp. We choose fonts with sharp ink traps that catch ink like rain in a stone basin. A printed page can be handed across a border, folded into a passport, passed under a desk, or hidden beneath floorboards for thirty years.\n\nDo not surrender your words to clouds you will never own.',
      '4 min read',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Typography', 'Print', 'Zines', 'Publishing']),
      '2026-08-10'
    );

    // Fund Grants
    const insertGrant = db.prepare(`
      INSERT INTO fund_grants (id, title, funder_name, grant_amount, currency, deadline, status, description, eligibility, criteria, supported_disciplines)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertGrant.run(
      'fnd-1',
      'Analogue Arts & Moving-Image Fellowship 2026',
      'Windervale Creative Endowment',
      200000,
      'INR',
      '2026-11-15',
      'open',
      'Direct, non-dilutive grant supporting independent filmmakers and photographers working with physical film, photographic darkrooms, or tactile print processes.',
      'Open to independent creatives globally. Priority given to underrepresented voices and projects without commercial studio backing.',
      JSON.stringify(['Demonstrated commitment to physical materials', 'Collaborative project agreement established in Windervale', 'Transparent rights sharing breakdown']),
      JSON.stringify(['Filmmaker', 'Photographer', 'Artist'])
    );

    insertGrant.run(
      'fnd-2',
      'Acoustic Ecology & Field Sound Grant',
      'Subtext Sound Research Trust',
      120000,
      'INR',
      '2026-10-31',
      'open',
      'Grants for composers, sound artists, and researchers documenting vanishing acoustic landscapes, oral traditions, and bio-acoustic frequencies.',
      'Open to sound artists, musicians, and audio researchers.',
      JSON.stringify(['Clear field recording methodology', 'Archival preservation plan', 'Fair artist fee allocation']),
      JSON.stringify(['Musician', 'Sound Artist', 'Researcher'])
    );

    // Notifications
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertNotif.run('notif-1', 'u-maya', 'workspace', 'Task Completed', 'Sara Khan completed the Kodak 500T push-processing test.', '/workspace/proj-dissolve?tool=build', 0, now);
    insertNotif.run('notif-2', 'u-maya', 'connection', 'New Connection', 'David Chen connected with your creative profile.', '/profile/u-david', 0, now);
    insertNotif.run('notif-3', 'u-maya', 'workspace', 'Decision Recorded', 'New decision logged: Keep Final Color Grade Monochrome.', '/workspace/proj-dissolve?tool=decisions', 1, now);
  }
}
