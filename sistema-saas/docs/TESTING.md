# Plano de testes

1. Novo usuário recebe 401 sem login. 2. Cadastro da escola e login com senha correta retornam 201/200. 3. Matrícula desconhecida e senha errada dão 401. 4. Após logout, API e /painel não podem abrir. 5. Segunda escola nunca consulta dados da primeira. 6. Resumo calcula totais reais. 7. Exercitar os módulos e verificar layout a 360 e 1440 px.


## Regressão visual da landing
- Validar que cada imagem original aparece uma vez nas tags `img` e possui um arquivo correspondente no repositório.
- Verificar hero, seção web e seção mobile, sem repetições nem seção de acesso adicional.
- Testar Entrar, Cadastrar escola, links nas três imagens e menu móvel em 360/390 px.
- Verificar que o dashboard, os 13 ícones SVG, o backend Python e o banco TXT não sofreram alteração.
