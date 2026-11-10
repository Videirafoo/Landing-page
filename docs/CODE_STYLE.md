# Padrão de código — 2º período

O B.A.S.E. é um único projeto. Cada arquivo tem uma responsabilidade.

| Arquivo | Função |
|---|---|
| `index.html` | Página de apresentação |
| `pagina-inicial.css` | Cores e layout da apresentação |
| `pagina-inicial.js` | Menu e formulário da apresentação |
| `sistema/index.html` | Login, menu e painel |
| `sistema/painel.css` | Layout responsivo do painel |
| `sistema/icones.css` | Cores e SVGs do menu |
| `sistema/painel.js` | Navegação, cadastros e indicadores |
| `sistema/dados-navegador.js` | API simulada apenas no GitHub Pages |
| `servidor.py` | Login real, API e gravação no TXT |
| `dados/banco.txt` | Registros locais separados por escola (não publicar) |
| `testes/` | Validações automáticas |

Os dois `index.html` ficam em pastas diferentes porque servidores web usam esse nome como entrada padrão para cada diretório. Não são cópias; um apresenta o projeto, o outro contém o sistema.

## Como funciona
1. O visitante abre a landing e clica em Entrar.
2. O navegador abre `sistema/index.html`.
3. No GitHub Pages, `dados-navegador.js` guarda a simulação no navegador.
4. Ao executar `python servidor.py`, o navegador usa a API do Python e o banco TXT.
5. O dashboard usa os cadastros da escola para mostrar os totais e os painéis.

O código usa funções básicas, DOM, formulários, objetos, listas e CSS Grid/Flexbox, com nomes que indicam a responsabilidade. Não adicionar frameworks nem páginas duplicadas.
