# B.A.S.E. — Base de Acompanhamento do Sistema Escolar

Projeto acadêmico de Engenharia de Software, desenvolvido com HTML, CSS, JavaScript e Python. O objetivo é apresentar uma landing page e demonstrar um painel de gestão escolar com módulos de alunos, matrículas, turmas, professores, frequência, avaliações, conteúdos e comunicados.

## Organização

```text
Landing-page/
├── index.html             Página de apresentação
├── style.css              Estilo da apresentação
├── script.js              Menu e formulário de contato
├── img/                   Logotipo oficial e imagens utilizadas
├── sistema/               Login e painel demonstrativo do GitHub Pages
│   ├── index.html
│   └── backend.js
├── sistema-saas/          Sistema local com autenticação real
│   ├── servidor.py
│   ├── public/            HTML, CSS, JS, ícones e imagens do painel
│   ├── dados/             Exemplo do banco TXT (JSON)
│   ├── testes/            Testes de navegação, layout e backend
│   └── docs/              Requisitos, arquitetura, estilo e segurança
├── demo/index.html        Redirecionamento para sistema/ (link antigo)
├── APRESENTACAO.md        Roteiro para apresentar à faculdade
└── README.md              Este guia
```

A implementação antiga de Node.js foi retirada da versão principal para evitar dois backends concorrentes. O histórico Git preserva os arquivos anteriores.

## Abrir a demonstração online

- [Página inicial](https://videirafoo.github.io/Landing-page/)
- [Entrar no sistema](https://videirafoo.github.io/Landing-page/sistema/)
- [Cadastrar escola](https://videirafoo.github.io/Landing-page/sistema/?acao=cadastrar)

O GitHub Pages **não executa Python nem grava arquivos TXT**. A demonstração online utiliza somente o armazenamento do navegador. Não use dados pessoais reais de alunos nela.

## Executar no VS Code com login e banco TXT

Abra a pasta `sistema-saas` no VS Code e execute no terminal:

```bash
python servidor.py
```

Acesse `http://127.0.0.1:3000`. Essa versão valida matrícula e senha no backend Python e armazena os cadastros no arquivo `dados/banco.txt`, criado localmente e ignorado pelo Git. O arquivo `dados/banco.exemplo.txt` é apenas um modelo, sem dados reais.

Para conferir o código:

```bash
python testes/testar.py
node testes/testar_navegacao.js
node testes/testar_layout.js
```

Os testes JavaScript exigem Node.js somente para testar; a aplicação principal não depende de Node.js.

## Projeto acadêmico e limitações

Os dados do painel são calculados a partir dos registros cadastrados. Indicadores sem informação ficam vazios; não são preenchidos com resultados escolares fictícios. O projeto Python/TXT é adequado para aprendizado, **não para operação com dados reais de estudantes em escolas municipais**.

O código segue as orientações de `sistema-saas/docs/CODE_STYLE.md`. A biblioteca de ícones Lucide conserva sua licença em `sistema-saas/public/assets/icones/LICENSE-LUCIDE.txt`.
