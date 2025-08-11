import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { key } = req.query as { key: string }
  try {
    if (req.method === 'GET') {
      const rows:any = await sql`select value from configs where key = ${key} limit 1`
      const value = rows[0]?.value ?? {}
      return res.status(200).json({ key, value })
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      await sql`
        insert into configs(key,value)
        values (${key}, ${JSON.stringify(body)}::jsonb)
        on conflict(key) do update set value = ${JSON.stringify(body)}::jsonb
      `
      return res.status(200).json({ ok: true })
    }
    res.status(405).end()
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e.message })
  }
}
