// Copia os arquivos da web para www/ — a pasta que o Capacitor empacota no app.
// Uso: node scripts/build-www.mjs   (ou: npm run build)
import { mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const files = ['index.html', 'manifest.json', 'service-worker.js', 'icon-192.png', 'icon-512.png'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of files) copyFileSync(join(root, f), join(out, f));
console.log(`www/ pronto — ${files.length} arquivos`);
