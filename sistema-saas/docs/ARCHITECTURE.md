# Arquitetura

Python `ThreadingHTTPServer` serve páginas HTML/CSS/JS e API JSON no mesmo domínio. Um TXT/JSON privado guarda dados por `escolaId`, com gravação atômica e trava para threads. Sessões gerenciadas no servidor via cookie HttpOnly; HTML e rotas API exigem autenticação conforme necessário. Sem serviços externos de banco.
