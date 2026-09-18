Status: done

# Navegação e resumo no dashboard principal

- `components/app-sidebar.tsx`: novo item "Automações" (`enabled: true`, ícone `Workflow` do lucide-react), rota `/automations`.
- `components/automations-summary-card.tsx`: card compacto pra `app/(app)/page.tsx` — contagem de workflows ativos ok/com falha/sem execução, link "Ver tudo" pra `/automations`. Some (retorna `null`) se `configured` for `false`, igual ao `AlertsBanner` quando não há alertas.
- `app/(app)/page.tsx` passa a buscar `/api/automations` (mesmo polling de 5s, paralelo ao polling do `/api/cluster` já existente) e renderizar o card entre o `AlertsBanner` e os `NodeCard`s.
