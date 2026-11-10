# Arquitetura do B.A.S.E.

O projeto tem uma landing e um painel, sem frontend paralelo.

**GitHub Pages:** publica HTML/CSS/JS. A página `sistema/index.html` ativa `dados-navegador.js` somente no domínio GitHub Pages, simulando respostas da API e armazenando informações no navegador.

**Python local:** `servidor.py` serve a mesma landing e o mesmo painel. Nesse modo, `dados-navegador.js` não atua. As rotas `/api/*` usam sessão com cookie HttpOnly e um banco TXT/JSON em `dados/banco.txt`, separado por `escolaId`.

**Limites:** GitHub Pages não executa Python. O banco TXT é didático e não deve ser usado para dados reais de estudantes. O projeto precisa de novas proteções antes de um uso operacional.
