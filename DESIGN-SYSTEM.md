# BRICEÑO · Digital Jewelry Design System

Referência visual oficial: **Home v24** (Home Final Release); Nutrição, Saúde e Perfil seguem o sistema desde a v29 (seção 3.6). As próximas telas devem seguir os tokens, componentes e regras deste documento. Tudo está em `fonte/app.html`: os tokens no bloco `:root` e os componentes acima de `renderHome`.

> Situação da validação: aprovada em testes automatizados (Chromium/Playwright, iPhones simulados com áreas seguras). **Ainda não conferida em iPhone real**: fonte SF Pro, VoiceOver em voz, vibração e espessura física das divisórias (ver "Pendências").

---

## 1. Princípios

1. **Os cartões são as joias; o fundo é a vitrine.** O fundo é preto profundo (`--bg #0A0908`) e não leva ornamentos. A cor fica nos materiais.
2. **Luxo é controle da luz.** O reflexo é propriedade do material, nunca protagonista. Ele não pode competir com o valor e nem aumentar o brilho geral.
3. **Uma linguagem, oito personalidades.** Todos os materiais seguem a mesma construção, e só a incidência de luz muda.
4. **Precisão antes de efeito.** Grade de 4, alturas idênticas por grupo, baselines exatas, nenhum número mágico solto.
5. **Legibilidade e acessibilidade vencem a estética** quando há conflito, e isso é medido, não estimado.

---

## 2. Tokens (`:root`)

### 2.1 Materiais

Cada material tem a cor do material e uma base profunda.

| Token | Valor | Base (`-deep`) | Material | Uso |
|---|---|---|---|---|
| `--dj-copper` | `#DE8A4A` | `#1E1108` | Copper Satin | Nutrição |
| `--dj-emerald` | `#3FBFA0` | `#061B16` | Emerald Titanium | Exercício |
| `--dj-amethyst` | `#9F86EA` | `#170F2C` | Deep Amethyst | Sono |
| `--dj-ruby` | `#E66F8E` | `#250D17` | Rose Ruby | Emocional |
| `--dj-champagne` | `#D7B378` | `#19130B` | Champagne Bronze | Prioridades (Home, v32) · GET (Perfil) · linha de meta nos gráficos |
| `--dj-sapphire` | `#35A9E0` | `#06172A` | Sapphire Blue | Hidratação |
| `--dj-peridot` | `#A6C452` | `#0F1708` | Peridot Olive | Suplementos e Medicamentos |
| `--dj-midnight` | `#6F98E6` | `#0B1430` | Midnight Sapphire | Agenda de Saúde (Home, v32) · Exames · gráficos · ícone de medicamentos |
| `--dj-amber` | `#E0A25C` | `#1D1307` | Honey Amber | Consultas (módulo e listas) |
| `--dj-rosegold` | `#E39A8A` | — | Rose Gold | Procedimentos (ícone e destaque nos módulos; sem cartão na Home) |

### 2.2 Sinal cobre e divisórias

| Token | Valor | Uso |
|---|---|---|
| `--dj-signal` | `#EEA36A` | Aba ativa (ícone e rótulo) |
| `--dj-signal-line` | `#E39A60` | Filete da aba ativa |
| `--dj-hairline` | `rgba(150,136,124,.40)` | Fio das divisórias |
| `--dj-hairline-core` | `rgba(172,142,116,.58)` | Centro aquecido do fio |
| `--dj-hairline-seg` | `rgba(222,156,108,.96)` | Segmento cobre central (32 px) |

### 2.3 Raios

| Token | Valor | Uso |
|---|---|---|
| `--dj-r-card` | 18 px | Cartão-joia |
| `--dj-r-tile` | 8 px | Pastilha de ícone (28 × 28) |
| `--dj-r-tool` | 13 px | Botão-ferramenta (o "+") |

### 2.4 Espaçamento e tipografia

- **Gerais**, já existentes: base 4 (`--s1 4` … `--s8 32`), raios `--r-*` e escala em rem (`--t-cap 13`, `--t-sm 14`, `--t-body 16`, `--t-num 26`, em pt para o texto padrão de 17 px).
- **Home**, em `.home`:

