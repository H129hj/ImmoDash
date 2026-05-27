# Documentation API DVF (`dvf-api.data.gouv.fr`)

L’API **DVF** permet d’accéder aux données de transactions immobilières (Demandes de Valeurs Foncières) en France.
Elle propose différents niveaux d’agrégation : **nation**, **département**, **commune**, **section cadastrale**, **mutation individuelle**.

📌 **Root URL**

```
https://dvf-api.data.gouv.fr
```

---

## Table des matières

* [Hiérarchie des données](#hiérarchie-des-données)
* [Décryptage des champs](#décryptage-des-champs)
* [1. Distribution](#1-distribution)
  * [1.1 Nation](#11-nation)
  * [1.2 Zone géographique (`code_geo`)](#12-zone-géographique-code_geo)
* [2. Nation – Séries temporelles](#2-nation--séries-temporelles)
  * [2.1 Agrégats globaux](#21-agrégats-globaux)
  * [2.1 Agrégats mensuels](#22-agrégats-mensuels)
* [3. EPCI](#3-epci)
* [4. Département](#4-département)
  * [4.1 Agrégats globaux](#41-agrégats-globaux)
  * [4.1 Agrégats mensuels](#42-agrégats-mensuels)
  * [4.2 Communes du département](#43-communes-du-département)
* [5. Commune](#5-commune)
  * [5.1 Agrégats mensuels](#51-agrégats-mensuels)
  * [5.2 Sections cadastrales](#52-sections-cadastrales)
* [6. Section](#6-section)
* [7. Mutation](#7-mutation)
* [8. DPE / Copropriété](#8-dpe--copropriété)
* [9. Mutations brutes (endpoint `/dvf`)](#9-mutations-brutes-endpoint-dvf)
  * [9.1 Exemple d’appel](#91-exemple-dappel)
  * [9.2 Paramètres](#92-paramètres)
  * [9.3 Exemple de réponse](#93-exemple-de-réponse)

---

## Hiérarchie des données

* **Nation** → vue globale sur la France entière
* **Département** → agrégats par département
* **Commune** → données par commune
* **Section** → données par section cadastrale
* **Mutation** → détails d’une transaction (adresse, valeur foncière, surface, etc.)
* **DPE / Copropriété** → informations énergétiques et de copropriété

---

## Décryptage des champs

* `xaxis` : classes de prix (€/m²)
* `yaxis` : nombre de transactions observées
* `c` : code géographique
* `n` : nom
* `p` : parent
* `l` : nombre de locaux (tous types confondus)
* `a` : nombre d’appartements
* `m_a` : médiane €/m² des appartements
* `m` : nombre de maisons
* `m_m` : médiane €/m² des maisons
* `am` : total maisons + appartements
* `m_am` : médiane €/m² tous biens (appartements + maisons)
* `m_l` : médiane €/m² tous locaux (y compris autres types : bureaux, commerces, etc.)
* `id_mutation` : identifiant unique de la transaction
* `date_mutation` : date de l’acte
* `nature_mutation` : type de mutation (`Vente`, `Echange`, etc.)
* `valeur_fonciere` : prix en euros
* `id_parcelle`, `section_prefixe` : référence cadastrale
* `longitude`, `latitude` : géolocalisation
* `type_local`, `surface_reelle_bati`, `nombre_pieces_principales` : caractéristiques du bien (si disponibles)
* `lotX_numero`, `lotX_surface_carrez` : informations sur les lots de copropriété

---

## 1. Distribution

### 1.1 Nation

**Description** : Retourne la distribution des prix pour l’ensemble du territoire français, par type de bien.

* **URL** :

```http
GET /distribution/nation
```

* **Exemple de réponse** :

```json
{
    "code_geo": "nation",
    "appartement": {
        "xaxis": [[0, 1500], [1500, 2600]],
        "yaxis": [251055, 475279]
    },
    "maison": {
        "xaxis": [[0, 900], [900, 1600]],
        "yaxis": [308332, 558221]
    },
    "apt_maison": {
        "xaxis": [[0, 1100], [1100.0, 2000.0]],
        "yaxis": [564593, 1121342]
    },
    "local": {
        "xaxis": [[0, 100], [100.0, 1000.0]],
        "yaxis": [13116, 70233]
    }
}
```

---

### 1.2 Zone géographique (`code_geo`)

**Description** : Retourne la distribution des prix pour une zone donnée (commune, département).

* **URL** :

```http
GET /distribution/{code_geo}
```

* **Exemple** :

```http
/distribution/13001
```

* **Exemple de réponse** :

```json
{
  "code_geo": "13001",
  "appartement": {
    "xaxis": [[0, 3000], [3000, 3500]],
    "yaxis": [923, 764]
  }
}
```

---

## 2. Nation – Séries temporelles

### 2.1 Agrégats globaux

**Description** : Retourne les statistiques au niveau national.

* **URL** :
  
  ```http
  GET /nation
  ```

* **Exemple de réponse** :
  
  ```json
  {
    "data": [
        {
            "c": "nation",
            "n": "nation",
            "p": "-",
            "l": 211925,
            "a": 2027712,
            "m_a": 3269,
            "m": 2555340,
            "m_m": 2065,
            "am": 4583052,
            "m_am": 2500,
            "m_l": 1404
        }
    ]
  }
  ```

---

### 2.2 Agrégats mensuels

**Description** : Retourne les statistiques mensuelles au niveau national.

* **URL** :

```http
GET /nation/mois
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "nation",
            "m": 44959,
            "m_m": 1847,
            "a": 44034,
            "m_a": 3000,
            "l": "nation",
            "m_l": 1313,
            "am": 88993,
            "m_am": 2286,
            "d": "2020-01",
            "n": "nation",
            "p": "-"
        }
    ]
}
```

---

## 3. EPCI

**Description** : Retourne les statistiques par intercommunalité (EPCI).

* **URL** :

```http
GET /epci
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "200042620",
            "n": "CC de la Region de Suippes",
            "p": "51",
            "l": 8,
            "a": 16,
            "m_a": 1118,
            "m": 372,
            "m_m": 1365,
            "am": 388,
            "m_am": 1332,
            "m_l": 196
        }
    ]
}
```

---

## 4. Département

### 4.1 Agrégats globaux

**Description** : Retourne les statistiques au niveau départemental.

* **URL** :

```http
GET /departement
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "01",
            "n": "Ain",
            "p": "nation",
            "l": 2045,
            "a": 16201,
            "m_a": 2657,
            "m": 26887,
            "m_m": 2429,
            "am": 43088,
            "m_am": 2500,
            "m_l": 930
        }
    ]
}
```

---

### 4.2 Agrégats mensuels

**Description** : Retourne les statistiques mensuelles au niveau départemental.

* **URL** :

```http
GET /departement/{code_departement}
```

* **Exemple** :

```http
/departement/13
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "13",
            "m": 735,
            "m_m": 3600,
            "a": 1619,
            "m_a": 2781,
            "l": "departement",
            "m_l": 1359,
            "am": 2354,
            "m_am": 3034,
            "d": "2020-01",
            "n": "Bouches-du-Rhone",
            "p": "nation"
        }
    ]
}
```

---

### 4.3 Communes du département

**Description** : Retourne les statistiques au niveau communal.

* **URL** :

```http
GET /departement/{code_departement}/communes
```

* **Exemple** :

```http
/departement/13/communes
```

* **Exemple de réponse** :
  
  ```json
  {
    "data": [
        {
            "c": "13001",
            "n": "Aix-en-Provence",
            "p": "200054807",
            "l": 719,
            "a": 9221,
            "m_a": 4643,
            "m": 1848,
            "m_m": 5905,
            "am": 11069,
            "m_am": 4812,
            "m_l": 3077
        }
    ]
  }
  ```

---

## 5. Commune

### 5.1 Agrégats mensuels

**Description** : Retourne les statistiques mensuelles au niveau communal.

* **URL** :

```http
GET /commune/{code_commune}
```

* **Exemple** :

```http
/commune/13001
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "13001",
            "m": 24,
            "m_m": 5331,
            "a": 158,
            "m_a": 4142,
            "l": "commune",
            "m_l": 4545,
            "am": 182,
            "m_am": 4276,
            "d": "2020-01",
            "n": "Aix-en-Provence",
            "p": "200054807"
        }
    ]
}
```

---

### 5.2 Sections cadastrales

**Description** : Retourne les statistiques au niveau des sections cadastrales.

* **URL** :

```http
GET /commune/{code_commune}/sections
```

* **Exemple** :

```http
/commune/13001/sections
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "13001000RR",
            "n": "13001000RR",
            "p": "13001",
            "l": 1,
            "a": 41,
            "m_a": 5422,
            "m": 21,
            "m_m": 6353,
            "am": 62,
            "m_am": 5703,
            "m_l": 3333
        }
    ]
}
```

---

## 6. Section

**Description** : Retourne les statistiques mensuelles au niveau des sections cadastrales.

* **URL** :

```http
GET /section/{id_section}
```

* **Exemple** :

```http
/section/13001000RR
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "c": "13001000RR",
            "m": null,
            "m_m": null,
            "a": 1,
            "m_a": 4774,
            "l": "section",
            "m_l": null,
            "am": 1,
            "m_am": 4774,
            "d": "2020-01",
            "n": "13001000RR",
            "p": "13001"
        }
    ]
}
```

---

## 7. Mutation

**Description** : Retourne le détail d’une mutation immobilière.

* **URL** :

```http
GET /mutation/{code_commune}/{section_prefixe}
```

* **Exemple** :

```http
/mutation/13001/000RR
```

* **Exemple de réponse** :

```json
{
    "data": [
        {
            "id_mutation": "2024-145639",
            "date_mutation": "2024-12-12",
            "numero_disposition": 1,
            "nature_mutation": "Vente",
            "valeur_fonciere": 311000.0,
            "adresse_numero": 145,
            "adresse_suffixe": null,
            "adresse_nom_voie": "AV DE LA TOULOUBRE",
            "adresse_code_voie": "2963",
            "code_postal": "13540",
            "code_commune": "13001",
            "nom_commune": "Aix-en-Provence",
            "code_departement": "13",
            "ancien_code_commune": null,
            "ancien_nom_commune": null,
            "id_parcelle": "13001000RR0215",
            "ancien_id_parcelle": null,
            "numero_volume": null,
            "lot1_numero": "18",
            "lot1_surface_carrez": 80.1,
            "lot2_numero": null,
            "lot2_surface_carrez": null,
            "lot3_numero": null,
            "lot3_surface_carrez": null,
            "lot4_numero": null,
            "lot4_surface_carrez": null,
            "lot5_numero": null,
            "lot5_surface_carrez": null,
            "nombre_lots": 1,
            "code_type_local": "3",
            "type_local": "D\u00e9pendance",
            "surface_reelle_bati": null,
            "nombre_pieces_principales": 0,
            "code_nature_culture": null,
            "nature_culture": null,
            "code_nature_culture_speciale": null,
            "nature_culture_speciale": null,
            "surface_terrain": null,
            "longitude": 5.421627,
            "latitude": 43.581371,
            "section_prefixe": "000RR"
        }
    ]
}
```

---

## 8. DPE / Copropriété

**Description** : Retourne les données énergétiques et de copropriété associées à une parcelle.

* **URL** :

* 
* 
* 
  
  ```html
  GET /dpe-copro/{id_parcelle}
  ```

* **Exemple** :
  
  ```html
  /dpe-copro/13001000RR0173
  ```

* **Exemple de réponse** :

```json
{
    "data": {
        "dpe": [
            {
                "batiment_groupe_id": "bdnb-bg-GAG1-F5ES-DFF4",
                "periode_construction_dpe": "apr\u00e8s 2021",
                "nombre_niveau_immeuble": 1,
                "surface_habitable_immeuble": 1731.2,
                "classe_bilan_dpe": "A",
                "classe_emission_ges": "A",
                "parcelle_id": "13001000RR0173"
            }
        ],
        "copro": []
    }
}
```

## 9. Mutations brutes (endpoint `/dvf`)

Cet endpoint permet d’obtenir les **transactions DVF**, avec pagination.

### 9.1 Exemple d’appel

```http
GET /dvf?com=13001
```

Pagination :

```http
GET /dvf?com=13001&page=2
```

### 9.2 Paramètres

* `dep` → code du département (ex : `13` = Bouches-du-Rhône)
* `com` → code INSEE de la commune (ex : `13001` = Aix-en-Provence)
* `section` → code INSEE de la commune + préfixe de la section
* `parcelle` → code de la parcelle
* `page` → numéro de page (pagination, \~100 résultats par page)

### 9.3 Exemple de réponse

```json
{
    "data": [
        {
            "id_mutation": "2020-156521",
            "date_mutation": "2020-12-18",
            "numero_disposition": 1,
            "nature_mutation": "Vente",
            "valeur_fonciere": 12000000.0,
            "adresse_numero": null,
            "adresse_suffixe": null,
            "adresse_nom_voie": null,
            "adresse_code_voie": null,
            "code_postal": null,
            "code_commune": "13001",
            "nom_commune": "Aix-en-Provence",
            "code_departement": "13",
            "ancien_code_commune": null,
            "ancien_nom_commune": null,
            "id_parcelle": "13001000AE0264",
            "ancien_id_parcelle": null,
            "numero_volume": "2",
            "lot1_numero": null,
            "lot1_surface_carrez": null,
            "lot2_numero": null,
            "lot2_surface_carrez": null,
            "lot3_numero": null,
            "lot3_surface_carrez": null,
            "lot4_numero": null,
            "lot4_surface_carrez": null,
            "lot5_numero": null,
            "lot5_surface_carrez": null,
            "nombre_lots": 0,
            "code_type_local": null,
            "type_local": null,
            "surface_reelle_bati": null,
            "nombre_pieces_principales": null,
            "code_nature_culture": null,
            "nature_culture": null,
            "code_nature_culture_speciale": null,
            "nature_culture_speciale": null,
            "surface_terrain": null,
            "longitude": 5.450982,
            "latitude": 43.52746,
            "section_prefixe": "000AE"
        }
    ]
}
```

---