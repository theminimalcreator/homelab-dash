Status: resolved (2026-09-14) — testado fim-a-fim com senha de teste: sem cookie → redirect/401, senha errada → 401, senha certa → 200 + cookie, `/api/logout` limpa o cookie e a sessão para de valer. `tsc`/`eslint` limpos.

Implementado sem lib de sessão externa (mantendo a filosofia zero-dependência): o cookie é `SHA-256("homelab-dash-session-v1:" + ADMIN_PASSWORD)`, calculado via Web Crypto (funciona tanto no `middleware.ts`, que roda em Edge runtime, quanto nas rotas normais). Sem sessão server-side — rotacionar `ADMIN_PASSWORD` invalida todo cookie emitido automaticamente, de graça. Trade-off consciente: como não há revogação individual de sessão, um cookie válido continua válido até a senha mudar (aceitável pra essa escala/ameaça — uso doméstico, single-password).

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
