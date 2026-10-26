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
  const adult = C.energyOf({sex: "M", birth: "1994-06-15", energy: {weight: 70, height: 175, fao: 1, dri: 1}}, NOW);
  assert.equal(adult.method, "media");
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
