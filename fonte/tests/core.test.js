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

test("hidratação: 35 mL/kg para adultos, valor manual prevalece, sem cálculo abaixo de 18 anos", () => {
  assert.deepEqual(C.waterRec(82, 40), {ml: 2870, src: "35ml"});
  assert.deepEqual(C.waterRec(82, 40, 2500), {ml: 2500, src: "manual"});
  assert.deepEqual(C.waterRec(50, 15), {ml: null, src: null});
  assert.deepEqual(C.waterRec(50, 15, 1800), {ml: 1800, src: "manual"});
  assert.deepEqual(C.waterRec(null, 40), {ml: null, src: null});
});

test("exames: próxima data = última + intervalo, com ajuste de fim de mês", () => {
  assert.equal(C.addMonths("2024-08-15", 12), "2025-08-15");
  assert.equal(C.addMonths("2025-01-31", 1), "2025-02-28");
  assert.equal(C.addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(C.addMonths("2024-11-10", 3), "2025-02-10");
  assert.equal(C.examNext({last: "2024-08-15", every: 6}), "2025-02-15");
  assert.equal(C.examNext({last: "2024-08-15", every: null}), null);
});

test("agenda: instante no fuso do compromisso, inclusive com horário de verão", () => {
  assert.equal(new Date(C.zonedEpoch("2026-11-12", "14:30", "America/Sao_Paulo")).toISOString(), "2026-11-12T17:30:00.000Z");
  assert.equal(new Date(C.zonedEpoch("2026-07-01", "09:00", "Europe/Lisbon")).toISOString(), "2026-07-01T08:00:00.000Z");
  assert.equal(new Date(C.zonedEpoch("2026-01-15", "09:00", "Europe/Lisbon")).toISOString(), "2026-01-15T09:00:00.000Z");
  assert.equal(C.zonedEpoch("", "10:00", "America/Sao_Paulo"), null);
});

test("agenda: próximo compromisso ignora cancelados, realizados e passados; sem horário vale até o fim do dia", () => {
  const tz = "America/Sao_Paulo", now = C.zonedEpoch("2026-11-10", "15:00", tz);
  const L = [
    {id: "a", status: "agendada", date: "2026-11-10", time: "14:00", tz},   // já passou hoje
    {id: "b", status: "cancelada", date: "2026-11-11", time: "09:00", tz},
    {id: "c", status: "realizada", date: "2026-11-11", time: "10:00", tz},
    {id: "d", status: "agendada", date: "2026-11-20", time: "08:00", tz},
    {id: "e", status: "agendada", date: "2026-11-12", time: "14:30", tz},
    {id: "f", status: "agendada", date: "2026-11-10", time: "", tz}        // hoje, sem horário: ainda vale
  ];
  assert.equal(C.nextEvent(L, now).id, "f");
  assert.deepEqual(C.upcoming(L, now).map(x => x.id), ["f", "e", "d"]);
  assert.equal(C.isOverdue(L[0], now), true);
  assert.equal(C.nextEvent(L.filter(x => x.id !== "f"), now).id, "e");
  assert.equal(C.nextEvent([{id: "x", status: "solicitado", date: "2026-12-01", tz}], now), null);
  assert.equal(C.nextEvent([], now), null);
});

test("agenda: consultas por mês separam realizadas, canceladas, futuras e a confirmar", () => {
  const tz = "America/Sao_Paulo", now = C.zonedEpoch("2026-06-15", "12:00", tz);
  const L = [
    {status: "realizada", date: "2026-01-05", tz}, {status: "realizada", date: "2026-01-20", tz}, {status: "cancelada", date: "2026-01-22", tz},
    {status: "agendada", date: "2026-06-01", time: "10:00", tz}, {status: "agendada", date: "2026-06-20", time: "10:00", tz},
    {status: "realizada", date: "2025-01-05", tz}
  ];
  const m = C.monthCounts(L, 2026, now);
  assert.deepEqual(m[0], {done: 2, cancel: 1, future: 0, pending: 0});
  assert.deepEqual(m[5], {done: 0, cancel: 0, future: 1, pending: 1});
  assert.equal(m.reduce((a, x) => a + x.done, 0), 2);
  assert.deepEqual(C.yearCounts([{status: "realizado", date: "2025-03-01"}, {status: "realizado", date: "2026-02-01"}, {status: "realizado", date: "2026-05-01"}, {status: "agendado", date: "2026-09-01"}], "realizado"),
    [{year: 2026, n: 2}, {year: 2025, n: 1}]);
});

test("exames: nomes equivalentes viram o mesmo marcador; conversões validadas por analito", () => {
  assert.equal(C.markerKey("LDL-C"), "ldl"); assert.equal(C.markerKey("Colesterol LDL"), "ldl");
  assert.equal(C.markerKey("Hemoglobina Glicada"), "hba1c"); assert.equal(C.markerKey("25-OH Vitamina D"), "vitd");
  assert.equal(C.markerKey("PCR"), "x:pcr");   // PCR comum não é a ultrassensível: não se misturam
  assert.equal(Math.round(C.convert("glicose", 5.5, "mmol/L", "mg/dL") * 10) / 10, 99.1);
  assert.equal(Math.round(C.convert("hba1c", 48, "mmol/mol", "%") * 10) / 10, 6.5);
  assert.equal(Math.round(C.convert("vitd", 75, "nmol/L", "ng/mL") * 10) / 10, 30);
  assert.equal(Math.round(C.convert("ldl", 3.36, "mmol/L", "mg/dL")), 130);
  assert.equal(C.convert("insulina", 10, "µUI/mL", "pmol/L"), null);   // sem fator validado: não converte
  assert.equal(C.convert("x:pcr", 3, "mg/L", "mg/dL"), null);
  assert.equal(C.convert("tsh", 2.1, "uUI/mL", "mUI/L"), 2.1);
  assert.equal(C.parseNum("5,6"), 5.6); assert.equal(C.parseNum("250.000"), 250000); assert.equal(C.parseNum("1.234,5"), 1234.5); assert.equal(C.parseNum("abc"), null);
});

test("exames: série do gráfico em uma unidade só, em ordem de data, sem misturar unidades incompatíveis", () => {
  const R = [
    {id: 1, key: "glicose", value: 92, unit: "mg/dL", date: "2025-03-10"},
    {id: 2, key: "glicose", value: 5.5, unit: "mmol/L", date: "2024-01-10"},
    {id: 3, key: "glicose", value: 101, unit: "mg/dL", date: "2026-01-10", lo: 70, hi: 99},
    {id: 4, key: "insulina", value: 8, unit: "µUI/mL", date: "2025-01-01"},
    {id: 5, key: "glicose", value: 90, unit: "g/L", date: "2025-06-01"}
  ];
  const s = C.labSeries(R, "glicose");
  assert.equal(s.unit, "mg/dL");
  assert.deepEqual(s.points.map(p => p.id), [2, 1, 3]);
  assert.equal(s.points[0].conv, true); assert.equal(Math.round(s.points[0].v), 99);
  assert.equal(s.points[0].orig.value, 5.5);
  assert.equal(s.excluded, 1);
  assert.equal(s.points[2].hi, 99);
  // o eixo do tempo usa o intervalo real entre as datas
  assert.equal(Math.round((s.points[1].t - s.points[0].t) / 864e5), 425); assert.equal(Math.round((s.points[2].t - s.points[1].t) / 864e5), 306);
});

test("lembretes: arquivo de calendário com instante correto, avisos e texto protegido", () => {
  const e = {uid: "a1@briceno", title: "Infiltração · joelho direito, sala 3; retorno", date: "2026-11-12", time: "14:30", tz: "America/Sao_Paulo", durMin: 45,
    location: "Clínica Vida", rem: [10080, 1440, 120, 30, {at: "2026-11-12T07:15"}], now: Date.UTC(2026, 10, 3, 12)};
  const ics = C.icsCalendar([e]);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(ics.includes("DTSTART:20261112T173000Z"));           // 14h30 em São Paulo (UTC−3) = 17h30 UTC
  assert.ok(ics.includes("DTEND:20261112T181500Z"));
  for (const t of ["TRIGGER:-P7D", "TRIGGER:-P1D", "TRIGGER:-PT2H", "TRIGGER:-PT30M", "TRIGGER;VALUE=DATE-TIME:20261112T101500Z"]) assert.ok(ics.includes(t), t);
  assert.equal(ics.split("BEGIN:VALARM").length - 1, 5);
  assert.ok(ics.includes("SUMMARY:Infiltração · joelho direito\\, sala 3\; retorno"));
  // nenhuma linha passa de 75 bytes; linhas longas continuam com espaço
  for (const ln of ics.split("\r\n")) assert.ok(Buffer.byteLength(ln, "utf8") <= 75, ln);
  const long = C.icsCalendar([Object.assign({}, e, {desc: "Observação ".repeat(20)})]);
  assert.ok(long.includes("\r\n "));
  assert.equal(C.icsBefore(1500), "-P1DT1H"); assert.equal(C.icsBefore(0), "PT0S");
  // fuso diferente: o mesmo horário de parede em Lisboa vira outro instante
  assert.ok(C.icsCalendar([Object.assign({}, e, {tz: "Europe/Lisbon"})]).includes("DTSTART:20261112T143000Z"));
  // sem horário: dia inteiro, avisos às 9h00 do fuso do compromisso
  const d = C.icsCalendar([{uid: "x", title: "Exame", date: "2026-11-18", time: "", tz: "America/Sao_Paulo", rem: [1440]}]);
  assert.ok(d.includes("DTSTART;VALUE=DATE:20261118") && d.includes("DTEND;VALUE=DATE:20261119") && d.includes("TRIGGER;VALUE=DATE-TIME:20261117T120000Z"));
  // repetição (medicamento, hidratação): hora local flutuante + regra semanal
  const r = C.icsCalendar([{uid: "m", title: "Lembrete", date: "2026-11-04", time: "08:00", floating: true, durMin: 5, rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR", rem: [0], transparent: true}]);
  assert.ok(r.includes("DTSTART:20261104T080000\r\n") && r.includes("DURATION:PT5M") && r.includes("RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR") && r.includes("TRIGGER:PT0S") && r.includes("TRANSP:TRANSPARENT"));
});

test("lembretes: instantes dos avisos e horários do intervalo", () => {
  const e = {date: "2026-11-12", time: "14:30", tz: "America/Sao_Paulo"};
  const t = C.remTimes(e, [30, 1440, 30]);
  assert.equal(t.length, 2); assert.equal(new Date(t[0]).toISOString(), "2026-11-11T17:30:00.000Z"); assert.equal(new Date(t[1]).toISOString(), "2026-11-12T17:00:00.000Z");
  assert.deepEqual(C.slotTimes("08:00", "12:00", 120), ["08:00", "10:00", "12:00"]);
  assert.deepEqual(C.slotTimes("09:00", "10:30", 45), ["09:00", "09:45", "10:30"]);
  assert.deepEqual(C.slotTimes("12:00", "08:00", 60), []); assert.deepEqual(C.slotTimes("08:00", "20:00", 5), []);
  assert.equal(C.slotTimes("00:00", "23:59", 15).length, 24);   // limite: no máximo 24 avisos por dia
});

test("indicadores: semanas sem registro não viram zero; dia mais recente prevalece; comparação neutra", () => {
  const mv = [{date: "2026-11-02", min: 30}, {date: "2026-11-04", min: 45}, {date: "2026-10-20", min: 60}];
  const w = C.weekSeries(mv, e => e.min);
  assert.deepEqual(w.map(x => [x.date, x.v, x.days]), [["2026-10-19", 60, 1], ["2026-11-02", 75, 2]]);   // a semana de 26/10 não aparece
  const d = C.daySeries([{date: "2026-11-01", v: 80, at: 1}, {date: "2026-11-01", v: 79.4, at: 2}, {date: "2026-10-01", v: 81}], e => e.v);
  assert.deepEqual(d.map(x => x.v), [81, 79.4]);
  const c = C.compareSeries(d); assert.ok(Math.abs(c.diff + 1.6) < 1e-9); assert.equal(c.days, 31); assert.equal(c.n, 2);
  assert.equal(C.compareSeries(d.slice(0, 1)), null);
  // suplementos e medicamentos ativos: não pausados, dentro das datas de início e término
  assert.equal(C.medActive({}, "2026-11-04"), true); assert.equal(C.medActive({paused: true}, "2026-11-04"), false);
  assert.equal(C.medActive({end: "2026-11-03"}, "2026-11-04"), false); assert.equal(C.medActive({start: "2026-11-05"}, "2026-11-04"), false);
  assert.equal(C.medActive({start: "2026-11-04", end: "2026-11-04"}, "2026-11-04"), true);
});
