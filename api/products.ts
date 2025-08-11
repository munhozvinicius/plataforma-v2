import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const rows:any = await sql`select id, title, subtitle, emoji, data, order_index from products order by order_index asc, created_at asc`
      return res.status(200).json({ products: rows })
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { upserts = [], deletes = [] } = body || {}
      for (const p of upserts) {
        if (p.id) {
          await sql`
            update products
            set title=${p.title}, subtitle=${p.subtitle}, emoji=${p.emoji},
                data=${JSON.stringify(p.data)}::jsonb,
                order_index=${p.order_index}, updated_at=now()
            where id=${p.id}
          `
        } else {
          await sql`
            insert into products(title, subtitle, emoji, data, order_index)
            values(${p.title}, ${p.subtitle}, ${p.emoji}, ${JSON.stringify(p.data)}::jsonb, ${p.order_index})
          `
        }
      }
      if (deletes.length) {
        await sql`delete from products where id = any(${deletes})`
      }
      return res.status(200).json({ ok: true })
    }
    res.status(405).end()
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e.message })
  }
}
