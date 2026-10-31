# Nutri Prático: produto, arquitetura e evolução

Documento vivo da evolução para a saúde integral. As decisões técnicas e as fórmulas ficam em `AUDITORIA.md`.

**Princípio:** o app trabalha para a pessoa. Cada recurso passa por cinco perguntas:
1. É necessário?
2. Pode ser automático?
3. Pode levar menos toques?
4. Pode ficar mais claro?
5. Traz benefício perceptível?

---

## 1. Diagnóstico (outubro de 2026, antes desta etapa)

### Técnico
- **Arquitetura:** app web instalável (PWA) de um arquivo, em JavaScript sem framework.
  - Núcleo puro e testado em `fonte/core.js`; tela em `fonte/app.html`.
  - Montagem por `fonte/build.sh`, publicação pelo GitHub Pages, funcionamento offline por service worker.
- **Dependências:** só o leitor de rótulos (tesseract.js), hospedado com o app e carregado sob demanda. Isso é um ponto forte: leve, rápido e sem custo de servidor.
- **Dados:** `localStorage` em um único documento JSON, com versão e cópia automática antes de cada atualização. Backup manual (arquivo ou texto).
  - Risco 1: o iOS pode apagar os dados de um site que fica muito tempo sem uso. O app pede armazenamento persistente, mas o sistema pode negar.
  - Risco 2: não há criptografia em repouso; o app depende da proteção do aparelho.
- **Cálculos:** TACO 4ª ed. com medidas da POF; FAO/OMS 1985 e DRI 2005 conferidos com as fontes. Ver a seção 8.
- **Limite estrutural:** sendo app web, não há acesso ao HealthKit (Apple Saúde), a SF Symbols nativos nem a haptics no iOS. Esses itens exigem a versão nativa (fase 2).

### Experiência (UX)
- O app era só alimentação: não havia movimento, sono nem bem-estar.
- **Navegação redundante:** "Meu plano" e "Alimentos" eram abas separadas para a mesma tarefa (montar o plano).
- O Início mostrava só nutrição, sem uma resposta para "qual o próximo passo".
- O painel circular tinha 50 marcas decorativas, brilho e uma legenda que repetia o que o centro já dizia.
- O padrão de energia era a média FAO/OMS + DRI, apresentada como se fosse um método.

### Mapa de funcionalidades existentes (todas preservadas)
- **Perfis:** família, com seletor no topo.
- **Energia:** protocolos FAO/OMS 1985 e DRI 2005, com meta aplicável ao plano.
- **Plano por refeições:**
  - autocompletar, quantidades rápidas, substituições, horário com ordenação automática;
  - copiar, colar, duplicar e mover refeições.
- **Alimentos:** busca tolerante a erros, favoritos, recentes, meus alimentos, cadastro manual e por foto da tabela.
- **Dados:** backup e restauração, cópias automáticas e funcionamento offline.

### Riscos priorizados

| Risco | Impacto | Resposta |
|---|---|---|
| Perda de dados pelo iOS ou ao apagar o app | Alto | Lembrete discreto de backup (feito); backup automático em nuvem só com decisão explícita (fase 3) |
| Apresentar o planejado como consumido | Alto | Painel rotulado "planejado"; consumo será um registro separado |
| Sugestões sem base ou com tom de cobrança | Médio | Regras explícitas e testadas, uma por vez, só com dados (seção 6) |
| Metas adultas aplicadas a crianças | Alto | Referências por idade; sugestões automáticas só para adultos |
| Crescer em telas e opções | Médio | Quatro abas fixas e registros em folhas de um passo |

---

## 2. Arquitetura de produto

Quatro pilares sobre um núcleo comum: perfis, dados locais, backup e design system.

| Pilar | Agora (fase 1) | Depois |
|---|---|---|
| **Alimentação** | Plano do dia, banco TACO, produtos por foto, metas | Refeições favoritas, planos semanais, registro do consumido |
| **Movimento** | Registro rápido (tipo, duração, intensidade), semana × referência da OMS | Importação do Apple Saúde / Apple Watch |
| **Sono** | Dormir e acordar, qualidade, 7 noites, regularidade | Importação do Apple Saúde |
| **Bem-estar** | Escala de 5 pontos, energia, estresse e nota, 14 dias | Pausas guiadas curtas; fluxo próprio para crianças |

**Integração sem complexidade:** os pilares se encontram em dois pontos.
1. A tela Hoje, com um indicador por pilar.
2. A "próxima ação", uma única sugestão escolhida por regras.

Cada pilar continua simples sozinho.

---

## 3. Navegação (implementada)

```
Hoje         resumo integrado · próximo passo · atalhos de registro
Alimentação  [Plano do dia | Alimentos]   ← mesma tarefa, um seletor, sem nível extra
Saúde        Movimento · Sono · Bem-estar  (uma tela, cartões em sequência)
Perfil       pessoa · energia e protocolo · família · dados e backup · como calcula
```

**Avaliação crítica:**
- Juntar "Meu plano" e "Alimentos" elimina a principal redundância: o banco de alimentos existe para alimentar o plano.
- "Saúde" reúne três registros curtos que, separados, não justificariam três abas.
- Movimento, sono e bem-estar ficam numa só tela, sem subníveis.
- As ações frequentes estão a no máximo um toque, nos atalhos da tela Hoje.
- A troca de pessoa fica só no topo; editar e excluir pessoas, só no Perfil.

---

## 4. Plano de evolução por prioridade

