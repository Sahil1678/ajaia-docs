# AI workflow note

> ✏️ EDIT THIS to match what you personally did before submitting. Keep it honest; reviewers value accuracy over volume.

## Tools used
- Claude & Gemini / Antigravity IDE for planning, scaffolding code, and generating tests

## Where AI materially sped things up
- Scoping: turned the open-ended prompt into a time-boxed plan and scope cuts
- Boilerplate: API routes, zod schemas, TipTap toolbar, dashboard UI
- Test cases: permission matrix and import edge cases

## What I changed or rejected
- Rejected SQLite for storage: Vercel's filesystem is ephemeral, which would break the persistence/sharing demo. Chose hosted Postgres (Neon).
- Chose plain `pg` + raw SQL with self-creating schema instead of an ORM + migrations, to remove setup steps for reviewers.
- Changed the stranger response from 403 to 404 so document ids are not enumerable.
- Fixed a TypeScript narrowing bug in the generated `authorize()` helper by switching to an explicit discriminated union.
- Replaced generic AI placeholder users with realistic team profiles (Sahil, Sanket, Omkar, Yash) and refined workspace UI copy.

## How I verified
- `npm test` (16 tests), `tsc --noEmit`, and `next build` all pass
- Ran the app against a real Neon Postgres database and exercised the API end-to-end: owner/editor/viewer/stranger paths (200/403/404), share upgrade/revoke, invalid email, empty title, unsupported file type, `.md` and `.docx` import
- Manual UI check with two browser sessions (Sahil and Sanket) for the sharing flow, refresh persistence, and autosave indicator: Verified on local and Vercel production deployment.
- Reviewed code for security: server-side permission checks, validated inputs, no secrets in repo
