# Florescer — Tarefas e Acompanhamento

> Base: **Carta de Navegação v1.0** · ficha atualizada em 29/08/2026
> **Data alvo (v1 na Play Store): meados de novembro/2026** (antes 15/10 — revista em 10/09 com a entrada dos Blocos 1–4) · Última atualização deste doc: 10/09/2026
> Tese de produto (5 diferenciais) + roadmap de profundidade na Carta de Navegação.

---

## Painel

| Fase | Progresso | Situação |
|---|---|---|
| 01 · Descoberta | 3 / 5 | 🟡 escopo Premium a congelar (roadmap já feito) |
| 02 · Arquitetura | 6 / 8 | 🟢 **wrapper Capacitor pronto e testado em aparelho real** (F2.3–F2.6 ✅) |
| 03 · Infraestrutura | 3 / 9 | 🟡 falta hospedar as 2 páginas legais (Firebase Hosting, grátis) |
| 04 · Segurança + correções de código | 13 / 21 | 🟢 regras + XSS + P0 + aba Conta feitos; falta App Check, Termos/Privacidade |
| 05 · Play Store | 0 / 7 | ⚪ depende de 02/03/04 |
| 06 · Pagamento (Play Billing) | 0 / 6 | 🟢 **fora do v1** — update pós-lançamento |
| 07 · Processo | hábito | 🔵 recorrente |
| 08 · Custos / contratações | 0 / 6 | ⚪ |
| 09 · Checklist pré-lançamento | 0 / 15 | ⚪ |
| DP · Diferenciais de produto | 3 / 5 | 🟢 DP-A/B/C feitos; DP-C2 (psicólogo) e DP-D (pós-v1) pendentes; DP-E com as políticas |
| **DP-F · Gamificação que acolhe** | 🟢 v1 completo | planta SVG + Jornada + 12 conquistas + desafio semanal + animações no `origin/main` — falta teste no navegador |

**Escopo do v1 — REVISTO em 10/09:** ~~congelado em 30/08~~. Depois de usar o app num celular real, o usuário decidiu que ele precisa de profundidade antes de ir pra loja. O v1 agora inclui os **Blocos 1–4** (registro com emoções, relatórios, ajuda prática, envolvimento) — ver seção "Profundidade do produto". Cobrança via Play Billing continua pós-lançamento.

**Cronograma novo:** Bloco 1 (até ~16/09) → Bloco 2 (até ~26/09) → **conta Google Play + política de privacidade + teste fechado começa ~29/09** → Blocos 3 e 4 entram como updates durante o teste (até ~24/10) → revisão do psicólogo → **produção em meados de novembro**. ⚠️ Para abrir o teste fechado a política de privacidade precisa estar publicada — ela deixa de ser "a última coisa".

---

## Decisões

| # | Decisão | Status | Resolução |
|---|---|---|---|
| D1 | Wrapper Capacitor × TWA | ✅ **Resolvido** | **Capacitor.** Play Billing exige plugin nativo; montar já em Capacitor evita reconstruir o wrapper depois (erro caro citado na Carta de Navegação). |
| D2 | Onde roda de verdade | ✅ **Resolvido** | **Android na loja, só isso.** Sem iOS, sem site. As 2 páginas obrigatórias (privacidade, exclusão de conta) ficam no **Firebase Hosting** (`florecer-app-c460d.web.app`, grátis). |
| D7 | Domínio próprio no v1 | ✅ **Resolvido** | **Não é necessário.** Capacitor empacota local; retorno de OAuth por esquema `florescer://` (sem App Link verificado → sem `assetlinks.json`); páginas legais via Firebase Hosting. Registrar `florescer.com.br` fica para depois (e-mail com marca, divulgação). |
| D3 | Conta de dev: pessoa física × CNPJ | ✅ **Resolvido** | **Pessoa física.** Ciente de que o nome civil aparece publicamente na ficha da loja. Reavaliar migração para CNPJ se/quando houver empresa. |
| D4 | Cobrança da assinatura | ✅ **Resolvido** | **Google Play Billing.** Mercado Pago descartado. |
| D5 | Grafia do nome | ✅ **Resolvido** | **"Florescer"** (com S) em código, assets e loja. |
| D6 | Nome legal do app + identidade visual final | 🟡 **Aberta** | Trava ícone final, ficha da loja e material de marca. Meta: fechar até 08/09. |

---

## Próximas ações (a partir de 30/08)

**Você:**
1. Testar no navegador: a **gamificação** (planta/Jornada) e o **login e-mail/senha**
2. Agendar a **revisão do psicólogo** (DP-C2) — precede qualquer comunicação de eficácia
3. Criar a **conta Google Play Developer** (US$ 25, pessoa física) — F5.1
4. Começar a **recrutar 12 testadores** — F5.3

**Claude Code:**
5. **App Check** (F4.4)
6. Páginas de **Política de Privacidade** + **Exclusão de conta** no Firebase Hosting (F3.7/F3.8) — quando você liberar (você pediu pro fim)
7. **Wrapper Capacitor** (F2.3) → login Google nativo (F2.4) → teste OAuth em aparelho (F2.6) — caminho crítico

