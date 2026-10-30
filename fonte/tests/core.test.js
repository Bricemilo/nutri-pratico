// Testes das regras nutricionais críticas. Rodar: node --test fonte/tests
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const C = require("../core.js");
const data = require(path.join(__dirname, "..", "foods.json"));
const db = C.createFoodDB(data);
const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);
const NOW = new Date("2026-10-26T12:00:00");

test("idade completa considera o aniversário", () => {
  assert.equal(C.ageOf("1994-06-15", NOW), 32);
  assert.equal(C.ageOf("1994-10-26", NOW), 32);
  assert.equal(C.ageOf("1994-10-27", NOW), 31);
});

test("FAO/OMS 1985: TMB e GET de adulto", () => {
  const t = C.faoTMB("M", 32, 70);
  near(t.v, 11.6 * 70 + 879);
  const f = C.faoTMB("F", 25, 60);
  near(f.v, 14.7 * 60 + 496);
  assert.deepEqual(C.FAO_FA.M, [1.30, 1.55, 1.78, 2.10]);
  assert.deepEqual(C.FAO_FA.F, [1.30, 1.56, 1.64, 1.82]);
});

test("DRI 2005: EER e BEE de adulto", () => {
  const r = C.driCalc("M", 32, 70, 175, 1);
  near(r.get, 662 - 9.53 * 32 + 1.11 * (15.91 * 70 + 539.6 * 1.75));
  near(r.tmb, 293 - 3.8 * 32 + 456.4 * 1.75 + 10.12 * 70);
  const w = C.driCalc("F", 40, 62, 165, 2);
  near(w.get, 354 - 6.91 * 40 + 1.27 * (9.36 * 62 + 726 * 1.65));
});

test("DRI 2005: crianças e adolescentes incluem energia de crescimento", () => {
  const c = C.driCalc("F", 7, 24, 122, 1);   // 3–8 anos: +20 kcal
  near(c.get, 135.3 - 30.8 * 7 + 1.16 * (10 * 24 + 934 * 1.22) + 20);
  const a = C.driCalc("M", 15, 55, 170, 2);  // 9–18 anos: +25 kcal
  near(a.get, 88.5 - 61.9 * 15 + 1.26 * (26.7 * 55 + 903 * 1.70) + 25);
  assert.equal(C.driCalc("M", 2, 12, 88, 1), null);
});

test("média dos protocolos para adultos; só DRI abaixo de 18 anos", () => {
  const adult = C.energyOf({sex: "M", birth: "1994-06-15", energy: {weight: 70, height: 175, fao: 1, dri: 1, method: "media"}}, NOW);
  assert.equal(adult.method, "media");
  assert.equal(C.energyOf({sex: "M", birth: "1994-06-15", energy: {weight: 70, height: 175, fao: 1, dri: 1}}, NOW).method, "dri");   // padrão: DRI 2005
  near(adult.get, (adult.fao.get + adult.dri.get) / 2);
  near(adult.tmb, (adult.fao.tmb + adult.dri.tmb) / 2);
  const kid = C.energyOf({sex: "F", birth: "2019-05-05", energy: {weight: 24, height: 122, fao: 1, dri: 1}}, NOW);
  assert.equal(kid.method, "dri");
  assert.equal(kid.child, true);
  near(kid.get, kid.dri.get);
  assert.equal(C.energyOf({sex: "M", birth: "1994-06-15", energy: {weight: 0, height: 175}}, NOW).ok, false);
});

test("alimentos sem dados na TACO ficam fora da base", () => {
  for (const id of [450, 457, 458, 591]) assert.equal(db.get(id), undefined);
  assert.ok(db.get(3));
});

test("cálculo do item: medida caseira × quantidade", () => {
  const r = C.calcItem(db, {foodId: 3, measure: "Colher de arroz/servir", qty: 4});   // arroz branco cozido
  near(r.g, 180);
  near(r.kcal, db.get(3).kcal * 1.8);
  near(r.c, db.get(3).c * 1.8);
  assert.equal(C.calcItem(db, {foodId: 3, measure: "Colher de arroz/servir", qty: null}), null);
  const g = C.calcItem(db, {foodId: 3, measure: "Grama", qty: 100});
  near(g.kcal, db.get(3).kcal);
});

