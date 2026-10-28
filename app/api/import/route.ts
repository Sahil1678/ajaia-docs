import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fail, json, safe } from "@/lib/api";
import { convertToHtml, ImportError, titleFromFilename, validateFile } from "@/lib/import";

export const dynamic = "force-dynamic";

export const POST = (req: Request) => safe(async () => {
  const s = await getSession();
  if (!s) return fail("Not signed in", 401);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("No file uploaded", 400);
  try {
    validateFile(file.name, file.size);
    const html = await convertToHtml(file.name, Buffer.from(await file.arrayBuffer()));
    const [d] = await q<{ id: string }>(
      "insert into documents (title, content_html, owner_id) values ($1, $2, $3) returning id",
      [titleFromFilename(file.name), html, s.userId]);
    return json({ id: d.id }, 201);
  } catch (e) {
    if (e instanceof ImportError) return fail(e.message, 400);
    throw e;
  }
});
