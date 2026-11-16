# Generaliza fontes e agenda (Detrans + órgãos públicos + leiloeiros). Rodar depois de design2.py.
import re
p='base/template.html'; t=open(p,encoding='utf-8').read()
def R(a,b,cnt=1):
    global t
    assert a in t, a[:80]
    t=t.replace(a,b) if cnt==0 else t.replace(a,b,cnt)
# fontes dinâmicas
R("const SRCN={caixa:'Caixa',superbid:'Superbid',detran:'Detran-BA',li:'Leilão Imóvel',mega:'Mega Leilões'};",
  "const SRCN=Object.assign({caixa:'Caixa',superbid:'Superbid',detran:'Detran-BA',li:'Leilão Imóvel',mega:'Mega Leilões'},typeof SRC_EXTRA!=='undefined'?SRC_EXTRA:{});\n"
  "{const s=document.getElementById('fSrc');if(s)s.innerHTML='<option value=\"\">Todas as fontes</option>'+Object.entries(SRCN).sort((a,b)=>a[1].localeCompare(b[1])).map(([k,v])=>`<option value=\"${k}\">${v}</option>`).join('')+'<option value=\"pncp\">Agenda de órgãos públicos</option>';}")
# eventos com valor, tipo e grupos
R("lat:+c[8],lon:+c[9],obs:c[10]||''};}",
  "lat:+c[8],lon:+c[9],obs:c[10]||'',val:+c[11]||0,kind:c[12]||'det',gs:evGs(c[10]+' '+c[4],c[12]||'det')};}")
R("const EVS=AGENDA", """const EVK={det:'Leilão de Detran',pub:'Leilão público',pri:'Leilão',nic:'Leilão especial'},EVC={det:'var(--g-car)',pub:'#6A4BB0',pri:'#0B8A63',nic:'#B5651D'};
function evGs(s,k){if(k==='det')return['car','moto','cam','suc'];const o=[];if(/im[oó]ve|terreno|lote(s)? urban|gleba|apartamento|pr[eé]dio|[aá]rea (de|p[uú]blica)|casa /i.test(s))o.push('imo');if(/ve[ií]cul|moto|caminh|carro|frota|[oô]nibus|ambul|sucata/i.test(s))o.push('car','moto','cam','suc');if(/m[aá]quina|trator|equipament|implement|p[aá] carreg|retro/i.test(s))o.push('maq','ind');if(/gado|bovino|equino|animais|semovente/i.test(s))o.push('div');return o.length?o:['ind','div','casa','tec'];}
function evQ(e,cls){return e.n?`<b>${e.n.toLocaleString('pt-BR')}</b>${cls?'<span class="mut">lotes</span>':'lotes'}`:e.val>100?`<b>${brlK(e.val)}</b>${cls?'<span class="mut">em bens</span>':'em bens'}`:`<b>Edital</b>`;}
const EVS=AGENDA""")
# lista da agenda
R("<div class=\"n\"><b>${e.n.toLocaleString('pt-BR')}</b>lotes · ${evWhen(e)}</div>","<div class=\"n\">${evQ(e)} · ${evWhen(e)}</div>")
R("<div class=\"m\">${esc(e.cities.join(', '))} — ${esc(e.leil)}${dias?' · até'+dias:''}</div>",
  "<div class=\"m\">${e.kind==='det'?esc(e.cities.join(', '))+' — '+esc(e.leil):'<i class=\"evk\" style=\"background:'+EVC[e.kind]+'\"></i>'+esc(e.obs.slice(0,110))}${dias?' · até'+dias:''}</div>")
R("Nenhum leilão de Detran na agenda para esse filtro.","Nenhum leilão na agenda para esse filtro.")
R("${L.length===1?'leilão':'leilões'} · ${tot.toLocaleString('pt-BR')} veículos e sucatas","${L.length===1?'leilão':'leilões'}${tot?' · '+tot.toLocaleString('pt-BR')+' lotes informados':''}")
R("function agFilter(){const uf=$('agUf').value||st.uf;","function agFilter(){const uf=$('agUf').value||st.uf;const kd=$('agKind').value;")
R("return EVS.filter(e=>(!uf||e.uf===uf)&&","return EVS.filter(e=>(!kd||e.kind===kd)&&(!uf||e.uf===uf)&&")
R("norm(e.cities.join(' ')+' '+e.org+' '+UFN[e.uf])","norm(e.cities.join(' ')+' '+e.org+' '+UFN[e.uf]+' '+e.obs)")
R('<select id="agWhen" aria-label="Período">','<select id="agKind" aria-label="Tipo"><option value="">Todos os tipos</option><option value="det">Detrans</option><option value="pub">Prefeituras e órgãos públicos</option><option value="pri">Leiloeiros</option><option value="nic">Agro, arte e outros</option></select><select id="agWhen" aria-label="Período">')
R("$('agUf').onchange=renderAgenda;","$('agUf').onchange=renderAgenda;$('agKind').onchange=renderAgenda;")
R("Agenda de leilões de Detrans","Agenda de leilões")
# ficha do evento
R("const facts=[['Data',fmt(e.ini)+(e.fim-e.ini>DAY?' a '+fmt(e.fim):'')],['Quando',evWhen(e)],['Lotes',e.n.toLocaleString('pt-BR')],['Estado',UFN[e.uf]],['Leiloeiro',e.leil],e.obs?['Detalhes',e.obs]:null].filter(Boolean);",
  "const facts=[['Data',fmt(e.ini)+(e.fim-e.ini>DAY?' a '+fmt(e.fim):'')],['Quando',evWhen(e)],e.n?['Lotes',e.n.toLocaleString('pt-BR')]:null,e.val>100?['Valor dos bens',brl(e.val)]:null,['Estado',UFN[e.uf]],[e.kind==='pub'?'Plataforma':'Leiloeiro',e.leil||'ver edital'],e.obs?['Detalhes',e.obs]:null].filter(Boolean);")
