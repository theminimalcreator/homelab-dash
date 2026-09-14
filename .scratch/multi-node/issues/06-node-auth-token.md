Status: ready-for-agent

# Autenticação por token entre Master e Agents

Hoje `agent/index.js` responde sem nenhuma auth, `Access-Control-Allow-Origin: *`. Com a VPS potencialmente alcançável pela internet pública, isso deixa de ser aceitável. Ver spec.md, seção "Segurança".

## Tarefa

- `agent/index.js` passa a exigir um header (`X-Node-Token`) em toda requisição, comparando contra um `AGENT_TOKEN` lido do próprio `.env` local daquele Node (cada Agent só conhece o próprio token, não tem acesso ao Postgres)
- Requisição sem o header ou com token errado devolve `401`
- `app/api/stats/route.ts` (o próprio Master) não precisa desse check — é chamada em processo, nunca por rede (ver issue 09)
- O agregador (`/api/cluster`, issue 09) é quem envia o header, usando o `auth_token` que leu da linha do Node no Postgres — trabalho de "enviar o token" fica documentado aqui mas implementado lá, pra não duplicar
- Remover o `Access-Control-Allow-Origin: *` do Agent — não faz mais sentido já que o browser nunca mais chama o Agent direto (issue 09/10)

## Aceite

- `curl http://<vps>:3001` sem header devolve `401`
- `curl -H "X-Node-Token: <token certo>" http://<vps>:3001` devolve o payload normal
