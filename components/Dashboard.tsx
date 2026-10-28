"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Owned = { id: string; title: string; updated_at: string };
type Shared = Owned & { owner_name: string; role: "editor" | "viewer" };

export default function Dashboard({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState<"owned" | "shared">("owned");
  const [owned, setOwned] = useState<Owned[]>([]);
  const [shared, setShared] = useState<Shared[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/docs");
      if (r.status === 401) return router.push("/login");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOwned(d.owned); setShared(d.shared); setError("");
    } catch (e: any) { setError(e.message || "Failed to load documents"); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    const r = await fetch("/api/docs", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const d = await r.json();
    if (r.ok) router.push(`/docs/${d.id}`); else setError(d.error);
  }

  async function upload(file: File) {
    setError("");
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/import", { method: "POST", body: fd });
    const d = await r.json();
    if (r.ok) router.push(`/docs/${d.id}`); else setError(d.error);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function logout() { await fetch("/api/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  async function remove(id: string) {
    if (!confirm("Delete this document? This also removes it for anyone it's shared with.")) return;
    const r = await fetch(`/api/docs/${id}`, { method: "DELETE" });
    if (r.ok) load(); else setError((await r.json()).error);
  }

  const fmt = (s: string) => new Date(s).toLocaleString();

  return (
    <>
      <div className="topbar">
        <span className="brand">📄 Ajaia Docs</span>
        <div className="row"><span className="muted">Signed in as <b>{user.name}</b> ({user.email})</span><button onClick={logout}>Switch user</button></div>
      </div>
      <div className="wrap">
        <div className="row spread">
          <h2 style={{ margin: 0 }}>Documents</h2>
          <div className="row">
            <button onClick={() => fileRef.current?.click()}>⬆ Import file</button>
            <input ref={fileRef} type="file" accept=".txt,.md,.docx" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button className="primary" onClick={create}>+ New document</button>
          </div>
        </div>
        <p className="muted">Import supports <b>.txt, .md, .docx</b> (max 5 MB). The file becomes a new editable document.</p>
        {error && <p className="err">{error}</p>}

        <div className="tabs">
          <button className={`tab ${tab === "owned" ? "active" : ""}`} onClick={() => setTab("owned")}>Owned by me ({owned.length})</button>
          <button className={`tab ${tab === "shared" ? "active" : ""}`} onClick={() => setTab("shared")}>Shared with me ({shared.length})</button>
        </div>

        {loading ? <p className="muted">Loading…</p> : tab === "owned" ? (
          owned.length === 0 ? <div className="hint muted">No documents yet. Create one or import a file.</div> :
          <div className="list">{owned.map((d) => (
            <div key={d.id} className="item">
              <Link href={`/docs/${d.id}`} style={{ flex: 1 }}>
                <b>{d.title}</b> <span className="badge owner">Owner</span><div className="muted">Edited {fmt(d.updated_at)}</div>
              </Link>
              <button className="danger" onClick={() => remove(d.id)}>Delete</button>
            </div>))}</div>
        ) : (
          shared.length === 0 ? <div className="hint muted">Nothing shared with you yet. Ask another user to share a document with {user.email}.</div> :
          <div className="list">{shared.map((d) => (
            <Link key={d.id} href={`/docs/${d.id}`} className="item">
              <div><b>{d.title}</b> <span className="badge shared">Shared by {d.owner_name} · {d.role}</span><div className="muted">Edited {fmt(d.updated_at)}</div></div>
            </Link>))}</div>
        )}
      </div>
    </>
  );
}
