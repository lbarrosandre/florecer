// Exclusão de conta do Florescer — apaga os dados, apaga a conta e avisa por e-mail.
//
// Por que isso roda no servidor e não no app: o celular pode ser desligado no meio da
// exclusão e deixar dados órfãos; o app não consegue apagar a reação da pessoa em mensagens
// de outras pessoas (a regra proíbe, de propósito, para o contador não ser fraudado); e
// e-mail não se envia do aparelho de forma confiável.
//
// Variáveis de ambiente (painel do Netlify, nunca no repositório):
//   FIREBASE_SERVICE_ACCOUNT  — JSON da conta de serviço do Firebase (uma linha)
//   EMAIL_REMETENTE           — ex.: Florescer <seuendereco@gmail.com>
//   EMAIL_COPIA               — opcional: recebe uma cópia do aviso
//
// E um dos dois caminhos de envio (o Gmail tem prioridade se estiver configurado):
//   SMTP_USER + SMTP_PASS     — seu Gmail e uma "senha de app" de 16 letras. Entrega para
//                               qualquer pessoa, sem domínio próprio, até 500 por dia.
//   RESEND_API_KEY            — chave do Resend. Sem domínio verificado, o Resend só entrega
//                               para o e-mail dono da conta — serve para testar, não para uso real.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Conta de envio do André, usada pelos apps dele. "naoresponda" porque a caixa não é
// monitorada: quem acabou de excluir a conta não tem para onde responder dentro do app.
// O canal que recebe resposta é o das páginas legais, que é outro endereço.
const EMAIL_REMETENTE_PADRAO = 'Florescer <naoresponda.noreplymail@gmail.com>';

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

// Tolerância a falha, pelo mesmo motivo do Bússola Finance: se uma coleção falhar, seguimos
// para as próximas e devolvemos a lista do que ficou. Parar na primeira falha deixaria MAIS
// dado da pessoa para trás — exatamente o contrário do que ela pediu.
async function apagarDados(db, uid) {
  const contagem = {};
  const falharam = [];

  for (const col of PORTADOC) {
    try {
      const ref = db.collection(col).doc(uid);
      if ((await ref.get()).exists) { await ref.delete(); contagem[col] = 1; }
    } catch (e) { falharam.push(col); console.error('excluir-conta: falhou em ' + col, e); }
  }

  for (const col of PORCAMPO) {
    try {
      const achados = await db.collection(col).where('uid', '==', uid).get();
      contagem[col] = achados.size;
      for (const d of achados.docs) await d.ref.delete();
    } catch (e) { falharam.push(col); console.error('excluir-conta: falhou em ' + col, e); }
  }

  // Mural: as mensagens da pessoa saem junto (decisão de produto) e as reações dela em
  // mensagens de outras pessoas também — elas guardam o uid no id do documento.
  try {
    const posts = await db.collection('wall').where('uid', '==', uid).get();
    contagem.wall = posts.size;
    for (const p of posts.docs) {
      const reacoes = await p.ref.collection('reactions').get();
      for (const r of reacoes.docs) await r.ref.delete();
      await p.ref.delete();
    }
  } catch (e) { falharam.push('wall'); console.error('excluir-conta: falhou no mural', e); }

  try {
    // O id do documento de reação é o uid, então varremos o grupo e ficamos com os dela.
    // Enquanto o mural é pequeno isso é barato; quando crescer, vale guardar um campo uid
    // na reação e criar índice de grupo para consultar direto.
    const todas = await db.collectionGroup('reactions').get();
    let soltas = 0;
    for (const r of todas.docs) {
      if (r.id !== uid) continue;
      await r.ref.delete();
      soltas++;
    }
    contagem.reacoes = soltas;
  } catch (e) { falharam.push('reactions'); console.error('excluir-conta: falhou nas reações', e); }

  return { contagem, falharam };
}

async function avisar(email, nome, contagem) {
  const porGmail = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!porGmail && !process.env.RESEND_API_KEY) return 'sem-envio';
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  const texto = `Olá, ${nome || 'tudo bem'}?

Sua conta do Florescer foi excluída e seus dados foram apagados dos nossos servidores.

Foram removidos ${total} registros: diário, gratidão, registros de pensamento, hábitos,
cadastro e mensagens do mural. Não guardamos cópia.

Se você não pediu isso, responda este e-mail — vamos apurar imediatamente.

Cuide-se. Você sempre pode recomeçar quando quiser.
Equipe Florescer`;
  const corpoHtml = texto.split('\n\n').map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`).join('');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#22322c">${corpoHtml}</div>`;
  const assunto = 'Sua conta do Florescer foi excluída';
  const de = process.env.EMAIL_REMETENTE || EMAIL_REMETENTE_PADRAO;

  if (porGmail) {
    // SMTP_HOST vazio = Gmail (senha de app). Preenchido = qualquer outro serviço de envio
    // (Brevo, Mailjet, SMTP2GO), que é a saída quando o Gmail não libera a senha de app.
    const transporte = nodemailer.createTransport(process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        }
      : {
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    await transporte.sendMail({
      from: de, to: email, bcc: process.env.EMAIL_COPIA || undefined,
      subject: assunto, text: texto, html,
    });
    return 'enviado';
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const envio = await resend.emails.send({
    from: de,
    to: [email],
    bcc: process.env.EMAIL_COPIA ? [process.env.EMAIL_COPIA] : undefined,
    subject: assunto,
    text: texto,
    html,
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

    const { contagem, falharam } = await apagarDados(db, conta.uid);
    await auth.revokeRefreshTokens(conta.uid);
    await auth.deleteUser(conta.uid);

    // O e-mail é cortesia: exclusão de conta é obrigação legal e não pode depender de
    // provedor de e-mail estar de pé. Se falhar, a exclusão continua valendo.
    let aviso = 'sem-email';
    if (email) { try { aviso = await avisar(email, nome, contagem); } catch (e) { aviso = 'falhou: ' + e.message; console.error('excluir-conta: e-mail', e); } }

    return responder(200, { ok: true, apagados: contagem, naoApagados: falharam, email: aviso });
  } catch (e) {
    // Mensagem humana para o app; o detalhe fica no log do Netlify.
    console.error('excluir-conta:', e);
    return responder(500, { erro: 'não foi possível concluir agora' });
  }
};

export const config = { path: '/api/excluir-conta' };