_Domínio (`florescer.com.br`): **opcional, adiado** (ver D7)._

---

## Fase 01 — Descoberta e validação

- [x] **[F1.1]** Problema e público em uma frase _(ficha)_
- [x] **[F1.2]** Modelo de monetização decidido — freemium com assinatura _(ficha)_
- [ ] **[F1.3]** `P2` ~~Registrar `florescer.com.br`~~ — **opcional, adiado** (ver D7). Não trava o lançamento; útil depois para e-mail com marca e divulgação.
- [ ] **[F1.4]** `P1` Fechar a divisão grátis × Premium (paywall já lista: hábitos ilimitados, Ano em Pixels completo, export PDF, temas, lembretes, backup) — validar e congelar para o v1
- [ ] **[F1.5]** `P2` Registrar handles de marca (Instagram etc.) como "Florescer" _(depende de: D6)_

## Fase 02 — Arquitetura

- [ ] **[F2.1]** `P0` Documento `ARQUITETURA.md` no repo com as decisões D1/D2/D4 registradas _(depende de: F3.1)_
- [ ] **[F2.2]** `P0` Modelar tabela de assinatura no Firestore com **provedor como campo** (`play`), mesmo sem cobrança no v1 — evita migração depois
- [x] **[F2.3]** ~~Montar o wrapper **Capacitor**~~ — Capacitor 8.5.1, `npx cap add android`, **`./gradlew assembleDebug` → BUILD SUCCESSFUL** (`app-debug.apk`, 4,3 MB). Pasta `android/` versionada. appId `br.com.florescer.app`. Falta rodar no emulador/aparelho (emulador Pixel_6 do usuário demorou demais no boot — usar Android Studio).
- [x] **[F2.4]** ~~Login Google nativo no Android~~ — `@capacitor-firebase/authentication` 8.5.1 (`skipNativeAuth`), `google-services.json` na pasta, `doGoogleLogin` usa o plugin nativo no Capacitor e `signInWithPopup` no navegador. **Build OK** (`app-debug.apk` ~6 MB). Falta só rodar/testar (F2.6).
- [x] **[F2.5]** ~~Esquema `florescer://` para o OAuth~~ — **desnecessário**: o plugin usa o seletor de conta nativo do Android, sem redirect de navegador.
- [x] **[F2.6]** ~~**Testar o login Google em aparelho real**~~ — ✅ **PASSOU** (10/09, Galaxy A36 5G). Login Google nativo → entra na Home → sincroniza o Firestore (5 registros) → planta e gamificação renderizando. **O gargalo histórico da Carta de Navegação está vencido.** Correção necessária no caminho: `rgcfaIncludeGoogle = true` no `android/variables.gradle` (sem isso o plugin não compila as libs do Google e `signInWithGoogle()` trava sem erro).
- [ ] **[F2.7]** `P1` Ligar a estratégia offline do Firestore (`enableIndexedDbPersistence`) _(relaciona: F4.7)_
- [ ] **[F2.8]** `P1` Definir versionamento do app (`versionCode` / `versionName`) e canal de build

## Fase 03 — Infraestrutura mínima antes do código

- [x] **[F3.1]** ~~Repositório git~~ — **`github.com/lbarrosandre/florecer`** conectado, `origin/main` em dia. Nome sem S (renomear opcional).
- [x] **[F3.1b]** ~~Tornar o repo privado~~ — feito (29/08).
- [ ] **[F3.2]** `P1` Publicar as 2 páginas legais no **Firebase Hosting** (`florecer-app-c460d.web.app`, grátis no plano atual). Não precisa de deploy automático nem domínio.
- [x] **[F3.3]** ~~DNS do domínio~~ — **N/A** (sem domínio no v1 — ver D7).
- [x] **[F3.4]** ~~Verificar/publicar as regras do Firestore~~ — modo teste expirado (22/07); regras novas **publicadas** + índices criados (29/08). _(= F4.5)_
- [ ] **[F3.5]** `P1` Nenhum segredo em código que chega ao navegador (`firebaseConfig` público é ok; Admin SDK / webhooks só em Cloud Function)
- [ ] **[F3.6]** `P2` E-mail transacional com remetente da marca — **adiado** (precisa de domínio; o remetente padrão do Firebase funciona para o v1).
- [ ] **[F3.7]** `P0` Escrever e publicar a **Política de Privacidade** (Firebase Hosting) — exigência da Play Store; revisar com o psicólogo/LGPD. _Usuário pediu para deixar por último._
- [ ] **[F3.8]** `P0` Publicar página de **Exclusão de conta/dados** (URL pública) + fluxo real de exclusão no app (Cloud Function ou processo manual documentado). _(depende de: F3.2)_

## Fase 04 — Segurança, conformidade e correções de código

### Segurança / conformidade

