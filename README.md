# Nutri Prático

Planejador alimentar pessoal e familiar para iPhone: perfis, necessidade energética (FAO/OMS 1985 e DRI 2005), plano por refeições, busca de alimentos, substituições e backup.

- `docs/`: o app instalável, publicado pelo GitHub Pages. Abra no Safari e use **Compartilhar → Adicionar à Tela de Início**.
- `index.html`: a mesma página, na versão do link do Claude.
- `fonte/`: código-fonte. A lógica fica em `core.js` e a tela em `app.html`. Também ficam aqui os testes e o script que cruza a TACO com as medidas caseiras da POF/IBGE.
- `AUDITORIA.md`: arquitetura, armazenamento, fórmulas e referências, testes e limitações.

Montar: `sh fonte/build.sh` · Testar: `node --test fonte/tests/core.test.js`

Dados: TACO 4ª ed. (NEPA/UNICAMP, 2011) e Tabela de Medidas Referidas, POF 2008–2009 (IBGE).