| Etapa | Conteúdo | Situação |
|---|---|---|
| A | Auditoria, arquitetura e riscos (este documento) | Feita |
| B | Design system: tokens e componentes documentados | Feita (seção 5); modo claro preparado nos tokens, não ativado |
| C | Navegação em quatro abas | Feita |
| D | Hoje: painel integrado, painel nutricional refinado, atalhos, próxima ação | Feita |
| E | Alimentação: refeições favoritas e registro do consumido | Feita |
| E2 | Planos semanais (dias diferentes), copiar entre dias, ajuste do consumido ("comi diferente") | Próxima |
| F | Movimento, sono e bem-estar: registros rápidos | Feita (versão manual) |
| G | Qualidade: testes em aparelho real, medição de tempos, acessibilidade com VoiceOver | Contínua |
| Fase 2 | App nativo (SwiftUI) com HealthKit, SF Symbols, haptics e dados no aparelho com criptografia | Decisão pendente |
| Fase 3 | Assistente, recomendações, planejamento semanal, assinatura | Depois de validar uso e disposição a pagar |

**Próximo passo recomendado: validar em uso real antes da etapa E2.**
- Usar a versão atual por uma ou duas semanas.
- Medir no iPhone os tempos da seção 10.
- A etapa E2 só faz sentido se o plano de um único dia se mostrar insuficiente.

---

## 5. Design system

### Cores (tokens em `:root`)

| Papel | Token | Valor |
|---|---|---|
| Fundo | `--bg` | `#0A0908` |
| Superfícies 1 / 2 / 3 | `--surface`, `--surface-2`, `--surface-3` | `#191614`, `#221E1B`, `#2B2622` |
| Texto / secundário / apagado | `--ink`, `--ink-2`, `--muted` | `#F4EEE8`, `#CDC3B9`, `#968B81` |
| Cobre: ação principal | `--accent`, `--accent-2` | `#E08C4E`, `#F2A468` |
| Carboidratos / proteínas / gorduras / fibras | `--carb`, `--prot`, `--fat`, `--fib` | `#E5C07C`, `#6FC4BE`, `#DE8FA4`, `#A8C98B` |
| Movimento / sono / bem-estar | turquesa, lavanda `#A9A6E0`, champanhe | |

Regras:
- O cobre marca só a ação principal da tela e o progresso.
- Nada de verde/vermelho para "bom/ruim" em saúde: a escala de bem-estar vai de tons frios a quentes, sem julgamento.

### Tipografia
- Família: Geist, com fallback para a fonte do sistema (SF Pro no iPhone).
- Escala: 32 (título), 22 (folha), 16–17 (corpo/valores), 13–14 (secundário), 11–12 (rótulos).
- Números sempre com algarismos tabulares.

### Espaçamento e forma
- Base de 4 px; margem lateral de 16 px; blocos com espaço de 12–14 px.
- Raio de 18 px em cartões, 13–14 px em botões e campos, 24 px em folhas.

### Componentes
- `card`, `seg` (seletor segmentado), `chips`, `btn` (primary, ghost, plain, danger, sm), `sheet` (folha inferior com botão fixo no rodapé).
- Também: `tile` (indicador), `qa` (atalho), `na` (próxima ação), `dial` (painel), `bars` (semana), `toast` com Desfazer.

### Estados
- `:focus-visible` com contorno cobre; `[disabled]` com 35% de opacidade.
- Estado selecionado sempre preenchido em cobre.

### Movimento
- Transições de 0,2–0,26 s; o painel anima em 1,1 s.
- Tudo é desligado com "Reduzir movimento".
- Sem brilhos nem efeitos decorativos.

### Acessibilidade
- Alvos de toque de 36 px ou mais nos componentes novos (atalhos e abas acima de 44 px).
- Rótulos `aria` em ícones; o painel tem uma descrição completa para leitores de tela; contraste do texto secundário de 5,0 a 6,0:1 sobre as superfícies (mínimo AA: 4,5:1).

### Ícones
- SVG de traço único (1,9 px), no estilo dos SF Symbols, sem copiá-los. Na versão nativa, serão SF Symbols.

---

## 6. Fluxos principais

Toques medidos no simulador (iPhone 13), contados a partir da tela Hoje.

| Tarefa | Fluxo | Toques |
|---|---|---|
| Registrar atividade | Atividade → tipo → duração → Salvar | 4 |
| Repetir a última atividade | Atividade → Repetir hoje | 2 |
| Registrar sono | Sono → (horários já vêm do último registro) → qualidade → Salvar | 3 |
| Registrar bem-estar | Saúde → toque na escala | 1 (+1 para abrir a aba) |
| Bem-estar com contexto | Bem-estar → escala → energia/estresse → Salvar | 4 |
| Apagar um registro | × → (Desfazer em 5 s) | 1 |
| Marcar refeição como feita | Hoje → círculo da refeição | 1 |
| Salvar refeição favorita | Refeição → Ações → Salvar como favorita | 3 |
| Usar refeição favorita (qualquer pessoa da família) | Alimentação → favorita | 1 (+1 para abrir a aba) |
| Adicionar alimento ao plano | Alimentos → buscar → + → refeição → quantidade | 4 + digitação |
| Cadastrar produto por foto | Alimentos → + → Escanear → foto → conferir → Salvar | 5 + foto (~3 s de leitura) |

### Próxima ação (`core.nextAction`)
No máximo uma sugestão, na ordem abaixo. A primeira regra que valer é a mostrada.
1. Sem peso/altura: "Calcule sua meta de energia".
2. Plano vazio: "Monte a primeira refeição".
3. Adulto que já registra movimento, com menos de 150 min moderados/vigorosos na semana e 2 dias ou mais sem atividade: caminhada de 20 min, com o número da semana.
4. Adulto com 5 noites ou mais registradas e horário de dormir variando mais de 60 min: regularidade.
5. Adulto que já passou de 150 min: reconhecimento positivo.
6. Nada se aplica: nenhum cartão. O app não inventa sugestões.

Pilares que a pessoa não usa nunca geram cobrança. Para crianças, não há sugestão automática de movimento ou sono.

---

## 7. Plano técnico

- **Dados (versão 3 do formato):** cada perfil ganha `logs`:
  - `move`: `{id, at, date, type, min, intensity?}`;
  - `sleep`: `{id, at, date, bed, wake, quality?}`;
  - `mood`: `{id, at, date, time, mood 1–5, energy?, stress?, note?}`;
  - `eaten`: `{id, at, date, mealId, name, time, t:{kcal, c, p, l, f}, items}`. É uma cópia da refeição no momento em que foi marcada como feita, então mudar o plano depois não altera o histórico.
