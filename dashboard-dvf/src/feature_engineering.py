"""
src/feature_engineering.py — Étape FEATURE ENGINEERING (cf. Jour 6).

Créer des variables utiles à partir des données existantes :
  - prix_m2          : valeur_fonciere / surface_reelle
  - annee, mois      : extraits de date_mutation
  - segment_prix     : Éco / Standard / Luxe (catégorisation métier)
  - bouches_du_rhone : booléen (focus géographique, comme à l'exercice noté)

On filtre aussi le prix_m2 dans une plage cohérente (anti-aberrations).
"""

import pandas as pd

PRIX_M2_MIN, PRIX_M2_MAX = 500, 15000   # plage réaliste pour du résidentiel (anti-aberrations DVF)


def enrichir(df, verbose=True):
    df = df.copy()

    # --- Indicateur clé : prix au m² ---
    df["prix_m2"] = (df["valeur_fonciere"] / df["surface_reelle"]).round(2)
    df = df[(df["prix_m2"] >= PRIX_M2_MIN) & (df["prix_m2"] <= PRIX_M2_MAX)]

    # --- Variables temporelles ---
    df["annee"] = df["date_mutation"].dt.year
    df["mois"] = df["date_mutation"].dt.month
    df["mois_label"] = df["date_mutation"].dt.strftime("%Y-%m")

    # --- Segmentation du marché (règles vues à l'exercice noté) ---
    def segmenter(p):
        if p < 4000:
            return "Éco"
        elif p <= 8000:
            return "Standard"
        return "Luxe"
    df["segment_prix"] = df["prix_m2"].apply(segmenter)

    # --- Focus géographique : Bouches-du-Rhône (département 13) ---
    df["bouches_du_rhone"] = df["code_departement"] == "13"

    df = df.reset_index(drop=True)

    if verbose:
        print(f"[Features] prix_m2, annee, mois, segment_prix créés sur {len(df):,} lignes".replace(",", " "))
        print("[Features] Répartition segments :", df["segment_prix"].value_counts().to_dict())

    return df


if __name__ == "__main__":
    from nettoyage import nettoyer
    df, _ = nettoyer(verbose=False)
    enrichir(df)
