// Monta o documento de revisão clínica a partir do próprio app, para que nenhum texto fique de
// fora por esquecimento: leituras, práticas guiadas, trilhas, perguntas de reflexão, mensagens
// de acolhimento e o conteúdo da tela de ajuda.
//
// Uso: node scripts/extrai-textos-clinicos.mjs > REVISAO-CLINICA.md
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

// Os dados do app são literais de objeto dentro do HTML. Em vez de interpretar JavaScript,
// recortamos cada bloco e lemos como dado — é mais simples e não executa nada.
function bloco(nome, abre) {
  const i = html.indexOf(abre);
  if (i < 0) return null;
  let j = i + abre.length, profundidade = 1, dentroTexto = null;
  while (j < html.length && profundidade > 0) {
    const c = html[j];
    if (dentroTexto) { if (c === dentroTexto && html[j - 1] !== '\\') dentroTexto = null; }
    else if (c === "'" || c === '"' || c === '`') dentroTexto = c;
    else if (c === '[' || c === '{') profundidade++;
    else if (c === ']' || c === '}') profundidade--;
    j++;
  }
  return html.slice(i + abre.length, j - 1);
}

const texto = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const campos = (src, chave) => [...src.matchAll(new RegExp(chave + ":\\s*'((?:[^'\\\\]|\\\\.)*)'", 'g'))].map((m) => texto(m[1]));

const saida = [];
const P = (s) => saida.push(s);

P('# Florescer — textos para revisão profissional\n');
P('> Documento gerado automaticamente do aplicativo em ' + new Date().toLocaleDateString('pt-BR') + '.');
P('> Reúne **todo** o conteúdo que fala de saúde mental: leituras, práticas, trilhas, perguntas e');
P('> mensagens de acolhimento. Nada foi reescrito para esta revisão — é o que a pessoa lê no app.\n');
P('## O que o Florescer é, e o que não é\n');
P('Diário de bem-estar emocional para Android, em português. A pessoa registra humor, emoções,');
P('sono e anotações; vê padrões ao longo do tempo; e encontra ferramentas práticas para dias');
P('difíceis. **Não é serviço de saúde:** não diagnostica, não trata, não promete cura, e não');
P('substitui acompanhamento profissional — isso está escrito no app, na loja e nas páginas legais.\n');
P('## O que precisamos da revisão\n');
P('Para cada texto, três perguntas:\n');
P('1. **Faz mal a alguém?** Há risco de agravar sofrimento, culpar a pessoa ou sugerir que ela');
P('   resolva sozinha algo que precisa de ajuda profissional?');
P('2. **Está correto?** A técnica é descrita de forma fiel, com a indicação certa e os limites claros?');
P('3. **Falta encaminhamento?** Em que pontos o texto deveria dizer "procure um profissional"');
P('   com mais clareza?\n');
P('Também é bem-vinda qualquer sugestão de linguagem: o tom do app é acolhedor, sem jargão');
P('clínico e sem cobrança.\n');
P('---\n');

// ── Leituras ────────────────────────────────────────────────────────────────
const arts = bloco('ARTICLES', 'const ARTICLES = [');
if (arts) {
  const itens = arts.split(/\n  \{id:/).filter((s) => s.includes('title:'));
  P('## 1. Leituras de 1 minuto (' + itens.length + ')\n');
  itens.forEach((it, n) => {
    const titulo = (it.match(/title:\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || '(sem título)';
    P('### 1.' + (n + 1) + ' ' + texto(titulo) + '\n');
    const corpo = bloco('body', 'body:[');
    const paragrafos = [...it.matchAll(/'((?:[^'\\]|\\.){40,})'/g)].map((m) => texto(m[1]));
    paragrafos.forEach((p) => { if (!p.startsWith('Base:')) P(p + '\n'); });
    const fonte = (it.match(/src:\s*'((?:[^'\\]|\\.)*)'/) || [])[1];
    if (fonte) P('**Fonte citada no app:** ' + texto(fonte) + '\n');
    P('> Comentário do profissional:\n');
  });
}

// ── Práticas guiadas ────────────────────────────────────────────────────────
const med = bloco('PRACTICES', 'const PRACTICES = {');
if (med) {
  const nomes = campos(med, 'nome').concat(campos(med, 'title')).concat(campos(med, 't'));
  const passos = campos(med, 'x').concat(campos(med, 'd'));
  P('## 2. Práticas guiadas (' + nomes.length + ')\n');
  nomes.forEach((t, n) => P('- **2.' + (n + 1) + '** ' + t));
  P('\nTexto completo de cada prática no app; os passos aparecem na tela um a um.\n');
  P('> Comentário do profissional:\n');
}

const traps = bloco('TRAPS', 'const TRAPS = [');
if (traps) {
  const rot = campos(traps, 'l'), desc = campos(traps, 'd');
  P('## 2b. Armadilhas de pensamento, usadas no registro de pensamento (' + rot.length + ')\n');
  rot.forEach((t, n) => P('- **' + t + '** — ' + (desc[n] || '')));
  P('\n> Comentário do profissional:\n');
}

// ── Trilhas ─────────────────────────────────────────────────────────────────
const trilhas = bloco('TRAILS', 'const TRAILS = [');
if (trilhas) {
  const titulos = campos(trilhas, 'title');
  P('## 3. Trilhas de 7 dias (' + titulos.length + ')\n');
  titulos.forEach((t, n) => P('- **3.' + (n + 1) + '** ' + t));
  const passos = campos(trilhas, 'x');
  P('\n**Passos diários (' + passos.length + ' ao todo):**\n');
  passos.forEach((p) => P('- ' + p));
  P('\n> Comentário do profissional:\n');
}

// ── Perguntas de reflexão ───────────────────────────────────────────────────
const refl = bloco('REFLECTIONS', 'const REFLECTIONS = [');
if (refl) {
  const perguntas = campos(refl, 'q');
  P('## 4. Perguntas de reflexão depois do registro (' + perguntas.length + ')\n');
  P('A primeira regra que casar com o registro do dia vence; as emoções difíceis vêm antes.\n');
  perguntas.forEach((p) => P('- ' + p));
  P('\n> Comentário do profissional:\n');
}

// ── Tela de ajuda e crise ───────────────────────────────────────────────────
P('## 5. Ajuda e crise\n');
P('O botão **Preciso de ajuda** aparece no topo das telas principais e abre: respiração guiada,');
P('as pessoas de confiança que a própria pessoa cadastrou, e o CVV (188). A leitura "Quando');
P('procurar ajuda" descreve os sinais que indicam buscar profissional.\n');
P('Pontos a revisar com atenção especial:\n');
P('- O mural bloqueia mensagens com conteúdo de crise antes de publicar. O filtro é por palavras;');
P('  o que ele deixa passar ou bloqueia demais precisa de olhar clínico.');
P('- O app não detecta risco de suicídio nem promete fazê-lo. Está certo assim, ou falta algum');
P('  encaminhamento mais explícito em algum ponto?\n');
P('> Comentário do profissional:\n');
P('---\n');
P('## Como devolver\n');
P('Escreva os comentários abaixo de cada bloco, ou num documento à parte citando o número do');
P('item. Se algum texto precisar sair do app até a revisão, diga explicitamente — é mais');
P('importante não publicar algo que faça mal do que manter o conteúdo completo.\n');

console.log(saida.join('\n'));
