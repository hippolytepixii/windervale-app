const fs = require('fs');

let serverCode = fs.readFileSync('server/index.ts', 'utf8');

// 1. Add CITY_COORDINATES lookup
const cityCoordsCode = `
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
`;

if (!serverCode.includes('CITY_COORDINATES')) {
  serverCode = serverCode.replace(
    '// -------------------------------------------------------------\n// AUTHENTICATION & SESSIONS',
    cityCoordsCode + '\n// -------------------------------------------------------------\n// AUTHENTICATION & SESSIONS'
  );
}

// 2. Update Registration endpoint to store portfolio_url, offerings, and default to 'pending' approval
const oldRegRegex = /const insertProfile = db\.prepare\([\s\S]*?\);\s*const insertAcceptance/;
const newInsertProfile = `const resolvedCoords = (latitude && longitude)
    ? { lat: Number(latitude), lng: Number(longitude) }
    : resolveCoordinates(location);

  const insertProfile = db.prepare(\`
    INSERT INTO profiles (
      user_id, display_name, handle, avatar_url, location, country,
      latitude, longitude, bio, disciplines, roles_list, practices,
      interests, selected_works, external_links, availability,
      collaboration_interests, visibility, location_visibility,
      avatar_public, id_document_url, id_document_type,
      id_verification_status, verification_status, verification_submitted_at,
      approval_status, portfolio_url, offerings, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 1, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  \`);

  const insertAcceptance`;

serverCode = serverCode.replace(oldRegRegex, newInsertProfile);

// Also update parameters in insertProfile.run
serverCode = serverCode.replace(
  /latitude \|\| 20\.0,\s*longitude \|\| 77\.0,/,
  'resolvedCoords.lat, resolvedCoords.lng,'
);

serverCode = serverCode.replace(
  /isVerifiedId \? now : null,\s*now\s*\);/,
  `isVerifiedId ? now : null, portfolio_url || null, offerings || null, now);`
);

// Accept portfolio_url, offerings in req.body destructuring
serverCode = serverCode.replace(
  'avatar_url, avatar_public, id_document_url, id_document_type',
  'avatar_url, avatar_public, id_document_url, id_document_type, portfolio_url, offerings, collaboration_interests'
);

// 3. Update parseProfile helper
serverCode = serverCode.replace(
  'return {\n    ...p,',
  `return {
    ...p,
    portfolio_url: p?.portfolio_url || null,
    offerings: p?.offerings || null,`
);

// 4. Add Admin Curation Endpoints
const adminEndpoints = `
// -------------------------------------------------------------
// ADMIN CURATION & APPROVALS
// -------------------------------------------------------------

app.get('/api/admin/pending-users', (req: Request, res: Response) => {
  const pending = db.prepare(\`
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
  \`).all();

  return res.json({
    pending: pending.map(parseProfile)
  });
});

app.post('/api/admin/approve-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const now = new Date().toISOString();
  db.prepare(\`
    UPDATE profiles SET
      approval_status = 'approved',
      verification_status = 'verified',
      updated_at = ?
    WHERE user_id = ?
  \`).run(now, userId);

  const notifId = generateId('notif');
  try {
    db.prepare(\`
      INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
      VALUES (?, ?, 'system', 'Profile Approved', 'Your profile has been approved by the Windervale curation team. Welcome to the independent creative network.', '/map', 0, ?)
    \`).run(notifId, userId, now);
  } catch {}

  return res.json({ success: true, message: 'Creative approved successfully' });
});

app.post('/api/admin/reject-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const now = new Date().toISOString();
  db.prepare(\`
    UPDATE profiles SET
      approval_status = 'rejected',
      updated_at = ?
    WHERE user_id = ?
  \`).run(now, userId);

  return res.json({ success: true, message: 'Creative application declined' });
});
`;

if (!serverCode.includes('/api/admin/pending-users')) {
  serverCode = serverCode.replace(
    '// -------------------------------------------------------------\n// CONNECTIONS',
    adminEndpoints + '\n// -------------------------------------------------------------\n// CONNECTIONS'
  );
}