| Token | Valor | O que controla |
|---|---|---|
| `--hc-gap` | 12 (8 em telas ≤ 380 pt) | Espaço entre cartões |
| `--hc-pad` | 14 (12 em telas estreitas) | Padding horizontal do cartão |
| `--hc-pv` | 12 | Padding vertical do cartão |
| `--sp-head` | 16 | Cabeçalho → primeira linha |
| `--sp-div` | 20 | Acima e abaixo de cada divisória |
| `--air` | 24 | Respiro-alvo acima da barra inferior |
| `--air-min` | 16 | Respiro mínimo; abaixo disso a Home rola |

---

## 3. Componentes

### 3.1 `jewelCard(o)`: cartão-joia

É um único `<button>`, e o cartão inteiro é a área de toque. Parâmetros:

| Parâmetro | Função |
|---|---|
| `cls` | Material: `food`, `move`, `sleep`, `wb`, `energy`, `water`, `supp`, `meds`. Define a classe CSS (`.hc.<cls>`, que lê os tokens) e o reflexo (`JEWEL(cls)`). |
| `lv` | `l1` (pilar: número 26, valor ancorado na base) ou `l2` (indicador compacto: número 22, logo abaixo do título) |
| `icon` | Chave de `ICON`, com traço de 1,9 em 24 × 24 |
| `title` | Uma linha, nunca quebra nem trunca |
| `value`, `unit`, `sub` | Valor (`null` = estado vazio), unidade menor e legenda |
| `empty` | `[mensagem, ação]` quando não há dado, por exemplo `["Não registrado", "Toque para registrar"]` |
| `aria` | Rótulo completo para o VoiceOver. Sem ele, é montado como "título: valor unidade. legenda." |
| `fn` | Ação ao tocar; o toque já dispara a resposta tátil (`haptic`) |

O material é construído em seis camadas:
1. base cromática profunda;
2. luz ambiente;
3. reflexo curvo vetorial (`.hc-fx`, SVG gerado uma vez e clonado);
4. microtextura (estrias);
5. aro de 1 px que acende onde a luz incide;
6. conteúdo sobre a zona escura, que uma máscara mantém livre de reflexo forte.

**Estados:**
- **Pressionado:** `scale(.98)` e brilho de 1,12, em 160 ms. Com "Reduzir movimento" não há transição.
- **Vazio:** mensagem curta e ação, nunca um zero inventado. Zero só aparece quando é uma contagem real ("0 cadastrados").

**Reflexos** (`JEWEL`, um parâmetro por material): `sx`, `ey`, `ex` e `c1`/`c2` definem a curva; `n`, `ox` e `oy` as estrias; `pk` a posição do ponto quente; `fill` e `glow` a intensidade; `hot` o ponto quente (padrão .62); `sec` o segundo reflexo das gemas. Personalidades:

| Material | Reflexo |
|---|---|
| Cobre e bronze | Lâmina larga e acetinada |
| Esmeralda | Faixa íngreme junto à borda |
| Ametista | Arco baixo e difuso |
| Rubi | Arco curto no canto superior |
| Safira | Linha quase reta e nítida |
| Peridoto | Curva em S |
| Safira da meia-noite | Lâmina baixa |

### 3.2 `jewelDivider()` / `.dj-divider`: Signature divider

- Fio de **1 px físico** (escala por densidade de tela) em grafite quente, que esmaece nas pontas (transição de 22%) e aquece ao centro.
- Segmento cobre acetinado de 32 px, que dialoga com o filete da aba ativa.
- Sem texto, sem sombra, sem animação, com `aria-hidden`.
- Em telas novas, use a classe `.dj-divider` e defina a margem no contexto.

### 3.3 Pastilha de ícone (`.hc-i`)

28 × 28 com raio `--dj-r-tile`, fundo tonal do material, aro aceso no alto e sombra de contato mínima. O símbolo tem 17 px. O ícone de Nutrição é o mesmo na Home e na barra inferior.

### 3.4 Botão-ferramenta "+" (`.icon-btn.accent`)

Cobre acetinado, 44 × 44 e raio `--dj-r-tool`. É uma ferramenta, não protagonista: brilho contido e sombra curta.

### 3.5 Barra inferior

