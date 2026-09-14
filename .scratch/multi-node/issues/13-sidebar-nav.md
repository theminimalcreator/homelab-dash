Status: ready-for-agent

Blocked by: 08, 12

# Sidebar de navegação

Ver spec.md, seção "UI: Sidebar".

## Tarefa

- Componente `Sidebar` do shadcn/ui, fixo (não colapsável — app é desktop-only)
- 5 itens:
  - `Dashboard` (`/`) — ativo
  - `Nodes` (`/nodes`) — ativo
  - `Settings`, `Services`, `Alerts` — visíveis, **desabilitados** (sem `href` funcional, estilo acinzentado, tooltip tipo "Em breve")
- Lista de itens definida como array de config (`{ label, href, icon, enabled }`), não JSX hardcoded item por item — adicionar uma seção nova depois (quando `Settings`/`Services`/`Alerts` saírem do papel) deve ser só uma entrada nova nessa lista
- Aplica no layout (`app/layout.tsx` ou um layout wrapper), envolvendo `/` e `/nodes`; não aparece na tela `/login`

## Aceite

- Sidebar visível em `/` e `/nodes`, com os 5 itens
- Clicar em `Settings`/`Services`/`Alerts` não navega pra lugar nenhum (item desabilitado de verdade, não só estilizado)