// 5. Replace calculateCompatibility with comprehensive multi-factor engine
const compEngine = `
interface MatchReason {
  category: string;
  score: string;
  detail: string;
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const stopwords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'what', 'can', 'you', 'want', 'offer', 'seeking']);
  return text.toLowerCase()
    .replace(/[^a-z0-9\\s]/g, ' ')
    .split(/\\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function calculateCompatibility(userProfile: any, targetProfile: any): { match_percentage: number; synergy_label: string; match_reasons: MatchReason[] } {
  const userDiscs: string[] = (userProfile?.disciplines || ['Filmmaker']).map((d: string) => String(d).toLowerCase());
  const targetDiscs: string[] = (targetProfile?.disciplines || ['Sound Artist']).map((d: string) => String(d).toLowerCase());

  const userOffer: string = String(userProfile?.offerings || '').toLowerCase();
  const targetOffer: string = String(targetProfile?.offerings || '').toLowerCase();

  const userSeek: string = String(userProfile?.collaboration_interests || '').toLowerCase();
  const targetSeek: string = String(targetProfile?.collaboration_interests || '').toLowerCase();

  const userCity: string = String(userProfile?.location || '').toLowerCase();
  const targetCity: string = String(targetProfile?.location || '').toLowerCase();
  const userCountry: string = String(userProfile?.country || '').toLowerCase();
  const targetCountry: string = String(targetProfile?.country || '').toLowerCase();

  const reasons: MatchReason[] = [];
  let totalScore = 0;

  // 1. DISCIPLINE SYNERGY (Up to 35%)
  const crossSynergies: Record<string, string[]> = {
    'filmmaker': ['sound artist', 'musician', 'writer', 'editor', 'director', 'cinematographer'],
    'director': ['cinematographer', 'sound artist', 'writer', 'editor', 'filmmaker'],
    'cinematographer': ['director', 'filmmaker', 'editor', 'photographer'],
    'musician': ['filmmaker', 'sound artist', 'visual artist', 'director'],
    'sound artist': ['filmmaker', 'director', 'musician', 'visual artist'],
    'writer': ['director', 'filmmaker', 'visual artist'],
    'visual artist': ['writer', 'sound artist', 'designer', 'filmmaker'],
    'photographer': ['filmmaker', 'director', 'designer'],
    'editor': ['director', 'filmmaker', 'sound artist']
  };

  let disciplineScore = 0;
  let disciplineDetail = '';
  let hasCross = false;

  for (const ud of userDiscs) {
    const complementaries = crossSynergies[ud] || [];
    for (const td of targetDiscs) {
      if (complementaries.some(c => td.includes(c) || c.includes(td))) {
        disciplineScore = 32;
        disciplineDetail = \`Complementary Crafts: \${capitalize(ud)} × \${capitalize(td)}\`;
        hasCross = true;
        break;
      }
    }
    if (hasCross) break;
  }

  if (!hasCross) {
    const shared = userDiscs.filter(ud => targetDiscs.some(td => td.includes(ud) || ud.includes(td)));
    if (shared.length > 0) {
      disciplineScore = 24;
      disciplineDetail = \`Shared Medium: Both practice \${shared.map(capitalize).join(', ')}\`;
    } else {
      disciplineScore = 12;
      disciplineDetail = \`Cross-Disciplinary Dialogue: \${capitalize(userDiscs[0] || 'Creative')} & \${capitalize(targetDiscs[0] || 'Creative')}\`;
    }
  }

  totalScore += disciplineScore;
  reasons.push({
    category: 'Discipline Synergy',
    score: \`+\${disciplineScore}%\`,
    detail: disciplineDetail
  });

  // 2. WHAT THEY OFFER VS WHAT YOU WANT (Up to 30%)
  let offerMatchScore = 0;
  let offerDetail = '';

  if (targetOffer && userSeek) {
    const userSeekWords = extractKeywords(userSeek);
    const targetOfferWords = extractKeywords(targetOffer);
    const matches = targetOfferWords.filter(w => userSeekWords.includes(w));
    if (matches.length > 0) {
      offerMatchScore = Math.min(30, 18 + matches.length * 4);
      offerDetail = \`They offer equipment/skills matching your inquiry: "\${matches.slice(0, 3).join(', ')}"\`;
    }
  }
  if (offerMatchScore === 0 && userSeek) {
    const matchesDisc = targetDiscs.some(td => userSeek.includes(td));
    if (matchesDisc) {
      offerMatchScore = 22;
      offerDetail = \`Their discipline (\${targetDiscs.map(capitalize).join('/')}) fulfills what you are seeking\`;
    }
  }
  if (offerMatchScore === 0) {
    offerMatchScore = 10;
    offerDetail = \`Potential practical exchange between studio mediums\`;
  }
  totalScore += offerMatchScore;
  reasons.push({
    category: 'Offering Alignment',
    score: \`+\${offerMatchScore}%\`,
    detail: offerDetail
  });

  // 3. WHAT YOU OFFER VS WHAT THEY WANT (Up to 25%)
  let seekMatchScore = 0;
  let seekDetail = '';

  if (userOffer && targetSeek) {
    const targetSeekWords = extractKeywords(targetSeek);
    const userOfferWords = extractKeywords(userOffer);
    const matches = userOfferWords.filter(w => targetSeekWords.includes(w));
    if (matches.length > 0) {
      seekMatchScore = Math.min(25, 15 + matches.length * 3);
      seekDetail = \`Your offering aligns with their collaboration goals: "\${matches.slice(0, 3).join(', ')}"\`;
    }
  }
  if (seekMatchScore === 0 && targetSeek) {
    const matchesDisc = userDiscs.some(ud => targetSeek.includes(ud));
    if (matchesDisc) {
      seekMatchScore = 18;
      seekDetail = \`Your discipline (\${userDiscs.map(capitalize).join('/')}) matches what they are looking for\`;
    }
  }
  if (seekMatchScore === 0) {
    seekMatchScore = 8;
    seekDetail = \`Broad cross-medium collaboration opening\`;
  }
  totalScore += seekMatchScore;
  reasons.push({
    category: 'Seeking Alignment',
    score: \`+\${seekMatchScore}%\`,
    detail: seekDetail
  });

  // 4. GEOGRAPHIC PROXIMITY (Up to 10%)
  let locScore = 0;
  let locDetail = '';

  if (userCity && targetCity && (userCity.includes(targetCity) || targetCity.includes(userCity))) {
    locScore = 10;
    locDetail = \`Same Base: Both in \${capitalize(userProfile?.location || 'City')} — enables direct physical co-production\`;
  } else if (userCountry && targetCountry && (userCountry.includes(targetCountry) || targetCountry.includes(userCountry))) {
    locScore = 7;
    locDetail = \`Same Region: Both based in \${capitalize(userProfile?.country || 'Region')}\`;
  } else {
    locScore = 4;
    locDetail = \`Trans-Regional / Remote production exchange\`;
  }
  totalScore += locScore;
  reasons.push({
    category: 'Geographic Proximity',
    score: \`+\${locScore}%\`,
    detail: locDetail
  });

  const finalPercentage = Math.min(98, Math.max(12, totalScore));
  const synergyLabel = hasCross
    ? \`\${capitalize(userDiscs[0] || 'Creative')} × \${capitalize(targetDiscs[0] || 'Creative')}\`
    : \`ALLIANCE · \${capitalize(userDiscs[0] || 'Practice')}\`;

  return {
    match_percentage: finalPercentage,
    synergy_label: synergyLabel,
    match_reasons: reasons
  };
}
`;

