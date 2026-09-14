Status: resolved (2026-09-14) — migrations 002/003 aplicadas no Master, 3 linhas confirmadas via `SELECT` (Master `is_self=t`, VPS em rascunho com `stats_url` NULL)

Blocked by: 02

# Seed inicial: Master, Dev Node e VPS

Popular a tabela `nodes` com o que já sabemos, pra o dashboard não nascer vazio no primeiro deploy dessa mudança. Ver spec.md, seção "Armazenamento dos Nodes".

## Tarefa

- Migration de seed (`00X_seed_initial_nodes.sql` ou script separado, decidir junto com a issue 02) inserindo:
  - **Master**: `name=Master`, `subtitle=Poco X3 GT`, `kind=termux-master`, `stats_url` = valor atual de `MASTER_URL`/local, `ssh_user=u0_a348`, `ssh_port=8022`, `services_runtime=pm2`, `is_self=true`
  - **Dev Node**: `name=Dev Node`, `subtitle=Redmi Note 12 5G`, `kind=termux-dev`, `stats_url` = valor atual de `DEV_NODE_URL`, `ssh_user=u0_a348`, `ssh_port=8022`, `tracks_claude_code=true`, `tracks_wake_lock=true`, `services_runtime=pm2`
  - **VPS**: `name=VPS`, `kind=linux-vps`, `services_runtime=docker` — `stats_url`, `ssh_user`, `ssh_port`, `auth_token` ficam em branco/placeholder (usuário completa depois pela tela `/nodes`, issue 08)

## Aceite

- Depois do seed, `SELECT name, kind FROM nodes` devolve as 3 linhas
- Linha do Master tem `is_self=true` e nenhuma outra tem
