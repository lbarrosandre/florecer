// Teste de invasão das regras do Firestore — roda contra o emulador, sem tocar em produção.
//
// Cada caso é uma tentativa real de ataque feita por uma pessoa com conta legítima e um
// editor de requisições. Segurança que não foi testada com a segunda conta é suposição.
//
// Rodar:  npm run teste:regras
import fs from 'node:fs';
import path from 'node:path';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const env = await initializeTestEnvironment({
  projectId: 'florescer-teste-regras',
  firestore: { rules: fs.readFileSync(path.join(raiz, 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 },
});

const ana = env.authenticatedContext('ana').firestore();
const bruno = env.authenticatedContext('bruno').firestore();
const carla = env.authenticatedContext('carla').firestore();
const dani = env.authenticatedContext('dani').firestore();
const chefe = env.authenticatedContext('chefe').firestore();
const visitante = env.unauthenticatedContext().firestore();

// ── dados de partida, gravados com as regras desligadas ──────────────────────
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'admins/chefe'), { criadoEm: 'console' });
  await setDoc(doc(db, 'users/ana'), { name: 'Ana', email: 'ana@exemplo.com', isPremium: false });
  await setDoc(doc(db, 'logs/log-ana'), { uid: 'ana', date: '2026-09-18', mood: 2, anxiety: 4, note: 'dia pesado, briga em casa' });
  await setDoc(doc(db, 'thoughts/pensamento-ana'), { uid: 'ana', date: '2026-09-18', thought: 'não sou capaz' });
  await setDoc(doc(db, 'gratitude/grat-ana'), { uid: 'ana', date: '2026-09-18', text: 'meu filho' });
  await setDoc(doc(db, 'members/ana'), { uid: 'ana', name: 'Ana', email: 'ana@exemplo.com', careDays: 12, logs: 40, platform: 'android' });
  await setDoc(doc(db, 'stats/2026-09-18'), { mood_2: 3, tool_respira: 5 });
  await setDoc(doc(db, 'evolution/aparelho-xyz'), { weeks: 4, logs: 20, mood0: 2, mood1: 4 });
  await setDoc(doc(db, 'wall/pendente-ana'), { text: 'texto ainda não aprovado', source: 'recado', lang: 'pt', status: 'pending', uid: 'ana', helped: 0, reports: 0 });
  await setDoc(doc(db, 'wall/aprovado1'), { text: 'um passo de cada vez', source: 'recado', lang: 'pt', status: 'approved', uid: 'ana', helped: 0, reports: 0 });
  await setDoc(doc(db, 'wall/aprovado2'), { text: 'caminhar mudou meu dia', source: 'movimento', lang: 'pt', status: 'approved', uid: 'ana', helped: 0, reports: 0 });
});

// ── mecânica do teste ────────────────────────────────────────────────────────
const resultados = [];
const limpa = (e) => String((e && e.message) || e).replace(/\s+/g, ' ').slice(0, 160);

// assertFails/assertSucceeds vêm da própria biblioteca: elas sabem reconhecer a recusa do
// servidor em todas as formas que o emulador usa ("false for 'get' @ L81",
// "No matching allow statements", PERMISSION_DENIED) — checar a mensagem na mão dá falso alarme.
async function bloqueado(grupo, nome, fn) {
  try { await assertFails(fn()); resultados.push({ grupo, nome, esperado: 'bloqueado', ok: true, obs: '' }); }
  catch (e) { resultados.push({ grupo, nome, esperado: 'bloqueado', ok: false, obs: 'O SERVIDOR PERMITIU — ' + limpa(e) }); }
}
async function permitido(grupo, nome, fn) {
  try { await assertSucceeds(fn()); resultados.push({ grupo, nome, esperado: 'permitido', ok: true, obs: '' }); }
  catch (e) { resultados.push({ grupo, nome, esperado: 'permitido', ok: false, obs: 'o servidor recusou: ' + limpa(e) }); }
}
const reagir = (db, post, tipo, campos) => {
  const b = writeBatch(db);
  b.set(doc(db, `wall/${post}/reactions/bruno`), { kind: tipo, at: 1 });
  b.update(doc(db, `wall/${post}`), campos);
  return b.commit();
};

