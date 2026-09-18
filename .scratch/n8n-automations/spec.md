# Automações (n8n): tela de saúde e log de execuções

Status: implementado e validado ao vivo — escopo definido via perguntas diretas ao usuário (sem `/grill-me`).

## Motivação

O `Master` já roda automações de usuário no n8n (Postgres compartilhado, ver `.scratch/multi-node/spec.md`). O spec anterior (`dashboard-v2/spec.md`) já previa isso e deixou registrado: "quando existir, considerar consumir a API de execução do n8n em vez de parsear logs de cron do zero". Esse spec implementa essa parte, hoje fora de escopo do dashboard.

## Escopo

- **Fonte de dados**: API REST do n8n (`/api/v1`), rodando localmente no Master em `http://127.0.0.1:5678`, autenticada via header `X-N8N-API-KEY`.
- **Quais workflows**: todos os workflows **ativos** no n8n — sem lista curada.
- **Saúde**: por workflow ativo, status da última execução (sucesso/erro/rodando) e há quanto tempo.
- **Log**: lista das execuções mais recentes across todos os workflows (não só os ativos, pra não esconder execuções de um workflow desativado recentemente), com status, modo (manual/trigger/webhook) e duração.
- **Onde aparece**:
  - Página própria `/automations`, no sidebar (mesmo padrão de `/nodes`).
  - Resumo compacto também na página principal do dashboard, ao lado dos cards de Node/Services.
- **Autenticação/rede**: a API key do n8n só é usada server-side (`app/api/automations/route.ts` → `lib/n8n.ts`), nunca enviada ao browser — mesmo padrão já usado pro `authToken` dos Nodes em `app/api/cluster/route.ts`.

## Fora de escopo

- Criar/editar/disparar workflows a partir do dashboard — só leitura.
- Alertas cross-node existentes (`lib/alerts.ts`) não ganham uma regra nova para automações com falha nessa primeira leva; fica pra depois, se fizer falta na prática.
- Paginação da API do n8n: busca até 250 workflows e as últimas 50 execuções, suficiente pro volume de um homelab. Sem scroll infinito nem paginação na UI.

## Contrato de dados

`lib/n8n.ts` fala com o n8n e normaliza a resposta (a API do n8n varia o formato de status entre versões — trata `status` string quando presente, senão deriva de `finished`/`stoppedAt`):

```ts
type N8nExecutionStatus = "success" | "error" | "running" | "waiting" | "canceled" | "crashed" | "unknown";

type N8nExecution = {
  id: string;
  workflowId: string;
  workflowName: string | null;
  status: N8nExecutionStatus;
  mode: string;
  startedAt: string | null;
  stoppedAt: string | null;
};

type N8nWorkflowHealth = {
  id: string;
  name: string;
  active: boolean;
  lastExecution: N8nExecution | null;
};
```

`GET /api/automations` devolve:

```jsonc
{
  "configured": true,   // false se N8N_URL/N8N_API_KEY não estiverem setados no .env
  "error": null,        // string se o n8n estava inalcançável nessa tentativa
  "workflows": [/* N8nWorkflowHealth[], só ativos */],
  "recentExecutions": [/* N8nExecution[], últimas 50, todos os workflows */]
}
```

## Configuração

Novas variáveis no `.env` (já no `.gitignore`, nunca commitadas):

```
N8N_URL=http://127.0.0.1:5678
N8N_API_KEY=<token gerado em n8n Settings > API>
```

Sem essas duas, `/automations` mostra "n8n não configurado" em vez de erro.

## Nota de validação

Validado ao vivo contra o n8n do Master em 2026-09-18 — `lib/n8n.ts` não precisou de mudança. O campo `status` string existe nessa versão, e existem execuções com `finished: false` + `status: "error"`, o que confirma que a precedência do `status` sobre `finished` em `normalizeStatus` é necessária, não só defensiva. Detalhes em `issues/05-validate-live.md`.

## Vocabulário

Usa `Master` como definido em `CONTEXT.md`. Não introduz termo novo — "automação" e "execução" mapeiam 1:1 pro vocabulário do próprio n8n (workflow/execution), sem precisar de entrada nova em `CONTEXT.md`.
