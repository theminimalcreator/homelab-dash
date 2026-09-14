Status: resolved (2026-09-14)

**Feito:** `pkg install git`, clonado o repo via `git bundle` (sem precisar de credencial GitHub no Poco), `npm install` + `npm run build -- --webpack` (achado: Turbopack, padrão do Next 16, não builda em android/arm64 — só tem binding WASM, Turbopack exige nativo; precisa forçar webpack), testado numa porta separada, e só então trocado o PM2 pra apontar pro clone novo. Cópia solta antiga preservada em `~/homelab-dash-old-loose-copy` (backup, não apagada). Sem downtime perceptível na troca.
**Pendente:** decidir quando apagar o backup antigo; nenhum deploy automatizado ainda (deploy = `git pull && npm install && npm run build -- --webpack && pm2 restart dashboard`, manual por enquanto).

# Fix deploy do Master no Poco

`/data/data/com.termux/files/home/homelab-dash` no Poco é uma cópia solta do projeto (sem `.git`, `git` nem instalado no Termux de lá), com `node_modules` e build de produção gerados ali. `package.json` diverge do repo (`next@16.3.4` vs `16.3.5`, tem `pm2` como dependência local que não existe no repo). Ver spec.md, seção "Arquitetura" → "Deploy do Master".

Mais arriscado que a issue 01: é o dashboard rodando em produção agora. Abordagem cuidadosa, sem derrubar o serviço no meio do processo.

## Tarefa

1. `pkg install git` no Termux do Poco
2. Clonar o repo de verdade em um diretório ao lado (não sobrescrever a cópia atual ainda)
3. Reconciliar `package.json`: alinhar versão do `next`, decidir se `pm2` deve mesmo ser dependência do projeto ali ou seguir global (igual ao Dev Node)
4. `npm install` + `npm run build` no clone novo, confirmar que builda limpo
5. Trocar `start-dash.sh` pra incluir o passo de build (ou documentar que o deploy é `git pull && npm install && npm run build && pm2 restart dashboard`)
6. Só depois de validar que o clone novo sobe e responde igual, repontar o PM2 `dashboard` pra ele e aposentar a cópia solta

## Aceite

- `pm2 describe dashboard` aponta pro clone git
- `git status` limpo no diretório do Poco (nada fora do controle de versão sendo servido)
- Dashboard continua respondendo em `http://192.168.15.43:3000` sem downtime perceptível na troca
