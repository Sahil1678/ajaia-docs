import { marked } from "marked";

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_EXTENSIONS = [".txt", ".md", ".docx"];

export class ImportError extends Error {}

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

export function titleFromFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim();
  return (base || "Imported document").slice(0, 200);
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Blank line = new paragraph, single newline = <br>. */
export function textToHtml(text: string): string {
  const paras = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return "<p></p>";
  return paras.map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
}

export function validateFile(name: string, size: number) {
  if (!ALLOWED_EXTENSIONS.includes(extOf(name))) {
    throw new ImportError(`Unsupported file type. Supported: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }
  if (size === 0) throw new ImportError("File is empty.");
  if (size > MAX_BYTES) throw new ImportError("File is too large (max 5 MB).");
}

export async function convertToHtml(name: string, buf: Buffer): Promise<string> {
  validateFile(name, buf.length);
  const ext = extOf(name);
  if (ext === ".txt") return textToHtml(buf.toString("utf8"));
  if (ext === ".md") return marked.parse(buf.toString("utf8"), { async: false }) as string;
  const mammoth = (await import("mammoth")).default;
  try {
    const r = await mammoth.convertToHtml({ buffer: buf });
    return r.value || "<p></p>";
  } catch {
    throw new ImportError("Could not read this .docx file. It may be corrupted.");
  }
}
