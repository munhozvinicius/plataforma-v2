import { db, json } from './_db.js';

export default async function handler(req, res) {
  try {
    // Home table with a single row (id=1)
    await db`CREATE TABLE IF NOT EXISTS home (
      id integer PRIMARY KEY,
      titulo text,
      subtitulo text,
      descricao text,
      cor_fundo text,
      imagem_fundo text
    );`;

    await db`INSERT INTO home (id, titulo) VALUES (1, '')
             ON CONFLICT (id) DO NOTHING;`;

    // Produtos table
    await db`CREATE TABLE IF NOT EXISTS produtos (
      id serial PRIMARY KEY,
      slug text UNIQUE,
      titulo text,
      subtitulo text,
      emoji text,
      caracteristicas jsonb,
      tabelas jsonb,
      observacoes text,
      agentes jsonb,
      ordem integer DEFAULT 9999
    );`;

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}
