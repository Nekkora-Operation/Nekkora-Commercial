# COM-001 — Checklist de homologação

Para a responsável pela Nekkora. Os itens marcados **[auto]** são verificados por `npm run homologacao` (resultado
mais recente em [evidencias/depois/resumo.md](evidencias/depois/resumo.md)). Os itens **[manual]** dependem de
julgamento comercial ou visual.

## Preparação

```bash
# na pasta vizinha Nekkora-lib (uma vez): npm install && npm run build
cd Nekkora-Commercial
git switch feat/com-001-commercial-positioning
npm install
npm run check                                   # tipos + build
npx vite preview --host 127.0.0.1 --port 4173   # http://127.0.0.1:4173
# opcional, em outro terminal (Playwright e axe-core de outra pasta, ex. Nekkora-Platform-Web):
NEKKORA_PW_MODULES=../Nekkora-Platform-Web/node_modules npm run homologacao -- http://127.0.0.1:4173/ docs/com-001/evidencias/depois
```

## Conteúdo comercial

- [ ] **[manual]** Delivery e Hosting aparecem separados e são compreensíveis por quem nunca ouviu falar da Nekkora.
- [ ] **[manual]** O selo "Em avaliação de viabilidade" e o aviso do Hosting refletem o estágio real da oferta.
- [ ] **[manual]** Os 8 serviços do Hosting e o texto "Como é contratado" de cada um correspondem à intenção comercial.
- [ ] **[manual]** As três modalidades e os limites da contratação combinada estão corretos.
- [ ] **[manual]** A lista "Não incluído automaticamente" está completa.
- [ ] **[manual]** Os exemplos de aplicação do Delivery são processos que a Nekkora aceita avaliar.
- [ ] **[manual]** As tecnologias citadas (Python, UiPath, Power Automate, integrações) estão corretas.
- [ ] **[manual]** O texto sobre Studio, Platform e Agent está de acordo com o posicionamento desejado.
- [ ] **[auto]** Nenhum percentual, preço, "24 h", SLA, ROI, "prazo garantido" ou "alta disponibilidade" fora da lista de exclusões.
- [ ] **[auto]** Studio, Platform e Agent mencionados apenas no bloco informativo.
- [ ] **[auto]** Conteúdo demonstrativo identificado ("Ilustração").

## Contato

- [ ] **[auto]** Nenhum link para WhatsApp, e-mail ou rede social sem valor confirmado; sem botão flutuante.
- [ ] **[auto]** Formulário: erros em nome, e-mail, interesse e descrição; foco vai ao primeiro erro.
- [ ] **[auto]** Formulário válido mostra "envio desativado" e o resumo, sem abrir janela e sem requisição externa.
- [ ] **[auto, build de teste]** Com canais preenchidos, os links aparecem, URLs inválidas são rejeitadas e o WhatsApp abre com a mensagem montada ([evidencias/canais](evidencias/canais/resultados.json)).
- [ ] **[manual]** Antes de publicar: preencher os canais reais em `src/config.ts` e conferir cada link manualmente.

## Visual e acessibilidade

- [ ] **[auto]** Tema padrão Sakura Dark; alternância para Sage Light persiste ao recarregar.
- [ ] **[auto]** Sem rolagem horizontal em 375, 768, 1280 e 1440 px, nos dois temas.
- [ ] **[auto]** axe-core WCAG 2.1 AA sem violações (mobile e desktop, nos dois temas).
- [ ] **[auto]** Primeiro Tab = "Pular para o conteúdo", visível; foco visível nos 40 primeiros Tabs.
- [ ] **[auto]** Menu mobile abre com Enter e fecha com Esc.
- [ ] **[manual]** Logo, mascote e cores correspondem às referências visuais aprovadas (PUB-07).
- [ ] **[manual]** Leitura confortável no celular real (iOS/Android) e em um leitor de tela (NVDA/VoiceOver), que não foram testados (ver relatório).

## Decisão

- [ ] Pendências de [08-pendencias-publicacao.md](08-pendencias-publicacao.md) resolvidas ou aceitas.
- [ ] `PREVIEW_NOTICE` desligado em `src/config.ts` somente com autorização de publicação.
- [ ] Merge e deploy autorizados pela responsável (fora do escopo desta missão).
