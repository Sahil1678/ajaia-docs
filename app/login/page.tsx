"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type U = { id: number; name: string; email: string };

export default function Login() {
  const router = useRouter();
  const [users, setUsers] = useState<U[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/login").then((r) => r.json()).then((d) => d.users ? setUsers(d.users) : setError(d.error))
      .catch(() => setError("Could not reach the server. Is DATABASE_URL set?"));
  }, []);

  async function login(id: number) {
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    if (r.ok) { router.push("/"); router.refresh(); } else setError((await r.json()).error);
  }

  return (
    <div className="wrap" style={{ maxWidth: 480, marginTop: 80 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Ajaia Docs</h1>
        <p className="muted">Demo login (mocked auth): pick a seeded user. Open a second browser or incognito window to try sharing between two users.</p>
        {error && <p className="err">{error}</p>}
        <div className="list">
          {users.map((u) => (
            <button key={u.id} onClick={() => login(u.id)} style={{ textAlign: "left" }}>
              <b>{u.name}</b> <span className="muted">{u.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
