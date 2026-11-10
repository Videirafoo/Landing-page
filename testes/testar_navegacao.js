const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const arquivo = path.join(__dirname, '..', 'sistema', 'painel.js');
const codigo = fs.readFileSync(arquivo, 'utf8');

new Function(codigo);

const inicio = codigo.indexOf('async function navegar(pagina)');
const fim = codigo.indexOf('function topo(', inicio);
assert.ok(inicio >= 0 && fim > inicio, 'Função navegar não encontrada');

const funcao = codigo.slice(inicio, fim);
const botoes = ['dashboard', 'alunos', 'avisos'].map(pagina => ({
  dataset: { pagina },
  atributos: {},
  classList: {
    toggle(nome, ativo) { this[nome] = ativo; }
  },
  setAttribute(nome, valor) { this.atributos[nome] = valor; },
  removeAttribute(nome) { delete this.atributos[nome]; }
}));

const elementos = {
  '#topo-titulo': { textContent: '' },
  '#topo-legenda': { textContent: '' },
  '#conteudo': { innerHTML: '' }
};

const selecionar = seletor => elementos[seletor];
const selecionarTodos = seletor => {
  assert.equal(seletor, '#menu .item-menu');
  return botoes;
};

const chamadas = [];
const abrirPagina = pagina => async () => {
  chamadas.push(pagina);
  elementos['#conteudo'].innerHTML = 'Página carregada: ' + pagina;
};

const construir = new Function(
  'selecionar', 'selecionarTodos', 'fecharMenu', 'estado', 'N', 'D',
  'dashboard', 'listagem', 'relatorios', 'indicadores', 'configuracoes', 'esc',
  funcao + '\nreturn navegar;'
);

const estado = { pagina: '' };
const navegar = construir(
  selecionar, selecionarTodos, () => {}, estado,
  { dashboard: 'Dashboard', alunos: 'Alunos', avisos: 'Comunicados' },
  { alunos: true, avisos: true },
  abrirPagina('dashboard'),
  async pagina => { chamadas.push(pagina); elementos['#conteudo'].innerHTML = 'Página carregada: ' + pagina; },
  abrirPagina('relatorios'),
  abrirPagina('indicadores'),
  () => {},
  texto => texto
);

(async () => {
  for (const pagina of ['dashboard', 'alunos', 'avisos']) {
    await navegar(pagina);
    assert.equal(estado.pagina, pagina);
    assert.equal(botoes.filter(botao => botao.classList.ativo).length, 1);
    assert.equal(botoes.find(botao => botao.classList.ativo).dataset.pagina, pagina);
    assert.match(elementos['#conteudo'].innerHTML, /Página carregada/);
  }
  assert.deepEqual(chamadas, ['dashboard', 'alunos', 'avisos']);
  console.log('OK: menu e dashboard carregam sem erro.');
})().catch(erro => { console.error(erro); process.exitCode = 1; });
