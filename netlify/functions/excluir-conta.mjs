// Exclusão de conta do Florescer — apaga os dados, apaga a conta e avisa por e-mail.
//
// Por que roda no servidor e não no app: o celular pode ser desligado no meio da exclusão e
// deixar dados órfãos; o app não consegue apagar a reação da pessoa em mensagens de outras
// pessoas (a regra proíbe, de propósito, para o contador não ser fraudado); e e-mail não se
// envia do aparelho de forma confiável.
//
// Por que sem o SDK firebase-admin: ele arrasta dependências que não sobrevivem ao empacotador
// da Netlify (jwks-rsa chama `jose`, que é ESM, e o pacote gerado é CommonJS → erro 502 em
// produção). Aqui é tudo REST com o `fetch` nativo, o mesmo caminho que já funciona nas funções
// do Bússola Finance.
//
// Variáveis de ambiente (painel do Netlify, nunca no repositório):
//   FIREBASE_SERVICE_ACCOUNT  — JSON da conta de serviço do Firebase
//   EMAIL_REMETENTE           — opcional, sobrepõe o remetente padrão
//   EMAIL_COPIA               — opcional, cópia oculta
// E um caminho de envio (opcionais; sem nenhum, a exclusão acontece e o e-mail é pulado):
//   SMTP_USER + SMTP_PASS [+ SMTP_HOST + SMTP_PORT]  — Gmail com senha de app, ou Brevo/Mailjet
//   RESEND_API_KEY                                   — quando houver domínio próprio verificado
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

// A chave web do Firebase é pública por projeto (ela já está dentro do app): identifica, não
// autoriza. Serve aqui só para conferir o token de quem está pedindo a exclusão.
const CHAVE_WEB = 'AIzaSyCXWZOVseHAj8Lz28CrTMmhW2UzO4qArfc';
const EMAIL_REMETENTE_PADRAO = 'Florescer <naoresponda.noreplymail@gmail.com>';

// Documentos avulsos cujo id é o uid.
const PORTADOC = ['users', 'habits', 'habitDone', 'members'];
// Coleções com id automático e campo uid.
const PORCAMPO = ['logs', 'gratitude', 'thoughts'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};
const responder = (status, corpo) => new Response(JSON.stringify(corpo), { status, headers: CORS });

function contaDeServico() {
  const bruto = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  const chave = JSON.parse(bruto);
  if (!chave.project_id || !chave.private_key) throw new Error('FIREBASE_SERVICE_ACCOUNT inválida');
  return chave;
}

const b64url = (txt) => Buffer.from(txt).toString('base64url');

// Troca a conta de serviço por um token de acesso, assinando um JWT — é o que o SDK faz por baixo.
async function tokenDeAcesso(chave) {
  const agora = Math.floor(Date.now() / 1000);
  const cabecalho = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corpo = b64url(JSON.stringify({
    iss: chave.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit',
    aud: 'https://oauth2.googleapis.com/token',
    iat: agora,
    exp: agora + 3600,
  }));
  const assinatura = crypto.createSign('RSA-SHA256')
    .update(cabecalho + '.' + corpo)
    .sign(chave.private_key.replace(/\\n/g, '\n'), 'base64url');

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: cabecalho + '.' + corpo + '.' + assinatura,
    }),
  });
  const dados = await r.json();
  if (!dados.access_token) throw new Error('não consegui o token de acesso: ' + JSON.stringify(dados).slice(0, 200));
  return dados.access_token;
}

// Confere o token que veio do app. O endpoint recusa token inválido, expirado ou de outro
// projeto — é a validação de verdade; o payload só é lido depois que ele aprova.
async function conferirToken(idToken) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CHAVE_WEB, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const dados = await r.json();
  const pessoa = dados && dados.users && dados.users[0];
  if (!pessoa) return null;
  let authTime = 0;
  try { authTime = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString()).auth_time || 0; }
  catch (e) { authTime = 0; }
  return { uid: pessoa.localId, email: pessoa.email || '', nome: pessoa.displayName || '', authTime };
}

function fire(projeto, caminho) {
  return 'https://firestore.googleapis.com/v1/projects/' + projeto + '/databases/(default)/documents' + caminho;
}

// A precondição "existe" é o que torna a contagem verdadeira: sem ela o Firestore aceita apagar
// documento inexistente e responde 200, inflando o número que vai no e-mail para a pessoa.
async function apagarDoc(projeto, token, caminho) {
  const r = await fetch(fire(projeto, caminho) + '?currentDocument.exists=true', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  return r.ok;
}

async function buscarPorUid(projeto, token, colecao, uid) {
  const r = await fetch(fire(projeto, ':runQuery'), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: colecao }],
        where: { fieldFilter: { field: { fieldPath: 'uid' }, op: 'EQUAL', value: { stringValue: uid } } },
        limit: 2000,
      },
    }),
  });
  const linhas = await r.json();
  if (!Array.isArray(linhas)) return [];
  return linhas.filter((l) => l.document).map((l) => l.document.name.split('/documents')[1]);
}

async function listarCaminhos(projeto, token, colecao) {
  const r = await fetch(fire(projeto, ':runQuery'), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: colecao }], limit: 3000 } }),
  });
  const linhas = await r.json();
  if (!Array.isArray(linhas)) return [];
  return linhas.filter((l) => l.document).map((l) => l.document.name.split('/documents')[1]);
}

async function listarSub(projeto, token, caminho) {
  const r = await fetch(fire(projeto, caminho) + '?pageSize=300', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!r.ok) return [];
  const dados = await r.json();
  return (dados.documents || []).map((d) => d.name.split('/documents')[1]);
}

