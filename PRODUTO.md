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

## 22. v13 — Home como painel de saúde (nome provisório BRICEÑO)

**Home**: oito cartões do mesmo componente, em três grupos separados por espaço (sem títulos): Nutrição · Exercício · Sono · Emocional | Hidratação · Gasto energético | Suplementos · Medicamentos. Cada cartão: ícone e nome na cor do pilar, valor em destaque, contexto discreto; toque leva ao módulo; sem dado, estado vazio ("Não registrado", "Não cadastrado"…) que abre o cadastro.
- Nutrição: kcal totais do plano ativo ("Plano alimentar") → Nutrição. Exercício: total da semana "/semana" e dias com registro → detalhe (vazio: registrar). Sono: última noite → detalhe. Emocional: registro mais recente, com dia e hora → detalhe (menores de 18: sem o cartão, como antes). Hidratação: recomendação (35 mL/kg ou valor definido) → ajuste. Gasto energético: GET do cálculo existente, com o método → Perfil com o GET aberto (sem peso/altura: Dados corporais). Suplementos (inclui fórmulas manipuladas) e Medicamentos: ativos e cadastrados, contando nomes únicos, pausados fora dos ativos → lista em Saúde (vazio: cadastro já na categoria certa).
- Saiu da Home: anel de calorias, macronutrientes, fibras e comparação planejado × GET. Continuam na Nutrição (resumo e "Resumo nutricional").
- iPhone 13: as quatro linhas cabem sem rolar (fim em 672 px; barra em 713), todas com 114 px. SE e texto ampliado: rolagem, sem cortes.
- Cores novas (tokens): --energy #D9B872 sobre fundo grafite-azulado, --supp #AFC274 (oliva), --meds #8EAAD8 (ardósia). Contraste dos títulos ≥ 5,3:1 sobre o próprio fundo.

**Ícones**: a aba Nutrição passou a usar os mesmos talheres da Home; Exercício usa o halter em todo o app; Medicamentos ganhou ícone de frasco (o anterior parecia um sinal de proibido).

**Nome**: "BRICEÑO" no título da página, no nome do app instalado (manifest e apple-mobile-web-app-title), na marca da Home e nos textos que citavam o nome. Chave de armazenamento, URL, identificadores e arquivos internos não mudaram; não há logotipo definitivo.

## 23. v14 — Home 2.0: refinamento visual

- **Menos cor**: os oito cartões passam a ser grafite com uma nuance mínima da cor do módulo (6%; 9% em Suplementos e Medicamentos) e contorno neutro de 1 px. Sem gradientes nem bordas coloridas. A cor fica no ícone (18 px, sem fundo).
- **Três níveis**, mesmo componente: pilares (valor 28 px, 116 px de altura) · metabolismo (22 px, ~100 px) · acompanhamento (20 px, ~92 px). Nome do módulo em cinza claro 14/600; unidade 14/500 em cinza; legenda 13 px.
- **Espaçamento**: margem 16 · entre cartões 10 · entre níveis 20 · padding 14 · raio 18 (SE: 8 · 16 · 12).
- **Textos**: Exercício "3 dias ativos"; Sono "Última noite"; Emocional "Ontem, 21:40"; Hidratação "Recomendação diária" / "Definida por você"; Gasto energético "GET estimado" (o método saiu da Home e fica no Perfil); Suplementos/Medicamentos "2 ativos" e só "1 pausado" quando houver; vazio "Nenhum cadastrado · Toque para adicionar".
- **Saudação** pelo horário local: 5–11 h Bom dia, 12–17 h Boa tarde, 18–4 h Boa noite. A Home se redesenha ao voltar ao app e na virada de período ou de dia (verificação a cada minuto, só sem folha aberta).
- **Toque**: estado pressionado discreto (escala 0,985 e fundo um pouco mais claro, 120 ms); respeita "reduzir movimento". Vibração ao toque não existe para apps web no iPhone, por isso não foi incluída.

## 24. v15 — BRICEÑO 3.0 "Digital Jewelry" (Home)

- **Material único, parametrizado**: os oito cartões usam a mesma classe `.hc` e cada um define só duas cores, `--g` (gema: ícone, aro e reflexo) e `--gd` (fundo profundo). Camadas em CSS puro, sem imagens nem animação contínua: corpo em gradiente com luz direcional do canto superior esquerdo · aro de 1 px em gradiente (metal acetinado) · três arcos finos presos ao canto inferior direito · brilho interno de 1 px no topo e sombra curta.
- **Gemas**: Nutrição cobre #D98A4E/#22140B · Exercício esmeralda #3FBF9F/#0A1D18 · Sono ametista #A387F2/#171126 · Emocional rubi rosado #E3728C/#251018 · Hidratação safira-petróleo #3BAFD3/#091A22 · Gasto energético champanhe/bronze #D7B678/#1D170E · Suplementos peridoto #ABCB5C/#151A0B · Medicamentos safira-ardósia #7399E0/#0E1526. Os tokens globais dos módulos (usados nas outras abas) não mudaram.
- **Cartão**: ícone em lâmina de 28 px com aro da gema; nome 14/600; seta discreta à direita; valor branco (28/22/20 px pelos três níveis), unidade e legenda em branco translúcido (60–64%). Raio 20. Entre cartões 10, entre pilares e o restante 18.
- **Cabeçalho**: BRICEÑO centralizado em cobre (gradiente no texto), espaçamento largo, com um traço curto abaixo; três arcos de cobre muito finos no canto superior direito. Seletor familiar com borda cobre sutil; botão "+" em cobre com brilho interno.
- **Barra inferior**: mesma navegação; a aba ativa ganhou um traço fino de cobre na borda superior (sem brilho, sem animação).
- **Toque**: escala 0,982 e brilho +12% por 140 ms; desligado com "Reduzir movimento".
- iPhone 13: conteúdo termina em 688 px (barra em 713), sem rolar. "Gasto energético" ocupa duas linhas em 390 px de largura por causa da seta; os valores dos dois cartões continuam alinhados.

## 25. v16 — BRICEÑO 4.0 Signature Edition (Home)

**Auditoria da v15** (problemas corrigidos): mesmos arcos de luz nos oito cartões (efeito de modelo); "Gasto energético" quebrando em duas linhas; caixas de ícone e oito setas somando ruído; marca apenas centralizada; arco decorativo no topo sem função; botão "+" com halo; legenda com contraste no limite sobre o reflexo; valores em texto ("Muito bem") podendo encostar na borda com texto ampliado.

**Material**: um único `.hc` com parâmetros por módulo — luz principal (`--lx/--ly` origem, `--lw/--lh` alcance, `--li` intensidade), faixa acetinada só nos metais (`--sa/--sp/--si`), aro aceso do lado da luz (`--ra`). Toda luz fica à direita; título e número ficam sobre fundo escuro.
- Metais: Nutrição cobre (luz quente no alto, faixa diagonal) · Exercício titânio esmeralda (luz lateral, faixa quase horizontal) · Gasto energético bronze champanhe (luz baixa, faixa vertical).
- Gemas (sem faixa, luz difusa): Sono ametista (de baixo) · Emocional rubi (ponto concentrado no alto) · Hidratação safira-petróleo (rasante no topo) · Suplementos peridoto (suave, lateral) · Medicamentos safira-ardósia (precisa, no canto).

**Cartões**: ícone de 19 px sem caixa, na cor da gema; sem setas (o cartão inteiro é o botão, com resposta ao toque). Título 14/600 sem compressão; número 28 (pilares) e 22 (demais), algarismos tabulares, unidade 14 a 66% de opacidade, legenda 13 a 70%.
- Gasto energético: título completo quando cabe em uma linha; senão "GET" (medido continuamente: largura, rotação, texto ampliado; volta ao completo quando cabe). Legenda "Estimativa diária". VoiceOver sempre lê "Gasto energético". Detalhes científicos seguem no Perfil.
- Suplementos e Medicamentos: sempre um número — "2 ativos" / "1 ativo"; vazio "0 cadastrados · Toque para adicionar" (abre o cadastro); "1 pausado" só quando houver.
- Grupos 2 e 3: número logo abaixo do título, alinhado entre os dois cartões da linha mesmo quando uma legenda quebra.

**Geometria**: margem 16 · entre cartões 10 · entre grupos 20 · padding 14 · raio 20 (SE: 8 · 16 · 12). Pilares 124 px; grupos 2 e 3 com 104 px.
**Cabeçalho**: assinatura BRICEÑO alinhada à esquerda (mesma margem da saudação), cobre, espaçamento 0,34 em, seguida de um fio cobre que esmaece — composição editorial; arco decorativo removido. Botão "+" circular de 44 px (igual à altura do seletor), sem halo.
**Barra**: divisória mais fina, aba ativa em cobre com traço curto; resposta ao toque (escala 0,94).
**Toque**: cartões 0,98 + brilho 10% (160 ms); tudo desligado com "Reduzir movimento". Resposta tátil: vibração de 6 ms no Android; no iPhone, interruptor nativo invisível (comportamento do Safari a partir do iOS 18) — não verificável fora do aparelho.
**Medições** (Playwright): iPhone 13 termina em 683 px (barra 712); contraste mínimo 5,3:1 medido sobre o fundo renderizado (35 textos); sem cortes nem estouros em 13, SE, Pro Max e texto ampliado.

