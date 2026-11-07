# BRICEÑO · Digital Jewelry Design System

Referência visual oficial: **Home v35** (quarta versão aprovada, seção 3.11), que substitui a Home v24 como referência. Nutrição, Saúde e Perfil seguem o sistema desde a v29 (seção 3.6). As próximas telas devem seguir os tokens, componentes e regras deste documento. Tudo está em `fonte/app.html`: os tokens no bloco `:root` (e no bloco "v35 · Home Premium definitiva", no fim do CSS) e os componentes acima de `renderHome`.

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
| `--air` | 24 (28 na Home desde a v35.1) | Respiro-alvo acima da barra inferior |
| `--air-min` | 16 (24 na Home desde a v35.1) | Respiro mínimo; abaixo disso a Home rola |

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

### 3.4 Botão "+" (`.fab`, v37)

**Um único "+" no app, no centro da barra inferior** (entre Nutrição e Saúde), ao alcance do polegar. Cobre acetinado (o mesmo material do "+" que ficava no topo), círculo de 48, saindo 8 acima da barra, que não cresce; um anel da cor do fundo o separa do fio da barra. Não é uma aba: sem rótulo e sem estado selecionado; ao toque só escurece. Faz parte da barra (montado uma vez, mesma posição em todas as telas). Cada tela só declara a ação dele: `quickBtn(p, ctx)` (o "Registrar" geral) ou `modAdd(rótulo, fn)` (o registro do módulo); as duas funções devolvem `null`, porque nada é desenhado no topo. O rótulo do VoiceOver acompanha a tela ("Registrar água", "Nova consulta"). O canto superior direito fica livre, exceto onde já havia outra ferramenta (Copiar plano, na Nutrição). Sem perfil (boas-vindas), o "+" fica invisível, sem deslocar as abas.


**Janela "Registrar" (v42, `quickSheet`): o menu clássico, sóbrio e familiar.**

As tentativas anteriores foram revertidas: a v40 (os oito cartões da Home no "+") e a v41 (registro rápido no próprio menu). Mais elementos no menu deixaram a janela menos elegante.

**O menu.**
- Título "Registrar", sem subtítulo.
- Os quatro pilares (`.qbig`) e a lista de sempre.
- Água no alto da lista, por ser frequente.
- Uma única ação por abertura (`once`).

**A rapidez fica dentro dos fluxos.**
- **Emocional** abre `moodQuickSheet`: "Como você está agora?" com as cinco opções (`.q-moods`, 84 pt). Um toque registra e fecha, com "Desfazer". O link discreto `.q-link` "Registrar com energia, estresse ou nota" abre o formulário completo.
- **Água** abre `waterQuickSheet`: 150, 250, 350 e 500 mL (`.q-water`, 52 pt). Um toque registra. O total do dia aparece no subtítulo. O link "Outro volume ou horário" abre o formulário completo.
- Os formulários completos (`moodSheet`, `waterLogSheet`) não mudaram; são os usados para editar e nas telas dos módulos.
### 3.5 Barra inferior

