# Architecture note

## Stack and why
| Choice | Reason |
|---|---|
| Next.js App Router, one repo | Frontend + API in one deploy; fastest path to a live URL |
| TipTap (ProseMirror) | Real rich-text model with toolbar commands; sanitizes pasted/imported HTML through its schema |
| Postgres via `pg`, raw SQL | Works with any host (local, Neon, Supabase). Vercel's filesystem is ephemeral so SQLite would silently lose data |
| `jose` signed cookie | Tamper-proof session without a full auth system |
| zod | Input validation at API boundaries |
| mammoth / marked | `.docx` and `.md` to HTML |
| Vitest | Fast tests on pure logic |

## Data model
`users(id, name, email)` · `documents(id uuid, title, content_html, owner_id, updated_at)` · `shares(doc_id, user_id, role editor|viewer)`.
Schema is created idempotently on first request (`lib/db.ts`), so setup is zero-step.

## Access model
`lib/permissions.ts` has one pure function, `resolveRole(user, owner, shares)`, returning owner/editor/viewer/none. Every document route goes through `authorize()` in `lib/api.ts`:
- no session → 401; stranger → **404** (don't leak existence); insufficient role → 403
- view: any role · edit: owner/editor · share/delete: owner only

## What I prioritized
1. Correct, server-enforced sharing (the part most likely to be wrong in a demo)
2. A usable editor with debounced autosave and visible save state
3. Import that produces real editable content, with clear validation errors
4. A deployable build with zero manual DB steps

## Intentionally cut
- Real auth (passwords/OAuth): seeded users keep reviewer testing frictionless
- Real-time collaboration/CRDT: concurrent edits are last-write-wins
- Share-by-link, comments, version history, PDF export
- Content stored as HTML (simple, preserves formatting); ProseMirror JSON would be better for future collaboration

## Next with 2-4 more hours
Markdown/PDF export, version history (snapshot on save into a `doc_versions` table), optimistic-concurrency check (`updated_at`) to warn on conflicting edits, Playwright e2e for the sharing flow, API-level integration tests, rate limiting on import.
