Status: resolved (2026-09-14) — testado contra o Postgres real (túnel SSH): Master via coleta em processo, Dev Node via HTTP real (token ainda não obrigatório, ver Comments), VPS `offline` sem tentar fetch (sem `stats_url`). `tsc`/`eslint` limpos.

Blocked by: 02, 06

## Comments

**2026-09-14** — O Dev Node ainda não exige `X-Node-Token` porque o processo do `alpine-agent` ao vivo é o código de antes da issue 06 (o deploy daquela issue foi segurado de propósito). Vou ativar o token de verdade (gerar, salvar no Postgres via `/api/nodes`, colocar no `.env` do Dev Node, e só então deployar 06+09+10 juntas) — ver issue 10.

# Endpoint agregador `/api/cluster`

Substitui o modelo de fetch client-side direto por Node. Ver spec.md, seção "Coleta: agregação server-side".

## Tarefa

- `app/api/cluster/route.ts`: lê todos os Nodes do Postgres, busca as stats de cada um:
  - Se `is_self` (ou `stats_url` bate com a URL do próprio server): chama `collectNodeStats` em processo, sem HTTP
  - Senão: `fetch(node.stats_url, { headers: { 'X-Node-Token': node.auth_token } })`
- Usa `Promise.allSettled` — um Node offline/lento não derruba a resposta dos outros; Node com erro/timeout entra no payload como `online: false`
- Latência entre peers vira hub-and-spoke: `getNetwork(peerUrl)` do collector recebe sempre a `stats_url` do Master (não mais um `.env` fixo por par)
- Payload de resposta: lista de `{ node: {id, name, kind, subtitle}, online, stats }`

## Aceite

- `curl http://localhost:3000/api/cluster` devolve todos os Nodes cadastrados, incluindo o Master (via chamada em processo) e a VPS (via HTTP com token)
- Desligar um Node (parar o Agent dele) faz ele aparecer como `online: false` no payload, sem quebrar os outros