## 26. Home v17 — Digital Jewelry (fidelidade ao conceito original)

**Referência.** Imagem A = conceito aprovado (cartões-joia com reflexos curvos, aros luminosos, ícones em pastilha). Imagem B = Home v16 (captura real).

**Auditoria A × B (o que faltava).**
1. Volume: na v16 a luz era só um gradiente radial; em A há uma lâmina curva de luz com estrias, brilho e ponto quente.
2. Aros: em A o contorno inteiro acende na cor da gema; na v16 era quase invisível.
3. Saturação: em A o corpo do cartão tem cor; na v16 era quase preto.
4. Ícones: em A são pequenas peças (pastilha tonal com aro); na v16, símbolo solto.
5. Cabeçalho: em A a marca é centralizada com filete curto e há uma luz curva atrás do cabeçalho.
6. "+" em A é quadrado arredondado de cobre polido; Emocional usa lótus; aba ativa tem filete sob o rótulo.

**Sistema (fonte/app.html).**
- `.hc` = material em 6 camadas: base cromática (`--g`, `--gd`), luz ambiente (alto à esquerda `--lt`, canto inferior direito `--lb`), reflexo vetorial (`.hc-fx`), microtextura (estrias da lâmina), aro (`--ra`, `--rt`, `--rb`) e conteúdo.
- `JEWEL(cls)`: gera, uma vez por material, um SVG estático (viewBox 180×120, `xMaxYMax slice`, sem filtros) e o clona a cada desenho. O SVG tem:
  - corpo translúcido da lâmina;
  - dois brilhos largos;
  - estrias em três grupos de intensidade;
  - fio de luz nítido e ponto quente.
- Metais (cobre, titânio, bronze): 14–15 estrias densas.
- Gemas (ametista, rubi, safiras, peridoto): 8–9 estrias espaçadas e um segundo reflexo fraco.
- Cada material tem curvatura, altura e posição do ponto quente próprias.
- Proteção de leitura:
  - máscara que atenua o reflexo na metade inferior esquerda (número e legenda);
  - halo na cor-base atrás de valor e legenda.
- Ícones: pastilha de 30 px (28 px em telas de até 380 px), raio 9, aro aceso no alto, sombra de contato mínima.
- Grade:
  - 11 px entre linhas e colunas (como em A), raio 18, padding 14 (12 em telas de até 380 px);
  - pilares com número de 28 px, ancorados na base;
  - níveis 2 e 3 com número de 22 px, alinhados pelo topo.
- Títulos sempre inteiros, nunca truncados:
  - se um título não cabe ao lado da pastilha (texto ampliado, 320 px), todos os cartões passam a ícone sobre o título (`.home.stack`);
  - "Gasto energético" aparece por extenso quando cabe; senão "GET", com a legenda "Gasto energético" (com o título completo, a legenda é "GET estimado").
- Suplementos e Medicamentos vazios: "0" e a legenda "<Módulo> cadastrados" (abrem o cadastro).
- Cabeçalho: BRICEÑO centralizado com filete de 28 px; luz curva atrás da metade direita, com opacidade de .7; "+" em cobre polido, 44 px, raio 13.

**Verificações executadas (Chromium/Playwright, emulação de iPhone).**
- Encaixe: no iPhone 13 (app instalado), a Home termina em 691 px, antes da barra (712). Sem estouros nem cortes em 320, 375, 390 e 430 px, nem com texto ampliado (21 e 23 px).
- Contraste: pior pixel do fundo real sob cada texto. O mínimo é 4,79:1 com dados e 4,52:1 no estado vazio; não há falhas.
- Linhas de base: alinhadas por par em 390, 375 e 320 px, e em 390 e 375 px com texto ampliado. Em 320 px com texto ampliado ficam diferenças de 2 px (pilares) e 21 px (Suplementos/Medicamentos, título hifenizado em duas linhas).
- Desempenho: abrir a Home cabe em um quadro (mediana de 14 ms contra 18 ms da v16, ambos presos ao quadro de 16 ms). O SVG soma 347 nós; sem animação contínua.
- Regressão: 27 testes unitários, e2e, navegação (inclui cartões vazios → cadastro), módulos, saudação, auditoria de telas e folhas, e alvos de toque. GET continua 2.730.

**Pendências.**
- Medir em iPhone real: fonte SF Pro, VoiceOver, vibração, fluidez e memória.
- A ainda é mais luminosa nos reflexos; aumentar mais derruba o contraste das legendas que alcançam a luz.
- Chevrons de A não foram reproduzidos: sem eles, "Medicamentos" cabe ao lado da pastilha.
- O traço vertical antes das legendas em A não foi reproduzido: inconsistente na própria referência.

## 27. Home v18 — Precision & Elegance

**Auditoria.** Medida em tela cheia com as áreas seguras reais (iPhone 13: 47 px no topo, 34 px na base), a v17 escondia 13 px da última linha sob a barra inferior; os testes anteriores não simulavam as áreas seguras e não pegaram o problema. Suplementos e Medicamentos ficavam mais altos que os pilares (132 × 124 px) por causa da legenda "Medicamentos cadastrados" em duas linhas.

**Alterações (só `fonte/app.html`; dados, persistência e cálculos intactos).**
- Cabeçalho sem a palavra BRICEÑO, sem o filete e sem a luz curva; ficam seletor, "+", saudação (hora local, atualiza a cada minuto e ao voltar ao app) e data, alinhados à margem de 16.
- Seletor e "+" com 44 px de altura, centrados na mesma linha; "+" em cobre acetinado mais escuro, com aro e sombra contidos (contraste do símbolo de 4,0:1 a 5,6:1).
- Dois grupos: pilares (2 × 2, linhas iguais, mínimo de 7,8rem) · linha de 1 px físico (escala por densidade de tela), cobre dessaturado com 34% de opacidade, alinhada à coluna de texto dos cartões, 16 px acima e abaixo · indicadores (2 × 2 compactos, os quatro com a mesma altura).
- Pilares nunca mais baixos que os indicadores: com texto ampliado, se uma legenda quebra, os pilares acompanham (+8 px).
- Suplementos e Medicamentos: "2 ativos" / "0 cadastrados" na mesma linha (pausados na legenda); sem hifenização.
- GET: título curto fixo, legenda "Gasto energético"; VoiceOver lê "Gasto energético total, GET"; o Perfil passa a mostrar "Gasto energético total (GET)".
- Exercício: "3 h/semana" (unidade encostada no número).
- Emocional: ícone de rosto sorridente (traço 1,9, como os demais) no lugar da flor de lótus; raio com traço 1,9.
- Barra inferior um pouco mais baixa (5/4 px de respiro, rótulo com entrelinha 1,2), área de toque das abas de 51 px.
- Legendas um pouco mais claras (86%; vazias 92%) para manter 4,5:1 sobre os reflexos nos cartões compactos.

**Verificações (Chromium/Playwright, áreas seguras simuladas).** Os oito cartões cabem sem rolar no iPhone 13/14 (folga de 26 px com dados, 21 px vazio), 12/13 mini (23), 16 Pro (44) e Pro Max (102). O SE e o texto ampliado rolam, e o último cartão fica inteiro acima da barra ao fim da rolagem. Nenhum texto passa da borda dos cartões (oito combinações de tela e texto). Os números ficam alinhados em cada par, inclusive com suplemento pausado, exceto 2 px nos pilares do SE com texto ampliado. Contraste no pior pixel ≥ 4,54:1 em 65 textos. Tempo até o quadro igual ou menor que o da v17. 27 testes de cálculo e e2e de navegação, módulos, saudação, painéis e áreas de toque sem erros.

**Pendências.** Conferir no iPhone real (SF Pro, VoiceOver, vibração, linha de 1 px físico). Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 28. Home v19 — Balanced Luxury

**Alterações (só `fonte/app.html`; dados, persistência e cálculos intactos).**
- Pilares 10% mais baixos: mínimo de 7rem (antes 7,8rem) e 8 px entre título e número; 133 → 120 px no iPhone 13 e 124 → 111 px nas telas de 375.
- Indicadores: 8 px entre título e número; 109 → 107 px. Os quatro têm a mesma altura e são sempre mais baixos ou iguais aos pilares.
- Suplementos e Medicamentos sem legenda: o número fica centrado no espaço abaixo do título.
- Divisória: 1 px físico em grafite quente (42% de opacidade), de margem a margem da grade, 20 px acima e abaixo, sem detalhe central.
- "GET" → "Gasto diário" (kcal/dia) com a legenda "Gasto energético total". O VoiceOver lê também "GET", e a sigla, o protocolo e as fórmulas seguem no Perfil.
- Cabeçalho 4 px mais próximo dos controles do topo.
- Palavras nunca partidas: sem hifenização automática. Quando uma palavra não cabe inteira em meia largura (tela estreita com texto muito ampliado), a grade passa a uma coluna.

