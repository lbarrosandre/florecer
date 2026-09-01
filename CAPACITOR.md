# Empacotamento Android — Capacitor

Guia do wrapper Android do Florescer. Fazemos **passo a passo juntos** — este arquivo é a referência.

## Por que Capacitor (não TWA)

Assinatura vendida dentro do app Android exige **Google Play Billing**, que exige plugin nativo. TWA não suporta plugin nativo. (Decisão D1.)

## Pré-requisitos (na sua máquina)

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 20+ | `node -v` |
| JDK | 17 | `java -version` |
| Android Studio | atual, com **Android SDK** e um **emulador** ou celular com depuração USB | — |

Depois de instalar o Android Studio: abra-o uma vez, deixe ele baixar o SDK (Tools → SDK Manager → API 34+).

## Passo 1 — Instalar o Capacitor no projeto

Na pasta do projeto:

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

O `capacitor.config.json` já está no repo:
- `appId`: `br.com.florescer.app` — **permanente depois de publicar**, não precisa possuir o domínio
- `appName`: `Florescer`
- `webDir`: `www` (gerado pelo `npm run build`)

## Passo 2 — Gerar a pasta web e adicionar a plataforma Android

```bash
npm run build          # cria www/ com os 5 arquivos da web
npx cap add android    # cria a pasta android/ (projeto nativo)
npx cap sync android   # copia www/ + plugins para dentro do android/
```

A pasta `android/` fica **fora do git** (está no `.gitignore`) — é gerada.

## Passo 3 — Abrir e rodar

```bash
npx cap open android   # abre o Android Studio no projeto
```

No Android Studio: escolher um emulador ou celular → botão ▶ Run. O app deve abrir mostrando a tela de login do Florescer.

> A cada mudança no `index.html` (ou nos outros arquivos web): `npm run cap:sync` e Run de novo.

## Passo 4 — Login Google nativo (F2.4)

`signInWithPopup` **não funciona** dentro do WebView. Vamos usar o plugin nativo:

```bash
npm install @capacitor-firebase/authentication
```

- Registrar a **impressão SHA-1 e SHA-256** do app no Firebase Console (Configurações do projeto → Seus apps → Android → Adicionar impressão digital). A SHA sai de:
  ```bash
  cd android && ./gradlew signingReport
  ```
- Baixar o `google-services.json` do Firebase e colocar em `android/app/`
- Ajustar o código: quando rodando no app nativo (`Capacitor.isNativePlatform()`), usar `FirebaseAuthentication.signInWithGoogle()` em vez do `signInWithPopup`.

## Passo 5 — Retorno de OAuth por esquema próprio (F2.5)

Esquema `florescer://` no `AndroidManifest.xml` (via `intent-filter`) — não depende de verificação de domínio (por isso não precisa de `assetlinks.json`).

## Passo 6 — Teste em aparelho real (F2.6) — o gargalo

Instalar o `.apk` num celular de verdade e **fazer login com Google de ponta a ponta**. É o ponto que a Carta de Navegação marca como o maior risco histórico. Testar cedo, não na véspera.

## Passo 7 — Build de release + chave de assinatura (F5.2)

```bash
keytool -genkey -v -keystore florescer-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias florescer
```

- **Backup do `.jks` e da senha em 2 lugares diferentes, no mesmo dia.**
- Nunca versionar o `.jks` (já está no `.gitignore`).
- Com Play App Signing ligado (padrão), perder a chave de upload é recuperável — mas evite o transtorno.

---

## Ordem no plano

F2.3 (passos 1–3) → F2.4 (passo 4) → F2.5 (passo 5) → **F2.6 (passo 6)** → F5.2 (passo 7).
