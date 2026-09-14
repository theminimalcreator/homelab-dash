Status: ready-for-agent

Blocked by: 04

# Coletar Services via Docker (além de PM2)

A VPS não roda PM2 — roda containers Docker que o usuário quer monitorar na mesma tabela de Services. Ver spec.md, seção "Services: PM2 + Docker na mesma tabela".

## Tarefa

- Em `lib/collectNodeStats.js`, `getServices()` passa a receber o `servicesRuntime` do Node (`pm2` | `docker` | `none`) e ramifica:
  - `pm2`: comportamento atual, sem mudança (`pm2 jlist`)
  - `docker`: nova função `getDockerServices()` combinando `docker ps -a --format '{{json .}}'` (nome/status) + `docker stats --no-stream --format '{{json .}}'` (cpu/mem) + `docker inspect` pro restart count (`.RestartCount`) e uptime (`.State.StartedAt`) — casar os três por nome/ID de container
  - `none`: retorna `[]` sem tentar shell-out nenhum
- Cada linha de service ganha um campo `runtime: 'pm2' | 'docker'` no payload (consumido pela issue 11)
- Mesmo tratamento best-effort do resto do collector: falha de qualquer comando Docker retorna lista vazia, não derruba a resposta inteira

## Aceite

- Rodando num host sem Docker (`services_runtime !== 'docker'`), nenhum comando `docker` é executado
- Rodando na VPS (uma vez com Docker configurado — issue 14), `services` inclui os containers rodando, cada um com `runtime: 'docker'`
