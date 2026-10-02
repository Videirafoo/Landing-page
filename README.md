# B.A.S.E. — Landing Page Extensionista

Landing page acadêmica do **B.A.S.E. — Base de Acompanhamento do Sistema Escolar**.

## Objetivo da atividade

A atividade avaliativa consiste na entrega e apresentação de uma **landing page de prática extensionista**.

A página apresenta:
- o problema e a proposta do B.A.S.E.;
- principais recursos do sistema;
- público atendido;
- versão web e mobile;
- identidade visual do projeto;
- formulário de contato optativo.

## Tecnologias utilizadas

- **HTML5**: estrutura e conteúdo da página;
- **CSS3**: layout, cores, responsividade e estilo;
- **JavaScript**: funcionamento do formulário;
- **localStorage**: registro dos contatos no navegador;
- **GitHub**: versionamento do código;
- **GitHub Pages**: publicação do site.

## Arquivos principais

- `index.html` — estrutura da landing page;
- `style.css` — aparência e responsividade;
- `script.js` — registro do formulário de contato;
- `APRESENTACAO.md` — roteiro para apresentação e perguntas prováveis;
- `img/` — logo e imagens do projeto.

## Formulário

Ao enviar:
1. o JavaScript impede o recarregamento da página;
2. lê nome, e-mail e mensagem;
3. cria um objeto com os dados;
4. salva o registro em `localStorage`;
5. exibe uma confirmação e a quantidade de contatos registrados.

> Nesta demonstração acadêmica, o localStorage armazena os dados somente naquele navegador/dispositivo. Em produção, o formulário seria ligado a uma API e banco de dados.

## Responsividade

O CSS usa Flexbox, CSS Grid e media queries. As imagens usam largura responsiva e altura automática para preservar a proporção.

## Publicação

O projeto é publicado como site estático pelo GitHub Pages.
