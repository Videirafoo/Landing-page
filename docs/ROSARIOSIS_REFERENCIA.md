# RosarioSIS — referência de dados para o B.A.S.E.

Fonte: https://github.com/francoisjacquet/rosariosis (branch mobile).

## Funcionalidades analisadas
- Organização por escola, ano letivo, períodos e séries.
- Matrículas dos alunos, turmas, horários, professores e disciplinas.
- Frequência por dia e por aula, códigos de situação e justificativas.
- Avaliações e boletins por disciplina e período.
- Responsáveis, calendário, comunicações, relatórios e permissões.

## Modelo atual do projeto acadêmico
O banco TXT/JSON mantém `escolas[]`, `usuarios[]` e `dados{escolaId}` com `alunos`, `matriculas`, `turmas`, `professores`, `frequencias`, `avaliacoes`, `conteudos` e `avisos`.

O dashboard consulta os dados reais da escola autenticada. Sem registros, as contagens exibem zero e as médias ou gráficos sem observações ficam vazios. Não preencher com exemplos falsos.

## Evolução recomendada, ainda não implementada
1. Tabela de ano letivo e períodos para associar às turmas e avaliações.
2. Matrículas como vínculo entre aluno e turma, evitando campo turma em texto livre no aluno.
3. Frequência diária por aluno com justificativa e, depois, frequência por aula.
4. Notas por disciplina, período e professor, com média configurável e boletim.
5. Relatórios exportáveis e perfis autorizados para responsáveis e professores.
6. Auditoria, backups e armazenamento transacional antes de uso real por escolas.

## Cuidados
RosarioSIS é escrito em PHP sob GPL-2.0; a referência foi apenas conceitual. Nenhum código ou tabela do RosarioSIS foi copiado. O GitHub Pages é somente demonstração local no navegador; não é o servidor Python com banco TXT nem plataforma adequada para dados sensíveis.
