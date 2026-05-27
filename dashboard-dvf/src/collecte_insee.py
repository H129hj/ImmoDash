"""
src/collecte_insee.py — COLLECTE de la 2ᵉ source : INSEE (cf. Jour 2).

« Aucune donnée n'est parfaite seule : DVF donne le prix, l'INSEE donne le contexte. »
On récupère la population par commune (API Géo, données INSEE) puis on l'agrège
par département — la clé fiable pour la fusion (cf. Jour 5).

Robuste : vérification du status_code, try/except, et fallback si le réseau échoue.
"""

import os
import json
import pandas as pd

try:
    import requests
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

URL_INSEE = ("https://geo.api.gouv.fr/communes"
             "?fields=nom,codeDepartement,population&format=json")
CACHE = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "insee_communes.json")


def _telecharger():
    """Télécharge les données INSEE/Géo (population par commune)."""
    if not _HAS_REQUESTS:
        return None
    try:
        r = requests.get(URL_INSEE, timeout=40)
        if r.status_code == 200:
            data = r.json()
            with open(CACHE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            return data
        print(f"[INSEE] status {r.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[INSEE] erreur réseau : {e}")
    return None


def collecter_insee():
    """Renvoie un DataFrame INSEE agrégé par département : population, nb_communes."""
    data = _telecharger()
    if data is None and os.path.exists(CACHE):       # fallback : cache local
        print("[Collecte] INSEE : utilisation du cache local")
        with open(CACHE, encoding="utf-8") as f:
            data = json.load(f)
    if not data:
        raise RuntimeError("Impossible de collecter les données INSEE (réseau + cache absents).")

    communes = pd.DataFrame(data)
    communes["population"] = pd.to_numeric(communes["population"], errors="coerce").fillna(0)
    insee = (communes.groupby("codeDepartement")
             .agg(population=("population", "sum"),
                  nb_communes_insee=("nom", "count"))
             .reset_index()
             .rename(columns={"codeDepartement": "code_departement"}))
    print(f"[Collecte] INSEE : {len(insee)} départements "
          f"({int(insee['population'].sum()):,} habitants)".replace(",", " "))
    return insee