- [x] **[F4.1]** ~~Resolver D3~~ — **pessoa física** (29/08)
- [ ] **[F4.2]** `P0` Convenção do projeto: toda entrada de usuário que vira `innerHTML` passa por escape. Hoje notas, gratidão, nomes de hábito e `renderHistory`/`renderMore` são injetados sem escape (risco de XSS) _(depende de: F3.1)_
- [ ] **[F4.3]** `P1` Autorização sensível (exclusão de conta, dados de terceiros) validada em Cloud Function, nunca só por flag no cliente
- [ ] **[F4.4]** `P1` Ativar **Firebase App Check**
- [x] **[F4.5]** ~~`firestore.rules` + índices~~ — **publicado no console pelo usuário (29/08)** + 2 índices compostos (`logs`, `gratitude`: `uid`+`date`) criados e ativos. _(= F3.4)_
- [ ] **[F4.6]** `P0` Preencher o formulário **"Segurança dos dados"** da Play Store (dados de saúde mental — atenção redobrada) _(depende de: F5.1)_
- [x] **[F4.7]** ~~Perda de dados offline~~ — **corrigido** (`b82ee48`): `enablePersistence` ligado; `syncFromCloud` agora **junta** nuvem+local (nunca sobrescreve) e reenvia entradas locais órfãs; `toggleHabit` passou a salvar na nuvem. Absorve F2.7.
- [x] **[F4.20]** `P0` ~~`window.S` era `undefined` no script do Firebase (`const S` não vai pro `window`) — quebrava auth + sync inteiros~~ — **corrigido** (`b82ee48`): `window.S = S`.

### Correções de código (pré-requisito do build de teste)

- [x] **[F4.8]** ~~Adicionar `<meta name="viewport">`~~ — feito (+ `theme-color`)
- [x] **[F4.9]** ~~Remover os dados demo falsos do `window.onload`~~ — feito
- [x] **[F4.19]** `P0` ~~**Erro de sintaxe fatal** em `doLogin` (`coverTab('register')` sem escape dentro de string) que quebrava o `<script>` inteiro do Firebase — auth 100% morta~~ — **corrigido**. Sintaxe dos 4 scripts validada com `node --check`.
- [x] **[F4.2]** ~~Escape de texto do usuário antes de `innerHTML`~~ — `esc()` + nome/ícone de hábito e texto de gratidão escapados (`8e51bd9`).
- [x] **[F4.10]** ~~Botão de logout~~ — "Sair da conta" na aba Conta (`8e51bd9`).
- [x] **[F4.11]** ~~Aba "Conta"~~ — perfil + plano + privacidade + sair + stub de exclusão (`8e51bd9`).
- [x] **[F4.12]** ~~"Esqueci minha senha"~~ — `sendPasswordResetEmail` + feedback verde (`8e51bd9`). E-mail sai com remetente do Firebase até F3.6.
- [ ] **[F4.13]** `P1` Ligar os links de **Termos** e **Privacidade** às páginas reais (hoje mostram "Página em preparação") _(depende de: F3.7)_
- [x] **[F4.14]** ~~CTA de assinatura no v1~~ — aba Conta diz "Premium em breve"; paywall completo segue inacessível (sem aba). (`8e51bd9`)
- [x] **[F4.15]** ~~Path `/florecer/` no manifest/SW~~ — caminhos relativos (`./`), `CACHE_NAME` → `florescer-v3`. Funciona em qualquer raiz (Firebase Hosting + Capacitor).
- [x] **[F4.16]** ~~Deduplicar o logo base64~~ — `index.html` 317 KB → 100 KB; as `<img>` usam `icon-512.png` (`bc…`).
- [~] **[F4.17]** `P2` Quebrar o `index.html` — **adiado**: com F4.16 o arquivo ficou gerenciável (~110 KB); o split é arriscado num app funcionando com `onclick` inline por toda parte. Fazer numa tarefa dedicada depois do v1.
- [x] **[F4.18]** ~~Padronizar grafia "Florescer"~~ — `index.html` + `manifest.json` (name/short_name) 100% "Florescer". _(o projeto Firebase `florecer-app-c460d` mantém o id; só cosmético o que muda)_

## Fase 05 — Publicação na Play Store

- [ ] **[F5.1]** `P0` Criar a conta de desenvolvedor Google Play (US$ 25, única) _(depende de: F4.1)_
- [ ] **[F5.2]** `P0` Gerar a chave de assinatura + **backup em 2 lugares** no mesmo dia. Manter Play App Signing _(depende de: F2.3)_
- [ ] **[F5.3]** `P1` Assets da ficha da loja durante o desenvolvimento: ícone, capturas (celular e tablet), banner 1024×500, descrições _(depende de: D6)_
- [x] **[F5.4]** ~~`assetlinks.json` / Digital Asset Links~~ — **não é necessário** com Capacitor + esquema `florescer://` (ver D7).
- [ ] **[F5.5]** `P0` **Teste fechado: 12 testadores, 14 dias corridos** antes de Produção — recrutar já _(depende de: F5.1, F5.6)_
- [ ] **[F5.6]** `P0` Build de release `.aab` assinado, com todos os P0 resolvidos, na trilha de teste fechado _(depende de: F2.3, F2.6, F3.7, F3.8; código P0 já feito)_
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

