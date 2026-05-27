# 🏠 Dashboard immobilier — DVF France (1er semestre 2025)

Tableau de bord d'analyse du marché immobilier français, construit **de A à Z** :
pipeline **Python / Pandas** (ETL complet) + **dashboard Streamlit interactif** (filtres,
carte, recherche). Une version **HTML/CSS/JS** (Chart.js + Leaflet) est aussi fournie.
Données : **DVF** (Demandes de Valeurs Foncières), `dataset_dvf_s1_2025.csv`.

> Projet Yboost IA & Data — rendu « Dashboard final ». Aboutissement du parcours de l'année.

---

## 🎯 Objectif
Donner de la valeur à ~400 000 transactions immobilières brutes en **racontant une histoire** :
où achète-t-on, à quel prix, comment se segmente le marché, et zoom sur les Bouches-du-Rhône.

## 🗂️ Le dashboard contient
- **KPIs** : prix médian/moyen national, volume, départements, appartement vs maison.
- **Insights** : lecture narrative automatique des chiffres clés.
- **Évolution mensuelle** : prix médian €/m² (courbe) + volume (barres), bascule appart/maison/tous.
- **Carte choroplèthe** de France : prix moyen au m² par département (Leaflet + GeoJSON).
- **Top départements** & **top communes** les plus chers.
- **Segmentation** Éco / Standard / Luxe (doughnut).
- **Appartement vs Maison** (prix médian au m²).
- **🎯 Focus Bouches-du-Rhône (13)** : KPIs du département mis en perspective nationale.
- **Tableau** de tous les départements, triable et avec recherche.

---

## 🔧 Pipeline ETL (reproduit tout le parcours du module, jour par jour)

```
 SOURCES                STOCKAGE             TRANSFORMATION                 RESTITUTION
 ┌─ DVF (CSV)  ┐        ┌───────────┐        ┌────────────────────┐
 │  collecte   │──────▶ │  SQLite   │──────▶ │ nettoyage (Pandas) │──┐
 └─────────────┘        │ raw_dvf   │        └────────────────────┘  │
 ┌─ INSEE (API)┐──────▶ │ raw_insee │                                ▼
 │ collecte_   │        │ dvf_clean │        ┌────────────────────┐  fusion (pd.merge
 │  insee      │        └───────────┘        │ feature_engineering│  DVF × INSEE)
 └─────────────┘                             │  + agregation      │──▶ data/dashboard_data.json
                                             └────────────────────┘        │
                                                                           ▼  front (lit ce JSON)
```

| Étape | Module | Jour |
|-------|--------|------|
| Collecte DVF (CSV) | `src/collecte.py` | J1–J2 |
| Collecte INSEE (population, API Géo) | `src/collecte_insee.py` | J2 |
| Stockage base relationnelle | `src/base_donnees.py` (SQLite `immobilier.db`) | J3 |
| Nettoyage Pandas (lit/écrit la base) | `src/nettoyage.py` + `notebooks/01_exploration_nettoyage.ipynb` | J4 |
| Fusion DVF × INSEE (`pd.merge`) | `src/fusion.py` | J5 |
| Feature engineering + agrégation | `src/feature_engineering.py`, `src/agregation.py` | J6 |
| Dashboard (dataviz interactive) | `index.html`, `static/` | J7–J8 |

`main.py` orchestre tout le pipeline (avec `logs/errors.txt` en cas d'erreur).

---

## ▶️ Lancer le projet

```bash
pip install -r requirements.txt
python3 main.py                       # 1) génère la base + les données (pipeline ETL)
```

Puis **au choix**, deux dashboards :

```bash
# A) Dashboard Streamlit — INTERACTIF (filtres live), recommandé pour la démo
streamlit run app_streamlit.py        # http://localhost:8501

# B) Dashboard HTML/CSS/JS — statique, fonctionne hors-ligne
python3 serveur.py                    # http://localhost:8000
```

> **Streamlit** (option A) est le dashboard principal : filtres dynamiques (département,
> type de bien, segment, prix, mois), recherche, carte, et export CSV — tout se recalcule
> en direct sur les ~373 000 transactions. Le dashboard HTML (option B) est une version
> statique alternative (option « front HTML/CSS/JS » de la consigne).

---

## 📁 Arborescence

```
dashboard-dvf/
├── main.py                       # orchestrateur du pipeline ETL complet
├── app_streamlit.py              # 🟢 dashboard Streamlit interactif (filtres, carte, recherche)
├── .streamlit/config.toml        # thème du dashboard Streamlit
├── serveur.py                    # dashboard HTML alternatif (bibliothèque standard)
├── src/
│   ├── collecte.py               # J1/J2 — source DVF (CSV)
│   ├── collecte_insee.py         # J2   — source INSEE (population, API Géo)
│   ├── base_donnees.py           # J3   — SQLite (raw_dvf, raw_insee, dvf_clean)
│   ├── nettoyage.py              # J4   — nettoyage Pandas (lit/écrit la base)
│   ├── fusion.py                 # J5   — pd.merge DVF × INSEE
│   ├── feature_engineering.py    # J6   — prix_m2, mois, segments
│   └── agregation.py             # J6/7 — groupby, classements, focus 13 → JSON
├── notebooks/
│   └── 01_exploration_nettoyage.ipynb   # J4 — exploration documentée
├── data/
│   ├── raw/dataset_dvf_s1_2025.csv   # dataset DVF source
│   ├── raw/insee_communes.json       # cache INSEE (généré)
│   ├── immobilier.db                 # base SQLite (générée)
│   └── dashboard_data.json           # données prêtes à visualiser
├── logs/errors.txt                # journal d'erreurs du pipeline (généré)
├── index.html
├── static/{css,js,vendor}/        # style, dashboard.js, Chart.js + Leaflet + departements.geojson
├── docs/doc_dvf.md                # doc de l'API DVF (référence)
├── soutenance/                    # support oral (PPTX + script + images)
├── requirements.txt
└── README.md
```

## 🧮 Choix d'analyse (à savoir défendre à l'oral)
- **prix_m2 = valeur_fonciere / surface_reelle**, filtré entre 500 et 15 000 €/m² pour écarter
  les aberrations DVF (ventes multi-lots, erreurs de saisie).
- **Médiane** privilégiée à la moyenne pour les prix (résistante aux valeurs extrêmes).
- Classement des départements restreint à la **métropole** (cohérent avec le fond de carte).
- Segments : **Éco** < 4 000 · **Standard** 4 000–8 000 · **Luxe** > 8 000 €/m².

## 📊 Source
Données DVF — data.gouv.fr · Contours départements : france-geojson (licence ouverte).
