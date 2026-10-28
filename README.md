# Ajaia Docs: lightweight collaborative document editor

Next.js 14 (App Router) + TypeScript + TipTap + Postgres. Frontend and API live in one app.

**Live URL:** `https://ajaia-docs-tankuday60-gmailcoms-projects.vercel.app`
**Demo users (mocked auth, no passwords):** alice@example.com, bob@example.com, carol@example.com

## Features
- Create, rename, edit, auto-save and reopen documents (bold, italic, underline, H1-H3, bulleted/numbered lists)
- Import `.txt`, `.md`, `.docx` (max 5 MB) into a new editable document
- Share by email as **Editor** or **Viewer**; owner can change or revoke access
- Dashboard tabs: "Owned by me" / "Shared with me" with "Shared by <owner> · role" badges
- Permissions enforced **server-side** on every API route
- Persistence in Postgres (HTML content stored per document)

## Run locally
Requirements: Node 20+, a Postgres database (Docker, or a free Neon/Supabase one).

```bash
npm install
cp .env.example .env.local        # then edit values
docker compose up -d              # optional: local Postgres on :5432
npm run dev                       # http://localhost:3000
```
Tables and the 3 demo users are created automatically on first request. No migration step.

`.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ajaia_docs
AUTH_SECRET=<openssl rand -hex 32>
```

## Tests
```bash
npm test          # 16 tests: permission logic + import conversion/validation
npm run typecheck
npm run build
```

## Try the sharing flow (2 minutes)
1. Window A: log in as **Alice**, create a doc, type something, click **Share**, add `bob@example.com` as Viewer.
2. Window B (incognito): log in as **Bob**, open **Shared with me**. The doc is read-only.
3. Back in A, change Bob to Editor. Reload in B; Bob can now edit and changes autosave.
4. Log in as **Carol**: she sees nothing, and opening Alice's doc URL returns "Document not found".

## Supported import types
`.txt` (paragraphs), `.md` (via marked), `.docx` (via mammoth; headings, bold, lists preserved; images/tables not supported). Max 5 MB. Stated in the UI too.

## Known limitations
Mocked auth, last-write-wins (no real-time collaboration), no version history, no PDF export. See ARCHITECTURE.md.
