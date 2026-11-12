const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pasta = path.join(__dirname, '..', 'sistema');
const css = fs.readFileSync(path.join(pasta, 'painel.css'), 'utf8');
const javascript = fs.readFileSync(path.join(pasta, 'painel.js'), 'utf8');
const html = fs.readFileSync(path.join(pasta, 'index.html'), 'utf8');

new Function(javascript);

assert.match(
  css,
  /\.aplicacao\.menu-recolhido \.marca-menu small,[\s\S]*?\.aplicacao\.menu-recolhido \.fechar-menu-lateral\s*\{\s*display:none\s*\}/
);
assert.match(css, /\.corpo-app\s*\{[^}]*min-width:0/);
assert.match(css, /\.metricas\s*\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:760px\)\s*\{[\s\S]*?\.aplicacao\.menu-recolhido \.menu-lateral\s*\{[^}]*display:none;[^}]*width:0/);

assert.match(css, /\.grade-paineis\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /\.aplicacao\.menu-recolhido \.menu-lateral/);
assert.match(css, /@media\(max-width:760px\)[\s\S]*?\.grade-paineis\s*\{[^}]*grid-template-columns:1fr/);
assert.match(css, /\.aviso-rolagem\s*\{\s*display:none/);
assert.match(css, /\.acesso-miolo\s*\{[^}]*align-items:stretch/);
assert.match(html, /<a href="\.\/" class="marca marca-menu"/);
assert.match(html, /id="abrir-ajuda"/);
assert.match(html, /id="janela-ajuda"/);
assert.match(html, /id="busca-ajuda"/);
assert.match(css, /\.itens-menu\s*\{[^}]*flex:0 1 auto/);
assert.match(css, /\.menu-rodape\s*\{[^}]*margin-top:8px/);
assert.match(javascript, /function pesquisarAjuda\(\)/);
assert.match(javascript, /selecionar\('#resultados-ajuda'\)\.onclick/);
assert.match(javascript, /const sessao = await api\('\/api\/me'\);\s*entrarApp\(sessao\);/);
assert.ok(javascript.indexOf("await api('/api/me')") < javascript.indexOf('entrarTela(cadastrar)'));

const paineis = [
  'Frequência dos Alunos',
  'Avisos e Comunicados',
  'Desempenho por Disciplina',
  'Atividades Recentes'
];

for (const titulo of paineis) {
  assert.ok(javascript.includes("painel('" + titulo + "'"));
}

const iconesLucide = [
  'vazio-frequencia.svg',
  'vazio-comunicados.svg',
  'vazio-desempenho.svg',
  'vazio-atividades.svg'
];

for (const arquivo of iconesLucide) {
  const svg = fs.readFileSync(path.join(pasta, 'assets', arquivo), 'utf8');
  assert.match(svg, /viewBox="0 0 24 24"/, arquivo + ': viewBox Lucide');
  assert.match(svg, /stroke-width="2"/, arquivo + ': traço Lucide');
  assert.match(svg, /stroke-linecap="round"/, arquivo + ': pontas arredondadas');
  assert.match(svg, /fill="none"/, arquivo + ': sem preenchimento ilustrativo');
  assert.doesNotMatch(svg, /opacity=|<g |<circle[^>]*fill=/, arquivo + ': sem decoração extra');
}
assert.match(css, /\.vazio-ilustrado img\s*\{[^}]*width:64px;[^}]*height:64px/);
assert.match(css, /@media \(min-width:761px\) and \(max-width:1024px\)/);
assert.match(javascript, /\?v=20261112-lucide/);
assert.match(html, /painel\.css\?v=20261112-lucide/);

function criarClasses() {
  const lista = new Set();
  return {
    contains: nome => lista.has(nome),
    add: nome => lista.add(nome),
    remove: nome => lista.delete(nome),
    toggle: (nome, ativo) => {
      const adicionar = ativo === undefined ? !lista.has(nome) : Boolean(ativo);
      if (adicionar) lista.add(nome);
      else lista.delete(nome);
      return adicionar;
    }
  };
}

const elementos = {
  '#aplicacao': { classList: criarClasses() },
  '#sombra-menu': { classList: criarClasses() },
  '#abrir-menu': {
    atributos: {},
    setAttribute(nome, valor) { this.atributos[nome] = valor; }
  }
};

const janela = { innerWidth: 390 };
const inicio = javascript.indexOf('function atualizarMenu()');
const fim = javascript.indexOf('async function navegar(', inicio);

assert.ok(inicio >= 0 && fim > inicio);

const funcoes = new Function(
  'selecionar', 'window',
  javascript.slice(inicio, fim) + 'return { iniciarMenu, alternarMenu, fecharMenu };'
)(seletor => elementos[seletor], janela);

funcoes.iniciarMenu();
assert.equal(elementos['#aplicacao'].classList.contains('menu-recolhido'), true);

funcoes.alternarMenu();
assert.equal(elementos['#aplicacao'].classList.contains('menu-recolhido'), false);
assert.equal(elementos['#sombra-menu'].classList.contains('aberto'), true);

funcoes.fecharMenu();
assert.equal(elementos['#aplicacao'].classList.contains('menu-recolhido'), true);
assert.equal(elementos['#sombra-menu'].classList.contains('aberto'), false);

janela.innerWidth = 1440;
funcoes.iniciarMenu();
assert.equal(elementos['#aplicacao'].classList.contains('menu-recolhido'), false);

funcoes.alternarMenu();
assert.equal(elementos['#aplicacao'].classList.contains('menu-recolhido'), true);

// Verifica que a ajuda encontra módulos e respeita os itens do menu.
const inicioAjuda = javascript.indexOf('const termosAjuda =');
const fimAjuda = javascript.indexOf('function atualizarMenu()', inicioAjuda);
assert.ok(inicioAjuda >= 0 && fimAjuda > inicioAjuda);

const busca = { value: 'faltas' };
const resultados = { innerHTML: '' };
const opcoes = ['alunos', 'frequencias', 'avaliacoes'].map(pagina => ({
  dataset: { pagina }
}));

const pesquisarAjuda = new Function(
  'selecionar', 'selecionarTodos', 'N', 'D', 'esc',
  javascript.slice(inicioAjuda, fimAjuda) + '\nreturn pesquisarAjuda;'
)(
  seletor => seletor === '#busca-ajuda' ? busca : resultados,
  () => opcoes,
  { alunos: 'Alunos', frequencias: 'Frequência', avaliacoes: 'Avaliações' },
  {},
  valor => valor
);

pesquisarAjuda();
assert.match(resultados.innerHTML, /data-ajuda="frequencias"/);
assert.doesNotMatch(resultados.innerHTML, /data-ajuda="alunos"/);

busca.value = 'notas';
pesquisarAjuda();
assert.match(resultados.innerHTML, /data-ajuda="avaliacoes"/);
assert.doesNotMatch(resultados.innerHTML, /data-ajuda="usuarios"/);

console.log('OK: menu, sessão, ajuda e painéis responsivos.');
