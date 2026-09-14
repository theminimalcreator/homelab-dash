Status: resolved (2026-09-14) — validado ao vivo nos dois Nodes, inclusive o bug do `df -h /` corrigido

# Collector: hardware + services (sem dependências externas)

Início do módulo compartilhado `lib/collectNodeStats.js`. Cobre só o que já funciona hoje sem instalar nada em nenhum dos dois celulares. Ver spec.md, seções "Contrato de dados" e "Arquitetura".

## Tarefa

Criar `lib/collectNodeStats.js` (CommonJS puro, zero deps) exportando uma função que coleta:

- `hardware.totalMem` / `freeMem` / `loadAvg` / `uptime` (via `os`, já existe em `/api/stats`, só mover pra cá)
- `hardware.disk` — parsear `df -h /` em `{ total, used, available, usePercent }`
- `hardware.cpuTempC` / `hardware.batteryTempC` — descoberta em runtime de `/sys/class/thermal/thermal_zone*/type` procurando padrões conhecidos (`cpu_therm`, `cpuss`, `battery`, etc). Cachear o índice da zona encontrada em memória (ou o "bloqueado", se a leitura do diretório falhar com Permission denied) pra não escanear de novo a cada chamada. Retornar `null` quando indisponível — **não** lançar erro (confirmado que o Master tem essa classe inteira bloqueada por sysfs; o Dev Node não)
- `services` — `pm2 jlist`, mapeado pra `{ name, status, cpu, mem, restarts, uptimeMs }`. Roda igual nos dois Nodes (não é mais exclusivo do Master)

Todo campo indisponível retorna `null`, nunca omitido nem `0`/`false` por padrão.

## Aceite

- Rodar a função tanto no Dev Node (via `node -e`) quanto no Master (via SSH) e conferir que bate com a matriz de disponibilidade do spec (temp `null` no Master, presente no Dev Node)
- Nenhuma exceção não tratada quando um comando (`df`, `pm2`) falha
