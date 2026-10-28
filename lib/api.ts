import { NextResponse } from "next/server";
import { getSession, Session } from "./auth";
import { q } from "./db";
import { resolveRole, Role, ShareRow } from "./permissions";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (message: string, status: number) => json({ error: message }, status);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DocRow = {
  id: string; title: string; content_html: string; owner_id: number; owner_name: string; updated_at: string;
};

export async function loadDoc(id: string, userId: number): Promise<{ doc: DocRow; role: Role } | null> {
  if (!UUID.test(id)) return null;
  const rows = await q<DocRow>(
    `select d.id, d.title, d.content_html, d.owner_id, d.updated_at, u.name as owner_name
       from documents d join users u on u.id = d.owner_id where d.id = $1`, [id]);
  if (!rows[0]) return null;
  const shares = await q<ShareRow>("select user_id, role from shares where doc_id = $1", [id]);
  return { doc: rows[0], role: resolveRole(userId, rows[0].owner_id, shares) };
}

export type AuthResult =
  | { error: Response; session?: undefined; doc?: undefined; role?: undefined }
  | { error?: undefined; session: Session; doc: DocRow; role: Role };

/** Auth + permission gate used by every document route (server-side enforcement). */
export async function authorize(id: string, allowed: (r: Role) => boolean): Promise<AuthResult> {
  const session = await getSession();
  if (!session) return { error: fail("Not signed in", 401) };
  const found = await loadDoc(id, session.userId);
  // 404 (not 403) for strangers so we don't leak which document ids exist.
  if (!found || found.role === "none") return { error: fail("Document not found", 404) };
  if (!allowed(found.role)) return { error: fail("You don't have permission to do that", 403) };
  return { session, doc: found.doc, role: found.role };
}

export async function safe(fn: () => Promise<Response>): Promise<Response> {
  try { return await fn(); }
  catch (e) { console.error(e); return fail("Something went wrong on the server", 500); }
}
