const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pasta = path.join(__dirname, '..', 'sistema');
const css = fs.readFileSync(path.join(pasta, 'painel.css'), 'utf8');
const javascript = fs.readFileSync(path.join(pasta, 'painel.js'), 'utf8');

new Function(javascript);

assert.match(
  css,
  /\.aplicacao\.menu-recolhido \.marca-menu small,[\s\S]*?\.aplicacao\.menu-recolhido \.fechar-menu-lateral\s*\{\s*display:none\s*\}/
);
assert.match(css, /\.corpo-app\s*\{[^}]*min-width:0/);
assert.match(css, /\.metricas\s*\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:760px\)\s*\{[\s\S]*?\.aplicacao\.menu-recolhido \.menu-lateral\s*\{[^}]*width:68px/);

assert.match(css, /\.grade-paineis\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /\.aplicacao\.menu-recolhido \.menu-lateral/);

const paineis = [
  'Frequência dos Alunos',
  'Avisos e Comunicados',
  'Desempenho por Disciplina',
  'Atividades Recentes'
];

for (const titulo of paineis) {
  assert.ok(javascript.includes("painel('" + titulo + "'"));
}

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

console.log('OK: menu visível, recolhimento e quatro painéis 2 × 2.');
