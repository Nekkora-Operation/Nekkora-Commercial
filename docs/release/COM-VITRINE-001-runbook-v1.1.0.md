# COM-VITRINE-001 — Runbook da publicação controlada da v1.1.0

Decisões da titular de 12/11/2026. Este documento descreve **como** publicar; ele não autoriza nada. Cada ação marcada
com **[titular]** depende de autorização expressa da titular, dada no momento da ação.

## 1. Limites que continuam valendo

- Monitor e AI em preparação, sem contratação, checkout ou assinatura; Hosting sujeito à avaliação de viabilidade.
- Pacotes **não** liberados para contratação: contrato-base, anexos, proposta-modelo, procedimento operacional, DP-01 a
  DP-05, cláusula 10 e LIC-02 continuam pendentes.
- Aprovados em 12/11/2026, vinculados às impressões: PUB-14 (tabela), V-01 (continuidade), PUB-17 (textos) e PUB-19
  (condições públicas). Qualquer mudança em arquivo protegido muda a impressão e exige nova aprovação.

## 2. Proteções da publicação

### 2.1 PUB-18 vinculada à release (H e C)

- **H** — commit homologado: configuração definitiva, inclusive a PUB-13 (data de início e registro), versão `1.1.0` no
  `package.json`, CI aprovada e homologação final nos três navegadores.
- **C** — commit de autorização, criado depois de H: acrescenta **só** `publicacaoAutorizada { versao: "1.1.0", commit:
  <SHA completo de H> }` e o registro da titular em `$origem["publicacaoAutorizada"]` ("Titular, DD/MM/AAAA: autorizo
  a publicação da versão 1.1.0, commit homologado <SHA de H>.").
- **Portão** (`scripts/verificar-publicacao.mjs`): exige a flag histórica `aprovacoes.publicacao`, a autorização
  específica, a versão igual à do `package.json`, o registro com data válida (de 12/11/2026 até o dia da execução)
  citando a versão e **um** SHA completo, igual ao de H, e o artefato da mesma versão (`release.json`).
- **Workflow de deploy** (`scripts/verificar-autorizacao-release.mjs`, job "Autorização"): H existe e é ancestral do
  commit selecionado; a árvore do commit selecionado é igual à de H em todos os arquivos, exceto `publicacao.json`, e
  nele só a autorização difere. A comparação é de conteúdo, não de histórico: commits intermediários e conteúdo trazido
  por merge aparecem na diferença e bloqueiam. O job de deploy confere ainda que o artefato é o do commit selecionado.

### 2.2 Environment `production` (opção A, para esta release)

- Mantidos: revisor obrigatório atual e restrição exclusiva à branch `main`. Configuração do GitHub **não** alterada.
- `prevent_self_review` **desligado**: com um único revisor, ligá-lo impediria o deploy disparado pela própria titular.
- A aprovação manual do environment continua obrigatória, mas **não é revisão independente** enquanto a autoaprovação
  estiver permitida. O controle de conteúdo é o da PUB-18 (§2.1) e o do portão.
- **Melhoria futura** (fora desta missão): incluir um segundo revisor autorizado e separar quem solicita de quem aprova o
  deploy; só então ligar `prevent_self_review`.

## 3. PUB-13 — transição comercial no dia da publicação (dia D)

A regra executável (`novasCondicoes.inicio`) classifica por **data**: tudo o que for recebido no dia D conta como "a
partir de D". O dia D, porém, tem um período antes da nova vitrine entrar no ar. Procedimento:

1. **Horário:** publicar cedo, antes do horário comercial (de preferência antes das 8h, horário de Brasília), para reduzir
   a janela.
2. **Registro da entrada em produção:** anotar a data e o horário reais (horário de Brasília) em que o workflow de deploy
   concluiu com a verificação pública aprovada, com o link da execução do workflow e o resultado da verificação pública
   (modelo em §5).
3. **Conferência operacional obrigatória:** revisar os e-mails (`contato@`) e as mensagens do LinkedIn recebidos no dia D
   **antes** do horário registrado no item 2. Essas solicitações são analisadas individualmente.
4. **Compromissos anteriores preservados:** para essas solicitações, e para qualquer proposta já enviada ou aceita antes
   da entrada no ar, valem as condições da oferta anterior (V-02). Nenhuma condição nova é aplicada automaticamente, e
   **nenhuma condição é aplicada retroativamente a proposta já aceita**.
5. **Condição mais favorável:** pode-se oferecer ao cliente a condição mais favorável (por exemplo, a tabela nova para
   simples ou média), item a item. Quando isso alterar proposta ou compromisso existente, só com a **concordância
   expressa do cliente**, registrada por escrito. A complexa mantém a avaliação individual da oferta anterior.
6. **Mudança de dia:** se o deploy não puder concluir no dia D, **interromper a publicação**. A data de início e o seu
   registro (PUB-13) precisam ser revistos, o que gera novo H, nova homologação e nova autorização C, antes de
   prosseguir. Nenhuma data é aplicada retroativamente.

## 4. Sequência (resumo)

1. **[titular]** PUB-13: data D e registro → commit H (com a versão 1.1.0) → CI → homologação final nos três navegadores
   → portão acusando só a PUB-18.
2. **[titular]** PUB-18: autorização citando a versão 1.1.0 e o SHA de H → commit C (só `publicacao.json`) → CI.
3. **[titular]** Merge da PR na `main`, sem outro conteúdo (o verificador recusa qualquer diferença além da autorização).
4. **[titular]** Disparo do deploy com o commit do merge e `PUBLICAR`; aprovação do environment; portão e verificador no
   workflow; verificação pública.
5. Registro da entrada em produção (§5) e conferência operacional do dia D (§3).

## 5. Registro da entrada em produção (modelo)

| Campo | Valor |
|---|---|
| Versão | 1.1.0 |
| Commit homologado (H) | |
| Commit de autorização (C) | |
| Commit publicado (merge) | |
| Execução do workflow de deploy | |
| Data e horário de conclusão (horário de Brasília) | |
| Verificação pública | |
| Solicitações do dia D anteriores ao horário acima | |
| Tratamento dado a cada uma (§3, itens 4 e 5) | |
