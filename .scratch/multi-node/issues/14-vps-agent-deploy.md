Status: ready-for-human

Blocked by: 04, 05, 06

# Deploy do Agent na VPS

Colocar o Agent rodando de verdade na VPS (Ubuntu). Ver spec.md, seção "Services: PM2 + Docker na mesma tabela" e "Fora de escopo".

Diferente das outras issues, essa mexe numa máquina que só o usuário tem acesso direto — fica como checklist pra execução manual (ou com o agente pedindo confirmação passo a passo, não rodando sozinho).

## Tarefa

- Clonar o repo na VPS (`git clone` — mesmo fluxo `git pull` + restart que já existe pros celulares)
- Instalar Node.js na VPS (versão compatível com o `agent/index.js`)
- Criar o usuário/serviço que vai rodar o Agent; adicionar esse usuário ao grupo `docker` (pra `docker ps`/`docker stats`/`docker inspect` funcionarem sem sudo)
- `.env` local do Agent na VPS: `AGENT_TOKEN` (mesmo valor cadastrado no campo `auth_token` desse Node via `/nodes`, issue 08), `MASTER_URL`
- Unit `systemd` pra manter o Agent no ar e subir no boot (`systemctl enable`)
- Atualizar a linha da VPS em `/nodes` com `stats_url` real (IP:porta da VPS) e `ssh_user`/`ssh_port` de verdade
- Confirmar o firewall básico que a VPS já tem libera a porta do Agent só pro IP de casa (ou pro que fizer sentido) — não deixar aberta pro mundo

## Aceite

- `systemctl status <agent-service>` mostra ativo na VPS
- `/api/cluster` (issue 09), rodando do Master, mostra a VPS como `online: true` com containers Docker reais na lista de Services
- Reiniciar a VPS sobe o Agent sozinho (systemd)
