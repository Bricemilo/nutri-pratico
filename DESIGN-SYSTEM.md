# BRICEÑO · Digital Jewelry Design System

Referência visual oficial: **Home v24** (Home Final Release). As próximas telas devem seguir os tokens, componentes e regras deste documento. Tudo está em `fonte/app.html`: os tokens no bloco `:root` e os componentes acima de `renderHome`.

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
| `--dj-champagne` | `#D7B378` | `#19130B` | Champagne Bronze | Gasto diário |
| `--dj-sapphire` | `#35A9E0` | `#06172A` | Sapphire Blue | Hidratação |
| `--dj-peridot` | `#A6C452` | `#0F1708` | Peridot Olive | Suplementos |
| `--dj-midnight` | `#6F98E6` | `#0B1430` | Midnight Sapphire | Medicamentos |

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
- **Área segura inferior efetiva `--sab`:** em alguns iPhones, com o app instalado na tela de início, o iOS informa à página a altura sem a faixa do relógio (ex.: 797 em vez de 844 pt) e não desenha nada abaixo dela; o indicador de início fica fora da área do app, mas `env(safe-area-inset-bottom)` continua 34 (confirmado em capturas reais). `fixViewportGap()` mede a diferença (tela física − altura informada) em `--vgap`, só com a assinatura exata do defeito (app instalado, retrato, diferença igual à área segura superior), e `--sab` = `max(0, env(safe-area-inset-bottom) − --vgap)`. **Todo elemento fixo na base usa `var(--sab)`, nunca `env(safe-area-inset-bottom)` direto**, e nunca é deslocado para baixo da altura informada (seria cortado).

---

## 4. Layout da Home: motor adaptativo

Ordem: cabeçalho (seletor + "+", saudação, data) · **A** pilares 2 × 2 · divisória · **B** Gasto diário + Hidratação · divisória · **C** Suplementos + Medicamentos.

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
- O campo do nome da refeição (fora da Home) tem 40 px de altura.
