Status: ready-for-agent

# Config `.env` pros IPs/URLs dos Nodes

Hoje o IP do Dev Node está hardcoded em `app/page.tsx` (`http://192.168.15.52:3001`) — a causa original do card aparecer "offline" quando o IP muda por DHCP. Ver spec.md, seção "Configuração".

## Tarefa

- Criar `.env.example` (e `.env`, gitignored) na raiz com:
  ```
  DEV_NODE_URL=http://192.168.15.52:3001
  MASTER_URL=http://192.168.15.43:3000
  ```
- `app/page.tsx` (ou a rota que fizer o fetch) passa a ler `DEV_NODE_URL` em vez do hardcode
- `agent/index.js` passa a ler `MASTER_URL` do ambiente pra saber pra quem pingar (usado na issue 06, latência entre peers)
- Confirmar que `.env` já está no `.gitignore` (checar o gitignore existente do projeto)

## Aceite

- Nenhum IP hardcoded restante em `app/page.tsx` ou `agent/index.js`
- Trocar o `.env` e reiniciar é suficiente pra apontar pra um IP novo, sem editar código
