import { getSql, readJson, send } from './_db.js';

export default async function handler(req, res) {
  const sql = getSql();
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');

  try {
    if (req.method === 'GET') {
      if (id) {
        const rows = await sql`SELECT * FROM produtos WHERE id = ${id} LIMIT 1;`;
        send(res, 200, rows[0] || null);
      } else {
        const rows = await sql`SELECT * FROM produtos ORDER BY ordem ASC, id ASC;`;
        send(res, 200, rows);
      }
      return;
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const {
        titulo, subtitulo, emoji,
        caracteristicas, tabelas, observacoes,
        agentes, ordem
      } = body || {};

      const rows = await sql`
        INSERT INTO produtos (titulo, subtitulo, emoji, caracteristicas, tabelas, observacoes, agentes, ordem)
        VALUES (
          ${titulo ?? ''},
          ${subtitulo ?? ''},
          ${emoji ?? ''},
          ${caracteristicas ?? ''},
          ${JSON.stringify(tabelas ?? [])}::jsonb,
          ${observacoes ?? ''},
          ${JSON.stringify(agentes ?? [])}::jsonb,
          ${ordem ?? 0}
        )
        RETURNING *;
      `;
      send(res, 201, rows[0]);
      return;
    }

    if (req.method === 'PUT') {
      if (!id) {
        send(res, 400, { error: 'Missing id' });
        return;
      }
      const body = await readJson(req);
      // Build update dynamically
      const fields = [];
      const values = [];
      for (const [key, val] of Object.entries(body || {})) {
        if (['tabelas', 'agentes'].includes(key)) {
          fields.push(sql`${sql(key)} = ${JSON.stringify(val)}::jsonb`);
        } else {
          fields.push(sql`${sql(key)} = ${val}`);
        }
      }
      if (!fields.length) {
        send(res, 400, { error: 'No fields to update' });
        return;
      }
      await sql`UPDATE produtos SET ${sql.join(fields, sql`, `)} WHERE id = ${id};`;
      const rows = await sql`SELECT * FROM produtos WHERE id = ${id};`;
      send(res, 200, rows[0]);
      return;
    }

    if (req.method === 'DELETE') {
      if (!id) {
        send(res, 400, { error: 'Missing id' });
        return;
      }
      await sql`DELETE FROM produtos WHERE id = ${id};`;
      send(res, 200, { ok: true });
      return;
    }

    send(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    send(res, 500, { ok: false, error: String(e) });
  }
}