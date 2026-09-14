Status: ready-for-agent

# Login simples protegendo o app inteiro

Com o CRUD guardando SSH user/porta e tokens de auth dos Nodes, o dashboard inteiro passa a ter dado sensível — não só a tela de gestão. Ver spec.md, seção "Segurança".

## Tarefa

- `ADMIN_PASSWORD` nova variável em `.env`/`.env.example`
- Tela `/login`: formulário de senha única (sem usuário/e-mail — é um segredo compartilhado, não conta individual)
- Sessão via cookie assinado (ex: `iron-session` ou implementação própria simples com `crypto` do Node — decidir no momento da implementação, mantendo a filosofia de poucas dependências)
- Middleware do Next.js protegendo todas as rotas (`/`, `/nodes`, `/api/*` exceto a própria rota de login) — redireciona pra `/login` se não autenticado
- Login errado não revela se a senha existe/não existe (mensagem genérica)

## Aceite

- Acessar `/` sem sessão redireciona pra `/login`
- Senha certa cria sessão e libera acesso a `/`, `/nodes` e as APIs
- Senha errada não cria sessão