- [x] **[DP-A]** ~~Design "calma primeiro"~~ — home sem "Falta: Tarde/Noite" nem cota de 3; "registrar de novo" virou link discreto (`8e51bd9`). Lembretes: só quando houver app nativo (pós-Capacitor).
- [x] **[DP-B]** ~~Antipositividade tóxica~~ — "dias de autocuidado"; 🔥→🌱; "X dias de cuidado"; nota "Recomeçar também é cuidar"; texto do onboarding (`8e51bd9`).
- [x] **[DP-C]** ~~Base científica visível~~ — evidência + base em cada técnica de respiração; rodapé na tela SOS sobre TCC/regulação e limite do app (`8e51bd9`). MOOD_HINTS/EMPATHY revisados — já estavam bons.
- [ ] **[DP-C2]** `P1` **Revisão por psicólogo(a)** — contratar revisão de copy e fluxos antes de comunicar qualquer eficácia na loja/marketing. _antes de F5.3 / F4.6_
- [ ] **[DP-D]** `P2` **Personalização por perfil** — escolher perfil no onboarding (estudos / sobrecarga no trabalho / ansiedade / luto) e adaptar prompts de reflexão, exercícios sugeridos e insights; insights que evoluem com os dados. _pós-v1_ _(depende de: F4.7)_
- [ ] **[DP-E]** `P0` **Privacidade como recurso de marca** — zero venda/compartilhamento; modo local opcional (sem nuvem); criptografia; política em linguagem simples; exclusão de conta imediata; LGPD desde o 1º deploy; comunicar isso na ficha da loja. _v1_ _(= F3.4, F3.7, F3.8, F4.2–F4.5; comunicação em F5.3)_
- [x] **[DP-F]** ~~Gamificação que acolhe~~ — planta que floresce (8 estágios), 12 conquistas, desafio semanal, aba Jornada, animações. `origin/main` (`8e…`/Fase 3). _v1_

## Profundidade do produto — ENTRA NO v1 (Blocos 1–4)

> **Decisão revista em 10/09.** Depois de usar o app num celular real, o usuário concluiu que não pagaria pelo que ele oferece. Diagnóstico: **o app é uma via de mão única — a pessoa entrega dados e recebe quase nada de volta.** O congelamento de 30/08 foi desfeito: o v1 só vai pra loja depois de fechar o ciclo **registrar → entender → agir → voltar**. Estratégia de prazo: o teste fechado (12 testadores / 14 dias) começa **depois do Bloco 2** e os Blocos 3–4 entram como atualizações durante o teste. Conteúdo clínico (TCC, meditação, trilhas) passa pelo **psicólogo (DP-C2)** antes da produção.

### Bloco 1 — Registrar melhor (a base)
- [x] **[B1.1]** `P0` **Roda de emoções** no registro — 24 emoções em 4 quadrantes (pesadas / agitadas / calmas / vibrantes = modelo circumplexo de afeto, energia × valência). Multisseleção. Salva `emotions[]` no log.
- [x] **[B1.2]** `P0` **Pergunta de reflexão adaptada** ao que foi registrado (emoções + humor + gatilhos) — estilo TCC/autocompaixão. Salva `prompt` no log. _(revisão psicólogo)_
- [x] **[B1.3]** `P1` Polimento: esconder a barra de status falsa "9:41 · 100%" no celular; trocar a métrica de sequência por **"dias nesta semana"** (evita confusão com os "dias de cuidado" da planta); singular/plural.

### Bloco 2 — Entender (relatórios)
- [x] **[B2.1]** `P0` **Resumo da semana** — humor vs. semana anterior, emoções mais frequentes, o que mais apareceu nos dias bons. _(= RP-1 parcial)_
- [x] **[B2.2]** `P0` **Relatório mensal** com gráficos — humor ao longo do mês, emoções, gatilhos, sono × humor, hábitos × humor.
- [x] **[B2.3]** `P0` **Descobertas** — correlações calculadas a partir dos dados ("nos dias com exercício seu humor foi 0,8 maior"), só quando houver dados suficientes e com linguagem cuidadosa.
- [x] **[B2.4]** `P1` Substituir/absorver a aba Insights atual pelo novo relatório.

### Bloco 3 — Agir (ajuda prática)
- [x] **[B3.1]** `P0` **Sugestão depois do registro** — conforme emoções/ansiedade, oferece respiração, grounding, registro de pensamento ou meditação ali mesmo.
- [x] **[B3.2]** `P0` **Registro de pensamento (TCC)** — situação → pensamento → emoção (intensidade) → evidências a favor/contra → pensamento alternativo → emoção depois. _(= RP-5, revisão psicólogo)_
- [x] **[B3.3]** `P1` **Meditar** — timer (silêncio + sino + intervalos) + práticas guiadas em texto (body scan, autocompaixão, respiração consciente). _(= RP-4, revisão psicólogo)_
- [x] **[B3.4]** `P1` **Conteúdo curto** — cards de 1 min ("o que é ansiedade", "sono e humor", "emoções não são boas ou ruins"). _(revisão psicólogo)_

### Bloco 4 — Voltar (envolvimento)
- [x] **[B4.1]** `P1` **Trilhas de 7–21 dias** — um passo por dia. _(= RP-2, revisão psicólogo)_
- [x] **[B4.2]** `P1` **Lembrete gentil opcional** — `@capacitor/local-notifications`, máx. 1/dia, horário escolhido, texto sem cobrança (respeita DP-A).
- [x] **[B4.3]** `P1` **Perfil no onboarding** adaptando sugestões e conteúdo. _(= DP-D)_
- [x] **[B4.4]** `P1` **PDF do relatório** para levar ao terapeuta. _(= RP-1)_
- [ ] **[B4.5]** `P2` Definir o que é grátis × Premium — **proposta abaixo, aguardando decisão do André.**