R('<span class="tag" style="background:var(--g-car);color:#fff">Leilão de Detran</span>','<span class="tag" style="background:${EVC[e.kind]};color:#fff">${EVK[e.kind]}</span>')
R("<p class=\"note\">Calendário oficial consultado em ${DATA_DATE}.","<p class=\"note\">${e.kind==='pub'?'Edital publicado no Portal Nacional de Contratações Públicas (PNCP)':'Calendário oficial'} consultado em ${DATA_DATE}.")
# pinos da agenda no mapa
R("function renderAgPins(){const on=!st.g||['car','moto','cam','suc'].includes(st.g);const L=on&&st.src!=='caixa'&&st.src!=='superbid'&&st.src!=='li'&&st.src!=='mega'?EVS.filter(e=>(!st.uf||e.uf===st.uf)&&nearOk(e.lat,e.lon)):[];",
  "function renderAgPins(){const L=EVS.filter(e=>(!st.g||e.gs.includes(st.g))&&(!st.src||(st.src==='detran'&&e.kind==='det')||(st.src==='pncp'&&e.kind==='pub'))&&(!st.uf||e.uf===st.uf)&&nearOk(e.lat,e.lon));")
R("style=\"fill:var(--card);stroke:var(--g-car);stroke-width:${1.6/scale}\"/>","style=\"fill:var(--card);stroke:${EVC[e.kind]};stroke-width:${1.6/scale}\"/>")
R("font-weight:700;fill:var(--g-car)\">${e.ini.getDate()}","font-weight:700;fill:${EVC[e.kind]}\">${e.ini.getDate()}")
R("<title>${e.org} · ${e.cities[0]} · ${e.n} lotes</title>","<title>${esc(e.org)} · ${esc(e.cities[0])}</title>")
R("<b style=\"color:var(--ink)\">${EVS.length} leilões futuros</b> com ${EVS.reduce((s,e)=>s+e.n,0).toLocaleString('pt-BR')} lotes em ${new Set(EVS.map(e=>e.uf)).size} estados.",
  "<b style=\"color:var(--ink)\">${EVS.length} leilões futuros</b> em ${new Set(EVS.map(e=>e.uf)).size} estados: ${EVS.filter(e=>e.kind==='det').length} de Detrans e ${EVS.filter(e=>e.kind==='pub').length} de prefeituras e órgãos públicos.")
# Início
R("<i style=\"background:var(--g-car)\">📅</i>${esc(e.org)}","<i style=\"background:${EVC[e.kind]}\">📅</i>${esc(e.org)}")
R("<div class=\"pr\"><b>${e.n.toLocaleString('pt-BR')}</b><span class=\"mut\">lotes</span></div>","<div class=\"pr\">${evQ(e,1)}</div>")
R("if(s.ev){items=evs.slice(0,12).map(oEv);n=evs.length;}","if(s.ev){const E=evs.filter(e=>s.ev===true||e.kind===s.ev);items=E.slice(0,12).map(oEv);n=E.length;}")
R("{seg:'veic',t:'Próximos leilões de Detran',d:'Calendários oficiais dos pátios',ev:true},",
  "{seg:'veic',t:'Próximos leilões de Detran',d:'Calendários oficiais dos pátios',ev:'det'},\n {seg:'*',t:'Prefeituras e órgãos públicos',d:'Veículos, máquinas e imóveis públicos (PNCP)',ev:'pub'},")
R("'Próximos leilões de Detran','Imóveis até R$ 80 mil'","'Próximos leilões de Detran','Prefeituras e órgãos públicos','Imóveis até R$ 80 mil'")
R(":LBASE[c[1]]+c[17],",":(LBASE[c[1]]||'')+c[17],")
t=t.replace('</style>','.evk{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;vertical-align:1px}\n</style>',1)
open(p,'w',encoding='utf-8').write(t);print('fontes_patch ok')

t=open(p,encoding='utf-8').read()
def R2(a,b):
    global t
    assert a in t, a[:70]; t=t.replace(a,b,1)
R2("<div class=\"t\">${e.org} · ${esc(e.cities[0])}","<div class=\"t\">${esc(e.org)}${norm(e.org).includes(norm(e.cities[0]))?'':' · '+esc(e.cities[0])}")
R2("<h2>${esc(e.org)} — ${esc(e.cities.join(', '))}</h2>","<h2>${esc(e.org)}${norm(e.org).includes(norm(e.cities[0]))&&e.cities.length===1?'':' — '+esc(e.cities.join(', '))}</h2>")
R2(",e.obs?['Detalhes',e.obs]:null].filter(Boolean);",",e.kind==='det'&&e.obs?['Detalhes',e.obs]:null].filter(Boolean);")
R2("<div class=\"row2\"><a class=\"btn\" href=\"${e.url}\">Site do leilão / edital</a>","${e.kind!=='det'&&e.obs?`<p class=\"evobs\">${esc(e.obs)}</p>`:''}<div class=\"row2\"><a class=\"btn\" href=\"${e.url}\">Site do leilão / edital</a>")
t=t.replace('</style>','.evobs{margin:12px 0 4px;font-size:14px;line-height:1.5;color:var(--ink)}\n</style>',1)
open(p,'w',encoding='utf-8').write(t);print('ajustes agenda ok')

t=open(p,encoding='utf-8').read()
t=t.replace("if(e&&+e<NOW-36e5){lots.splice(i,1);HIDDEN++;}","if(e&&+e<NOW){lots.splice(i,1);HIDDEN++;}",1)
open(p,'w',encoding='utf-8').write(t);print('encerrados ok')
