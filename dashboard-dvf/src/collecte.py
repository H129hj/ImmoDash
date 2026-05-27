"""
src/collecte.py — COLLECTE des sources (cf. Jour 1 & 2).

Source 1 : DVF — le dataset officiel du module (data/raw/dataset_dvf_s1_2025.csv).
On lit le CSV brut (attention à l'encodage et au typage) et on le renvoie tel quel ;
le nettoyage viendra plus tard (séparation collecte / nettoyage).
"""

import os
import pandas as pd

CSV_DVF = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "dataset_dvf_s1_2025.csv")


def collecter_dvf():
    """Charge le dataset DVF brut depuis le CSV (source 1)."""
    df = pd.read_csv(CSV_DVF, dtype={"code_departement": "string"}, low_memory=False)
    print(f"[Collecte] DVF (CSV) : {len(df):,} transactions brutes".replace(",", " "))
    return df
