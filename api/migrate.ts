import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await sql`create extension if not exists pgcrypto;`
    await sql`
      create table if not exists configs (
        key text primary key,
        value jsonb not null default '{}'::jsonb
      );
    `
    await sql`
      create table if not exists products (
        id uuid primary key default gen_random_uuid(),
        title text not null,
        subtitle text,
        emoji text,
        data jsonb not null default '{}'::jsonb,
        order_index int not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `
    await sql`insert into configs(key,value) values ('home','{}'::jsonb) on conflict(key) do nothing;`
    res.status(200).json({ ok: true })
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e.message })
  }
}
