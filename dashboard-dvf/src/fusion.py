"""
src/fusion.py — Étape FUSION (cf. Jour 5 « L'Art de la Fusion »).

On enrichit les transactions DVF (prix) avec le contexte INSEE (population).
Leçon clé du jour 5 : « une clé mal choisie donne une fusion ratée ». Les noms de
communes du DVF ne sont pas normalisés (« MARSEILLE 1ER »…), donc on fusionne sur la
clé fiable `code_departement` via pd.merge (jointure LEFT : on garde toutes les ventes).
"""

import pandas as pd


def fusionner(df_dvf, df_insee, verbose=True):
    avant = len(df_dvf)
    df = pd.merge(df_dvf, df_insee, on="code_departement", how="left")
    if verbose:
        taux = round(df["population"].notna().mean() * 100, 1)
        print(f"[Fusion] pd.merge DVF × INSEE sur 'code_departement' (LEFT) : "
              f"{avant:,} lignes, {taux} % enrichies en population".replace(",", " "))
    return df
