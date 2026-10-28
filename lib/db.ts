import { Pool } from "pg";

const g = globalThis as unknown as { __pool?: Pool; __ready?: Promise<void> };

function getPool(): Pool {
  if (!g.__pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    g.__pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return g.__pool;
}

const SCHEMA = `
create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique
);
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled document',
  content_html text not null default '<p></p>',
  owner_id int not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists shares (
  doc_id uuid not null references documents(id) on delete cascade,
  user_id int not null references users(id),
  role text not null check (role in ('editor','viewer')),
  primary key (doc_id, user_id)
);
insert into users (name, email) values
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Carol', 'carol@example.com')
on conflict (email) do nothing;
`;

/** Creates tables + seeds the 3 demo users once per process. Idempotent. */
export function ensureSchema(): Promise<void> {
  if (!g.__ready) {
    g.__ready = getPool().query(SCHEMA).then(() => undefined);
    g.__ready.catch(() => { g.__ready = undefined; });
  }
  return g.__ready;
}

export async function q<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const r = await getPool().query(text, params);
  return r.rows as T[];
}
