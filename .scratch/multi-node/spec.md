# Multi-node: Nodes ilimitados + Postgres/CRUD + primeira VPS

Status: draft — definido via `/grilling` (2026-09-14), aguardando quebra confirmada antes de implementar.

## Motivação

Hoje o Cluster é hardcoded pra exatamente 2 Nodes (Master, Dev Node): `app/page.tsx` tem dois `useState` fixos e dois `<NodeCard>` literais, a única URL externalizada é a do Dev Node (via `.env`), e SSH user/porta são globais pros dois. Isso não escala — nem pra adicionar mais celulares, nem pra tipos de máquina diferentes. O usuário já tem uma VPS (Ubuntu, roda serviços via Docker) que quer adicionar, e quer o cluster pronto pra crescer além disso.

## Escopo

### Vocabulário

`Node` deixa de significar "telefone Android" e passa a ser qualquer máquina monitorada, com um campo `kind` (ex: `termux-master`, `termux-dev`, `linux-vps`). `CONTEXT.md` é atualizado (issue 15).

### Armazenamento dos Nodes: Postgres + CRUD

Sai do `.env`/hardcode. Reaproveita o Postgres que já roda no Master (Termux, usuário `u0_a286`, hoje usado pelo n8n) — cria um **database e role dedicados** (`homelab_dash`), isolado do schema do n8n (issue 01).

Tabela `nodes` (schema definitivo na issue 02), guardando por Node:
- `name`, `subtitle`, `kind`
- `stats_url` (server-side) — não existe mais `NEXT_PUBLIC_*` de URL de Node nenhuma
- `ssh_user`, `ssh_port`
- `auth_token` (shared secret, ver seção Segurança)
- flags de capacidade: `tracks_claude_code`, `tracks_wake_lock`, `services_runtime` (`pm2` | `docker` | `none`)
- `is_self` (ou comparação de URL — ver seção Agregação) pro Master identificar a própria linha

Acesso ao banco via driver `pg` cru + pasta `migrations/` com SQL simples numerado (sem ORM — mantém a filosofia zero-dependência que o collector já segue).

CRUD exposto em `/api/nodes` (issue 07) e numa tela `/nodes` (issue 08): listar, criar, editar, apagar Nodes.

### Coleta: agregação server-side

Sai do modelo atual (browser faz `fetch` direto pra cada Node, incluindo `NEXT_PUBLIC_DEV_NODE_URL`). Entra um endpoint `/api/cluster` (issue 09) que roda no Next.js do Master, lê a lista de Nodes do Postgres, busca todos (`Promise.allSettled`, um Node lento/offline não trava os outros) e devolve um payload agregado. O browser só fala com o Master — nunca mais com IP de Node nenhum.

Exceção: o Master continua coletando a própria stats **em processo** (sem HTTP) — o agregador detecta "essa linha da tabela sou eu" (comparando `stats_url` com a URL do próprio server, ou via `is_self`) e chama `collectNodeStats` direto.

`app/page.tsx` (issue 10) troca os dois `fetch`/`useState` hardcoded por um polling único em `/api/cluster`, renderizando os `NodeCard`s dinamicamente (grid responsivo, pensado pra ~3-6 Nodes) em vez de dois cards literais.

### Segurança

- **Token por Node**: cada Node exige um shared-secret via header (`X-Node-Token` ou similar) nas chamadas de stats (issue 06). Como a agregação é server-side, esse token nunca chega ao browser.
- **Login do app inteiro**: dashboard inteiro (não só `/nodes`) fica atrás de uma senha simples, uma só, compartilhada — guardada em `.env` (`ADMIN_PASSWORD`), não no banco (issue 12).

### Generalização do collector

`lib/collectNodeStats.js` tem hoje um parâmetro binário `role: 'master' | 'dev'` que decide se coleta `claudeCodeActive`/`wakeLock`. Isso vira flags de capacidade explícitas, vindas do config do Node (issue 04), em vez de mais um branch por role. O resto do collector (disco, temp, bateria, wifi) já é best-effort/`null`-safe e não muda pra funcionar numa VPS Linux comum.

### Services: PM2 + Docker na mesma tabela

Hoje `services` vem só de `pm2 jlist`. A VPS não roda PM2 — roda containers Docker que o usuário quer monitorar. O collector ganha uma segunda fonte de `services` via `docker ps` / `docker stats --no-stream` / `docker inspect`, escolhida pela flag `services_runtime` do Node (issue 05). A tabela de Services do dashboard continua única (não separa por tipo), com uma coluna `runtime` (`pm2` | `docker`) indicando a origem de cada linha (issue 11).

O Agent da VPS roda **direto no host**, gerenciado por `systemd` — não dentro de um container (rodar o Agent em Docker só pra ele inspecionar os *outros* containers via socket montado não trouxe ganho real). O usuário do Agent entra no grupo `docker` do host pra ter acesso ao socket (issue 14).

### Latência entre peers

Modelo atual (`peerLatencyMs` contra um único peer fixo por `.env`) vira **hub-and-spoke**: todo Node pinga só o Master, não malha completa entre todos os Nodes.

### UI: Sidebar

Novo layout com sidebar fixo (não colapsável — dashboard já é desktop-only), com 5 itens (issue 13):
- `Dashboard` (`/`) e `Nodes` (`/nodes`) — funcionais, cobertos por esta leva
- `Settings`, `Services` (como página própria com controle liga/desliga), `Alerts` (histórico) — **visíveis mas desabilitados**, placeholder visual sem rota/lógica por trás. Fora de escopo desta leva (ver "Fora de escopo").

## Fora de escopo (adiado deliberadamente)

- **Settings / MCP server pra IA**: usuário quer expor um MCP server pra IAs lerem (e possivelmente agirem sobre) o status dos Nodes — ainda não decidiu o que vai liberar pra IA fazer. Precisa de `/grilling` próprio antes de qualquer código, especialmente em torno de que acesso de escrita (se algum) uma IA teria.
- **Services: liga/desliga**: mostrar Services já entra nesta leva (issue 11); controlar (start/stop) um processo PM2 ou container Docker pelo dashboard é feature nova — vira o dashboard de monitoramento puro em plano de controle, com implicações de segurança reais (ainda mais combinado com o MCP acima). Não desenhado aqui.
- **Alerts: histórico**: o banner de alertas ao vivo continua como está; persistir histórico é feature nova, não coberta.
- **Dockerizar o Master**: só a VPS entra com Agent+Docker nesta leva; o Master continua Termux puro.
- **Mobile / light theme**: seguem fora de escopo, herdado do spec anterior (`dashboard-v2`).

## Vocabulário

Ver `CONTEXT.md` (issue 15 atualiza) — este spec usa `Node`, `Master`, `Dev Node`, `Cluster`, `Node Stats`, `Agent`, `Service` como definidos lá, mais `kind` e `services_runtime` como conceitos novos.
