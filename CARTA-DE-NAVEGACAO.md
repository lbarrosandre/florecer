# Florescer — Carta de Navegação v2.0

> **Versão 2.0 · 20/09/2026.** A v1.0 (29/08/2026) foi escrita antes da primeira linha de código,
> no formato criado para o Bússola Finance. Esta versão a atualiza com o que foi executado,
> o que mudou de rumo e o que ficou para depois.
>
> Documentos irmãos: [ARQUITETURA.md](ARQUITETURA.md) (decisões de base) ·
> [TAREFAS.md](TAREFAS.md) (execução, dia a dia) · [CAPACITOR.md](CAPACITOR.md) (wrapper Android).

---

## 1. O que é o Florescer

Diário de bem-estar emocional para Android, em português do Brasil, **offline-first**: tudo
funciona sem rede, e a nuvem serve só para sincronizar entre aparelhos.

**Para quem:** pessoas que querem entender o que sentem e cuidar disso sem terapia obrigatória,
sem jargão clínico e sem cobrança.

**O que não é:** serviço de saúde. Não diagnostica, não trata, não promete cura. Isso vale para
o texto do app, da loja e das declarações — inclusive porque app médico exige conta de empresa
na Play Store (aprendido na marra: ver seção 6).

---

## 2. Tese de produto — os cinco diferenciais

| # | Diferencial | Como está |
|---|---|---|
| DP-A | **Sem cobrança emocional.** A Home nunca cobra pendência; dia sem registro não vira falha | ✅ feito |
| DP-B | **Progresso que acolhe.** "Dias de cuidado" e uma planta que cresce, no lugar de sequências e fogo | ✅ feito |
| DP-C | **Evidência, não achismo.** Técnicas com fonte; linguagem de pista, nunca de diagnóstico | ✅ feito · falta a revisão do psicólogo (DP-C2) |
| DP-D | **Comunidade que sustenta.** Murais moderados e anônimos: palavras que florescem e movimento que muda vidas | ✅ feito (era pós-v1, antecipado) |
| DP-E | **Privacidade como produto.** Conteúdo pessoal nunca chega ao administrador; números só agregados | ✅ feito |
| DP-F | **Gamificação que acolhe.** Planta em 8 estágios, 16 conquistas, desafio semanal opcional | ✅ feito |

**Princípio que resolve empate:** simplicidade acima de tudo. Uma coisa por tela, cada coisa em
um só lugar. Em dúvida, tirar — não acrescentar.

---

## 3. Decisões de rumo (e as que mudaram)

| # | Decisão | Quando | Situação hoje |
|---|---|---|---|
| D1 | Wrapper **Capacitor**, não TWA | 29/08 | ✅ mantida — Play Billing exige plugin nativo |
| D2 | **Android + web mínima** (só páginas legais) | 29/08 | ✅ mantida |
| D3 | Conta Play como **pessoa física** | 29/08 | ✅ mantida — limita o app a "Saúde e fitness", nunca "Medicina" |
| D4 | Cobrança por **Play Billing** | 29/08 | 🟡 adiada para depois do lançamento |
| D5 | Grafia **"Florescer"** com S | 29/08 | ✅ feita |
| D6 | **Escopo do v1 congelado** (app enxuto e grátis) | 30/08 | ❌ **revista em 10/09**: depois de usar no celular, o app precisava de profundidade antes da loja |
| D7 | Sem domínio próprio no v1 | 30/08 | 🟡 **a reavaliar**: sem domínio, o e-mail do app sai de uma conta Gmail dedicada, o que entrega pior |
| D8 | **Três idiomas** (PT/EN/ES) | ~12/09 | ❌ **abortada em 16/09**: app só em português, loja só no Brasil |
| D9 | Páginas legais no **Netlify**, não Firebase Hosting | 16/09 | ✅ feita — já permite funções de servidor, usadas na exclusão de conta |
| D10 | **Exclusão de conta dentro do app**, com função de servidor | 19/09 | ✅ feita e testada em produção |
| D11 | **Assinatura: 7 dias grátis**, R$ 12,99/mês ou R$ 119,99/ano | 15/09 | 🟡 definida, não implementada |

---

## 4. O que já está de pé (20/09/2026)

**Registrar e entender**
- Registro em 4 passos (só o humor obrigatório), roda de 24 emoções, gatilhos, sono, anotação.
- Diário por dia, relatório de semana/mês com comparação gentil, Descobertas (só com ≥5 registros),
  ano em revista, PDF do relatório para levar à terapia.

