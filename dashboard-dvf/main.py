"""
main.py — Orchestrateur du pipeline ETL complet (architecture modulaire, cf. Jour 2).

Reproduit tout le parcours du module, étape par étape :

  COLLECTE (DVF + INSEE)  →  STOCKAGE SQLite  →  NETTOYAGE  →  FUSION
                                              →  FEATURE ENGINEERING  →  AGRÉGATION  →  dashboard_data.json

  · Jour 1/2 : collecte multi-sources (DVF + INSEE)
  · Jour 3   : base SQLite (raw_dvf, raw_insee)
  · Jour 4   : nettoyage Pandas (lecture/écriture base)
  · Jour 5   : fusion pd.merge DVF × INSEE
  · Jour 6   : feature engineering + agrégation
  · Jour 7   : dashboard (front)

Usage :  python3 main.py     puis     python3 serveur.py
"""

import os
import traceback
from datetime import datetime

from src.collecte import collecter_dvf
from src.collecte_insee import collecter_insee
from src import base_donnees
from src.nettoyage import nettoyer
from src.fusion import fusionner
from src.feature_engineering import enrichir
from src.agregation import agreger, sauvegarder

LOG = os.path.join(os.path.dirname(__file__), "logs", "errors.txt")


def loguer_erreur(etape, e):
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {etape} : {e}\n")
        f.write(traceback.format_exc() + "\n")


def run():
    print("=" * 64)
    print(" PIPELINE ETL DVF — du brut au dashboard")
    print("=" * 64)
    try:
        # 1) COLLECTE (Jour 1/2) ------------------------------------------
        df_dvf = collecter_dvf()
        df_insee = collecter_insee()

        # 2) STOCKAGE SQLite (Jour 3) -------------------------------------
        base_donnees.ecrire(df_dvf, "raw_dvf")
        base_donnees.ecrire(df_insee, "raw_insee")

        # 3) NETTOYAGE (Jour 4) : lit raw_dvf, nettoie, écrit dvf_clean ----
        df_clean, lignes_brutes = nettoyer()

        # 4) FUSION (Jour 5) : DVF × INSEE --------------------------------
        df_insee = base_donnees.lire("raw_insee")
        df = fusionner(df_clean, df_insee)

        # 5) FEATURE ENGINEERING (Jour 6) ---------------------------------
        df = enrichir(df)

        # 6) AGRÉGATION (Jour 6/7) → JSON ---------------------------------
        resultat = agreger(df, lignes_brutes)
        sauvegarder(resultat)

        print("=" * 64)
        print(" Terminé ✅  Lancez :  python3 serveur.py")
        print("=" * 64)
    except Exception as e:                       # robustesse (Jour 3) : on logue, on ne crash pas en silence
        loguer_erreur("pipeline", e)
        print(f"\n[ERREUR] {e}\n→ détail enregistré dans logs/errors.txt")
        raise


if __name__ == "__main__":
    run()
