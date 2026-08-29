# Florescer — Tarefas e Acompanhamento

> Base: **Carta de Navegação v1.0** · ficha atualizada em 29/08/2026
> **Data alvo (v1 na Play Store): 15/10/2026** · Última atualização deste doc: 29/08/2026
> Tese de produto (5 diferenciais de mercado) registrada na Carta de Navegação, logo após a ficha.

---

## Painel

| Fase | Progresso | Situação |
|---|---|---|
| 01 · Descoberta | 2 / 5 | 🟡 domínio e escopo Premium pendentes |
| 02 · Arquitetura | 0 / 8 | 🔴 caminho crítico — começar já |
| 03 · Infraestrutura | 0 / 8 | 🔴 caminho crítico — começar já |
| 04 · Segurança + correções de código | 0 / 17 | 🔴 P0s bloqueiam o teste fechado |
| 05 · Play Store | 0 / 7 | ⚪ depende de 02/03/04 |
| 06 · Pagamento (Play Billing) | 0 / 6 | 🟢 **fora do v1** — update pós-lançamento |
| 07 · Processo | hábito | 🔵 recorrente |
| 08 · Custos / contratações | 0 / 6 | ⚪ |
| 09 · Checklist pré-lançamento | 0 / 15 | ⚪ |
| DP · Diferenciais de produto | 0 / 5 | 🟡 DP-A/B/C/E no v1 (baratos); DP-D pós-v1 |

**Escopo do v1 (15/10):** app atual, estruturado e corrigido, na Play Store como **freemium sem cobrança ainda** — Premium aparece como "em breve". A cobrança via Google Play Billing (Fase 06) entra num **update depois do lançamento**. É o que a própria Carta de Navegação recomenda: pagamento é segunda etapa.

---

## Decisões

| # | Decisão | Status | Resolução |
|---|---|---|---|
| D1 | Wrapper Capacitor × TWA | ✅ **Resolvido** | **Capacitor.** Play Billing exige plugin nativo; montar já em Capacitor evita reconstruir o wrapper depois (erro caro citado na Carta de Navegação). |
| D2 | Onde roda de verdade | ✅ **Resolvido** | **Android na loja + web mínima** (só política de privacidade, exclusão de conta e `assetlinks.json`). Sem iOS. |
| D3 | Conta de dev: pessoa física × CNPJ | ✅ **Resolvido** | **Pessoa física.** Ciente de que o nome civil aparece publicamente na ficha da loja. Reavaliar migração para CNPJ se/quando houver empresa. |
| D4 | Cobrança da assinatura | ✅ **Resolvido** | **Google Play Billing.** Mercado Pago descartado. |
| D5 | Grafia do nome | ✅ **Resolvido** | **"Florescer"** (com S) em código, assets e loja. |
| D6 | Nome legal do app + identidade visual final | 🟡 **Aberta** | Trava ícone final, ficha da loja e material de marca. Meta: fechar até 08/09. |

---

## Próximas ações (semana de 01–07/09)

1. ~~**[F3.1]** Criar o repositório git do projeto + primeiro commit~~ — **em andamento (29/08)**
2. ~~**[D3]** Decidir pessoa física × CNPJ~~ — **resolvido: pessoa física**
3. **[F1.3]** Registrar `florescer.com.br` _(você)_
4. **[F3.4]** Abrir o console do Firebase e verificar se as regras estão em "modo teste" _(você)_
5. **[F4.5]** Escrever o `firestore.rules` _(Claude Code)_
6. **[F4.8] [F4.9]** Correções P0 rápidas no código: `<meta viewport>` + remover dados demo falsos _(Claude Code)_
7. **[F2.1]** Criar `ARQUITETURA.md` com as decisões registradas _(Claude Code)_
8. **[F5.3]** Começar a recrutar os **12 testadores** (prontos até ~22/09) _(você)_

---

## Fase 01 — Descoberta e validação

- [x] **[F1.1]** Problema e público em uma frase _(ficha)_
- [x] **[F1.2]** Modelo de monetização decidido — freemium com assinatura _(ficha)_
- [ ] **[F1.3]** `P0` Registrar o domínio `florescer.com.br`
- [ ] **[F1.4]** `P1` Fechar a divisão grátis × Premium (paywall já lista: hábitos ilimitados, Ano em Pixels completo, export PDF, temas, lembretes, backup) — validar e congelar para o v1
- [ ] **[F1.5]** `P2` Registrar handles de marca (Instagram etc.) como "Florescer" _(depende de: D6)_

## Fase 02 — Arquitetura