- **Favoritas:** `S.prefs.savedMeals` (`{id, name, time, items}`), comuns à família.
- **Migração:** acréscimo de campos, sem alterar os existentes.
  - Cópia exata em `nutripratico.v1.antes-da-v3` antes da migração.
  - Adultos de versões anteriores mantêm `energy.method = "media"` para os números não mudarem sozinhos.
- **Núcleo:** funções puras `dayKey`, `weekKeys`, `moveWeek`, `moveRef`, `sleepMinutes`, `sleepStats`, `sleepRef`, `nextAction`, testadas sem tela.
- **Separação por perfil:** registros ficam dentro do perfil. Trocar de pessoa troca tudo; excluir a pessoa exclui seus registros.
- **Fase 2 (nativo):**
  - SwiftUI e SwiftData, com dados protegidos pelo sistema (Data Protection);
  - HealthKit com permissão por tipo de dado; importação para os mesmos campos de `logs`, com origem marcada;
  - o núcleo de cálculo pode ser portado e conferido contra os mesmos testes.
- **Fase 3:** conta e sincronização só com decisão explícita (ver `AUDITORIA.md`).
  - Consentimento do responsável para perfis de menores.
  - Exportação e exclusão de dados (LGPD).

---

## 8. Cálculos: revisão desta etapa

- **Equações conferidas com as fontes** (coeficientes idênticos):
  - Schofield/FAO 1985, seis faixas por sexo;
  - DRI 2005: EER e BEE de adultos e de 3–18 anos, com fatores de atividade por sexo e energia de crescimento.
- **Mudança:** o padrão para adultos passou a ser a DRI 2005, e a média deixou de ser apresentada como método.
  - Motivo: a média não é um método científico; a DRI vem de medidas com água duplamente marcada e usa idade, peso, altura e atividade.
  - A média continua disponível, com a explicação de que serve para comparar.
- **Limitações declaradas no app e no `AUDITORIA.md`:**
  - DRI de peso adequado aplicada a qualquer IMC (a IOM tem equações próprias para sobrepeso, ainda não implementadas);
  - gestação e lactação não somam energia extra;
  - aos 18 anos, a DRI usa a equação de 9–18 anos.
- **Referências dos novos pilares:**
  - OMS 2020: 150–300 min/semana de atividade moderada para adultos; média de 60 min/dia de 5 a 17 anos;
  - National Sleep Foundation 2015: horas de sono por faixa etária.
  - São mostradas como referência populacional, nunca como meta pessoal ou diagnóstico.

---

## 9. Critérios de aceitação (verificáveis)

- [x] Dados existentes abrem iguais depois da atualização: totais, planos, alimentos e GET (teste de ponta a ponta).
- [x] Cópia exata antes da migração (teste).
- [x] Quatro abas; nenhuma funcionalidade anterior perdida (plano, alimentos, foto, perfis, backup).
- [x] Registrar atividade em até 4 toques; repetir em 2; bem-estar em 1 na aba Saúde (medido).
- [x] Todo registro pode ser desfeito ou apagado com Desfazer.
- [x] Próxima ação: no máximo uma, nunca para pilar não usado, nunca para crianças nos novos pilares (testes do núcleo).
- [x] Painel mostra "planejado" e meta; % de Atwater somam 100 (testes).
- [x] Consumido separado do planejado. A marcação vale só para o dia; mudar o plano depois não altera o consumo já registrado (testes).
- [x] Refeição favorita aplicada em 1 toque, também para outra pessoa da família, com Desfazer (teste).
- [x] Sem rolagem horizontal em 320 px; sem erros de JavaScript (teste em iPhone SE simulado).
- [x] Backup e restauração levam os novos registros (teste).
- [ ] Medição em iPhone real: abertura, rolagem, teclado, seletor de hora, VoiceOver.
- [ ] Testes de usabilidade com pessoas (tempo e conclusão por tarefa; seção 10).

---

## 10. Indicadores para validar o diferencial

| Indicador | Como medir | Meta inicial (hipótese) |
|---|---|---|
| Tempo para registrar atividade, sono e bem-estar | Cronômetro em teste moderado, 5–8 pessoas | < 10 s cada |
| Tempo para montar uma refeição habitual | Idem | < 60 s; < 10 s com refeições favoritas (etapa E) |
| Tempo para cadastrar produto por foto | Idem | < 45 s, incluindo a conferência |
| Correções na leitura de rótulos | Campos alterados ÷ campos lidos | < 10% |
| Conclusão de tarefa sem ajuda | Teste moderado | > 90% |
| Erros de navegação | Toques em lugar errado antes de achar a função | < 1 por tarefa |
| Uso voluntário | Dias com registro por semana (local, sem envio) | Acompanhar, sem meta |
| Facilidade percebida | SEQ (1–7) por tarefa | ≥ 6 |

Os números de toques da seção 6 foram medidos no simulador. O tempo real precisa de pessoas e de aparelhos reais. Não há métricas de uso coletadas: o app não envia dados.

**Medição já disponível:** a abertura do app levou ~110 ms até a tela montada (DOMContentLoaded) no simulador. Ainda falta medir em aparelho real.

---

## 11. Modelo comercial (proposta, não implementada)

- **Gratuito:** perfil individual, plano do dia, banco TACO, cadastro manual, registros de movimento, sono e bem-estar, backup.
- **Premium:**
  - leitura de rótulos ilimitada;
  - planejamento semanal e refeições favoritas;
  - importação do Apple Saúde;
  - tendências de 90 dias;
  - família com mais de 2 perfis;
  - sincronização entre aparelhos.
- **Validação antes de preço:**
  - entrevistas e uma página de interesse;
  - teste de disposição a pagar (Van Westendorp) com usuários ativos;
  - nada essencial bloqueado até lá.

