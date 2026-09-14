Status: resolved (2026-09-14) — `claudeCodeActive` validado (detectou a própria sessão rodando); `wakeLock.requestedAtBoot` implementado, mas `requestWakeLockOnce()` ainda não é chamado por ninguém no startup do Agent (falta ligar isso na issue 08)

# Collector: extras exclusivos do Dev Node

Claude Code ativo e wake lock por proxy — só fazem sentido no Dev Node. Ver spec.md, "Escopo" → "Específico do Dev Node" e "Alertas".

## Tarefa

- `claudeCodeActive` — `pgrep -x claude`, boolean simples (processo existe ou não)
- `wakeLock.requestedAtBoot` — o `agent/index.js` chama `termux-wake-lock` uma vez ao iniciar (dentro de um try/catch, sem derrubar o processo se falhar) e guarda o resultado em memória; o Agent expõe esse boolean como está, deixando claro que é uma inferência ("eu pedi o wake lock"), não uma leitura de estado real do Android — não existe jeito sem root de confirmar se ainda está ativo

Esses dois campos só aparecem no payload quando o role é `dev` (o Master não expõe `claudeCodeActive`/`wakeLock`).

## Aceite

- Campo `claudeCodeActive` reflete corretamente processo rodando/parado
- Campo `wakeLock.requestedAtBoot` presente e documentado como proxy (comentário no código explicando a limitação, pra não virar confusão depois)
