Status: resolved (2026-09-14) — `tsc --noEmit` e smoke-test local confirmam comportamento idêntico ao `role` antigo; lint pré-existente (require() em CJS) não é regressão, confirmado via `git stash`

# Generalizar `role` do collector pra flags de capacidade

`lib/collectNodeStats.js` hoje recebe `role: 'master' | 'dev'` e decide num único `if (role === 'dev')` se coleta `claudeCodeActive`/`wakeLock`. Isso não escala pra tipos de Node novos (ex: VPS). Ver spec.md, seção "Generalização do collector".

## Tarefa

- Trocar a assinatura de `collectNodeStats({ role, peerUrl })` por `collectNodeStats({ peerUrl, capabilities })`, onde `capabilities` é `{ tracksClaudeCode, tracksWakeLock }` (vindo da linha do Node no Postgres, issue 02)
- `claudeCodeActive` só é coletado se `capabilities.tracksClaudeCode`; `wakeLock` só se `capabilities.tracksWakeLock`
- Atualizar os dois call sites (`app/api/stats/route.ts` e `agent/index.js`) — nesta issue eles ainda podem passar as flags hardcoded (a leitura via Postgres entra nas issues 07/09); só a assinatura do collector muda aqui
- Resto do collector (disco, temp, bateria, wifi, `getServices` via pm2) não muda nesta issue — `services_runtime` é tratado na issue 05

## Aceite

- `collectNodeStats` não tem mais nenhuma referência a `role === 'dev'`/`'master'`
- Comportamento observável idêntico ao de hoje quando chamado com as mesmas capacidades que Master/Dev Node já tinham