---

## 12. Registro de alterações

- **v7:** Design System definitivo (fonte do sistema, escala em rem com Dynamic Type, tokens), Home v7, Saúde em superfícies neutras, ~100 regras de CSS mortas removidas (seção 16).

- **v6:** Home com saudação, pilares e instrumento de nutrição; nomes Nutrição/Exercício/Sono/Emocional; nova paleta dos macros; registro do consumo opcional (seção 15).

- **v5:** design system por pilar e telas Hoje, Alimentação (com aba Favoritos), Saúde (abas por pilar) e Perfil (seções progressivas), seguindo a referência visual (seção 14).

- **v4.2 (refinamento 2.0):**
  - Hoje como cockpit; registro universal; Alimentação e Saúde compactas;
  - planejado × consumido no anel;
  - proteções contra perda de dados (seção 13).

- **v4.1:**
  - **Refeição feita:** marcar com um toque na tela Hoje ou no plano. O consumido do dia aparece numa barra separada do painel planejado.
  - **Refeições favoritas:** comuns à família, aplicadas com um toque e com Desfazer.
  - 25 testes do núcleo.

- **v4 do app (formato de dados v3):** abas Hoje / Alimentação / Saúde / Perfil; tela Hoje integrada com próxima ação e atalhos.
  - Movimento, sono e bem-estar com registros rápidos, Desfazer e histórico.
  - Painel nutricional sem marcas decorativas, brilho e legenda.
  - Protocolo padrão DRI 2005 com limitações explicadas.
  - Migração com cópia; 24 testes do núcleo.
- **v3:** painel circular, cadastro por foto da tabela, protocolo escolhível, biblioteca com origem do dado.
- **v2:** núcleo testado, família, substituições, busca tolerante, backup.

---

## 13. Refinamento premium 2.0 (auditoria e mudanças)

### Auditoria das telas (antes)

| Tela | Problema | Medida |
|---|---|---|
| Hoje | Alimentação ocupava ~1.000 de 1.600 px; movimento, sono e bem-estar e o próximo passo ficavam abaixo da primeira tela | Só a saudação e meio painel apareciam sem rolar (iPhone 13) |
| Hoje | Repetições: "Olá, Camilo" (o nome já está no seletor), chip do objetivo (está no plano), "Abrir plano" (é a aba), grade "Registrar" (os indicadores vazios já abriam o registro) | 4 blocos redundantes |
| Hoje | Texto explicativo permanente e linha de fibras ocupando espaço do essencial | — |
| Alimentação | Cabeçalho, seletor, objetivo e meta: ~330 px antes da primeira refeição; objetivo e meta quase nunca mudam | — |
| Alimentação | Cartões altos (refeição fechada ~70 px, alimento ~66 px); duplicar e favoritar escondidos no menu "Ações"; mesmo ícone para "copiar texto" e "duplicar" | 3 toques para favoritar |
| Saúde | Gráficos grandes e históricos sempre abertos; "média de 1 noite" apresentada como tendência | — |
| Geral | Bordas em todos os cartões; contorno cobre no cartão de energia | Ruído visual |
| Dados | Falha de gravação ignorada em silêncio; a restauração anunciava sucesso mesmo quando a gravação falhava, e já tinha apagado da memória os alimentos próprios; duas janelas abertas podiam sobrescrever uma à outra | 3 riscos de perda de dados |

### O que mudou

- **Hoje vira um cockpit.** Um só bloco com três partes:
  1. Anel com as calorias planejadas no centro e os macros no anel interno; ao lado, meta, consumido e C/P/G.
  2. Só as refeições pendentes, até 3; a lista encolhe ao longo do dia.
  3. Uma linha com movimento, sono e bem-estar.
  - Tudo cabe acima da dobra (medido: termina em 432 px de 600 úteis no iPhone 13 e em 442 de 504 no SE).
  - O detalhe completo (g/kg, fibras, Atwater) abre ao tocar no anel.
- **Planejado × consumido no mesmo instrumento:** o anel externo mostra o planejado em cobre translúcido e o consumido em cobre cheio. Um rótulo identifica os dois; sem legenda decorativa.
- **Registro universal "+"** no topo de Hoje, Alimentação (plano), Saúde e Perfil. A ordem das opções segue a tela:
  - na Saúde, primeiro os registros de saúde;
  - na Alimentação, primeiro os alimentos;
  - no Hoje, primeiro as refeições pendentes, marcáveis com 1 toque dentro da própria folha.
- **Alimentação:**
  - objetivo e meta numa linha que abre os campos no lugar;
  - cartões cerca de 20% mais baixos;
  - favoritar (★) e duplicar com 1 toque no cartão aberto, com ícones distintos para exportar texto e duplicar;
  - favoritas em chips.
- **Saúde:**
  - um resumo por pilar e um minigráfico; histórico e referências em "Histórico e referência", fechado por padrão;
  - sono: média só com 3 noites ou mais, regularidade com 5 ou mais; antes disso, "última noite";
  - aviso de que nenhum valor é estimado.
- **Design:**
  - cartões sem contorno (o contraste do fundo separa os blocos);
  - tokens `--move` (turquesa), `--sleep` (lilás) e `--mood` (champanhe);
  - CSS sem regras mortas (27 removidas).
- **Segurança dos dados:**
  - falha de gravação mostra aviso com atalho para backup e tenta de novo a cada 5 s;
  - a restauração grava primeiro e só depois altera a memória; se falhar, diz que nada foi alterado;
  - alterações feitas em outra janela são recarregadas, não sobrescritas;
  - a tela de backup avisa que o arquivo contém dados de saúde sem criptografia.

### Preservado
- Todas as funções: plano, substituições, banco TACO, foto da tabela, cadastro manual, favoritas, refeição feita, família, backup.
- Cálculos científicos sem alteração; dados existentes intactos (testado com a mesma base).

### Ainda depende de validação
- Uso em iPhone real.
- Testes com pessoas.
- O modo claro continua só preparado.

