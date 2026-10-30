# Nutri Prático

App de saúde pessoal e familiar para iPhone. Alimentação: perfis, necessidade energética (FAO/OMS 1985 e DRI 2005), painel circular de energia e macronutrientes, plano por refeições, busca de alimentos, substituições, cadastro de alimentos por foto da tabela nutricional (lida no próprio aparelho) e backup. Saúde: registros rápidos de movimento, sono e bem-estar, com uma sugestão de próximo passo.

- `docs/`: o app instalável, publicado pelo GitHub Pages. Abra no Safari e use **Compartilhar → Adicionar à Tela de Início**.
- `index.html`: a mesma página, na versão do link do Claude.
- `fonte/`: código-fonte. A lógica fica em `core.js` e a tela em `app.html`. Também ficam aqui os testes e o script que cruza a TACO com as medidas caseiras da POF/IBGE.
- `docs/vendor/tesseract/`: leitor de texto (tesseract.js, Apache 2.0) usado só ao escanear uma tabela nutricional.
- `PRODUTO.md`: diagnóstico, arquitetura, navegação, roadmap, design system, fluxos e indicadores.
- `AUDITORIA.md`: arquitetura, armazenamento, fórmulas e referências, testes e limitações.

Montar: `sh fonte/build.sh` · Testar: `node --test fonte/tests/core.test.js`

Dados: TACO 4ª ed. (NEPA/UNICAMP, 2011) e Tabela de Medidas Referidas, POF 2008–2009 (IBGE).
