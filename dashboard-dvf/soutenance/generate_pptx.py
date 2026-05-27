"""
Génère le support de soutenance ImmoDash (PowerPoint) — à jour avec le projet React,
les données 3 ans, les thèmes et le mini-jeu.  Lancer : python3.13 generate_pptx.py
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

ICI = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(ICI, "img")
BG=RGBColor(0x0A,0x0D,0x15); PANEL=RGBColor(0x16,0x1E,0x30); LINE=RGBColor(0x25,0x2D,0x3F)
ACCENT=RGBColor(0xF0,0x88,0x3E); BLUE=RGBColor(0x5F,0xB3,0xC4); GREEN=RGBColor(0x57,0xC7,0x9A)
WHITE=RGBColor(0xEC,0xE8,0xDF); MUTED=RGBColor(0x8A,0x93,0xA6)

prs=Presentation(); prs.slide_width=Inches(13.333); prs.slide_height=Inches(7.5)
BLANK=prs.slide_layouts[6]; W,H=prs.slide_width,prs.slide_height

def bg(s,c=BG):
    s.background.fill.solid(); s.background.fill.fore_color.rgb=c
def box(s,l,t,w,h,fill=None,line=None):
    sp=s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,l,t,w,h); sp.shadow.inherit=False
    if fill is None: sp.fill.background()
    else: sp.fill.solid(); sp.fill.fore_color.rgb=fill
    if line is None: sp.line.fill.background()
    else: sp.line.color.rgb=line; sp.line.width=Pt(1)
    return sp
def txt(s,l,t,w,h,lines,size=18,color=WHITE,bold=False,align=PP_ALIGN.LEFT,anchor=MSO_ANCHOR.TOP,font="Geist",space=6):
    tb=s.shapes.add_textbox(l,t,w,h); tf=tb.text_frame; tf.word_wrap=True; tf.vertical_anchor=anchor
    if isinstance(lines,str): lines=[lines]
    for i,line in enumerate(lines):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph(); p.alignment=align; p.space_after=Pt(space)
        text,opts=(line if isinstance(line,tuple) else (line,{}))
        r=p.add_run(); r.text=text; f=r.font
        f.size=Pt(opts.get("size",size)); f.bold=opts.get("bold",bold); f.color.rgb=opts.get("color",color); f.name=opts.get("font",font)
    return tb
def header(s,kicker,title):
    box(s,0,0,Inches(0.16),H,fill=ACCENT)
    txt(s,Inches(0.6),Inches(0.42),Inches(12),Inches(0.4),[(kicker.upper(),{"size":12,"color":ACCENT,"bold":True,"font":"Geist Mono"})])
    txt(s,Inches(0.6),Inches(0.78),Inches(12.2),Inches(0.9),[(title,{"size":29,"color":WHITE,"bold":True,"font":"Fraunces"})])
    box(s,Inches(0.62),Inches(1.6),Inches(2.0),Pt(3),fill=ACCENT)
def footer(s,n):
    txt(s,Inches(0.6),Inches(7.06),Inches(8),Inches(0.3),[("ImmoDash — Marché immobilier DVF",{"size":9,"color":MUTED})])
    txt(s,Inches(12.2),Inches(7.06),Inches(0.8),Inches(0.3),[(str(n),{"size":9,"color":MUTED})],align=PP_ALIGN.RIGHT)
def bullets(s,items,left=Inches(0.7),top=Inches(2.0),width=Inches(8.0),size=18,gap=13):
    tb=s.shapes.add_textbox(left,top,width,Inches(4.6)); tf=tb.text_frame; tf.word_wrap=True
    for i,it in enumerate(items):
        text,lvl=(it if isinstance(it,tuple) else (it,0))
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph(); p.space_after=Pt(gap); p.level=lvl
        r=p.add_run(); r.text=("▹  " if lvl==0 else "•  ")+text
        r.font.size=Pt(size if lvl==0 else size-3); r.font.color.rgb=WHITE if lvl==0 else MUTED; r.font.name="Geist"
    return tb
def pic(s,name,l,t,w):
    p=os.path.join(IMG,name)
    if os.path.exists(p): s.shapes.add_picture(p,l,t,width=w)

# 1 — Cover
s=prs.slides.add_slide(BLANK); bg(s); box(s,0,0,W,Inches(0.16),fill=ACCENT)
txt(s,Inches(0.8),Inches(0.7),Inches(6),Inches(0.5),[("🏠 ATELIER YBOOST · IA & DATA",{"size":15,"color":ACCENT,"bold":True,"font":"Geist Mono"})])
txt(s,Inches(0.8),Inches(2.2),Inches(11.7),Inches(2),[("ImmoDash",{"size":62,"color":WHITE,"bold":True,"font":"Fraunces"})],space=2)
txt(s,Inches(0.85),Inches(3.7),Inches(11),Inches(1),[("Lire le marché immobilier français en 10 secondes",{"size":22,"color":ACCENT,"bold":True,"font":"Fraunces"})])
txt(s,Inches(0.85),Inches(4.5),Inches(11),Inches(0.6),[("Dashboard d'analyse des Demandes de Valeurs Foncières — 2,79 M de ventes · 2023-2025 · toute la France",{"size":15,"color":MUTED})])
box(s,Inches(0.85),Inches(5.5),Inches(3),Pt(3),fill=ACCENT)
txt(s,Inches(0.85),Inches(5.8),Inches(11),Inches(1),[("Hugo Berton",{"size":21,"color":WHITE,"bold":True}),("Bachelor 1 · Ynov · github.com/H129hj/ImmoDash",{"size":13,"color":MUTED})],space=4)

# 2 — Sommaire
s=prs.slides.add_slide(BLANK); bg(s); header(s,"Sommaire","Au programme")
cols=[["1.  Contexte & problématique","2.  Les données DVF","3.  La démarche (pipeline)"],
      ["4.  Architecture technique","5.  Démo du dashboard","6.  Insights clés"],
      ["7.  Originalité (thèmes + jeu)","8.  Choix & limites","9.  Conclusion · Questions"]]
for i,c in enumerate(cols):
    box(s,Inches(0.7+i*4.1),Inches(2.2),Inches(3.8),Inches(3.2),fill=PANEL)
    bullets(s,c,left=Inches(0.95+i*4.1),top=Inches(2.5),width=Inches(3.4),size=15,gap=18)
footer(s,2)

# 3 — Contexte
s=prs.slides.add_slide(BLANK); bg(s); header(s,"01 · Contexte","Le défi : donner du sens à la donnée brute")
bullets(s,["Les DVF recensent TOUTES les ventes immobilières en France (open data, DGFiP).",
           "Sur 3 ans : ~2,79 millions de transactions → impossible à lire à l'œil nu.",
           ("Problématique : comment rendre ces données compréhensibles en 10 secondes ?",0),
           "Objectif : transformer la donnée brute en réponses claires — où, à quel prix, quelle évolution."],
        top=Inches(2.0),width=Inches(8.3))
box(s,Inches(9.2),Inches(2.0),Inches(3.5),Inches(3.4),fill=PANEL,line=ACCENT)
txt(s,Inches(9.45),Inches(2.3),Inches(3),Inches(3),[("EN CHIFFRES",{"size":12,"color":ACCENT,"bold":True,"font":"Geist Mono"}),
    ("2,79 M",{"size":34,"color":WHITE,"bold":True}),("transactions",{"size":13,"color":MUTED}),
    ("93 départements",{"size":19,"color":BLUE,"bold":True}),("toute la France · 36 mois",{"size":13,"color":MUTED})],space=8)
footer(s,3)

# 4 — Données
s=prs.slides.add_slide(BLANK); bg(s); header(s,"02 · Données","DVF — Demandes de Valeurs Foncières")
bullets(s,["Registre public de toutes les mutations immobilières (source : DGFiP / data.gouv.fr).",
           "Une ligne = une vente : valeur_fonciere, surface_reelle, type_bien, commune, code_departement, date_mutation.",
           ("Indicateur clé dérivé : prix au m² = valeur_fonciere / surface_reelle.",0),
           "Croisé avec la population INSEE → indicateur de dynamisme (ventes / 100 000 hab.)."],
        top=Inches(2.0),width=Inches(12))
footer(s,4)

# 5 — Pipeline
s=prs.slides.add_slide(BLANK); bg(s); header(s,"03 · Démarche","Un pipeline, de la donnée brute à la dataviz")
steps=[("Collecte","API DVF\n+ INSEE",BLUE),("SQLite","stockage\nrelationnel",ACCENT),("Nettoyage","Pandas\nNaN, doublons",ACCENT),
       ("Fusion","DVF × INSEE\n(pd.merge)",ACCENT),("Agrégats","médianes\nsegments",ACCENT),("Dashboard","React\nd3 · Recharts",BLUE)]
x=Inches(0.5)
for i,(t,d,col) in enumerate(steps):
    box(s,x,Inches(2.7),Inches(1.6),Inches(1.7),fill=PANEL,line=col)
    txt(s,x,Inches(2.82),Inches(1.6),Inches(0.6),[(t,{"size":14,"color":WHITE,"bold":True})],align=PP_ALIGN.CENTER)
    txt(s,x,Inches(3.5),Inches(1.6),Inches(0.8),[(d,{"size":10,"color":MUTED})],align=PP_ALIGN.CENTER)
    if i<5: txt(s,x+Inches(1.52),Inches(3.0),Inches(0.45),Inches(0.8),[("→",{"size":22,"color":ACCENT,"bold":True})],align=PP_ALIGN.CENTER)
    x=Emu(int(x)+int(Inches(2.0)))
txt(s,Inches(0.6),Inches(5.0),Inches(12.2),Inches(0.9),[("Pipeline Python (Pandas/SQLite) pour le traitement ; le dashboard restitue les agrégats officiels de l'API DVF sur 3 ans.",{"size":14,"color":MUTED})])
footer(s,5)

# 6 — Nettoyage & features
s=prs.slides.add_slide(BLANK); bg(s); header(s,"04 · Traitement","Nettoyage & feature engineering (Pandas)")
box(s,Inches(0.7),Inches(2.0),Inches(5.7),Inches(3.6),fill=PANEL,line=ACCENT)
txt(s,Inches(0.95),Inches(2.25),Inches(5.2),Inches(3.2),[("NETTOYAGE",{"size":15,"color":ACCENT,"bold":True,"font":"Geist Mono"}),
    ("• Suppression NaN, doublons, aberrations",{"size":14,"color":WHITE}),
    ("• Bornes prix au m² : 500–15 000 €",{"size":14,"color":WHITE}),
    ("• Typage des dates (datetime)",{"size":14,"color":WHITE}),
    ("• « Garbage in, garbage out »",{"size":13,"color":MUTED})],space=9)
box(s,Inches(6.9),Inches(2.0),Inches(5.7),Inches(3.6),fill=PANEL,line=BLUE)
txt(s,Inches(7.15),Inches(2.25),Inches(5.2),Inches(3.2),[("VARIABLES CRÉÉES",{"size":15,"color":BLUE,"bold":True,"font":"Geist Mono"}),
    ("• prix_m2 (indicateur central)",{"size":14,"color":WHITE}),
    ("• mois (évolution temporelle)",{"size":14,"color":WHITE}),
    ("• segment : Éco / Standard / Luxe",{"size":14,"color":WHITE}),
    ("• Médiane privilégiée (≠ moyenne) : robuste aux extrêmes",{"size":13,"color":MUTED})],space=9)
footer(s,6)

# 7 — Architecture
s=prs.slides.add_slide(BLANK); bg(s); header(s,"05 · Technique","Architecture : développé de A à Z")
box(s,Inches(0.7),Inches(2.0),Inches(5.7),Inches(3.5),fill=PANEL,line=ACCENT)
txt(s,Inches(0.95),Inches(2.25),Inches(5.2),Inches(3),[("BACK / DATA — Python",{"size":16,"color":ACCENT,"bold":True}),
    ("• Pandas (traitement), SQLite (stockage)",{"size":14,"color":WHITE}),
    ("• Collecte API DVF + INSEE",{"size":14,"color":WHITE}),
    ("• Agrégation → un JSON unique",{"size":14,"color":WHITE})],space=8)
box(s,Inches(6.9),Inches(2.0),Inches(5.7),Inches(3.5),fill=PANEL,line=BLUE)
txt(s,Inches(7.15),Inches(2.25),Inches(5.2),Inches(3),[("FRONT — React / TypeScript",{"size":16,"color":BLUE,"bold":True}),
    ("• Tailwind, Recharts, carte d3-geo",{"size":14,"color":WHITE}),
    ("• 6 pages, filtres en direct, animations",{"size":14,"color":WHITE}),
    ("• 3 thèmes (sombre / clair / Mario)",{"size":14,"color":WHITE})],space=8)
footer(s,7)

# 8 — Démo overview
s=prs.slides.add_slide(BLANK); bg(s); header(s,"06 · Démo","Vue d'ensemble du dashboard")
pic(s,"imd-overview.png",Inches(1.7),Inches(2.0),Inches(10))
footer(s,8)

# 9 — Démo carte
s=prs.slides.add_slide(BLANK); bg(s); header(s,"06 · Démo","Carte interactive des départements")
pic(s,"imd-geo.png",Inches(1.7),Inches(2.0),Inches(10))
footer(s,9)

# 10 — Insights national
s=prs.slides.add_slide(BLANK); bg(s); header(s,"07 · Insights","Lecture nationale du marché")
for i,(val,lab,col) in enumerate([("2 576 €/m²","prix médian national",ACCENT),("Paris","le + cher (~10 250 €/m²)",BLUE),("− 1,9 %","évolution sur 3 ans",GREEN)]):
    box(s,Inches(0.7+i*4.05),Inches(2.0),Inches(3.75),Inches(1.5),fill=PANEL,line=col)
    txt(s,Inches(0.9+i*4.05),Inches(2.15),Inches(3.4),Inches(1.2),[(val,{"size":26,"color":WHITE,"bold":True}),(lab,{"size":12,"color":MUTED})],space=4)
bullets(s,["La carte révèle une France à deux vitesses : Paris / Côte d'Azur vs reste du territoire (rapport ~7×).",
           "Le marché s'est refroidi récemment (hausse des taux) : −1,9 % sur 36 mois.",
           "72 % des biens < 4 000 €/m² (« Éco ») ; le luxe (> 8 000) ne pèse que ~5 %."],top=Inches(3.9),width=Inches(12))
footer(s,10)

# 11 — Insights typologie
s=prs.slides.add_slide(BLANK); bg(s); header(s,"07 · Insights","Typologie & segments")
bullets(s,["Au m², l'appartement (~3 340 €) se vend plus cher que la maison (~2 120 €) — densité urbaine.",
           "Segmentation Éco / Standard / Luxe : lecture immédiate de la structure du marché.",
           "Croisement INSEE : on rapporte le volume de ventes à la population (dynamisme par territoire)."],top=Inches(2.0),width=Inches(12))
pic(s,"imd-light.png",Inches(2.4),Inches(3.7),Inches(8.5))
footer(s,11)

# 12 — Originalité
s=prs.slides.add_slide(BLANK); bg(s); header(s,"08 · Originalité","Aller au-delà de ce qui est demandé")
bullets(s,["3 thèmes : sombre, clair (rendu pro) et un thème Mario (sons, animations) en bonus.",
           "Un mini-jeu intégré : on court sur la courbe des prix — la donnée devient le terrain.",
           "Une landing page portfolio externe qui présente le projet & la data (graphiques live)."],top=Inches(2.0),width=Inches(6.0))
pic(s,"imd-game.png",Inches(6.7),Inches(2.1),Inches(6.1))
footer(s,12)

# 13 — Choix & limites
s=prs.slides.add_slide(BLANK); bg(s); header(s,"09 · Recul","Choix d'analyse & limites")
box(s,Inches(0.7),Inches(2.0),Inches(5.7),Inches(3.5),fill=PANEL,line=ACCENT)
txt(s,Inches(0.95),Inches(2.25),Inches(5.2),Inches(3.1),[("MES CHOIX",{"size":16,"color":ACCENT,"bold":True}),
    ("• Médiane plutôt que moyenne",{"size":14,"color":WHITE}),
    ("• Prix au m² borné (anti-aberrations)",{"size":14,"color":WHITE}),
    ("• Agrégats API (pas 10 Go bruts côté client)",{"size":14,"color":WHITE}),
    ("• Fenêtre 3 ans = tendance lisible",{"size":14,"color":WHITE})],space=8)
box(s,Inches(6.9),Inches(2.0),Inches(5.7),Inches(3.5),fill=PANEL,line=BLUE)
txt(s,Inches(7.15),Inches(2.25),Inches(5.2),Inches(3.1),[("LIMITES & PISTES",{"size":16,"color":BLUE,"bold":True}),
    ("• Instantané géo = niveau de prix médian",{"size":14,"color":WHITE}),
    ("• Données DVF parfois imparfaites",{"size":14,"color":WHITE}),
    ("• Aller plus loin : prévision, +sources INSEE",{"size":14,"color":WHITE})],space=8)
footer(s,13)

# 14 — Conclusion
s=prs.slides.add_slide(BLANK); bg(s); header(s,"Conclusion","Ce que je retiens")
bullets(s,["Une chaîne data complète : de la donnée brute (API/Pandas/SQLite) au dashboard React interactif.",
           "Un livrable qui répond à l'énoncé : comprendre le marché immobilier en 10 secondes.",
           "Compétences : Pandas, fusion de sources, agrégation, dataviz, storytelling, et un vrai souci du design.",
           ("Et un projet qui sort du lot par son originalité (thèmes, jeu, portfolio).",0)],top=Inches(2.1),width=Inches(12))
footer(s,14)

# 15 — Merci
s=prs.slides.add_slide(BLANK); bg(s); box(s,0,0,W,Inches(0.16),fill=ACCENT)
txt(s,Inches(0.8),Inches(2.8),Inches(11.7),Inches(1.5),[("Merci de votre attention",{"size":40,"color":WHITE,"bold":True,"font":"Fraunces"}),("Place à vos questions",{"size":24,"color":ACCENT,"bold":True,"font":"Fraunces"})],space=10)
txt(s,Inches(0.85),Inches(5.2),Inches(11),Inches(0.6),[("Hugo Berton — ImmoDash · github.com/H129hj/ImmoDash",{"size":14,"color":MUTED})])

out=os.path.join(ICI,"soutenance_immodash.pptx"); prs.save(out)
print("PPTX :",out,"—",len(prs.slides._sldIdLst),"slides")