const oldCompatRegex = /function calculateCompatibility[\s\S]*?return \{ match_percentage: finalPercentage, synergy_label: label \};\s*\}/;
serverCode = serverCode.replace(oldCompatRegex, compEngine.trim());

// 6. Update /api/map/creatives to filter > 35% and exclude current user from candidates
const oldMapRegex = /app\.get\('\/api\/map\/creatives'[\s\S]*?return res\.json\(\{ creatives: results \}\);\s*\}\);/;
const newMapHandler = `app.get('/api/map/creatives', optionalAuthenticate, (req: Request, res: Response) => {
  const { discipline, location, search } = req.query;
  const currentUserId = (req as any).user?.id;

  let currentProfile: any = null;
  if (currentUserId) {
    const raw = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(currentUserId);
    currentProfile = parseProfile(raw);
  }

  let query = \`
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
  \`;

  const params: any[] = [];

  if (location) {
    query += \` AND (p.location LIKE ? OR p.country LIKE ?)\`;
    params.push(\`%\${location}%\`, \`%\${location}%\`);
  }

  const rows = db.prepare(query).all(...params) as any[];
  let results = rows.map(r => {
    const parsed = parseProfile(r);
    if (r.avatar_public === 0) {
      parsed.avatar_url = null;
    }
    const compat = calculateCompatibility(currentProfile || { disciplines: ['Filmmaker'], location: 'Mumbai' }, parsed);
    return {
      ...parsed,
      match_percentage: compat.match_percentage,
      synergy_label: compat.synergy_label,
      match_reasons: compat.match_reasons
    };
  });

  // Exclude current user from candidate nodes (current user is rendered as YOU in the center)
  if (currentUserId) {
    results = results.filter(r => r.user_id !== currentUserId);
  }

  // Filter: Strictly matching ABOVE 35 percent!
  results = results.filter(r => r.match_percentage > 35);

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
});`;

serverCode = serverCode.replace(oldMapRegex, newMapHandler);

fs.writeFileSync('server/index.ts', serverCode);
console.log('Successfully updated server/index.ts');