**Verificações (Chromium/Playwright, áreas seguras simuladas).**
- Os oito cartões cabem sem rolar: iPhone 13/14 com folga de 52 px (49 px vazio), mini 50, 16 Pro 70, Pro Max 128.
- SE e texto ampliado rolam, com o último cartão inteiro acima da barra.
- Varredura de 40 combinações (320–430 pt × 17–26 px, com dados e vazio): nenhuma palavra partida, nenhum estouro, pilares ≥ indicadores.
- Baselines alinhadas em todos os pares lado a lado.
- Contraste no pior pixel ≥ 4,5:1 em 65 textos.
- 27 testes de cálculo e e2e de navegação, módulos, saudação, painéis e áreas de toque sem erros.

**Pendências.** Conferir no iPhone real (SF Pro, VoiceOver, vibração, linha de 1 px físico). Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 29. Home v20 — Ultimate Precision

**Alterações (só `fonte/app.html`; dados, persistência, cálculos e destinos de navegação intactos).**
- Ordem do grupo B: Gasto diário, Hidratação / Suplementos, Medicamentos.
- Gasto diário: legenda "Estimativa energética" (cálculo, não medida). O VoiceOver lê "Estimativa do gasto energético total, GET", e o toque abre o Perfil em "Gasto energético total (GET)" com protocolo e fórmulas.
- Espaço vertical adaptativo (`spread`):
  - A referência é a área entre o topo do conteúdo e a barra fixa, já descontadas as áreas seguras.
  - A sobra até um respiro de 24 px acima da barra é distribuída proporcionalmente, com limites: pilares +20, indicadores +10, entre linhas +4, divisória +10 acima e abaixo, cabeçalho +8.
  - Acima da soma dos limites, o restante fica no respiro.
  - Sem sobra, rolagem natural, e a margem mínima antes da barra é 16 px.
  - Recalcula com mudança de largura, altura, tamanho de texto e troca de membro.
  - A medição desconta o deslizamento de 4 px da animação de entrada.
- Signature divider: fio de 1 px físico em grafite quente, com as pontas esmaecidas, e um segmento cobre central de 44 px que ecoa o filete da aba ativa. Comparado lado a lado com a linha simples, foi escolhido.
- Materiais equilibrados por medição (L\*, croma, área clara):
  - Esmeralda e oliva com reflexo e base levemente mais contidos.
  - Bronze com ponto quente menos branco.
  - Ametista levemente dessaturada.
  - Safira da meia-noite com luz de canto um pouco maior.
  - L\* médio de 17,0–21,2 para 17,1–19,6; p95 de 35,8–43,6 para 37,1–40,5; área clara de 2,1–4,5% para 2,4–3,4%. A média geral caiu (18,85 → 18,4).
- Valor e unidade em texto corrido: espaço de 4 px, unidade por período encostada ("3 h/semana") com ponto de quebra. Se a unidade descer de linha, começa na coluna do número (antes ficava 4 px à esquerda). O valor é um bloco em linha, de modo que valores em duas linhas ("Mais ou menos") alinham pela última linha.
- O ajuste de títulos também observa a altura do título, para reagir a mudanças de tamanho de texto quando a altura do cartão está fixada pela distribuição.

**Verificações (Chromium/Playwright, áreas seguras simuladas).**
- Respiro de 24 px exatos acima da barra no iPhone 13/14 (com dados e vazio), mini e 16 Pro; 33 px no Pro Max (limites atingidos).
- Nenhuma rolagem à toa quando cabe. SE e texto ampliado rolam, com o último cartão inteiro acima da barra.
- Altura de 844 → 760 → 900 recalcula, e a troca de membro mantém o respiro.
- Nome extenso e valores longos ("15 h 30/semana", "Mais ou menos", "9 ativos / 3 pausados") sem cortes.
- 40 combinações de tela e texto sem palavra partida, estouro ou indicador mais alto que pilar.
- Baselines exatas em todos os pares lado a lado.
- Contraste no pior pixel ≥ 4,5:1 em 65 textos.
- Reduce Motion sem transição nem animação.
- Tempo até o quadro igual ou menor que o da v19.
- 27 testes de cálculo e e2e de navegação, módulos, saudação, painéis e áreas de toque sem erros.

**Pendências.** Conferir no iPhone real (SF Pro, VoiceOver, vibração, divisória em 1 px físico). Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 30. Home v21 — Beyond Luxury

**Causa do corte inferior (reproduzida).** A distribuição de espaço da v20 era calculada só quando mudavam a largura, o tamanho do texto ou a altura da janela. No iPhone, a área segura inferior (34 px) pode ser aplicada depois do primeiro desenho do app instalado. A barra crescia, a distribuição ficava com a medida antiga e a última linha ia 10 px para baixo da barra, sem rolagem para revelá-la. Simulado em teste: folga −10 px. O mesmo valia para a área segura superior aplicada depois.

**Correção (layout como um conjunto).**
- Um único cálculo (`fitTitles` + `spread`) mede, a cada mudança de geometria, a área entre o topo do conteúdo e a barra fixa.
- Observa a caixa externa da Home, da barra e da página, além de redimensionar, girar, voltar à página e carregar fontes.
- Uma assinatura da geometria evita passadas repetidas.
- A margem inferior do conteúdo é calculada da altura real da barra: rolando até o fim, o último cartão fica sempre 16 px acima dela.
- Distribuição em duas etapas:
  1. respiro entre grupos (divisórias até +16 acima e abaixo, cabeçalho até +12);
  2. só em telas altas, cartões (pilares até +8, indicadores até +4).
- Sobra além disso fica no respiro, com alvo de 24 px acima da barra.

**Arquitetura.** A · pilares 2 × 2 · Signature divider · B · Gasto diário + Hidratação · Signature divider · C · Suplementos + Medicamentos (altura de B). As duas divisórias são idênticas: 1 px físico, grafite quente com pontas esmaecidas e segmento cobre central.

**Proporções (grade de 4).**
- Entre cartões 12 (8 em telas estreitas); padding 12/14; pastilha 28.
- Número dos pilares 26 px; entrelinha 1 nos números e 1,25 nas legendas.
- Pilares de 125 → 108 px no iPhone 13 (−14%). Indicadores 100 px.
- Mais que isso exigiria números menores que 26 px ou encostar número e título.

**Outros ajustes.**
- "3 h/semana" com 2 px entre número e unidade.
- Reflexo dos cartões compactos um pouco mais atenuado na faixa da legenda (contraste mínimo de 4,25 → 5,04).
- Perfil: frase explicando que o GET é estimativa por equações de grupo, não medição.

**Verificações (Chromium/Playwright, áreas seguras simuladas).**
- Respiro de 24 px acima da barra no iPhone 13/14 (com dados e vazio), mini e 16 Pro; 32 px no Pro Max.
- Área segura inferior tardia, superior tardia e troca de fonte: 24 px, sem corte.
- SE, Safari com barras e texto ampliado rolam, com o último cartão 16 px acima da barra no fim.
- Nome extenso e valores longos sem cortes; troca de membro e mudança de altura recalculam.
- 40 combinações de tela e texto sem palavra partida nem estouro; baselines exatas nos pares.
- Contraste ≥ 5,04:1 em 65 textos; materiais com L\* p95 de 36,5 a 39,8.
- Reduce Motion sem animação.
- 27 testes de cálculo e e2e de navegação, módulos, saudação, painéis e áreas de toque sem erros.
- Tempo até o quadro: p90 de 20–22 ms (v20: 19–20); mediana 2–5 ms maior pela medição de geometria.

**Pendências.** Conferir no iPhone real a correção do corte (a causa foi reproduzida em simulação, não no aparelho), além de SF Pro, VoiceOver, vibração e divisórias em 1 px. Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 31. Home v22 — The Masterpiece (acabamento)

**Origem da área abaixo da navegação (medida no iPhone 13 em tela cheia).** Abaixo do rótulo das abas havia 43 px:
- 34 px são a área do indicador de início do iOS (`env(safe-area-inset-bottom)`). Pertence ao sistema e é preservada: conteúdo ali conflita com o gesto de voltar ao início, e capturas de tela não mostram o indicador, por isso parece vazio.
- 8 px eram do app: 4 px de padding inferior da aba e 4 px extras somados à área segura.

A barra tinha 95,6 px (a nativa tem cerca de 83). Correção: padding da barra 4 em cima e só a área segura embaixo; o filete da aba ativa fica dentro da aba, 4 px abaixo do rótulo. Barra de 95,6 → 91,6 px, devolvidos à composição. Nenhum outro elemento ocupa a área inferior.

**Geometria.**
- Tokens únicos em `.home` (`--hc-gap`, `--hc-pad`, `--hc-pv`, `--sp-head`, `--sp-div`, `--air`, `--air-min`); o código de distribuição lê `--air` e `--air-min`.
- Auditoria (mini, 13, Pro Max):
  - margens 16/16;
  - colunas idênticas;
  - quatro distâncias em torno das divisórias iguais (22 / 28 / 36 px);
  - divisórias com o mesmo comprimento e alinhamento;
  - ícones a 15/13 px do canto e centrados no título;
  - alturas idênticas por grupo.
- Corrigido: Sono × Emocional desalinhados em 1,1–1,7 px ("Bem" com entrelinha 1,08, números com 1). Todos os valores passam a usar entrelinha 1.

