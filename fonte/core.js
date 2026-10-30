/* Nutri Prático — núcleo de cálculo (sem tela).
   Tudo aqui é função pura: roda no app e nos testes automáticos (node --test).
   Fontes: TACO 4ª ed. (NEPA/UNICAMP, 2011); POF 2008–2009, Tabela de Medidas Referidas (IBGE);
   FAO/WHO/UNU 1985 (Technical Report Series 724); IOM, Dietary Reference Intakes for Energy (2005). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NutriCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- texto ---------- */
  function normCh(ch){ return ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  function norm(s){ let o = ""; for (const ch of String(s)) o += normCh(ch); return o; }
  const words = s => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- nomes do dia a dia para os nomes técnicos da TACO ---------- */
  const NAME_FIX = {
    1: "Arroz integral cozido", 2: "Arroz integral cru", 3: "Arroz branco cozido", 4: "Arroz branco cru", 5: "Arroz branco tipo 2 cozido",
    6: "Arroz branco tipo 2 cru", 7: "Aveia em flocos", 40: "Macarrão de trigo cru", 41: "Macarrão com ovos cru", 48: "Pão de forma de aveia",
    50: "Pão de forma de glúten", 51: "Pão de forma de milho", 52: "Pão de forma integral", 53: "Pão francês", 54: "Pão sovado",
    63: "Torrada de pão francês", 452: "Iogurte sabor pêssego", 453: "Leite condensado", 454: "Leite de cabra", 455: "Leite achocolatado",
    456: "Leite em pó desnatado", 459: "Leite em pó integral", 461: "Queijo minas frescal", 462: "Queijo minas meia cura",
    468: "Requeijão cremoso", 471: "Café coado (infusão 10%)", 485: "Ovo de codorna cru", 486: "Clara de ovo cozida",
    487: "Gema de ovo cozida", 488: "Ovo cozido", 489: "Ovo cru", 490: "Ovo frito", 511: "Café em pó torrado", 384: "Carne seca cozida",
    385: "Carne seca crua", 338: "Charque cozido", 339: "Charque cru", 21: "Flocos de milho com sal", 22: "Flocos de milho sem sal"
  };
  const BEEF_SUFFIX = {"fígado": "bovino", "língua": "bovina", "bucho": "bovino", "almôndegas": "bovinas", "costela": "bovina", "peito": "bovino"};
  function friendly(id, name, cat){
    if (NAME_FIX[id]) return NAME_FIX[id];
    let [base, ...rest] = name.split(/,\s*/).map(x => x.trim().replace(/\/10minutos$/, "")).filter(Boolean);
    if (base === "Carne" && rest[0] === "bovina" && rest.length > 1){
      rest.shift(); const cut = rest.shift();
      base = cap(cut) + (BEEF_SUFFIX[cut] ? " " + BEEF_SUFFIX[cut] : "");
    } else if (base === "Frango" && ["peito", "coxa", "sobrecoxa", "asa", "coração", "fígado", "filé"].includes(rest[0])){
      base = cap(rest.shift()) + " de frango";
    } else if (base === "Porco" && rest.length){
      base = cap(rest.shift()) + " de porco";
    } else if (cat === "Pescados e frutos do mar" && rest[0] === "filé"){
      rest.shift(); base = "Filé de " + base.charAt(0).toLowerCase() + base.slice(1);
    }
    if (cat === "Frutas e derivados") rest = rest.filter(r => !/^crua?s?$/.test(r));
    return [base, ...rest].join(" ");
  }

  /* ---------- base de alimentos ---------- */
  // Itens cujos valores de energia e macronutrientes estão "em reanálise" (*) na própria TACO: fora da busca.
  const NO_DATA = new Set([450, 457, 458, 591]);
  const COMMON = new Set([3, 1, 561, 567, 488, 490, 53, 52, 410, 408, 182, 179, 226, 225, 222, 7, 448, 449, 461, 463, 467, 468,
    260, 471, 494, 91, 88, 129, 78, 157, 110, 109, 100, 377, 346, 326, 317, 277, 551, 533, 589, 594, 214, 231, 235, 256, 236, 237, 261, 507, 577]);

  // Linha bruta: [id, nome, kcal, carboidrato, proteína, lipídeos, fibra, categoria, [[medida, gramas], ...]].
  // Valores null = dado ausente na fonte (nunca é tratado como zero em silêncio).
  function createFoodDB(data){
    const byId = new Map(), list = [];
    function add(raw){
      const [id, name, kcal, c, p, fat, fib, cat, ms] = raw;
      const measures = (ms || []).map(([l, g]) => ({l, g}));
      if (!measures.some(m => m.l === "Grama")) measures.push({l: "Grama", g: 1});
      const catName = typeof cat === "number" ? data.cats[cat] : cat;
      const own = id < 0;
      const dn = own ? name : friendly(id, name, catName);
      const meta = raw[9] || {};
      const f = {id, name, dn, kcal, c, p, fat, fib, cat: catName, measures, brand: meta.brand || "", meta,
        w: [...new Set(words(dn).concat(words(name), words(meta.brand || "")))],
        ibge: !own && (ms || []).length > 0, common: COMMON.has(id), own};
      if (byId.has(id)) list.splice(list.indexOf(byId.get(id)), 1);
      byId.set(id, f); list.push(f);
      return f;
    }
    function remove(id){ const f = byId.get(id); if (!f) return; byId.delete(id); list.splice(list.indexOf(f), 1); }
    for (const raw of data.foods) if (!NO_DATA.has(raw[0])) add(raw);
    return {get: id => byId.get(id), has: id => byId.has(id), add, remove, list};
  }

  /* ---------- busca (tolerante a acentos e a um erro de digitação) ---------- */
  function within1(a, b){
    // distância de edição ≤ 1 (troca, inclusão ou exclusão de uma letra)
    if (a === b) return true;
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    let i = 0, j = 0, edits = 0;
    while (i < la && j < lb){
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
    }
    return edits + (la - i) + (lb - j) <= 1;
  }
  function matchWord(t, w){
    if (w.startsWith(t)) return 3;
    if (t.length > 3 && w.length >= 3 && t.startsWith(w)) return 2;          // "ovos" encontra "ovo"
    if (t.length >= 4 && w.length >= t.length - 1){   // "arrz", "fejao": um erro de digitação no começo da palavra
      for (const n of [t.length, t.length + 1, t.length - 1]) if (within1(t, w.slice(0, n))) return 1;
    }
    return 0;
  }
  function searchFoods(db, q, opt = {}){
    const qt = words(q), use = opt.use || {}, fav = new Set(opt.fav || []), limit = opt.limit || 8;
    if (!qt.length) return [];
    const res = [];
    for (const f of db.list){
      let score = 0, ok = true;
      for (let i = 0; i < qt.length; i++){
        const t = qt[i];
        let best = 0, wi = -1;
        f.w.forEach((w, k) => { const m = matchWord(t, w); if (m > best) { best = m; wi = k; } });
        if (!best) { ok = false; break; }
        score += best * 4 + (best >= 3 ? 16 : 0);   // começo exato da palavra vale mais que um erro de digitação ("maca": maçã antes de mamão)
        if (i === 0 && wi === 0) score += 40;
        if (wi === i) score += 6;
        if (f.w[wi] === t) score += 4;
      }
      if (!ok) continue;
      score += Math.min(use[f.id] || 0, 40) * 5;
      if (fav.has(f.id)) score += 25;
      if (f.ibge) score += 3;
      if (f.common) score += 14;
      if (f.own) score += 10;
      score -= f.dn.length * 0.12;
      res.push([score, f]);
    }
    return res.sort((a, b) => b[0] - a[0]).slice(0, limit).map(r => r[1]);
  }

  /* ---------- cálculo do plano ---------- */
  function measureOf(f, label){ return f.measures.find(m => m.l === label) || f.measures[0]; }
  const NUTRIENTS = [["c", "c"], ["p", "p"], ["l", "fat"], ["f", "fib"]];
  // Retorna valores do item e quais nutrientes estão ausentes na fonte (miss).
  function calcItem(db, it){
    const f = db.get(it.foodId);
    if (!f || !it.qty) return null;
    const m = measureOf(f, it.measure), g = m.g * it.qty, k = g / 100;
    const r = {g, kcal: (f.kcal || 0) * k, miss: {}};
    for (const [key, src] of NUTRIENTS){
      if (f[src] == null) { r[key] = 0; r.miss[key] = true; } else r[key] = f[src] * k;
    }
    return r;
  }
  function sum(list){
    const t = {g: 0, kcal: 0, c: 0, p: 0, l: 0, f: 0, miss: {}};
    for (const r of list) if (r){
      for (const k of ["g", "kcal", "c", "p", "l", "f"]) t[k] += r[k];
      for (const k in r.miss) t.miss[k] = (t.miss[k] || 0) + 1;
    }
    return t;
  }
  const mealTotal = (db, m) => sum(m.items.map(it => calcItem(db, it)));
  const planTotal = (db, pl) => sum(pl.meals.map(m => mealTotal(db, m)));

  // % de energia de cada macronutriente pelos fatores de Atwater (4/4/9). Somam 100%.
  // A energia total exibida é a da TACO, calculada pela fonte com fatores específicos por alimento,
  // por isso o total em kcal pode diferir um pouco de 4·C + 4·P + 9·G.
  function macroSplit(t){
    const kc = t.c * 4, kp = t.p * 4, kl = t.l * 9, sumK = kc + kp + kl;
    if (!sumK) return {c: 0, p: 0, l: 0, atwater: 0};
    return {c: kc / sumK * 100, p: kp / sumK * 100, l: kl / sumK * 100, atwater: sumK};
  }

  /* ---------- necessidade energética ---------- */
  function ageOf(birth, now = new Date()){
    if (!birth) return null;
    const b = new Date(birth + "T12:00:00");
    let a = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
    return a;
  }
  const FAO_LV = ["Muito leve", "Leve", "Moderado", "Intenso"];
  // Fatores de atividade FAO/OMS 1985 para adultos (múltiplos da TMB).
  const FAO_FA = {M: [1.30, 1.55, 1.78, 2.10], F: [1.30, 1.56, 1.64, 1.82]};
  // TMB FAO/OMS 1985 (equações de Schofield, só peso): [limite superior de idade, coeficiente, constante].
  const FAO_TMB = {
    M: [[3, 60.9, -54], [10, 22.7, 495], [18, 17.5, 651], [30, 15.3, 679], [60, 11.6, 879], [999, 13.5, 487]],
    F: [[3, 61.0, -51], [10, 22.5, 499], [18, 12.2, 746], [30, 14.7, 496], [60, 8.7, 829], [999, 10.5, 596]]
  };
  function faoTMB(sex, age, W){
    const r = FAO_TMB[sex].find(x => age < x[0]);
    const range = age < 3 ? "0–3" : age < 10 ? "3–10" : age < 18 ? "10–18" : age < 30 ? "18–30" : age < 60 ? "30–60" : "60 ou mais";
    return {v: r[1] * W + r[2], coef: r[1], cons: r[2], range};
  }
  const DRI_LV = ["Sedentário", "Pouco ativo", "Ativo", "Muito ativo"];
  // DRI 2005 (IOM): EER e BEE. Adultos a partir de 19 anos; crianças e adolescentes de 3 a 18 anos.
  function driCalc(sex, age, W, Hcm, lv){
    const H = Hcm / 100;
    if (age >= 19){
      const PA = sex === "M" ? [1.00, 1.11, 1.25, 1.48][lv] : [1.00, 1.12, 1.27, 1.45][lv];
      const get = sex === "M" ? 662 - 9.53 * age + PA * (15.91 * W + 539.6 * H) : 354 - 6.91 * age + PA * (9.36 * W + 726 * H);
      const tmb = sex === "M" ? 293 - 3.8 * age + 456.4 * H + 10.12 * W : 247 - 2.67 * age + 401.5 * H + 8.60 * W;
      const eq = sex === "M" ? "662 − 9,53·I + AF·(15,91·P + 539,6·A)" : "354 − 6,91·I + AF·(9,36·P + 726·A)";
      return {get, tmb, PA, eq, group: "adulto"};
    }
    if (age >= 3){
      const PA = sex === "M" ? [1.00, 1.13, 1.26, 1.42][lv] : [1.00, 1.16, 1.31, 1.56][lv];
      const dep = age <= 8 ? 20 : 25;   // energia de crescimento (kcal/dia)
      const get = sex === "M" ? 88.5 - 61.9 * age + PA * (26.7 * W + 903 * H) + dep : 135.3 - 30.8 * age + PA * (10.0 * W + 934 * H) + dep;
      const tmb = sex === "M" ? 68 - 43.3 * age + 712 * H + 19.2 * W : 189 - 17.6 * age + 625 * H + 7.9 * W;
      const eq = (sex === "M" ? "88,5 − 61,9·I + AF·(26,7·P + 903·A)" : "135,3 − 30,8·I + AF·(10·P + 934·A)") + ` + ${dep}`;
      return {get, tmb, PA, eq, group: "crescimento"};
    }
    return null;
  }
  // Média dos dois protocolos para adultos. Abaixo de 18 anos os fatores de atividade FAO/OMS 1985
  // (definidos para adultos) não entram na média: vale a DRI 2005, que inclui a energia de crescimento.
  const METHODS = ["media", "fao", "dri"];
  function energyOf(profile, now){
    const e = profile.energy || {}, age = ageOf(profile.birth, now), W = e.weight, Hc = e.height;
    if (!(W > 1 && W < 400 && Hc > 40 && Hc < 260) || age == null || !FAO_TMB[profile.sex]) return {ok: false, age};
    const f = faoTMB(profile.sex, age, W);
    const fa = FAO_FA[profile.sex][e.fao ?? 1];
    const fao = {tmb: f.v, fa, get: f.v * fa, coef: f.coef, cons: f.cons, range: f.range, adultOnly: age < 18};
    const dri = driCalc(profile.sex, age, W, Hc, e.dri ?? 1);
    // Adultos escolhem o protocolo. Padrão: DRI 2005 (equação única, derivada de água duplamente marcada,
    // usa idade, peso, altura e atividade). A média FAO/OMS + DRI continua disponível quando escolhida.
    let tmb, get, method;
    const pick = METHODS.includes(e.method) ? e.method : "dri";
    if (age < 18 && dri) { tmb = dri.tmb; get = dri.get; method = "dri"; }
    else if (dri && pick === "fao") { tmb = fao.tmb; get = fao.get; method = "fao"; }
    else if (dri && pick === "dri") { tmb = dri.tmb; get = dri.get; method = "dri"; }
    else if (dri) { tmb = (fao.tmb + dri.tmb) / 2; get = (fao.get + dri.get) / 2; method = "media"; }
    else { tmb = fao.tmb; get = null; method = "fao-tmb"; }
    return {ok: true, age, child: age < 18, fao, dri, tmb, get, method, imc: W / Math.pow(Hc / 100, 2)};
  }

  /* ---------- substituição de alimentos ---------- */
  // Papel principal do alimento: o macronutriente com maior participação na energia.
  function roleOf(f){
    const c = (f.c || 0) * 4, p = (f.p || 0) * 4, l = (f.fat || 0) * 9, t = c + p + l;
    if (!t) return null;
    if (c / t >= 0.5) return "c";
    if (p / t >= 0.3) return "p";   // ovo, carnes, peixes, iogurte natural
    if (l / t >= 0.5) return "l";
    return c >= p && c >= l ? "c" : p >= l ? "p" : "l";
  }
  const PREP = ["cozid", "cru", "grelhad", "assad", "frit", "refogad"];
  const prepOf = f => { const n = norm(f.name); return PREP.find(p => new RegExp("\\b" + p + "[ao]?s?\\b").test(n)) || ""; };
  const CRITERIA = {kcal: "kcal", c: "c", p: "p"};
  const per100 = (f, crit) => crit === "kcal" ? f.kcal : crit === "c" ? f.c : f.p;

  // Arredonda para medidas que dá para servir: frações de ¼ para medidas caseiras, 5 g para gramas.
  function roundQty(q, measure){
    if (measure.l === "Grama") return Math.max(5, Math.round(q / 5) * 5);
    return Math.max(0.25, Math.round(q * 4) / 4);
  }
  function equivalent(db, item, cand, crit, measureLabel){
    const base = calcItem(db, item);
    if (!base) return null;
    const target = crit === "kcal" ? base.kcal : base[crit];
    const v = per100(cand, crit);
    if (v == null || v <= 0 || !target) return null;
    const grams = target / v * 100;
    let m = measureOf(cand, measureLabel);
    if (m.l !== "Grama" && grams / m.g < 0.5) m = measureOf(cand, "Grama");   // "¼ de posta" vira gramas
    const qty = roundQty(grams / m.g, m);
    const it = {foodId: cand.id, measure: m.l, qty};
    const r = calcItem(db, it);
    return {food: cand, measure: m, qty, calc: r, delta: {kcal: r.kcal - base.kcal, c: r.c - base.c, p: r.p - base.p, l: r.l - base.l, f: r.f - base.f}};
  }
  // Sugestões: mesmo papel nutricional e, quando possível, mesmo preparo (cozido por cozido, etc.).
  function substitutes(db, item, crit = "kcal", opt = {}){
    const orig = db.get(item.foodId);
    if (!orig) return [];
    const role = roleOf(orig), prep = prepOf(orig), use = opt.use || {}, last = opt.last || {}, limit = opt.limit || 12;
    const scored = [];
    for (const f of db.list){
      if (f.id === orig.id || f.kcal == null || f.kcal <= 0 || roleOf(f) !== role) continue;
      if (f.kcal < orig.kcal * 0.3) continue;   // densidade energética muito menor exigiria porções irreais
      if (f.cat === "Produtos açucarados" && orig.cat !== f.cat) continue;   // açúcar não é sugestão de troca para outros grupos
      if (f.cat === "Verduras, hortaliças e derivados" && !["Verduras, hortaliças e derivados", "Cereais e derivados"].includes(orig.cat)) continue;
      if (crit !== "kcal" && per100(f, crit) == null) continue;
      const fp = prepOf(f);
      if (prep !== "cru" && fp === "cru" && f.cat !== "Frutas e derivados" && f.cat !== "Verduras, hortaliças e derivados") continue;
      let s = 0;
      if (f.common) s += 30;
      s += Math.min(use[f.id] || 0, 20) * 3;
      if (f.own) s += 8;
      if (f.cat === orig.cat) s += 10;
      if (fp && fp === prep) s += 12;
      if (f.ibge) s += 6;
      scored.push([s, f]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    const out = [], base = calcItem(db, item);
    // Volume realista: até 4× o peso original (ou +250 g para porções pequenas). Evita "900 g de brócolis no lugar do arroz".
    const maxG = Math.max(base.g * 4, base.g + 250);
    for (const [, f] of scored){
      const e = equivalent(db, item, f, crit, last[f.id]);
      if (e && e.calc.g <= maxG) out.push(e);
      if (out.length >= limit) break;
    }
    return out;
  }

  /* ---------- leitura de tabela nutricional (texto vindo do OCR) ---------- */
  // Rótulos brasileiros: formato RDC 429/2020 (colunas 100 g | porção | %VD) e formato antigo (só porção | %VD).
  // Nunca inventa valor: o que não for lido fica ausente e marcado para conferência.
  const LABEL_FIELDS = [
    ["kcal", /valor\s*energ/], ["addedSugar", /acucares?\s*adicionad/], ["sugar", /acucares?\s*(totais|total)?/],
    ["satFat", /saturad/], ["transFat", /\btrans\b/], ["fat", /gorduras?\s*totais|gordura\s*total|lipideos|gorduras?\b/],
    ["c", /carboidrat/], ["p", /protein/], ["fib", /fibra/], ["sodium", /sodio/]
  ];
  const num = s => parseFloat(String(s).replace(",", "."));
  function cleanOCR(text){
    return String(text)
      .replace(/\((9|q)\)/g, "(g)")                       // "(9)" lido no lugar de "(g)"
      .replace(/(^|\s)[oO](?=\s|$|g\b|%)/gm, "$10")        // "o" lido no lugar de zero
      .replace(/(^|\s)[oO]g\b/gm, "$10 g")
      .replace(/(\d)\s*[.,]\s*(\d)/g, "$1,$2");
  }
  function lineNumbers(rest){
    // números da linha depois do nome do nutriente; ignora %VD e kJ
    const out = [];
    const re = /(\d+(?:,\d+)?)\s*(%|kj|kcal|mg|g)?/gi;
    let m;
    while ((m = re.exec(rest))){
      const unit = (m[2] || "").toLowerCase();
      if (unit === "%" || unit === "kj") continue;
      out.push({raw: m[1], v: num(m[1]), unit});
    }
    return out;
  }
  function parseLabel(text, opt = {}){
    const t = cleanOCR(text);
    const lines = t.split(/\n+/).map(x => x.trim()).filter(Boolean);
    const flags = {}, found = {};
    const flag = (k, why) => { (flags[k] = flags[k] || []).push(why); };
    // porção declarada: "Porção: 30 g", "Porção de 200 ml"
    let portion = null;
    for (const ln of lines){
      const n = norm(ln);
      if (/porcoes?\s*por\s*embalagem/.test(n)) continue;
      const m = n.match(/porcao[^0-9]{0,20}?(\d+(?:,\d+)?)\s*(g|ml)\b/);
      if (m) { portion = {amount: num(m[1]), unit: m[2]}; break; }
    }
    const has100 = lines.some(ln => /\b100\s*(g|ml)\b/.test(norm(ln)) && !/porcao/.test(norm(ln)));
    const basis = has100 ? "100" : "porcao";
    for (const ln of lines){
      const n = norm(ln);
      const hit = LABEL_FIELDS.find(([, re]) => re.test(n));
      if (!hit || found[hit[0]]) continue;
      const key = hit[0];
      const label = n.match(hit[1]);
      let rest = cleanOCR(ln.slice(label.index + label[0].length)).replace(/\((kcal|g|mg|ml|kj)\)/gi, " ");
      let nums = lineNumbers(rest);
      if (key === "kcal"){
        const withK = nums.filter(x => x.unit === "kcal");
        if (withK.length) nums = withK;
      }
      if (!nums.length) continue;
      // "9,4 g" lido como "9,49": rótulos usam no máximo uma casa decimal em gramas
      for (const x of nums) if (/,\d9$/.test(x.raw) && !x.unit && key !== "sodium") { x.v = num(x.raw.slice(0, -1)); x.fixed = true; }
      found[key] = {per100: basis === "100" ? nums[0].v : null, portion: basis === "100" ? (nums[1] ? nums[1].v : null) : nums[0].v,
        fixed: nums.slice(0, 2).some(x => x.fixed)};
      if (found[key].fixed) flag(key, "leitura corrigida: confira");
    }
    // valores por 100 g (ou 100 ml)
    const per100 = {};
    for (const [key] of LABEL_FIELDS){
      const f = found[key];
      if (!f) { per100[key] = null; continue; }
      if (f.per100 != null) per100[key] = f.per100;
      else if (f.portion != null && portion && portion.amount > 0) per100[key] = Math.round(f.portion * 100 / portion.amount * 10) / 10;
      else { per100[key] = null; flag(key, "sem porção para converter"); }
      // coerência entre as colunas 100 g e porção
      if (f.per100 != null && f.portion != null && portion && portion.amount > 0){
        // Rótulos arredondam para uma casa abaixo de 10 e para inteiro acima: a diferença tolerada é a soma desses arredondamentos.
        const ratio = portion.amount / 100, expected = f.per100 * ratio;
        const half = v => key === "kcal" || key === "sodium" || v >= 10 ? 0.5 : 0.05;
        const tol = half(f.portion) + half(f.per100) * ratio + 0.02;
        const tiny = f.portion === 0 && expected < 0.5;   // "não significativo" declarado como zero
        if (!tiny && Math.abs(f.portion - expected) > tol) flag(key, "colunas 100 g e porção não batem: confira");
      }
    }
    for (const k of ["kcal", "c", "p", "fat"]) if (per100[k] == null) flag(k, "não encontrado");
    // energia coerente com os macronutrientes (Atwater 4/4/9, tolerância de 15%)
    if (per100.kcal != null && per100.c != null && per100.p != null && per100.fat != null && per100.kcal > 0){
      const atw = 4 * per100.c + 4 * per100.p + 9 * per100.fat;
      if (Math.abs(atw - per100.kcal) / per100.kcal > 0.15 && Math.abs(atw - per100.kcal) > 15) flag("kcal", "energia não bate com os macronutrientes");
    }
    if (per100.sugar != null && per100.c != null && per100.sugar > per100.c + 0.1) flag("sugar", "maior que os carboidratos");
    if (per100.satFat != null && per100.fat != null && per100.satFat > per100.fat + 0.1) flag("satFat", "maior que as gorduras totais");
    if (!portion && basis === "porcao") flag("portion", "porção não encontrada");
    if (opt.confidence != null && opt.confidence < 70) flag("geral", "foto pouco nítida: confira todos os valores");
    return {basis, portion, per100, found, flags, unitMl: !!(portion && portion.unit === "ml")};
  }

  /* ---------- movimento, sono e bem-estar ----------
     Datas como "AAAA-MM-DD" no horário local. Nada aqui é diagnóstico: são somas, médias e referências populacionais. */
  const pad = n => String(n).padStart(2, "0");
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const keyDate = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (k, n) => { const d = keyDate(k); d.setDate(d.getDate() + n); return dayKey(d); };
  const daysBetween = (a, b) => Math.round((keyDate(b) - keyDate(a)) / 864e5);
  // Semana de segunda a domingo que contém o dia informado.
  function weekKeys(today){ const wd = (keyDate(today).getDay() + 6) % 7, mon = addDays(today, -wd); return [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i)); }
  const toMin = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ""); return m ? +m[1] * 60 + +m[2] : null; };

  // Minutos de atividade na semana. "Leve" não entra na comparação com a referência da OMS (moderada ou vigorosa);
  // minutos vigorosos não são dobrados (simplificação conservadora).
  function moveWeek(list, today){
    const keys = weekKeys(today), days = keys.map(k => ({key: k, min: 0, mv: 0}));
    for (const e of list || []){ const d = days.find(x => x.key === e.date); if (d && e.min > 0){ d.min += e.min; if (e.intensity !== "leve") d.mv += e.min; } }
    const last = (list || []).filter(e => e.date <= today).map(e => e.date).sort().pop() || null;
    return {days, total: days.reduce((a, d) => a + d.min, 0), mv: days.reduce((a, d) => a + d.mv, 0), activeDays: days.filter(d => d.min > 0).length,
      last, sinceLast: last ? daysBetween(last, today) : null};
  }
  // Referência por idade (OMS 2020, diretrizes de atividade física). Abaixo de 5 anos não há meta numérica no app.
  function moveRef(age){
    if (age == null || age < 5) return null;
    if (age < 18) return {perDay: 60, week: 420, text: "OMS 2020: média de 60 minutos por dia de atividade moderada a vigorosa, de 5 a 17 anos."};
    return {week: 150, upper: 300, text: "OMS 2020: 150 a 300 minutos por semana de atividade moderada (ou 75 a 150 de vigorosa) para adultos."};
  }

  // Duração do sono em minutos; a hora de acordar pode ser no dia seguinte.
  function sleepMinutes(bed, wake){ const b = toMin(bed), w = toMin(wake); if (b == null || w == null) return null; let d = w - b; if (d <= 0) d += 1440; return d; }
  // Últimas n noites (chave = dia em que acordou). Regularidade: desvio padrão do horário de deitar, com 3 noites ou mais.
  function sleepStats(list, today, n = 7){
    const keys = Array.from({length: n}, (_, i) => addDays(today, i - n + 1));
    const nights = keys.map(k => { const e = (list || []).find(x => x.date === k); return {key: k, min: e ? sleepMinutes(e.bed, e.wake) : null, q: e ? e.quality ?? null : null}; });
    const got = nights.filter(x => x.min != null), cnt = got.length;
    const avg = cnt ? got.reduce((a, x) => a + x.min, 0) / cnt : null;
    // horário de deitar contado a partir do meio-dia: 23:30 e 00:30 ficam a 60 min um do outro
    const beds = keys.map(k => (list || []).find(x => x.date === k)).filter(Boolean).map(e => { const m = toMin(e.bed); return m == null ? null : (m < 720 ? m + 1440 : m); }).filter(m => m != null);
    let bedSD = null;
    if (beds.length >= 3){ const mu = beds.reduce((a, b) => a + b, 0) / beds.length; bedSD = Math.sqrt(beds.reduce((a, b) => a + (b - mu) ** 2, 0) / beds.length); }
    const lastE = (list || []).filter(e => e.date <= today).sort((a, b) => a.date < b.date ? 1 : -1)[0] || null;
    return {nights, count: cnt, avg, bedSD, last: lastE ? {date: lastE.date, min: sleepMinutes(lastE.bed, lastE.wake), quality: lastE.quality ?? null} : null};
  }
  // Duração recomendada (National Sleep Foundation, 2015). Abaixo de 3 anos inclui cochilos: sem referência no app.
  function sleepRef(age){
    if (age == null || age < 3) return null;
    const r = age < 6 ? [10, 13] : age < 14 ? [9, 11] : age < 18 ? [8, 10] : age < 65 ? [7, 9] : [7, 8];
    return {lo: r[0] * 60, hi: r[1] * 60, text: `National Sleep Foundation (2015): ${r[0]} a ${r[1]} horas por noite nessa idade.`};
  }

  /* Próxima ação: no máximo uma sugestão, só com dados suficientes, nunca diagnóstico.
     Pilares de movimento e sono só geram sugestão para quem já começou a registrá-los, e só para adultos. */
  function nextAction(c){
    if (!c.energyOk) return {id: "meta", tone: "start", title: "Calcule sua meta de energia", text: "Com peso e altura, o app estima o seu gasto diário.", go: "perfil"};
    if (!c.hasPlan) return {id: "plano", tone: "start", title: "Monte a primeira refeição", text: "Comece pela refeição que você repete mais.", go: "plano"};
    const adult = c.age != null && c.age >= 18;
    if (adult && c.move && c.move.count > 0){
      const w = c.move.week;
      if (w.mv < 150 && (w.sinceLast == null || w.sinceLast >= 2))
        return {id: "mover", tone: "suggest", title: "Uma caminhada de 20 minutos hoje?", text: `Nesta semana: ${w.mv} de 150 minutos da referência da OMS.`, go: "mover"};
    }
    if (adult && c.sleep && c.sleep.count > 0 && c.sleep.stats.count >= 5 && c.sleep.stats.bedSD > 60)
      return {id: "regular", tone: "suggest", title: "Deitar perto do mesmo horário", text: `Nos últimos 7 dias, o horário de dormir variou cerca de ${Math.round(c.sleep.stats.bedSD)} minutos para mais ou para menos.`, go: "sono"};
    if (adult && c.move && c.move.count > 0 && c.move.week.mv >= 150)
      return {id: "mover-ok", tone: "good", title: `${c.move.week.mv} minutos de movimento nesta semana`, text: "Você já alcançou a referência da OMS para adultos.", go: "mover"};
    return null;
  }

  return {dayKey, addDays, weekKeys, moveWeek, moveRef, sleepMinutes, sleepStats, sleepRef, nextAction,
    norm, normCh, words, parseLabel, friendly, createFoodDB, searchFoods, within1, measureOf, calcItem, sum, mealTotal, planTotal, macroSplit,
    ageOf, FAO_LV, FAO_FA, faoTMB, DRI_LV, driCalc, energyOf, roleOf, roundQty, equivalent, substitutes, CRITERIA, NO_DATA};
});
