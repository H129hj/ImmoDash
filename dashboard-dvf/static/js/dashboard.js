/* ===========================================================
   dashboard.js — lecture de data/dashboard_data.json
   Visuels : Chart.js + carte choroplèthe Leaflet (GeoJSON départements).
   =========================================================== */

const COL = { accent:'#ff7a1a', blue:'#4f9cf9', green:'#2ecc8f', red:'#ff5d6c', purple:'#a78bfa',
              grid:'rgba(138,155,180,.15)', text:'#8b9bb4' };

const fmt = n => (n==null ? '—' : Math.round(n).toLocaleString('fr-FR'));
const eur = n => (n==null ? '—' : Math.round(n).toLocaleString('fr-FR') + ' €');

let DATA = null;

Chart.defaults.color = COL.text;
Chart.defaults.font.family = "'Segoe UI',sans-serif";
Chart.defaults.plugins.legend.labels.usePointStyle = true;

fetch('data/dashboard_data.json')
  .then(r => { if(!r.ok) throw new Error('data'); return r.json(); })
  .then(d => { DATA = d; init(); })
  .catch(err => {
    document.getElementById('loading').textContent =
      "Impossible de charger les données — lancez d'abord : python3 main.py";
    console.error(err);
  });

function init(){
  renderMeta(); renderKpis(); renderInsights();
  renderEvolution('prix_m2'); renderDepartements(); renderSegments();
  renderType(); renderCommunes(); renderFocus(); renderTable();
  renderMap();
  document.getElementById('loading').classList.add('hidden');
}

/* ---------- Méta / KPIs / Insights ---------- */
function renderMeta(){
  const m = DATA.meta;
  document.getElementById('meta-periode').textContent = m.periode;
  document.getElementById('meta-volume').textContent = fmt(m.lignes_propres);
  document.getElementById('meta-date').textContent = m.genere_le;
  document.getElementById('meta-nettoyage').textContent =
    `${fmt(m.lignes_brutes)} lignes brutes → ${fmt(m.lignes_propres)} exploitables (${m.pct_conserve} %)`;
}

function renderKpis(){
  const k = DATA.kpis;
  const cards = [
    { cls:'',       label:'Prix médian national', value:eur(k.prix_m2_median),
      sub:`Moyenne ${eur(k.prix_m2_moyen)}` },
    { cls:'blue',   label:'Transactions analysées', value:fmt(k.nb_transactions),
      sub:`${fmt(k.nb_communes)} communes` },
    { cls:'purple', label:'Départements couverts', value:fmt(k.nb_departements),
      sub:'métropole + outre-mer' },
    { cls:'green',  label:'Appartement vs Maison', value:`${eur(k.prix_appart_median)}`,
      sub:`appart. · maison ${eur(k.prix_maison_median)}` },
  ];
  document.getElementById('kpis').innerHTML = cards.map(c=>`
    <div class="kpi ${c.cls}">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value">${c.value}</div>
      <div class="kpi-sub">${c.sub}</div>
    </div>`).join('');
}

function renderInsights(){
  document.getElementById('insights').innerHTML = DATA.insights.map(i=>`<li>${i}</li>`).join('');
}

