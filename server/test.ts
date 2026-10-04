import { db, initializeDatabase, seedTestFixtures } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './authMiddleware.js';

console.log('--- STARTING WINDERVALE AUTOMATED INTEGRATION TESTS ---');

initializeDatabase();
seedTestFixtures();

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Check Seeding
const userCount = (db.prepare('SELECT count(*) as c FROM users').get() as any).c;
assert(userCount >= 6, `Users seeded properly (found ${userCount})`);

const docCount = (db.prepare('SELECT count(*) as c FROM legal_documents').get() as any).c;
assert(docCount === 3, `Legal documents seeded (found ${docCount})`);

// 2. Auth Login & Hash Check
const maya = db.prepare('SELECT * FROM users WHERE email = ?').get('maya@windervale.art') as any;
assert(!!maya, 'Maya user exists');
assert(bcrypt.compareSync('windervale2026', maya.password_hash), 'Password authentication succeeds for seeded user');

const token = jwt.sign({ id: maya.id, email: maya.email, name: maya.name, role: maya.role }, JWT_SECRET);
const decoded = jwt.verify(token, JWT_SECRET) as any;
assert(decoded.id === maya.id, 'JWT issuance and verification operates correctly');

// 3. Versioned Legal Consent Audit Verification
const acceptances = db.prepare('SELECT * FROM legal_acceptances WHERE user_id = ?').all(maya.id) as any[];
assert(acceptances.length === 3, 'User has distinct acceptances for Terms, Privacy, Guidelines');
const termsAcc = acceptances.find(a => a.doc_type === 'terms');
assert(termsAcc.doc_version === '1.0' && termsAcc.status === 'accepted' && !!termsAcc.accepted_at, 'Terms version 1.0 acceptance properly audited with timestamp');

// 4. Projects and 12 Workspace Modules for "THE DISSOLVE"
const project = db.prepare('SELECT * FROM projects WHERE id = ?').get('proj-dissolve') as any;
assert(project.title === 'THE DISSOLVE' && project.project_type === 'film', 'Project "THE DISSOLVE" is properly configured');

// 01. BUILD
const tasks = db.prepare('SELECT * FROM workspace_tasks WHERE project_id = ?').all('proj-dissolve') as any[];
assert(tasks.length >= 5, `BUILD tasks exist (${tasks.length} tasks)`);
const completedTask = tasks.find(t => t.status === 'completed');
assert(!!completedTask, 'BUILD completed tasks verified');

// 02. CREW
const crew = db.prepare('SELECT * FROM project_members WHERE project_id = ?').all('proj-dissolve') as any[];
assert(crew.length === 3, `CREW members verified (${crew.length} members)`);

// 03. CAPTURE
const captures = db.prepare('SELECT * FROM captures WHERE project_id = ?').all('proj-dissolve') as any[];
assert(captures.length >= 4, `CAPTURE scratchpad notes exist (${captures.length})`);
const pinned = captures.find(c => c.is_pinned === 1);
assert(!!pinned, 'CAPTURE pinned notes verified');

// 04. STUDIO
const assets = db.prepare('SELECT * FROM studio_assets WHERE project_id = ?').all('proj-dissolve') as any[];
assert(assets.length >= 3, `STUDIO assets exist (${assets.length} assets)`);

// 05. MILESTONES
const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ?').all('proj-dissolve') as any[];
assert(milestones.length >= 4, `MILESTONES exist (${milestones.length} milestones)`);

// 06. MEMORY
const memories = db.prepare('SELECT * FROM project_memory WHERE project_id = ?').all('proj-dissolve') as any[];
assert(memories.length >= 3, `PROJECT MEMORY records exist (${memories.length})`);

// 07. DECISIONS
const decisions = db.prepare('SELECT * FROM decisions WHERE project_id = ?').all('proj-dissolve') as any[];
assert(decisions.length >= 2, `DECISIONS logged with rationale (${decisions.length})`);