- **v36.1 · quatro abas, nesta ordem: Hoje · Nutrição · Saúde · Agenda.** Quatro colunas iguais (`repeat(4, minmax(0,1fr))`), ícones de 22, rótulos de 13 px fixos (12 abaixo de 360 pt), como as abas nativas, que não crescem com o tamanho do texto. O **Perfil** saiu da barra (v36.1) e abre pelo seletor do topo ("Camilo" → "Perfil de Camilo", acima da lista da família), como nos apps da Apple; a tela do Perfil tem "‹" para a tela de origem e nenhuma aba marcada. (v36 tinha cinco abas, com Perfil no fim.)
- **Altura (v36): `--tabbar` = 49 px de conteúdo**, como a barra nativa (antes 58), mais a área do indicador de início (`--sab`), aplicada **uma única vez**, no padding da própria barra. Cada aba tem 49 de altura (área de toque ≥ 44 × 59).
- Aba ativa em `--dj-signal`, com filete `--dj-signal-line` desenhado dentro da altura fixa. Só a cor e o filete mudam com a seleção; ao toque, a aba esmaece (opacidade), sem mudar de tamanho.
- **Um único componente**, montado uma vez (`paintTabs`): a cada tela só mudam a classe `.on` e `aria-current`. Nenhum botão é recriado ao navegar.
- A entrada das telas só esmaece (sem deslizar), para que nada se desloque ao trocar de aba.
- **Área segura inferior efetiva `--sab`:** em alguns iPhones, com o app instalado na tela de início, o iOS informa à página a altura sem a faixa do relógio (ex.: 797 em vez de 844 pt) e não desenha nada abaixo dela; o indicador de início fica fora da área do app, mas `env(safe-area-inset-bottom)` continua 34 (confirmado em capturas reais). `measureViewport()` mede a diferença no início de **toda tela** (`render`, desde a v36 — antes só a Home media, e a barra podia acertar a altura ao voltar para ela) e sempre que a área visível muda, mesmo sem evento (uma sonda fixa de altura total é observada por `ResizeObserver`) (fonte única; acompanhada por `settleLayout()` por 2,5 s ao abrir e ao voltar do segundo plano, porque o iOS muda a altura sem avisar) (tela física − altura informada) em `--vgap`, só com a assinatura exata do defeito (app instalado, retrato, diferença igual à área segura superior), e `--sab` = `max(0, env(safe-area-inset-bottom) − --vgap)`. **Todo elemento fixo na base usa `var(--sab)`, nunca `env(safe-area-inset-bottom)` direto**, e nunca é deslocado para baixo da altura informada (seria cortado).

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
| **Cartão Agenda de Saúde** (`jewelEvent`, material `agenda`) | Home, grupo C | Título "Agenda" (v38; antes "Agenda de Saúde" em até duas linhas) · data e horário · identificação pela finalidade ("Consulta · Cardiologia", "Exame de sangue", "Infiltração · joelho direito"). Próximo compromisso de qualquer tipo. Vazio: "Nenhum agendado" · "Adicionar compromisso" (sem "+" isolado). O toque abre sempre a tela Agenda de Saúde (v33). |
| **Cartão Suplementos e Medicamentos** (`jewelCare`) | Home, grupo B | Título "Suplementos" em uma linha (v38) · "2 supl. · 1 med." · legenda "Em uso". O VoiceOver lê "suplementos ativos" e "medicamentos ativos" por extenso. |
| **Títulos em duas linhas** (`.hc-2l`) | Home | Quebram entre palavras, sem reduzir a letra; a pastilha fica alinhada à primeira linha. Valor e legenda do grupo C ancorados na base, alinhados com o vizinho. |
| **Tela Agenda de Saúde** (v34) | Saúde → Agenda | Mesmo padrão do Sono, nesta ordem: categorias **Resumo · Consultas · Exames · Procedimentos** (`.seg.ag-seg`, uma linha no tamanho do seletor da Saúde; se não couber — iPhone estreito ou texto ampliado — vira 2 × 2, nunca corta nem reduz) · **painel do ano** (`.hp.ag`, o cartão do Sono: total grande + "‹ ano ›" numa linha; 12 barras `.bars.ag-bars`, uma por mês, escala do zero, tocáveis; mês escolhido aceso e "Outubro · 3 consultas" abaixo) · **Próximos** (painel: o "a confirmar" mais recente e o próximo futuro; "Ver todos · N" no cabeçalho; vazio = uma linha "Nenhum compromisso agendado") · **Histórico · Mês** (até 3, do mais recente; "Ver todos · N" no cabeçalho quando há mais; vazio = uma frase + atalho "Último mês com registros"). Cor do painel pela categoria: Resumo e Exames safira, Consultas âmbar, Procedimentos ouro rosé. |
| **Contagem da agenda** (v34) | Gráfico, quantidade do mês, histórico | Uma única regra (`agDone`): só compromissos **confirmados como realizados**, com data. Futuros, a confirmar, solicitados e cancelados não contam; resultados e documentos de um exame não viram compromissos. Barra = quantidade = lista do mês; total do ano = soma das 12 barras. |
| **Linha da agenda** (`.agl`, v34) | Agenda, Próximos, Histórico | Dia e mês à esquerda (versalete) · título pela finalidade · (tipo, no Resumo) · horário · situação (Realizada, Agendado, *A confirmar* em destaque, Cancelado esmaecido) · "›". Toque abre os detalhes. |
| **Lembretes** (`remBlock`, `calBlock`) | Cadastros de consulta, exame e procedimento | Fichas múltiplas (7 dias, 1 dia, 2 horas, 30 minutos; sem horário: 7 dias, 1 dia, no dia às 9h00) e horário personalizado. Prévia dos instantes. Entrega por arquivo de calendário; aviso quando o compromisso mudou depois de enviado. |
| **Gráfico genérico** (`lineChart`) | Indicadores | Mesmo desenho do gráfico de exames; segunda série (diastólica) em champanhe; linha de meta tracejada em champanhe com o rótulo "Sua meta". |

 Próximo compromisso = só consultas "agendada" e exames "agendado" que ainda não passaram, no fuso em que foram marcados; sem horário, valem até o fim do dia. Cancelados, realizados e solicitados nunca são "próximos". A Home é redesenhada sozinha quando o compromisso exibido passa.

