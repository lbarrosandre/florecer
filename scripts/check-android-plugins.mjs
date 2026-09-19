// Confere se todos os plugins do Capacitor listados no package.json entraram no projeto Android.
// Sem isso o APK compila normalmente, mas notificações, arquivos, compartilhamento e afins
// param de funcionar em silêncio — o plugin simplesmente não existe dentro do app.
//
// Uso: node scripts/check-android-plugins.mjs   (rodar antes do gradlew)
// Se falhar: npx cap sync android  (no projeto, não numa cópia temporária) e commitar
// android/capacitor.settings.gradle e android/app/capacitor.build.gradle.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const base = ['@capacitor/android', '@capacitor/cli', '@capacitor/core'];
const esperados = Object.keys(JSON.parse(read('package.json')).dependencies || {})
  // "capacitor" em qualquer lugar do nome: plugins de terceiros (@capgo/..., capacitor-...)
  // também precisam entrar no projeto Android, e ficavam de fora quando o filtro exigia @capacitor/.
  .filter((n) => /capacitor/i.test(n) && !base.includes(n));

let noJson = [];
try { noJson = JSON.parse(read('android/app/src/main/assets/capacitor.plugins.json')).map((p) => p.pkg); } catch (e) {}
const settings = read('android/capacitor.settings.gradle');
const build = read('android/app/capacitor.build.gradle');

const faltando = esperados.filter((n) => {
  const modulo = n.replace('@', '').replace('/', '-');
  return !noJson.includes(n) || !settings.includes(`':${modulo}'`) || !build.includes(`project(':${modulo}')`);
});
if (faltando.length) {
  console.error('Plugins fora do projeto Android: ' + faltando.join(', ') + '\nRode: npx cap sync android');
  process.exit(1);
}
console.log('plugins do Android ok: ' + esperados.join(', '));