- 58 px de conteúdo mais a área do indicador de início do iOS (`env(safe-area-inset-bottom)`), que fica **livre**. Nenhum espaço do app abaixo dos rótulos.
- Aba ativa em `--dj-signal`, com filete `--dj-signal-line` 4 px abaixo do rótulo.
- **Área segura inferior efetiva `--sab`:** em alguns iPhones, com o app instalado na tela de início, o iOS informa à página a altura sem a faixa do relógio (ex.: 797 em vez de 844 pt) e não desenha nada abaixo dela; o indicador de início fica fora da área do app, mas `env(safe-area-inset-bottom)` continua 34 (confirmado em capturas reais). `measureViewport()` mede a diferença no início de toda passada de layout (fonte única; acompanhada por `settleLayout()` por 2,5 s ao abrir e ao voltar do segundo plano, porque o iOS muda a altura sem avisar) (tela física − altura informada) em `--vgap`, só com a assinatura exata do defeito (app instalado, retrato, diferença igual à área segura superior), e `--sab` = `max(0, env(safe-area-inset-bottom) − --vgap)`. **Todo elemento fixo na base usa `var(--sab)`, nunca `env(safe-area-inset-bottom)` direto**, e nunca é deslocado para baixo da altura informada (seria cortado).

---

### 3.6 Hierarquia de materiais (A · B · C) — v29

A sofisticação cresce com a importância da informação, não com a quantidade de efeitos.

| Material | Classe | Onde usar | Como é |
|---|---|---|---|
| **A · Signature Jewelry** | `.hc` (`jewelCard`) | Só os oito cartões da Home | Cor profunda do material, reflexo vetorial, aro aceso |
| **B · Precision Glass** | `.dj-glass` (+ `--tint`) | Painéis protagonistas: resumo nutricional, indicadores de Saúde, identificação no Perfil | Grafite profundo com leve tom do tema (`--tint`), aro fino que acende no alto, sombra discreta; **sem reflexo** |
| **C · Quiet Luxury** | `.dj-quiet` | Listas, grupos, formulários, objetivos, refeições, configurações | Grafite `--dj-quiet` com borda `--dj-quiet-line`, separadores `--dj-quiet-rule`; nenhum ornamento |

**Tokens (v29):**

| Token | Uso |
|---|---|
| `--dj-glass-base` | Base do Material B |
| `--dj-quiet`, `--dj-quiet-line`, `--dj-quiet-rule` | Material C: superfície, borda e separador |
| `--dj-tile`, `--dj-tile-line` | Pastilha de ícone fora da Home |
| `--dj-r-panel` | Raio dos painéis (20) |
| `--dj-type-page` · `--dj-type-section` · `--dj-type-title` · `--dj-type-num` · `--dj-type-unit` · `--dj-type-meta` · `--dj-type-label` | Papéis tipográficos (em rem) |

**Componentes aplicados:**
- **Segmented control** (`.seg`): trilho grafite e seleção em cobre acetinado (da família do "+"). Texto escuro sobre cobre, com contraste ≥ 5:1. Uma seleção em cobre translúcido foi testada e descartada por baixo contraste.
- **Pastilhas** (`.pr-i`, `.gl-i`, `.gr-i`): grafite com aro fino. A cor do símbolo só aparece quando significa algo: objetivo em cobre, suplementos em peridoto, medicamentos em safira da meia-noite.
- **Indicadores de Saúde** (`.hrow`): Material B com o `--tint` do material da Home de cada módulo (esmeralda, ametista, rubi, safira) e pastilha-joia com aro aceso, para dar continuidade com os cartões da Home.

**Regras de cor:**
- **Cor semântica:** cada cor de material significa sempre o mesmo módulo, em qualquer tela.
- **Cobre:** reservado a identidade e ações principais (seleção, "+", horários, objetivo).
- **Perfil:** fica neutro (Quiet Luxury). A cor aparece só em alertas, como o backup.

### 3.7 Componentes de composição (v30)

