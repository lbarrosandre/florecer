// Procura promessa de resultado clínico nos textos do app, da loja e das páginas legais.
//
// O risco de um app de bem-estar não é citar TCC ou mindfulness: é afirmar que funciona.
// "Comprovado", "eficaz", "reduz a ansiedade", "trata" são linguagem de tratamento — exigem
// respaldo clínico e são o que derruba o app na análise da loja. Linguagem de ferramenta
// ("ajuda a perceber", "serve para organizar") não exige nada disso e diz a verdade.
//
// Uso: node scripts/varre-promessas.mjs [arquivo...]
import { readFileSync, existsSync } from 'node:fs';

const ALVOS = process.argv.slice(2).length ? process.argv.slice(2) : [
  'index.html',
  'site/index.html', 'site/privacidade/index.html', 'site/termos/index.html',
  'site/excluir-conta/index.html', 'site/convite/index.html',
  'assets-loja/ficha-da-loja.txt',
];

// Cada padrão traz o motivo: sem ele, a correção vira caça a palavra, e some o que importa.
const PADROES = [
  {re: /\b(comprovad|cientificamente comprovad|clinicamente (testad|comprovad))/i, g: 'GRAVE',
   o: 'afirma comprovação', d: 'só se houver estudo do próprio app; troque por "baseado em" + fonte'},
  {re: /\b(trata|tratamento d[eoa]|cura|curar|curando)\b/i, g: 'GRAVE',
   o: 'linguagem de tratamento', d: 'o app não trata; diga o que ele faz ("ajuda a acompanhar")'},
  {re: /\b(diagnóstic|diagnostica)\w*/i, g: 'GRAVE',
   o: 'linguagem de diagnóstico', d: 'só vale quando a frase nega ("não faz diagnóstico")'},
  {re: /\b(reduz|elimina|acaba com|resolve)\s+(a\s+)?(ansiedade|depress|estresse|insônia|angústia)/i, g: 'GRAVE',
   o: 'promete resultado clínico', d: 'troque por "pode ajudar a lidar com", sem garantia'},
  {re: /\b(garant\w+|com certeza você|você vai (melhorar|ficar bem|superar))/i, g: 'ALTO',
   o: 'promessa de resultado', d: 'nenhuma ferramenta garante melhora; descreva o uso, não o efeito'},
  {re: /\b(terapia digital|substitui (terapia|acompanhamento|psicólog)|seu (psicólogo|terapeuta) de bolso)/i, g: 'GRAVE',
   o: 'posiciona como serviço de saúde', d: 'o app é apoio ao autocuidado e diz que não substitui'},
  {re: /\b(eficaz|eficácia|efetivo para)\b/i, g: 'ALTO',
   o: 'afirma eficácia', d: 'atribua à técnica com fonte, nunca ao app'},
  {re: /\b(deve|precisa|tem que)\s+(fazer|registrar|usar|praticar)\b/i, g: 'MEDIO',
   o: 'cobrança', d: 'o app não cobra; use convite ("se quiser", "quando fizer sentido")'},
  {re: /\b(sempre|nunca)\s+(funciona|resolve|ajuda)\b/i, g: 'ALTO',
   o: 'generalização', d: 'nada funciona para todo mundo; relativize'},
];

// Frases que NEGAM promessa são justamente o que queremos ter no app — não são achado.
// Sem esta lista a varredura acusa o próprio aviso ("não faz diagnóstico") e vira ruído:
// o André perde tempo lendo 12 linhas para achar a única que importa.
const NEGACAO = new RegExp([
  'não substitui', 'não é serviço de saúde', 'não (faz|constitui) diagnóstic', 'não diagnostica',
  'não trata', 'sem diagnóstic', 'não promete', 'não como diagnóstico', 'nem indica tratamento',
  'procure (um |uma )?(profissional|médico|psicólog)', 'busque ajuda profissional',
  // usos legítimos da palavra fora do sentido clínico
  'trata(r)? (isso|os dados|dado|cada|a pessoa) como', 'promessas de cura',   // regra do mural: o que é proibido publicar
  'garantias previstas', 'garante que cada', 'garantem que cada', 'que o código de defesa',
  'não precisa', 'não é obrigat',
].join('|'), 'i');

const achados = [];
for (const arq of ALVOS) {
  if (!existsSync(arq)) continue;
  const linhas = readFileSync(arq, 'utf8').split(/\r?\n/);
  // Uma seção que LISTA o que não se pode escrever contém, por definição, tudo o que a
  // varredura procura. Sem reconhecê-la, o documento que ensina a regra é acusado por ela.
  let emSecaoProibida = false;
  linhas.forEach((linha, i) => {
    if (/^===/.test(linha)) emSecaoProibida = /NUNCA ESCREVER|NÃO ESCREVER|PROIBID/i.test(linha);
    if (emSecaoProibida) return;
    const limpa = linha.replace(/<[^>]+>/g, ' ');
    // Comentário de código não é texto que alguém lê no app.
    if (/^\s*(\/\/|\*|\/\*)/.test(linha)) return;
    if (NEGACAO.test(limpa)) return;
    for (const p of PADROES) {
      const m = p.re.exec(limpa);
      if (!m) continue;
      achados.push({g: p.g, arq, linha: i + 1, o: p.o, d: p.d,
        trecho: limpa.trim().slice(Math.max(0, m.index - 50), m.index + 90).trim()});
    }
  });
}

const ordem = {GRAVE: 0, ALTO: 1, MEDIO: 2};
achados.sort((a, b) => ordem[a.g] - ordem[b.g]);

console.log('--- varredura de promessas clínicas\n');
if (!achados.length) console.log('nenhuma promessa de resultado encontrada.');
for (const a of achados) {
  console.log(`[${a.g}] ${a.arq}:${a.linha} — ${a.o}`);
  console.log(`        “…${a.trecho}…”`);
  console.log(`        -> ${a.d}\n`);
}
console.log('total: ' + achados.length + ' achado(s)');
console.log('\nO que a varredura NÃO vê: se a técnica está bem descrita e se falta encaminhamento');
console.log('em algum ponto. Isso continua sendo leitura humana — de preferência profissional.');
process.exit(achados.some((a) => a.g === 'GRAVE') ? 1 : 0);
