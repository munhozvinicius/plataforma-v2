import { getSql, readJson, send } from './_db.js';

export default async function handler(req, res) {
  const sql = getSql();
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, titulo, subtitulo, descricao, cor_fundo, cards FROM home WHERE id = 1;`;
      send(res, 200, rows[0] || { id: 1, titulo: '', subtitulo: '', descricao: '', cor_fundo: '#663399', cards: [] });
      return;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const { titulo, subtitulo, descricao, cor_fundo, cards } = body || {};
      await sql`
        UPDATE home SET
          titulo = ${titulo ?? ''},
          subtitulo = ${subtitulo ?? ''},
          descricao = ${descricao ?? ''},
          cor_fundo = ${cor_fundo ?? '#663399'},
          cards = ${JSON.stringify(cards ?? [])}::jsonb
        WHERE id = 1;
      `;
      send(res, 200, { ok: true });
      return;
    }

    send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    send(res, 500, { ok: false, error: String(e) });
  }
}