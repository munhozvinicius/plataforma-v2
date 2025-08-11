import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const url = process.env.POSTGRES_URL;
    if (!url) return new Response(JSON.stringify({ ok:false, error:'Missing POSTGRES_URL' }), { status: 500 });
    const sql = neon(url);

    if (req.method === 'GET') {
      const rows = await sql(`select hero_title, hero_subtitle, description, bg_color, bg_image, cards from home where id = 1`);
      const row = rows[0] || {};
      return new Response(JSON.stringify({ ok:true, data: row }), { headers: { 'content-type':'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        hero_title = '', hero_subtitle = '', description = '',
        bg_color = '#663399', bg_image = '', cards = []
      } = body || {};

      await sql(`
        update home
           set hero_title = $1,
               hero_subtitle = $2,
               description = $3,
               bg_color = $4,
               bg_image = $5,
               cards = $6::jsonb,
               updated_at = now()
         where id = 1
      `, [hero_title, hero_subtitle, description, bg_color, bg_image, JSON.stringify(cards)]);

      return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' } });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:String(err) }), { status: 500 });
  }
}