### 3.10 Padrão de navegação (v33)

Uma regra para todas as áreas, com as particularidades de cada módulo respeitadas:

| Situação | Comportamento |
|---|---|
| Tocar num cartão da Home ou numa linha de módulo | Abre a **visão principal** do módulo, com ou sem dados. Nenhum cartão abre formulário. |
| Visão principal | O mais relevante primeiro (próximo compromisso, valor da semana, meta do dia); depois a lista; o histórico recente à vista e o completo a um toque. |
| "+" | **Um só, no centro da barra inferior** (`.fab`, v37); a ação muda com a tela. Num módulo com cadastro próprio, inicia o registro daquele módulo (Agenda: escolha Consulta · Exame · Procedimento; Hidratação: água; Exercício, Sono, Emocional: o registro do pilar; Indicador: a medição). Sem cadastro próprio, é o "Registrar" geral. Seções com tipos diferentes (Suplementos · Medicamentos) mantêm o "+" da seção. |
| Tocar num registro | Abre os **detalhes**. Compromissos: folha de detalhes (tipo · título · situação e data · "Aconteceu?" se passou · informações · Editar / Reagendar / Cancelar · documentos · Calendário · Excluir). Registros diários (exercício, sono, emocional, água) e itens de uso: a própria folha de edição é o detalhe (um passo a menos). |
| Editar e excluir | Editar abre o formulário já preenchido. Excluir fica dentro dos detalhes ou da edição (botão vermelho), com confirmação quando há documentos ou dados vinculados e Desfazer no aviso. Cancelar não apaga: o compromisso fica no histórico. Sem "x" solto nas listas. |
| Estado vazio | Explica o que entra ali e aponta o "+" (ou traz um botão explícito); nunca abre formulário sozinho. |
| Voltar ("‹") | Leva à tela de onde a pessoa veio, com o nome dela: Hoje → Prioridades mostra "‹ Hoje"; Agenda → Consultas mostra "‹ Agenda de Saúde"; Perfil → módulo mostra "‹ Perfil". Telas internas (Histórico da agenda) voltam ao módulo. Tocar numa aba recomeça o caminho. |
| Agenda (v36) | É uma **aba**. O cartão da Home e a linha do Perfil trocam para a aba Agenda (selecionada, sem "‹"), a mesma tela e os mesmos dados da barra. Consultas, Exames e Procedimentos ("Registros por tipo") ficam no pé da Agenda e voltam para ela. A Saúde não tem mais a Agenda. |
| Trocar de aba (v36) | Saúde e Agenda guardam a subtela em que estavam (`view.keep`) e a devolvem ao voltar, como as abas do iOS. Tocar na aba já ativa volta à raiz dela. |

Implementação: `openMod(v)` guarda a origem em `view.ret` (rótulo + estado, encadeado, até 6 níveis); `backBtn` e `goBack` usam esse caminho, com o resumo da Saúde como alternativa. `modPage` desenha "‹", título e o "+" do módulo.

### 3.11 Home Premium definitiva (v35 · quarta versão aprovada)

A Home reproduz a imagem aprovada. Cada cartão é CSS mais o reflexo vetorial de `JEWEL`; não há imagem estática. O bloco CSS fica no fim do `<style>` e vale só dentro de `.home`, exceto o seletor de perfil e o "+", que são o mesmo componente do topo em todas as telas.

