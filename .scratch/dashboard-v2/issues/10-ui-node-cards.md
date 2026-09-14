Status: resolved (2026-09-14) — build limpo, `/api/stats` retorna o payload esperado. **Não validado visualmente em navegador** (ambiente headless, sem browser disponível) — vale abrir no celular/desktop antes de dar como definitivo.

Blocked by: 08, 09

# UI: cards dos Nodes com as seções novas

Redesenho dos dois cards (Master / Dev Node) usando shadcn, cobrindo o payload novo do `Node Stats`. Ver o wireframe ASCII discutido na conversa (seções: Hardware, Bateria, Rede, Claude Code) e spec.md "Design / UI".

## Tarefa

- Um `Card` por Node, com seções internas: Hardware (CPU/RAM/disco com `Progress`, temp, uptime), Bateria (% + ícone carregando, temp), Rede (IP, latência peer, wifi/sinal), e Claude Code (só no card do Dev Node)
- Campos `null` mostram "N/A" ou "—" de forma explícita, não escondem a linha nem quebram o layout (ex: temp do Master sempre vai ser N/A — confirmado no spec)
- `Badge` de status online/offline no header do card
- Cards ficam mais altos que hoje, sem colapsar seções (decisão já tomada)
- Desktop-only por enquanto (mobile é iteração futura, fora de escopo aqui)

## Aceite

- Os dois cards renderizam com dado real dos dois Nodes
- Campos indisponíveis não quebram a UI nem ficam com aparência de erro
