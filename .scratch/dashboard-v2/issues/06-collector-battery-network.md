Status: ready-for-agent

Blocked by: 03, 05

# Collector: bateria + rede (dependem de termux-api e do .env)

Continuação do `lib/collectNodeStats.js` da issue 04. Ver spec.md, "Contrato de dados".

## Tarefa

- `battery.percent` / `battery.charging` — via `termux-battery-status` (parse do JSON). `null` se o comando falhar ou não existir
- `network.localIp` — via `os.networkInterfaces()`, pegando o IPv4 não-interno da interface wifi (não usar `ip addr`/`ifconfig` via shell — confirmado que `ip addr` falha por permissão dentro do proot; `os.networkInterfaces()` do Node já resolve isso nativamente)
- `network.peerLatencyMs` — `ping -c 1 -W 2 <peer>` (peer vem de `DEV_NODE_URL`/`MASTER_URL` do `.env`, issue 03), parseado do output
- `network.externalLatencyMs` — mesma lógica, pingando `1.1.1.1`
- `network.connectionType` / `network.wifiSignalDbm` — via `termux-wifi-connectioninfo` (parse do JSON). `null` se indisponível

## Aceite

- Todos os campos retornam `null` graciosamente quando o comando subjacente falha (sem exceção não tratada)
- Testado nos dois Nodes depois que a issue 05 estiver concluída