**Tokens da Home (`:root`)**

| Token | Valor | O que controla |
|---|---|---|
| `--hm-r` | 20 (18 em telas ≤ 380 pt) | Raio do cartão |
| `--hm-pad` | 14 (12 em telas estreitas) | Padding horizontal |
| `--hm-pt` / `--hm-pb` | 12 / 10 (v35.1) | Padding vertical |
| `--hm-vt` | 5 (v35.1) | Do ícone/título até a métrica (antes 9): onde a altura foi reduzida |
| `--hm-col` / `--hm-row` | 12 / 14 (8 / 10 em telas estreitas) | Intervalo entre colunas / entre linhas |
| `--hm-div` | 8 | Acima e abaixo de cada divisória (grupo ≈ 17, perto do intervalo entre linhas) |
| `--hm-tile` | 28 | Pastilha do ícone (raio 9, símbolo 19) |
| `--hm-ink` / `--hm-ink-2` / `--hm-ink-3` | branco / 86% / 74% | Valor e título / legenda / unidade |
| `--hm-copper-hi` / `--hm-copper` / `--hm-copper-lo` | `#F7A665` / `#D97B3C` / `#A4501F` | Degradê do "+" (assinatura cobre) |
| `--hm-date` | `#C3AD99` | Data sob a saudação |

**Material de cada cartão.** Seis camadas: base escura (`--gd`), luz de canto no alto à esquerda (`--gt`), brilho largo embaixo à direita (`--gb`), brilho junto à borda direita (`--g` a 24%), lâmina curva de `JEWEL` e aro de 1 px aceso em toda a volta (`--gr`), mais claro nos dois cantos onde a luz incide (`--gh`).

| Cartão | `--g` | `--gd` | `--gt` | `--gb` | `--gr` | `--gh` |
|---|---|---|---|---|---|---|
| Nutrição | `#EE8644` | `#1F0B02` | `#8F421B` | `#A04B21` | `#DE7E43` | `#FFD9A8` |
| Exercício | `#3FCDB8` | `#01120F` | `#165447` | `#175A4F` | `#3E9C90` | `#A6F4EC` |
| Sono | `#B784D6` | `#150A1B` | `#52305F` | `#7E4C87` | `#9A6CA8` | `#E6B9EE` |
| Emocional | `#EE7D84` | `#2E1015` | `#AA4950` | `#A6464F` | `#D56E74` | `#F6AEB0` |
| Hidratação | `#4EC3E2` | `#00111B` | `#16586F` | `#19637C` | `#3E9DBB` | `#A8F0F8` |
| Suplementos e Medicamentos | `#DDD068` | `#151505` | `#7A712B` | `#766F2B` | `#A99B4C` | `#F3EA92` |
| Prioridades | `#E8A25B` | `#251608` | `#B87D42` | `#A86F3A` | `#C38A51` | `#FFE7B4` |
| Agenda de Saúde | `#7EA5E0` | `#060D1A` | `#46689D` | `#2E4570` | `#5677A8` | `#BFE2FF` |

As cores foram medidas na imagem aprovada, nos mesmos pontos de cada cartão (cantos, centro e borda), e ajustadas até ficarem próximas. Os tokens `--dj-*` da seção 2.1 continuam valendo nos módulos.

**Lâmina de luz (`JEWEL`, materiais com `v35: 1`).** Nasce na base, entre 30% e 55% da largura, e sobe em curva até a borda direita, perto da meia altura. É um fio fino com brilho estreito, estrias acima dele e um ponto quente perto da borda. Na faixa do valor e da legenda (embaixo, à esquerda) fica atenuada pela máscara. Onde o reflexo passaria sob um texto (Hidratação, Prioridades), a curva começa mais à direita, para manter o contraste.

**Tipografia.** Título `--t-sm` com peso 640. Valor `--t-num` com peso 700 em todos os cartões (pilares e indicadores). Unidade `--t-sm` com peso 500. Legenda `--t-cap` com peso 450. "Nenhum agendado" com 15 px e peso 700. Os tamanhos são os mesmos da v24; a referência foi medida pela altura das maiúsculas.