**Divisórias.** Comparadas lado a lado. Adotada a variante com transição de opacidade mais longa (22%), leve aquecimento central e segmento cobre de 32 px (antes 44), mais suave. Mesmos elementos, nada acrescentado.

**Reflexos.**
- Mesma linguagem (lâmina curva), incidência própria por material:

| Material | Incidência |
|---|---|
| Cobre e bronze | mantidos |
| Esmeralda | faixa íngreme colada à borda, saindo pelo alto |
| Ametista | arco baixo e difuso |
| Rubi | arco curto no canto superior direito |
| Safira azul | faixa quase reta e nítida |
| Peridoto | curva em S |
| Safira da meia-noite | lâmina baixa na borda |

- Cobre, bronze, esmeralda e safira levemente atenuados. Área clara total de 2,2–3,4% para 1,0–2,6%; picos (p99) mais próximos entre si.
- O reflexo do rubi foi recolhido ao canto depois de reprovar o contraste de "Muito bem" (1,95:1).
- Contraste mínimo de 5,04 para 5,98:1.

**Tipografia.** Espaço uniforme (~4 px) entre valor e unidade em todos os cartões ("1 h 30 /semana" não fica mais comprimido); se a unidade descer de linha, começa na coluna do número.

**Verificações (Chromium/Playwright, áreas seguras simuladas).**
- Respiro de 24 px acima da barra no iPhone 13/14 (com dados e vazio), mini e 16 Pro; 36 px no Pro Max.
- Área segura tardia (inferior e superior) e troca de fonte sem corte.
- SE, Safari e texto ampliado rolam, com o último cartão 16 px acima da barra.
- Nomes e valores longos sem corte.
- 40 combinações de tela e texto sem palavra partida nem estouro; baselines exatas em todos os pares.
- Contraste ≥ 5,98:1 em 65 textos.
- Reduce Motion sem animação.
- 27 testes de cálculo e e2e de navegação, troca de membro, módulos, saudação, painéis e áreas de toque sem erros.
- Tempo até o quadro: mediana cerca de 2 ms maior que a v21 (16,6–18,9 → 19,1–19,8 ms); p90 igual ou melhor (20,4–21 ms; v21 20–33).

**Pendências.** Conferir no iPhone real: corte, área inferior, SF Pro, VoiceOver, vibração, divisórias em 1 px. Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 32. Home v23 — Absolute Excellence (auditoria final)

**Espaço inferior (medido no iPhone 13 e no Pro Max em tela cheia).**
- Abaixo das abas sobram exatamente 34 px nos dois aparelhos: o padding inferior da barra é `env(safe-area-inset-bottom)` e nada mais. Nenhum elemento do app ocupa essa faixa, e não há espaço extra do app (os 8 px foram removidos na v22).
- É a área do indicador de início do iOS. Nas capturas simuladas o indicador não é desenhado, por isso a faixa parece vazia. Nas comparações desta versão ele aparece desenhado na posição do sistema (134 × 5 pt, a 8 pt da borda) para mostrar a ocupação real.
- Comportamento nativo preservado: nenhuma alteração de layout.

**Alterações.**
1. Divisórias: comparação A (atual) × B (centro mais presente). Adotada a B, com o fio aquecido ao centro (opacidade .44 → .58) e o segmento cobre mais firme (.78 → .96). Mesma geometria e elementos; nas extremidades nada muda. Na tela 3× a A quase desaparecia.
2. Exercício e Emocional:
   - O ponto quente (radial) e o traço principal estavam concentrados na borda direita e pareciam reflexo de lente.
   - Ponto quente de .62 → .34; traço de .26/.28 → .21 (parâmetro `hot` por material, padrão .62 nos demais).
   - Direção mantida. Pico (p99 L\*) da esmeralda de 57,1 → 53,9, do rubi de 50,0 → 46,1.
   - Os outros seis materiais não foram alterados.

**Sem alteração (auditados e mantidos).**
- Geometria (mini, 13, Pro Max): margens 16/16; colunas iguais; alturas idênticas por grupo; quatro distâncias em torno das divisórias iguais (22 / 28 / 36 px); ícones alinhados; baselines exatas.
- Tipografia: espaço uniforme antes das unidades, números tabulares, sem quebra.
- Estados vazios: mensagens curtas ("Não registrado", "Sem plano", "Faltam dados"); só Suplementos e Medicamentos mostram 0, que é a contagem real de cadastros, não um dado medido.

**Verificações (Chromium/Playwright, áreas seguras simuladas).**
- Estresse, só com dados de teste: 10.495 kcal no plano, 12 h/semana, 4.250 kcal/dia, 12 suplementos e 15 medicamentos ativos, "Muito bem". Sem corte, palavra partida, estouro ou unidade descendo de linha no mini, no 13 e no Pro Max.
- Perfil vazio nos três tamanhos sem problemas.
- 40 combinações de tela e texto; área segura tardia; troca de fonte e de membro; mudança de altura.
- SE, Safari e texto ampliado rolam, com o último cartão 16 px acima da barra.
- Contraste ≥ 5,98:1 em 65 textos.
- Reduce Motion sem animação.
- 27 testes de cálculo e e2e de navegação, módulos, saudação, painéis e áreas de toque sem erros.

**Desempenho.**
- A diferença de ~2 ms na mediana, registrada na v22, foi investigada: trocar os reflexos pelos da v21 não mudou nada, e a métrica (toque → próximo quadro) varia em degraus de quadro.
- Medindo só o processamento (render + layout, sem esperar o quadro), v21, v22 e v23 têm o mesmo custo: mediana de 10,8–10,9 ms, p90 de 16,6–17,5 ms. Não há regressão.

**Pendências.** Conferir no iPhone real (SF Pro, VoiceOver, vibração, divisórias em 1 px físico). Campo do nome da refeição com 40 px de altura. Decisão sobre o protocolo "Média".

## 33. Home v24 — Final Release e Design System

**Auditoria final (sem mudança visual).**
- Espaço inferior: 34 px abaixo das abas, iguais a `env(safe-area-inset-bottom)` (indicador de início do iOS). Nenhum espaço ou elemento do app ali.
- Funcional, por roteiro automatizado:
  - o "+" abre "Registrar", e o registro emocional por ele atualiza o cartão;
  - o valor persiste após recarregar;
  - o seletor troca para outro membro com os dados dele e volta;
  - o toque no cartão dispara a resposta tátil;
  - o estado pressionado está presente;
  - a árvore de acessibilidade está completa, na ordem visual, com divisórias e reflexos ocultos.
- Estresse (dados de teste), estados vazios, 40 combinações de tela e texto, áreas seguras tardias, contraste ≥ 5,98:1, 27 testes de cálculo e e2e: sem falhas.
- Custo de processamento igual ao das versões anteriores: mediana de 11 ms.

**Defeitos encontrados.** Nenhum reproduzível na Home. Observações fora do escopo: as folhas não fecham com Esc; tamanhos de texto acima de 24 px ficam no teto.

**Design system (refatoração sem mudança de pixel).**
- Tokens oficiais em `:root`:
  - oito materiais (`--dj-*` e `--dj-*-deep`);
  - sinal cobre;
  - fio e segmento das divisórias;
  - raios de cartão, pastilha e ferramenta.
- Componentes reutilizáveis `jewelCard(o)` e `jewelDivider()` / `.dj-divider`. Funcionam fora da Home, com padding e raio padrão.
- Documentação em `DESIGN-SYSTEM.md`.
- Comparação pixel a pixel antes × depois em cinco telas (Home com dados no 13, vazia no mini, Pro Max, Saúde, Perfil): idênticas.

## 34. v25 — Faixa preta abaixo da barra no iPhone real (corrigida)

**Evidência.** Captura do iPhone 13 (1170 × 2532) com o app instalado, medida pixel a pixel:
- Topo da barra a 706 pt; abas terminam a 763 pt; 81 pt pretos até o fim da tela (34 pt são do indicador de início).
- Na simulação correta, a barra fica a 752 pt e sobram só os 34 pt do sistema.
- A diferença, 46–47 pt, é igual à área segura superior (faixa do relógio).

**Causa.** No app instalado, o iOS informa à página a altura da tela sem a faixa do relógio (797 em vez de 844 pt), embora desenhe o app na tela inteira. A cor da faixa vazia é a do fundo da página, o que é coerente com isso. Elementos fixos na base (`bottom: 0`) ficam presos a essa base falsa.

**Reprodução.** Simulação com tela física de 844 e altura informada de 797, em modo app instalado: barra a 705,4 pt e 81 pt abaixo das abas. São os mesmos números da captura real.

**Correção.**
- `fixViewportGap()` mede tela física − altura informada e grava `--vgap`.
- Só age com a assinatura exata do defeito: app instalado, retrato e diferença igual (±6) à área segura superior. Em qualquer outro caso o valor é 0.
- Barra inferior, folhas, fundo escurecido das folhas e aviso (toast) descem por `--vgap`.
- A distribuição da Home é refeita quando o valor muda.

