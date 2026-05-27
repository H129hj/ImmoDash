"""
src/agregation.py — Étape AGRÉGATION & restitution (cf. Jour 6 + Jour 7).

On passe de l'analyse ligne par ligne à des statistiques globales (groupby, tris)
puis on assemble le fichier unique lu par le dashboard : data/dashboard_data.json.
"""

import json
import os
from datetime import datetime
import pandas as pd

ICI = os.path.dirname(__file__)
GEOJSON = os.path.join(ICI, "..", "static", "vendor", "departements.geojson")
SORTIE = os.path.join(ICI, "..", "data", "dashboard_data.json")

MOIS_FR = ["", "janv.", "févr.", "mars", "avr.", "mai", "juin",
           "juil.", "août", "sept.", "oct.", "nov.", "déc."]


def noms_departements():
    """code -> nom, depuis le GeoJSON (sert aussi pour la carte)."""
    with open(GEOJSON, encoding="utf-8") as f:
        geo = json.load(f)
    return {feat["properties"]["code"]: feat["properties"]["nom"] for feat in geo["features"]}


def i(x):
    return None if pd.isna(x) else int(round(x))


def agreger(df, lignes_brutes):
    noms_dep = noms_departements()

    # ---------------- KPIs nationaux ----------------
    prix_median = i(df["prix_m2"].median())
    prix_moyen = i(df["prix_m2"].mean())
    nb_tx = len(df)
    nb_communes = df["commune"].nunique()
    nb_dep = df["code_departement"].nunique()
    par_type = df.groupby("type_bien")["prix_m2"].median()
    prix_appart = i(par_type.get("Appartement"))
    prix_maison = i(par_type.get("Maison"))
    part_luxe = round((df["segment_prix"] == "Luxe").mean() * 100, 1)

    # ---------------- Évolution mensuelle ----------------
    evo = df.groupby("mois_label").agg(prix_m2=("prix_m2", "median"),
                                       volume=("prix_m2", "size")).reset_index()
    appart = df[df.type_bien == "Appartement"].groupby("mois_label")["prix_m2"].median()
    maison = df[df.type_bien == "Maison"].groupby("mois_label")["prix_m2"].median()
    evolution = [{
        "mois": r["mois_label"],
        "label": MOIS_FR[int(r["mois_label"].split("-")[1])],
        "prix_m2": i(r["prix_m2"]),
        "volume": i(r["volume"]),
        "prix_appart": i(appart.get(r["mois_label"])),
        "prix_maison": i(maison.get(r["mois_label"])),
    } for _, r in evo.iterrows()]

    # ---------------- Segments Éco / Standard / Luxe ----------------
    seg = df["segment_prix"].value_counts()
    segments = [{"segment": s, "nb": i(seg.get(s, 0)),
                 "part_pct": round(seg.get(s, 0) / nb_tx * 100, 1)}
                for s in ["Éco", "Standard", "Luxe"]]

    # ---------------- Maison vs Appartement ----------------
    type_bien = [{"type": t, "prix_m2_median": i(par_type.get(t)),
                  "nb": i((df.type_bien == t).sum())} for t in ["Appartement", "Maison"]]

    # ---------------- Classement des départements ----------------
    agg = {"prix_moyen": ("prix_m2", "mean"), "prix_median": ("prix_m2", "median"),
           "nb": ("prix_m2", "size")}
    if "population" in df.columns:                          # contexte INSEE (issu de la fusion)
        agg["population"] = ("population", "first")
    g = df.groupby("code_departement").agg(**agg).reset_index()
    g = g[g["nb"] >= 100]                                   # départements suffisamment représentés
    g = g[~g["code_departement"].str.startswith("97")]      # métropole (cohérent avec le fond de carte)
    g = g[g["code_departement"] != "Inconnu"]
    g = g.sort_values("prix_moyen", ascending=False)
    classement = []
    for _, r in g.iterrows():
        pop = r["population"] if "population" in g.columns and not pd.isna(r["population"]) else None
        # dynamisme = nb de ventes rapporté à la population (pour 100 000 habitants)
        dyn = round(r["nb"] / pop * 100000) if pop else None
        classement.append({
            "code": r["code_departement"],
            "nom": noms_dep.get(r["code_departement"], r["code_departement"]),
            "prix_moyen": i(r["prix_moyen"]),
            "prix_median": i(r["prix_median"]),
            "nb": i(r["nb"]),
            "population": i(pop),
            "ventes_100k_hab": dyn,
        })
    # rang du 13
    codes_tries = list(g["code_departement"])
    rang_bdr = codes_tries.index("13") + 1 if "13" in codes_tries else None

    # ---------------- Top communes (≥ 50 ventes) ----------------
    gc = df.groupby(["commune", "code_departement"]).agg(
        prix_median=("prix_m2", "median"), nb=("prix_m2", "size")).reset_index()
    gc = gc[gc["nb"] >= 100].sort_values("prix_median", ascending=False)
    top_communes = [{
        "commune": r["commune"].title(),
        "departement": r["code_departement"],
        "prix_m2_median": i(r["prix_median"]),
        "nb": i(r["nb"]),
    } for _, r in gc.head(15).iterrows()]

    # ---------------- Focus Bouches-du-Rhône (13) ----------------
    bdr = df[df["bouches_du_rhone"]]
    bdr_communes = bdr.groupby("commune").agg(
        prix_median=("prix_m2", "median"), nb=("prix_m2", "size")).reset_index()
    bdr_communes = bdr_communes[bdr_communes["nb"] >= 30].sort_values("prix_median", ascending=False)
    focus_bdr = {
        "nb_transactions": len(bdr),
        "prix_m2_median": i(bdr["prix_m2"].median()),
        "prix_appart": i(bdr[bdr.type_bien == "Appartement"]["prix_m2"].median()),
        "prix_maison": i(bdr[bdr.type_bien == "Maison"]["prix_m2"].median()),
        "rang_departement": rang_bdr,
        "top_communes": [{"commune": r["commune"].title(),
                          "prix_m2_median": i(r["prix_median"]), "nb": i(r["nb"])}
                         for _, r in bdr_communes.head(6).iterrows()],
    }

    # ---------------- Insights (narration auto) ----------------
    dep_cher = classement[0]
    dep_eco = classement[-1]
    insights = [
        f"Sur {nb_tx:,} transactions ({df['mois_label'].min()} → {df['mois_label'].max()}), "
        f"le prix médian national s'établit à {prix_median:,} €/m².".replace(",", " "),
        f"{dep_cher['nom']} est le département le plus cher ({dep_cher['prix_moyen']:,} €/m² en moyenne), "
        f"contre {dep_eco['prix_moyen']:,} €/m² pour {dep_eco['nom']}.".replace(",", " "),
        f"Au m², une maison se vend en médiane {abs(round((prix_maison-prix_appart)/prix_appart*100))} % "
        f"{'plus' if prix_maison>=prix_appart else 'moins'} cher qu'un appartement "
        f"({prix_maison:,} € contre {prix_appart:,} €).".replace(",", " "),
        f"{part_luxe} % des biens dépassent 8 000 €/m² (segment « Luxe »), "
        f"tandis que la majorité reste dans le segment « Éco » (< 4 000 €/m²).",
    ]
    # insight issu de la FUSION INSEE (volume rapporté à la population)
    avec_dyn = [c for c in classement if c.get("ventes_100k_hab")]
    if avec_dyn:
        plus_dyn = max(avec_dyn, key=lambda c: c["ventes_100k_hab"])
        insights.append(
            f"En croisant avec la population (INSEE), {plus_dyn['nom']} est le marché le plus "
            f"dynamique : {plus_dyn['ventes_100k_hab']} ventes pour 100 000 habitants.")

    return {
        "meta": {
            "titre": "Marché immobilier français — DVF 1er semestre 2025",
            "source": "DVF (data.gouv.fr) + contexte démographique INSEE (fusion par département)",
            "genere_le": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "periode": f"{df['mois_label'].min()} → {df['mois_label'].max()}",
            "lignes_brutes": lignes_brutes,
            "lignes_propres": nb_tx,
            "pct_conserve": round(nb_tx / lignes_brutes * 100, 1),
        },
        "kpis": {
            "prix_m2_median": prix_median, "prix_m2_moyen": prix_moyen,
            "nb_transactions": nb_tx, "nb_communes": nb_communes, "nb_departements": nb_dep,
            "prix_appart_median": prix_appart, "prix_maison_median": prix_maison,
            "part_luxe_pct": part_luxe,
        },
        "evolution_mensuelle": evolution,
        "segments": segments,
        "type_bien": type_bien,
        "classement_departements": classement,
        "top_communes": top_communes,
        "focus_bdr": focus_bdr,
        "insights": insights,
    }


def sauvegarder(resultat):
    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(resultat, f, ensure_ascii=False, indent=2)
    print(f"[Agrégation] data/dashboard_data.json écrit "
          f"({resultat['kpis']['nb_transactions']:,} transactions)".replace(",", " "))
