Status: ready-for-agent

Blocked by: 07

# Tela de gerenciamento de Nodes (`/nodes`)

UI (shadcn, consistente com o resto do dashboard) pra listar/criar/editar/apagar Nodes sem precisar mexer em SQL direto. Ver spec.md, seção "Armazenamento dos Nodes".

## Tarefa

- Rota `/nodes`: tabela com todos os Nodes cadastrados (nome, kind, status básico, ações editar/apagar)
- Form de criar/editar: todos os campos da tabela `nodes` (nome, subtitle, kind, stats_url, ssh_user, ssh_port, auth_token, flags de capacidade, services_runtime)
- Confirmação antes de apagar um Node
- É aqui que o usuário completa os campos em branco da VPS (seed da issue 03: `stats_url`, `ssh_user`, `ssh_port`, `auth_token`)

## Aceite

- Criar um Node pela tela aparece no `/api/cluster` (issue 09) no próximo poll, sem restart do app
- Editar `stats_url` de um Node existente muda de onde o dashboard busca aquele Node, sem rebuild