#### Proposta — grátis × Premium (a decidir)
Princípio: **nada ligado a segurança fica atrás de pagamento** (SOS, CVV, respiração, aterramento, registro de pensamento). O grátis precisa ser bom o bastante para criar hábito; o Premium vende **profundidade e acompanhamento**.

| | Grátis | Premium |
|---|---|---|
| Registro (humor, 24 emoções, gatilhos, reflexão adaptada) | ✅ ilimitado | ✅ |
| Sugestão pós-registro, SOS, respiração, aterramento | ✅ | ✅ |
| Registro de pensamento (TCC) | ✅ | ✅ + histórico completo no PDF |
| Relatório | Semana atual + descobertas (top 2) | Semanas e meses anteriores, todas as descobertas |
| PDF para terapia | — | ✅ |
| Meditação | Timer + 2 práticas guiadas | Todas as práticas + novas a cada mês |
| Leituras de 1 minuto | 5 | Todas |
| Trilhas | 1 (Ansiedade) | Todas |
| Hábitos | até 3 | ilimitados |
| Planta, conquistas, desafios, lembrete | ✅ | ✅ |

Preço sugerido (referência de mercado de apps de bem-estar no Brasil): **R$ 14,90/mês ou R$ 99,90/ano**, com **7 dias grátis**. Implementação do bloqueio só junto com o Billing (Fase 06).

### Bloco 5 — Florescer na vida real (pedido do André em 12/09, a partir de material sobre ansiedade/depressão)
- [x] **[B5.1]** `P0` **Pilares do cuidado** — Movimento, Sono, Alimentação, Conexão, Pausa. Card "Hoje eu…" na Home e no registro; respiração, meditação, aterramento e hábitos com pilar marcam sozinhos. Relatório, Descobertas e PDF cruzam pilares × humor. Mostra o que apareceu, nunca o que faltou. Salvo em `progress.pillars`.
- [x] **[B5.2]** `P0` **Pequenos passos** (ativação comportamental) — 20 micro-ações por pilar, plano da semana com até 3 (viram hábitos), revisão gentil na virada da semana ("o que foi possível?"), tela "Só 5 minutos" e sugestão pós-registro com humor baixo.
- [x] **[B5.3]** `P0` **Caminho até a ajuda profissional** — sinal gentil na Home após ~2 semanas pesadas (humor ≤ 2,2 ou ansiedade ≥ 7 em metade dos registros; dispensável, máx. 1x/14 dias); guia "Onde buscar ajuda" (CVV/SAMU com ligação direta, psicologia × psiquiatria, SUS/UBS/CAPS, clínicas-escola, plano, online com CRP/CRM, checklist da 1ª consulta + PDF). Leituras novas: psicologia ou psiquiatria, alimentação, conexão, ativação.
- [x] **[B5.4]** `P1` **Rede de apoio** — "Minhas pessoas" no SOS (até 3 contatos, só no aparelho, ligar/WhatsApp); "Como me apoiar" (texto editável para enviar pela folha de compartilhamento); seção "Para quem apoia alguém" (escutar sem resolver, o que dizer/evitar, presença sem pressão).
- [x] **[B5.5]** `P1` **Trilhas novas** — "Rotina que sustenta" e "Sair do lugar" (7 dias cada); objetivo novo no perfil "Recuperar energia e disposição".
- [ ] **[B5.6]** Testar no celular (ligação `tel:`, WhatsApp, compartilhamento de texto).
- [ ] **[B5.7]** Revisão do psicólogo nos textos novos (DP-C2). App nunca sugere medicação.

### Bloco 6 — Pente fino de visual e usabilidade (pedido em 12/09)
- [x] **[B6.1]** Auditoria de usabilidade: pontos de confusão, telas longas, caminhos duplicados.
- [x] **[B6.2]** Direção visual "traços finos, calmos e modernos" — mockup aprovado em 12/09 ("Florescer em Traço Fino").
- [x] **[B6.3]** Aplicado no app inteiro (5 decisões aprovadas).
- [ ] **[B6.4]** Testar no celular (registro em passos, folha "Preciso de ajuda", Diário, Você, fonte Lexend carregando no Android).

### Continua para depois do v1
- [ ] **[RP-3]** Biblioteca de meditação guiada em **áudio** (produção/licença = custo alto).

## Fase 07 — Processo (recorrente, todo commit)

- [ ] **[F7.1]** Especificação por escrito antes de cada implementação (nome de função, comportamento, o que não mexer)
- [ ] **[F7.2]** Validar sintaxe e checar duplicidade antes de cada commit
- [ ] **[F7.3]** Revisão humana do diff real antes de cada push
- [ ] **[F7.4]** Backup antes de toda mudança estrutural

## Fase 08 — Custos / contratações

