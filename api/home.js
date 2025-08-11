import { db, json, readBody } from './_db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await db`SELECT * FROM home WHERE id = 1;`;
      return json(res, 200, rows[0] || {});
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      const { titulo, subtitulo, descricao, cor_fundo, imagem_fundo } = body || {};
      await db`INSERT INTO home (id, titulo, subtitulo, descricao, cor_fundo, imagem_fundo)
               VALUES (1, ${titulo || ''}, ${subtitulo || ''}, ${descricao || ''}, ${cor_fundo || ''}, ${imagem_fundo || ''})
               ON CONFLICT (id) DO UPDATE SET
                  titulo = EXCLUDED.titulo,
                  subtitulo = EXCLUDED.subtitulo,
                  descricao = EXCLUDED.descricao,
                  cor_fundo = EXCLUDED.cor_fundo,
                  imagem_fundo = EXCLUDED.imagem_fundo;`;
      const rows = await db`SELECT * FROM home WHERE id = 1;`;
      return json(res, 200, rows[0] || {});
    }
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}
