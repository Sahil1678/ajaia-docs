import { describe, expect, it } from "vitest";
import { convertToHtml, ImportError, MAX_BYTES, textToHtml, titleFromFilename, validateFile } from "../lib/import";

describe("import conversion", () => {
  it("converts markdown to HTML with headings, bold and lists", async () => {
    const html = await convertToHtml("notes.md", Buffer.from("# Title\n\nSome **bold** text\n\n- a\n- b\n"));
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<li>a</li>");
  });

  it("wraps plain text in paragraphs and escapes HTML", async () => {
    const html = await convertToHtml("a.txt", Buffer.from("Hello <b>x</b>\nline2\n\nSecond para"));
    expect(html).toBe("<p>Hello &lt;b&gt;x&lt;/b&gt;<br>line2</p><p>Second para</p>");
  });

  it("empty text yields an empty paragraph", () => expect(textToHtml("   ")).toBe("<p></p>"));
  it("derives title from filename", () => expect(titleFromFilename("Q3 plan.final.md")).toBe("Q3 plan.final"));
});

describe("file validation", () => {
  it("rejects unsupported types", () => expect(() => validateFile("x.pdf", 10)).toThrow(ImportError));
  it("rejects oversized files", () => expect(() => validateFile("x.txt", MAX_BYTES + 1)).toThrow(/too large/));
  it("rejects empty files", () => expect(() => validateFile("x.txt", 0)).toThrow(/empty/));
  it("accepts supported types", () => expect(() => validateFile("x.DOCX", 100)).not.toThrow());
});
