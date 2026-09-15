Status: resolved (2026-09-14)

# Atualizar vocabulário no `CONTEXT.md`

`Node` hoje é definido como "*a physical Android phone*" — deixa de ser verdade com a VPS. Ver spec.md, seção "Vocabulário".

## Tarefa

- Redefinir `Node` em `CONTEXT.md`: qualquer máquina monitorada pelo Cluster, com um `kind` que descreve o tipo (Termux/Android, Linux genérico, etc.) em vez de assumir telefone
- Adicionar entrada pro termo `kind` (o que são os valores válidos hoje, sem fechar a lista pra não travar tipos futuros)
- Adicionar entrada pra `services_runtime` (`pm2` | `docker` | `none`) ou explicar como parte da entrada de `Service`
- Revisar se `Master`/`Dev Node` continuam corretos como estão (são instâncias específicas de `Node`, não mudam de definição) — só confirmar que não colidem com a generalização

## Aceite

- `CONTEXT.md` não descreve mais `Node` como necessariamente um telefone
- Termos novos (`kind`, `services_runtime`) documentados com o mesmo formato dos existentes (`_Avoid_:` incluso onde fizer sentido)
