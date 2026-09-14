Status: ready-for-agent

Blocked by: 01, 04, 06, 07

# Ligar o collector nos dois endpoints

Substituir a lógica atual de `app/api/stats/route.ts` e `agent/index.js` pelo `lib/collectNodeStats.js`, adotando o contrato `Node Stats` em seções descrito no spec.md (`hardware`, `battery`, `network`, `services`, mais os campos exclusivos do Dev Node).

## Tarefa

- `app/api/stats/route.ts` passa a chamar `collectNodeStats({ role: 'master' })` e devolver o payload novo (em vez da estrutura antiga só com `hardware`/`services`)
- `agent/index.js` passa a chamar `collectNodeStats({ role: 'dev' })`
- Remover a lógica duplicada que hoje existe em cada um dos dois arquivos (fica só no `lib/collectNodeStats.js`)
- **Isso quebra o client atual** (`app/page.tsx` lê `localStats.hardware.totalMem` e `alpineStats.totalMem` direto, em formatos diferentes) — o ajuste do client é a issue 10, não misturar aqui

## Aceite

- `curl http://localhost:3000/api/stats` e `curl http://<dev-node>:3001` devolvem o mesmo formato (seções), só variando o que cada um consegue preencher
- `agent/index.js` continua zero-dependência (só `require`s built-in do Node + o `lib/collectNodeStats.js` local)
