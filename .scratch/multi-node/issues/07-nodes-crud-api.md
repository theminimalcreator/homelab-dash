Status: resolved (2026-09-14) — deployado no Master (usuário topou o risco de ficar sem login por enquanto). Testado fim-a-fim (`next dev` local + túnel SSH pro Postgres do Master) contra o database real: GET lista os 3 seeds, POST valida campos obrigatórios e cria, GET por id, PATCH parcial, conflito de `is_self` devolve 400 (não 500), validação de `sshPort`, DELETE + 404 depois. Nó de teste criado e apagado, os 3 originais intactos.

Blocked by: 02

# API CRUD de Nodes

Rotas server-side pra gerenciar a tabela `nodes` — base pra tela de CRUD (issue 08) e pro agregador (issue 09) ler a lista. Ver spec.md, seção "Armazenamento dos Nodes".

## Tarefa

- `app/api/nodes/route.ts`: `GET` (lista todos), `POST` (cria)
- `app/api/nodes/[id]/route.ts`: `GET` (um), `PATCH` (edita), `DELETE` (remove)
- Validação básica de payload (campos obrigatórios: `name`, `kind`, `stats_url`; `services_runtime` só aceita os 3 valores válidos)
- Essas rotas ficam atrás do login (issue 12) — não expor CRUD de Nodes (incluindo tokens/SSH) sem auth

## Aceite

- `POST /api/nodes` com um payload válido cria a linha e devolve o registro com `id`
- `PATCH` num Node inexistente devolve `404`
- `DELETE` remove a linha