---

## 14. Evolução visual v5 (referência de design aplicada)

### Design system
- **Pilares com cor própria**, usada só no próprio módulo: alimentação (cobre `--food`), movimento (turquesa `--move`), sono (violeta `--sleep`), bem-estar (rosa `--mood`).
  - Módulos tingidos com `color-mix` a 10–14% sobre o grafite.
- **Componentes:**
  - `.panel` (superfície padrão, raio 20, sem contorno) com título `.panel-h`;
  - `.mod` (indicador de pilar), `.hp` (cartão de pilar na Saúde), `.gauge` (mostrador com legenda);
  - `.mrow` (linha de refeição), `.prow` (linha de seção do Perfil), `.qbig` (atalho de registro).
- **Títulos de página:** `h1.pg` com subtítulo `.pg-s`; abas internas com `.subnav`.

### Por tela
- **Hoje:**
  - saudação com resumo real do dia;
  - quatro indicadores de pilar (sem dado, o toque abre o registro);
  - próximo passo só com dados;
  - mostrador com calorias planejadas no centro, macros no anel interno e na legenda, consumido no anel externo e na linha inferior;
  - lista de refeições com marcação de feita.
- **Alimentação:**
  - abas Plano do dia / Alimentos / Favoritos;
  - cartão-resumo no topo; a barra fixa só aparece quando o cartão sai da tela;
  - refeições com horário em coluna;
  - "Favorita" ao lado de "Adicionar refeição".
- **Saúde:**
  - abas Resumo / Movimento / Sono / Bem-estar (crianças: sem bem-estar);
  - resumo com o número principal e um minigráfico por pilar;
  - abas com referência e histórico completo;
  - bem-estar em linha sem interpolação (dia sem registro fica vazio).
- **Perfil:**
  - identificação;
  - cartão de energia com protocolo, TMB/GET, IMC e "usar como meta";
  - seções que abrem em folhas: Objetivos e metas, Dados corporais, Família, Preferências, Backup e segurança, Como o Nutri Prático calcula (as equações com os números da pessoa).

### Da referência, deliberadamente não implementado
Seriam funções simuladas (regra 9):
- fotos dos pratos (não há imagens de alimentos);
- sino de notificações (o app não envia notificações);
- cartão "Integração com Apple Saúde" (exige app nativo);
- engrenagem de configurações (as preferências reais estão no Perfil).

### Decisões que pedem validação
- O indicador de alimentação no Hoje mostra kcal **consumidas** (não o % planejado da referência), para não confundir plano com consumo.
- Movimento mostra o total da **semana**, comparável à referência da OMS (por semana), em vez de uma meta diária pessoal.
- A cor rosa aparece em gorduras (macro) e em bem-estar (pilar), como na referência; os dois nunca aparecem lado a lado.

---

## 15. Refinamento final: Home e identidade dos pilares (v6)

- **Pilares renomeados** em todas as telas: Nutrição, Exercício, Sono e Emocional. A aba "Alimentação" passou a se chamar "Nutrição".
- **Home:**
  - só a saudação, os quatro pilares e o instrumento de nutrição;
  - saíram a frase-resumo, a lista de refeições (o plano fica só na aba Nutrição), o cartão de próximo passo e o lembrete de backup;
  - o próximo passo de exercício e sono foi para Saúde → Resumo;
  - o lembrete de backup virou um destaque discreto na linha "Backup e segurança" do Perfil.
- **Instrumento de nutrição:**
  - calorias planejadas no centro, sem selo de %;
  - meta discreta abaixo do mostrador;
  - anel externo = plano em relação à meta, com o consumido sobreposto **só quando há registro** (consumo zero nunca aparece);
  - anel interno = divisão da energia, com legenda de quatro colunas (carboidratos, proteínas, gorduras, fibras);
  - tamanho do mostrador proporcional à altura da tela.
- **Medição de "sem rolagem":** o essencial termina acima da barra de abas em todos os tamanhos testados.

| Tela | Fim do instrumento | Topo da barra de abas |
|---|---|---|
| iPhone SE | 488 px | 504 px |
| iPhone 13 (Safari) | 581 px | 600 px |
| iPhone 13 (app instalado) | 661 px | 716 px |
| iPhone Pro Max (app instalado) | 661 px | 806 px |

- **Paleta dos macros:**
  - carboidratos âmbar `#D5A35F`; proteínas terracota `#A95E58` (em texto, `#C47A72`, contraste 5,5:1); gorduras amarelo `#E6C476`; fibras sálvia `#83A98B`;
  - todos acima de 3:1 em gráficos e acima de 4,5:1 em texto;
  - carboidratos e gorduras diferem sobretudo no matiz (contraste entre si de 1,4:1); nos anéis há espaço entre os segmentos e a legenda sempre traz o nome.
- **Registro do consumo opcional (`p.trackEaten`):**
  - por padrão o app é só planejador e não mostra marcação de "feita";
  - registrar uma refeição avulsa fica no menu da refeição ("Registrar como comida hoje");
  - quem quer acompanhar escolhe "Registrar também" em Perfil → Preferências, e as refeições ganham o círculo;
  - quem já marcava refeições antes desta versão continua com a marcação ligada;
  - registrar uma vez não liga o acompanhamento.

---

## 16. Direção criativa v7: auditoria, Design System definitivo e Home

### Auditoria (antes desta etapa)

| Área | Achado | Risco |
|---|---|---|
| Tipografia | Fonte Geist baixada do Google Fonts; 279 tamanhos em px | Requisição a terceiros (privacidade), primeira abertura depende de rede, não usa SF Pro, ignora o tamanho de texto do iPhone (Dynamic Type) |
| CSS | ~800 linhas acumuladas em 7 iterações; 5 definições do cartão de próximo passo; ~100 regras mortas | Inconsistência e manutenção difícil |
| Home | Pilar Nutrição mostrava "2 refeições" (sem unidade de energia); estados vazios como "+ registrar" (parecia tarefa); necessidade estimada ausente | Leitura ambígua; sensação de cobrança |
| Painel | Mostrador grande e dominante | Hierarquia desequilibrada |
| Saúde | Cartões inteiramente tingidos | Peso visual excessivo |
| Dados | Só no aparelho, sem criptografia própria (limite da versão web) | Perda de dados se o iOS limpar o armazenamento; mitigado por backup e cópias automáticas |
| Cálculos | "Média" sem fundamento metodológico próprio | Já sinalizada como comparação; ver decisão abaixo |

