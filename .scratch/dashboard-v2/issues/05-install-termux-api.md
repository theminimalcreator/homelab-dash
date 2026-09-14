Status: needs-info

**Progresso (2026-09-14):**
- ✅ CLI instalado no **Poco (Master)** via SSH (`pkg install termux-api`)
- ❌ CLI **não instalado no Redmi (Dev Node)** — bloqueado: essa sessão do Claude Code roda dentro do Alpine via proot, que se apresenta como `root` (uid=0), e o `pkg`/`apt` do Termux recusa rodar como root permanentemente por segurança. Precisa rodar `pkg install termux-api` numa sessão real do Termux (fora do `proot-distro login alpine`) — **ação do usuário**.
- Confirmado que o comando trava esperando IPC quando o app companion não existe (`termux-battery-status` no Poco ficou pendurado) — bate com o esperado, falta o app **Termux:API** nos dois celulares ainda.

# Instalar `termux-api` nos dois celulares

Pré-requisito pra bateria (%/carregando) e wifi (tipo de conexão/força de sinal) nos dois Nodes. Ver spec.md, "Matriz de disponibilidade".

Tem uma parte mecânica (que dá pra fazer via SSH/shell) e uma parte que só o usuário consegue fazer (interface do app store).

## Tarefa

**Mecânico (pode ser feito remotamente):**
- `pkg install termux-api` no Termux de cada celular (Poco via SSH, Dev Node local)
- Confirmar que os binários (`termux-battery-status`, `termux-wifi-connectioninfo`) aparecem no PATH depois

**Manual (só o usuário):**
- Instalar o app **Termux:API** (Play Store ou F-Droid) em cada celular — sem isso os comandos ficam instalados mas não funcionam (não tem como o CLI conversar com o app se ele não existir)
- Confirmar que os comandos retornam dado de verdade depois do app instalado (ex: `termux-battery-status` deve devolver JSON, não erro)

## Aceite

- `termux-battery-status` e `termux-wifi-connectioninfo` funcionando nos dois celulares
- Testar especificamente se funciona **de dentro do proot** no Dev Node (não testado ainda — pode precisar de ajuste, já que os binários rodam a partir do prefix real do Termux mas a comunicação com o app passa por IPC do Android)
