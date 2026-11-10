# Orientações de implementação

Preservar logo oficial, identidade B.A.S.E. e código simples de faculdade. Não criar usuários ou dados falsos no banco, não desabilitar validação de senha, não misturar escolas, não publicar banco.txt, não fazer deploy sobre produção e não tratar GitHub Pages como hospedagem de Python.


## Contrato de manutenção
1. Comparar a landing com a versão original aprovada antes de qualquer alteração visual.
2. Usar uma imagem distinta por seção e preservar o logo B.A.S.E. oficial.
3. Não modificar login, cadastros, dados multi-escola ou backend quando o pedido é exclusivamente visual.
4. Manter HTML semântico, CSS legível e JavaScript simples, sem bibliotecas novas.
5. Validar responsividade e acesso pelo teclado; usar revisão em branch e CI antes de publicar.


## Referências técnicas
RosarioSIS serve apenas para estudar conceitos de gestão escolar; não copiar o código GPL para este projeto. Melhorias no banco são etapas separadas, com validação e migrações controladas. Ícones ficam em `public/assets/icones/` com licença, enquanto estilos exclusivos dos ícones ficam em `public/icones.css`.