test("dado ausente não vira zero em silêncio", () => {
  const f = db.get(280);   // bacalhau refogado: fibra "*" na TACO
  assert.equal(f.fib, null);
  const r = C.calcItem(db, {foodId: 280, measure: "Grama", qty: 100});
  assert.equal(r.miss.f, true);
  const t = C.sum([r, C.calcItem(db, {foodId: 3, measure: "Grama", qty: 100})]);
  assert.equal(t.miss.f, 1);
  const oil = db.get(260);   // azeite: carboidrato "NA" (não se aplica) = 0 legítimo
  assert.equal(oil.c, 0);
});

test("total do plano é a soma das refeições", () => {
  const plan = {meals: [
    {items: [{foodId: 53, measure: "Unidade", qty: 1}, {foodId: 488, measure: "Unidade", qty: 2}]},
    {items: [{foodId: 3, measure: "Colher de arroz/servir", qty: 3}, {foodId: 561, measure: "Concha", qty: 1}, {foodId: null}]}
  ]};
  const t = C.planTotal(db, plan);
  const m = plan.meals.map(x => C.mealTotal(db, x));
  for (const k of ["kcal", "c", "p", "l", "f", "g"]) near(t[k], m[0][k] + m[1][k]);
  const s = C.macroSplit(t);
  near(s.c + s.p + s.l, 100);
});

test("busca tolera acentos, plural e um erro de digitação", () => {
  assert.equal(C.searchFoods(db, "pao frances")[0].id, 53);
  assert.equal(C.searchFoods(db, "arroz")[0].id, 3);
  assert.ok(C.searchFoods(db, "fejao carioca").some(f => f.id === 561));
  assert.ok(C.searchFoods(db, "ovos cozido").some(f => f.id === 488));
  assert.ok(C.searchFoods(db, "arrz branco").some(f => f.id === 3));
  assert.deepEqual(C.searchFoods(db, ""), []);
});

test("arredondamento de quantidades", () => {
  assert.equal(C.roundQty(1.13, {l: "Unidade"}), 1.25);
  assert.equal(C.roundQty(0.05, {l: "Unidade"}), 0.25);
  assert.equal(C.roundQty(123, {l: "Grama"}), 125);
});

test("substituição por energia: arroz por outros carboidratos, sem repetir o alimento", () => {
  const item = {foodId: 3, measure: "Colher de arroz/servir", qty: 4};
  const base = C.calcItem(db, item);
  const subs = C.substitutes(db, item, "kcal");
  assert.ok(subs.length >= 5);
  assert.ok(subs.every(s => s.food.id !== 3));
  assert.ok(subs.some(s => [91, 129, 88].includes(s.food.id)), "inclui batata ou mandioca");
  for (const s of subs) assert.ok(Math.abs(s.calc.kcal - base.kcal) / base.kcal < 0.35, `${s.food.dn} longe demais`);
  assert.ok(subs.every(s => s.calc.g <= Math.max(base.g * 4, base.g + 250)), "volume realista");
  assert.ok(!subs.some(s => [100, 78, 109].includes(s.food.id)), "sem verduras no lugar do arroz");
  const carb = C.substitutes(db, item, "c");
  assert.ok(carb.every(s => Math.abs(s.calc.c - base.c) / base.c < 0.35));
});

test("substituição por proteína mantém o papel do alimento", () => {
  const item = {foodId: 410, measure: "Filé", qty: 1};   // peito de frango grelhado
  const subs = C.substitutes(db, item, "p");
  assert.ok(subs.length >= 5);
  assert.ok(subs.every(s => C.roleOf(s.food) === "p"));
});

test("nomes do dia a dia", () => {
  assert.equal(db.get(488).dn, "Ovo cozido");
  assert.equal(db.get(410).dn, "Peito de frango sem pele grelhado");
  assert.equal(db.get(377).dn, "Patinho sem gordura grelhado");
});

/* ---------- leitura de tabela nutricional: textos reais saídos do OCR (tesseract.js 6, por) ---------- */
const fs = require("node:fs");
const ocr = n => fs.readFileSync(path.join(__dirname, "ocr", `label-${n}.png.txt`), "utf8");

