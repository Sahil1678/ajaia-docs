import { z } from "zod";
import { q } from "@/lib/db";
import { authorize, fail, json, safe } from "@/lib/api";
import { canShare } from "@/lib/permissions";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const GET = (_: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canShare);
  if (a.error) return a.error;
  const shares = await q(
    `select u.id as user_id, u.name, u.email, s.role from shares s join users u on u.id = s.user_id where s.doc_id = $1 order by u.name`, [params.id]);
  return json({ shares });
});

const Body = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email"), role: z.enum(["editor", "viewer"]) });

export const POST = (req: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canShare);
  if (a.error) return a.error;
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail(body.error.issues[0]?.message ?? "Invalid request", 400);
  const [target] = await q<{ id: number }>("select id from users where email = $1", [body.data.email]);
  if (!target) return fail("No user with that email. Try alice@example.com, bob@example.com or carol@example.com", 404);
  if (target.id === a.session.userId) return fail("You already own this document", 400);
  await q(
    `insert into shares (doc_id, user_id, role) values ($1, $2, $3)
     on conflict (doc_id, user_id) do update set role = excluded.role`, [params.id, target.id, body.data.role]);
  return json({ ok: true });
});

export const DELETE = (req: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canShare);
  if (a.error) return a.error;
  const userId = Number(new URL(req.url).searchParams.get("userId"));
  if (!Number.isInteger(userId)) return fail("userId required", 400);
  await q("delete from shares where doc_id = $1 and user_id = $2", [params.id, userId]);
  return json({ ok: true });
});
