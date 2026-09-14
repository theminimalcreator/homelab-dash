# Dashboard v2: monitoramento expandido do Cluster

Status: draft — definido via `/grill-me`, aguardando quebra em issues antes de implementar.

## Motivação

O dashboard hoje só mostra RAM/CPU/loadAvg e a lista de `Service`s do `Master`. O `Dev Node` fica quase sempre "offline" porque o Agent dele nem está versionado, e não existe visibilidade sobre bateria, temperatura, rede ou os tipos de falha que já são conhecidos nesse tipo de setup (celular que apaga a tela e mata processo em background, disco cheio, wifi caindo). Esse spec cobre a expansão de métricas e o redesenho da UI pra dar conta delas.

## Escopo

Tudo entra na mesma leva de implementação, exceto os itens listados em "Fora de escopo" abaixo.

### Hardware (por Node)
- CPU %, RAM % (já existe)
- Disco (`df -h`) — % usado e espaço livre
- Uptime do device (`os.uptime()`) — uptime de cada `Service` já vem do PM2, não precisa de campo novo
- Temperatura de CPU e de bateria via `/sys/class/thermal/thermal_zone*/temp`, **best-effort**: só disponível onde o sysfs não estiver bloqueado (ver matriz abaixo)

### Bateria (por Node)
- % de carga e se está carregando, via `termux-battery-status` (requer `termux-api` instalado — CLI + app companion)

### Rede (por Node)
- IP local via `os.networkInterfaces()` (sem shell-out)
- Latência até o Node peer via `ping -c 1 <peer>`, usando o IP configurado em `.env`
- Ping externo (`1.1.1.1`) pra sinalizar "tem internet"
- Tipo de conexão (wifi/dados) e força do sinal via `termux-wifi-connectioninfo` (requer `termux-api`)

### Serviços
- Lista de `Service`s (PM2) simétrica nos dois Nodes — hoje só o Master mostra isso; Dev Node passa a mostrar o que roda lá (ex: `alpine-agent`)
- Tabela única no dashboard com coluna "Node", em vez de duas listas separadas

### Específico do Dev Node
- Sessão do Claude Code ativa: `pgrep -x claude` (boolean simples)
- "Alpine/proot respondendo": não vira métrica própria — se o Agent respondeu ao HTTP request, o proot está de pé. Não faz sentido um healthcheck separado pra isso.

### Alertas
- Calculados no client (dashboard), não no Agent/API — Agent só reporta números crus
- Disco baixo (<10% livre)
- Wake lock: rastreado **por proxy** — o Agent lembra se ele mesmo chamou `termux-wake-lock` no boot, não é uma leitura real de estado do Android (não existe jeito sem root de confirmar se o wake lock ainda está de pé)
- Banner de alertas geral no topo do dashboard, cross-node (não um alerta por card)

## Fora de escopo (adiado deliberadamente)

- **Cron/automação (última execução, sucesso/falha)**: não existe nenhuma automação de usuário rodando hoje pra monitorar. Quando existir, considerar consumir a API de execução do `n8n` (já roda no Master) em vez de parsear logs de cron do zero.
- **Otimização de bateria desativada**: normalmente precisa de `dumpsys deviceidle whitelist`, que apps sem root não conseguem chamar no Android moderno. Sem alternativa viável encontrada.
- **Ping de gateway**: não dá pra descobrir o gateway automaticamente (tabela de rotas bloqueada por permissão nos dois Nodes) e pingar peer + externo já cobre a necessidade prática.
- **Mobile (responsivo)**: primeira versão é desktop-only. Mobile fica pra uma iteração futura.
- **Light theme / toggle**: dark-only por enquanto. UI deve usar CSS vars do shadcn pra não fechar a porta depois.

## Matriz de disponibilidade (validada ao vivo via SSH nos dois aparelhos)

| Métrica | Master (Poco X3 GT) | Dev Node (Redmi Note 12 5G) |
|---|---|---|
| CPU / RAM / disco / uptime | ✅ | ✅ |
| CPU temp (sysfs) | ❌ — thermal sysfs bloqueado nessa ROM (`Permission denied` até pra listar o diretório), sem alternativa sem root | ✅ — `thermal_zone74` (`cpu_therm`) |
| Battery temp (sysfs) | ❌ — mesmo bloqueio | ✅ — `thermal_zone87` (`battery`) |
| Battery % / carregando | ✅ (após instalar `termux-api`) | ✅ (após instalar `termux-api` — ainda não testado se a chamada atravessa o proot) |
| Wifi signal / tipo de conexão | ✅ (após `termux-api`) | ✅ (após `termux-api`, mesmo não-testado do item acima) |
| Latência até o peer | ✅ | ✅ |
| Claude Code ativo | n/a | ✅ |
| Wake lock (proxy) | n/a (não é um problema no Master, que não roda em proot) | ✅ |

`termux-api` (pacote CLI) hoje **não está instalado em nenhum dos dois celulares** — só os comandos básicos do Termux (ex: `termux-wake-lock`) existem. Instalar o pacote (`pkg install termux-api`) é mecânico; o app companion **Termux:API** (Play Store/F-Droid) só o usuário consegue instalar.

## Contrato de dados: Node Stats

Reestrutura o payload atual (que hoje é inconsistente: `/api/stats` do Master aninha em `hardware`, o Agent do Dev Node devolve tudo na raiz) em seções:

