# Ajaia Docs — Submission

- **Candidate:** Sahil Sunil Sawant (sahilsawant064@gmail.com)
- **Live Deployment URL:** https://ajaia-docs-tankuday60-gmailcoms-projects.vercel.app
- **GitHub Repository:** https://github.com/Sahil1678/ajaia-docs
- **Google Drive Folder:** <PASTE_YOUR_GOOGLE_DRIVE_FOLDER_LINK_HERE>
- **Walkthrough Video:** <PASTE_YOUR_LOOM_OR_YOUTUBE_VIDEO_LINK_HERE>

---

## Seeded Test Accounts (No passwords required)
Select any profile on the login screen to enter the workspace:
- **Sahil** (`sahil@example.com`) — Owner / Primary editor
- **Sanket** (`sanket@example.com`) — Collaborator / Shared editor or viewer
- **Omkar** (`omkar@example.com`) — Stranger / Unshared test account (verifies 404 security)
- **Yash** (`yash@example.com`) — Additional team member

*Tip: Open an Incognito window to simulate two users (e.g. Sahil sharing with Sanket) collaborating simultaneously.*

---

## How to Run Locally

### Requirements
- Node.js 20+
- Any Postgres database (Neon, local Docker, or Supabase)

### Quick Start
```bash
# 1. Clone & install dependencies
git clone https://github.com/Sahil1678/ajaia-docs.git
cd ajaia-docs
npm install

# 2. Setup environment variables (.env.local)
cp .env.example .env.local
# Set DATABASE_URL and AUTH_SECRET in .env.local

# 3. Run automated tests (16 tests)
npm test
npm run typecheck

# 4. Start local development server
npm run dev
# Open http://localhost:3000
```
*Note: All database tables (`users`, `documents`, `shares`) and initial seeded team members are created automatically on the first server request with zero migration steps.*

---

## Product Capabilities & What is Working

1. **Document Creation & Editing**:
   - Create new documents and rename titles in real-time.
   - Rich-text editor powered by TipTap (ProseMirror): Bold, Italic, Underline, H1/H2/H3 headings, Bulleted & Numbered lists.
   - Debounced automatic save with clear status indicator ("Saving..." / "Saved").
2. **File Upload & Import**:
   - One-click file import supporting `.txt`, `.md` (via Marked), and `.docx` (via Mammoth).
   - Automatically parses content into clean, editable HTML within the editor schema.
   - File validation (rejects unsupported types, empty files, or files > 5MB).
3. **Sharing & Access Control**:
   - Document owners can share by team email with **Editor** or **Viewer** roles.
   - Owner can dynamically upgrade, downgrade, or revoke permissions.
   - Dashboard cleanly separates **"Owned by me"** and **"Shared with me"** with badges (`Shared by <owner> · <role>`).
   - Server-side permissions enforced on every route: strangers receive `404 Not Found` (to avoid enumerating document IDs), and unauthorized edits return `403 Forbidden`.
4. **Persistence & Quality**:
   - Production Postgres persistence via Neon.
   - 16 automated Vitest tests covering permissions, conversion logic, and validation.
   - Next.js 14 App Router with clean TypeScript types (`tsc --noEmit` clean).

---

## What is Incomplete / Intentionally Deprioritized
To prioritize a rock-solid, production-ready core within the tight timebox, we made deliberate scope cuts:
- **Full Authentication**: Used signed session cookies (`jose`) with seeded team profiles instead of full OAuth/passwords, removing reviewer friction.
- **Real-Time CRDT Collaboration**: Concurrent edits operate on last-write-wins; real-time operational transformation / Yjs was deprioritized.
- **Export & Version History**: PDF generation and version diff snapshots were deferred for later iterations.

---

## What I Would Build Next with Another 2–4 Hours
1. **Markdown & PDF Export**: Instant export of documents to styled PDF and `.md` files.
2. **Document Version History**: Automatic version snapshots stored in a `document_versions` table on each save.
3. **Optimistic Concurrency Warning**: Compare `updated_at` timestamps on save to alert users if a document was modified by another collaborator in between.
4. **End-to-End Browser Tests**: Playwright automated suite for end-to-end multi-user sharing workflows.

---

## AI-Native Workflow Summary
- **Tools**: Claude & Gemini (Antigravity IDE) for architecture scoping, boilerplate scaffolding, and test generation.
- **Speed-up**: Rapidly defined permission matrices and file conversion edge cases.
- **Human Decisions & Changes**: Rejected SQLite due to ephemeral serverless containers on Vercel; selected Neon Postgres with zero-migration raw SQL; changed stranger response from 403 to 404 for security; fixed TypeScript discriminated union narrowing; customized realistic team workspace data.
- **Verification**: Verified via 16 Vitest tests, typecheck, Next.js production build, and end-to-end script exercising sharing, permissions, and Neon database persistence.
