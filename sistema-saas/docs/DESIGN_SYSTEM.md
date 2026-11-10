# Design visual

Usar **somente o logo oficial** do repositório `Videirafoo/Landing-page`. Paleta: azul #2368d7, azul escuro #163b85, fundo #f6f8fc, branco para cards, violeta #954de3 para frequência. Grid com quatro KPIs e quatro painéis, menu lateral visível e recolhível com acesso aos módulos no celular. Tamanhos responsivos e campos com foco visível.


## Landing preservada
- Abertura: `img/gestao-escolar-eficiente.webp`.
- Bloco sistema web: `img/sistema-web-profissional.webp`.
- Bloco mobile: `img/aplicativo-mobile-original.png`.
- Logo único: `img/logo-oficial.png`.
- Imagens da landing nunca são duplicadas ou trocadas sem pedido explícito.
- Links da landing levam a `sistema/`; cadastro em `sistema/?acao=cadastrar`.
- Navegação móvel recolhível com acesso sempre visível; o CSS permanece num arquivo legível.


## Menu e preview de dados
- Ícones de 20px da família Lucide: cinza #66758a em repouso, laranja #f58220 em hover/foco, laranja claro ao selecionar.
- Estilo dos ícones concentrado em `public/icones.css`, não em blocos de overrides adicionados ao final de `style.css`.
- Na seção Protótipo não usar gráficos inventados. Mostrar estados vazios da interface com acesso ao dashboard real.
- A estrutura visual e as três imagens originais da landing devem permanecer inalteradas.


## Navegação do painel
- O menu lateral usa os SVGs Lucide existentes e apresenta azul no item ativo, cinza nos demais e realce laranja no hover.
- No topo à direita, o sino abre Comunicados e o avatar abre Configurações; são botões funcionais.
- Em telas até 1100px, o menu vira gaveta lateral, com botão de fechar e Escape para dispensar.
- O login, a landing, o logo oficial e os dados não são alterados por esse refinamento.


## Distribuição do painel
Os quatro indicadores ficam em cartões independentes. Os quatro blocos abaixo são organizados em duas colunas e duas linhas, inclusive no celular. Em telas pequenas, o menu mostra uma faixa lateral com ícones e nomes abreviados; o usuário pode expandi-lo e recolhê-lo com o botão de menu. No desktop, o menu aparece aberto inicialmente e pode ser recolhido. Nenhum dado de escola é preenchido artificialmente.