### Design System definitivo (tokens em `:root`)

- **Fonte do sistema:** `-apple-system` (SF Pro no iPhone), sem download externo; Inter como substituto em outros sistemas.
- **Escala tipográfica em rem** (1 rem = 17 px no tamanho padrão do iOS):

| Token | rem | px no padrão | Uso |
|---|---|---|---|
| `--t-cap` | 0,68 | 11,5 | rótulos |
| `--t-sm` | 0,76 | 13 | apoio |
| `--t-body` | 0,88 | 15 | texto |
| `--t-h` | 1 | 17 | títulos de seção |
| `--t-num` | 1,18 | 20 | indicadores |
| `--t-title` | 1,3 | 22 | títulos de folha |
| `--t-page` | 1,76 | 30 | título de página |

  Todos os tamanhos do app foram convertidos para rem (278).
- **Dynamic Type:** o app lê o tamanho de texto do sistema (`-apple-system-body`) e o aplica dentro do limite de 15–24 px. Com texto ampliado (19 px ou mais), as grades de 4 colunas viram 2×2 para não cortar palavras.
- **Espaçamento em base 4:** `--s1`…`--s8` = 4, 8, 12, 16, 20, 24, 32 px.
- **Raios:** `--r-s` 12, `--r-m` 16, `--r-l` 20, `--r-xl` 24.
- **Cores:**
  - pilares: `--food` cobre, `--move` turquesa, `--sleep` violeta, `--mood` rosa;
  - macros: `--carb`, `--prot` (texto: `--prot-ink`), `--fat`, `--fib`;
  - neutros: `--bg`, `--surface` 1–3, `--ink`, `--ink-2`, `--muted`.
- **Superfícies:** grafite sem contorno. A cor do pilar só tinge os cartões dos pilares (8%); na Saúde a superfície é neutra e a cor fica no ícone, no título e no gráfico.

### Home v7
- **Saudação:** sem frase extra.
- **Quatro pilares**, sempre com valor, unidade e período:
  - Nutrição: kcal planejadas;
  - Exercício: tempo nesta semana;
  - Sono: última noite;
  - Emocional: hoje.
  - Sem dado, o cartão diz "Não registrado" (ou "Sem plano" na Nutrição) e nunca presume zero.
- **Plano nutricional do dia:**
  - anel compacto, cerca de 40% menor que na v6, com as kcal planejadas no centro geométrico (desvio medido: 0 px);
  - legenda de macros com g e %;
  - abaixo, três números que não se confundem: **Meta**, **Necessidade estimada** (GET, com o protocolo) e **Consumido** (só se a pessoa registra; senão nem aparece).
- **Próximo passo:** volta, em uma linha discreta, só quando `nextAction` tem dados e sugestão apropriada. Exemplo sem dados: "Calcule sua meta de energia".
- **Comparação circular × simples:**
  - uma barra empilhada ocuparia menos altura, mas perderia a relação plano × meta, que o anel externo mostra sem texto;
  - o anel compacto com legenda lateral ficou com a mesma altura de uma barra com rótulos;
  - por isso mantive o anel.
- **"Registrar rapidamente" da referência:** não implementado, porque duplicaria o "+" do topo.

### Medido (Home sem rolagem, nada cortado, nada fora da largura)

| Caso | Fim do conteúdo | Barra de abas |
|---|---|---|
| iPhone 13, app instalado | 577 | 716 |
| iPhone 13, Safari | 545 | 600 |
| iPhone SE | 491 | 504 |
| iPhone Pro Max | 577 | 806 |
| iPhone 13 com texto ampliado (21 px) | 693 | 712 |
| Sem registros | 585 | 716 |
| Perfil novo, vazio | 466 | 716 |

### Plano de implementação priorizado
1. **(Feito)** Design System e Home.
2. **Nutrição:**
   - copiar dia completo e modelos semanais (exige plano por dia da semana; mudança no modelo de dados);
   - ajuste rápido de porções;
   - porções individualizadas em refeições familiares.
3. **Saúde:** tendências de 4 semanas (exercício por tipo e intensidade; sono com regularidade) só com dados suficientes.
4. **Perfil:**
   - rever a opção "Média": manter só como comparação ou removê-la;
   - perfis de menores com responsável;
   - exportação e exclusão por pessoa (LGPD).
5. **Integrações (app nativo):** HealthKit com consentimento por tipo, origem de cada dado e prevenção de duplicatas; criptografia e Face ID.

### Pendências e limites honestos
- As capturas foram feitas em navegador simulado com a fonte Inter; no iPhone a fonte é SF Pro.
- Ainda falta validar em aparelho real: Dynamic Type, VoiceOver e desempenho.
- Itens da referência não implementados por serem simulações: fotos de pratos, sino de notificações, cartão de Apple Saúde, engrenagem de configurações.

## 17. v8 — Refinamento premium, etapa 2 (Home e navegação de Nutrição)

