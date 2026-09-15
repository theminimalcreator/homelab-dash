Status: resolved (2026-09-14) — testado com uma cópia temporária do Agent numa porta alternativa: sem header 401, header errado 401, header certo 200 com payload normal. **Código commitado mas deploy do Dev Node segurado de propósito** (ver Comments) — reiniciar o `alpine-agent` agora quebraria o card do Dev Node no dashboard ao vivo, já que ele ainda busca o Agent direto do browser sem enviar token nenhum (issue 10 ainda não trocou isso). Vai junto com o deploy das issues 07-10.

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

## Comments

**2026-09-14** — Decisão de sequenciamento: o código está pronto e commitado, mas **não reiniciei o `alpine-agent` do Dev Node** depois desse commit. Hoje (antes da issue 10) o dashboard ao vivo ainda busca o Agent do Dev Node direto do browser, sem enviar `X-Node-Token` nenhum — reiniciar o Agent agora faria esse card virar "offline" até a issue 10 entrar. Vou segurar o deploy dessa issue e deployar junto com 07-10, quando o agregador (que manda o token) também estiver no ar. `AGENT_TOKEN` também ainda não foi definido no `.env` real de nenhum Node — isso acontece quando cadastrarmos os tokens no Postgres (issue 08) e replicarmos pro `.env` de cada Node.
