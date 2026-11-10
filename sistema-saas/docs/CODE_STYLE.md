# Padrão de código — 2º período

## Linguagens
- HTML: estrutura das telas, formulários, menu e tabelas.
- CSS: aparência, classes, cores e adaptação para celular.
- JavaScript: cliques, navegação, formulários e atualização do painel.
- Python: recebe solicitações, valida login e grava dados da escola.
- TXT/JSON: guarda os cadastros do exercício, sem necessidade de MySQL.

## Organização
- `public/index.html`: estrutura da aplicação real.
- `public/style.css`: estilos principais escritos em blocos legíveis.
- `public/icones.css`: ícones SVG da interface.
- `public/app.js`: funções de entrada, menu, dashboard e cadastros.
- `servidor.py`: backend com rotas, autenticação e leitura/gravação.
- `dados/banco.txt`: banco local gerado automaticamente; não publicar.
- `../sistema/index.html`: mesma interface em modo demonstração no GitHub Pages.
- `../sistema/backend.js`: banco fictício local no navegador, somente para apresentação.

## Fluxo do sistema
1. A pessoa abre a landing page e clica em Entrar.
2. O login verifica matrícula e senha.
3. A função `montarMenu()` apresenta as opções disponíveis.
4. A função `navegar(pagina)` destaca o botão e carrega a tela.
5. O dashboard busca os números dos cadastros daquela escola.
6. O botão Sair encerra a sessão.

Usar nomes claros como `selecionar()` e `selecionarTodos()`, uma função para cada responsabilidade e CSS distribuído em regras fáceis de encontrar. Evitar bibliotecas, dependências e abstrações desnecessárias.
