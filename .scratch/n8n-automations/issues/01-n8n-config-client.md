Status: done

# Config + cliente do n8n

Adicionar `N8N_URL` e `N8N_API_KEY` ao `.env.example` (documentado, sem valor real) e ao `.env` (valor real do Master).

Criar `lib/n8n.ts`: cliente server-only que fala com `{N8N_URL}/api/v1`, autenticado via header `X-N8N-API-KEY`. Expõe:

- `n8nConfigured(): boolean`
- `fetchAutomationsOverview(): Promise<{ workflows: N8nWorkflowHealth[]; recentExecutions: N8nExecution[] }>`

Busca `/workflows?limit=250` e `/executions?limit=50` em paralelo, normaliza o status de execução (a API do n8n variou esse formato entre versões — trata `status` string quando presente, senão deriva de `finished`/`stoppedAt`), monta o mapa id→nome de workflow pra popular `workflowName` nas execuções, e filtra `workflows` só pros ativos.

Tipos (`N8nExecutionStatus`, `N8nExecution`, `N8nWorkflowHealth`) entram em `lib/types.ts`, não em `lib/n8n.ts` — mesmo padrão de `NodeStats`/`ServiceStat`, pra poder ser importado por componentes client sem puxar o código server-only junto.

Ver contrato completo em `spec.md`.
