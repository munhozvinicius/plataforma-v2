import { getSql, send } from './_db.js';

export default async function handler(req, res) {
  try {
    const sql = getSql();

    // Home: single row table
    await sql`
      CREATE TABLE IF NOT EXISTS home (
        id INTEGER PRIMARY KEY,
        titulo TEXT,
        subtitulo TEXT,
        descricao TEXT,
        cor_fundo TEXT,
        cards JSONB DEFAULT '[]'::jsonb
      );
    `;
    await sql`INSERT INTO home (id) VALUES (1) ON CONFLICT (id) DO NOTHING;`;

    // Produtos
    await sql`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        subtitulo TEXT,
        emoji TEXT,
        caracteristicas TEXT,
        tabelas JSONB DEFAULT '[]'::jsonb,
        observacoes TEXT,
        agentes JSONB DEFAULT '[]'::jsonb,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    send(res, 200, { ok: true });
  } catch (e) {
    send(res, 500, { ok: false, error: String(e) });
  }
}