### Problemas reais encontrados nas telas
| Tela | Problema | Correção |
|---|---|---|
| Hoje | Pilares altos (124 px) e períodos quebrando em duas linhas ("kcal / planejadas", "nesta / semana") | Pilares com 100 px; períodos curtos em uma linha ("na semana", "última noite") |
| Hoje | Calorias planejadas repetidas 2× (pilar e anel) | O pilar Nutrição mostra as refeições do plano; as calorias aparecem só no anel |
| Hoje | Legenda de macros em 2 linhas por item; notas abaixo da meta ("definida por você") | Legenda em uma linha (nome · g · %); Meta e Necessidade com unidade e protocolo junto do valor |
| Hoje | "kcal planejadas" encostava no arco | "875 kcal" numa linha e "planejadas" abaixo; arco mais fino; folga medida contra o círculo interno |
| Nutrição | "plano cobre 34% da meta" em cobre como manchete | Removido; o anel mostra a proporção. Aparece só "X kcal acima da meta" (neutro) quando ultrapassa |
| Nutrição | Meta repetida no resumo e na linha de objetivo (dois cartões) | Uma superfície: planejado, macros e objetivo/meta |
| Nutrição | Favoritos em dois lugares (aba Favoritos e Alimentos › Favoritos) | Aba removida. Alimentos favoritos ficam em Alimentos; refeições favoritas abrem pelo botão "Favoritas" do plano (usar e remover) |
| Nutrição | Dois segmentos laranja empilhados em Alimentos; "Meus alimentos" quebrando | Segmento interno neutro; "Meus" |
| Nutrição | "+" do topo mudava de função em Alimentos | "+" universal em todas as telas; cadastrar alimento ao lado da busca |
| Nutrição | Subtítulo e notas de fonte ocupando a tela | Subtítulo removido; fontes em "Fontes dos dados" (expansão) |
| SE | Nome de refeição cortado com reticências | Até duas linhas |

### Medidas da Home (fim do conteúdo / topo da barra, px)
iPhone 13 app 494/716 · Safari 482/600 · SE 485/504 · Pro Max 494/806 · texto ampliado 625/712 · sem registros 507/716 · perfil vazio 440/716. Nenhum texto cortado, nada além da largura, centro do anel com desvio 0.

### Preservado
Cálculos (GET 2.730 kcal no fixture), dados, favoritas (uso com 2 toques, remoção com desfazer), meta e objetivo (edição no próprio cartão, 2 toques), registro opcional, leitura de rótulo (1,8 s).

### Próximas etapas (aguardando avaliação)
Saúde (gráficos adaptados à quantidade de registros; ciência por expansão) → Perfil (calculadora energética compacta e expansível) → revisão geral de consistência.

## 18. v9 — Refinamento premium, etapa 3 (Saúde, Perfil e consistência)

| Problema real | Correção |
|---|---|
| Gráficos com área vazia quando há 1 ou 2 registros (uma barra solitária, um ponto numa linha) | O gráfico acompanha a quantidade de dados: 1–2 dias na semana viram uma faixa de pontos por dia; barras (exercício, sono) e linha (emocional) só a partir de 3 dias; sem registros na semana, nenhum gráfico |
| Referências científicas (OMS 2020, National Sleep Foundation) ocupando painéis inteiros | Ficam em "Referência", aberta por toque; o dado do usuário (minutos moderados/vigorosos, regularidade do sono) continua à vista dentro do cartão |
| Histórico com até 12 linhas abertas | 5 mais recentes à vista; o restante em "Mostrar mais N" |
| Subtítulos repetindo o nome das abas (Saúde, Perfil) | Removidos, como em Nutrição |
| Nota de rodapé longa em Saúde | "Sobre estes dados", por expansão |
| Cartão de sugestão com ícone empilhado acima do texto | Ícone ao lado do texto |
| Calculadora energética no topo do Perfil, antes de objetivos e família | Perfil: identificação → Objetivos, Dados corporais, Família → Necessidade energética (recolhida: "2.730 kcal · GET · média") → Preferências, Backup, Como calcula |
| iPhone SE: aba "Emocional" e linhas do Perfil cortadas com "…" | Abas mais justas; linhas do Perfil em até 2 linhas; números da calculadora sem quebrar a unidade |

Preservado: cálculos (GET 2.730 kcal na média, 2.696 kcal na DRI 2005), escolha de protocolo, "Usar como meta" (só com toque, nunca automático), registros, apagar com desfazer, fluxo infantil.
A opção "Média" continua disponível como antes; a decisão sobre mantê-la só como comparação segue em aberto.

## 19. v10 — Refinamento visual premium 3.0

**Home**
- Anel do "Plano do dia" com diâmetro visível 20–22% maior (108 → 132 px no iPhone 13; 145 px no Pro Max), sem aumentar a altura do cartão: o recorte do desenho elimina a margem das marcas externas.
- Centro do anel: só o número e "kcal planejadas", centralizado no eixo horizontal e vertical (desvio medido: 0 px).
- Anéis mais finos (externo 7, interno 13) e afastados; o anel externo (planejado ÷ meta) passou a tom neutro claro, porque o laranja agora identifica os carboidratos.
- Paleta dos macronutrientes: carboidratos #E58D4D, proteínas #AE625C (texto #CB8078, contraste 5,9:1), gorduras #E9C56F, fibras #86AB91.
- Legenda em quatro linhas alinhadas: nome, gramas (alinhadas à direita) e %.
- Meta e necessidade estimada numa faixa inferior discreta; com o registro ativo, "Consumido" entra na mesma faixa.
- Pilares sem ícone (o rótulo colorido já identifica): 100 → 81 px de altura; sem registro aparece "—" no lugar do número, nunca zero.
- CSS da Home consolidado num bloco único (208 seletores antigos sobrepostos removidos).

**Nutrição**
- Correção: "Carboidratos" aparecia em duas cores no resumo.
- Resumo mais compacto: gramas e % na mesma linha; objetivo e meta em linha discreta.
- Título de seção "Refeições" separa o resumo da lista; botões de adicionar e Favoritas mais leves.

**Saúde**
- Os três cartões do resumo com a mesma altura; área de gráfico igual para barras, pontos e linha.
- Dias da semana maiores e mais legíveis; o dia atual em destaque; os pontos do emocional alinhados às colunas das barras.
- Cartão de sugestão sem contorno, como os demais.

