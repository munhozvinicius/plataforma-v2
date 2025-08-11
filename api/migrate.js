import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing POSTGRES_URL env' }), { status: 500 });
    }
    const sql = neon(url);

    // home table
    await sql(`
      create table if not exists home (
        id integer primary key default 1,
        hero_title text default '',
        hero_subtitle text default '',
        description text default '',
        bg_color text default '#663399',
        bg_image text default '',
        cards jsonb default '[]',
        updated_at timestamptz default now()
      );
    `);
    await sql(`insert into home (id) values (1) on conflict (id) do nothing;`);

    // produtos table
    await sql(`
      create table if not exists produtos (
        id bigserial primary key,
        titulo text not null,
        subtitulo text default '',
        emoji text default '',
        caracteristicas text default '',
        tabelas jsonb default '[]',
        observacoes text default '',
        agentes jsonb default '[]',
        ordem integer default 0,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
    `);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
}