Status: done

# Validar contra o n8n real do Master

Validado em 2026-09-18 via SSH no Master, com `curl` contra a API real.

## O que estava errado

O `.env` do Master não tinha `N8N_URL` nem `N8N_API_KEY` — só o checkout de dev tinha, e com uma key que o n8n rejeitava (`{"message":"Unauthorized"}`). Uma key nova foi gerada em n8n Settings > API e aplicada em `~/homelab-dash/.env` no Master.

## Resultado da validação

`lib/n8n.ts` **não precisou de nenhuma mudança**. Confirmado contra a instância real:

- Ambos os endpoints devolvem o envelope `{"data":[...]}`, como o código já esperava.
- O campo `status` vem como string. Valores observados: `success`, `error`, `canceled` — todos já cobertos pela lista `known` de `normalizeStatus`.
- Existem execuções com `finished: false` e `status: "error"`. Ou seja, derivar o status de `finished` daria resultado **errado** — a precedência do `status` string em `normalizeStatus` está correta e é necessária.
- As execuções **não** trazem `workflowName`. O mapa `id → nome` montado a partir de `/workflows` é obrigatório, como o spec previu.
- As execuções vêm em ordem decrescente de id, então `recentExecutions.find(...)` de fato devolve a última execução de cada workflow (confirma o comentário em `lib/n8n.ts`).
- `mode` vem preenchido (todas `manual` nesta instância).

Estado da instância no momento da validação: 2 workflows (1 ativo), 14 execuções.

## Ponta solta conhecida

O status `new` (execução enfileirada) não está na lista `known` e cai na derivação por `finished`/`stoppedAt`, virando `running`. Não apareceu nesta instância e o mapeamento é razoável — não vale código extra até fazer falta na prática.
