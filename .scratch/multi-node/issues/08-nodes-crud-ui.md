Status: resolved (2026-09-14) — `tsc`/`eslint` limpos, `GET /nodes` 200 sem erro de servidor contra o Postgres real (túnel SSH). **Não validado visualmente num browser de verdade** — ambiente onde rodo (Termux/proot headless) não tem Chrome/Chromium nem Playwright/Puppeteer instalado, mesma limitação que as issues 10-13 do `dashboard-v2` antigo já tinham registrado. Vale abrir `http://<master>:3000/nodes` manualmente antes de considerar 100% ok.

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
