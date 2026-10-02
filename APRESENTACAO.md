# Roteiro de apresentação — B.A.S.E.

## Abertura

“Este projeto é o B.A.S.E., Base de Acompanhamento do Sistema Escolar. A landing page foi criada para apresentar a proposta do sistema de forma simples, visual e responsiva.”

## O que é uma landing page?

É uma página criada com um objetivo específico. Neste projeto, ela apresenta o B.A.S.E., seus recursos, os públicos atendidos e um formulário de contato.

## Como foi construída?

- **HTML**: estrutura e conteúdo;
- **CSS**: aparência e responsividade;
- **JavaScript**: comportamento do formulário;
- **GitHub**: versionamento;
- **GitHub Pages**: publicação do site.

## Elementos HTML usados

- `header`: cabeçalho;
- `nav`: menu;
- `main`: conteúdo principal;
- `section`: seções da página;
- `article`: cartões;
- `figure` e `img`: imagens;
- `form`, `input`, `textarea`, `button`: formulário;
- `footer`: rodapé.

Os links do menu usam âncoras. Exemplo: `href="#contato"` leva à seção com `id="contato"`.

## Como o CSS funciona?

O CSS define cores, fontes, espaçamentos, cartões, botões e layouts. Foram usados **Flexbox**, **CSS Grid** e **media queries**.

Exemplo:

```css
@media (max-width: 620px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
```

Isso faz os cartões passarem para uma coluna no celular.

## Como as imagens preservam a proporção?

```css
img {
  max-width: 100%;
  height: auto;
}
```

Assim a imagem se adapta à largura disponível sem deformar.

## Como funciona o formulário?

1. o usuário preenche nome, e-mail e mensagem;
2. o JavaScript captura o envio;
3. `event.preventDefault()` impede o recarregamento;
4. os dados viram um objeto;
5. o objeto é salvo no `localStorage`;
6. a página exibe uma confirmação.

Os campos usam `required`, então o próprio navegador valida se foram preenchidos.

## O que é localStorage?

É um armazenamento local do navegador.

Nesta demonstração, ele permite registrar os contatos sem backend.

Limitação: os dados ficam apenas naquele navegador/dispositivo. Em produção, o correto seria usar API e banco de dados.

## O que é GitHub Pages?

É um serviço do GitHub que publica sites estáticos a partir de um repositório.

## O que a landing apresenta do B.A.S.E.?

- frequência e desempenho;
- agenda;
- comunicação;
- ocorrências;
- informações do aluno;
- perfil individual;
- documentos;
- saúde do aluno;
- inclusão/PCD;
- relatórios;
- indicadores;
- sistema web;
- aplicativo mobile.

## Perguntas prováveis

### Por que separar HTML, CSS e JavaScript?
Porque cada arquivo tem uma responsabilidade: HTML é estrutura, CSS é aparência e JavaScript é comportamento.

### O site é responsivo?
Sim. Usa Grid, Flexbox e media queries para computador, tablet e celular.

### Para que serve o atributo alt?
Descreve a imagem para acessibilidade e também ajuda quando a imagem não pode ser exibida.

### Para que serve meta viewport?
Faz a página usar corretamente a largura da tela em dispositivos móveis.

### Onde o formulário salva os dados?
No `localStorage` do navegador nesta versão demonstrativa.

### Isso seria suficiente para produção?
Não. Um sistema real usaria backend, banco de dados, autenticação, segurança e proteção adequada dos dados.

### Qual a diferença entre a landing page e o sistema B.A.S.E.?
A landing page apresenta o projeto. O B.A.S.E. é o sistema que está sendo apresentado.

## Resumo de 30 segundos

“Eu construí a landing page com HTML, CSS e JavaScript. O HTML organiza as seções e o formulário, o CSS cria o layout responsivo e o JavaScript registra os contatos no localStorage. O código fica versionado no GitHub e a página é publicada pelo GitHub Pages. O site apresenta o B.A.S.E., seus módulos e os públicos que utilizariam o sistema.”
