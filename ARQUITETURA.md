# Florescer — Arquitetura

> Decisões de base do projeto, tomadas no kickoff (29/08/2026) com apoio da
> **Carta de Navegação**. Ver [TAREFAS.md](TAREFAS.md) para o plano de execução.

## Visão geral

Diário de bem-estar (humor, hábitos, gratidão, reflexão, respiração guiada, SOS).
Público brasileiro, pt-BR. App **offline-first**: tudo funciona sem rede, a nuvem
é só sincronização entre dispositivos.

## Decisões

| # | Decisão | Motivo |
|---|---|---|
| D1 | **Wrapper: Capacitor** (não TWA) | Assinatura vendida dentro do app Android exige Google Play Billing, que exige plugin nativo. TWA não suporta plugin nativo. Montar em Capacitor desde já evita reconstruir o wrapper depois. |
| D2 | **Android (loja) + web mínima** | Sem iOS por enquanto. A web existe só como suporte legal: política de privacidade, exclusão de conta e `assetlinks.json` (Digital Asset Links). |
| D3 | Conta Google Play como **pessoa física** | Nome civil aparece publicamente na ficha da loja. Reavaliar se/quando houver CNPJ. |
| D4 | Cobrança da assinatura via **Google Play Billing** | Política da Play para bens digitais consumidos no app. Mercado Pago descartado (só faria sentido com checkout web). |
| D5 | Grafia oficial: **"Florescer"** (com S) | Público BR. O código legado usa "Florecer" — padronizar (tarefa F4.18). |

## Stack

| Camada | Escolha | Observações |
|---|---|---|
| Front-end | HTML + CSS + JS puro, sem build | Hoje tudo num único `index.html` (~313 KB). Quebrar em `index.html` + `app.js` + `styles.css` (F4.17). |
| Wrapper Android | Capacitor | A montar (F2.3). |
| Auth | Firebase Authentication | E-mail/senha + Google. No wrapper, o login Google usa plugin nativo (`@capacitor-firebase/authentication`), não `signInWithRedirect` (F2.4). |
| Banco | Cloud Firestore | Projeto `florecer-app-c460d`, conta `lbarros.andre@gmail.com`. |
| Offline | Persistência do Firestore + `localStorage` | Hoje só `localStorage`; `enableIndexedDbPersistence` a ligar (F2.7 / F4.7). |
| Hospedagem web | Netlify (tier grátis) | Deploy automático por push (F3.2). |
| E-mail transacional | SMTP custom no Firebase Auth ou Resend | Para redefinição de senha vir com remetente da marca (F3.6). |
| Pagamento | Google Play Billing + Cloud Function de validação | Fase 06, pós-lançamento. |

## Modelo de dados (Firestore)

| Coleção / doc | Formato | Escrito por |
|---|---|---|
| `users/{uid}` | `{ name, email, photo, createdAt, isPremium }` | registro / login Google |
| `habits/{uid}` | `{ list: [{id, name, icon, streak}], uid }` | `saveHabitsCloud` |
| `habitDone/{uid}` | `{ "<Date.toDateString()>": [habitId...], uid }` | `saveHabitsCloud` |
| `logs/{autoId}` | `{ uid, date, mood(1-5), anxiety(0-10), sleep, triggers[], note, time }` | `saveLogCloud` |
| `gratitude/{autoId}` | `{ uid, date, text }` | `saveGratitudeCloud` |

Consultas: `logs` e `gratitude` são lidos com `where('uid','==',uid).orderBy('date','desc')`
→ exigem índice composto (ver `firestore.indexes.json`).

## Segurança

- **`firestore.rules`**: cada usuário só acessa os próprios dados; nada público.
  Substitui o modo teste (`allow read, write: if true`) que **expirou em 22/07/2026**
  — desde então toda sincronização com a nuvem está sendo negada.
- `isPremium` nunca pode ser elevado pelo cliente. Quando houver cobrança, só uma
  Cloud Function (Admin SDK) seta `isPremium = true`.
- Firebase App Check a ativar (F4.4).
- Toda entrada de usuário que vira `innerHTML` deve passar por escape (F4.2).
- `firebaseConfig` no cliente **não é segredo** — a proteção real são as regras
  + App Check. Segredos de verdade (webhooks de pagamento) só em Cloud Function.

## Deploy das regras

```bash
# uma vez
npm i -g firebase-tools
firebase login
firebase use florecer-app-c460d

# a cada mudança em firestore.rules / firestore.indexes.json
firebase deploy --only firestore
```

Alternativa sem CLI: colar o conteúdo de `firestore.rules` no console
(Firestore Database → Regras → Publicar) e criar os índices manualmente.
