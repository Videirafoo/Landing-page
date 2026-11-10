# Como executar no VS Code

Abra a pasta `sistema-saas` no VS Code.

No terminal:
```bash
python servidor.py
```

Abra `http://127.0.0.1:3000`. A página inicial apresenta Entrar e Cadastrar escola. Para usar o sistema, informe a matrícula e senha cadastradas.

O backend usa apenas Python padrão e grava os dados das escolas em um TXT/JSON local. O GitHub Pages é uma demonstração que guarda as contas e cadastros no navegador, sem autenticação de servidor. Não utilize dados reais de alunos na demonstração.

## Arquivos
- `public/index.html`: formulário de entrada e dashboard.
- `public/style.css`: estilos organizados e responsividade.
- `public/icones.css`: ícones Lucide.
- `public/app.js`: navegação, dashboard, cadastros e eventos.
- `servidor.py`: login, sessões, API, isolamento das escolas e TXT.
- `testes/testar_navegacao.js`: teste sem dependências para o menu.
- `docs/CODE_STYLE.md`: explicação do projeto para a faculdade.

Projeto para estudo acadêmico, não um SaaS pronto para processar dados reais de crianças.