- [ ] **[F2.1]** `P0` Documento `ARQUITETURA.md` no repo com as decisões D1/D2/D4 registradas _(depende de: F3.1)_
- [ ] **[F2.2]** `P0` Modelar tabela de assinatura no Firestore com **provedor como campo** (`play`), mesmo sem cobrança no v1 — evita migração depois
- [ ] **[F2.3]** `P0` Montar o wrapper **Capacitor**: projeto Android, `capacitor.config`, build gerando `.aab`
- [ ] **[F2.4]** `P0` Trocar o login Google: `signInWithRedirect` não funciona no WebView do Capacitor. Usar plugin nativo (`@capacitor-firebase/authentication`) _(depende de: F2.3)_
- [ ] **[F2.5]** `P0` Definir deep link próprio do app (`florescer://auth`) para o retorno do OAuth — não depender de App Link verificado por domínio _(depende de: F2.3)_
- [ ] **[F2.6]** `P0` **Testar o login OAuth de ponta a ponta no build nativo, em aparelho real** — no primeiro dia do empacotamento _(depende de: F2.4, F2.5)_
- [ ] **[F2.7]** `P1` Ligar a estratégia offline do Firestore (`enableIndexedDbPersistence`) _(relaciona: F4.7)_
- [ ] **[F2.8]** `P1` Definir versionamento do app (`versionCode` / `versionName`) e canal de build

## Fase 03 — Infraestrutura mínima antes do código

- [ ] **[F3.1]** `P0` Repositório git + primeiro commit (a pasta hoje não é repo)
- [ ] **[F3.2]** `P0` Deploy automático a cada push para a **web mínima** — manter privado / sem divulgar _(depende de: F3.1)_
- [ ] **[F3.3]** `P0` DNS do domínio apontado para a hospedagem _(depende de: F1.3, F3.2)_
- [ ] **[F3.4]** `P0` Regras de segurança do Firestore restringindo tudo a `request.auth.uid` — verificar se está em "modo teste" _(= F4.5)_
- [ ] **[F3.5]** `P1` Nenhum segredo em código que chega ao navegador (`firebaseConfig` público é ok; Admin SDK / webhooks só em Cloud Function) _(depende de: F3.1)_
- [ ] **[F3.6]** `P1` E-mail transacional com remetente da marca — SMTP customizado no Firebase Auth (ou Resend) para redefinição de senha e verificação _(depende de: F1.3)_
- [ ] **[F3.7]** `P0` Publicar página de **Política de Privacidade** no primeiro deploy _(depende de: F3.2)_
- [ ] **[F3.8]** `P0` Publicar página de **Exclusão de conta** (URL pública — exigência da Play Store) _(depende de: F3.2)_

## Fase 04 — Segurança, conformidade e correções de código

### Segurança / conformidade

- [x] **[F4.1]** ~~Resolver D3~~ — **pessoa física** (29/08)
- [ ] **[F4.2]** `P0` Convenção do projeto: toda entrada de usuário que vira `innerHTML` passa por escape. Hoje notas, gratidão, nomes de hábito e `renderHistory`/`renderMore` são injetados sem escape (risco de XSS) _(depende de: F3.1)_
- [ ] **[F4.3]** `P1` Autorização sensível (exclusão de conta, dados de terceiros) validada em Cloud Function, nunca só por flag no cliente
- [ ] **[F4.4]** `P1` Ativar **Firebase App Check**
- [ ] **[F4.5]** `P0` Escrever `firestore.rules`, testar no emulador e publicar _(= F3.4)_
- [ ] **[F4.6]** `P0` Preencher o formulário **"Segurança dos dados"** da Play Store (dados de saúde mental — atenção redobrada) _(depende de: F5.1)_
- [ ] **[F4.7]** `P0` Corrigir risco de **perda de dados offline**: `syncFromCloud` sobrescreve o local a cada login e o Firestore offline não está ativado _(depende de: F2.7)_

### Correções de código (pré-requisito do build de teste)

