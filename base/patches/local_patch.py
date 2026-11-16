# Filtro local: raios de 5, 10 e 20 km e "só a minha cidade". Rodar depois de melhorias_patch.py.
p = 'base/template.html'
t = open(p, encoding='utf-8').read()
def R(a, b, n=1):
    global t
    assert a in t, 'não achei: ' + a[:90]
    t = t.replace(a, b) if n == 0 else t.replace(a, b, n)

# opções de raio
R('<select id="nearR" aria-label="Raio"><option value="50">50 km</option><option value="100" selected>100 km</option><option value="200">200 km</option><option value="400">400 km</option></select',
  '<select id="nearR" aria-label="Raio"><option value="0">Só a cidade</option><option value="5">5 km</option><option value="10">10 km</option><option value="20">20 km</option><option value="50" selected>50 km</option><option value="100">100 km</option><option value="200">200 km</option><option value="400">400 km</option></select')
R('<div class="rads" id="rads"><button data-r="50">50 km</button><button data-r="100">100 km</button><button data-r="200">200 km</button><button data-r="400">400 km</button></div>',
  '<div class="rads" id="rads"><button data-r="0">Só a cidade</button><button data-r="5">5 km</button><button data-r="10">10 km</button><button data-r="20">20 km</button><button data-r="50">50 km</button><button data-r="100">100 km</button><button data-r="200">200 km</button><button data-r="400">400 km</button></div>')
R('.rads{display:flex;gap:6px;margin-top:8px}.rads button{flex:1;',
  '.rads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.rads button{')

# regra de distância: raio 0 = mesma cidade (pelo nome, ou a até 2 km do centro)
R("const nearOk=(lat,lon)=>!st.near||km(st.near.lat,st.near.lon,lat,lon)<=st.near.r;",
  "const nearOk=(lat,lon,c,uf)=>{if(!st.near)return true;const d=km(st.near.lat,st.near.lon,lat,lon);if(st.near.r>0)return d<=st.near.r;"
  "if(c!=null&&(!uf||uf===st.near.uf)){const cs=Array.isArray(c)?c:[c];if(cs.some(x=>norm(x)===st.near.nn))return true;}return d<=2;};\n"
  "const nearTxt=()=>!st.near?'':st.near.r>0?`até ${st.near.r} km de ${st.near.n}`:`em ${st.near.n}`;\n"
  "const nearShort=()=>!st.near?'':st.near.r>0?`${st.near.n} · ${st.near.r} km`:`${st.near.n} (só a cidade)`;")
R("nearOk(l.lat,l.lon)", "nearOk(l.lat,l.lon,l.city,l.uf)", 0)
R("nearOk(a.lat,a.lon)", "nearOk(a.lat,a.lon,a.city,a.uf)", 0)
R("nearOk(e.lat,e.lon)", "nearOk(e.lat,e.lon,e.cities,e.uf)", 0)
R("st.near={lat:p.lat,lon:p.lon,r:+$('nearR').value,n:p.n,uf:p.uf};", "st.near={lat:p.lat,lon:p.lon,r:+$('nearR').value,n:p.n,uf:p.uf,nn:norm(p.n)};")
R("const dLat=st.near.r/111,dLon=st.near.r/(111*Math.cos(p.lat*Math.PI/180));",
  "const zr=Math.max(st.near.r,8);const dLat=zr/111,dLon=zr/(111*Math.cos(p.lat*Math.PI/180));")
R("const rr=st.near.r/111*SC;", "const rr=Math.max(st.near.r,2)/111*SC;")

# textos
R("st.near?` até ${st.near.r} km de ${st.near.n}`", "st.near?' '+nearTxt()", 0)
R("${st.near?` até ${st.near.r} km de ${st.near.n}`:''}", "${st.near?' '+nearTxt():''}", 0) if "${st.near?` até ${st.near.r} km de ${st.near.n}`:''}" in t else None
R("const where=st.near?`até ${st.near.r} km de ${st.near.n}`:", "const where=st.near?nearTxt().replace(/^em /,''):")
R("st.near&&st.near.n+' ('+st.near.r+' km)'", "st.near&&nearShort()")
R("'📍 '+esc(st.near.n)+' · '+st.near.r+' km'", "'📍 '+esc(nearShort())")
R("toast('Mostrando oportunidades até '+st.near.r+' km de '+st.near.n)", "toast('Mostrando oportunidades '+nearTxt())")
R("$('locTxt').textContent=st.near?`${st.near.n} · ${st.near.r} km`:", "$('locTxt').textContent=st.near?nearShort():")
open(p, 'w', encoding='utf-8').write(t)
import re
left = re.findall(r'.{30}st\.near\.r\b.{30}', t)
print('local ok; usos restantes de st.near.r:', len(left))
for x in left: print('  ', x)