/* ---------- Évolution mensuelle (combo) ---------- */
let chartEvolution=null;
const labelSerie={prix_m2:'Prix médian €/m²',prix_appart:'Appartements €/m²',prix_maison:'Maisons €/m²'};
function renderEvolution(serie){
  const ev=DATA.evolution_mensuelle;
  const labels=ev.map(p=>p.label), prix=ev.map(p=>p[serie]), volume=ev.map(p=>p.volume);
  if(chartEvolution) chartEvolution.destroy();
  chartEvolution=new Chart(document.getElementById('chart-evolution'),{
    data:{labels,datasets:[
      {type:'line',label:labelSerie[serie],data:prix,yAxisID:'y',borderColor:COL.accent,
       backgroundColor:'rgba(255,122,26,.12)',borderWidth:3,tension:.35,fill:true,pointRadius:3,pointHoverRadius:5},
      {type:'bar',label:'Volume de ventes',data:volume,yAxisID:'y1',
       backgroundColor:'rgba(79,156,249,.45)',borderRadius:3}
    ]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      scales:{x:{grid:{display:false}},
        y:{position:'left',grid:{color:COL.grid},ticks:{callback:v=>v/1000+'k €'},title:{display:true,text:'€/m²'}},
        y1:{position:'right',grid:{drawOnChartArea:false},title:{display:true,text:'ventes/mois'}}},
      plugins:{tooltip:{callbacks:{label:c=>c.dataset.type==='bar'
        ?` ${c.dataset.label}: ${fmt(c.raw)}`:` ${c.dataset.label}: ${eur(c.raw)}`}}}}
  });
}
document.getElementById('toggle-evolution').addEventListener('click',e=>{
  if(e.target.tagName!=='BUTTON')return;
  document.querySelectorAll('#toggle-evolution button').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active'); renderEvolution(e.target.dataset.serie);
});

/* ---------- Classement départements (bar) ---------- */
function renderDepartements(){
  const top=DATA.classement_departements.slice(0,12);
  new Chart(document.getElementById('chart-dep'),{
    type:'bar',
    data:{labels:top.map(d=>d.nom),datasets:[{label:'€/m² moyen',data:top.map(d=>d.prix_moyen),
      backgroundColor:COL.accent,borderRadius:5}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+eur(c.raw)}}},
      scales:{x:{grid:{color:COL.grid},ticks:{callback:v=>v/1000+'k'}},y:{grid:{display:false}}}}
  });
}