- [ ] **[F8.1]** ~~Domínio `.com.br`~~ — **R$ 0 no v1** (adiado; ~R$ 40–60/ano quando registrar)
- [ ] **[F8.2]** Conta Google Play — **US$ 25 única** _(= F5.1)_ — **único custo obrigatório do v1**
- [ ] **[F8.3]** Hospedagem das páginas legais — **Firebase Hosting, R$ 0** (plano Spark) _(= F3.2)_
- [ ] **[F8.4]** Firebase — ~R$ 0 no início; Blaze só na Fase 06 (Cloud Functions do Play Billing)
- [ ] **[F8.5]** ~~E-mail transacional~~ — R$ 0 (remetente padrão do Firebase no v1)
- [ ] **[F8.6]** Play Billing — ~15% por venda (só na Fase 06)

## Fase 09 — Checklist rápido pré-lançamento

**Antes do código**
- [x] Problema e público em uma frase
- [x] Monetização decidida
- [x] Nome definido (domínio adiado — D7)
- [x] Web-só ou também loja — decidido _(D1, D2, D7)_

**Primeira semana**
- [x] Repo git privado
- [x] Backend com regras de segurança _(F3.4)_
- [ ] Segredos só em função de servidor _(F3.5)_
- [x] ~~Domínio / DNS / e-mail transacional~~ — adiados (D7)

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
| até 29/08 | ✅ Fundação + app | repo, regras, todos os P0 de código, aba Conta, gamificação completa |
| 01–07/09 | App Check + páginas legais + testes | F4.4; privacidade + exclusão de conta no Firebase Hosting; usuário testa no navegador; conta Google Play criada |
| 08–14/09 | Wrapper | Capacitor montado, login Google nativo, esquema `florescer://` |
| 15–21/09 | Empacotamento | **teste de OAuth em aparelho real** (gargalo), chave + backup, assets da loja, 12 testadores confirmados |
| ~22/09 | **Sobe teste fechado** | **início dos 14 dias travados** |
| 22/09–06/10 | Teste fechado | corrigir o que os testadores acharem |
| 07–15/10 | Produção | envio + revisão da Play → **lançamento** |
| 14–15/10 | Produção | envio + revisão da Play → **lançamento** |

**Risco:** o teste fechado são 14 dias fixos — se algo antes dele atrasar, a data anda junto. Gargalo principal: **F2.6** (login Google no wrapper Capacitor em aparelho real). Com o domínio fora do caminho crítico (D7), sobrou uma semana de folga vs. a versão anterior do cronograma.

---

## Changelog