| Componente | Onde | Anatomia |
|---|---|---|
| **Cabeçalho de seção** (`h2.sec-t`) | Todas as abas | Versalete 13 px, espaçamento .14em, cobre-acinzentado `#B9937A`, com fio de 1 px físico que esmaece para a direita. Organiza sem pesar; em `.sec-row` divide a linha com a ação "+". |
| **Painel-instrumento** (`macroRing` + `.sx-*`) | Nutrição | Eyebrow "Planejado para hoje" · anel de energia (C/P/G pelos fatores 4/4/9) com o total planejado no centro · legenda 2 × 2 (carboidratos, proteínas, gorduras, fibras: nome, gramas, % da energia) · rodapé "% da energia dos macronutrientes". A legenda fica ao lado do anel em 375–430 pt e desce quando o texto cresce (`flex-basis` em rem). |
| **Quadro de energias** (`.gl-led`) | Objetivo, em Nutrição | Três linhas, nunca equivalentes: **Meta diária** (cobre, definida por você), **No plano de hoje** (soma dos alimentos e diferença para a meta) e **Gasto estimado** (GET, cálculo). |
| **Linha de informação** (`row(…, val)`, `.pr-l`/`.pr-v`) | Perfil | Título em uma linha; embaixo, o resumo à esquerda e o valor-chave à direita, tabular. Sem espaço, o valor desce inteiro; nada é truncado nem hifenizado. |
| **Linha de refeição** | Nutrição | Coluna de horário (largura em em) com fio vertical · nome em destaque · quantidade secundária · calorias à direita. Em tela estreita com texto ampliado, calorias e seta descem para a linha de baixo. |
| **Controle secundário do topo** (`.top .icon-btn`) | Topo das abas | Mesma família do seletor de membro: grafite com aro cobre fino. |

### 3.8 Agenda e acompanhamento clínico (v31)

| Componente | Onde | Anatomia |
|---|---|---|
| **Cartão de agenda** (`jewelEvent`) | Home, grupo C | No máximo três linhas: ícone + título · data e horário ("12 nov · 14h30", 17 px, uma linha; 15 px em 320 pt) · identificação (profissional ou exame, uma linha com reticências). Sem compromisso: "Nenhuma consulta agendada" em até duas linhas e um "+" discreto no título; o toque abre o cadastro. O ano só aparece se o compromisso estiver a mais de 330 dias; o fuso, só nas telas internas. |
| **Cartão de contadores** (`jewelCare`) | Home, grupo B | Título "Em uso" e duas linhas com número antes do nome ("2 suplementos", "0 medicamentos"). Conta itens ativos (não pausados), um por nome. Altura natural igual à de Hidratação. |
| **Página de módulo** (`modPage`) | Saúde → Consultas, Exames, Suplementos e medicamentos | "‹ Saúde" (44 pt) · título com "+" · destaque do próximo compromisso (Material B, `.nx`, tinta do módulo) · "Aconteceu?" para compromissos passados sem registro · listas em Material C. Tocar de novo na aba Saúde volta ao resumo. |
| **Linha de compromisso** (`.grow.ev` + `.dtile`) | Listas de consultas e exames | Pastilha com dia e mês · título · detalhe · situação só quando importa ("a confirmar", "cancelada"). |
| **Histórico anual** (`apptChart`, `.mc`) | Consultas | 12 meses, barras empilhadas em âmbar: realizadas (cheia), a confirmar (hachurada), agendadas (contorno), canceladas (grafite). Total de realizadas no topo; toque no mês lista as consultas. |
| **Gráfico de evolução** (`labChart`, `.lc`) | Exames | Linha fina que só liga medições; pontos são os resultados. Eixo do tempo proporcional às datas reais; uma unidade por gráfico; faixa de referência só quando todos os pontos têm a mesma. Seleção mostra valor, data, referência, laboratório e, se convertido, o valor original. |

### 3.9 Prioridades, Agenda de Saúde e indicadores (v32)

