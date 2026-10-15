// Gera o QR code do atalho do app, na cor da marca, para story, cartão e material impresso.
//
// O QR aponta para o atalho curto (/app), nunca para a URL da loja: assim o destino muda no
// _redirects sem invalidar nenhum QR já impresso ou publicado.
//
// Uso: node scripts/gera-qr.mjs [url]
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';

const URL = process.argv[2] || 'https://app-florescer.netlify.app/app';
const VERDE = '#2F7A64';
const FUNDO = '#F4F7F5';

// Correção de erro alta: QR impresso ou fotografado de tela torto ainda precisa ler.
const opcoes = { errorCorrectionLevel: 'H', margin: 2, color: { dark: VERDE, light: FUNDO } };

await QRCode.toFile('assets-loja/qr-app.png', URL, { ...opcoes, width: 1200 });
const svg = await QRCode.toString(URL, { ...opcoes, type: 'svg' });
writeFileSync('assets-loja/qr-app.svg', svg);

// Versão para story do Instagram (1080×1920), com a frase e o endereço escrito por extenso:
// quem vê no story não pode tocar no QR, mas pode digitar o endereço.
const qrSvgInterno = svg.replace(/<\?xml[^>]*\?>|<!DOCTYPE[^>]*>/g, '').trim();
const story = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="${FUNDO}"/>
  <text x="540" y="430" text-anchor="middle" font-family="system-ui,sans-serif" font-size="58"
        font-weight="300" fill="#1F5A4A" letter-spacing="3">florescer</text>
  <text x="540" y="530" text-anchor="middle" font-family="system-ui,sans-serif" font-size="40"
        fill="#56645E">Entender o que você sente</text>
  <text x="540" y="590" text-anchor="middle" font-family="system-ui,sans-serif" font-size="40"
        fill="#56645E">começa por nomear.</text>
  <g transform="translate(240 700) scale(6)">${qrSvgInterno.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
  <text x="540" y="1420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36"
        fill="#2F7A64" font-weight="500">app-florescer.netlify.app/app</text>
  <text x="540" y="1510" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32"
        fill="#7E8B85">Grátis · Android</text>
</svg>`;
writeFileSync('assets-loja/story-qr.svg', story);

console.log('QR gerado para: ' + URL);
console.log('  assets-loja/qr-app.png   (1200px, para post e impressão)');
console.log('  assets-loja/qr-app.svg   (vetor, para qualquer tamanho)');
console.log('  assets-loja/story-qr.svg (1080×1920, story pronto)');
