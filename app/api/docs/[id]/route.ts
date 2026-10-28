import { z } from "zod";
import { q } from "@/lib/db";
import { authorize, fail, json, safe } from "@/lib/api";
import { canDelete, canEdit, canView } from "@/lib/permissions";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const GET = (_: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canView);
  if (a.error) return a.error;
  return json({ ...a.doc, role: a.role });
});

const Patch = z.object({
  title: z.string().trim().min(1, "Title can't be empty").max(200).optional(),
  content_html: z.string().max(2_000_000).optional(),
}).refine((v) => v.title !== undefined || v.content_html !== undefined, "Nothing to update");

export const PATCH = (req: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canEdit);
  if (a.error) return a.error;
  const body = Patch.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail(body.error.issues[0]?.message ?? "Invalid request", 400);
  const [r] = await q<{ updated_at: string }>(
    `update documents set title = coalesce($2, title), content_html = coalesce($3, content_html), updated_at = now()
      where id = $1 returning updated_at`,
    [params.id, body.data.title ?? null, body.data.content_html ?? null]);
  return json({ ok: true, updated_at: r.updated_at });
});

export const DELETE = (_: Request, { params }: Ctx) => safe(async () => {
  const a = await authorize(params.id, canDelete);
  if (a.error) return a.error;
  await q("delete from documents where id = $1", [params.id]);
  return json({ ok: true });
});