test("rótulo novo (100 g | porção): usa a coluna de 100 g e a porção declarada", () => {
  const r = C.parseLabel(ocr("novo"));
  assert.equal(r.basis, "100");
  assert.deepEqual(r.portion, {amount: 30, unit: "g"});
  assert.equal(r.per100.kcal, 380);
  assert.equal(r.per100.c, 67);
  assert.equal(r.per100.p, 14);
  assert.equal(r.per100.fib, 9.7);
  assert.equal(r.per100.sugar, 1.2);
  assert.equal(r.per100.addedSugar, 0);   // "o" lido no lugar de zero
  assert.equal(r.per100.sodium, 4);
});

test("rótulo novo: dígito trocado pelo OCR (7,3 lido como 7,8) é sinalizado", () => {
  const r = C.parseLabel(ocr("novo"));
  assert.equal(r.per100.fat, 7.8);
  assert.ok(r.flags.fat && r.flags.fat.length, "gorduras precisam de conferência");
  assert.equal(r.flags.c, undefined);
  assert.equal(r.flags.p, undefined);
});

test("rótulo antigo (só porção): converte para 100 ml e corrige '9,4 g' lido como '9,49'", () => {
  const r = C.parseLabel(ocr("antigo"));
  assert.equal(r.basis, "porcao");
  assert.deepEqual(r.portion, {amount: 200, unit: "ml"});
  assert.equal(r.unitMl, true);
  assert.equal(r.per100.kcal, 61);      // 122 kcal / 200 ml (ignora 512 kJ e 6% VD)
  assert.equal(r.per100.c, 4.7);
  assert.equal(r.per100.p, 3.1);
  assert.equal(r.per100.fat, 3.3);
  assert.equal(r.per100.sodium, 65);
  assert.ok(r.flags.c && r.flags.p, "correções ficam marcadas para conferência");
});

test("foto inclinada e desfocada gera os mesmos valores", () => {
  assert.deepEqual(C.parseLabel(ocr("foto")).per100, C.parseLabel(ocr("novo")).per100);
});

test("rótulo sem informação não inventa valores", () => {
  const r = C.parseLabel("INFORMAÇÃO NUTRICIONAL\nPorção: 25 g\nValor energético (kcal) 120\nProteínas (g)");
  assert.equal(r.per100.kcal, 480);
  assert.equal(r.per100.p, null);
  assert.equal(r.per100.c, null);
  assert.ok(r.flags.c.includes("não encontrado"));
  assert.ok(r.flags.p.includes("não encontrado"));
});

test("energia incoerente com os macronutrientes é sinalizada", () => {
  const r = C.parseLabel("Porção: 100 g\n100 g 100 g %VD\nValor energético (kcal) 900 900 45\nCarboidratos (g) 20 20 7\nProteínas (g) 5 5 7\nGorduras totais (g) 2 2 3");
  assert.ok(r.flags.kcal.some(x => /não bate/.test(x)));
});

test("método de energia escolhido para adultos; crianças sempre DRI", () => {
  const base = {sex: "M", birth: "1994-06-15", energy: {weight: 70, height: 175, fao: 1, dri: 1}};
  const media = C.energyOf({...base, energy: {...base.energy, method: "media"}}, NOW);
  const fao = C.energyOf({...base, energy: {...base.energy, method: "fao"}}, NOW);
  const dri = C.energyOf({...base, energy: {...base.energy, method: "dri"}}, NOW);
  assert.equal(fao.method, "fao"); near(fao.get, media.fao.get); near(fao.tmb, media.fao.tmb);
  assert.equal(dri.method, "dri"); near(dri.get, media.dri.get);
  near(media.get, (fao.get + dri.get) / 2);
  const kid = C.energyOf({sex: "F", birth: "2019-05-05", energy: {weight: 24, height: 122, method: "fao"}}, NOW);
  assert.equal(kid.method, "dri");
});

