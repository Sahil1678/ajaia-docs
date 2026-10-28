import { z } from "zod";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail, json, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = () => safe(async () => json({ users: await q("select id, name, email from users order by id") }));

export const POST = (req: Request) => safe(async () => {
  const body = z.object({ userId: z.number().int() }).safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Invalid request", 400);
  const [u] = await q<{ id: number; name: string; email: string }>("select id, name, email from users where id = $1", [body.data.userId]);
  if (!u) return fail("Unknown user", 404);
  await createSession({ userId: u.id, name: u.name, email: u.email });
  return json({ ok: true });
});
