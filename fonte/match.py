"""Cruza alimentos TACO com as medidas caseiras da POF/IBGE 2008-2009."""
import csv, json, re, sys, unicodedata, collections

DL = sys.argv[1]
OUT = sys.argv[2]
TACO = f"{DL}/brolesi/data/processed/taco/taco_composicao.csv"
POF = f"{DL}/brolesi/data/processed/pof/pof_medidas_caseiras.csv"

STOP = set("de do da dos das com sem e em ao a o tipo para ou etc qualquer sabor nao especificado".split())
PREP = {
    "cozid": "CROZIDO(A)", "cru": "CRU(A)", "frit": "FRITO(A)", "assad": "ASSADO(A)",
    "grelhad": "GRELHADO(A)/BRASA/CHURRASCO", "refogad": "REFOGADO(A)", "ensopad": "ENSOPADO",
    "empanad": "EMPANADO(A)/A MILANESA", "milanesa": "EMPANADO(A)/A MILANESA",
}
PREP_WORDS = set("cozido cozida cozidos cozidas cru crua crus cruas frito frita fritos fritas assado assada assados "
                 "assadas grelhado grelhada grelhados grelhadas refogado refogada ensopado empanado empanada "
                 "milanesa".split())


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def stem(w):
    for suf in ("oes", "aes", "es", "s"):
        if len(w) > 4 and w.endswith(suf):
            return w[: -len(suf)] + ("ao" if suf in ("oes", "aes") else "")
    if len(w) > 3 and w[-1] in "ao":
        return w[:-1]
    return w


FORM = {stem(w) for w in "suco doce polpa extrato pure molho farofa chips calda barra pasta po geleia bolo biscoito "
         "farinha oleo sorvete iogurte vitamina refresco creme torta mousse pudim salada sopa caldo pao sanduiche "
         "pizza leite queijo cha bala chocolate empada coxinha esfiha mingau flocos mistura farelo amido "
         "conserva enlatado desidratado seco cristalizada".split()}


def toks(s):
    return [stem(w) for w in norm(s).split() if w not in STOP]


taco = list(csv.DictReader(open(TACO, encoding="utf-8")))
pof_rows = list(csv.DictReader(open(POF, encoding="utf-8")))

# POF: (codigo, preparacao) -> {desc, ref, measures{label: g}}
pof = collections.OrderedDict()
for x in pof_rows:
    k = (x["codigo_alimento"], x["descricao_preparacao"])
    e = pof.setdefault(k, {"desc": x["descricao_alimento"], "prep": x["descricao_preparacao"],
                           "ref": x["descricao_medida_referencia"], "m": {}})
    e["m"][x["descricao_medida"]] = float(x["quantidade_g"])
pof_foods = {}
for (code, prep), e in pof.items():
    main, _, alt = e["desc"].partition("(")
    pof_foods.setdefault(code, {"desc": e["desc"], "toks": toks(main), "alt": set(toks(alt)), "preps": {}})["preps"][prep] = e

STATUS = json.load(open(sys.argv[4], encoding="utf-8")) if len(sys.argv) > 4 else {}
overrides = json.load(open(sys.argv[3], encoding="utf-8")) if len(sys.argv) > 3 else {}


def best_match(t):
    name = t["descricao"]
    tt = [w for w in toks(name) if w not in {stem(p) for p in PREP_WORDS}]
    if not tt:
        return None
    base = tt[0]
    best, bscore = None, 0
    for code, f in pof_foods.items():
        ft = f["toks"]
        if base not in ft:
            continue
        hit = sum(1 for w in tt if w in ft or w in f["alt"])
        extra = sum(1 for w in ft if w not in tt)
        score = hit * 3 - extra * 1.2 + (4 if ft and ft[0] == base else 0)
        score -= 6 * sum(1 for w in ft if w in FORM and w not in tt)
        score -= 4 * sum(1 for w in tt if w in FORM and w not in ft)
        if score > bscore:
            best, bscore = code, score
    return best if bscore >= 4 else None