**Agir**
- Cuidar organizado por tempo: respirar, meditar (timer + 5 práticas), aterramento 5-4-3-2-1,
  registro de pensamento em 7 passos, 12 leituras de 1 minuto, 6 trilhas de 7 dias.
- Hábitos com lembrete por horário, pergunta diária e "marcar como feito" pela notificação.
- Rede de apoio: minhas pessoas, "como me apoiar", CVV sempre a um toque.

**Pertencer**
- Mural "Palavras que florescem" e "O movimento muda vidas", moderados, anônimos, com reações
  "Gostei" e "Brotou em mim" — contador à prova de repetição, validado no servidor.
- Convite "plante uma semente": cartão com uma frase do mural, para enviar a quem precisa.

**Segurança e privacidade**
- Regras do Firestore com teste de invasão automatizado: 44 casos, 35 ataques, nenhum passou.
- Bloqueio do app por código de 6 dígitos (PBKDF2) ou digital.
- Exclusão de conta dentro do app, com e-mail de confirmação; painel do administrador sem
  nenhum conteúdo pessoal; estatísticas anônimas e desligáveis.

**Publicação**
- App assinado, teste interno na Play, páginas legais no ar (privacidade, termos, exclusão,
  convite), ícone e abertura com a marca.

---

## 5. Onde estamos e o que falta

| Etapa | Situação |
|---|---|
| Produto do v1 | 🟢 completo para testar com pessoas |
| Teste fechado | 🟡 falta reunir **12 testadores por 14 dias** — é o último bloqueio da publicação |
| Revisão clínica (DP-C2) | 🔴 não começou — textos de saúde mental sem revisão profissional |
| Consentimento de dado sensível | 🔴 caixa própria no cadastro, exigida pela LGPD, ainda não existe |
| App Check | 🟡 protege o backend contra abuso automatizado; não ativado |
| Retrato do bem-estar (Bloco 13) | 🟡 desenhado (WHO-5 a cada 14 dias, 7 domínios), não implementado |
| Assinatura (Bloco 11) | 🟡 preço definido, implementação pendente |
| Produção na Play | ⚪ depende do teste fechado e da revisão clínica |

**Data alvo:** meados de novembro/2026 — mantida.

---

## 6. Riscos e lições (o que já custou caro)

| Risco | O que aconteceu | O que ficou de regra |
|---|---|---|
| **Falha silenciosa no aparelho** | O APK saía sem os plugins nativos: PDF, notificações e compartilhar não faziam nada, sem erro | Checagem automática de plugins antes de todo build |
| **Nome repetido entre scripts** | O app abria em branco no celular, sem erro no navegador | Checagem de scripts obrigatória antes de gerar pacote |
| **Declaração errada na Play** | Marcar "saúde mental" na declaração de saúde exigia conta de empresa → app rejeitado | App é "Saúde e fitness". Nunca linguagem clínica |
| **Espera de rede no caminho de entrada** | O app travava ao abrir e ao entrar com senha: esperava toda a sincronização antes de mostrar a tela | Num app offline-first, a tela abre com o dado local; a nuvem chega depois, com prazo |
| **Segredo em mensagem de erro** | A senha do keystore vazou no eco de um comando | Senha por variável de ambiente; nunca em linha de comando ou conversa |
| **Ferramenta que muda embaixo** | O JDK do Android Studio virou Java 25 e derrubou o Gradle com erro que não fala de Java | Versão de JDK fixada e documentada |
| **Chave de assinatura** | — | É pessoal e insubstituível; backup fora do OneDrive corporativo |

**Risco aberto mais relevante:** publicar conteúdo de saúde mental sem revisão profissional.
Nenhum ganho de prazo justifica.

---

## 7. Como este projeto é tocado

- **Uma pessoa decide o produto** (André); a implementação segue as habilidades
  `app-android-capacitor` e `desenvolvimento-seguro`.
- **Toda mudança passa por:** entender o pedido em termos de produto → editar com segurança →
  checagens automáticas → teste sem celular → teste no celular → commit → registro no TAREFAS.
- **Toda funcionalidade que toca dado pessoal, dinheiro ou permissão** passa por modelagem de
  ameaças antes de ser escrita.
- **O que a página de privacidade promete vira obrigação.** Só se escreve o que o app cumpre.
- **Receita que já funciona em um app vale no outro.** Antes de inventar, olhar o Bússola.
