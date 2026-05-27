"""
src/base_donnees.py — Couche STOCKAGE SQLite (cf. Jour 3 « Stockage et Bases de Données »).

On centralise les données dans une base relationnelle locale (immobilier.db) plutôt
que dans des fichiers éparpillés. Tables : raw_dvf, raw_insee, dvf_clean.

« Une base bien pensée, c'est une donnée déjà à moitié propre. »
"""

import os
import sqlite3
import pandas as pd

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "immobilier.db")


def connexion():
    return sqlite3.connect(BASE)


def ecrire(df, table):
    """Insère un DataFrame dans une table (remplace si elle existe)."""
    with connexion() as conn:
        df.to_sql(table, conn, if_exists="replace", index=False)
    print(f"[BDD] Table '{table}' écrite : {len(df):,} lignes".replace(",", " "))


def lire(table):
    """Charge une table SQLite dans un DataFrame (cf. Jour 4 : read_sql_query)."""
    with connexion() as conn:
        df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
    print(f"[BDD] Table '{table}' lue : {len(df):,} lignes".replace(",", " "))
    return df


def existe(table):
    with connexion() as conn:
        cur = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        return cur.fetchone() is not None