// Tolerância a falha, como no Bússola: se uma coleção falhar, seguimos para as próximas e
// devolvemos o que ficou. Parar na primeira falha deixaria MAIS dado da pessoa para trás.
async function apagarDados(projeto, token, uid) {
  const contagem = {};
  const falharam = [];

  for (const col of PORTADOC) {
    try { if (await apagarDoc(projeto, token, '/' + col + '/' + uid)) contagem[col] = 1; }
    catch (e) { falharam.push(col); }
  }

  for (const col of PORCAMPO) {
    try {
      const caminhos = await buscarPorUid(projeto, token, col, uid);
      let apagados = 0;
      for (const c of caminhos) { if (await apagarDoc(projeto, token, c)) apagados++; }
      if (apagados) contagem[col] = apagados;
    } catch (e) { falharam.push(col); }
  }

  // Mural: as mensagens da pessoa saem junto (decisão de produto), com as reações que estiverem
  // dentro delas.
  try {
    const posts = await buscarPorUid(projeto, token, 'wall', uid);
    for (const p of posts) {
      // Subcoleção não some junto com o documento pai no Firestore: tem de ser apagada antes.
      for (const r of await listarSub(projeto, token, p + '/reactions')) await apagarDoc(projeto, token, r);
      await apagarDoc(projeto, token, p);
    }
    if (posts.length) contagem.wall = posts.length;
  } catch (e) { falharam.push('wall'); }

  // E as reações dela em mensagens de outras pessoas: o id do documento é o uid, então basta
  // tentar apagar em cada mensagem do mural (apagar o que não existe não dá erro).
  try {
    const todos = await listarCaminhos(projeto, token, 'wall');
    let soltas = 0;
    for (const p of todos) { if (await apagarDoc(projeto, token, p + '/reactions/' + uid)) soltas++; }
    if (soltas) contagem.reacoes = soltas;
  } catch (e) { falharam.push('reactions'); }

  return { contagem, falharam };
}

async function apagarConta(projeto, token, uid) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/projects/' + projeto + '/accounts:delete', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: uid }),
  });
  if (!r.ok) throw new Error('não consegui apagar a conta: ' + (await r.text()).slice(0, 200));
}

async function avisar(email, nome, contagem) {
  const porSmtp = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  const porResend = !!process.env.RESEND_API_KEY;
  if (!porSmtp && !porResend) return 'sem-envio';

  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  const texto = `Olá, ${nome || 'tudo bem'}?

Sua conta do Florescer foi excluída e seus dados foram apagados dos nossos servidores.

Foram removidos ${total} registros: diário, gratidão, registros de pensamento, hábitos,
cadastro e mensagens do mural. Não guardamos cópia.

Se você não pediu isso, escreva para leviai.br@gmail.com — vamos apurar imediatamente.

Cuide-se. Você sempre pode recomeçar quando quiser.
Equipe Florescer`;
  const html = '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#22322c">'
    + texto.split('\n\n').map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`).join('')
    + '</div>';
  const assunto = 'Sua conta do Florescer foi excluída';
  const de = process.env.EMAIL_REMETENTE || EMAIL_REMETENTE_PADRAO;

  if (porSmtp) {
    // SMTP_HOST vazio = Gmail com senha de app. Preenchido = Brevo, Mailjet, SMTP2GO…
    const transporte = nodemailer.createTransport(process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        }
      : { service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await transporte.sendMail({
      from: de, to: email, bcc: process.env.EMAIL_COPIA || undefined,
      subject: assunto, text: texto, html,
    });
    return 'enviado';
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.RESEND_API_KEY },
    body: JSON.stringify({
      from: de, to: [email],
      bcc: process.env.EMAIL_COPIA ? [process.env.EMAIL_COPIA] : undefined,
      subject: assunto, text: texto, html,
    }),
  });
  return r.ok ? 'enviado' : 'falhou: ' + (await r.text()).slice(0, 120);
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
  if (req.method !== 'POST') return responder(405, { erro: 'método não permitido' });

  try {
    const cabecalho = req.headers.get('authorization') || '';
    const idToken = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
    if (!idToken) return responder(401, { erro: 'sem credencial' });

    const pessoa = await conferirToken(idToken);
    if (!pessoa) return responder(401, { erro: 'credencial inválida ou expirada' });

    // Exclusão é irreversível: exige identidade confirmada nos últimos 10 minutos.
    if (Math.floor(Date.now() / 1000) - pessoa.authTime > 600) {
      return responder(403, { erro: 'reautenticar', detalhe: 'entre de novo antes de excluir' });
    }

    const chave = contaDeServico();
    const token = await tokenDeAcesso(chave);
    const { contagem, falharam } = await apagarDados(chave.project_id, token, pessoa.uid);
    await apagarConta(chave.project_id, token, pessoa.uid);

    // O e-mail é cortesia: exclusão é obrigação legal e não pode depender de provedor de e-mail.
    let aviso = 'sem-email';
    if (pessoa.email) {
      try { aviso = await avisar(pessoa.email, pessoa.nome, contagem); }
      catch (e) { aviso = 'falhou: ' + e.message; console.error('excluir-conta: e-mail', e); }
    }

    return responder(200, { ok: true, apagados: contagem, naoApagados: falharam, email: aviso });
  } catch (e) {
    console.error('excluir-conta:', e);
    return responder(500, { erro: 'não foi possível concluir agora' });
  }
};

export const config = { path: '/api/excluir-conta' };
