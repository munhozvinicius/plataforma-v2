# Plataforma V2 (MVP persistente Neon)

## Variáveis de ambiente (Vercel)
- `POSTGRES_URL` = sua URL do Neon (igual à que você colou no print).

## Rotas
- `GET /api/migrate` cria tabelas (idempotente).
- `GET /api/config/home` lê config da Home.
- `POST /api/config/home` salva config (JSON).
- `GET /api/products` lista produtos.
- `POST /api/products` grava produtos ({ upserts:[], deletes:[] }).

## Rodando
1. `pnpm i`
2. `pnpm dev` (para ver o front). As rotas /api rodam na Vercel após deploy.
3. Faça o deploy no Vercel (Import Git) e adicione `POSTGRES_URL`.
4. Acesse `/api/migrate` uma vez e teste no Admin.
