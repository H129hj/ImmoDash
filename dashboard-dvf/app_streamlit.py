"""
app_streamlit.py — Dashboard interactif DVF (Streamlit).

Lancer :  streamlit run app_streamlit.py     (après avoir généré la base via : python3 main.py)

Le tableau de bord lit les données nettoyées (table dvf_clean de immobilier.db),
applique le feature engineering et la fusion INSEE, puis laisse l'utilisateur filtrer
en direct (département, type de bien, segment, prix, mois). Tous les indicateurs,
graphiques, la carte et le tableau se recalculent dynamiquement.
"""

import json
import os
import sqlite3

import altair as alt
import pandas as pd
import streamlit as st

ICI = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(ICI, "data", "immobilier.db")
GEOJSON = os.path.join(ICI, "static", "vendor", "departements.geojson")

ACCENT = "#ff7a1a"
st.set_page_config(page_title="Dashboard immobilier DVF 2025", page_icon="🏠", layout="wide")


# --------------------------------------------------------------------------- #
# Chargement + préparation des données (mis en cache pour la performance)      #
# --------------------------------------------------------------------------- #
@st.cache_data(show_spinner="Chargement des données…")
def charger():
    if not os.path.exists(DB):
        return None, None
    conn = sqlite3.connect(DB)
    df = pd.read_sql_query("SELECT * FROM dvf_clean", conn)
    insee = pd.read_sql_query("SELECT * FROM raw_insee", conn)
    conn.close()

    # feature engineering (cf. Jour 6)
    df["prix_m2"] = (df["valeur_fonciere"] / df["surface_reelle"]).round(2)
    df = df[(df["prix_m2"] >= 500) & (df["prix_m2"] <= 15000)]
    df["date_mutation"] = pd.to_datetime(df["date_mutation"], errors="coerce")
    df["mois"] = df["date_mutation"].dt.month
    df["segment_prix"] = pd.cut(df["prix_m2"], [0, 4000, 8000, 1e12],
                                labels=["Éco", "Standard", "Luxe"])
    df["code_departement"] = df["code_departement"].astype(str)

    # fusion INSEE (cf. Jour 5)
    df = df.merge(insee, on="code_departement", how="left")

    # noms de départements (depuis le GeoJSON)
    with open(GEOJSON, encoding="utf-8") as f:
        geo = json.load(f)
    noms = {feat["properties"]["code"]: feat["properties"]["nom"] for feat in geo["features"]}
    df["departement"] = df["code_departement"].map(noms).fillna(df["code_departement"])
    return df, noms


@st.cache_data
def centroides_departements():
    """Centroïde (lat, lon) de chaque département, calculé depuis le GeoJSON."""
    with open(GEOJSON, encoding="utf-8") as fp:
        geo = json.load(fp)
    lignes = []
    for feat in geo["features"]:
        coords = []
        geom = feat["geometry"]
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            coords.extend(poly[0])                       # anneau extérieur
        lon = sum(c[0] for c in coords) / len(coords)
        lat = sum(c[1] for c in coords) / len(coords)
        lignes.append({"code_departement": feat["properties"]["code"], "lat": lat, "lon": lon})
    return pd.DataFrame(lignes)


df, noms_dep = charger()
if df is None:
    st.error("Base introuvable. Lancez d'abord :  python3 main.py")
    st.stop()

