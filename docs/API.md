# API

`GET /api/inicio`; `POST /api/cadastrar` (`escola`, `nome`, `matricula`, `senha`); `POST /api/login`; `GET /api/me`; `POST /api/sair`; `GET /api/resumo`; `GET/POST /api/{alunos,matriculas,turmas,professores,frequencias,avaliacoes,conteudos,avisos,usuarios}`; `DELETE /api/{recurso}/{id}`; `PUT /api/escola`. Todas as rotas internas exigem sessão, e usuários requerem perfil Administrador.