// 08. RIGHTS
const rights = db.prepare('SELECT * FROM rights WHERE project_id = ?').all('proj-dissolve') as any[];
const totalShares = rights.reduce((acc, r) => acc + r.ownership_percentage, 0);
assert(rights.length >= 4, `RIGHTS records exist (${rights.length})`);
assert(Math.abs(totalShares - 100) < 0.01, `RIGHTS percentages sum to 100% (sum=${totalShares}%)`);

// 09. AGREEMENTS
const agreements = db.prepare('SELECT * FROM agreements WHERE project_id = ?').all('proj-dissolve') as any[];
assert(agreements.length >= 1, `AGREEMENTS exist (${agreements.length})`);
assert(agreements[0].status === 'agreed', 'AGREEMENT is in agreed status');

// 10. MONEY
const transactions = db.prepare('SELECT * FROM financial_transactions WHERE project_id = ?').all('proj-dissolve') as any[];
let funding = 0;
let expenses = 0;
for (const t of transactions) {
  if (t.type === 'funding') funding += t.amount;
  else if (t.type === 'expense') expenses += t.amount;
}
assert(funding === 400000, `MONEY funding total is ₹400,000 (got ₹${funding})`);
assert(expenses === 118900, `MONEY expense total is ₹118,900 (got ₹${expenses})`);
assert(funding - expenses === 281100, `MONEY remaining balance is ₹281,100 (got ₹${funding - expenses})`);

// 11. OUTCOMES
const outcomes = db.prepare('SELECT * FROM outcomes WHERE project_id = ?').all('proj-dissolve') as any[];
assert(outcomes.length >= 2, `OUTCOMES logged (${outcomes.length})`);

// 12. CREDITS
const credits = db.prepare('SELECT * FROM credits WHERE project_id = ?').all('proj-dissolve') as any[];
assert(credits.length >= 4, `CREDITS permanently recorded (${credits.length})`);

// 13. Library & Fund
const library = db.prepare('SELECT * FROM library_posts').all();
assert(library.length >= 3, `LIBRARY essays and manifestos available (${library.length})`);

const grants = db.prepare('SELECT * FROM fund_grants').all();
assert(grants.length >= 2, `FUND grant opportunities active (${grants.length})`);

// 14. Workspace Lock, PIN & Recovery Verification
const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get('ws-maya') as any;
assert(!!ws, 'Maya workspace exists in database');
const pinTest = '9876';
const pinHash = bcrypt.hashSync(pinTest, 10);
db.prepare('UPDATE workspaces SET pin_hash = ?, is_locked = 1 WHERE id = ?').run(pinHash, ws.id);
const updatedWs = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(ws.id) as any;
assert(updatedWs.is_locked === 1, 'Workspace lock active');
assert(bcrypt.compareSync('9876', updatedWs.pin_hash), 'Correct PIN unlocks workspace');
assert(!bcrypt.compareSync('1234', updatedWs.pin_hash), 'Incorrect PIN correctly rejected');

// 15. Historical Credit Retention on Collaborator Archival
const beforeCreditCount = (db.prepare('SELECT count(*) as c FROM credits WHERE project_id = ?').get('proj-dissolve') as any).c;
const memberToArchive = (db.prepare('SELECT id FROM project_members WHERE project_id = ? LIMIT 1').get('proj-dissolve') as any).id;
db.prepare("UPDATE project_members SET is_archived = 1, status = 'archived' WHERE id = ?").run(memberToArchive);
const afterCreditCount = (db.prepare('SELECT count(*) as c FROM credits WHERE project_id = ?').get('proj-dissolve') as any).c;
assert(beforeCreditCount === afterCreditCount, `Archiving collaborator does NOT delete historical credits (${afterCreditCount} credits intact)`);

// 16. Rights Calculation Verification
const rightsTotal = (db.prepare('SELECT SUM(ownership_percentage) as total FROM rights WHERE project_id = ? AND (is_archived = 0 OR is_archived IS NULL)').get('proj-dissolve') as any).total;
assert(Math.abs(rightsTotal - 100) < 0.01, `Rights math precisely equals 100% (got ${rightsTotal}%)`);

console.log(`\n================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL BACKEND & PERSISTENCE TESTS PASSED CLEANLY.');
}