**Verificação.**
- Com o defeito simulado: barra a 752,4 pt, 34 pt abaixo das abas e respiro de 24 pt, iguais a um iPhone sem o defeito.
- Folha aberta pelo "+" encostada na base, com o fundo escurecido até o fim da tela.
- Texto ampliado rola até 16 pt acima da barra.
- Safari (navegador): sem mudança.
- Sem o defeito: capturas idênticas pixel a pixel em cinco telas.
- 27 testes de cálculo, e2e, palavras, bordas e área segura tardia sem falhas.

**Pendência.** Confirmar no iPhone. A simulação não reproduz a pintura fora da altura informada; o fundo da faixa vazia indica que o app é desenhado ali, mas só o aparelho confirma.

## 35. v26 — Barra inferior no iPhone com o defeito de altura (correção definitiva)

**Evidência.**
- Segunda captura real, após a v25: as abas apareceram cortadas exatamente a 797 pt.
- Ou seja, o iOS **não desenha** nada abaixo da altura que informa à página. Descer a barra para 844 (v25) a colocou parcialmente fora da área desenhável.
- A faixa abaixo de 797 pt é do sistema e é nela que fica o indicador de início.

**Correção.**
- Desfeito o deslocamento para baixo.
- Nova área segura inferior efetiva: `--sab = max(0, env(safe-area-inset-bottom) − --vgap)`.
- Com o defeito, `--sab` = 0: o indicador de início já está fora da área do app, e a barra se apoia na borda desenhável sem reservar os 34 pt duplicados.
- Sem o defeito, `--sab` = `env()`, como antes.
- Todos os usos de `env(safe-area-inset-bottom)` passaram a `var(--sab)`: barra, folhas, barra de confirmação, aviso, margem do conteúdo e padding da página no `build.sh`.

**Verificação (simulação do defeito: área do app 797, tela 844).**
- Barra de 739,4 a 797 pt; abas e filete inteiros dentro da área do app; respiro de 24 pt acima da barra.
- Folhas terminam a 797; texto ampliado rola até 16 pt acima da barra.
- iPhone sem defeito e Safari: capturas idênticas pixel a pixel em cinco telas.
- 27 testes de cálculo e e2e sem erros.

**Pendência.** Confirmar no iPhone. O espaço sob as abas nesse aparelho passa a ser 6 pt do app mais 47 pt do sistema. Ele não pode ser menor, porque o app não desenha nessa faixa.

## 36. v27 — Barra inferior global, espaço final das telas e atualização imediata

**Diagnóstico.**
- As capturas desta rodada não chegaram. A análise usa as duas capturas reais anteriores (v24 e v25) e simulações com a geometria medida do aparelho: tela de 844 pt, área desenhável de 797 pt.
- O corte dos rótulos é o da v25: a barra foi deslocada para baixo da área desenhável.
- A v26 já corrigia isso em todas as abas, porque a barra é um único componente (`#tabbar` / `.tabbar`) compartilhado pelas quatro.
- Causa provável de a correção não ter aparecido: o GitHub Pages deixa o aparelho reutilizar a página por até 10 min, e o app instalado pode abrir a versão anterior logo após a publicação.

**Correções.**
1. Atualização: a página passa a ser buscada sem o cache HTTP (`fetch(..., {cache: "no-store"})` no `sw.js`). Reabrir o app traz a versão publicada; sem internet, abre a última guardada.
2. Compensação duplicada removida: `.app` somava a área segura inferior além do padding da página (`:root`). Ao fim da rolagem das abas internas ficavam 62 pt acima da barra em vez de 28. Agora são 28 pt em todos os aparelhos, com ou sem o defeito.

**Safe Areas (modelo final).**
- `--sab` = `max(0, env(safe-area-inset-bottom) − --vgap)` é a única área segura inferior usada: padding da barra, folhas, barra de confirmação, aviso e padding da página.
- Com o defeito (`--vgap` = 47), o indicador de início fica fora da área do app, então `--sab` = 0. A barra se apoia na borda desenhável e os rótulos terminam a 790 pt de 797.
- Sem o defeito, a barra tem 34 pt de área segura sob os rótulos, como antes.
- A margem final da Home vem da altura real da barra (`--home-pb`). Nas outras telas é a altura da barra + 28.

**Verificação (simulação; 0 falhas em 40 combinações).**
- Hoje, Nutrição, Saúde e Perfil × iPhone 13, mini e Pro Max × com e sem o defeito × texto 17 e 21 px.
- Ícones, rótulos e filete inteiros dentro da área desenhável; área de toque das abas ≥ 52 pt.
- Fim de cada tela acima da barra (24–29 pt).
- Troca entre abas; folha abre pelo "+" e fecha tocando fora.

**Geometria da Home.**
- Sem o defeito: idêntica à aprovada, pixel a pixel.
- No iPhone com defeito, data → cartões 19,7 pt (aprovada 21,8) e divisórias 25,3 pt (aprovada 28), pela mesma distribuição. Há 13 pt a menos de área desenhável; cartões inalterados.

## 37. v28 — Home estável em todas as navegações

**Sintoma relatado.** A Home tinha uma geometria ao abrir o app e outra, mais compacta, depois de ir à Nutrição e voltar. As capturas não chegaram; a causa foi encontrada no código e reproduzida.

**Causa.** Havia duas fontes de medida com momentos diferentes:
- A compensação de altura do iOS (`--vgap`) era medida só ao abrir e em eventos de redimensionar.
- A distribuição da Home era recalculada a cada visita, pela posição atual da barra.

O iOS muda a altura informada logo depois de abrir o app instalado sem disparar evento. Na abertura, a Home era distribuída para 844 pt: a última linha terminava a 728 pt, sob a barra (705 pt). Na volta, era redistribuída com a barra na posição nova, porém com `--vgap` congelado em 0: composição compacta, com a faixa preta de 81 pt sob as abas de volta.

**Reprodução.** Tela física de 844 pt; app abre com 844 e passa a 797 sem evento. Na v27, a Home inicial difere da Home após Nutrição, Saúde, Perfil e segundo plano. Se o app já abre com 797, fica estável.

**Correção (só `fonte/app.html`).**
- `measureViewport()` é a fonte única da altura útil, medida no início de toda passada de layout (`fitTitles`), antes do primeiro desenho e em todas as abas. Nenhuma medida anterior é reaproveitada.
- `syncLayout()` refaz o layout só se a altura útil ou a assinatura da geometria mudou.
- `settleLayout()` acompanha a geometria quadro a quadro por 2,5 s ao abrir, ao voltar do segundo plano e em redimensionar, girar, foco e mudança do visualViewport, porque o iOS muda a altura sem avisar.
- O redimensionamento passou a usar o mesmo caminho. A exclusão "digitando" foi removida da medição: a altura informada não muda com o teclado no iOS.

**Verificação.**
- Estabilidade (iPhone 13 e Pro Max, abrindo com a altura cheia e reduzindo sem evento, ou já abrindo reduzida): Home idêntica ao abrir, ao voltar de Nutrição, Saúde e Perfil e ao voltar do segundo plano.
- Os dois casos convergem para a mesma geometria: barra a 739,4, rótulos a 790,4 de 797, cartões 108,3/100,3.
- Quatro abas × três iPhones × com e sem defeito × texto 17/21 px: 0 falhas.
- iPhones sem defeito: capturas idênticas pixel a pixel.
- 27 testes de cálculo, e2e, palavras, bordas, área segura tardia, registro, persistência e seletor sem falhas.
- Processamento ~11 ms (igual).

**Limitação.** A simulação reproduz a mudança de altura sem evento, mas não o iOS real. Se o aparelho mudar a altura mais de 2,5 s depois de abrir ou voltar sem nenhum evento, a correção vem na próxima passada de layout: qualquer troca de aba ou atualização da Home.

## 38. v29 — Design System aplicado a Nutrição, Saúde e Perfil

**Auditoria.** As três telas usavam superfícies genéricas (`--surface`), sobrepostas em camadas de versões anteriores, sem relação material com a Home. Componentes próprios dessas telas: `.panel`, `.seg`, `.sumcard`, `.goalcard`, `.meals/.meal`, `.hrow`, `.glist/.grow`, `.idc`, `.prows/.prow`. Nenhum é usado na Home.

**Design System (CSS, bloco final de `fonte/app.html`; nenhuma mudança de JS, dados ou cálculos).**
- Três materiais:
  - A · Signature Jewelry, só na Home;
  - B · Precision Glass, `.dj-glass` com `--tint`;
  - C · Quiet Luxury, `.dj-quiet`.
- Tokens de superfície, borda, separador, pastilha, raio e papéis tipográficos.
- Segmented control premium.
- Pastilhas de ícone padronizadas.
- Microinterações de toque (escala/brilho), respeitando Reduce Motion.

**Nutrição.**
- Resumo em Material B cobre, com divisórias finas e Fibras integradas (rótulo na cor da fibra, como os macros).
- Objetivo em Material C, com alvo em cobre e edição sempre visível.
- Refeições como lista Quiet Luxury contínua, com calorias alinhadas à direita (largura mínima) e toque com retorno.
- "Adicionar refeição" com aro cobre fino.

