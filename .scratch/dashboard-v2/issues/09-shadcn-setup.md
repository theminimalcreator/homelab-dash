Status: ready-for-agent

# Setup shadcn/ui

Base pra issues 10-12. Ver spec.md, "Design / UI".

## Tarefa

- Rodar `npx shadcn@latest init`, confirmando compatibilidade com Tailwind v4 (já em uso no projeto) e Next.js 16 App Router
- Configurar tema **dark-only** via CSS vars do shadcn (sem light mode nem toggle — decisão explícita do spec, mas usando a estrutura de CSS vars pra não fechar a porta depois)
- Instalar os componentes que as issues 10-12 vão precisar: `card`, `badge`, `progress`, `alert`, `table`
- Manter a estética atual (tom "terminal/cluster", `font-mono`) como base do tema, não o visual padrão do shadcn

## Aceite

- `components/ui/*` presente e funcionando
- Um componente de teste renderiza corretamente em dark mode
