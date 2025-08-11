import { db, json, readBody } from './_db.js';

function slugify(str='') {
  return String(str).toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await db`SELECT * FROM produtos ORDER BY ordem NULLS LAST, id;`;
      return json(res, 200, rows);
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      const { id, titulo, subtitulo, emoji, caracteristicas, tabelas, observacoes, agentes, ordem } = body || {};
      if (id) {
        await db`UPDATE produtos SET
          titulo=${titulo || ''},
          subtitulo=${subtitulo || ''},
          emoji=${emoji || ''},
          caracteristicas=${caracteristicas ? JSON.stringify(caracteristicas) : null}::jsonb,
          tabelas=${tabelas ? JSON.stringify(tabelas) : null}::jsonb,
          observacoes=${observacoes || ''},
          agentes=${agentes ? JSON.stringify(agentes) : null}::jsonb,
          ordem=${ordem ?? 9999}
          WHERE id=${id};`;
      } else {
        const s = slugify(titulo || 'produto');
        await db`INSERT INTO produtos (slug, titulo, subtitulo, emoji, caracteristicas, tabelas, observacoes, agentes, ordem)
                 VALUES (${s}, ${titulo || ''}, ${subtitulo || ''}, ${emoji || ''},
                         ${caracteristicas ? JSON.stringify(caracteristicas) : null}::jsonb,
                         ${tabelas ? JSON.stringify(tabelas) : null}::jsonb,
                         ${observacoes || ''},
                         ${agentes ? JSON.stringify(agentes) : null}::jsonb,
                         ${ordem ?? 9999});`;
      }
      const rows = await db`SELECT * FROM produtos ORDER BY ordem NULLS LAST, id;`;
      return json(res, 200, rows);
    }
    if (req.method === 'DELETE') {
      const body = await readBody(req);
      const { id } = body || {};
      if (!id) return json(res, 400, { error: 'Missing id' });
      await db`DELETE FROM produtos WHERE id=${id};`;
      return json(res, 200, { ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}
