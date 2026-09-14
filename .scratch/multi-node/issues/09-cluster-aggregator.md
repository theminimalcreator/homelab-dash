Status: ready-for-agent

Blocked by: 02, 06

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
