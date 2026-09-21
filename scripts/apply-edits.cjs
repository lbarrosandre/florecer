// Aplica arquivos de edição num arquivo grande (ex.: index.html de página única).
// Só grava se TODOS os trechos baterem — edição parcial num arquivo de milhares de linhas é
// pior do que edição nenhuma. Também evita o problema de aspas e barras invertidas que o
// terminal corrompe em comandos longos.
//
// Uso: node apply-edits.cjs <arquivo-alvo> <edicoes1.txt> [edicoes2.txt ...]
//
// Operações dentro do arquivo de edições (linhas fora de blocos são comentários):
//   @@FIND ... @@WITH ... @@END        troca um trecho que aparece exatamente 1 vez
//   @@ALL  ... @@WITH ... @@END        troca todas as ocorrências (precisa de pelo menos 1)
//   @@FN nomeDaFuncao ... @@END        substitui a função inteira (declaração no topo)
//   @@BEFORE marca ... @@WITH ... @@END  insere antes da marca
//   @@AFTER  marca ... @@WITH ... @@END  insere depois da marca
//   @@SLICE inicio @@TO fim @@WITH ... @@END  troca tudo entre duas marcas
const fs = require('fs');
const [, , F, ...edits] = process.argv;
if (!F || !edits.length) {
  console.log('uso: node apply-edits.cjs <arquivo-alvo> <edicoes.txt> [...]');
  process.exit(1);
}
let s = fs.readFileSync(F, 'utf8');
const count = (a) => s.split(a).length - 1;

function fnRange(name) {
  let i = s.indexOf('\nfunction ' + name + '(');
  if (i < 0) i = s.indexOf('\nasync function ' + name + '(');
  if (i < 0) throw new Error('função não encontrada: ' + name);
  if (s.indexOf('\nfunction ' + name + '(', i + 1) >= 0) throw new Error('função duplicada: ' + name);
  const start = i + 1;
  const end = s.indexOf('\n}\n', start);
  if (end < 0) throw new Error('não achei o fim da função: ' + name);
  return [start, end + 2];
}

for (const file of edits) {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  let k = 0, n = 0;
  const readUntil = (stop) => {
    const out = [];
    while (k < lines.length && lines[k] !== stop) out.push(lines[k++]);
    if (k >= lines.length) throw new Error('bloco sem ' + stop + ' em ' + file);
    k++;
    return out.join('\n');
  };
  while (k < lines.length) {
    const L = lines[k];
    if (!L.startsWith('@@')) { k++; continue; }
    const sp = L.indexOf(' ');
    const op = sp < 0 ? L : L.slice(0, sp);
    const arg = sp < 0 ? '' : L.slice(sp + 1);
    k++;
    if (op === '@@FIND' || op === '@@ALL') {
      const find = readUntil('@@WITH');
      const repl = readUntil('@@END');
      const c = count(find);
      if (op === '@@FIND' && c !== 1) throw new Error(`FIND achou ${c}x em ${file}: ` + find.slice(0, 120));
      if (op === '@@ALL' && c < 1) throw new Error(`ALL achou 0x em ${file}: ` + find.slice(0, 120));
      s = s.split(find).join(repl);
    } else if (op === '@@FN') {
      const repl = readUntil('@@END');
      const [a, b] = fnRange(arg);
      s = s.slice(0, a) + repl + s.slice(b);
    } else if (op === '@@SLICE') {
      const from = readUntil('@@TO');
      const to = readUntil('@@WITH');
      const repl = readUntil('@@END');
      if (count(from) !== 1 || count(to) !== 1) throw new Error('marcas do SLICE não são únicas: ' + from.slice(0, 60) + ' / ' + to.slice(0, 60));
      const a = s.indexOf(from), b = s.indexOf(to);
      if (b < a) throw new Error('marcas do SLICE fora de ordem');
      s = s.slice(0, a) + repl + '\n\n' + s.slice(b);
    } else if (op === '@@BEFORE' || op === '@@AFTER') {
      const mark = readUntil('@@WITH');
      const repl = readUntil('@@END');
      if (count(mark) !== 1) throw new Error(op + ' achou a marca ' + count(mark) + 'x: ' + mark.slice(0, 60));
      // Erro fácil de cometer e caro de achar: repetir a marca dentro do bloco novo. O script
      // mantém a marca original, então o resultado é declaração duplicada — const repetida,
      // função aberta duas vezes — e o arquivo só quebra na checagem seguinte, longe daqui.
      const linhas = mark.trim().split('\n').length;
      const fim = repl.trimEnd().split('\n').slice(-linhas).join('\n').trim();
      const ini = repl.trimStart().split('\n').slice(0, linhas).join('\n').trim();
      if ((op === '@@BEFORE' && fim === mark.trim()) || (op === '@@AFTER' && ini === mark.trim())) {
        throw new Error(op + ' repete a marca dentro do bloco — ela já é mantida, tire a cópia:\n  ' + mark.trim().slice(0, 80));
      }
      const i = s.indexOf(mark);
      s = op === '@@BEFORE'
        ? s.slice(0, i) + repl + '\n' + s.slice(i)
        : s.slice(0, i + mark.length) + '\n' + repl + s.slice(i + mark.length);
    } else {
      throw new Error('operação desconhecida: ' + L);
    }
    n++;
  }
  console.log(file.split(/[\\/]/).pop() + ':', n, 'edições');
}
fs.writeFileSync(F, s);
console.log('ok');