// ── A. Conteúdo pessoal de outra pessoa ──────────────────────────────────────
const A = 'A. diário de outra pessoa';
await bloqueado(A, 'Bruno lê o registro de humor da Ana', () => getDoc(doc(bruno, 'logs/log-ana')));
await bloqueado(A, 'Bruno lista todos os registros de humor do app', () => getDocs(collection(bruno, 'logs')));
await bloqueado(A, 'Bruno consulta logs filtrando pelo uid da Ana', () => getDocs(query(collection(bruno, 'logs'), where('uid', '==', 'ana'))));
await bloqueado(A, 'Bruno lê o registro de pensamento (TCC) da Ana', () => getDoc(doc(bruno, 'thoughts/pensamento-ana')));
await bloqueado(A, 'Bruno lê a gratidão da Ana', () => getDoc(doc(bruno, 'gratitude/grat-ana')));
await bloqueado(A, 'Bruno lê o perfil da Ana', () => getDoc(doc(bruno, 'users/ana')));
await bloqueado(A, 'Bruno altera o registro da Ana', () => updateDoc(doc(bruno, 'logs/log-ana'), { note: 'alterado' }));
await bloqueado(A, 'Bruno apaga o registro da Ana', () => deleteDoc(doc(bruno, 'logs/log-ana')));
await bloqueado(A, 'Bruno lê os hábitos da Ana', () => getDoc(doc(bruno, 'habits/ana')));
await permitido(A, 'Ana lê o próprio registro', () => getDoc(doc(ana, 'logs/log-ana')));
await permitido(A, 'Ana consulta os próprios registros com filtro', () => getDocs(query(collection(ana, 'logs'), where('uid', '==', 'ana'))));

// ── B. Virar Premium / administrador sozinho ─────────────────────────────────
const B = 'B. elevar o próprio privilégio';
await bloqueado(B, 'Ana marca isPremium = true no próprio perfil', () => updateDoc(doc(ana, 'users/ana'), { isPremium: true }));
await bloqueado(B, 'Carla cria o perfil dela já como Premium', () => setDoc(doc(carla, 'users/carla'), { name: 'Carla', isPremium: true }));
await bloqueado(B, 'Ana se cadastra como administradora', () => setDoc(doc(ana, 'admins/ana'), { eu: 'sim' }));
await permitido(B, 'Ana muda o próprio nome (uso legítimo)', () => updateDoc(doc(ana, 'users/ana'), { name: 'Ana Maria' }));
await permitido(B, 'Carla cria o perfil dela sem Premium', () => setDoc(doc(carla, 'users/carla'), { name: 'Carla', isPremium: false }));

// ── C. Mural: publicar e reagir ──────────────────────────────────────────────
const C = 'C. mural';
await bloqueado(C, 'Ana publica já aprovado, pulando a moderação', () => setDoc(doc(ana, 'wall/burla1'), { text: 'texto direto no ar', source: 'recado', lang: 'pt', status: 'approved', uid: 'ana', helped: 0, reports: 0 }));
await bloqueado(C, 'Ana publica em nome do Bruno', () => setDoc(doc(ana, 'wall/burla2'), { text: 'nao fui eu', source: 'recado', lang: 'pt', status: 'pending', uid: 'bruno', helped: 0, reports: 0 }));
await bloqueado(C, 'Ana publica já com 50 curtidas', () => setDoc(doc(ana, 'wall/burla3'), { text: 'comecando com 50', source: 'recado', lang: 'pt', status: 'pending', uid: 'ana', helped: 50, reports: 0 }));
await bloqueado(C, 'Ana publica com campo extra fora do previsto', () => setDoc(doc(ana, 'wall/burla4'), { text: 'com campo extra', source: 'recado', lang: 'pt', status: 'pending', uid: 'ana', helped: 0, reports: 0, promovido: true }));
await bloqueado(C, 'Visitante sem conta lê o mural', () => getDoc(doc(visitante, 'wall/aprovado1')));
await bloqueado(C, 'Bruno lê o texto pendente da Ana antes da moderação', () => getDoc(doc(bruno, 'wall/pendente-ana')));
await bloqueado(C, 'Bruno aprova o próprio texto mudando o status', () => updateDoc(doc(bruno, 'wall/pendente-ana'), { status: 'approved' }));
await bloqueado(C, 'Bruno apaga o texto da Ana', () => deleteDoc(doc(bruno, 'wall/aprovado2')));
await permitido(C, 'Ana publica normalmente (entra como pendente)', () => setDoc(doc(ana, 'wall/novo-ok'), { text: 'hoje foi difícil e tudo bem', source: 'recado', lang: 'pt', status: 'pending', uid: 'ana', helped: 0, reports: 0 }));
await permitido(C, 'Bruno lê o texto já aprovado', () => getDoc(doc(bruno, 'wall/aprovado1')));