**Saúde.**
- Indicadores em Material B, com o tom do material da Home de cada módulo e pastilha-joia.
- Listas em Material C.
- Suplementos em peridoto e medicamentos em safira da meia-noite, as mesmas cores da Home (antes, dourado e rosa).

**Perfil.**
- Identificação em Material B, com monograma de aro cobre.
- Grupos em Material C com separadores finos; ícones neutros e cobre só no alerta de backup.

**Precisão científica (verificada, sem alteração).**
- Percentuais = energia de cada macro pelos fatores de Atwater (4/4/9) sobre a soma dos macros, arredondados um a um. Podem somar 101%.
- O total em kcal vem da TACO (fatores próprios de cada alimento): 875 kcal contra ~860 kcal pela soma dos macros. Correto e mantido.

**Corrigido.** Campo do nome da refeição de 40 → 44 pt (área de toque). Última pendência de toque do app.

**Verificação.**
- Home idêntica pixel a pixel (13, mini vazio, Pro Max) e estável em navegação.
- Quatro abas × três iPhones × com e sem o defeito de altura × texto 17/21 px: 0 falhas de barra ou conteúdo.
- Sem cortes nem estouros em Nutrição (fechada e aberta), Alimentos, Saúde, Sono, Perfil e Perfil com energia aberta.
- 13 folhas sem cortes; áreas de toque sem pendências; 40 combinações de texto sem palavra partida na Home.
- Contraste medido no pior pixel do fundo real: Nutrição ≥ 4,99, Saúde ≥ 5,54, Perfil ≥ 5,24 (71 textos).
- 27 testes de cálculo e e2e (dados preservados, GET 2730, navegação, módulos, registro, persistência, seletor, saudação) sem erros.

**Texto (redução de poluição, sem perda de informação).**
- Saúde → Prioridades: "O que você quer acompanhar ou melhorar" → "O que você quer acompanhar" (mesma frase do Perfil; a folha mantém a explicação completa).
- Perfil → Backup: "Só neste aparelho · nenhum backup ainda" → "Só neste aparelho · sem backup" (uma linha, mesmo estado real).

**Desempenho (processamento ao abrir a aba, mediana).** Nutrição 7,4 → 9,4 ms; Saúde 6,7 → 7,2 ms; Perfil 7,5 → 7,2 ms. Tudo dentro de um quadro (16,7 ms); a Home não mudou.

**Pendências.**
- Conferir no iPhone real (SF Pro, VoiceOver em voz, vibração).
- As subabas Exercício, Sono e Emocional de Saúde e as folhas receberam só o Material C (via `.panel`) e o segmented control; não foram redesenhadas.

## 39. v30 — Nutrição e Perfil: evolução de composição (não só acabamento)

**Diagnóstico (Home × Nutrição/Perfil, capturas próprias; as do usuário não chegaram).**
1. Na Home a informação tem um núcleo visual (o número no material); em Nutrição, o resumo era uma grade de tabela, e no Perfil, só listas.
2. Hierarquia: Home tem rótulo · número · legenda; Perfil misturava resumo e valor numa frase que quebrava ("Hipertrofia · meta 2.600 kcal").
3. Seções: Home organiza por divisórias finas; as outras telas usavam títulos grandes que competiam com o conteúdo.
4. Energias: plano, meta e GET apareciam em lugares diferentes, sem relação explícita.
5. Controles: o botão de compartilhar não seguia a família do seletor e do "+".

**Mudanças.**
- **Nutrição:**
  - painel-instrumento com anel de energia (total no centro) e legenda 2 × 2 com fibras integradas;
  - quadro "Meta diária · No plano de hoje · Gasto estimado";
  - refeições com coluna de horário;
  - cabeçalho de seção em versalete com fio;
  - compartilhar na família dos controles.
- **Perfil:**
  - linhas com valor-chave à direita (78 kg · 178 cm, 2.600 kcal, 2 perfis, 2.730 kcal, 2,7 L/dia, 3 itens, "Sem backup");
  - resumos curtos;
  - identificação maior, com nome em destaque;
  - seções em versalete com fio.
- O cabeçalho de seção vale também em Saúde, por consistência.

**Auditoria científica (2.472 kcal × 284/148/89 g, fibras 52 g).**
- O total é a soma da energia declarada de cada alimento (TACO ou rótulo), não 4/4/9.
- A TACO calcula a energia com fatores específicos por alimento, e seu carboidrato é "total por diferença", com a fibra incluída.
- Nos 559 alimentos do app, energia TACO ÷ 4/4/9 tem mediana de 0,989 (80% entre 0,888 e 1,044).
- Para a captura: 4/4/9 com carboidrato total dá 2.529; com fibra a 2 kcal/g, 2.425. O exibido, 2.472, fica entre os dois.
- A diferença de −57 kcal (−2,3%) é esperada, não é inconsistência. Nenhum valor foi alterado.
- Os percentuais são da energia dos macronutrientes (4/4/9), agora explícito no painel.

**Verificação.**
- Home idêntica pixel a pixel e estável na navegação.
- Quatro abas × três iPhones × com e sem defeito de altura × texto 17/21: 0 falhas.
- Nutrição e Perfil em 320/375/390/430 pt × texto 17/21/24 px: sem estouro, sem texto cortado, sem palavra partida (antes desta rodada, 5 falhas de nome de refeição cortado em 320 pt; agora 0).
- Folhas e áreas de toque sem pendências.
- Contraste ≥ 5,31:1 em 83 textos.
- 27 testes de cálculo e e2e sem erros.
- Processamento ao abrir a aba: Nutrição 8,0 → 9,0 ms; Saúde 7,2 → 7,6; Perfil 6,7 → 8,7 (dentro de um quadro).

## 40. v31 — Home com agenda, Saúde como central de cuidados, Consultas e Exames

**Home (oito cartões, quatro linhas de dois, três grupos).**
- A: Nutrição · Exercício · Sono · Emocional (sem mudança).
- B: Hidratação (sem mudança) · **Em uso**, um cartão para suplementos e medicamentos ("2 suplementos / 0 medicamentos").
- C: **Consultas** (âmbar) · **Exames** (safira da meia-noite), cada um com data e horário do próximo compromisso e a identificação em uma linha.
- O GET saiu só da Home: cálculo, protocolo e meta seguem em Perfil → Planejamento.
- Perfis de menores de 18 anos continuam sem o cartão Emocional (regra anterior), e por isso têm sete cartões.

**Contagem de suplementos e medicamentos.** São contados os itens ativos (não pausados), um por nome. A mesma regra vale na Home, na Saúde e no módulo.

**Dados (versão 4 do armazenamento, com cópia automática antes da migração).**
- `care.appts`: consultas com especialidade, profissional, data, hora, fuso, modalidade, local, endereço ou acesso, observações e situação (agendada, realizada ou cancelada).
- `care.exams`: exames com situação (solicitado, agendado, realizado ou cancelado), data e hora quando houver, local, solicitante, tipo, intervalo combinado, resultado em texto, observações e documentos.
  - Migração sem perda: exame com data → "realizado" naquela data; sem data → "solicitado". Intervalo, resultado e observações seguem iguais.
- `care.labs`: resultados numéricos com marcador agrupado, nome como informado, valor, texto original, unidade, data da coleta, referência mínima e máxima, laboratório e exame vinculado.
- Documentos (PDF ou imagem, até 15 MB) ficam no banco local `briceno-docs`, fora do backup em arquivo, e o app avisa isso.

**Saúde.**
- O resumo ganhou a seção "Cuidados", com Consultas, Exames, Suplementos e medicamentos e Prioridades.
- Cada módulo abre em página própria ("‹ Saúde"):
  - **Consultas:** próxima em destaque; "Aconteceu?" para as que passaram sem registro; Próximas, Histórico e Canceladas; busca a partir de cinco registros; histórico anual por mês com seleção de ano.
  - **Exames:** próximo em destaque; pendentes, agendados, realizados e cancelados; ficha com resultados e documentos; evolução por marcador (tudo ou por ano); exames realizados por ano.
  - **Suplementos e medicamentos:** duas seções, com as funções anteriores preservadas.
- O "+" do topo também cadastra consulta e exame.
- Cada cadastro pode ser atribuído a outro perfil da família. Ao mover um exame, os resultados vinculados vão junto.

**Não implementado (por limitação real ou decisão).**
- **Lembretes:** um app web instalado no iPhone não agenda notificações locais confiáveis sem servidor de push.
- **Exportação para o Calendário:** não foi incluída porque não pôde ser testada em aparelho real.
- **Leitura automática:** sem OCR de laudos, sem interpretação e sem integração com laboratórios.

**Correção encontrada pelos testes.** Folhas com conteúdo opcional (como "novo suplemento" desde a v30) mostravam o texto "null" no fim. O `sheet()` agora ignora conteúdo vazio.

**Verificação (navegador simulando iPhones; nada em aparelho real).**
- 32 testes de cálculo, 5 deles novos: fuso e horário de verão, próximo compromisso, contagem mensal, marcadores e conversões, série do gráfico.
- **Fluxos:**
  - migração de exames antigos e de backup v3;
  - cadastro pela Home e pelo "+";
  - Home atualizada na hora e quando o compromisso passa;
  - confirmar realizada;
  - mover para outro perfil;
  - excluir com resultados vinculados, com "Desfazer";
  - anexar, abrir e apagar documento;
  - persistência após recarregar.
