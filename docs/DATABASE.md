# Banco TXT

Estrutura: `escolas[]`, `usuarios[]` e `dados{escolaId:{alunos[], matriculas[], turmas[], professores[], frequencias[], avaliacoes[], conteudos[], avisos[]}}`. IDs aleatórios. Usuários contêm `escolaId` e hash scrypt com sal. Dados de escolas não podem ser consultados por query string. TXT é apenas acadêmico; produção requer banco transacional.
