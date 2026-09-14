Status: resolved (2026-09-14)

# Fix Agent deploy no Dev Node

O processo PM2 `alpine-agent` roda de `/root/agent.js`, um arquivo solto fora do repo (hoje idêntico a `agent/index.js`, mas sem garantia — não tem deploy automatizado). Ver spec.md, seção "Arquitetura".

## Tarefa

- Repontar o PM2 pra rodar `agent/index.js` direto do checkout do repo (`/root/Projects/homelab-dash/agent/index.js`), com `cwd` correto
- `pm2 save` pra persistir a mudança
- Confirmar que `git pull` + `pm2 restart alpine-agent` funciona como fluxo de deploy
- Remover/aposentar `/root/agent.js` depois de confirmar que o novo processo sobe igual

## Aceite

- `pm2 describe alpine-agent` mostra `script path` apontando pro repo
- Endpoint na porta 3001 continua respondendo normalmente depois da troca