**Perfil**
- Três grupos com títulos discretos: Você (Objetivos e metas, Dados corporais, Família), Planejamento (Necessidade energética, Preferências), Aplicativo (Backup e segurança, Como o Nutri Prático calcula).
- Divisórias recuadas, sem cartões extras; a necessidade energética abre dentro do próprio grupo.

**Auditoria**: iPhone SE, 13 (app e Safari), Pro Max e texto ampliado — sem texto cortado nem estouro de largura em nenhuma tela; contraste de texto ≥ 4,97:1 sobre os cartões. Cálculos inalterados (GET 2.730 kcal), 25/25 testes, regressão completa sem erros.

## 20. v11 — Redesign premium (referência visual das quatro telas)

**Sistema tipográfico** (rem; acompanha o tamanho de texto do iPhone): título de página 32 px, título de seção 19 px, corpo 16 px, apoio 14 px, auxiliar mínimo 13 px, indicadores 26 e 40 px. 164 tamanhos fixos antigos convertidos nesses tokens; nada no app fica abaixo de 13 px. O encolhimento automático de texto foi removido: quando falta espaço o layout se adapta (quebra de linha, 2 × 2), a fonte não diminui.

**Home**: pilares 2 × 2 com ícone, rótulo, valor (26 px) e contexto; anel dos macronutrientes com 160 px (iPhone 13) e só a divisão de energia — o anel externo, sem legenda na Home, saiu; legenda em duas linhas (nome; gramas · %); faixa Meta diária | Necessidade estimada com origem da meta ("definida por você") e método ("FAO/OMS 1985", "DRI 2005", "média FAO/OMS e DRI"); consumido em linha própria quando registrado; "Próximo passo" só quando core.nextAction tem sugestão real. Cabe sem rolar no iPhone 13 (app instalado); no SE e com texto ampliado a página rola em vez de diminuir a fonte.

**Nutrição**: resumo (kcal planejadas para hoje + macros em colunas com divisórias, % embaixo); objetivo e meta em cartão próprio com edição no lugar; refeições em lista agrupada; "Favoritas" ao lado do título "Refeições"; "Adicionar refeição" em botão contornado de largura total. Sem fotos de alimentos (o app não tem esses dados).

**Saúde**: cartões tingidos na cor do pilar; dias "Seg … Dom"; valores em 40 px; botões de registro de 44 px; "Sobre estes dados" como cartão expansível. Só dados reais nos gráficos.

**Perfil**: títulos de seção de 19 px; ícones de 40 px; subtítulos em 14 px sem corte (o alerta de backup aparece inteiro).

**Acessibilidade**: alvos de toque ≥ 44 px em telas e folhas (chips, abas, segmentos, ícones, campos); contraste de texto ≥ 4,5:1 inclusive sobre os fundos tingidos; rótulos de VoiceOver do anel e do resumo agora leem os valores.

Divergências intencionais da referência: sem subtítulos de página e sem a aba Favoritos (removidos antes a pedido, por redundância); sem fotos de refeições; sem barras "fantasma" em dias sem registro; "+" mantido no Perfil (a referência mostra engrenagem, que não tem função hoje).

## 21. v12 — Refinamento definitivo + hidratação, suplementos e exames

**Home** (cabe sem rolar no iPhone 13: conteúdo termina em 681 px, barra em 713)
- Pilares 2 × 2 em duas linhas: ícone + título; valor + descrição curta ("2 refeições", "1 h na semana", "7 h 20", "Bem hoje"). Ícones novos da mesma família: talheres, halter, lua, rosto. Altura 2 × 90 px.
- Anel só com carboidratos, proteínas e gorduras; 875 no centro (desvio 0 px). Fibras saíram do marcador colorido e viraram linha complementar com separador ("Fibras 17 g").
- Rodapé: Hidratação (esquerda, azul-petróleo) e Gasto energético (direita, tom quente), mesma altura. A meta calórica saiu da Home (continua na Nutrição e no Perfil). Título do GET na Home: "Gasto energético" (com "(GET)" a caixa quebrava em três linhas); o método vai embaixo do valor.

**Hidratação** (core.waterRec, testada): adultos 35 mL × kg/dia; valor manual prevalece (0,5–8 L); abaixo de 18 anos só valor manual. Sem acréscimo automático por exercício (ACSM 2007: reposição individual, perda < 2% do peso); explicação de água total vs. bebidas (EFSA 2010; IOM 2004). Sem registro de copos, barra ou percentual.

**Saúde**: resumo em cartões compactos (Exercício, Sono, Emocional, Hidratação) que levam ao detalhe; gráficos só no detalhe; dia sem registro = traço, com legenda; dias futuros em branco. Novas seções: Suplementos e medicamentos; Exames e acompanhamento (com Prioridades de saúde).

**Suplementos, fórmulas e medicamentos** (p.care.meds): nome (único campo obrigatório), categoria, dose, unidade, momento, frequência, observações; pausar, retomar, excluir com desfazer. Sem marcação diária. Reaproveitamento de suplementos de outro perfil da família (medicamentos e fórmulas não são sugeridos, por serem prescrições individuais). Sem recomendação de doses.

**Exames** (p.care.exams; core.addMonths/examNext, testados): nome, data da última realização (validada), intervalo escolhido (3, 6, 12, 24 meses ou nenhum), próxima data prevista, resultado e observações em texto livre. Sem periodicidade sugerida nem interpretação. **Prioridades de saúde** (p.care.goals): texto livre, remover com desfazer.

**Perfil**: Você (dados pessoais, dados corporais, objetivos e metas, família) · Planejamento (GET, hidratação) · Saúde e acompanhamento (atalhos para as seções da Saúde e prioridades) · Aplicativo (backup, configurações, fontes e metodologia). "Preferências" virou "Configurações" (registro do consumo, sugestões e recentes); não foram criadas "preferências alimentares" porque o app não tem esses dados.

**Dados**: os novos campos ficam em `p.care` de cada perfil; perfis antigos ganham `care` vazio ao abrir; entram no backup (o backup exporta o estado inteiro). Nada existente foi alterado.
