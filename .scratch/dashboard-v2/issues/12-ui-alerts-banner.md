Status: ready-for-agent

Blocked by: 08, 09

# UI: banner de alertas + thresholds no client

Banner geral no topo do dashboard, cross-node — não um alerta por card (decisão do spec). Thresholds calculados no client, o Agent/API só reporta números crus.

## Tarefa

- Componente de banner usando `Alert` (shadcn), no topo da página, acima dos cards dos Nodes
- Lógica de threshold no client (`app/page.tsx` ou um hook/util separado):
  - Disco baixo: `hardware.disk.usePercent >= 90` (ou `available` baixo, a definir na implementação)
  - Node offline: fetch falhou/timeout
  - (Deixar a lógica extensível — não hardcodar só esses dois casos de um jeito que dificulte adicionar mais depois)
- Cada alerta ativo vira uma entrada no banner, identificando qual Node é afetado
- Banner não aparece (ou mostra estado "tudo ok") quando não há alertas ativos

## Aceite

- Derrubar o disco (ou simular `usePercent` alto) dispara o alerta no banner
- Derrubar o Agent do Dev Node dispara "offline" no banner
- Sem alertas ativos, banner não polui a tela
