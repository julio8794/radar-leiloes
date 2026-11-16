# Melhorias de uso (nov/2026). Rodar depois de fontes_patch.py.
p = 'base/template.html'
t = open(p, encoding='utf-8').read()
def R(a, b, n=1):
    global t
    assert a in t, 'não achei: ' + a[:90]
    t = t.replace(a, b, n)

# --- desempenho: UF de lotes sem estado só contra as cidades (antes: 60 mil pontos por lote)
R("const ufPts=[...AGG_PRE.map(a=>[a.lat,a.lon,a.uf]),...lots.filter(l=>l.uf).map(l=>[l.lat,l.lon,l.uf])];",
  "const ufPts=AGG_PRE.map(a=>[a.lat,a.lon,a.uf]);")
# --- desempenho: "é sucata?" calculado uma vez por lote
R("const isSucF=l=>/sucata|inserv/i.test(l.title+' '+l.sub);", "const isSucF=l=>l._s??(l._s=/sucata|inserv/i.test(l.title+' '+l.sub));")
R("const isSuc=l=>/sucata|inserv/i.test(l.title+' '+l.sub);", "const isSuc=isSucF;")

# --- títulos de imóveis da Caixa com quartos e área
R("title:c[4]+(c[3]?' · '+c[3].replace(/\\w\\S*/g,w=>w[0]+w.slice(1).toLowerCase()):''),",
  "title:c[4]+(+c[10]?' · '+c[10]+(+c[10]>1?' quartos':' quarto'):'')+(+c[9]?' · '+Math.round(+c[9])+' m²':'')+(c[3]?' · '+c[3].replace(/\\w\\S*/g,w=>w[0]+w.slice(1).toLowerCase()):''),")

# --- novos filtros no estado e na busca
R("const st={g:'',uf:'',q:'',max:Infinity,desc:0,src:'',suc:'',sortL:'desc',page:40,city:null};",
  "const st={g:'',uf:'',q:'',max:Infinity,desc:0,src:'',suc:'',sortL:'desc',page:40,city:null,anoMin:0,fin:0,qto:0,nw:0};")
R("const k=JSON.stringify([st.g,st.uf,st.q,st.max,st.desc,st.src,st.suc,",
  "const k=JSON.stringify([st.g,st.uf,st.q,st.max,st.desc,st.src,st.suc,st.anoMin,st.fin,st.qto,st.nw,")
R("&&(!st.desc||(l.desc!=null&&l.desc>=st.desc)));}",
  "&&(!st.desc||(l.desc!=null&&l.desc>=st.desc))&&(!st.anoMin||(l.ano&&l.ano>=st.anoMin))&&(!st.fin||l.fin)&&(!st.qto||(l.qto&&l.qto>=st.qto))&&(!st.nw||(typeof NEWIDS!=='undefined'&&NEWIDS.has(l.id))));}")
R("function clearAll(){Object.assign(st,{g:'',q:'',max:Infinity,desc:0,src:'',suc:'',city:null});",
  "function clearAll(){Object.assign(st,{g:'',q:'',max:Infinity,desc:0,src:'',suc:'',city:null,anoMin:0,fin:0,qto:0,nw:0});")
R("function renderFilters(){const n=(st.max!==Infinity)+(!!st.desc)+(!!st.src)+(!!st.suc);",
  "function renderFilters(){const n=(st.max!==Infinity)+(!!st.desc)+(!!st.src)+(!!st.suc)+(!!st.anoMin)+(!!st.fin)+(!!st.qto)+(!!st.nw);")

# --- selo "novo" na lista
R("<div style=\"min-width:0\"><div class=\"t\">${esc(l.title)}</div>",
  "<div style=\"min-width:0\"><div class=\"t\">${typeof NEWIDS!=='undefined'&&NEWIDS.has(l.id)?'<i class=\"newb\">novo</i>':''}${esc(l.title)}</div>")

# --- chips de filtro rápido acima da lista
R('<div id="list"></div>', '<div id="vq" class="vq" hidden></div><div id="list"></div>')

# --- rodapé: instalar app
R('<button type="button" data-go="calc">Calculadora de lucro</button></p>',
  '<button type="button" data-go="calc">Calculadora de lucro</button> · <button type="button" id="instBtn2" onclick="installApp()">Instalar o app no celular</button></p>')
R('<meta name="theme-color" content="#14284B">',
  '<meta name="theme-color" content="#14284B">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Radar Leilões">')
R('Dados públicos de Caixa, Detrans, Superbid, Mega Leilões e Leilão Imóvel.',
  'Dados públicos de Caixa, Detrans, Copart, Superbid, Mega, Zuk, Sodré Santoro, Freitas, VIP, Leilão Imóvel e PNCP.')

# --- bloco novo antes da inicialização
js = open('melhorias.js', encoding='utf-8').read()
R("\nfit();renderAll();renderAgenda();show('opo');locLabel();",
  "\n" + js + "\nfit();renderAll();renderAgenda();show('opo');locLabel();openFromHash();window.addEventListener('hashchange',openFromHash);")

css = """
.vq{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.vq::-webkit-scrollbar{display:none}
.vq button{flex:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:7px 12px;font-size:13px;white-space:nowrap}
.vq button.on{background:var(--navy,#14284B);border-color:var(--navy,#14284B);color:#fff}
.newb{display:inline-block;font-style:normal;font-size:10.5px;font-weight:700;letter-spacing:.02em;background:#0B8A63;color:#fff;border-radius:5px;padding:1px 5px;margin-right:6px;vertical-align:1px}
.warn{background:#FFF4E5;border:1px solid #F5B800;border-radius:10px;padding:10px 12px;font-size:13.5px;line-height:1.45;color:#5C3B00;margin:10px 0}
.cost{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0;background:var(--card)}
.cost .ch{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.cost .ch span{font-size:13px;color:var(--mut,#5b6675)}.cost .ch b{font-size:19px}
.cost ul{list-style:none;margin:8px 0 0;padding:0}.cost li{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0;border-top:1px dashed var(--line)}
.cost .cgood{margin:8px 0 0;font-size:13.5px;font-weight:600;color:#0B8A63}.cost .cnote{margin:6px 0 0;font-size:12px;color:var(--mut,#5b6675);line-height:1.4}
.acts.acts5{flex-wrap:wrap}.acts.acts5 button{flex:1 1 30%}
.acts.acts2{margin-top:10px}
.guide{border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:12px 0;background:var(--card)}
.guide summary{font-weight:700;cursor:pointer;padding:2px 0}.guide ol{margin:8px 0 4px;padding-left:20px;font-size:14px;line-height:1.5}.guide li{margin:4px 0}
.guide .warn{margin:8px 0 2px}
"""
t = t.replace('</style>', css + '</style>', 1)
open(p, 'w', encoding='utf-8').write(t)
print('melhorias ok')
