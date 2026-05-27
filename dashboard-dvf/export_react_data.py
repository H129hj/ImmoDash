"""
export_react_data.py — Données du dashboard React : 5 ans, TOUTE la France.

On exploite les AGRÉGATS de l'API DVF (dvf-api.data.gouv.fr) plutôt que les ~10 Go
de transactions brutes : l'API fournit déjà les médianes €/m² par mois, par département,
par commune et la distribution des prix sur 2021-2025 (~4,5 M de mutations).

Sortie : dashboard-react/public/data.json  (3 vues : Tous / Appartement / Maison)
"""

import json, os, time
import requests

API = "https://dvf-api.data.gouv.fr"
GEO = "https://geo.api.gouv.fr"
ICI = os.path.dirname(os.path.abspath(__file__))
GEOJSON = os.path.join(ICI, "static", "vendor", "departements.geojson")
SORTIE = os.path.join(ICI, "..", "dashboard-react", "public", "data.json")
MOIS = ["", "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."]

# champ médian / compteur selon la vue
MED = {"Tous": "m_am", "Appartement": "m_a", "Maison": "m_m"}
CNT = {"Tous": "am", "Appartement": "a", "Maison": "m"}
DIST = {"Tous": "apt_maison", "Appartement": "appartement", "Maison": "maison"}


def get(url, essais=3):
    for _ in range(essais):
        try:
            r = requests.get(url, timeout=40)
            if r.status_code == 200:
                return r.json()
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
    return None


def noms_departements():
    geo = json.load(open(GEOJSON, encoding="utf-8"))
    return {f["properties"]["code"]: f["properties"]["nom"] for f in geo["features"]}


def population_par_dep():
    data = get(f"{GEO}/communes?fields=codeDepartement,population&format=json")
    pop = {}
    if data:
        for c in data:
            d = c.get("codeDepartement"); p = c.get("population") or 0
            if d:
                pop[d] = pop.get(d, 0) + p
    return pop


def num(x):
    try:
        return None if x is None else int(round(float(x)))
    except (TypeError, ValueError):
        return None


def segments_from_dist(dist, key):
    bloc = dist.get(key, {})
    xs, ys = bloc.get("xaxis", []), bloc.get("yaxis", [])
    eco = std = luxe = 0
    for (lo, hi), n in zip(xs, ys):
        mid = (lo + hi) / 2
        if mid < 4000: eco += n
        elif mid <= 8000: std += n
        else: luxe += n
    tot = eco + std + luxe or 1
    return [{"segment": s, "nb": int(v), "part": round(v / tot * 100, 1)}
            for s, v in [("Éco", eco), ("Standard", std), ("Luxe", luxe)]]


def vue(slice_, nation, mois, deps, communes, dist, noms, pop):
    """mois = série limitée aux 36 derniers mois (3 ans)."""
    med, cnt = MED[slice_], CNT[slice_]
    n0 = nation
    nb_3ans = sum(num(m[cnt]) or 0 for m in mois)
    # KPIs (prix médian = médiane API ; volume = 3 ans)
    kpis = {
        "prix_median": num(n0[med]),
        "nb": nb_3ans,
        "prix_appart": num(n0["m_a"]),
        "prix_maison": num(n0["m_m"]),
    }
    # évolution mensuelle (36 mois) + tendance 3 ans
    evo = [{"mois": MOIS[int(m["d"].split("-")[1])] + " " + m["d"][2:4],
            "prix": num(m[med]), "volume": num(m[cnt])} for m in mois]
    serie = [e["prix"] for e in evo if e["prix"]]
    if len(serie) >= 24:
        debut = sum(serie[:12]) / 12; fin = sum(serie[-12:]) / 12
        kpis["evolution_pct"] = round((fin - debut) / debut * 100, 1)
    else:
        kpis["evolution_pct"] = None
    # départements (métropole, >= 500 ventes sur la période)
    drows = []
    for d in deps:
        code = d["c"]
        if code.startswith("97") or num(d[cnt]) is None or num(d[cnt]) < 500:
            continue
        p = pop.get(code)
        drows.append({
            "code": code, "nom": noms.get(code, d.get("n", code)),
            "prix_median": num(d[med]), "nb": num(d[cnt]),
            "population": num(p),
            "ventes_100k": round(num(d[cnt]) / p * 100000) if p else None,
        })
    drows.sort(key=lambda x: x["prix_median"] or 0, reverse=True)
    # communes (top national, >= 300 ventes sur la période)
    crows = []
    for cm in communes:
        if num(cm[cnt]) is None or num(cm[cnt]) < 300:
            continue
        crows.append({"commune": cm["n"].title(), "dep": cm["c"][:2],
                      "prix": num(cm[med]), "nb": num(cm[cnt])})
    crows.sort(key=lambda x: x["prix"] or 0, reverse=True)
    return {"kpis": kpis, "departements": drows, "evolution": evo,
            "segments": segments_from_dist(dist, DIST[slice_]), "communes": crows[:20]}


def main():
    print("Collecte des agrégats API DVF (2021-2025, France)…")
    nation = get(f"{API}/nation")["data"][0]
    mois = get(f"{API}/nation/mois")["data"]
    mois.sort(key=lambda m: m["d"])
    mois = mois[-36:]   # 3 dernières années
    dist = get(f"{API}/distribution/nation")
    deps = get(f"{API}/departement")["data"]
    noms = noms_departements()
    pop = population_par_dep()
    print(f"  national OK · {len(mois)} mois · {len(deps)} départements")

    # communes : on agrège les communes de chaque département métropolitain
    communes = []
    metro = [d["c"] for d in deps if not d["c"].startswith("97")]
    print(f"  communes : {len(metro)} départements à interroger…")
    for i, code in enumerate(metro):
        r = get(f"{API}/departement/{code}/communes")
        if r:
            communes += r["data"]
        if i % 20 == 0:
            print(f"    … {i}/{len(metro)}")
        time.sleep(0.15)
    print(f"  {len(communes)} communes collectées")

    periode = f"{mois[0]['d'][:4]} – {mois[-1]['d'][:4]}"
    nb_total = sum(num(m["am"]) or 0 for m in mois)
    out = {
        "meta": {
            "periode": periode,
            "source": "API DVF · data.gouv.fr (3 ans) + population INSEE",
            "nb_total": nb_total,
        },
        "Tous": vue("Tous", nation, mois, deps, communes, dist, noms, pop),
        "Appartement": vue("Appartement", nation, mois, deps, communes, dist, noms, pop),
        "Maison": vue("Maison", nation, mois, deps, communes, dist, noms, pop),
        "type_compare": [
            {"type": "Appartement", "prix": num(nation["m_a"]), "nb": num(nation["a"])},
            {"type": "Maison", "prix": num(nation["m_m"]), "nb": num(nation["m"])},
        ],
    }
    os.makedirs(os.path.dirname(SORTIE), exist_ok=True)
    json.dump(out, open(SORTIE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"[OK] {SORTIE}")
    print(f"     {out['meta']['nb_total']:,} transactions · {periode} · "
          f"{len(out['Tous']['departements'])} départements".replace(",", " "))


if __name__ == "__main__":
    main()
