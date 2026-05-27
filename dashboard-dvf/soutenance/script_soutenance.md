# 🎤 Soutenance — Dashboard immobilier DVF 2025
### Plan, script et préparation aux questions (10 min de présentation + 5 min de questions)

> ⚠️ **À lire en premier.** Le prof (Robin Guerard) a déjà sanctionné « l'utilisation de l'IA
> sans comprendre ». La grille note la **Maîtrise technique**. Ce document est là pour que tu
> **comprennes et saches réexpliquer** chaque choix avec tes mots. Ne récite pas : approprie-toi.
> Le meilleur réflexe en démo : ouvre un fichier `.py`, montre une fonction, explique-la.

---

## ⏱️ Plan minuté (objectif 10 min)

| Temps | Slides | Séquence | Idée à faire passer |
|------|--------|----------|---------------------|
| 0:00–1:00 | 1–2 | Accroche + sommaire | « Je vais transformer 400 000 lignes brutes en un tableau lisible en 10 s » |
| 1:00–2:30 | 3–4 | Contexte + données | Le problème, le dataset, les données « sales » |
| 2:30–4:30 | 5–7 | Démarche + nettoyage + features | La méthode (le cœur technique) |
| 4:30–5:30 | 8 | Architecture | Python back / JS front, fait de A à Z |
| 5:30–8:00 | 9–12 | **Démo live** + insights + focus 13 | Montrer le produit qui marche |
| 8:00–9:15 | 13–14 | Choix, limites, conclusion | Prendre du recul (= maturité) |
| 9:15–10:00 | 15 | Ouverture + questions | — |

**Conseil rythme** : la démo (slides 9–12) est le moment fort, garde-lui 2 min minimum.

---