- [ ] **[F4.8]** `P0` Adicionar `<meta name="viewport">`
- [ ] **[F4.9]** `P0` Remover os dados demo falsos do `window.onload` ([index.html:1754](index.html#L1754))
- [ ] **[F4.10]** `P1` Ligar o botão de **logout** (`doLogout` existe, nenhum botão chama)
- [ ] **[F4.11]** `P1` Implementar a aba **"Conta"** (`renderMore` não trata o caso `'conta'`)
- [ ] **[F4.12]** `P1` Implementar **"Esqueci minha senha"** (`sendPasswordResetEmail`) _(depende de: F3.6)_
- [ ] **[F4.13]** `P1` Ligar os links de **Termos** e **Privacidade** às páginas reais _(depende de: F3.7)_
- [ ] **[F4.14]** `P1` Esconder / marcar como "em breve" o CTA de assinatura do paywall no v1 _(depende de: F1.4)_
- [ ] **[F4.15]** `P2` Corrigir incoerência de path: `manifest.json` usa `/florecer/` e o service worker usa `BASE='/florecer'` — alinhar com a hospedagem
- [ ] **[F4.16]** `P2` Deduplicar o logo base64 (~217 KB de 313 KB do HTML; está como PNG sendo JPEG) — usar os `icon-*.png`
- [ ] **[F4.17]** `P2` Quebrar o `index.html` único em `index.html` + `app.js` + `styles.css` _(depende de: F3.1)_
- [ ] **[F4.18]** `P2` Padronizar a grafia "Florescer" em todo o código e assets _(depende de: D5 ✅)_

## Fase 05 — Publicação na Play Store

- [ ] **[F5.1]** `P0` Criar a conta de desenvolvedor Google Play (US$ 25, única) _(depende de: F4.1)_
- [ ] **[F5.2]** `P0` Gerar a chave de assinatura + **backup em 2 lugares** no mesmo dia. Manter Play App Signing _(depende de: F2.3)_
- [ ] **[F5.3]** `P1` Assets da ficha da loja durante o desenvolvimento: ícone, capturas (celular e tablet), banner 1024×500, descrições _(depende de: D6)_
- [ ] **[F5.4]** `P0` `assetlinks.json` publicado no domínio (Digital Asset Links) _(depende de: F3.3, F5.2)_
- [ ] **[F5.5]** `P0` **Teste fechado: 12 testadores, 14 dias corridos** antes de Produção — recrutar já _(depende de: F5.1, F5.6)_
- [ ] **[F5.6]** `P0` Build de release `.aab` assinado, com todos os P0 resolvidos, na trilha de teste fechado _(depende de: F2.3, F2.6, F4.5, F4.7, F4.8, F4.9, F4.14, F3.7, F3.8)_
- [ ] **[F5.7]** `P0` Liberar para Produção _(depende de: F5.5, F4.6)_

## Fase 06 — Pagamento via Google Play Billing · _pós-lançamento_

- [ ] **[F6.1]** `P1` Criar o produto de assinatura no Play Console (mensal + anual)
- [ ] **[F6.2]** `P1` Integrar Play Billing (plugin nativo do Capacitor) _(depende de: F2.3, F6.1)_
- [ ] **[F6.3]** `P1` Cloud Function para validar o recibo da Play e gravar a assinatura no Firestore _(depende de: F2.2, F6.2)_
- [ ] **[F6.4]** `P1` Liberar os recursos Premium conforme o status da assinatura _(depende de: F6.3)_
- [ ] **[F6.5]** `P0` Testar a cobrança **de ponta a ponta, com dinheiro de verdade**, antes de anunciar o recurso _(depende de: F6.2, F6.3)_
- [ ] **[F6.6]** `P1` Validar cancelamento e expiração (rebaixa para o plano grátis) _(depende de: F6.3)_

## Diferenciais de produto — roadmap (DP)

Da tese registrada na Carta de Navegação. Regra: cada recurso novo reforça **validação real**, **privacidade blindada**, **personalização inteligente** ou **interface que acolhe sem cobrar** — senão é só paridade com concorrente.

- [ ] **[DP-A]** `P1` **Design "calma primeiro"** — máx. 1 lembrete/dia, gentil e opcional; remover qualquer selo de pendência; permitir "pular hoje" sem quebrar streak nem cobrar. _v1_ _(relaciona: F4.9, F4.14)_
- [ ] **[DP-B]** `P1` **Antipositividade tóxica** — renomear a métrica para "dias de autocuidado"; registrar humor ruim mantém a sequência; revisar todos os textos para nunca penalizar dia difícil. _v1_ _(relaciona: F4.2)_
- [ ] **[DP-C]** `P2` **Base científica visível** — em cada exercício (respiração, grounding, PMR) mostrar 1 linha sobre a evidência que o sustenta + fonte. _v1_
- [ ] **[DP-C2]** `P1` **Revisão por psicólogo(a)** — contratar revisão de copy e fluxos antes de comunicar qualquer eficácia na loja/marketing. _antes de F5.3 / F4.6_
- [ ] **[DP-D]** `P2` **Personalização por perfil** — escolher perfil no onboarding (estudos / sobrecarga no trabalho / ansiedade / luto) e adaptar prompts de reflexão, exercícios sugeridos e insights; insights que evoluem com os dados. _pós-v1_ _(depende de: F4.7)_
- [ ] **[DP-E]** `P0` **Privacidade como recurso de marca** — zero venda/compartilhamento; modo local opcional (sem nuvem); criptografia; política em linguagem simples; exclusão de conta imediata; LGPD desde o 1º deploy; comunicar isso na ficha da loja. _v1_ _(= F3.4, F3.7, F3.8, F4.2–F4.5; comunicação em F5.3)_

## Fase 07 — Processo (recorrente, todo commit)

- [ ] **[F7.1]** Especificação por escrito antes de cada implementação (nome de função, comportamento, o que não mexer)
- [ ] **[F7.2]** Validar sintaxe e checar duplicidade antes de cada commit
- [ ] **[F7.3]** Revisão humana do diff real antes de cada push
- [ ] **[F7.4]** Backup antes de toda mudança estrutural

## Fase 08 — Custos / contratações

- [ ] **[F8.1]** Domínio `.com.br` — R$ 40–60/ano _(= F1.3)_
- [ ] **[F8.2]** Conta Google Play — US$ 25 única _(= F5.1)_
- [ ] **[F8.3]** Hospedagem web (Netlify grátis) — R$ 0 _(= F3.2)_
- [ ] **[F8.4]** Firebase — ~R$ 0 no início; ativar Blaze só quando precisar de Cloud Functions (Fase 06)
- [ ] **[F8.5]** E-mail transacional (Resend grátis, se usado) — R$ 0
- [ ] **[F8.6]** Play Billing — ~15% por venda (só na Fase 06)

## Fase 09 — Checklist rápido pré-lançamento

**Antes do código**
- [x] Problema e público em uma frase
- [x] Monetização decidida
- [ ] Nome e domínio registrados _(F1.3)_
- [x] Web-só ou também loja — decidido _(D1, D2)_

**Primeira semana**
- [ ] Repo com deploy automático _(F3.1, F3.2)_
- [ ] Domínio com DNS apontado _(F3.3)_
- [ ] Backend com regras de segurança desde a primeira coleção _(F3.4)_
- [ ] Segredos só em função de servidor _(F3.5)_
- [ ] E-mail transacional configurado _(F3.6)_

**Antes de empacotar pra loja**
- [ ] Login OAuth testado dentro do wrapper nativo _(F2.6)_
- [ ] Chave de assinatura gerada e com backup em 2 lugares _(F5.2)_
- [ ] Política de privacidade e página de exclusão de conta publicadas _(F3.7, F3.8)_
- [ ] Cronograma considera os 14 dias de teste fechado _(F5.5)_

**Antes de anunciar o pagamento como pronto** _(Fase 06, pós-lançamento)_
- [ ] Cobrança testada de ponta a ponta, com dinheiro de verdade _(F6.5)_
- [ ] Fluxo Play Billing validado _(F6.2, F6.6)_

---

## Cronograma para 15/10

| Semana | Foco | Marcos |
|---|---|---|
| 01–07/09 | Fundação | repo, domínio, regras Firestore, P0 de código rápidos, D3 |
| 08–14/09 | Web mínima + código | privacidade + exclusão de conta no ar, escape de `innerHTML`, aba Conta, logout, offline |
| 15–21/09 | Wrapper | Capacitor montado, login Google nativo, deep link |
| 22–28/09 | Empacotamento | teste de OAuth em aparelho, conta Google Play, chave + backup, assets da loja, 12 testadores confirmados |
| **29/09** | **Sobe teste fechado** | **início dos 14 dias travados** |
| 29/09–13/10 | Teste fechado | corrigir o que os testadores acharem |
| 14–15/10 | Produção | envio + revisão da Play → **lançamento** |

**Risco:** o cronograma tem folga zero. Se qualquer bloco atrasar, o teste fechado empurra a data na mesma proporção (são 14 dias fixos, não negociáveis). Ponto de atenção principal: **F2.6** (login OAuth no wrapper) — é o maior gargalo histórico segundo a Carta de Navegação.

---

## Changelog

- **29/08/2026** — Criado. Ficha atualizada na Carta de Navegação (framework antes chamado "Manual de Bordo"): domínio `florescer.com.br`, pagamento = Google Play Billing, plataforma = Web + Android, data alvo = 15/10/2026. Decisões D1, D2, D4, D5 resolvidas. Fase 06 movida para pós-lançamento.
- **29/08/2026** — Carta de Navegação reestruturada: ficha movida para o topo; adicionada seção "Tese de produto" com 5 diferenciais de mercado (relatório de P&D). Criada a trilha **DP** aqui. Botão "Salvar ficha" da página desativado (bug pré-existente) — ficha passa a ser mantida via Claude Code.
- **29/08/2026** — Kickoff. D3 resolvido: **conta Google Play como pessoa física**. Repositório git iniciado na pasta do projeto (primeiro commit).
