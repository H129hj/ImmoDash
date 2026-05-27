# 🏠 ImmoDash — Tableau de bord du marché immobilier français (DVF)

Dashboard d'analyse des **Demandes de Valeurs Foncières (DVF)** — les transactions
immobilières publiques de l'État — sur les **3 dernières années (2023-2025), toute la France**
(**2,79 M de mutations**). Projet *Yboost IA & Data* (Ynov).

> **Pourquoi ces données ?** La DVF recense chaque vente immobilière en France (open data).
> Brutes, ce sont des millions de lignes illisibles. **ImmoDash transforme cette masse en
> réponses claires** : où achète-t-on, à quel prix au m², comment le marché évolue, et quels
> territoires se démarquent — *compréhensible en quelques secondes*.

---

## 🎯 Ce que le dashboard répond (en 10 secondes)
- **Quel prix ?** prix médian au m² national + par département + par commune.
- **Quelle évolution ?** courbe mensuelle sur 36 mois + tendance 3 ans.
- **Où ?** carte choroplèthe de France (clic = détail du département).
- **Quoi ?** appartement vs maison, segmentation Éco / Standard / Luxe.
- **Le plus dynamique ?** ventes pour 100 000 habitants (croisement INSEE).

## 🗂️ Pages
Vue d'ensemble · Géographie (carte) · Typologie & segments · Communes · **Données & Méthode** ·
**Le Jeu** (mini-jeu où l'on court sur la courbe des prix — la donnée devient le terrain).

## 🎨 Thèmes
**Sombre** & **Clair** (rendu pro, épuré) + un thème bonus **Mario** (sons & animations) —
*optionnel : aucun élément Mario n'apparaît dans les modes clair/sombre.*

---

## 🔧 Données & pipeline
```
API DVF (data.gouv.fr) + INSEE  ──►  agrégats médians par mois / département / commune
                                     (dashboard-dvf/export_react_data.py)
                                     ──►  dashboard-react/public/data.json  ──►  front
```
- **Front** (`dashboard-react/`) : React + TypeScript + Tailwind + Recharts + d3-geo + Framer Motion.
- **Pipeline data-engineering** (`dashboard-dvf/`) : Python / **Pandas** / **SQLite** — collecte →
  nettoyage → fusion (DVF × INSEE) → feature engineering → agrégation (démontré sur l'échantillon
  S1-2025 ; voir `dashboard-dvf/README.md`).
- Mesure de prix = **médiane €/m²** (robuste aux valeurs extrêmes). Les séries temporelles couvrent
  3 ans ; la carte/le classement montrent le **niveau de prix médian** (instantané géographique).

## ▶️ Lancer le dashboard
```bash
cd dashboard-react
bun install      # ou npm install
bun run dev      # http://localhost:5173   (ou: bun run build && bun run preview)
```

### Régénérer les données (optionnel)
```bash
cd dashboard-dvf
pip install -r requirements.txt
python3 export_react_data.py      # met à jour dashboard-react/public/data.json
```

## 📁 Structure
```
ImmoDash/
├── dashboard-react/      # 🟢 dashboard (le rendu principal)
│   ├── src/              # App, Sidebar, pages, FranceMap, DataGame, mario, lib
│   └── public/           # data.json (3 ans) + departements.geojson
├── dashboard-dvf/        # pipeline Python (Pandas/SQLite) + export_react_data.py
│   └── soutenance/       # support de soutenance
└── README.md
```

## 📊 Sources
DVF — <https://dvf-api.data.gouv.fr> · Population — INSEE / <https://geo.api.gouv.fr> · Licence ouverte.
