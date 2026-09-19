// Exclusão de conta do Florescer — apaga os dados, apaga a conta e avisa por e-mail.
//
// Por que isso roda no servidor e não no app: o celular pode ser desligado no meio da
// exclusão e deixar dados órfãos; o app não consegue apagar a reação da pessoa em mensagens
// de outras pessoas (a regra proíbe, de propósito, para o contador não ser fraudado); e
// e-mail não se envia do aparelho de forma confiável.
//
// Variáveis de ambiente (painel do Netlify, nunca no repositório):
//   FIREBASE_SERVICE_ACCOUNT  — JSON da conta de serviço do Firebase (uma linha)
//   RESEND_API_KEY            — chave da conta do Resend
//   EMAIL_REMETENTE           — ex.: Florescer <contato@seudominio.com.br>
//   EMAIL_COPIA               — opcional: recebe uma cópia do aviso
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};
const responder = (status, corpo) => new Response(JSON.stringify(corpo), { status, headers: CORS });

function admin() {
  if (!getApps().length) {
    const chave = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (!chave.project_id) throw new Error('FIREBASE_SERVICE_ACCOUNT ausente ou inválida');
    initializeApp({ credential: cert(chave) });
  }
  return { auth: getAuth(), db: getFirestore() };
}

// Documentos avulsos com id = uid.
const PORTADOC = ['users', 'habits', 'habitDone', 'members'];
// Coleções com id automático e campo uid.
const PORCAMPO = ['logs', 'gratitude', 'thoughts'];

async function apagarDados(db, uid) {
  const contagem = {};
  const lote = db.batch();
  let pendentes = 0;
  const gravar = async () => { if (pendentes) { await lote.commit(); pendentes = 0; } };

  for (const col of PORTADOC) {
    const ref = db.collection(col).doc(uid);
    if ((await ref.get()).exists) { await ref.delete(); contagem[col] = 1; }
  }

  for (const col of PORCAMPO) {
    const achados = await db.collection(col).where('uid', '==', uid).get();
    contagem[col] = achados.size;
    for (const d of achados.docs) await d.ref.delete();
  }

  // Mural: as mensagens da pessoa saem junto (foi a decisão de produto), e as reações dela
  // em mensagens de outras pessoas também — elas guardam o uid.
  const posts = await db.collection('wall').where('uid', '==', uid).get();
  contagem.wall = posts.size;
  for (const p of posts.docs) {
    const reacoes = await p.ref.collection('reactions').get();
    for (const r of reacoes.docs) await r.ref.delete();
    await p.ref.delete();
  }
  const minhasReacoes = await db.collectionGroup('reactions').get();
  let soltas = 0;
  for (const r of minhasReacoes.docs) {
    if (r.id !== uid) continue;
    await r.ref.delete();
    soltas++;
  }
  contagem.reacoes = soltas;

  await gravar();
  return contagem;
}

async function avisar(email, nome, contagem) {
  if (!process.env.RESEND_API_KEY) return 'sem-envio';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  const texto = `Olá, ${nome || 'tudo bem'}?

Sua conta do Florescer foi excluída e seus dados foram apagados dos nossos servidores.

Foram removidos ${total} registros: diário, gratidão, registros de pensamento, hábitos,
cadastro e mensagens do mural. Não guardamos cópia.

Se você não pediu isso, responda este e-mail — vamos apurar imediatamente.

Cuide-se. Você sempre pode recomeçar quando quiser.
Equipe Florescer`;
  const html = texto.split('\n\n').map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`).join('');
  const envio = await resend.emails.send({
    from: process.env.EMAIL_REMETENTE || 'Florescer <onboarding@resend.dev>',
    to: [email],
    bcc: process.env.EMAIL_COPIA ? [process.env.EMAIL_COPIA] : undefined,
    subject: 'Sua conta do Florescer foi excluída',
    text: texto,
    html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#22322c">${html}</div>`,
  });
  return envio && envio.error ? 'falhou: ' + envio.error.message : 'enviado';
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return responder(405, { erro: 'método não permitido' });

  try {
    const { auth, db } = admin();

    // Só a própria pessoa exclui a própria conta: o token vem do app e é conferido aqui.
    const cabecalho = req.headers.get('authorization') || '';
    const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
    if (!token) return responder(401, { erro: 'sem credencial' });

    let conta;
    try { conta = await auth.verifyIdToken(token, true); }
    catch (e) { return responder(401, { erro: 'credencial inválida ou expirada' }); }

    // Token recente: exclusão é irreversível, então exige login das últimas 10 minutos.
    const idade = Math.floor(Date.now() / 1000) - (conta.auth_time || 0);
    if (idade > 600) return responder(403, { erro: 'reautenticar', detalhe: 'entre de novo antes de excluir' });

    const registro = await auth.getUser(conta.uid).catch(() => null);
    const email = (registro && registro.email) || conta.email || '';
    const nome = (registro && registro.displayName) || '';

    const contagem = await apagarDados(db, conta.uid);
    await auth.revokeRefreshTokens(conta.uid);
    await auth.deleteUser(conta.uid);

    let aviso = 'sem-email';
    if (email) { try { aviso = await avisar(email, nome, contagem); } catch (e) { aviso = 'falhou: ' + e.message; } }

    return responder(200, { ok: true, apagados: contagem, email: aviso });
  } catch (e) {
    // Mensagem humana para o app; o detalhe fica no log do Netlify.
    console.error('excluir-conta:', e);
    return responder(500, { erro: 'não foi possível concluir agora' });
  }
};

export const config = { path: '/api/excluir-conta' };
