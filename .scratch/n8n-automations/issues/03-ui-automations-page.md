Status: done

# Página `/automations`

- `components/automations-table.tsx`: tabela de workflows ativos — Nome, Status (badge da última execução), Última execução (relativo), Duração. Exporta `n8nStatusVariant`/`n8nStatusLabel` pra reuso no log.
- `components/automations-log.tsx`: tabela das execuções recentes (todos os workflows, não só ativos) — Workflow, Status, Modo, Quando, Duração.
- `app/(app)/automations/page.tsx`: página client, mesmo padrão de polling de `app/(app)/nodes/page.tsx` (fetch em `useEffect` + `setInterval`, 5s — não precisa do 3s do dashboard principal). Trata os três estados: não configurado, erro de rede com o n8n, e dados normais.
- `lib/format.ts` ganha `formatRelativeTime` e `formatExecutionDuration`.