## 🗣️ Script slide par slide
*(notes = ce que tu dis ; ce n'est pas à lire mot à mot)*

**S1 — Titre**
> « Bonjour, je vais vous présenter mon dashboard d'analyse du marché immobilier français,
> construit à partir des données DVF du 1ᵉʳ semestre 2025. »

**S2 — Sommaire** (10 s)
> « Je vais d'abord poser le contexte et les données, puis ma démarche technique, une démo,
> les insights, et enfin un focus sur les Bouches-du-Rhône. »

**S3 — Contexte**
> « Les DVF, ce sont toutes les ventes immobilières en France en open data. Sur un seul
> semestre, c'est 400 000 transactions. Personne ne peut lire ça à l'œil nu. Ma question de
> départ, c'est celle du cours : *comment rendre ces données compréhensibles en 10 secondes ?* »

**S4 — Données**
> « Mon dataset a 10 colonnes : prix, surface, type de bien, commune, département, date.
> Ce sont de vraies données, donc sales : des valeurs manquantes, des doublons, et même des
> montants aberrants — j'ai trouvé une valeur à 15 milliards d'euros. D'où la règle
> *garbage in, garbage out* : si je ne nettoie pas, mon dashboard est faux. »

**S5 — Démarche**
> « J'ai suivi un pipeline ETL complet, qui reprend tout le fil de l'année. Je collecte deux
> sources : les prix avec DVF et le contexte démographique avec l'INSEE. Je centralise tout dans
> une base SQLite. Ensuite, avec Pandas : je nettoie, je fusionne DVF et INSEE, je crée mes
> variables et j'agrège. Enfin je visualise. Chaque étape est un module Python séparé. »

**S6 — Nettoyage**
> « Avec Pandas : je supprime les lignes sans prix ou sans surface, les doublons, les surfaces
> nulles et les montants aberrants. Je convertis la date au format datetime. Résultat : je passe
> de 405 000 à 373 000 lignes fiables, soit 92 % conservés. »

**S7 — Feature Engineering**
> « Je crée des variables utiles. La principale : le **prix au m²** = valeur / surface, c'est
> ce qui permet de comparer un studio et une villa. J'extrais aussi le mois, et je segmente le
> marché en Éco / Standard / Luxe. Point important : j'utilise la **médiane** et pas la moyenne,
> parce qu'elle résiste aux valeurs extrêmes. »

**S8 — Architecture**
> « Le back est en Python avec Pandas, organisé en modules (collecte, base, nettoyage, fusion,
> features, agrégation). Le dashboard lui-même est fait en **Streamlit** — l'outil que vous nous
> avez montré : c'est du Python, et ça me donne des filtres interactifs et une carte sans écrire
> de JavaScript. J'ai aussi gardé une version HTML/CSS/JS en bonus. »

**S9 — Démo (Streamlit)** — *bascule sur le vrai dashboard (`streamlit run app_streamlit.py`)*
> « Voici le dashboard. À gauche, les filtres : je peux choisir un type de bien, un segment, un
> ou plusieurs départements, une plage de prix, des mois, ou chercher une commune. Tout se
> recalcule en direct. » *(fais une démo : filtre sur "13", ou cherche une ville)*

**S10 — Insights national** (onglet Géographie / carte)
> « La carte parle d'elle-même : Paris et la Côte d'Azur en rouge, le reste plus abordable.
> Le prix médian national est de 2 667 €/m². Paris est le département le plus cher à
> 9 447 €/m², la Creuse le plus abordable à 1 474. »

**S11 — Segmentation & types**
> « 72 % des biens sont dans le segment Éco, sous 4 000 €/m² : le marché reste majoritairement
> abordable. Le luxe, au-dessus de 8 000 €, ne pèse que 7 % et se concentre sur Paris et la côte.
> Au national, l'appartement est plus cher au m² que la maison. »

**S12 — Focus 13**
> « J'ai gardé un zoom sur les Bouches-du-Rhône, comme à l'exercice noté. Le 13 est au 11ᵉ rang
> national. Détail intéressant : ici la maison est plus chère au m² que l'appartement — l'inverse
> du national — à cause de l'attractivité des maisons avec terrain en Provence. »

**S13 — Choix & limites**
> « Mes choix assumés : la médiane, des bornes de prix pour écarter les aberrations, le classement
> limité à la métropole. Mes limites : un seul semestre donc pas de tendance annuelle, et les
> données DVF restent imparfaites. Pour aller plus loin : fusionner avec des données INSEE et
> ajouter des filtres interactifs. »

**S14 — Conclusion**
> « En résumé, un projet data complet, de la donnée brute au dashboard interactif, qui répond à
> la question de départ. J'y ai consolidé Pandas, la structuration de projet et la dataviz. »

**S15 — Questions**
> « Merci, je suis prêt pour vos questions. »

---

## ❓ Questions probables & réponses (prépare-les à fond)

**Pourquoi la médiane et pas la moyenne ?**
> La moyenne est tirée vers le haut par quelques ventes très chères (un château, une erreur de
> saisie). La médiane, c'est la valeur du milieu : 50 % au-dessus, 50 % en dessous. Elle reflète
> mieux le prix « typique ». Sur mes données, moyenne ≈ 3 668 € mais médiane ≈ 2 667 € : l'écart
> montre justement la présence de valeurs extrêmes.

**Comment calcules-tu le prix au m² ?**
> `prix_m2 = valeur_fonciere / surface_reelle`. Je le borne ensuite entre 500 et 15 000 €/m²
> pour écarter les aberrations (ex. une vente multi-lots où la surface ne couvre qu'une partie
> du bien gonfle artificiellement le ratio).

**Pourquoi avoir supprimé des lignes ? Combien ? N'est-ce pas tricher ?**
> Je supprime ~8 % : lignes sans prix/surface, doublons, montants impossibles (négatifs ou
> milliards). Ce n'est pas tricher, c'est fiabiliser : une transaction sans surface ne permet pas
> de calculer un prix au m². Je l'assume et je l'affiche (405 000 → 373 000).

**Pourquoi exclure l'outre-mer du classement ?**
> Trop peu de transactions et un fond de carte métropolitain : ça créait des artefacts (un
> département DOM ressortait #1 à tort). Je le restreins à la métropole pour un classement fiable.

**C'est quoi un groupby ? (montre le code)**
> C'est regrouper les lignes par une clé — par exemple par département — et calculer une stat par
> groupe (moyenne, médiane du prix au m²). En Pandas : `df.groupby("code_departement")["prix_m2"].mean()`.

**Pourquoi Streamlit ?**
> C'est un framework Python qui transforme un script en application web interactive. Ça me permet
> d'avoir des filtres, une carte et des graphiques qui se recalculent en direct, sans écrire de
> JavaScript. C'est l'outil que vous avez présenté en cours, et il s'intègre parfaitement avec
> Pandas — je passe mon DataFrame filtré directement aux graphiques.

**Pourquoi Pandas / Altair ?**
> Pandas est l'outil standard pour manipuler des tableaux de données en Python. Altair sert à
> faire les graphiques (il est livré avec Streamlit). Les filtres de l'app produisent un
> sous-DataFrame, et tous les indicateurs se recalculent dessus.

**Comment fonctionne la carte (choroplèthe) ?**
> Je charge un fichier GeoJSON qui contient les contours de chaque département. Je relie chaque
> contour à son prix moyen (calculé côté Python) et je colore selon un barème de couleurs.

**Pourquoi une base SQLite ? (Jour 3)**
> Pour centraliser les données au lieu d'avoir des fichiers éparpillés. SQLite est une base
> locale, légère, sans configuration (un simple fichier `.db`). J'y stocke trois tables :
> `raw_dvf` (brut), `raw_insee`, et `dvf_clean` (après nettoyage). Pandas lit directement la base
> avec `pd.read_sql_query(...)`.

**Sur quelle clé tu fusionnes DVF et INSEE, et pourquoi ? (Jour 5)**
> Sur `code_departement`. En théorie on fusionne sur le code commune, mais les noms de communes
> du DVF ne sont pas normalisés (« MARSEILLE 1ER », « LYON 5EME ») : une clé peu fiable donne une
> fusion ratée. Le code département est une clé sûre. J'utilise une jointure LEFT pour garder
> toutes les ventes. Ça m'a permis d'ajouter la population et de calculer un indicateur de
> dynamisme : le nombre de ventes pour 100 000 habitants.

**Différence entre les types de jointure ?**
> INNER = on garde seulement ce qui existe des deux côtés (l'intersection). LEFT = on garde tout
> le tableau de gauche (ici toutes les ventes DVF), et on complète avec la droite quand ça matche.

**Qu'est-ce que tu améliorerais ?**
> Fusionner avec des données INSEE (population, revenus) pour expliquer les prix, ajouter des
> filtres interactifs (par type de bien, par période) et idéalement plusieurs années pour une
> vraie tendance.

**As-tu utilisé l'IA ?** *(question piège possible — sois honnête et montre ta maîtrise)*
> Oui, comme outil, c'était autorisé pour le code. Mais je comprends et j'assume chaque choix —
> et je peux réexpliquer n'importe quelle partie du code maintenant. *(puis propose d'ouvrir un fichier)*

---

## 🔢 Chiffres à connaître par cœur
- **404 868** transactions brutes → **373 038** propres (~92 %).
- Prix médian national **2 667 €/m²** (moyenne 3 668 €).
- Appartement **3 462 €/m²** · Maison **2 226 €/m²** (national).
- Paris **#1** (9 447 €/m²) · Creuse la plus abordable (1 474 €/m²).
- Segments : **Éco 72 %** · Standard ~20 % · **Luxe ~7 %** (> 8 000 €/m²).
- Bouches-du-Rhône : **11ᵉ** rang national.

## ✅ Check-list avant de passer
- [ ] `python3 main.py` lancé une fois (génère la base), puis `streamlit run app_streamlit.py`
      **avant** la soutenance, onglet ouvert sur le dashboard.
- [ ] Tester une fois : un filtre département (ex. « 13 »), la recherche d'une commune, la carte.
- [ ] Avoir le code ouvert dans l'éditeur (prêt à montrer `src/nettoyage.py` ou `app_streamlit.py`).
- [ ] Connaître les 6 chiffres clés ci-dessus.
- [ ] Respirer, parler lentement, regarder le jury. Tu connais ton projet.
