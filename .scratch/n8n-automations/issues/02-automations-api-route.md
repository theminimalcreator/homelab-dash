Status: done

# Rota `GET /api/automations`

`app/api/automations/route.ts`, protegida pelo middleware de auth existente (nenhuma config nova de auth necessária).

- Se `n8nConfigured()` for `false`: devolve `{ configured: false, workflows: [], recentExecutions: [], error: null }` (200).
- Senão, chama `fetchAutomationsOverview()`; erro de rede/HTTP vira `{ configured: true, workflows: [], recentExecutions: [], error: "<mensagem>" }` com status 502 — nunca deixa a exception subir.

A API key do n8n nunca aparece no payload (ela nem chega perto — fica só dentro de `lib/n8n.ts`).
