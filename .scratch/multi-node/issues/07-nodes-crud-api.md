Status: ready-for-agent

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
