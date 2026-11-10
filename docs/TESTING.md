# Plano de testes

1. Novo usuário recebe 401 sem login. 2. Cadastro da escola e login com senha correta retornam 201/200. 3. Matrícula desconhecida e senha errada dão 401. 4. Após logout, API e /painel deve redirecionar visitantes sem sessão. 5. Segunda escola nunca consulta dados da primeira. 6. Resumo calcula totais reais. 7. Exercitar os módulos e verificar layout a 360 e 1440 px.


## Regressão visual da landing
- Validar que cada imagem original aparece uma vez nas tags `img` e possui um arquivo correspondente no repositório.
- Verificar hero, seção web e seção mobile, sem repetições nem seção de acesso adicional.
- Testar Entrar, Cadastrar escola, links nas três imagens e menu móvel em 360/390 px.
- Verificar que o dashboard, os 13 ícones SVG, o backend Python e o banco TXT não sofreram alteração.


## Controles e ícones
- Verificar 13 botões com ícones e `aria-current` atualizado ao navegar.
- Clicar no sino deve abrir Comunicados; clicar no avatar deve abrir Configurações.
- A 390px, o menu deve ficar visível como faixa de ícones e permitir expansão; em 980px, deve aparecer expandido e permitir recolher. O botão atualiza `aria-expanded`.
- Fechar por botão X, fundo escurecido e Escape; verificar ausência de sobreposição permanente do conteúdo.
- Confirmar o uso do SVG de sair, o logo original e as mesmas rotas de login.


## Falha de dashboard em branco — regressão
- O menu deve ser selecionado com `selecionarTodos('#menu .item-menu')` antes de executar `.forEach()`.
- Clicar em Dashboard, Alunos e Comunicados não pode lançar exceções antes de carregar a página.
- Verificar que a área `#conteudo` mostra carregando e em seguida cartões ou mensagem de erro.
- Executar `node testes/testar_navegacao.js` para a regressão de JavaScript, sem bibliotecas extras.
- Não alterar o conteúdo de `dados/banco.txt` nem publicar dados reais na demonstração.


## Regressão da grade 2 × 2
- Verificar em 360px, 390px, 768px e 1440px que os painéis Frequência, Comunicados, Desempenho e Atividades são quatro cartões numa grade de duas colunas.
- Testar abrir/recolher o menu, navegar com os ícones e manter o painel visível.
- O logo, a landing, o login, a API e o banco TXT devem permanecer inalterados.


## Regressão da faixa lateral recolhida
- Ao recolher, confirmar que Gestão Escolar, Precisa de ajuda e dados do usuário não ficam sobre o logotipo.
- O botão Sair permanece acessível no rodapé da faixa.
- Em 360/390px, os cartões não podem forçar rolagem horizontal da página; gráficos podem se adaptar internamente.
- Em 390px, tocar no botão do topo deve expandir o menu, tocar em um módulo deve fechá-lo e carregar a seção correta.
- Executar `node testes/testar_layout.js` e `node testes/testar_navegacao.js` antes de publicar.


## Projeto com nomes únicos
- Abrir `/`, `/sistema/` e `/sistema/?acao=cadastrar` no GitHub Pages.
- Executar `python testes/testar_servidor.py` no terminal local/CI, cobrindo autenticação e isolamento.
- Executar os dois testes JavaScript após mover `painel.js` e `painel.css`.
- Verificar que `/sistema/dados/banco.txt` não é servido pelo Python e que o navegador não ativa a API simulada no localhost.
- Confirmar que a URL pública existente `/Landing-page/sistema/` continua válida e que os dados do localStorage não são apagados.
