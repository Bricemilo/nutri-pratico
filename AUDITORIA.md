# Nutri Prático: auditoria técnica (v4)

Produto, navegação, roadmap e design system: ver `PRODUTO.md`.

Documento de referência da evolução para o planejador alimentar pessoal e familiar.

## 1. Arquitetura

| Parte | Onde | Papel |
|---|---|---|
| Núcleo de cálculo | `fonte/core.js` | Funções puras: base de alimentos, busca, energia, totais, substituições. Sem tela. Roda no app e nos testes. |
| Tela | `fonte/app.html` | Interface (HTML, CSS e JavaScript sem bibliotecas externas). |
| Leitor de rótulos | `docs/vendor/tesseract/` | tesseract.js 6.0.1 + modelo de português, hospedados com o app e carregados só ao escanear. |
| Base de alimentos | `fonte/foods.json` | TACO 4ª ed. com medidas caseiras da POF 2008–2009, gerada por `fonte/match.py`. |
| Marcações da TACO | `fonte/taco_status.json` | Quais valores são "NA" (não se aplica), "Tr" (traço) ou "*" (em reanálise), lidas do PDF oficial. |
| Montagem | `fonte/build.sh` | Junta tudo em `index.html` (link do Claude) e `docs/index.html` (app instalável no GitHub Pages). |
| Testes | `fonte/tests/core.test.js` | `node --test fonte/tests/core.test.js` |

O app funciona sem internet (service worker em `docs/sw.js`) e não depende de servidor.

## 2. Dados e segurança

- **Onde ficam:** `localStorage` do navegador, na chave `nutripratico.v1`. O formato da versão anterior foi preservado (os perfis continuam na lista `patients`), e a v2 só acrescenta campos: `version`, `activeId`, `prefs.fav` e `prefs.recent`.
- **Migração:** ao abrir a v2 pela primeira vez, uma cópia exata do conteúdo anterior é guardada em `nutripratico.v1.antes-da-v2`. O botão Backup oferece "Voltar à cópia de antes da atualização".
- **Antes de restaurar um backup:** o estado atual é guardado em `nutripratico.v1.antes-de-restaurar`.
- **Gravação:** ocorre a cada alteração (com intervalo de 250 ms), ao sair da página e ao trocar de app.
- **Backups aceitos:** os da v1, v2 e v3.
- **Formato de dados v3 (app v4):**
  - cada perfil ganha `logs.move`, `logs.sleep` e `logs.mood` (movimento, sono e bem-estar);
  - antes de migrar, guarda uma cópia exata em `nutripratico.v1.antes-da-v3`;
  - adultos vindos de versões anteriores recebem `energy.method = "media"`, o padrão antigo, para os números não mudarem sozinhos;
  - testado: mesmos totais, planos, alimentos e GET.
- **v3 sem migração:** a v3 lê os dados da v2 sem alterá-los (testado: mesmos perfis, alimentos e totais). Campos novos são opcionais:
  - `energy.method` (`media`, `fao` ou `dri`): protocolo escolhido para adultos;
  - posição 9 de um alimento próprio: `{brand, portion:{amount, unit, label}, extra:{sugar, addedSugar, satFat, transFat, sodium}, source:"manual"|"rotulo"}`.

### Leitura da tabela nutricional por foto
- **No aparelho:** a foto é lida pelo tesseract.js (WebAssembly) dentro do navegador. Nada é enviado a servidores, não há chave de API.
- **Descarte:** a foto vira um bitmap reduzido em tons de cinza só em memória; depois da leitura, o bitmap é fechado, o canvas é zerado, o campo de arquivo é limpo e removido e o leitor é encerrado. Nenhuma imagem ou miniatura vai para o `localStorage`, IndexedDB ou cache (verificado nos testes). O iOS pode manter cópias temporárias próprias da câmera, fora do controle do app.
- **Só dados estruturados:** nome, marca, porção, valores por 100 g/ml e nutrientes extras.
- **Conferência obrigatória:** a leitura abre a tela de cadastro preenchida; nada é salvo sem o toque em "Salvar".
- **Sinalização (`core.parseLabel`):**
  - valor ausente fica vazio, nunca é presumido;
  - coluna "por porção" é convertida para 100 g só quando a porção é lida; o app sempre mostra a base usada;
  - colunas 100 g × porção que não batem pelas regras de arredondamento do rótulo, erros típicos de leitura corrigidos (ex.: "9,49" → "9,4"), energia incoerente com 4/4/9, açúcares > carboidratos, saturadas > totais e confiança baixa ficam destacados com o motivo.
