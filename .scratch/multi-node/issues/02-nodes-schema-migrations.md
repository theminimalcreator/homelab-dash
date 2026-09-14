Status: resolved (2026-09-14) — migration aplicada de verdade no Postgres do Master via `npm run migrate`, tabela `nodes` confirmada com `\d nodes`, segunda rodada é no-op

Blocked by: 01

# Schema da tabela `nodes` + migrations

Criar a estrutura de dados que substitui o `.env` hardcoded de hoje. Ver spec.md, seção "Armazenamento dos Nodes".

## Tarefa

- Pasta `migrations/` na raiz do repo, arquivos SQL numerados (`001_create_nodes.sql`, etc.)
- Tabela `nodes`:
  - `id` (pk, serial ou uuid)
  - `name`, `subtitle` (text)
  - `kind` (text — ex: `termux-master`, `termux-dev`, `linux-vps`)
  - `stats_url` (text)
  - `ssh_user`, `ssh_port` (text/int, nullable — nem todo Node precisa)
  - `auth_token` (text, nullable — ver issue 06)
  - `tracks_claude_code`, `tracks_wake_lock` (boolean, default false)
  - `services_runtime` (text — `pm2` | `docker` | `none`)
  - `is_self` (boolean, default false)
  - `created_at`, `updated_at` (timestamptz)
- Módulo `lib/db.js` (ou `.ts`) com um client `pg` único (pool), lendo `DATABASE_URL` do `.env`
- Script simples pra aplicar migrations pendentes em ordem (não precisa de framework — um `for` sobre os arquivos de `migrations/` não aplicados ainda, registrados numa tabela `schema_migrations`)

## Aceite

- Rodar o script de migration contra o Postgres da issue 01 cria a tabela `nodes` vazia
- Rodar de novo é idempotente (não tenta recriar o que já existe)
