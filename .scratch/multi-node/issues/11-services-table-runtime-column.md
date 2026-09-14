Status: ready-for-agent

Blocked by: 05, 10

# Coluna `runtime` na tabela de Services

Containers Docker (VPS) e processos PM2 (Master/Dev Node) aparecem na mesma tabela, mas vêm de fontes diferentes. Ver spec.md, seção "Services: PM2 + Docker na mesma tabela".

## Tarefa

- `components/services-table.tsx` ganha uma coluna `Runtime`, mostrando `pm2` ou `docker` (do campo `runtime` que a issue 05 adiciona a cada linha de service)
- Sem separar em tabelas distintas — mantém a visão unificada que a issue 11 do `dashboard-v2` (antiga) já tinha resolvido

## Aceite

- Tabela mostra serviços do Master/Dev Node (pm2) e da VPS (docker) juntos, com a origem de cada linha visível na coluna nova
