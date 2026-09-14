Status: resolved (2026-09-14)

# Atalho pra copiar o comando SSH de cada Node

Adicionado fora da quebra original do spec — pedido depois, durante o uso. Botão no header de cada `NodeCard` que copia `ssh -p <porta> <usuario>@<ip>` pra área de transferência, usando o `network.localIp` que o Node já reporta.

## Decisões
- Copiar pra clipboard, não um link `ssh://` — mais confiável entre dispositivos (Termux/Android não tem handler padrão pra `ssh://`)
- Usuário/porta configuráveis via `NEXT_PUBLIC_SSH_USER`/`NEXT_PUBLIC_SSH_PORT` no `.env`, hoje `u0_a348`/`8022` nos dois Nodes (confirmado por evidência indireta no Dev Node — grupos `aid_u0_a348_*` no `id`, mesmo não tendo a senha pra testar autenticação completa; **vale confirmar manualmente**)
- `navigator.clipboard` exige contexto seguro (HTTPS/localhost), e o dashboard roda em HTTP puro na LAN — implementado fallback via `document.execCommand('copy')` pra não falhar silenciosamente

## Pendente
- Confirmar que `u0_a348@<redmi-ip>` realmente autentica no Dev Node (só validei o handshake SSH, não a senha)
- Não validado visualmente em navegador, igual as issues 10-12