def pick_prep(t, code):
    preps = pof_foods[code]["preps"]
    tn = norm(t["descricao"])
    for w, p in PREP.items():
        if re.search(rf"\b{w}[ao]?s?\b", tn) and p in preps:
            return p
    if "NAO SE APLICA" in preps:
        return "NAO SE APLICA"
    for p in ("CROZIDO(A)", "CRU(A)", "ASSADO(A)", "GRELHADO(A)/BRASA/CHURRASCO", "FRITO(A)", "REFOGADO(A)"):
        if p in preps:
            return p
    return next(iter(preps))


SKIP = {"QUILO", "GRAMA", "LITRO", "MILILITRO"}


WORD_FIX = {"cafe": "café", "cha": "chá", "xicara": "xícara", "pedaco": "pedaço", "porcao": "porção", "pao": "pão",
            "requeijao": "requeijão", "medio": "médio", "taca": "taça", "file": "filé", "pescoco": "pescoço",
            "coracao": "coração", "acucar": "açúcar", "tigela": "tigela", "media": "média", "pe": "pé", "maco": "maço", "sache": "sachê"}


def label(m):
    s = re.sub(r"[A-Za-z]+", lambda w: WORD_FIX.get(w.group(0).lower(), w.group(0).lower()), m)
    return s[:1].upper() + s[1:]


cats = []
foods = []
report = []
for t in taco:
    if t["categoria"] not in cats:
        cats.append(t["categoria"])
    # Na TACO: "Tr" (traço) e "NA" (não se aplica) valem 0; "*" (em reanálise) é dado ausente (None).
    st = STATUS.get(str(int(t["numero_alimento"])), {})
    FIELD = {"carboidrato_g": "carb", "proteina_g": "prot", "lipideos_g": "lip", "fibra_g": "fib"}
    def num(k):
        if t[k] not in ("", None):
            return round(float(t[k]), 1)
        mark = st.get(FIELD[k])
        return 0.0 if mark in ("NA", "Tr") else None
    fid = int(t["numero_alimento"])
    ov = overrides.get(str(fid))
    code = prep = None
    if ov == "none":
        code = None
    elif ov:
        code, prep = (ov.split("|") + [None])[:2]
    else:
        code = best_match(t)
    measures = []
    ref = None
    if code and code in pof_foods:
        prep = prep or pick_prep(t, code)
        e = pof_foods[code]["preps"].get(prep) or next(iter(pof_foods[code]["preps"].values()))
        # cru (grãos, carnes) não herda medidas de preparações cozidas
        raw = re.search(r"\bcru[as]?\b", norm(t["descricao"])) is not None
        if raw and not ov and e["prep"] not in ("CRU(A)",) and t["categoria"] in (
                "Cereais e derivados", "Leguminosas e derivados", "Carnes e derivados", "Pescados e frutos do mar"):
            code = None
        else:
            ref = e["ref"]
            ms = [(k, g) for k, g in e["m"].items() if k not in SKIP and g > 0]
            name_toks = set(toks(t["descricao"]))
            named = [k for k, _ in ms if set(toks(k)) & name_toks and len(toks(k)) == 1]
            if named:
                ref = named[0]
            ms.sort(key=lambda kg: (kg[0] != ref, kg[1]))
            measures = [[label(k), round(g, 1)] for k, g in ms]
    foods.append([fid, t["descricao"], round(float(t["energia_kcal"] or 0)), num("carboidrato_g"), num("proteina_g"),
                  num("lipideos_g"), num("fibra_g"), cats.index(t["categoria"]), measures])
    report.append(f"{fid:4d} {t['descricao'][:55]:55s} -> {(pof_foods[code]['desc'][:40] + ' / ' + (prep or '')) if code else '-'}"
                  f" | {measures[0] if measures else ''}")

json.dump({"cats": cats, "foods": foods}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("\n".join(report))
print("matched", sum(1 for f in foods if f[8]), "of", len(foods), file=sys.stderr)
