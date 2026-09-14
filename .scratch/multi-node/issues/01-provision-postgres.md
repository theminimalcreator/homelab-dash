Status: resolved (2026-09-14) — executado via SSH direto no Master, TCP já estava disponível (nenhum restart do Postgres foi necessário, zero impacto no n8n)

# Provisionar database + role dedicados no Postgres do Master

O Master já roda Postgres (Termux, usuário `u0_a286`, confirmado via SSH em 2026-09-14 — processo `postgres -D /data/data/com.termux/files/home/pg_data`, socket Unix `.s.PGSQL.5432`, sem TCP hoje). Já está em uso pelo n8n. Ver spec.md, seção "Armazenamento dos Nodes".

Isso é uma mudança de infra num serviço de produção compartilhado (n8n depende dele) — não é uma issue de código, é uma ação manual (ou uma ação explicitamente autorizada, com credenciais passadas por fora deste ticket).

## Tarefa

- Habilitar TCP em `localhost` no `postgresql.conf` (hoje só aceita socket Unix), já que o processo do Next.js pode não estar no mesmo usuário Termux (`u0_a286`) que o Postgres
- Criar um role novo (`homelab_dash` ou similar) com senha, sem privilégio de superuser
- Criar um database novo (`homelab_dash`) de dono desse role — **não** reaproveitar o schema/database do n8n
- Confirmar `pg_hba.conf` permite esse role conectar via TCP local com senha
- Guardar a connection string resultante — vai virar `DATABASE_URL` no `.env` do dashboard (issue 02 depende disso pra aplicar migrations)

## Aceite

- `psql "postgresql://homelab_dash:<senha>@localhost:5432/homelab_dash"` conecta a partir do processo que vai rodar o Next.js
- O role novo não enxerga as tabelas do n8n (schemas separados por database já garante isso)
- `DATABASE_URL` documentada (não precisa estar no `.env.example` com a senha real, só o formato)

## Comments

**2026-09-14** — Feito via SSH (`u0_a348@192.168.15.43:8022`, autorizado pelo usuário). Achados/decisões durante a execução, fora do previsto original:

- **Não precisou editar `postgresql.conf` nem reiniciar o Postgres.** `listen_addresses` está comentado no arquivo, mas o valor default do Postgres pro parâmetro comentado já é `localhost` — TCP em `127.0.0.1:5432` já respondia antes de qualquer mudança. `pg_hba.conf` já tinha `host all all 127.0.0.1/32 trust`, então nenhuma edição de auth foi necessária pra conexão local funcionar.
- `CREATE ROLE homelab_dash LOGIN PASSWORD '<gerada>'` + `CREATE DATABASE homelab_dash OWNER homelab_dash` — senha de 32 chars gerada com `/dev/urandom`, entregue ao usuário fora deste arquivo (não fica documentada aqui).
- **Isolamento do n8n exigiu um passo a mais do que o esperado**: por padrão o Postgres concede `CONNECT` a `PUBLIC` em todo database novo, então mesmo com database próprio o role novo conseguia conectar no `n8n` (verificado, `SELECT 1` funcionava). `REVOKE CONNECT ON DATABASE n8n FROM homelab_dash` sozinho **não bastou** (o privilégio via `PUBLIC` prevalece) — precisou de `REVOKE CONNECT ON DATABASE n8n FROM PUBLIC`. Confirmado que isso não quebra o n8n (ele conecta como `u0_a286`, que é superuser e ignora GRANT/REVOKE).
- `pg_hba.conf` continua com `trust` pra qualquer conexão de `127.0.0.1`/`::1` — isso vale pra **qualquer role**, não só `homelab_dash`. Não mexi nisso (fora do escopo desta issue, e endurecer authentication method é uma mudança de política que afeta o n8n também) — só registrando que a senha do `homelab_dash` não é hoje o único fator protegendo o acesso local a esse Postgres.
- `DATABASE_URL` também já foi adicionado direto no `.env` real do Master (`$HOME/homelab-dash/.env`, confirmado via SSH que é a mesma cópia que roda a dashboard hoje — `.git` presente aí, não é mais uma cópia solta), sem alterar as linhas existentes. Nenhum código ainda lê essa variável (entra na issue 02).
