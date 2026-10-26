# Nutri Prático: auditoria técnica e evolução v2

Documento de referência da evolução para o planejador alimentar pessoal e familiar.

## 1. Arquitetura

| Parte | Onde | Papel |
|---|---|---|
| Núcleo de cálculo | `fonte/core.js` | Funções puras: base de alimentos, busca, energia, totais, substituições. Sem tela. Roda no app e nos testes. |
| Tela | `fonte/app.html` | Interface (HTML, CSS e JavaScript sem bibliotecas externas). |
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
- **Backups aceitos:** os da v1 e os da v2.

## 3. Cálculos e referências

### Necessidade energética
- **FAO/WHO/UNU 1985 (TRS 724):**
  - TMB pelas equações de Schofield (só peso), por sexo e faixa etária.
  - GET = TMB × fator de atividade para adultos: muito leve 1,30; leve 1,55/1,56; moderado 1,78/1,64; intenso 2,10/1,82.
- **IOM, DRI for Energy (2005):**
  - EER e BEE para adultos (19 anos ou mais).
  - EER para 3–18 anos, com energia de crescimento: +20 kcal (3–8 anos) e +25 kcal (9–18 anos).
- **Resultado exibido:**
  - **Adultos:** média dos dois protocolos (comportamento preservado da v1).
  - **Menores de 18 anos (mudança justificada):** só a DRI 2005. Os fatores de atividade da FAO/OMS 1985 foram definidos para adultos, e a DRI inclui a energia de crescimento. A v1 fazia a média também para crianças.
  - **Menores de 3 anos:** só a TMB, sem GET.
- **Sem déficit automático:** o app nunca aplica déficit calórico. Para crianças, exibe orientação de acompanhamento profissional e lembra que o IMC infantil se avalia por curvas de crescimento.

### Composição e totais
- Valor do item = valor por 100 g × (gramas da medida × quantidade) / 100.
- O total da refeição é a soma dos itens; o total do plano é a soma das refeições (verificado nos testes).
- **% dos macronutrientes:** fatores de Atwater (4/4/9), somando 100%. A energia total é a da TACO, que usa fatores específicos por alimento, então pode diferir um pouco de 4C+4P+9G. O app explica isso na tela.
- **g/kg:** gramas ÷ peso do perfil.
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

## 4. Testes automatizados (14, todos passando)

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

Também foram feitos testes de ponta a ponta no navegador (simulação de iPhone 13):
- **Migração:** dados criados na v1 aparecem na v2 com os mesmos totais, e a cópia automática é idêntica ao conteúdo original.
- **Plano:**
  - adicionar alimento e usar os atalhos de quantidade;
  - editar a quantidade;
  - substituir um alimento (o total muda exatamente o previsto);
  - copiar, colar, duplicar e mover refeições.
- **Alimentos:** busca com erro de digitação, favoritos e recentes.
- **Perfis:** criar o perfil de uma criança.
- **Backup:** copiar e restaurar.
- **Tela:** sem rolagem horizontal e sem erros de JavaScript.

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
- **Não verificado em aparelho real:** os testes rodam em navegador simulado. O seletor de horário, o teclado e a área segura do iPhone precisam de confirmação no aparelho.

## 6. Próximos passos para o modelo por assinatura

1. Conta e sincronização com isolamento por usuário: Supabase (Postgres com Row Level Security) ou Firebase. Exportação e exclusão de dados pela LGPD; consentimento do responsável para perfis de menores.
2. Extrair os textos para `pt`, `en` e `es`.
3. Ampliar a base com a TBCA (USP) e alimentos de marca, mantendo a origem de cada valor.
4. App nativo (Capacitor ou Expo) para a App Store, com assinatura via StoreKit.
5. PDF do plano com marca própria.