/* ---------- Segments (doughnut) ---------- */
function renderSegments(){
  const s=DATA.segments;
  new Chart(document.getElementById('chart-segments'),{
    type:'doughnut',
    data:{labels:s.map(x=>`${x.segment} (${x.part_pct}%)`),
      datasets:[{data:s.map(x=>x.nb),backgroundColor:[COL.green,COL.blue,COL.accent],borderColor:'#18223a',borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'58%',
      plugins:{legend:{position:'right'},tooltip:{callbacks:{label:c=>` ${c.label} — ${fmt(c.raw)} biens`}}}}
  });
}

/* ---------- Type de bien (bar) ---------- */
function renderType(){
  const t=DATA.type_bien;
  new Chart(document.getElementById('chart-type'),{
    type:'bar',
    data:{labels:t.map(x=>x.type),datasets:[{label:'€/m² médian',data:t.map(x=>x.prix_m2_median),
      backgroundColor:[COL.blue,COL.accent],borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${eur(c.raw)} · ${fmt(t[c.dataIndex].nb)} ventes`}}},
      scales:{x:{grid:{display:false}},y:{grid:{color:COL.grid},ticks:{callback:v=>v/1000+'k €'}}}}
  });
}

/* ---------- Top communes (bar) ---------- */
function renderCommunes(){
  const c=DATA.top_communes.slice(0,10);
  new Chart(document.getElementById('chart-communes'),{
    type:'bar',
    data:{labels:c.map(x=>`${x.commune} (${x.departement})`),
      datasets:[{label:'€/m² médian',data:c.map(x=>x.prix_m2_median),backgroundColor:COL.purple,borderRadius:5}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+eur(c.raw)}}},
      scales:{x:{grid:{color:COL.grid},ticks:{callback:v=>v/1000+'k'}},y:{grid:{display:false}}}}
  });
}

/* ---------- Focus Bouches-du-Rhône ---------- */
function renderFocus(){
  const f=DATA.focus_bdr;
  document.getElementById('focus-kpis').innerHTML = [
    {l:'Prix médian',v:eur(f.prix_m2_median)},
    {l:'Transactions',v:fmt(f.nb_transactions)},
    {l:'Rang national',v:`${f.rang_departement}ᵉ`},
    {l:'Appart. / Maison',v:`${eur(f.prix_appart)} / ${eur(f.prix_maison)}`},
  ].map(k=>`<div class="focus-kpi"><span>${k.l}</span><b>${k.v}</b></div>`).join('');
  document.querySelector('#focus-communes tbody').innerHTML = f.top_communes.map((c,i)=>`
    <tr><td class="rank">${i+1}</td><td>${c.commune}</td>
        <td class="num">${eur(c.prix_m2_median)}</td><td class="num">${fmt(c.nb)} ventes</td></tr>`).join('');
}

/* ---------- Carte choroplèthe (Leaflet + GeoJSON) ---------- */
const PALIERS=[
  {max:2500,col:'#2ecc8f',txt:'< 2 500'},
  {max:3500,col:'#9bd64a',txt:'2 500 – 3 500'},
  {max:4500,col:'#f5c542',txt:'3 500 – 4 500'},
  {max:6000,col:'#ff9f1a',txt:'4 500 – 6 000'},
  {max:Infinity,col:'#ff5d6c',txt:'> 6 000'},
];
const couleur=p=>p==null?'#33415c':(PALIERS.find(x=>p<x.max)||PALIERS.at(-1)).col;

function renderMap(){
  const prixParDep={}; DATA.classement_departements.forEach(d=>prixParDep[d.code]=d.prix_moyen);
  const map=L.map('map',{scrollWheelZoom:false,attributionControl:false}).setView([46.6,2.5],5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',{maxZoom:10}).addTo(map);
  fetch('static/vendor/departements.geojson').then(r=>r.json()).then(geo=>{
    L.geoJSON(geo,{
      style:f=>({fillColor:couleur(prixParDep[f.properties.code]),weight:1,color:'#0e1525',fillOpacity:.8}),
      onEachFeature:(f,layer)=>{
        const p=prixParDep[f.properties.code];
        layer.bindPopup(`<b>${f.properties.nom} (${f.properties.code})</b><br>${p?eur(p)+'/m² en moyenne':'données insuffisantes'}`);
        layer.on({
          mouseover:e=>e.target.setStyle({weight:2.5,color:'#fff',fillOpacity:.95}),
          mouseout:e=>e.target.setStyle({weight:1,color:'#0e1525',fillOpacity:.8}),
        });
      }
    }).addTo(map);
  });
  document.getElementById('map-legend').innerHTML='<span style="color:var(--muted)">€/m² moyen :</span>'+
    PALIERS.map(p=>`<span><i style="background:${p.col}"></i>${p.txt}</span>`).join('');
}

/* ---------- Tableau départements ---------- */
let sortKey='prix_moyen',sortDir=-1;
function renderTable(){
  const tbody=document.querySelector('#table tbody');
  const q=(document.getElementById('search').value||'').toLowerCase().trim();
  let rows=DATA.classement_departements.filter(d=>d.nom.toLowerCase().includes(q)||String(d.code).includes(q));
  rows.sort((a,b)=>{let va=a[sortKey],vb=b[sortKey];
    if(typeof va==='string')return sortDir*va.localeCompare(vb);
    return sortDir*((va??-Infinity)-(vb??-Infinity));});
  tbody.innerHTML=rows.length?rows.map(d=>`
    <tr><td>${d.nom}</td><td class="num">${d.code}</td>
      <td class="num">${eur(d.prix_moyen)}</td><td class="num">${eur(d.prix_median)}</td>
      <td class="num">${fmt(d.nb)}</td><td class="num">${fmt(d.population)}</td>
      <td class="num">${fmt(d.ventes_100k_hab)}</td></tr>`).join('')
    :`<tr class="search-row"><td colspan="7">Aucun département pour « ${q} ».</td></tr>`;
  document.getElementById('table-info').textContent=
    `${rows.length} département(s) · tri : ${sortKey} ${sortDir<0?'↓':'↑'}`;
}
document.querySelectorAll('#table thead th').forEach(th=>th.addEventListener('click',()=>{
  const k=th.dataset.key;
  if(k===sortKey)sortDir*=-1; else {sortKey=k;sortDir=(k==='nom'?1:-1);}
  renderTable();
}));
document.getElementById('search').addEventListener('input',renderTable);