- **Duplicados:** mesmo nome e marca de um alimento já cadastrado pede "Atualizar o existente" ou "Salvar como novo".
- **Download único:** na primeira leitura o app baixa ~5,5 MB (leitor + modelo), guardados em um cache próprio que sobrevive às atualizações. No link do Claude a leitura fica desativada (o ambiente bloqueia o leitor).
- **Líquidos:** valores por 100 ml são tratados como 100 g no planejamento (1 ml ≈ 1 g), com aviso na tela.

## 3. Cálculos e referências

### Necessidade energética
- **FAO/WHO/UNU 1985 (TRS 724):**
  - TMB pelas equações de Schofield (só peso), por sexo e faixa etária.
  - GET = TMB × fator de atividade para adultos: muito leve 1,30; leve 1,55/1,56; moderado 1,78/1,64; intenso 2,10/1,82.
- **IOM, DRI for Energy (2005):**
  - EER e BEE para adultos (19 anos ou mais).
  - EER para 3–18 anos, com energia de crescimento: +20 kcal (3–8 anos) e +25 kcal (9–18 anos).
- **Resultado exibido:**
  - **Adultos:** DRI 2005 por padrão desde a v4. A média dos dois protocolos não é um método científico próprio: continua disponível para comparação, e perfis anteriores à v4 seguem nela até a pessoa escolher outro protocolo. As equações não mudaram.
  - **Revisão v4:** coeficientes de Schofield (FAO/OMS 1985) e de EER/BEE (DRI 2005) conferidos com as fontes, sem divergência.
  - **Limitações conhecidas:**
    - a DRI de peso adequado é usada em qualquer IMC (a IOM tem equações próprias para sobrepeso, ainda não implementadas);
    - gestação e lactação não somam energia;
    - aos 18 anos vale a equação DRI de 9–18 anos.
  - **Menores de 18 anos (mudança justificada):** só a DRI 2005. Os fatores de atividade da FAO/OMS 1985 foram definidos para adultos, e a DRI inclui a energia de crescimento. A v1 fazia a média também para crianças.
  - **Menores de 3 anos:** só a TMB, sem GET.
- **Meta do plano:** o botão "Usar X kcal como meta do plano" copia o GET do protocolo escolhido; a meta pode ser editada no plano.
- **Sem déficit automático:** o app nunca aplica déficit calórico. Para crianças, exibe orientação de acompanhamento profissional e lembra que o IMC infantil se avalia por curvas de crescimento.

### Composição e totais
- Valor do item = valor por 100 g × (gramas da medida × quantidade) / 100.
- O total da refeição é a soma dos itens; o total do plano é a soma das refeições (verificado nos testes).
- **% dos macronutrientes:** fatores de Atwater (4/4/9), somando 100%. A energia total é a da TACO, que usa fatores específicos por alimento, então pode diferir um pouco de 4C+4P+9G. O app explica isso na tela.
- **g/kg:** gramas ÷ peso do perfil.
- **Painel circular (Início e resumo do plano):**
  - anel externo: energia planejada ÷ meta, de 0 a 100% (50 marcas de 2%); acima da meta o anel fica cheio e o excesso aparece no centro em % e kcal;
  - anel interno: participação de carboidratos, proteínas e gorduras na energia (Atwater), proporcional aos mesmos % das chaves;
  - toque em um macronutriente: gramas, % da energia, g/kg e kcal; sem seleção: fibras e g por 1.000 kcal.
- **Densidade de fibras:** g por 1.000 kcal.

