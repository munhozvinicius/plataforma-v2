import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

function parseUrl(req) {
  const u = new URL(req.url);
  return { id: u.searchParams.get('id') };
}

export default async function handler(req) {
  try {
    const url = process.env.POSTGRES_URL;
    if (!url) return new Response(JSON.stringify({ ok:false, error:'Missing POSTGRES_URL' }), { status: 500 });
    const sql = neon(url);

    const { id } = parseUrl(req);

    if (req.method === 'GET') {
      if (id) {
        const rows = await sql(`select * from produtos where id = $1`, [id]);
        return new Response(JSON.stringify({ ok:true, data: rows[0] || null }), { headers: { 'content-type':'application/json' } });
      } else {
        const rows = await sql(`select * from produtos order by ordem asc, id asc`);
        return new Response(JSON.stringify({ ok:true, data: rows }), { headers: { 'content-type':'application/json' } });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        titulo, subtitulo = '', emoji = '', caracteristicas = '',
        tabelas = [], observacoes = '', agentes = [], ordem = 0
      } = body || {};

      if (!titulo) return new Response(JSON.stringify({ ok:false, error:'titulo is required' }), { status: 400 });

      const rows = await sql(`
        insert into produtos (titulo, subtitulo, emoji, caracteristicas, tabelas, observacoes, agentes, ordem)
        values ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8)
        returning *
      `, [titulo, subtitulo, emoji, caracteristicas, JSON.stringify(tabelas), observacoes, JSON.stringify(agentes), ordem]);

      return new Response(JSON.stringify({ ok:true, data: rows[0] }), { headers: { 'content-type':'application/json' } });
    }

    if (req.method === 'PUT') {
      if (!id) return new Response(JSON.stringify({ ok:false, error:'id is required' }), { status: 400 });
      const body = await req.json();
      // Build dynamic update
      const allowed = ['titulo','subtitulo','emoji','caracteristicas','tabelas','observacoes','agentes','ordem'];
      const set = [];
      const vals = [];
      let i = 1;
      for (const key of allowed) {
        if (key in body) {
          if (key === 'tabelas' || key === 'agentes') {
            set.push(`${key} = $${i}::jsonb`); vals.push(JSON.stringify(body[key])); i++;
          } else {
            set.push(`${key} = $${i}`); vals.push(body[key]); i++;
          }
        }
      }
      if (!set.length) return new Response(JSON.stringify({ ok:false, error:'no fields to update' }), { status: 400 });
      vals.push(id);

      const rows = await sql(`update produtos set ${set.join(', ')}, updated_at = now() where id = $${i} returning *`, vals);
      return new Response(JSON.stringify({ ok:true, data: rows[0] }), { headers: { 'content-type':'application/json' } });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ ok:false, error:'id is required' }), { status: 400 });
      await sql(`delete from produtos where id = $1`, [id]);
      return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' } });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:String(err) }), { status: 500 });
  }
}