| Componente | Onde | Anatomia |
|---|---|---|
| **Cartão Prioridades** (`jewelCard`, material `prio`) | Home, grupo C | Título · "3 ativas" · prioridade principal (uma linha, reticências) ou "Em acompanhamento". Vazio: "Nenhuma definida" · "Escolha o que acompanhar". Sem pontuação nem porcentagem. |
| **Cartão Agenda de Saúde** (`jewelEvent`, material `agenda`) | Home, grupo C | Título em até duas linhas · data e horário · identificação pela finalidade ("Consulta · Cardiologia", "Exame de sangue", "Infiltração · joelho direito"). Próximo compromisso de qualquer tipo. Vazio: "Nenhum agendado" · "Adicionar compromisso" (sem "+" isolado). O toque abre sempre a tela Agenda de Saúde (v33). |
| **Cartão Suplementos e Medicamentos** (`jewelCare`) | Home, grupo B | Título completo em até duas linhas · "2 supl. · 1 med." numa linha (as abreviações ficam logo abaixo do título por extenso; o VoiceOver lê por extenso). |
| **Títulos em duas linhas** (`.hc-2l`) | Home | Quebram entre palavras, sem reduzir a letra; a pastilha fica alinhada à primeira linha. Valor e legenda do grupo C ancorados na base, alinhados com o vizinho. |
| **Linha da agenda** (`.grow.ag`) | Agenda de Saúde | Tipo em versalete na cor do módulo (consulta âmbar, exame safira, procedimento ouro rosé) · título · horário e local. Próximos agrupados por mês; histórico do mais recente ao mais antigo. |
| **Lembretes** (`remBlock`, `calBlock`) | Cadastros de consulta, exame e procedimento | Fichas múltiplas (7 dias, 1 dia, 2 horas, 30 minutos; sem horário: 7 dias, 1 dia, no dia às 9h00) e horário personalizado. Prévia dos instantes. Entrega por arquivo de calendário; aviso quando o compromisso mudou depois de enviado. |
| **Gráfico genérico** (`lineChart`) | Indicadores | Mesmo desenho do gráfico de exames; segunda série (diastólica) em champanhe; linha de meta tracejada em champanhe com o rótulo "Sua meta". |

 Próximo compromisso = só consultas "agendada" e exames "agendado" que ainda não passaram, no fuso em que foram marcados; sem horário, valem até o fim do dia. Cancelados, realizados e solicitados nunca são "próximos". A Home é redesenhada sozinha quando o compromisso exibido passa.

### 3.10 Padrão de navegação (v33)

Uma regra para todas as áreas, com as particularidades de cada módulo respeitadas:

| Situação | Comportamento |
|---|---|
| Tocar num cartão da Home ou numa linha de módulo | Abre a **visão principal** do módulo, com ou sem dados. Nenhum cartão abre formulário. |
| Visão principal | O mais relevante primeiro (próximo compromisso, valor da semana, meta do dia); depois a lista; o histórico recente à vista e o completo a um toque. |
| "+" | **Um por tela**, no canto superior direito (`.icon-btn.accent`). Num módulo com cadastro próprio, inicia o registro daquele módulo (Agenda: escolha Consulta · Exame · Procedimento; Hidratação: água; Exercício, Sono, Emocional: o registro do pilar; Indicador: a medição). Sem cadastro próprio, é o "Registrar" geral. Seções com tipos diferentes (Suplementos · Medicamentos) mantêm o "+" da seção. |
| Tocar num registro | Abre os **detalhes**. Compromissos: folha de detalhes (tipo · título · situação e data · "Aconteceu?" se passou · informações · Editar / Reagendar / Cancelar · documentos · Calendário · Excluir). Registros diários (exercício, sono, emocional, água) e itens de uso: a própria folha de edição é o detalhe (um passo a menos). |
| Editar e excluir | Editar abre o formulário já preenchido. Excluir fica dentro dos detalhes ou da edição (botão vermelho), com confirmação quando há documentos ou dados vinculados e Desfazer no aviso. Cancelar não apaga: o compromisso fica no histórico. Sem "x" solto nas listas. |
| Estado vazio | Explica o que entra ali e aponta o "+" (ou traz um botão explícito); nunca abre formulário sozinho. |
| Voltar ("‹") | Leva à tela de onde a pessoa veio, com o nome dela: Hoje → Agenda de Saúde mostra "‹ Hoje"; Saúde → Agenda → Consultas mostra "‹ Agenda de Saúde" e depois "‹ Saúde"; Perfil → módulo mostra "‹ Perfil". Telas internas (Histórico da agenda) voltam ao módulo. Tocar numa aba recomeça o caminho. |

