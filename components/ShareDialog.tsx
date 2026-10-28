"use client";
import { useCallback, useEffect, useState } from "react";

type Share = { user_id: number; name: string; email: string; role: "editor" | "viewer" };

export default function ShareDialog({ docId, onClose }: { docId: string; onClose: () => void }) {
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/docs/${docId}/share`); const d = await r.json();
    if (r.ok) setShares(d.shares); else setError(d.error);
  }, [docId]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    setBusy(true); setError("");
    const r = await fetch(`/api/docs/${docId}/share`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const d = await r.json(); setBusy(false);
    if (r.ok) { setEmail(""); load(); } else setError(d.error);
  }
  async function revoke(userId: number) {
    const r = await fetch(`/api/docs/${docId}/share?userId=${userId}`, { method: "DELETE" });
    if (r.ok) load(); else setError((await r.json()).error);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row spread"><h3 style={{ margin: 0 }}>Share document</h3><button onClick={onClose}>✕</button></div>
        <p className="muted">Demo users: alice@example.com, bob@example.com, carol@example.com</p>
        <div className="row">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1 }} />
          <select value={role} onChange={(e) => setRole(e.target.value as any)}><option value="viewer">Viewer</option><option value="editor">Editor</option></select>
          <button className="primary" disabled={busy || !email} onClick={add}>Share</button>
        </div>
        {error && <p className="err">{error}</p>}
        <h4>People with access</h4>
        {shares.length === 0 ? <p className="muted">Only you.</p> : shares.map((s) => (
          <div key={s.user_id} className="row spread" style={{ padding: "6px 0" }}>
            <span>{s.name} <span className="muted">{s.email} · {s.role}</span></span>
            <button className="danger" onClick={() => revoke(s.user_id)}>Remove</button>
          </div>))}
      </div>
    </div>
  );
}
