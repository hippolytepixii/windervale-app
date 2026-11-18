# WINDERVALE : APPLICATION DOSSIER & TECHNICAL SPECIFICATION

**Project**: Windervale Creative Operating Environment & Autonomous Network  
**Live Production URL**: [https://wvlabs-app.onrender.com](https://wvlabs-app.onrender.com)  
**Public Repository**: [https://github.com/hippolytepixii/windervale-app.git](https://github.com/hippolytepixii/windervale-app.git)  
**Admin Curation Console**: [https://wvlabs-app.onrender.com/admin](https://wvlabs-app.onrender.com/admin)  
**Date**: October 2026  

---

## 1. Executive Summary

Windervale is an independent, non-algorithmic creative operating system and autonomous network for artists, filmmakers, writers, and creative practitioners. It bridges an editorial community monograph network with an intensive, production-ready private workspace.

### Core Value Propositions:
- **Private Creative Workspace**: A persistent production hub replacing disjointed SaaS tools with 12 interconnected modules.
- **Equitable Rights Ledger**: Real-time ownership and revenue allocation tracking enforcing mathematical integrity (total equity $\le 100\%$).
- **Editorial Monograph Network**: Human-curated portfolios with government verification and geolocation on the interactive Human Map.
- **Permanent Attribution**: Historical colophon credits remain permanently locked and preserved even if collaborator relationships change.

---

## 2. System Architecture & Hierarchy

```
USER (Authenticated via JWT & secure credential hashing)
  └── WORKSPACE (Private container protected by bcrypt PIN lock & recovery)
        └── PROJECT (e.g. "The Dissolve", "Short Film A", "Album B")
              └── 12 PRODUCTION MODULES
                    └── RECORDS / DOCUMENTS / FILES / PEOPLE / EVENTS
```

- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), bcrypt, JSON Web Tokens (JWT).
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide icons, Vite.
- **Hosting & Infrastructure**: Render (Web Service), GitHub Version Control.

---

## 3. The 12 Functional Workspace Modules

| Module Number & Name | Purpose & Implementation |
| :--- | :--- |
| **01 : CREW** | Collaborator roster tracking roles, responsibilities, contact info, equity percentages, and status. Features soft-archiving that guarantees credit preservation. |
| **02 : RIGHTS** | Structured ownership and revenue waterfalls. Enforces real-time mathematical validation: warns when incomplete (<100%), errors when exceeding (>100%), and logs all adjustments to an audit trail. |
| **03 : AGREEMENT** | Covenants and digital timestamped confirmations with attached document preservation. |
| **04 : BUILD** | Task execution pipeline linked to CREW assignees and production milestones. |
| **05 : CAPTURE** | Fragments, scratchpad notes, and creative references featuring debounced live autosaving with status feedback ("Saving...", "Saved"). |
| **06 : STUDIO** | Production asset vault supporting scripts, media links, stems, and version tracking. |
| **07 : MILESTONES** | Production timeline with target dates, deliverable checklists, and completion logging. |
| **08 : MONEY** | Financial ledger managing grant funding, expenses, and collaborator payouts with receipt and invoice verification. |
| **09 : DISTRIBUTION** | Release tracking across festivals, streaming, and theatrical channels with territory and premiere status. |
| **10 : CREDITS** | Permanent colophon attribution record preserved independently of roster updates. |
| **11 : OUTCOME** | Post-release analysis tracking festival selections, reviews, box office, and impact. |
| **12 : MEMORY** | Retrospective vault documenting creative turning points, key decisions, and behind-the-scenes reflections. |

---

## 4. Security & Privacy Model

1. **Workspace PIN Lock**:
   - Protected by server-side bcrypt hashing (`workspaces.pin_hash`).
   - Capabilities: Create PIN, Change PIN, Lock, Unlock, and Remove PIN.
   - **Account Password Recovery**: Users can unlock or reset their PIN using their master account password without data loss.
2. **Sensitive Records Lock**:
   - Secondary layer protecting modules `02 RIGHTS`, `03 AGREEMENT`, `08 MONEY`, `09 DISTRIBUTION`, and `10 CREDITS`.
   - "Unlock once, work freely" session model to avoid workflow friction.
3. **Admin Curation Desk**:
   - Restricted editorial portal (`/admin`) protected by administrative passkey.
   - Verification protocol for candidate government ID documents and portfolio review.

---

## 5. Automated Verification & Quality Assurance

- **Integration Tests**: 34/34 automated integration tests passing (`npm test`).
  - Authentication and session validation.
  - Non-destructive crew archival test.
  - Rights mathematical balance test.
  - Bcrypt PIN hashing and rejection tests.
- **Production Build**: Clean compilation with Vite in under 12 seconds with zero TypeScript or bundling errors.

---

## 6. Development Session Provenance

- **AI Pair Programming Environment**: Google Antigravity (Advanced Agentic Coding).
- **Session Conversation ID**: `ca86a71d-544a-4d9d-bbe9-2ee52d5f8ac7`
- **Raw Transcript Logs**:
  - `brain/ca86a71d-544a-4d9d-bbe9-2ee52d5f8ac7/.system_generated/logs/transcript.jsonl`
  - `brain/ca86a71d-544a-4d9d-bbe9-2ee52d5f8ac7/.system_generated/logs/transcript_full.jsonl`
- **Main Git Commit**: `c86182e` (Pushed to `main` branch).