MOIS = {1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril", 5: "Mai", 6: "Juin",
        7: "Juillet", 8: "Août", 9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre"}


# --------------------------------------------------------------------------- #
# Barre latérale : FILTRES                                                     #
# --------------------------------------------------------------------------- #
st.sidebar.title("🔎 Filtres")
st.sidebar.caption("Tout se recalcule en direct.")

types = st.sidebar.multiselect("Type de bien", ["Maison", "Appartement"],
                               default=["Maison", "Appartement"])
segments = st.sidebar.multiselect("Segment de prix", ["Éco", "Standard", "Luxe"],
                                  default=["Éco", "Standard", "Luxe"])

deps_dispo = sorted(df["departement"].dropna().unique())
deps = st.sidebar.multiselect("Départements (vide = tous)", deps_dispo, default=[])

pmin, pmax = int(df["prix_m2"].min()), int(df["prix_m2"].max())
prix = st.sidebar.slider("Prix au m² (€)", pmin, pmax, (pmin, pmax), step=100)

mois_dispo = sorted(df["mois"].dropna().unique())
mois_sel = st.sidebar.multiselect("Mois", mois_dispo, default=mois_dispo,
                                  format_func=lambda m: MOIS.get(int(m), m))

recherche = st.sidebar.text_input("Rechercher une commune")

# --- application des filtres ---
f = df[df["type_bien"].isin(types) & df["segment_prix"].isin(segments)]
f = f[(f["prix_m2"] >= prix[0]) & (f["prix_m2"] <= prix[1])]
if deps:
    f = f[f["departement"].isin(deps)]
if mois_sel:
    f = f[f["mois"].isin(mois_sel)]
if recherche:
    f = f[f["commune"].str.contains(recherche.strip(), case=False, na=False)]

st.sidebar.markdown(f"**{len(f):,}** transactions sélectionnées".replace(",", " "))


# --------------------------------------------------------------------------- #
# En-tête + KPIs                                                               #
# --------------------------------------------------------------------------- #
st.title("🏠 Marché immobilier français — DVF 2025")
st.caption("Demandes de Valeurs Foncières · 1ᵉʳ semestre 2025 · données filtrables en direct")

if len(f) == 0:
    st.warning("Aucune transaction ne correspond aux filtres.")
    st.stop()

def euro(v):
    return f"{int(v):,}".replace(",", " ") if pd.notna(v) else "—"

c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Transactions", euro(len(f)))
c2.metric("Prix médian (€/m²)", euro(f["prix_m2"].median()))
c3.metric("Prix moyen (€/m²)", euro(f["prix_m2"].mean()))
c4.metric("Appart. médian (€/m²)", euro(f[f.type_bien == "Appartement"]["prix_m2"].median()))
c5.metric("Maison médian (€/m²)", euro(f[f.type_bien == "Maison"]["prix_m2"].median()))

st.divider()


# --------------------------------------------------------------------------- #
# Onglets                                                                      #
# --------------------------------------------------------------------------- #
t1, t2, t3, t4 = st.tabs(["📈 Tendances", "🗺️ Géographie", "🏆 Classements", "📋 Données"])

with t1:
    g1, g2 = st.columns([2, 1])
    with g1:
        st.subheader("Évolution du prix médian au m²")
        evo = (f.groupby("mois").agg(prix=("prix_m2", "median"), volume=("prix_m2", "size"))
               .reset_index())
        evo["Mois"] = evo["mois"].map(MOIS)
        base = alt.Chart(evo).encode(x=alt.X("Mois:N", sort=list(MOIS.values())))
        barres = base.mark_bar(color="#4f9cf9", opacity=.45).encode(
            y=alt.Y("volume:Q", title="Ventes"))
        ligne = base.mark_line(color=ACCENT, point=True, strokeWidth=3).encode(
            y=alt.Y("prix:Q", title="€/m² médian"))
        st.altair_chart(alt.layer(barres, ligne).resolve_scale(y="independent"),
                        width="stretch")
    with g2:
        st.subheader("Segments")
        seg = f["segment_prix"].value_counts().reset_index()
        seg.columns = ["segment", "nb"]
        st.altair_chart(
            alt.Chart(seg).mark_arc(innerRadius=55).encode(
                theta="nb:Q",
                color=alt.Color("segment:N",
                                scale=alt.Scale(domain=["Éco", "Standard", "Luxe"],
                                                range=["#2ecc8f", "#4f9cf9", ACCENT])),
                tooltip=["segment", "nb"]),
            width="stretch")

    st.subheader("Appartement vs Maison")
    typ = f.groupby("type_bien")["prix_m2"].median().reset_index()
    st.altair_chart(
        alt.Chart(typ).mark_bar().encode(
            x=alt.X("type_bien:N", title=""),
            y=alt.Y("prix_m2:Q", title="€/m² médian"),
            color=alt.Color("type_bien:N",
                            scale=alt.Scale(range=["#4f9cf9", ACCENT]), legend=None),
            tooltip=["type_bien", "prix_m2"]),
        width="stretch")

with t2:
    st.subheader("Prix moyen au m² par département")
    dep_stats = (f.groupby("code_departement")
                 .agg(prix_moyen=("prix_m2", "mean"), nb=("prix_m2", "size"))
                 .reset_index())
    dep_stats = dep_stats[dep_stats["nb"] >= 20]
    dep_stats = dep_stats[~dep_stats["code_departement"].str.startswith("97")]

    # centroïdes des départements (moyenne des coordonnées du GeoJSON)
    pts = dep_stats.merge(centroides_departements(), on="code_departement", how="inner")
    pts["nom"] = pts["code_departement"].map(noms_dep)

    def couleur(p):                       # palette par palier de prix
        for seuil, col in [(2500, "#2ecc8f"), (3500, "#9bd64a"), (4500, "#f5c542"),
                           (6000, "#ff9f1a")]:
            if p < seuil:
                return col
        return "#ff5d6c"
    pts["color"] = pts["prix_moyen"].apply(couleur)
    pts["size"] = (pts["nb"] ** 0.5) * 350     # rayon proportionnel au volume

    st.map(pts, latitude="lat", longitude="lon", size="size", color="color")
    st.caption("Chaque point = un département (métropole, ≥ 20 ventes). "
               "Couleur = prix moyen au m² (vert = abordable → rouge = cher) · taille = nombre de ventes.")
    st.markdown("**Prix moyen au m² par département :** vert &lt; 2 500 · jaune 3 500–4 500 · "
                "orange 4 500–6 000 · rouge &gt; 6 000 €/m².")

with t3:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Top 15 départements (prix moyen)")
        dd = (f.groupby("code_departement").agg(prix=("prix_m2", "mean"), nb=("prix_m2", "size"))
              .reset_index())
        dd = dd[(dd["nb"] >= 20) & (~dd["code_departement"].str.startswith("97"))]
        dd["Département"] = dd["code_departement"].map(noms_dep)
        dd = dd.sort_values("prix", ascending=False).head(15)
        st.altair_chart(
            alt.Chart(dd).mark_bar(color=ACCENT).encode(
                x=alt.X("prix:Q", title="€/m² moyen"),
                y=alt.Y("Département:N", sort="-x"),
                tooltip=["Département", alt.Tooltip("prix:Q", format=",.0f")]),
            width="stretch")
    with col2:
        st.subheader("Top 15 communes (≥ 30 ventes)")
        cc = (f.groupby(["commune", "code_departement"])
              .agg(prix=("prix_m2", "median"), nb=("prix_m2", "size")).reset_index())
        cc = cc[cc["nb"] >= 30].sort_values("prix", ascending=False).head(15)
        cc["Commune"] = cc["commune"].str.title() + " (" + cc["code_departement"] + ")"
        st.altair_chart(
            alt.Chart(cc).mark_bar(color="#a78bfa").encode(
                x=alt.X("prix:Q", title="€/m² médian"),
                y=alt.Y("Commune:N", sort="-x"),
                tooltip=["Commune", alt.Tooltip("prix:Q", format=",.0f")]),
            width="stretch")

with t4:
    st.subheader("Transactions filtrées")
    cols = ["date_mutation", "commune", "code_departement", "type_bien",
            "valeur_fonciere", "surface_reelle", "prix_m2", "segment_prix"]
    table = f[cols].sort_values("prix_m2", ascending=False)
    st.dataframe(table, width="stretch", height=480,
                 column_config={
                     "date_mutation": "Date",
                     "valeur_fonciere": st.column_config.NumberColumn("Valeur (€)", format="%d"),
                     "surface_reelle": st.column_config.NumberColumn("Surface (m²)", format="%d"),
                     "prix_m2": st.column_config.NumberColumn("Prix €/m²", format="%d"),
                 })
    st.download_button("⬇️ Télécharger la sélection (CSV)",
                       table.to_csv(index=False).encode("utf-8"),
                       "selection_dvf.csv", "text/csv")

st.divider()
st.caption("Pipeline Python (collecte → SQLite → nettoyage → fusion INSEE → features) · "
           "Dashboard Streamlit · Données DVF data.gouv.fr")
