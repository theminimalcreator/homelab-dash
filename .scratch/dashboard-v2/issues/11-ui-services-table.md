Status: resolved (2026-09-14) — não validado visualmente em navegador

Blocked by: 08, 09

# UI: tabela única de Services

Substitui as duas listas atuais (hoje só o Master tem) por uma `Table` (shadcn) combinando os `services` dos dois Nodes. Ver spec.md "Escopo" → "Serviços".

## Tarefa

- Colunas: Node, Nome, Status (`Badge`), CPU, RAM, Restarts, Uptime
- Uma linha por `Service`, combinando o array `services` do Master e do Dev Node num só dataset no client
- Ordenação razoável por padrão (ex: Node, depois nome) — sem over-engineering de sort interativo se não for pedido

## Aceite

- Tabela mostra serviços dos dois Nodes juntos (hoje: `dashboard`, `n8n-server` do Master; `alpine-agent` do Dev Node)
- Se um Node estiver offline, a tabela não quebra — só não lista os serviços daquele Node (ou marca como indisponível, a decidir na implementação)
