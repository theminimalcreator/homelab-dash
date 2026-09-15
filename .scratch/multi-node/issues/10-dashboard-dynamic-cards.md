Status: resolved (2026-09-14) — testado contra o Postgres real: `GET /` 200, `/api/cluster` retornando `sshUser`/`sshPort` por Node (o botão SSH agora é por Node, não mais env global — mudança adicional não listada originalmente nesta issue, mas necessária pra fazer sentido com N nodes heterogêneos). `app/api/stats/route.ts` removido (superado pelo agregador, ninguém mais o chamava). Não validado visualmente em browser (mesma limitação da issue 08).

Blocked by: 09

# Dashboard consome `/api/cluster`, cards dinâmicos

`app/page.tsx` hoje tem dois `useState`/`fetch` hardcoded e dois `<NodeCard>` literais. Ver spec.md, seção "Coleta: agregação server-side".

## Tarefa

- Trocar os dois fetches (`/api/stats` + `DEV_NODE_URL` direto) por um único polling em `/api/cluster` a cada 3s
- Remover `NEXT_PUBLIC_DEV_NODE_URL` e qualquer URL de Node do lado client — o browser não conhece mais IP de Node nenhum
- Renderizar um `<NodeCard>` por item da resposta (`.map`), em vez de dois JSX literais
- Grid responsivo (`grid-cols-[repeat(auto-fill,minmax(...))]` ou equivalente) em vez de `grid-cols-2` fixo — pensado pra ~3-6 Nodes
- `computeAlerts` e a montagem de `serviceRows` passam a iterar sobre a lista dinâmica em vez dos dois nomes hardcoded (`"Master"`/`"Dev Node"`)

## Aceite

- Adicionar um Node pela tela `/nodes` (issue 08) faz um card novo aparecer no dashboard, sem rebuild
- Com 3 Nodes cadastrados (Master, Dev Node, VPS), os 3 cards aparecem lado a lado/quebrando linha, não só 2