- **Geometria da Home** igual à da v30 (108/100 pt por linha no iPhone 13, folga de 24 pt), estável na navegação, e a barra inferior sem falhas em todas as abas.
- 144 verificações de telas e folhas em 320/375/390/430 pt × texto 17/21/24: 0 falhas.
- Contraste ≥ 4,97:1, medido sem o halo de leitura, em 247 textos de 9 telas.

## 41. v32 — Prioridades, Agenda de Saúde, Procedimentos, Indicadores e lembretes pelo Calendário

**Home (oito cartões, ordem fixa).** Nutrição · Exercício / Sono · Emocional / Hidratação · Suplementos e Medicamentos / **Prioridades** · **Agenda de Saúde**.
- **Exercício:** sem registro mostra "Sem registros · Nesta semana" (nunca conclui que a pessoa não se exercitou); com registro, "2 h 30 · Nesta semana". Sono e Emocional também dizem o período.
- **Suplementos e Medicamentos:** título completo (em duas linhas quando não cabe em uma) e "2 supl. · 1 med."; o VoiceOver lê por extenso. Saiu o título "Em uso".
- **Prioridades:** "3 ativas" e a prioridade principal (ou "Em acompanhamento"); vazio: "Nenhuma definida · Escolha o que acompanhar".
- **Agenda de Saúde:** próximo compromisso válido de qualquer tipo (consulta, exame ou procedimento), identificado pela finalidade. Vazio: "Nenhum agendado · Adicionar compromisso". Compromissos no mesmo horário: o cartão mostra um (ordem estável) e o VoiceOver e a Agenda mostram todos.
- **Geometria:** igual à da v31 no iPhone 13, 16 Pro e mini (folga de 23–24 pt, sem rolagem). O SE de 1ª geração continua rolando, como antes.

**Dados (versão 5, com cópia automática `antes-da-v5`).**
- `care.procs`: procedimentos (nome, local do corpo, lado, profissional, data, hora, fuso, clínica, endereço, observações, situação agendado/realizado/cancelado, documentos, lembretes).
- `care.goals`: prioridades com nome, descrição, situação (ativa, concluída, arquivada), ordem, principal, destaque, indicadores, metas e histórico. As frases antigas viraram prioridades ativas, na mesma ordem.
- `logs.meas`: medições (peso, cintura, gordura corporal com método, pressão arterial, frequência cardíaca de repouso, dor 0–10). `logs.water`: água registrada (opcional, em mL).
- Consultas ganharam motivo, documentos e lembretes; exames ganharam data do resultado e lembretes; itens de uso ganharam horários, início, término e componentes.
- "Fórmula manipulada" deixou de ser categoria: virou característica do item. As fórmulas antigas continuam em Suplementos (como eram contadas) e o app pede para conferir a categoria.
- Preferência por perfil: título dos lembretes discreto (padrão) ou com detalhes.

**Regras.**
- **Ativo** (suplementos e medicamentos) = não pausado, já iniciado e não encerrado. Uma fórmula conta uma vez.
- **Indicadores** usam os registros existentes, sem cópia: sono (duração, qualidade), exercício (minutos e dias por semana, só semanas com registro), estado emocional, água, refeições marcadas, medições e resultados de exames. Nada é estimado ou interpolado; o gráfico usa datas reais; a comparação mostra primeiro e último valor do período, sem dizer se melhorou ou piorou. Gordura corporal: um método por gráfico.
- **Peso:** uma nova medição pode atualizar o peso dos Dados corporais (GET e hidratação) só com a caixa marcada, visível antes de salvar.
- **Prioridades:** sem limite; acima de cinco ativas o app sugere enxugar. Metas são da pessoa ("até", "pelo menos") e aparecem como linha tracejada no gráfico. Sem pontuação, porcentagem ou classificação de risco.

**Lembretes.** O app não envia notificações (um app web instalado no iPhone não agenda notificações confiáveis sem servidor). Os lembretes escolhidos (7 dias, 1 dia, 2 horas, 30 minutos, horário personalizado; vários por compromisso) vão num arquivo de calendário `.ics` com os avisos embutidos, entregue pela tela de compartilhar do sistema (ou baixado). Quem avisa é o app Calendário. Água e itens de uso: eventos repetidos nos horários escolhidos. Se o compromisso mudar depois de enviado, o app avisa para enviar de novo; se for cancelado ou excluído, lembra de apagar no Calendário. **A entrega no iPhone real não foi testada.**

**Privacidade na família.** Cada perfil tem as próprias prioridades, agenda, medições e preferências. Saíram as sugestões de suplementos vindas de outro perfil. O app não tem bloqueio por perfil: quem usa o aparelho vê todos os perfis.

**Não implementado.** Notificações próprias do app; sincronização com o Calendário (o envio é manual, por arquivo); glicemia capilar (a de laboratório e a HbA1c já entram); integração com Apple Saúde; bloqueio por perfil.

## 42. v33 — Navegação padronizada e Agenda de Saúde como tela principal

**Correção principal.** O cartão Agenda de Saúde da Home abria a janela "Novo compromisso" quando não havia compromisso futuro. Agora abre sempre a tela Agenda de Saúde; a escolha Consulta · Exame · Procedimento aparece só pelo "+" do cabeçalho. O cartão continua mostrando o próximo compromisso futuro de qualquer tipo.

**Agenda de Saúde.** Próximo compromisso em destaque; "Aconteceu?" para os que passaram sem confirmação (Reagendar · Cancelado · Realizado); filtros Todos · Consultas · Exames · Procedimentos; próximos em ordem cronológica, por mês; exames solicitados sem data; os três mais recentes do histórico e "Ver histórico completo", que abre a tela Histórico (realizados e cancelados, por mês, com os mesmos filtros e "‹ Agenda de Saúde"). Tocar num compromisso abre os detalhes, com Editar, Reagendar, Cancelar/Reativar, documentos, Calendário e Excluir. Exames mantêm a folha própria, com resultados.

**Padrão em todas as áreas** (DESIGN-SYSTEM §3.10):
- Home: nenhum cartão abre formulário. Exercício, Sono e Emocional sem registro levam à tela do pilar, que explica e aponta o "+".
- Um "+" por tela, no canto superior direito; nos módulos com cadastro próprio ele registra naquele módulo (antes havia dois "+" lado a lado).
- Exercício, Sono, Emocional e Água: tocar num registro abre a edição (antes só havia um "x" para apagar); Excluir fica dentro dela, com Desfazer. Registros editados não são duplicados.
- Hidratação ganhou o "+" (volume em mL e horário) e os registros de hoje são editáveis. "Água" no "+" geral abre o registro direto.
- Consultas e Procedimentos: linhas e destaque abrem os detalhes (antes abriam direto a edição); "Aconteceu?" ganhou Reagendar.
- Voltar leva à tela de origem, com o nome dela (Hoje, Saúde, Perfil, Agenda de Saúde, Prioridades…).

**Sem mudança.** Dados (continua v5, sem migração), cálculos, metas, GET e visual dos cartões da Home. Nutrição e Perfil não foram alterados: o plano alimentar tem edição em linha própria (tocar na refeição abre, o alimento é editado no lugar) e as linhas do Perfil abrem a configuração correspondente; o caminho de volta a partir do Perfil passou a ser respeitado.

## 43. v34 — Agenda de Saúde no padrão do Sono

**Objetivo.** Ver, com o mínimo de toques e de rolagem, quantos compromissos foram realizados em cada mês e quais foram.

**Estrutura da tela** (uma tela só, nesta ordem):
1. Cabeçalho "Agenda de Saúde" com o "+" (abre Consulta · Exame · Procedimento, sem mudança).
2. Categorias: Resumo · Consultas · Exames · Procedimentos. Trocar de categoria atualiza tudo e mantém o mês e o ano.
3. Painel do ano (mesmo cartão e mesmas barras do Sono, com 12 meses): total do ano, "‹ ano ›", barras tocáveis, "Outubro · 3 consultas".
4. Próximos: o compromisso futuro mais próximo da categoria (e o "a confirmar" mais recente, quando existir); "Ver todos" abre a lista completa (a confirmar, agendados por mês, exames solicitados sem data).
5. Histórico · mês escolhido: até 3, do mais recente; "Ver todos" abre o histórico completo já filtrado por mês, ano e categoria, com opção de ampliar para o ano, todos os anos e incluir cancelados.

**Regra de contagem.** Conta só o que foi confirmado como realizado. Um compromisso que passou da data sem confirmação fica "A confirmar" e não conta (o app não presume que aconteceu). Cancelados não contam. Um exame conta uma vez, com seus resultados dentro. A mesma função alimenta barra, quantidade e lista.

**Estado.** A entrada pela Home, pela Saúde ou pelo Perfil abre em Resumo, no ano e mês atuais. Detalhes e listas "Ver todos" voltam ao mesmo contexto (categoria, mês, ano e posição). Mês vazio: não muda sozinho; oferece "Último mês com registros".

