# B.A.S.E. — Gestão Escolar Multi-Escola (faculdade)

**Projeto acadêmico executável:** HTML, CSS, JavaScript, Python (biblioteca padrão) e banco TXT contendo JSON. Sem instalar pacotes e sem banco externo.

## Iniciar no VS Code
1. Instale Python 3.10+ e abra esta pasta no VS Code.
2. No terminal, execute `python servidor.py` (Windows também aceita `py servidor.py`).
3. Abra **http://127.0.0.1:3000**.
4. Escolha **Cadastrar escola** e crie a primeira matrícula e senha (mínimo de 8 caracteres).
5. O sistema abre o dashboard da escola; use **Sair** para testar a autenticação. Acesso somente com conta válida.
6. Cadastre turmas, alunos, professores, frequência, avaliações e comunicados. O dashboard calcula os números e os gráficos.

**Login:** `http://127.0.0.1:3000/entrar`  
**Cadastro:** `http://127.0.0.1:3000/cadastrar`  
**Painel protegido:** `http://127.0.0.1:3000/painel`

O arquivo real `dados/banco.txt` é criado automaticamente ao iniciar e é ignorado pelo Git. **Não há credenciais padrão** e não existem alunos ou números fictícios cadastrados.

## O que significa multi-tenant aqui
Cada cadastro de escola cria um `escolaId` exclusivo. O Python identifica a escola por sessão e lê/grava somente a seção da escola no arquivo TXT. Não é possível escolher a escola de outra conta pela requisição; operações contra IDs de outra escola são recusadas. A matrícula de acesso deve ser única em todo o protótipo.

## Estrutura
- `public/inicio.html` e `public/inicio.css`: página pública, logo oficial e links de entrada/cadastro.
- `public/index.html`, `public/style.css`, `public/app.js`: login, cadastro, dashboard e módulos internos.
- `servidor.py`: backend, autenticação, sessões, API e isolamento escolar.
- `dados/banco.exemplo.txt`: estrutura vazia inicial.
- `dados/banco.txt`: banco real, privado e criado automaticamente.
- `docs/`: explicação do projeto para apresentação.

## Logo oficial
Reutilizamos diretamente a imagem já armazenada no repositório da equipe: `https://videirafoo.github.io/Landing-page/img/logo-oficial.png`. **Nenhum logotipo novo foi criado.** O computador precisa ter acesso à internet para exibir a imagem; o sistema de cadastros funciona localmente.

## Sobre GitHub Pages
GitHub Pages hospeda somente HTML/CSS/JS. **Não executa Python, não valida sessões no servidor e não grava TXT.** Por isso não é possível colocar o login real deste protótipo diretamente no domínio `github.io`. A landing pública pode ficar no GitHub Pages, mas o SaaS com autenticação real precisa de um servidor Python. Não use armazenamento do navegador como substituto de autenticação.

## Limites acadêmicos
Adequado para demonstração com dados fictícios criados voluntariamente no ambiente local, mas não é um SaaS de produção. Antes de atender escolas reais: infraestrutura isolada, banco de dados transacional, autorização por papel, HTTPS, autenticação resiliente, auditoria, backups independentes, revisão LGPD e testes de carga. Não envie informações pessoais reais de alunos.

## Rodar testes do backend
Execute `python testes/testar.py` na pasta do projeto. O teste cria dois tenants temporários e não modifica seu banco real.

## Logotipo oficial e acesso integrado
O caminho `public/logo-oficial.png` contém **o mesmo arquivo binário oficial** de `img/logo-oficial.png`, sem redesenho. O servidor Python o entrega em `/logo-oficial.png`.
Ao executar `python servidor.py`, a entrada funciona em `/`, o login em `/entrar`, o cadastro em `/cadastrar` e o dashboard autenticado em `/painel`.
No GitHub Pages, há demonstração em `/Landing-page/sistema/`, mas **sem autenticação de servidor**.

## Conta acadêmica inicial
Uma conta administradora é criada automaticamente no primeiro início com a matrícula informada pelo responsável do projeto nesta conversa. A senha não é gravada em texto puro; somente o hash com sal é armazenado. O banco existente de outras escolas é preservado. Em caso de matrícula já cadastrada, o servidor não modifica essa conta.

O login do GitHub Pages é uma simulação local. Para autenticação protegida e banco TXT, execute `python servidor.py` no VS Code. Não use a conta compartilhada para dados reais.
