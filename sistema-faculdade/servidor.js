// B.A.S.E. - servidor local simples, sem bibliotecas externas.
// Os dados ficam em dados/banco.txt; as senhas ficam protegidas com scrypt.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const PORTA = Number(process.env.PORT || 3000);
const RAIZ = __dirname;
const ARQUIVO = path.join(RAIZ, 'dados', 'banco.txt');
const SESSOES = new Map(); // Login permanece ativo até sair ou reiniciar o servidor.
const TABELAS = ['alunos', 'professores', 'turmas', 'frequencias', 'avisos'];
const CAMPOS = {
  alunos: ['nome', 'matricula', 'turma'],
  professores: ['nome', 'disciplina', 'email'],
  turmas: ['nome', 'ano', 'turno'],
  frequencias: ['alunoId', 'data', 'presente'],
  avisos: ['titulo', 'mensagem']
};
let fila = Promise.resolve();

async function ler() { return JSON.parse(await fs.readFile(ARQUIVO, 'utf8')); }
function gravar(mutacao) {
  const operacao = fila.then(async () => {
    const banco = await ler();
    const retorno = mutacao(banco);
    const temporario = ARQUIVO + '.tmp';
    await fs.writeFile(temporario, JSON.stringify(banco, null, 2), 'utf8');
    await fs.rename(temporario, ARQUIVO);
    return retorno;
  });
  fila = operacao.catch(() => {});
  return operacao;
}
function erro(status, mensagem) { const e = new Error(mensagem); e.status = status; throw e; }
function responder(res, status, objeto, cabecalhos = {}) {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...cabecalhos });
  res.end(JSON.stringify(objeto));
}
async function corpo(req) {
  let texto = '';
  for await (const parte of req) {
    texto += parte;
    if (texto.length > 20000) erro(413, 'Dados muito grandes.');
  }
  try { return JSON.parse(texto || '{}'); } catch { erro(400, 'JSON inválido.'); }
}
function texto(valor, campo, minimo = 1, maximo = 150) {
  if (typeof valor !== 'string' || valor.trim().length < minimo || valor.trim().length > maximo)
    erro(400, `Preencha ${campo} corretamente.`);
  return valor.trim();
}
function senhaValida(senha) {
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 100)
    erro(400, 'A senha deve ter de 8 a 100 caracteres.');
  return senha;
}
function criarHash(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  return sal + ':' + crypto.scryptSync(senha, sal, 64).toString('hex');
}
function conferirSenha(senha, salvo) {
  if (typeof senha !== 'string' || !salvo) return false;
  const [sal, hash] = salvo.split(':');
  if (!sal || !hash || hash.length !== 128) return false;
  const esperado = Buffer.from(hash, 'hex');
  const informado = crypto.scryptSync(senha, sal, 64);
  return crypto.timingSafeEqual(esperado, informado);
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=')));
}
function usuarioAutenticado(req, banco) {
  const token = cookies(req).sessao;
  const sessao = SESSOES.get(token);
  if (!sessao || sessao.expira < Date.now()) erro(401, 'Entre com sua matrícula e senha.');
  const usuario = banco.usuarios.find(u => u.id === sessao.id);
  if (!usuario) erro(401, 'Usuário não cadastrado.');
  return usuario;
}
function iniciarSessao(res, usuario) {
  const token = crypto.randomBytes(32).toString('hex');
  SESSOES.set(token, {id: usuario.id, expira: Date.now() + 8 * 60 * 60 * 1000});
  res.setHeader('Set-Cookie', `sessao=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
function publico(usuario) { return { id: usuario.id, nome: usuario.nome, matricula: usuario.matricula, perfil: usuario.perfil }; }
function validarCadastro(tabela, dados, banco) {
  const registro = {};
  for (const campo of CAMPOS[tabela]) {
    if (campo === 'presente') {
      if (typeof dados.presente !== 'boolean') erro(400, 'Presença inválida.');
      registro.presente = dados.presente;
    } else {
      registro[campo] = texto(dados[campo], campo, 1, campo === 'mensagem' ? 400 : 150);
    }
  }
  if (tabela === 'alunos' && banco.alunos.some(a => a.matricula === registro.matricula)) erro(409, 'Matrícula já cadastrada.');
  if (tabela === 'frequencias') {
    if (!banco.alunos.some(a => a.id === registro.alunoId)) erro(400, 'Aluno não encontrado.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(registro.data)) erro(400, 'Data inválida.');
    if (banco.frequencias.some(f => f.alunoId === registro.alunoId && f.data === registro.data)) erro(409, 'Frequência já registrada para essa data.');
  }
  return registro;
}
async function api(req, res, rota) {
  const metodo = req.method;
  const banco = await ler();
  if (rota === '/api/inicio' && metodo === 'GET') return responder(res, 200, { configurado: banco.usuarios.length > 0 });
  if (rota === '/api/configurar' && metodo === 'POST') {
    const dados = await corpo(req);
    const nome = texto(dados.nome, 'nome', 2);
    const escola = texto(dados.escola, 'nome da escola', 2);
    const matricula = texto(dados.matricula, 'matrícula', 3, 24).toUpperCase();
    if (!/^[A-Z0-9._-]+$/.test(matricula)) erro(400, 'Use apenas letras, números, pontos, hífens ou underline na matrícula.');
    const senha = senhaValida(dados.senha);
    const usuario = await gravar(b => {
      if (b.usuarios.length) erro(403, 'O administrador já foi cadastrado.');
      b.escola = escola;
      const novo = {id:crypto.randomUUID(), nome, matricula, perfil:'Administrador', hash:criarHash(senha)};
      b.usuarios.push(novo);
      return novo;
    });
    iniciarSessao(res, usuario);
    return responder(res, 201, { usuario: publico(usuario), escola });
  }
  if (rota === '/api/login' && metodo === 'POST') {
    const dados = await corpo(req);
    const usuario = banco.usuarios.find(u => u.matricula === String(dados.matricula || '').trim().toUpperCase());
    if (!usuario || !conferirSenha(dados.senha, usuario.hash)) erro(401, 'Matrícula ou senha incorretas.');
    iniciarSessao(res, usuario);
    return responder(res, 200, { usuario: publico(usuario), escola: banco.escola });
  }

  const usuario = usuarioAutenticado(req, banco);
  if (rota === '/api/me' && metodo === 'GET') return responder(res, 200, { usuario: publico(usuario), escola: banco.escola });
  if (rota === '/api/sair' && metodo === 'POST') {
    SESSOES.delete(cookies(req).sessao);
    res.setHeader('Set-Cookie', 'sessao=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    return responder(res, 200, {ok:true});
  }
  if (rota === '/api/resumo' && metodo === 'GET') {
    const total = banco.frequencias.length;
    const presentes = banco.frequencias.filter(f => f.presente).length;
    return responder(res, 200, {
      alunos:banco.alunos.length, professores:banco.professores.length,
      turmas:banco.turmas.length, frequencia:total ? Math.round(presentes / total * 100) : null,
      avisos:banco.avisos.slice(-4).reverse(),
      atividades: [...TABELAS.flatMap(t => banco[t].map(item => ({tipo:t, criadoEm:item.criadoEm, titulo:item.nome || item.titulo || item.data || 'Registro'})))].sort((a,b)=>b.criadoEm.localeCompare(a.criadoEm)).slice(0,5)
    });
  }
  if (rota === '/api/usuarios') {
    if (usuario.perfil !== 'Administrador') erro(403, 'Somente administradores podem gerenciar acessos.');
    if (metodo === 'GET') return responder(res, 200, banco.usuarios.map(publico));
    if (metodo === 'POST') {
      const dados = await corpo(req);
      const nome = texto(dados.nome, 'nome', 2);
      const matricula = texto(dados.matricula, 'matrícula', 3, 24).toUpperCase();
      if (!/^[A-Z0-9._-]+$/.test(matricula)) erro(400, 'Matrícula inválida.');
      const senha = senhaValida(dados.senha);
      const novo = await gravar(b => {
        if (b.usuarios.some(u => u.matricula === matricula)) erro(409, 'Essa matrícula já está cadastrada.');
        const item = { id:crypto.randomUUID(), nome, matricula, perfil:'Funcionário', hash:criarHash(senha) };
        b.usuarios.push(item);
        return publico(item);
      });
      return responder(res, 201, novo);
    }
  }
  const partes = rota.split('/').filter(Boolean);
  if (partes[0] === 'api' && TABELAS.includes(partes[1])) {
    const tabela = partes[1];
    if (metodo === 'GET' && partes.length === 2) return responder(res, 200, banco[tabela].slice().reverse());
    if (metodo === 'POST' && partes.length === 2) {
      const dados = await corpo(req);
      const novo = await gravar(b => {
        const registro = validarCadastro(tabela, dados, b);
        const item = { id:crypto.randomUUID(), ...registro, criadoEm:new Date().toISOString() };
        b[tabela].push(item);
        return item;
      });
      return responder(res, 201, novo);
    }
    if (metodo === 'DELETE' && partes.length === 3) {
      const id = partes[2];
      await gravar(b => {
        const index = b[tabela].findIndex(item => item.id === id);
        if (index < 0) erro(404, 'Registro não encontrado.');
        if (tabela === 'alunos' && b.frequencias.some(f => f.alunoId === id)) erro(409, 'Apague primeiro as frequências desse aluno.');
        b[tabela].splice(index, 1);
      });
      return responder(res, 200, {ok:true});
    }
  }
  erro(404, 'Rota não encontrada.');
}
async function estatico(res, rota) {
  const arquivos = {
    '/':'index.html', '/index.html':'index.html',
    '/style.css':'style.css', '/app.js':'app.js'
  };
  if (!arquivos[rota]) erro(404, 'Página não encontrada.');
  const nome = arquivos[rota];
  const conteudo = await fs.readFile(path.join(RAIZ, 'public', nome));
  const tipo = nome.endsWith('.css') ? 'text/css' : nome.endsWith('.js') ? 'text/javascript' : 'text/html';
  res.writeHead(200, {'Content-Type':tipo+'; charset=utf-8', 'Cache-Control':'no-store'});
  res.end(conteudo);
}
const servidor = http.createServer(async (req, res) => {
  try {
    const rota = new URL(req.url, 'http://localhost').pathname;
    if (rota.startsWith('/api/')) await api(req, res, rota);
    else if (req.method === 'GET') await estatico(res, rota);
    else erro(405, 'Método não permitido.');
  } catch (e) { responder(res, e.status || 500, { erro: e.status ? e.message : 'Erro no servidor.' }); }
});
async function iniciar() {
  await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
  try { await fs.access(ARQUIVO); }
  catch { await fs.copyFile(path.join(RAIZ, 'dados', 'banco.exemplo.txt'), ARQUIVO, require('node:fs').constants.COPYFILE_EXCL).catch(e => { if (e.code !== 'EEXIST') throw e; }); }
  servidor.listen(PORTA, '127.0.0.1', () => console.log(`B.A.S.E. aberto em http://localhost:${PORTA}`));
}
iniciar().catch(e => { console.error(e); process.exitCode = 1; });