**Cabeçalho.** Seletor de perfil com 46 de altura, avatar de 36 com aro cobre e nome em branco. "+" com 46 × 46, raio 14, degradê cobre e símbolo escuro. Saudação com peso 720 e data em `--hm-date`. Na Home, o topo tem 4 de respiro acima do seletor (8 nas outras telas).

---

## 4. Layout da Home: motor adaptativo

Ordem (v32): cabeçalho (seletor, saudação, data) · **A** pilares 2 × 2 · **B** Hidratação + Suplementos · **C** Prioridades + Agenda. v38: sem divisórias. v38.1: dois grupos de quatro (pilares · cuidados e organização) separados só por espaço: `--hm-row` (14) dentro do grupo, `--hm-grp` entre os grupos. v38.3: brilho suave atrás de textos longos (`.lt`, `softGlow`: fim do texto além de 72% da largura → reflexo de baixo até 55%); Nutrição com a legenda "Planejado por dia". v39: **linha-estrela** (`jewelStar`, `.gstar`) entre os dois grupos: 19,5 + fio + 19,5 = 40 (`--hm-star`, v39.1; 32 em telas estreitas); fio de cobre de 0,6 px com núcleo claro e halo elíptico de 120 × 12 no centro; uma só na Home, sem animação. **Home congelada a partir da v39.** v38.2: um ritmo só: `--hm-grp` 24 (20 em telas estreitas), igual ao espaço do cabeçalho aos cartões (`--sp-head` 20 + até 4 da distribuição). Oito cartões, quatro linhas de dois. O GET saiu da Home e continua em Perfil → Planejamento.

- **`fitTitles`:** se um título não cabe ao lado da pastilha, o ícone vai para cima (`.stack`). Se ainda há palavra que não cabe inteira, os cartões passam a uma coluna (`.one`). Palavras nunca são partidas.
- **Altura estável (v36):** `--hm-h` vem de um **modelo**, não do conteúdo do momento: `modelH` mede cópias invisíveis dos oito cartões, na largura real, com o título real e o conteúdo padrão (uma linha de número, uma linha de legenda; na Agenda, a linha de data). Os dados mudam, a geometria não. Depois, `fitInside` acomoda o conteúdo real nos cartões que não couberem: valor em palavra numa linha com a letra reduzida aos poucos até 18 ("Mais ou menos" fica com cerca de 20 no iPhone 15, em vez de 22 em duas linhas); mensagem de vazio até 13; legenda até 12. Se ainda não couber (iPhone de 320 pt ou texto muito ampliado), o texto quebra normalmente e só aquela linha de dois cartões fica mais alta. Nenhum texto é cortado.
- **`spread` (v35.1 · Signature Edition):** os cartões ficam na altura do conteúdo e nunca crescem para ocupar a tela. Da sobra, só o respiro do cabeçalho cresce (até +4). O restante é o espaço negativo preto acima da barra inferior. Sem sobra, a Home rola, e no fim da rolagem o último cartão fica a `--air-min` (24) da barra.
- **Altura de referência:** 108 (v36.1, a proporção da imagem aprovada: `--hm-vt` 10 entre o título e o número), para qualquer conteúdo de 375 a 430 pt com o texto padrão. O espaço preto acima da barra fica menor que um cartão (~90 no iPhone 15) e lê como margem, não como uma linha que falta. (v35.1: 103.)
- **Margem inferior:** calculada da altura real da barra. Ao rolar até o fim, o último cartão fica a `--air-min` dela.
- **Recalcula** a cada mudança de geometria: Home, barra e página (inclusive a área segura aplicada depois do primeiro desenho), redimensionar, girar e fontes. Uma assinatura de geometria evita passadas repetidas.

---

## 5. Tipografia

- **Valores:** peso 700 na Home (v35) e 580 nos módulos, entrelinha 1, `tabular-nums`. Unidades em `--t-sm` com um espaço (~4 px) depois do valor; se a unidade descer de linha, começa na coluna do número.
- **Títulos:** `--t-sm`, peso 640 na Home (v35), uma linha nos oito cartões (v38). **Legendas:** `--t-cap`, 86%, entrelinha 1,25. Só um nome digitado pelo usuário (prioridade principal, compromisso) recebe reticências; os textos do app quebram a linha.
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
