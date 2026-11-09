# B.A.S.E. — Sistema Escolar Interativo (Faculdade)

Projeto acadêmico com **login real por matrícula e senha**, dashboard escolar e banco `TXT`. O objetivo é reproduzir de forma simples o painel mostrado na apresentação da faculdade.

## O que precisa instalar
- Visual Studio Code
- Node.js 18 ou superior: https://nodejs.org

## Como abrir
1. Extraia este ZIP.
2. Abra a pasta `BASE_Escolar_Interativo_Corrigido` no VS Code.
3. Abra **Terminal > Novo Terminal**.
4. Digite `node servidor.js` (ou `npm start`).
5. Abra **http://localhost:3000** no navegador.

No primeiro acesso, cadastre **nome da escola, administrador, matrícula e senha** (mínimo 8 caracteres). Depois disso a página inicial exige matrícula e senha. Apenas o administrador consegue criar novas contas na opção **Usuários**.

**Teste:** tente entrar com matrícula inexistente ou senha errada. O acesso é negado. Após entrar, cadastre uma turma, um aluno, uma matrícula, frequência e avaliação. Os indicadores e gráficos são recalculados a partir desses registros. Ao clicar em **Sair**, a sessão é encerrada.

## Arquivos
```
BASE_Escolar_Interativo_Corrigido/
├── servidor.js              ← backend + API + autenticação
├── public/
│   ├── index.html            ← login e dashboard
│   ├── style.css             ← visual e versão celular
│   └── app.js                ← interações do painel
├── dados/
│   └── banco.exemplo.txt     ← banco vazio inicial
├── package.json
├── .vscode/launch.json       ← executar com F5
└── LEIA-ME.md
```

O servidor cria `dados/banco.txt` automaticamente na primeira execução. O banco é JSON em arquivo texto, **sem MySQL e sem dependências**. O TXT é privado e é ignorado pelo Git. As senhas são hashes `scrypt`, não ficam visíveis no banco.

## Diferença entre GitHub Pages e servidor
**GitHub Pages NÃO executa backend Node.js, PHP nem grava TXT.** Por isso, o GitHub Pages só pode apresentar páginas estáticas ou uma demonstração simulada. **A autenticação real deste ZIP funciona executando o servidor Node.js** ou hospedando esse servidor em um ambiente com suporte a Node.js. Não publique o TXT com senhas/dados reais no GitHub.

Esta versão é para atividade de faculdade: **não use dados reais de menores**, nem considere esse TXT e esse sistema prontos para produção em redes municipais.

## Imagens
- `preview_login_simples.png`: tela de matrícula e senha após configurar o administrador.
- `preview_dashboard.png`: dashboard inicial com banco vazio (sem dados fictícios).
- `preview_dashboard_ilustrativo.png`: **prévia visual com números fictícios gerados apenas para a imagem**, não gravados no projeto.
- `preview_mobile.png`: visual do primeiro acesso no celular.
