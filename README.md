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

## Abrir no GitHub Pages

- Landing page: `https://videirafoo.github.io/Landing-page/`
- Demonstração interativa: `https://videirafoo.github.io/Landing-page/demo/`
- Os dados da demonstração e as contas criadas ficam **somente no navegador e no dispositivo utilizado**. Não são compartilhados e não representam login seguro de produção. Não insira dados pessoais reais.
- Para autenticação com backend e banco TXT, execute `node servidor.js` na pasta `sistema-faculdade` (VS Code). GitHub Pages não executa esse servidor.
- Configure **Settings > Pages > Deploy from a branch > main > /(root)** caso a publicação ainda não esteja habilitada.

## Acesso e painel no navegador

- Landing: https://videirafoo.github.io/Landing-page/
- Demonstração interativa: https://videirafoo.github.io/Landing-page/demo/
- A demonstração tem cadastro e login por matrícula e senha, mas **não é autenticação de servidor**: os dados ficam somente no navegador. Não inserir dados reais.
- Para autenticação real via Python e arquivo TXT, siga `sistema-saas/README.md` e execute `python servidor.py` localmente. GitHub Pages não executa backend Python.

## Entrar no B.A.S.E. pelo GitHub Pages
- [Site público](https://videirafoo.github.io/Landing-page/)
- [Login e dashboard de demonstração](https://videirafoo.github.io/Landing-page/sistema/)
- [Cadastrar escola na demonstração](https://videirafoo.github.io/Landing-page/sistema/?acao=cadastrar)
- Login REAL (Python + TXT) requer iniciar localmente o servidor em `sistema-saas/servidor.py`: rotas `/entrar`, `/cadastrar` e `/painel`.
- A página estática não protege dados de escolas. Não use dados reais na demonstração pública.
- O logotipo PNG oficial foi reaproveitado de `img/logo-oficial.png`, inclusive no backend Python.