```jsonc
{
  "hardware": {
    "totalMem": 0, "freeMem": 0, "loadAvg": [0,0,0], "uptime": 0,
    "disk": { "total": "105.5G", "used": "22.5G", "available": "82.8G", "usePercent": 21 },
    "cpuTempC": 25.4,      // null se indisponível (ex: Master)
    "batteryTempC": 22.0   // null se indisponível
  },
  "battery": {
    "percent": 87, "charging": true   // null/omitido se termux-api indisponível
  },
  "network": {
    "localIp": "192.168.15.52",
    "peerLatencyMs": 15,
    "externalLatencyMs": 8,
    "connectionType": "wifi",   // "wifi" | "mobile" | null
    "wifiSignalDbm": -52        // null se indisponível
  },
  "services": [
    { "name": "alpine-agent", "status": "online", "cpu": 1, "mem": 12980224, "restarts": 0, "uptimeMs": 7834000 }
  ],
  "claudeCodeActive": true,   // só no Dev Node
  "wakeLock": { "requestedAtBoot": true }  // só no Dev Node, é o proxy — não é estado real
}
```

Campos indisponíveis retornam `null` (não omitidos, não `0`/`false`), pra o dashboard conseguir diferenciar "sem dado" de "dado é zero/desligado".

## Arquitetura

- **Módulo compartilhado** `lib/collectNodeStats.js` (CommonJS puro, zero deps, sem build step) — implementa a coleta acima. Importado por:
  - `app/api/stats/route.ts` (Master, via Next.js)
  - `agent/index.js` (Dev Node, standalone)
- Descoberta de zona térmica é feita em runtime (varre `/sys/class/thermal/thermal_zone*/type` procurando por padrões conhecidos tipo `cpu_therm`, `cpuss`, `battery`), com cache em memória do índice encontrado (ou do "bloqueado", pra não escanear de novo a cada poll de 3s). Se a leitura do diretório falhar (Permission denied), retorna `null` sem tentar de novo a cada chamada.
- `services` deixa de ser exclusivo do Master — os dois lados rodam `pm2 jlist` e retornam sua própria lista.
- **Fix de deploy do Agent**: hoje o processo PM2 `alpine-agent` no Dev Node roda de `/root/agent.js`, um arquivo solto fora do controle de versão (hoje idêntico ao `agent/index.js` do repo, por acaso — não por garantia). Repontar o PM2 pra rodar `agent/index.js` direto do checkout do repo, pra `git pull` + `pm2 restart alpine-agent` virar o fluxo de deploy real.
- **Deploy do Master — confirmado, não é um clone git**: investigado via SSH. `/data/data/com.termux/files/home/homelab-dash` é uma **cópia solta** do projeto (sem pasta `.git`; o Termux do Poco nem tem o binário `git` instalado), já com `node_modules` e um build de produção (`.next/`) gerados ali mesmo. `start-dash.sh` só faz `cd ~/homelab-dash && ./node_modules/.bin/next start -H 0.0.0.0 -p 3000`, sem nenhum passo de build/deploy automatizado.
  - `package.json` de lá **diverge** do repo: `next@16.3.4` (repo está em `16.3.5`) e tem `pm2` como dependência do projeto (aqui o `pm2` é só global, não entra no `package.json`).
  - Pra esse Node também virar `git pull` + restart como fluxo de deploy, precisaria: instalar `git` no Termux do Poco, clonar o repo de verdade (substituindo a cópia solta, com cuidado pra não perder nada que só existe lá), reconciliar a divergência de versão do `next` e da dependência `pm2`, e trocar `start-dash.sh` por um fluxo com build (`next build && next start`, hoje não roda build nenhum — o `.next/` que está lá pode já estar desatualizado em relação ao código-fonte que também está lá).
  - **Isso é uma mudança de infraestrutura em cima do dashboard que está em produção agora** — maior escopo que o fix do Agent (que era só repontar o PM2 pro caminho certo).
  - **Decisão**: fazer junto com o resto desse spec, não adiar. Abordagem: clonar o repo de verdade ao lado da cópia solta, comparar/validar que builda e sobe igual, só então trocar o `start-dash.sh`/PM2 pra apontar pro clone — sem derrubar o dashboard em produção no meio do processo.

## Configuração

Novo `.env` na raiz do repo, lido pelo dashboard (Master) e pelo Agent (Dev Node):

```
DEV_NODE_URL=http://192.168.15.52:3001
MASTER_URL=http://192.168.15.43:3000
```

Resolve o hardcode de IP que already causava o Dev Node aparecer como offline quando o IP mudava.

## Design / UI

- Migrar pra **shadcn/ui** junto com essa expansão (não depois — evita desenhar os cards duas vezes)
- **Dark-only**, usando CSS vars do shadcn (deixa aberto pra toggle futuro sem retrabalho)
- **Desktop-first**; mobile fica pra iteração futura
- Layout (ver wireframe ASCII na conversa original / issue de UI):
  - Banner de alertas geral no topo, cross-node
  - Dois cards lado a lado (Master / Dev Node), cada um com seções Hardware / Bateria / Rede / (Claude Code, só Dev Node)
  - Tabela única de Services com coluna "Node"
  - Cards ficam mais altos que hoje — sem colapsar seções

## Vocabulário

Ver `CONTEXT.md` — este spec usa os termos `Node`, `Master`, `Dev Node`, `Service`, `Cluster`, `Node Stats`, `Agent` como definidos lá.