Implementação: `openMod(v)` guarda a origem em `view.ret` (rótulo + estado, encadeado, até 6 níveis); `backBtn` e `goBack` usam esse caminho, com o resumo da Saúde como alternativa. `modPage` desenha "‹", título e o "+" do módulo.

## 4. Layout da Home: motor adaptativo

Ordem (v32): cabeçalho (seletor + "+", saudação, data) · **A** pilares 2 × 2 · divisória · **B** Hidratação + Suplementos e Medicamentos · divisória · **C** Prioridades + Agenda de Saúde. Oito cartões, quatro linhas de dois. O GET saiu da Home e continua em Perfil → Planejamento.

- **`fitTitles`:** se um título não cabe ao lado da pastilha, o ícone vai para cima (`.stack`). Se ainda há palavra que não cabe inteira, os cartões passam a uma coluna (`.one`). Palavras nunca são partidas.
- **Hierarquia:** pilares nunca mais baixos que os indicadores (+8). O grupo C tem a altura do grupo B.
- **`spread`:** mede a área entre o topo do conteúdo e a barra fixa e reparte a sobra:
  1. primeiro o respiro entre grupos (divisórias até +16, cabeçalho até +12);
  2. só em telas altas, os cartões (pilares até +8, indicadores até +4).

  O que passar disso fica no respiro inferior.
- **Margem inferior:** calculada da altura real da barra. Ao rolar até o fim, o último cartão fica a `--air-min` dela.
- **Recalcula** a cada mudança de geometria: Home, barra e página (inclusive a área segura aplicada depois do primeiro desenho), redimensionar, girar e fontes. Uma assinatura de geometria evita passadas repetidas.

---

## 5. Tipografia

- **Valores:** peso 580, entrelinha 1, `tabular-nums`. Unidades em `--t-sm` com 70% de opacidade e um espaço (~4 px) depois do valor; se a unidade descer de linha, começa na coluna do número.
- **Títulos:** `--t-sm`, peso 580, uma linha. **Legendas:** `--t-cap`, 86% (92% no estado vazio), entrelinha 1,25.
- **Sem hifenização automática.**
- **Tamanho de texto do iPhone:** lido de `-apple-system-body` e limitado a 15–24 px. A partir de 19 px vale o arranjo de texto ampliado.

---

## 6. Acessibilidade (critérios de aceite)

- **Rótulos:** cada cartão tem nome completo (valor, unidade por extenso, contexto). Reflexos, divisórias e ícones decorativos ficam ocultos.
- **Ordem de leitura:** seletor, "+", saudação, data, oito cartões na ordem visual, abas.
- **Contraste** ≥ 4,5:1 medido no **pior pixel** do fundo real sob cada texto, com reflexos incluídos. Na referência, o mínimo é 5,98:1.
- **Toque e movimento:** áreas de toque ≥ 44 px; "Reduzir movimento" sem transições nem animação de entrada.

---

## 7. Não fazer

- Criar cor ou material fora dos tokens, ou degradê contínuo entre cartões.
- Aumentar brilho e reflexos, ou pôr reflexo forte atrás de texto.
- Colocar ornamentos, títulos de grupo ou a marca BRICEÑO na Home.
- Usar alturas fixas por aparelho, offsets para "encaixar" ou conteúdo na área do indicador de início.
- Truncar, hifenizar ou reduzir a fonte de um cartão isolado para caber.

---

## 8. Como validar uma tela nova

Antes de aceitar uma tela, verificar em iPhone compacto, padrão e grande, com áreas seguras:
- nenhum conteúdo sob a barra;
- nenhuma palavra partida e nenhum estouro (texto 17–26 px, de 320 a 430 pt);
- baselines dos pares;
- contraste no pior pixel;
- estados vazios e valores longos;
- "Reduzir movimento";
- comparação pixel a pixel com a referência quando a mudança for só de código.

## Pendências da referência

- Conferir no iPhone real: a correção da faixa inferior (`--sab`/`--vgap`), SF Pro, VoiceOver em voz, resposta tátil (iOS 18+) e divisórias em 1 px físico.
- Tamanhos de texto de acessibilidade acima de 24 px ficam limitados a 24.
- As folhas não fecham com a tecla Esc (teclado externo); fecham pelo botão e por toque fora.
