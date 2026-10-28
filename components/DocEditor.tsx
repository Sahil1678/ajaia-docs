"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ShareDialog from "./ShareDialog";

type Doc = { id: string; title: string; content_html: string; owner_name: string; role: "owner" | "editor" | "viewer" };
type Status = "saved" | "saving" | "error";

function Toolbar({ editor }: { editor: Editor }) {
  const B = (label: string, on: boolean, run: () => void, title: string) => (
    <button type="button" title={title} className={on ? "on" : ""} onMouseDown={(e) => e.preventDefault()} onClick={run}>{label}</button>);
  const c = () => editor.chain().focus();
  return (
    <div className="toolbar">
      {B("B", editor.isActive("bold"), () => c().toggleBold().run(), "Bold")}
      {B("I", editor.isActive("italic"), () => c().toggleItalic().run(), "Italic")}
      {B("U", editor.isActive("underline"), () => c().toggleUnderline().run(), "Underline")}
      {B("H1", editor.isActive("heading", { level: 1 }), () => c().toggleHeading({ level: 1 }).run(), "Heading 1")}
      {B("H2", editor.isActive("heading", { level: 2 }), () => c().toggleHeading({ level: 2 }).run(), "Heading 2")}
      {B("H3", editor.isActive("heading", { level: 3 }), () => c().toggleHeading({ level: 3 }).run(), "Heading 3")}
      {B("• List", editor.isActive("bulletList"), () => c().toggleBulletList().run(), "Bulleted list")}
      {B("1. List", editor.isActive("orderedList"), () => c().toggleOrderedList().run(), "Numbered list")}
    </div>
  );
}

export default function DocEditor({ id, userName }: { id: string; userName: string }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("saved");
  const [showShare, setShowShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEdit = doc?.role === "owner" || doc?.role === "editor";
  const scheduleRef = useRef<(html: string) => void>(() => {});

  async function patch(body: object) {
    setStatus("saving");
    const r = await fetch(`/api/docs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setStatus("saved"); setError(""); return true; }
    setStatus("error"); setError((await r.json()).error || "Save failed"); return false;
  }

  scheduleRef.current = (html: string) => {
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => patch({ content_html: html }), 800); // debounced autosave
  };

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Underline],
    content: "",
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => scheduleRef.current(editor.getHTML()),
  });

  useEffect(() => {
    fetch(`/api/docs/${id}`).then(async (r) => {
      const d = await r.json();
      if (!r.ok) return setError(d.error);
      setDoc(d); setTitle(d.title);
    }).catch(() => setError("Failed to load document"));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [id]);

  useEffect(() => {
    if (!editor || !doc) return;
    editor.commands.setContent(doc.content_html, false);
    editor.setEditable(doc.role !== "viewer");
  }, [editor, doc]);

  async function saveTitle() {
    if (!doc || title === doc.title) return;
    if (!title.trim()) { setTitle(doc.title); setError("Title can't be empty"); return; }
    if (await patch({ title })) setDoc({ ...doc, title: title.trim() });
  }

  if (error && !doc) return (
    <div className="wrap"><div className="card"><h3>Can't open this document</h3><p className="err">{error}</p><Link className="btn" href="/">← Back to documents</Link></div></div>);
  if (!doc || !editor) return <div className="wrap"><p className="muted">Loading…</p></div>;

  return (
    <>
      <div className="topbar">
        <Link href="/" className="brand">← Ajaia Docs</Link>
        <span className="muted">{userName}</span>
      </div>
      <div className="wrap">
        <div className="row spread" style={{ marginBottom: 12 }}>
          <div className="row" style={{ flex: 1 }}>
            <input className="title-input" type="text" value={title} disabled={!canEdit} maxLength={200}
              onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} aria-label="Document title" />
            <span className={`badge ${doc.role === "owner" ? "owner" : "shared"}`}>
              {doc.role === "owner" ? "Owner" : `Shared by ${doc.owner_name} · ${doc.role}`}
            </span>
          </div>
          <div className="row">
            {canEdit && <span className={`status ${status}`}>{status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save failed"}</span>}
            {doc.role === "owner" && <button className="primary" onClick={() => setShowShare(true)}>Share</button>}
          </div>
        </div>
        {doc.role === "viewer" && <div className="hint muted" style={{ marginBottom: 12 }}>You have view-only access to this document.</div>}
        {error && <p className="err">{error}</p>}
        {canEdit && <Toolbar editor={editor} />}
        <div className="paper" style={!canEdit ? { borderRadius: 10 } : undefined}><EditorContent editor={editor} /></div>
      </div>
      {showShare && <ShareDialog docId={id} onClose={() => setShowShare(false)} />}
    </>
  );
}
