# B.A.S.E. — Projeto simples para faculdade

Projeto didático para abrir no Visual Studio Code. **Não precisa instalar bibliotecas, MySQL, XAMPP ou contratar VPS.**

## Requisitos

- VS Code
- Node.js 18 ou superior: https://nodejs.org/

## Como executar

1. Extraia o ZIP e abra a pasta `BASE_Faculdade_Gradiente` no VS Code (Arquivo > Abrir Pasta).
2. Abra **Terminal > Novo Terminal** no VS Code.
3. Digite:

   ```bash
   node servidor.js
   ```

   Alternativa: `npm start`.

4. **Alternativa no VS Code:** pressione `F5` e escolha **Iniciar B.A.S.E. (servidor)**.
5. Abra **http://localhost:3000** no navegador. **Não abra `index.html` diretamente**, pois ele precisa do servidor.
6. No primeiro acesso, informe nome da escola, nome do administrador, matrícula e uma senha de **8 caracteres ou mais**.
7. Depois use a matrícula e a senha para entrar. Em **Usuários**, o administrador pode cadastrar outros funcionários.

## Estrutura

```
BASE_Faculdade_Gradiente/
├── servidor.js           # Backend + API + login e senha
├── public/
│   ├── index.html        # Estrutura do frontend
│   ├── style.css         # Estilo e responsividade
│   └── app.js            # Interações e chamadas à API
├── dados/
│   └── banco.txt         # Banco de dados simples em texto
├── .vscode/launch.json    # Iniciar com F5 no VS Code
├── package.json
└── LEIA-ME.md
```

## Funcionalidades

- Tela de primeiro acesso, sem login padrão.
- Login exclusivamente de usuários cadastrados; senha incorreta não permite acesso.
- Senhas armazenadas com hash e sal (não ficam visíveis no arquivo TXT).
- Dashboard com números calculados pelos registros reais.
- Cadastro, listagem, pesquisa e exclusão de alunos, professores, turmas e avisos.
- Frequência por aluno e data, com cálculo da porcentagem de presenças.
- Cadastro de novos acessos feito pelo administrador.
- Layout responsivo para computadores e celulares.

## Como funciona o TXT

O arquivo `dados/banco.txt` contém JSON em formato texto. O servidor cria esse arquivo automaticamente a partir de `dados/banco.exemplo.txt` se ele não existir. O arquivo real não deve ser publicado no GitHub. O servidor Node.js faz a leitura e gravação automaticamente.

**Atenção:** mantenha `banco.txt` privado, não envie dados pessoais de alunos reais para este projeto acadêmico. Se quiser começar novamente, **pare o servidor e restaure o conteúdo inicial vazio do arquivo TXT**, guardando antes qualquer dado que queira preservar.

## Limitações

É um protótipo local de faculdade, **não um SaaS de produção**. Ele não inclui integração com prefeitura, hospedagem pública, LGPD completa, backups automáticos, multi-escolas, recuperação de senha ou escalabilidade. Para implantação real, use um banco de dados de verdade e revise a segurança.


## Referências visuais
Inspirado na apresentação do projeto B.A.S.E. e na referência de landing page `Jorgenador/B.A.S.E-Landing-page`. O código foi escrito de forma independente para a atividade.

**Importante:** GitHub Pages é hospedagem estática. Para usar login e TXT, execute `node servidor.js` no computador com Node.js. Não publique dados reais de alunos neste projeto acadêmico.
