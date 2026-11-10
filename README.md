# B.A.S.E. — Base de Acompanhamento do Sistema Escolar

Projeto acadêmico do 2º período de Engenharia de Software. A apresentação e o sistema escolar estão no mesmo projeto, com HTML, CSS, JavaScript e Python.

## Estrutura de arquivos

```text
Landing-page/
├── index.html                  Página de apresentação
├── pagina-inicial.css          Estilo da apresentação
├── pagina-inicial.js           Menu e contato da apresentação
├── servidor.py                 Backend Python e autenticação real
├── img/                        Logotipo oficial e imagens
├── sistema/
│   ├── index.html              Login e dashboard (interface única)
│   ├── painel.css              Layout do painel
│   ├── icones.css              Ícones SVG
│   ├── painel.js               Interação, cadastros e indicadores
│   ├── dados-navegador.js      API simulada apenas no GitHub Pages
│   └── assets/                 Ícones e ilustrações dos estados vazios
├── dados/
│   └── banco.exemplo.txt       Estrutura de referência
├── testes/                     Testes Python e JavaScript
├── docs/                       Documentação acadêmica
├── APRESENTACAO.md
└── README.md
```

Os dois arquivos `index.html` têm o nome padrão para que a página inicial e `sistema/` abram diretamente no navegador. Não são cópias: um apresenta o projeto e o outro é o sistema.

## GitHub Pages

- [Página inicial](https://videirafoo.github.io/Landing-page/)
- [Entrar no sistema](https://videirafoo.github.io/Landing-page/sistema/)
- [Cadastrar escola](https://videirafoo.github.io/Landing-page/sistema/?acao=cadastrar)

O GitHub Pages publica somente arquivos estáticos e não executa Python. Nele, o arquivo `sistema/dados-navegador.js` simula as respostas de API e utiliza o armazenamento do próprio navegador. **Não coloque dados reais de alunos nessa demonstração.**

## Executar no VS Code com Python e TXT

1. Abra a pasta completa `Landing-page` no VS Code.
2. No terminal integrado, execute:

```bash
python servidor.py
```

3. Abra `http://127.0.0.1:3000/` para a apresentação ou `http://127.0.0.1:3000/sistema/` para o login.
4. Entre com sua matrícula e senha cadastradas. No servidor Python, a senha é verificada no backend e as informações são gravadas em `dados/banco.txt`, ignorado pelo Git.

**Dados antigos:** caso você já utilize a versão Python anterior e exista um `sistema-saas/dados/banco.txt` no seu computador, faça uma cópia de segurança e copie-o para `dados/banco.txt`. Não há migração automática nem alteração de arquivos locais.

## Testes

```bash
python testes/testar_servidor.py
node testes/testar_navegacao.js
node testes/testar_layout.js
```

Node.js é usado apenas para os testes de interface, não para executar o produto.

## O que foi mantido

Logo oficial, landing, imagens, login, conta inicial, menu lateral recolhível, quatro indicadores, quatro painéis do dashboard, cadastros, sessões e separação de registros entre escolas.

## Limites acadêmicos

O GitHub Pages não fornece autenticação de servidor. O banco TXT local é para estudo, não substitui uma solução segura para informações de estudantes em escolas municipais. Uma implantação profissional precisaria de banco transacional, controle de permissões, auditoria e proteção de dados.