const D = 'D. inflar contador de reação';
await bloqueado(D, 'Dani soma 1 no contador sem registrar a reação dela', () => updateDoc(doc(dani, 'wall/aprovado1'), { helped: 1 }));
await bloqueado(D, 'Carla soma 5 de uma vez junto com a reação', () => {
  const b = writeBatch(carla);
  b.set(doc(carla, 'wall/aprovado1/reactions/carla'), { kind: 'helped', at: 1 });
  b.update(doc(carla, 'wall/aprovado1'), { helped: 5 });
  return b.commit();
});
await permitido(D, 'Bruno reage "Gostei" (primeira vez)', () => reagir(bruno, 'aprovado1', 'helped', { helped: 1 }));
await bloqueado(D, 'Bruno reage "Gostei" de novo na mesma mensagem', () => reagir(bruno, 'aprovado1', 'helped', { helped: 2 }));
await bloqueado(D, 'Bruno apaga a reação dele para poder reagir outra vez', () => deleteDoc(doc(bruno, 'wall/aprovado1/reactions/bruno')));
await permitido(D, 'Bruno troca "Gostei" por "Brotou em mim" (troca única)', () => {
  const b = writeBatch(bruno);
  b.update(doc(bruno, 'wall/aprovado1/reactions/bruno'), { kind: 'sprouted', at: 2 });
  b.update(doc(bruno, 'wall/aprovado1'), { helped: 0, sprouted: 1 });
  return b.commit();
});
await bloqueado(D, 'Bruno volta de "Brotou" para "Gostei" e soma outra vez', () => {
  const b = writeBatch(bruno);
  b.update(doc(bruno, 'wall/aprovado1/reactions/bruno'), { kind: 'helped', at: 3 });
  b.update(doc(bruno, 'wall/aprovado1'), { helped: 1, sprouted: 0 });
  return b.commit();
});
await bloqueado(D, 'Dani registra reação em nome do Bruno', () => setDoc(doc(dani, 'wall/aprovado2/reactions/bruno'), { kind: 'helped', at: 1 }));

// ── E. Painel do administrador e dados agregados ─────────────────────────────
const E = 'E. painel e dados agregados';
await bloqueado(E, 'Bruno lê o cadastro da Ana (members)', () => getDoc(doc(bruno, 'members/ana')));
await bloqueado(E, 'Bruno lê os números do painel (stats)', () => getDoc(doc(bruno, 'stats/2026-09-18')));
await bloqueado(E, 'Bruno lê o retrato de evolução (evolution)', () => getDoc(doc(bruno, 'evolution/aparelho-xyz')));
await bloqueado(E, 'Ana grava humor dentro do cadastro visível ao admin', () => setDoc(doc(ana, 'members/ana'), { uid: 'ana', name: 'Ana', email: 'a@e.com', mood: 2 }));
await permitido(E, 'Administrador lê o cadastro (sem conteúdo pessoal)', () => getDoc(doc(chefe, 'members/ana')));
await bloqueado(E, 'Administrador lê o diário da Ana', () => getDoc(doc(chefe, 'logs/log-ana')));
await bloqueado(E, 'Administrador lê o pensamento da Ana', () => getDoc(doc(chefe, 'thoughts/pensamento-ana')));

// ── F. Superfície fora do previsto ───────────────────────────────────────────
const F = 'F. caminho não previsto';
await bloqueado(F, 'Ana cria uma coleção que não existe nas regras', () => setDoc(doc(ana, 'segredos/chave'), { x: 1 }));
await bloqueado(F, 'Ana lê uma coleção que não existe nas regras', () => getDoc(doc(ana, 'segredos/chave')));
await bloqueado(F, 'Visitante sem conta grava em qualquer lugar', () => setDoc(doc(visitante, 'logs/livre'), { uid: 'x' }));

// ── relatório ────────────────────────────────────────────────────────────────
await env.cleanup();

let grupoAtual = '';
let falhas = 0;
console.log('\n===== TESTE DE INVASÃO DAS REGRAS DO FIRESTORE =====\n');
for (const r of resultados) {
  if (r.grupo !== grupoAtual) { grupoAtual = r.grupo; console.log('\n' + grupoAtual.toUpperCase()); }
  if (!r.ok) falhas++;
  const marca = r.ok ? (r.esperado === 'bloqueado' ? '  [OK] recusado ' : '  [OK] permitido') : '  [!!] FALHA    ';
  console.log(`${marca} ${r.nome}${r.obs ? ' — ' + r.obs : ''}`);
}
const bloqueados = resultados.filter((r) => r.esperado === 'bloqueado').length;
console.log(`\n${resultados.length} casos: ${bloqueados} tentativas de ataque, ${resultados.length - bloqueados} usos legítimos.`);
console.log(falhas ? `${falhas} FALHA(S) — corrigir antes de publicar.` : 'Nenhuma falha: todo ataque foi recusado pelo servidor e todo uso legítimo funcionou.');
process.exit(falhas ? 1 : 0);