### Dados ausentes
- "Tr" e "NA" valem 0.
- "*" (em reanálise) vira **ausente** (`null`). O item conta como zero no total, mas o total recebe um asterisco e um aviso de que pode estar subestimado.
- Na base de 592 alimentos usados, 12 têm a fibra ausente.
- 4 alimentos com energia e macronutrientes em reanálise ficam fora da busca: leite integral, leite desnatado UHT, iogurte sabor abacaxi e coco verde.

### Substituições
Ficam em `core.substitutes` e `core.equivalent`.
- **Papel do alimento:** é o macronutriente com maior participação na energia:
  - carboidratos se ≥ 50%;
  - proteínas se ≥ 30%;
  - gorduras se ≥ 50%.
- **Critérios:** mesma energia, mesmos carboidratos, mesmas proteínas, ou troca livre.
- **Filtros de realismo:**
  - não sugere alimentos crus no lugar de preparados (exceto frutas e verduras);
  - densidade energética de pelo menos 30% da do original;
  - porção de até 4× o peso original (ou +250 g);
  - sem açúcares como troca para outros grupos;
  - sem verduras como troca para frutas, proteínas ou gorduras.
- **Arredondamento:** frações de ¼ na medida caseira, ou múltiplos de 5 g. Quando a medida ficaria abaixo de ½, usa gramas.
- **Antes de confirmar:** o app mostra a quantidade e o impacto no plano (kcal antes e depois), com um aviso de que equivalência em um critério não significa equivalência nutricional.

### Movimento, sono e bem-estar (`core.js`)
- **Movimento:**
  - soma da semana de segunda a domingo;
  - atividade "leve" fica fora da comparação com a OMS 2020 (150–300 min/semana moderada para adultos; média de 60 min/dia de 5 a 17 anos);
  - minutos vigorosos não são dobrados (simplificação conservadora);
  - o app não converte atividade em calorias.
- **Sono:**
  - duração com virada da meia-noite;
  - média das últimas 7 noites;
  - regularidade = desvio padrão do horário de deitar (contado a partir do meio-dia), com 3 noites ou mais;
  - referência por idade: National Sleep Foundation, 2015.
- **Bem-estar:** escala de 5 pontos, sem cálculo nem inferência.
- **Próxima ação:** regras fixas em `nextAction`, documentadas em `PRODUTO.md`. No máximo uma; nunca para pilar não usado nem para crianças.

## 4. Testes automatizados (24, todos passando)

1. Idade completa com a data de aniversário.
2. TMB e GET da FAO/OMS 1985 para adultos.
3. EER e BEE da DRI 2005 para adultos.
4. DRI 2005 para crianças, com energia de crescimento.
5. Média dos protocolos para adultos e só DRI para menores de 18 anos.
6. Alimentos em reanálise ficam fora da base.
7. Cálculo do item por medida × quantidade.
8. Dado ausente não vira zero sem aviso; "NA" vale zero.
9. Total do plano igual à soma das refeições; % somam 100.
10. Busca tolerante a acentos, plural e um erro de digitação.
11. Arredondamento das quantidades.
12. Substituição por energia (inclui volume realista e exclui verduras no lugar do arroz).
13. Substituição por proteína mantém o papel do alimento.
14. Nomes do dia a dia.
15. Rótulo no modelo novo (100 g + porção) lido corretamente.
16. Erro de leitura de dígito (7,3 lido como 7,8) é sinalizado pela incoerência entre colunas.
17. Rótulo antigo (só por porção) convertido para 100 g/ml.
18. Foto real do rótulo dá o mesmo resultado do arquivo digital.
19. Nada é inventado: campo ausente fica vazio e sinalizado.
20. Energia incoerente com 4/4/9 é sinalizada.
21. Escolha do protocolo de energia (DRI por padrão, média ou FAO quando escolhidas; crianças sempre DRI).
22. Semana de movimento (segunda a domingo, atividade leve fora da referência) e referências por idade.
23. Sono: duração atravessando a meia-noite, regularidade, poucas noites sem conclusão, referências por idade.
24. Próxima ação: uma por vez, só com dados, nenhuma para pilar não usado nem para crianças.

