import { neon } from '@neondatabase/serverless'

const url = process.env.POSTGRES_URL
if (!url) throw new Error('Env POSTGRES_URL não configurada')

export const sql = neon(url as string)
