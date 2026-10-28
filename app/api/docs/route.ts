import { z } from "zod";
import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fail, json, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = () => safe(async () => {
  const s = await getSession();
  if (!s) return fail("Not signed in", 401);
  const owned = await q(
    `select id, title, updated_at from documents where owner_id = $1 order by updated_at desc`, [s.userId]);
  const shared = await q(
    `select d.id, d.title, d.updated_at, u.name as owner_name, sh.role
       from shares sh join documents d on d.id = sh.doc_id join users u on u.id = d.owner_id
      where sh.user_id = $1 order by d.updated_at desc`, [s.userId]);
  return json({ owned, shared });
});

export const POST = (req: Request) => safe(async () => {
  const s = await getSession();
  if (!s) return fail("Not signed in", 401);
  const body = z.object({ title: z.string().trim().min(1).max(200).optional() }).safeParse(await req.json().catch(() => ({})));
  if (!body.success) return fail("Title must be 1-200 characters", 400);
  const [d] = await q<{ id: string }>(
    "insert into documents (title, owner_id) values ($1, $2) returning id", [body.data.title ?? "Untitled document", s.userId]);
  return json({ id: d.id }, 201);
});