Testes de ponta a ponta da v4 (iPhone 13 e SE simulados):
- **Migração:** dados da versão anterior abertos com totais, planos, alimentos e GET iguais; cópia antes-da-v3 idêntica.
- **Registros:**
  - atividade em 4 toques, repetir em 2, sono em 3, bem-estar em 1 na aba Saúde;
  - Desfazer após registrar e após apagar.
- **Próxima ação:** aparece só com dados (regularidade do sono, plano vazio).
- **Crianças:** sem bem-estar nem sugestões adultas.
- **Navegação:** adicionar alimento pela aba Alimentos leva ao plano.
- **Backup:** restauração com os registros; nada se perde ao recarregar.
- **Tela:** sem rolagem horizontal em 320 px.

Testes de ponta a ponta da v3 (iPhone 13 e iPhone SE simulados):
- **Dados da v2 na v3:** mesmos perfis, alimentos e totais, sem alteração no conteúdo salvo.
- **Painel:** anel externo igual a planejado ÷ meta; arcos internos iguais aos % de Atwater; toque em cada macro; estado acima da meta.
- **Família:** troca pelo seletor do topo; edição e inclusão no Perfil; criança sem seletor de protocolo.
- **Plano:** copiar refeição, barra "Colar como nova", descartar; ordenação automática por horário.
- **Alimentos:** busca com erro de digitação, favoritos, recentes, meus alimentos com origem; cadastro manual por porção (conversão para 100 g conferida); aviso de duplicado e atualização mantendo as medidas.
- **Foto da tabela:** três rótulos (digital novo, antigo e foto real) lidos em ~3 s cada; valores e sinalizações conferidos; nenhum canvas, imagem ou campo de arquivo sobra na tela; nada de imagem no armazenamento.
- **Perfil:** os três protocolos batem com o núcleo; aplicar a meta.
- **Backup:** colar e restaurar, com cópia do estado anterior; dados mantidos após recarregar.
- **Tela:** sem rolagem horizontal no iPhone SE (320 px); sem erros de JavaScript; leitura desativada no link do Claude.

## 5. Limitações e riscos

- **Dados apenas no aparelho:**
  - não há sincronização nem conta;
  - o backup é manual;
  - apagar o ícone da Tela de Início apaga os dados.
- **Base de alimentos:**
  - a TACO tem 597 alimentos e não inclui produtos de marca;
  - a composição da POF/IBGE não foi incorporada, porque o site do IBGE estava inacessível no ambiente de desenvolvimento;
  - as medidas caseiras foram ligadas automaticamente e revisadas à mão só nos alimentos mais comuns.
- **Interface só em português:** os textos ainda estão no código. A internacionalização exige extrair os textos para um dicionário (próximo passo).
- **Desempenho:** a busca percorre ~600 alimentos em memória, o que é instantâneo nesse volume. Com uma base 10× maior, será preciso um índice.
- **Não verificado em aparelho real:** os testes rodam em navegador simulado (Chromium). Precisam de confirmação no iPhone:
  - seletor de horário, teclado e área segura;
  - câmera/galeria pelo campo de arquivo e o tempo de leitura no aparelho (o download de ~5,5 MB acontece na primeira vez);
  - fotos tortas, com reflexo ou pouca luz: a leitura pode falhar ou sinalizar muitos campos. Nesses casos o app oferece outra foto ou a digitação.
- **Leitura de rótulos:** cobre a tabela nutricional brasileira (modelo novo da RDC 429/2020 e o antigo). Rótulos em outros formatos podem precisar de digitação.

## 6. Próximos passos para o modelo por assinatura

1. Conta e sincronização com isolamento por usuário: Supabase (Postgres com Row Level Security) ou Firebase. Exportação e exclusão de dados pela LGPD; consentimento do responsável para perfis de menores.
2. Extrair os textos para `pt`, `en` e `es`.
3. Ampliar a base com a TBCA (USP) e alimentos de marca, mantendo a origem de cada valor.
4. App nativo (Capacitor ou Expo) para a App Store, com assinatura via StoreKit.
5. PDF do plano com marca própria.
