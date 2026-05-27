"""
src/nettoyage.py — Étape NETTOYAGE (cf. Jour 4 « Le Grand Nettoyage avec Pandas »).

Workflow du data cleaner : Observer → Diagnostiquer → Corriger → Documenter.
On charge la table raw_dvf depuis SQLite, on diagnostique (.info / isnull / describe),
on corrige, puis on resauvegarde la table propre (dvf_clean) dans la base.

« Garbage In, Garbage Out » : si on bâcle ici, le dashboard sera faux.
"""

import pandas as pd
from src.base_donnees import lire, ecrire

# bornes de bon sens pour écarter les anomalies de saisie (DVF contient des erreurs)
VALEUR_MIN, VALEUR_MAX = 1000, 50_000_000     # €
SURFACE_MIN, SURFACE_MAX = 5, 10000           # m²


def nettoyer(verbose=True):
    # --- Observer : on charge depuis la base (Jour 4) ---
    df = lire("raw_dvf")
    lignes_brutes = len(df)

    # --- Diagnostiquer ---
    if verbose:
        print("[Nettoyage] NaN par colonne :", df.isnull().sum().to_dict())

    # --- Corriger ---
    df = df.drop_duplicates()                                   # doublons exacts
    df = df.dropna(subset=["valeur_fonciere", "surface_reelle"])  # valeurs essentielles
    df = df[(df["surface_reelle"] >= SURFACE_MIN) & (df["surface_reelle"] <= SURFACE_MAX)]
    df = df[(df["valeur_fonciere"] >= VALEUR_MIN) & (df["valeur_fonciere"] <= VALEUR_MAX)]
    df = df[df["type_bien"].isin(["Maison", "Appartement"])]    # biens d'habitation
    df["date_mutation"] = pd.to_datetime(df["date_mutation"], format="%d/%m/%Y", errors="coerce")
    df = df.dropna(subset=["date_mutation"])
    df["code_departement"] = df["code_departement"].astype("string").fillna("Inconnu").str.strip()
    df = df.reset_index(drop=True)                              # ne pas oublier reset_index !

    # --- Documenter + sauvegarder la table propre dans la base (Jour 4, étape 6) ---
    if verbose:
        taux = round(len(df) / lignes_brutes * 100, 1)
        print(f"[Nettoyage] {lignes_brutes:,} → {len(df):,} lignes ({taux} % conservé)".replace(",", " "))
    ecrire(df.assign(date_mutation=df["date_mutation"].astype(str)), "dvf_clean")

    return df, lignes_brutes