**Saiu da tela principal** (continua no app): o bloco "Aconteceu?" (os passados sem confirmação aparecem em Próximos como "A confirmar", e os detalhes têm Reagendar · Cancelado · Realizado) e "Por tipo" (Consultas, Exames e Procedimentos continuam em Saúde → Registros por tipo).

**Sem mudança.** Dados (v5, sem migração), formulários, detalhes, cartão da Home, tela Sono e demais módulos.

**Acessibilidade.** Cada barra é um botão com rótulo completo ("Outubro de 2026: 5 compromissos realizados") e estado selecionado; a quantidade do mês é anunciada. As barras têm 25 pt de largura (12 meses lado a lado não cabem com 44 pt) e 84 pt de altura.

## 44. v35 — Home Premium definitiva (quarta versão aprovada)

**Objetivo.** Reproduzir na Home a imagem aprovada (quarta versão), mantendo todos os dados, cartões, toques e fluxos.

**O que mudou (só aparência e espaçamento da Home, mais o seletor de perfil e o "+" do topo):**
- **Material dos oito cartões.** Base escura da cor do módulo, luz de canto no alto à esquerda, brilho largo embaixo à direita, lâmina de luz curva que sobe da base até a borda direita e aro de 1 px aceso em toda a volta. As cores foram medidas na imagem aprovada, ponto a ponto, e aproximadas.
- **Linhas.** As quatro linhas têm a mesma altura e o mesmo intervalo (14). As duas divisórias continuam, mais discretas. A sobra de tela fica abaixo da última linha, como na imagem.
- **Tipografia.** Mesmos tamanhos, com pesos maiores: valor em negrito, título 640, "Nenhum agendado" em negrito.
- **Cabeçalho.** O seletor de perfil e o "+" ganharam o acabamento cobre da imagem e ficaram 2 pt maiores (46). A data passou a um bege quente.
- **Prioridades.** "Em acompanhamento" quebra a linha quando não cabe, em vez de terminar em "…". Só o nome da prioridade principal, que é digitado pelo usuário, pode receber reticências.
- **Correção.** Uma regra genérica de estado vazio (`.empty b`) acrescentava 6 pt sob "Nenhum agendado"; ela não vale mais nos cartões.

**Sem mudança.** Dados (v5, sem migração), ordem e conteúdo dos cartões, o que cada cartão abre, barra inferior, saudação, demais telas e cálculos.

**Contraste.** No teste mais severo (fundo medido sem o texto e sem o halo de leitura), nenhum texto da Home ficou abaixo de 4,5:1. Para isso, a luz foi recolhida da faixa do texto e a lâmina de Hidratação e Prioridades começa mais à direita que na imagem.

**Diferenças conhecidas em relação à imagem:**
- O seletor e os cartões ficam cerca de 10 a 15 pt mais baixos: o app respeita a área segura do relógio, e a imagem não.
- No teste a fonte é Inter (sem SF Pro), um pouco mais larga.
- Os números de exemplo da imagem (2.472 kcal, 2,9 L/dia) não foram reproduzidos; o app mostra os dados reais do perfil.

## 45. v35.1 — Home Signature Edition (proporção e espaço negativo)

**Objetivo.** Cartões um pouco mais baixos e um espaço preto intencional acima da barra inferior. Só proporção e espaçamento: cores, degradês, reflexos, ícones, textos e funções sem mudança.

**O que mudou:**
- **Altura dos cartões:** 112 → 103 pt (−8%) com valores de uma linha. A redução veio do espaço entre o ícone/título e a métrica (9 → 5) e de 1 pt em cima e embaixo. Os tamanhos de letra são os mesmos.
- **Valor em duas linhas** ("Mais ou menos" no Emocional): 127 → 121 pt. Nesse caso o conteúdo define o mínimo, porque "Mais ou menos" não cabe numa linha sem reduzir a letra.
- **Cartões não crescem mais para ocupar a tela.** A sobra vira espaço preto acima da barra (30–34 pt num iPhone 13/15 com "Mais ou menos"; mais com valores curtos). Quando a Home rola, o último cartão termina 24 pt acima da barra (antes 16).
- **Intervalos:** os mesmos (14 entre linhas, 17 entre grupos com a divisória).
- **Correção de um defeito antigo:** em telas pequenas ou com letra ampliada (ícone sobre o título), a Home usava a classe `.stack`, que também é um utilitário genérico com 14 pt entre blocos. Isso deixava 45 pt entre os grupos. Agora são 17 em todos os tamanhos, e a rolagem no iPhone SE de 1ª geração caiu de 425 para 341 pt.

**Sem mudança.** Dados, cartões, toques, navegação, barra inferior, demais telas.

## 46. v36 — Cartões estáveis, aba Agenda e barra inferior corrigida

**1 · Altura estável dos oito cartões.** A altura deixou de depender do conteúdo. Ela vem de um modelo de cartão (título real, uma linha de número, uma linha de legenda) e é a da composição aprovada com "Bem": 103 pt em telas de 375 a 430 pt. "Mais ou menos", números maiores, cartões vazios e compromissos não mudam mais a geometria. Quando um texto não cabe, ele se ajusta dentro do cartão: "Mais ou menos" fica numa linha com a letra um pouco menor (cerca de 20 em vez de 22); legendas e mensagens de vazio podem reduzir até 12 e 13. A legenda de Prioridades vazia passou de "Escolha o que acompanhar" para "Toque para escolher", o mesmo padrão dos outros cartões vazios, e cabe numa linha. Exceção controlada: no iPhone de 320 pt e com o texto muito ampliado, se mesmo assim não couber, só aquela linha de dois cartões cresce.

**2 · Cinco abas: Hoje · Nutrição · Saúde · Agenda · Perfil.** A Agenda de Saúde (próximos, histórico, visão mensal e anual, categorias) é a mesma tela de antes, agora com destino próprio. Consultas, Exames e Procedimentos ("Registros por tipo") saíram da Saúde e ficam no pé da Agenda. O cartão da Home e a linha do Perfil abrem a aba Agenda, já selecionada. Nenhum dado foi movido ou copiado: só mudou o lugar da tela na navegação. Sessões antigas que estavam numa tela da Agenda dentro da Saúde abrem na aba Agenda. Saúde e Agenda guardam a subtela em que estavam ao trocar de aba.

**3 · Barra inferior.** 49 pt de conteúdo, como a barra nativa (antes 58), mais a área do indicador de início, aplicada uma única vez. A barra passou a ser um único componente montado uma vez; a cada tela só muda a aba selecionada. Causas tratadas: os botões eram recriados a cada tela; a aba tocada encolhia (escala 0,94) e era trocada por uma nova em tamanho normal; a medição da área visível do iOS (defeito do app instalado) só era refeita quando a Home era desenhada; a entrada das telas deslizava 4 pt. Agora a medição vale para todas as telas e acompanha mudanças sem evento, o toque só esmaece a aba e a entrada das telas só esmaece.

**Sem mudança.** Dados (v5, sem migração), cores, degradês, reflexos, ícones dos cartões, saudação, seletor, "+", cálculos.

## 47. v36.1 — Quatro abas e cartões na proporção da imagem aprovada

**Barra com quatro abas: Hoje · Nutrição · Saúde · Agenda.** O Perfil saiu da barra e abre pelo seletor do topo: tocar em "Camilo" mostra "Perfil de Camilo" (dados, objetivos e configurações) acima da lista da família. É o padrão dos apps da Apple (a pessoa no alto, os destinos de uso diário embaixo) e devolve à barra o ar da versão com quatro itens, mantendo a Agenda com destino próprio. A tela do Perfil e os dados são os mesmos; ela ganhou "‹" para a tela de origem. Custo: chegar ao Perfil leva dois toques em vez de um.

**Cartões: 103 → 108 pt**, a proporção da imagem aprovada. Os 5 pt entram entre o título e o número. O espaço preto acima da barra cai de ~110 para ~90 pt no iPhone 15 (a imagem tem ~88): fica menor que um cartão e passa a ler como margem. A altura continua estável com qualquer conteúdo.

## 48. v37 — O "+" no centro da barra

**O que mudou.** O botão "+" saiu do canto superior direito e passou para o centro da barra inferior, entre Nutrição e Saúde: Hoje · Nutrição · **+** · Saúde · Agenda. É o mesmo material cobre, em círculo de 48 pt, saindo 8 pt acima da barra, que não ficou mais alta. Motivo: registrar é a ação mais frequente do app, e o centro de baixo é o ponto mais fácil de alcançar com uma mão; o canto de cima, o mais difícil.

**Um só "+", com a ação de cada tela.** Na Home, na Saúde, na Nutrição e no Perfil abre o "Registrar" geral; dentro de um módulo, inicia o registro dele (Hidratação: água; Sono: sono; Agenda: novo compromisso; Consultas: nova consulta). A janela aberta diz o que será registrado. O canto superior direito fica livre; na Nutrição continua o "Copiar plano".

**Ressalva.** A Apple recomenda a barra só para navegação; aqui a exceção é consciente, por praticidade. Se no uso real não convencer, voltar o "+" para o topo é simples e não afeta dados nem telas.