- **29/08/2026** — Criado. Ficha atualizada na Carta de Navegação (framework antes chamado "Manual de Bordo"): domínio `florescer.com.br`, pagamento = Google Play Billing, plataforma = Web + Android, data alvo = 15/10/2026. Decisões D1, D2, D4, D5 resolvidas. Fase 06 movida para pós-lançamento.
- **29/08/2026** — Carta de Navegação reestruturada: ficha movida para o topo; adicionada seção "Tese de produto" com 5 diferenciais de mercado (relatório de P&D). Criada a trilha **DP** aqui. Botão "Salvar ficha" da página desativado (bug pré-existente) — ficha passa a ser mantida via Claude Code.
- **29/08/2026** — Kickoff. D3 resolvido: **conta Google Play como pessoa física**. Repositório existente `github.com/lbarrosandre/florecer` conectado à pasta local; commit `94fd6c0` adiciona TAREFAS.md + .gitignore + .gitattributes (não enviado ainda). Identidade git local: André Luiz Barros / lbarros.andre@gmail.com. **Pendências levantadas:** repo está público (tornar privado — F3.1b); pasta dentro do OneDrive; nome do repo é `florecer` sem S.
- **29/08/2026** — Repo tornado **privado**. `firestore.rules` + `firestore.indexes.json` + `firebase.json` + `ARQUITETURA.md`; correções P0 no `index.html` (F4.8 viewport/theme-color, F4.9 dados demo, **F4.19 erro de sintaxe fatal no script do Firebase**). Descoberto no processo: **o app estava não-funcional** — auth quebrada por erro de sintaxe + regras do Firestore expiradas em 22/07.
- **29/08/2026** — Commits `94fd6c0` + `5091a7d` **enviados para `origin/main`** (fast-forward). Branch de trabalho removida.
- **29/08/2026** — Usuário publicou as `firestore.rules` no console + criou os 2 índices compostos (ativos). F3.4/F4.5 concluídos.
- **29/08/2026** — `b82ee48`: **F4.7** (sync junta em vez de sobrescrever + persistência offline) e **F4.20** (`window.S` era `undefined` → auth/sync quebrados). Enviado para `origin/main`. Descoberta acumulada: o app tinha **3 bugs fatais** no fluxo de auth/sync (F4.19 sintaxe, F4.20 `window.S`, + regras expiradas) — nenhum login/sync funcionava.
- **29/08/2026** — Testado em servidor local (`localhost:8000`). Google via `signInWithRedirect` não retornava — trocado por **`signInWithPopup`** (F2.4 parcial). Também `<meta mobile-web-app-capable>` + código de erro visível nas mensagens do Auth. **App validado ponta a ponta pela 1ª vez:** login Google → registro salvo → aparece no Firestore. Tudo em `origin/main`.
- **29/08/2026** — `8e51bd9`: **Parte A** (F4.2 XSS/`esc()`, F4.10 logout, F4.11 aba Conta, F4.12 esqueci senha, F4.14 "Premium em breve") + **diferenciais DP-A/B/C** (home sem cobrança de pendência; "dias de autocuidado" e 🌱 no lugar de 🔥; evidência científica nas técnicas de respiração + rodapé na SOS). Enviado para `origin/main`.
- **30/08/2026** — Gamificação **aprovada** com mockup visual (planta SVG + 8 estágios + animações). **F4.16** (logo base64 → arquivo, −211 KB). **Fase 1**: foto de perfil (recorte circular via canvas) + aba Conta expandida (cadastro, editar nome). O Firebase Storage passou a exigir plano Blaze (cartão) — mudado para salvar a foto como **data URI no doc `users/{uid}`** (funciona no plano grátis, sem ação no console). Foto testada com sucesso.
- **30/08/2026** — **Fase 2** (motor da gamificação, sem UI): `S.progress` + `users/{uid}.progress`; 8 estágios da planta por "dias de cuidado"; 12 conquistas + `checkBadges`; `markCareDay` com hooks em registro/gratidão/hábito/respiração; conquista Recomeço por ausência de 7+ dias; contadores de respiração e SOS.
- **30/08/2026** — **Fase 3** (`origin/main`): planta SVG (8 estágios), card na Home, tela **Jornada** (planta grande + grade de conquistas + desafio semanal opt-in), animações (crescimento, regada, volta, conquista), `backfillCareDays` (usa histórico existente). Gamificação **DP-F v1 completa** — falta o usuário testar no navegador (Ctrl+Shift+R).
- **30/08/2026** — **Escopo do v1 congelado.** O usuário levantou que o app está "pobre" (falta meditação, registro raso). Decisão: v1 lança enxuto e grátis; profundidade (meditação guiada, thought record TCC, insights pro, relatório PDF, programas) vira **Roadmap de produto RP-1..7**, pós-lançamento, com o psicólogo (DP-C2). Registrado aqui e na Carta de Navegação.
- **31/08/2026** — **F4.15/F4.18** (paths relativos, grafia "Florescer"). **F2.3: wrapper Capacitor 8 montado e buildando** (`./gradlew assembleDebug` → `app-debug.apk`). Ambiente do usuário: Node 24, JDK 21, Android Studio ok — mas `ANDROID_HOME` estava errado (apontava pra Downloads; SDK real em `AppData\Local\Android\Sdk`, contornado com `android/local.properties`). Emulador Pixel_6 não bootou em ~10 min. SHA debug capturada para o Firebase (F2.4).
- **10/09/2026** — **Escopo do v1 revisto.** Depois de usar no celular, o usuário concluiu que não pagaria pelo app como está ("precisa de mais robustez, informação, envolvimento, relatórios, ajuda"). Diagnóstico: via de mão única. Aprovados os **Blocos 1–4** (registrar → entender → agir → voltar) dentro do v1. Data alvo → meados de novembro; teste fechado começa após o Bloco 2 e corre em paralelo.
- **10/09/2026** — 🎉 **F2.6 PASSOU: app rodando em aparelho real** (Galaxy A36 5G). Login Google nativo funcionou, sincronizou o Firestore, tela inicial com a planta e a gamificação. **O maior gargalo do projeto está vencido.** Caminho até aqui: Bloqueador Automático da Samsung impedia ativar a Depuração USB; emulador Pixel_6 não boota nessa máquina (usar aparelho real); e o bug que travava o login era `rgcfaIncludeGoogle` não definido em `android/variables.gradle` (o plugin caía no default `false` e compilava sem as libs do Google — `signInWithGoogle()` ficava pendurado, sem erro no logcat). Corrigido em `7e39eaa`.
- **02/09/2026** — **F2.4 (login Google nativo) feito.** Usuário adicionou SHA + baixou `google-services.json`. Plugin `@capacitor-firebase/authentication` 8.5.1, `doGoogleLogin` bifurca native/web, build OK (`app-debug.apk` ~6 MB). **F2.5 cancelado** (plugin usa seletor nativo, sem redirect). ⚠️ **OneDrive travando os builds** (`EBUSY`/`Unable to delete`) — contornado com `gradlew --stop` + limpar `build/`, mas **recomendado mover o projeto para fora do OneDrive** (ex. `C:\dev\florescer`).
- **30/08/2026** — **D7: domínio não é necessário para o v1.** App só Android + Capacitor → sem `assetlinks.json` (F5.4 cancelado), sem DNS (F3.3 N/A), sem e-mail de marca (F3.6 adiado). As 2 páginas legais vão no **Firebase Hosting** grátis (`florecer-app-c460d.web.app`). Único custo obrigatório do v1: **US$ 25** da conta Google Play. Cronograma reorganizado (uma semana de folga a mais).
- **10/09/2026** — **Bloco 1 concluído** (roda de 24 emoções, pergunta de reflexão adaptada, polimento). **Bloco 2 concluído:** aba Histórico agora abre em **Relatório** (Semana/Mês com navegação entre períodos): resumo com comparação gentil ao período anterior, gráfico de humor (SVG, dias sem registro tracejados), clima emocional por quadrante, **Descobertas** (gatilhos, sono, hábitos, horário do dia, dia da semana, emoção × gatilho — só com ≥5 registros, semana olha 30 dias, linguagem de pista e não diagnóstico), gatilhos, sono × humor, hábitos × humor, gratidão. Resumo da semana também na Home. Aba Insights do "Mais" removida (absorvida). Validado com dados simulados; **falta testar no celular**.
- **10/09/2026** — **Bloco 3 concluído.** Nova aba **Cuidar** no menu (substitui "Respirar"): "O que está pesando agora?" (6 necessidades → ferramentas recomendadas), Respirar, **Meditar** (timer 3–20 min com sino de intervalo gerado por Web Audio + 5 práticas guiadas em texto: respiração consciente, escaneamento corporal, autocompaixão, folhas no rio, relaxamento muscular), **Aterramento 5-4-3-2-1** passo a passo (também no SOS), **Registro de pensamento TCC** em 7 passos (situação → pensamento + crença → emoções + intensidade → armadilhas → evidências → alternativa → reavaliação, com antes/depois e histórico), **10 leituras de 1 minuto** com "experimente agora" e fonte. **Pós-registro** agora sugere até 2 ferramentas conforme emoções/ansiedade/sono. +4 conquistas (16, grade 4×4) e desafio semanal de meditação. ⚠️ **Ação do usuário:** publicar o `firestore.rules` atualizado (coleção `thoughts`) no console — sem isso os registros de pensamento ficam só no aparelho. Textos das práticas/leituras entram na revisão do psicólogo (DP-C2).
- **10/09/2026** — **Bloco 4 concluído (B4.1–B4.4); B4.5 com proposta registrada.** **Perfil no onboarding** (objetivos, se faz terapia, lembrete) — aparece uma vez após o login, editável na Conta, salvo em `users/{uid}.profile`; alimenta "Para você" em Cuidar, sugestão de trilha na Home e o texto do card do PDF. **4 trilhas de 7 dias** (ansiedade, sono, gentileza, emoções), um passo por dia com ação e pergunta de reflexão, progresso em `progress.trails`, card na Home. **Lembrete gentil** com `@capacitor/local-notifications` 8.3.1: máx. 1/dia, pula o dia se já houve registro, agenda só 14 dias (quem some para de receber), ícone de notificação próprio; permissão `SCHEDULE_EXACT_ALARM` removida do manifesto (agendamento inexato, sem declaração na Play). **PDF do relatório** com jsPDF 4.2.1 (carregado sob demanda de `www/vendor/`), `@capacitor/filesystem` + `@capacitor/share` para compartilhar no Android; opção de incluir ou não os textos escritos. Validado em navegador headless e PDF gerado com dados simulados; **falta testar no celular** (notificação e compartilhamento só existem no nativo).
- **12/09/2026** — **Bloco 5 implementado** (B5.1–B5.5): pilares do cuidado, pequenos passos, caminho até a ajuda profissional, rede de apoio e 2 trilhas novas. Sem regra nova no Firestore (pilares/plano ficam em `progress`; contatos só no aparelho). Validado em navegador headless; falta teste no celular. **Bug corrigido no teste de 11/09:** `window.scheduleReminders` sobrescrevia a própria função (recursão infinita) — derrubava o modal pós-registro e o agendamento do lembrete. Próximo: **Bloco 6 — pente fino visual/UX**.
- **12/09/2026** — **Bloco 6 aplicado — "Florescer em Traço Fino".** André aprovou as 5 decisões e lembrou que o app "não deixa de ser um diário". Mudanças: (1) **menu em 5 destinos** — Hoje · Cuidar · Registrar (+) · **Diário** · Você; "Mais" e "Histórico" deixam de existir; (2) **registro em 4 passos** com barra de progresso, só o humor obrigatório (ansiedade e sono agora opcionais — `anxiety`/`sleep` podem ser `null`), "Salvar agora" em qualquer passo, emoções pelo tom (4 quadrantes → 6 palavras); (3) **gratidão dentro do registro** ("Algo bom de hoje?") e tela própria acessível pelas sugestões; (4) **Lexend + ícones de linha** (sprite SVG, função `ico()`), emojis removidos da navegação, práticas e títulos, bordas de 1px no lugar de sombra, fundo névoa fixo (sai a troca de cor por período do dia); (5) **"Preciso de ajuda"** no topo das telas principais, abrindo folha com Respirar comigo · Minhas pessoas · CVV 188. **Diário** abre nos registros agrupados por dia (rosto, emoções, anotação, gratidão e pilares do dia); Relatório e Ano ficam em abas. **Hoje** mostra a pergunta com rostos (1 toque inicia o registro) ou, depois de registrar, "Seu dia". **Cuidar** organizado por tempo (para agora / para entender / para a semana / apoio); leituras e trilhas ganharam telas de lista próprias. Aplicado com script de 83 edições exatas; validado em 25 cenários no navegador headless sem erro de JavaScript. Falta teste no celular.