test("movimento: semana de segunda a domingo, leve fora da referência", () => {
  const log = [{date: "2026-10-26", min: 30, intensity: "moderada"}, {date: "2026-10-28", min: 45, intensity: "vigorosa"},
    {date: "2026-10-29", min: 20, intensity: "leve"}, {date: "2026-10-25", min: 60}, {date: "2026-11-02", min: 50}];
  const w = C.moveWeek(log, "2026-10-30");   // sexta-feira
  assert.deepEqual(w.days.map(d => d.key), ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
  assert.equal(w.total, 95); assert.equal(w.mv, 75); assert.equal(w.activeDays, 3);
  assert.equal(w.last, "2026-10-29"); assert.equal(w.sinceLast, 1);
  assert.equal(C.moveRef(40).week, 150); assert.equal(C.moveRef(10).perDay, 60); assert.equal(C.moveRef(3), null);
});

test("sono: duração atravessa a meia-noite; regularidade pelo horário de deitar", () => {
  assert.equal(C.sleepMinutes("23:30", "07:00"), 450);
  assert.equal(C.sleepMinutes("01:15", "08:45"), 450);
  assert.equal(C.sleepMinutes("22:00", "22:00"), 1440);
  assert.equal(C.sleepMinutes("", "07:00"), null);
  const regular = ["23:00", "23:30", "00:00", "23:15", "23:45"].map((b, i) => ({date: C.addDays("2026-10-30", -i), bed: b, wake: "07:00"}));
  const s = C.sleepStats(regular, "2026-10-30");
  assert.equal(s.count, 5); assert.ok(s.bedSD < 25, "23:00–00:00 é regular (" + s.bedSD + ")");
  assert.equal(s.nights.length, 7); assert.equal(s.last.date, "2026-10-30");
  const irregular = ["21:30", "02:00", "22:00", "01:30", "23:00"].map((b, i) => ({date: C.addDays("2026-10-30", -i), bed: b, wake: "08:00"}));
  assert.ok(C.sleepStats(irregular, "2026-10-30").bedSD > 60);
  assert.equal(C.sleepStats([{date: "2026-10-30", bed: "23:00", wake: "07:00"}], "2026-10-30").bedSD, null);   // poucas noites: sem regularidade
  assert.deepEqual([C.sleepRef(30).lo, C.sleepRef(30).hi], [420, 540]); assert.equal(C.sleepRef(70).hi, 480); assert.equal(C.sleepRef(2), null);
});

test("próxima ação: uma por vez, só com dados, nada para crianças nos novos pilares", () => {
  const today = "2026-10-30";
  const move = (list) => ({count: list.length, week: C.moveWeek(list, today)});
  const sleep = (list) => ({count: list.length, stats: C.sleepStats(list, today)});
  assert.equal(C.nextAction({energyOk: false, hasPlan: false, age: 40}).id, "meta");
  assert.equal(C.nextAction({energyOk: true, hasPlan: false, age: 40}).id, "plano");
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 40, move: move([]), sleep: sleep([])}), null);   // sem registros: sem cobrança
  const pouco = [{date: "2026-10-27", min: 30}];
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 40, move: move(pouco)}).id, "mover");
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 40, move: move([{date: "2026-10-29", min: 30}])}), null);   // ativo ontem
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 10, move: move(pouco)}), null);   // criança: sem meta adulta
  const muito = [{date: "2026-10-26", min: 90}, {date: "2026-10-28", min: 70}];
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 40, move: move(muito)}).id, "mover-ok");
  const irregular = ["21:30", "02:00", "22:00", "01:30", "23:00"].map((b, i) => ({date: C.addDays(today, -i), bed: b, wake: "08:00"}));
  assert.equal(C.nextAction({energyOk: true, hasPlan: true, age: 40, move: move(muito), sleep: sleep(irregular)}).id, "regular");
});

test("consumo do dia: soma só as refeições feitas naquele dia, com os valores guardados", () => {
  const log = [{date: "2026-10-30", mealId: "m1", t: {kcal: 449.4, c: 60, p: 25, l: 12, f: 6}},
    {date: "2026-10-30", mealId: "m2", t: {kcal: 425.2, c: 42, p: 42.7, l: 7.6, f: 11.4}},
    {date: "2026-10-29", mealId: "m1", t: {kcal: 999, c: 1, p: 1, l: 1, f: 1}}];
  const d = C.eatenDay(log, "2026-10-30");
  assert.equal(d.count, 2); assert.deepEqual(d.mealIds, ["m1", "m2"]);
  near(d.t.kcal, 874.6); near(d.t.c, 102); near(d.t.p, 67.7); near(d.t.l, 19.6); near(d.t.f, 17.4);
  assert.equal(C.eatenDay(log, "2026-10-28").count, 0); assert.equal(C.eatenDay(undefined, "2026-10-30").t.kcal, 0);
});
