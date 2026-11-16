// ================= Melhorias de uso e ferramentas novas =================
const SITE='https://julio8794.github.io/radar-leiloes/';

// ---------- Novidades desde a última visita ----------
const NEWIDS=(()=>{try{const ids=lots.map(l=>l.id);const prev=JSON.parse(localStorage.getItem('rl_snap')||'null');let nw=[];
  if(!prev){localStorage.setItem('rl_snap',JSON.stringify({d:DATA_DATE,ids:ids.join(',')}));}
  else if(prev.d!==DATA_DATE){const s=new Set(prev.ids.split(','));nw=ids.filter(i=>!s.has(i));localStorage.setItem('rl_new',JSON.stringify({d:DATA_DATE,ids:nw}));localStorage.setItem('rl_snap',JSON.stringify({d:DATA_DATE,ids:ids.join(',')}));}
  else{const n=JSON.parse(localStorage.getItem('rl_new')||'null');if(n&&n.d===DATA_DATE)nw=n.ids;}
  return new Set(nw);}catch(e){return new Set();}})();
OPO.splice(1,0,{seg:'*',t:'Novidades desde sua última visita',d:'Lotes que entraram desde que você abriu o app pela última vez',f:l=>NEWIDS.has(l.id)&&l.price,s:(a,b)=>(b.desc||0)-(a.desc||0)||(a.end?+a.end:1e15)-(b.end?+b.end:1e15),act:{nw:1,sortL:'desc'}});
TUDO.splice(1,0,'Novidades desde sua última visita');

// ---------- Filtros rápidos acima da lista ----------
const VQ={
 veh:[['Para rodar',{suc:'ok'}],['Sucata',{suc:'suc'}],['Até R$ 15 mil',{max:15000}],['Até R$ 30 mil',{max:30000}],['2015 ou mais novo',{anoMin:2015}],['2020 ou mais novo',{anoMin:2020}]],
 imo:[['Aceita financiamento',{fin:1}],['Até R$ 100 mil',{max:100000}],['Até R$ 250 mil',{max:250000}],['2+ quartos',{qto:2}],['3+ quartos',{qto:3}],['50% ou mais de desconto',{desc:50}]]};
const vqOn=o=>Object.entries(o).every(([k,v])=>st[k]===v);
function renderVQ(){const el=$('vq');if(!el)return;const set=VEH.includes(st.g)||st.g==='suc'?VQ.veh:st.g==='imo'?VQ.imo:null;
 if(!set){el.innerHTML='';el.hidden=true;return;}el.hidden=false;
 el.innerHTML=set.map(([t,o],i)=>`<button type="button" data-vq="${i}" class="${vqOn(o)?'on':''}">${t}</button>`).join('');el._set=set;}
$('vq').onclick=e=>{const b=e.target.closest('[data-vq]');if(!b)return;const o=$('vq')._set[+b.dataset.vq][1];const on=vqOn(o);
 Object.entries(o).forEach(([k,v])=>{st[k]=on?(k==='max'?Infinity:k==='suc'?'':0):v;});
 if('max' in o){$('fMax').value=st.max===Infinity?100:Math.round(Math.cbrt(st.max/PMAX)*100);$('vMax').textContent=st.max===Infinity?'sem limite':brlK(st.max);}
 if('suc' in o)$('fSuc').value=st.suc||'';if('desc' in o){$('fDesc').value=st.desc;$('vDesc').textContent=st.desc?st.desc+'% (só imóveis)':'qualquer';}
 st.page=40;renderAll();};
{const _rl=renderList;renderList=function(){renderVQ();_rl();};}

// ---------- Utilidades: compartilhar e calendário ----------
function shareIt(title,text,url){const full=text+'\n'+url;
 if(navigator.share){navigator.share({title,text,url}).catch(()=>{});return;}
 window.open('https://wa.me/?text='+encodeURIComponent(full),'_blank','noopener');}
const icsDate=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\n/g,'\\n');
function icsDownload(name,ev){const now=new Date();const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Radar de Leiloes//PT-BR','CALSCALE:GREGORIAN','BEGIN:VEVENT',
  'UID:'+ev.uid+'@radar-leiloes','DTSTAMP:'+icsDate(now),
  ...(ev.allDay?['DTSTART;VALUE=DATE:'+ev.start.replace(/-/g,''),'DTEND;VALUE=DATE:'+ev.end.replace(/-/g,'')]:['DTSTART:'+icsDate(ev.start),'DTEND:'+icsDate(ev.endD)]),
  'SUMMARY:'+icsEsc(ev.title),'DESCRIPTION:'+icsEsc(ev.desc),'URL:'+ev.url,
  'BEGIN:VALARM','TRIGGER:'+ev.alarm,'ACTION:DISPLAY','DESCRIPTION:'+icsEsc(ev.alarmTxt),'END:VALARM','END:VEVENT','END:VCALENDAR'];
 const txt=lines.join('\r\n');
 if(window.claude&&window.claude.use){window.claude.use('downloads').then(d=>{if(!d)return icsBlob(name,txt);return d.save({filename:name,data:txt}).then(()=>toast('Lembrete salvo: abra o arquivo para pôr na sua agenda')).catch(()=>{});}).catch(()=>icsBlob(name,txt));return;}
 icsBlob(name,txt);}
function icsBlob(name,txt){const blob=new Blob([txt],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);toast('Lembrete baixado: abra o arquivo para pôr na sua agenda');}
const isoDay=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10);};
const evKey=e=>e.uf+'|'+norm(e.org).slice(0,24)+'|'+isoDay(e.fim);

// ---------- Custo total estimado ----------
function costHtml(l){if(!l.price)return '';const p=l.price;let parts,total;
 if(l.g==='imo'){parts=[['Comissão do leiloeiro (5%)',p*.05],['ITBI (~3%)',p*.03],['Escritura e registro (~1,5%)',p*.015]];}
 else if(VEH.includes(l.g)||l.g==='suc'){const suc=isSuc(l);parts=[['Comissão do leiloeiro (5%)',p*.05],[suc?'Retirada e baixa (estimativa)':'Transferência, vistoria e taxas (estimativa)',suc?300:900]];}
 else parts=[['Comissão do leiloeiro (5%)',p*.05]];
 total=p+parts.reduce((s,x)=>s+x[1],0);const ref=l.aval&&l.aval>total?l.aval:null;
 return `<div class="cost"><div class="ch"><span>Custo total estimado</span><b>${brl(Math.round(total))}</b></div>
  <ul>${[['Lance atual',p],...parts].map(([k,v])=>`<li><span>${k}</span><span>${brl(Math.round(v))}</span></li>`).join('')}</ul>
  ${ref?`<p class="cgood">Fica ${brl(Math.round(ref-total))} abaixo da avaliação (${Math.round(100-total*100/ref)}%).</p>`:''}
  <p class="cnote">Estimativa com taxas usuais. ${l.g==='imo'?'Dívidas de condomínio/IPTU e desocupação podem existir.':VEH.includes(l.g)?'Débitos e pátio dependem do edital; compare com a FIPE abaixo.':''} Confira no edital.</p></div>`;}

// ---------- Ficha do lote: aviso, custo, compartilhar e lembrete ----------
{const _open=openLot;openLot=function(l){_open(l);if(!l)return;const box=$('sheetBox');
 if(l.desc!=null&&l.desc>=80){const w=document.createElement('p');w.className='warn';w.textContent=l.g==='imo'?'⚠ Desconto acima de 80%: costuma indicar imóvel ocupado, com dívidas, só parte do bem ou condições especiais. Leia o edital e a matrícula antes de dar lance.':'⚠ Desconto acima de 80%: em veículos costuma indicar sinistro, sucata ou um lance inicial que ainda vai subir. Veja fotos, laudo e edital antes de dar lance.';box.querySelector('.price').after(w);}
 const g2=box.querySelector('.grid2');if(g2)g2.insertAdjacentHTML('afterend',costHtml(l));
 const acts=box.querySelector('.acts');if(acts){acts.insertAdjacentHTML('beforeend',`<button id="sShare">↗ Compartilhar</button>${l.end?'<button id="sIcs">⏰ Lembrete</button>':''}`);acts.classList.add('acts5');
  $('sShare').onclick=()=>shareIt(l.title,`${l.title} — ${l.price?brl(l.price):'preço sob consulta'} · ${l.city}/${l.uf}${l.desc?` · ${l.desc}% abaixo da avaliação`:''}`,SITE+'#lote='+encodeURIComponent(l.id));
  if(l.end)$('sIcs').onclick=()=>icsDownload('lote-'+l.id+'.ics',{uid:l.id,start:new Date(+l.end-36e5),endD:l.end,title:'Leilão encerra: '+l.title,desc:`${l.price?brl(l.price):''} · ${l.city}/${l.uf}\nAnúncio oficial: ${l.link}\nRadar: ${SITE}#lote=${l.id}`,url:l.link,alarm:'-PT3H',alarmTxt:'Leilão encerra em 4 horas'});}
 try{history.replaceState(null,'','#lote='+encodeURIComponent(l.id));}catch(e){}};}

// ---------- Ficha do leilão (agenda): guia, compartilhar e lembrete ----------
const DET_OFF={SP:'https://www.detran.sp.gov.br/detransp?id=editais_leilao',MS:'https://www.detran.ms.gov.br/informativo/editais-leiloes-e-licitacoes/',PR:'https://www.detran.pr.gov.br/Pagina/Leiloes-publicos',GO:'https://goias.gov.br/detran/leiloes/',RS:'https://pcsdetran.rs.gov.br/consulta-calendario-leilao',MG:'https://leilao.detran.mg.gov.br/',BA:'https://www.ba.gov.br/detran/',ES:'https://detran.es.gov.br/',AC:'https://www.detran.ac.gov.br',TO:'https://www.to.gov.br/detran'};
function guideHtml(e){const off=DET_OFF[e.uf];
 return `<details class="guide" open><summary>Como participar deste leilão</summary><ol>
  <li><b>Leia o edital</b>${off?` no <a href="${off}" target="_blank" rel="noopener">site oficial do ${esc(e.org)}</a>`:''}: lista de lotes, lance mínimo, taxas e prazos.</li>
  <li><b>Cadastre-se no site do leiloeiro</b> indicado no edital com antecedência (em geral até 24–48 h antes) e envie os documentos pedidos.</li>
  <li><b>Visite o pátio</b> nos dias de visitação: não dá para ligar o veículo nem levar peças.</li>
  <li><b>Veículos para circular</b> podem ser comprados por qualquer pessoa; <b>sucatas</b> só por empresas credenciadas como desmanche (Lei 12.977/2014).</li>
  <li><b>Depois do arremate</b>: pague no prazo, retire no pátio e faça a transferência/vistoria; débitos anteriores normalmente são baixados pelo Detran (confira).</li></ol>
  <p class="warn">⚠ Golpe comum: sites falsos de "leilão do Detran" com carros muito baratos e pagamento por Pix. Só dê lance no site do leiloeiro que aparece no edital oficial.</p></details>`;}
{const _oe=openEv;openEv=function(e){_oe(e);if(!e)return;const box=$('sheetBox');const row=box.querySelector('.row2');
 if(row){row.insertAdjacentHTML('afterend',`<div class="acts acts2"><button id="eIcs">⏰ Lembrete na agenda</button><button id="eShare">↗ Compartilhar</button></div>`);
  $('eIcs').onclick=()=>{const d0=isoDay(e.ini),d1=new Date(e.fim.getTime()+864e5);icsDownload('leilao-'+e.uf+'-'+isoDay(e.fim)+'.ics',{uid:evKey(e).replace(/[^a-z0-9]/gi,''),allDay:true,start:d0,end:isoDay(d1),title:`Leilão ${e.org} (${e.cities[0]})`,desc:`${e.obs||''}\nEdital/site: ${e.url}\nCadastre-se no site do leiloeiro até 48 h antes.\nRadar: ${SITE}#ev=${encodeURIComponent(evKey(e))}`,url:e.url,alarm:'-P2D',alarmTxt:'Leilão em 2 dias: faça o cadastro no site do leiloeiro'});};
  $('eShare').onclick=()=>shareIt(e.org,`Leilão ${e.org} · ${e.cities.join(', ')} · ${e.fim.toLocaleDateString('pt-BR')}`,SITE+'#ev='+encodeURIComponent(evKey(e)));}
 if(e.kind==='det'){const n=box.querySelector('.note');(n||box.lastElementChild).insertAdjacentHTML('beforebegin',guideHtml(e));}
 try{history.replaceState(null,'','#ev='+encodeURIComponent(evKey(e)));}catch(x){}};}
{const _cs=closeSheet;closeSheet=function(){_cs();try{if(/^#(lote|ev)=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);}catch(e){}};}

// ---------- Abrir link compartilhado ----------
function openFromHash(){const h=decodeURIComponent(location.hash||'');let m=h.match(/^#lote=(.+)$/);
 if(m){const l=BYID.get(m[1]);if(l){openLot(l);}else toast('Esse lote já encerrou ou saiu da lista.');return;}
 m=h.match(/^#ev=(.+)$/);if(m){const e=EVS.find(x=>evKey(x)===m[1]);if(e){show('agenda');openEv(e);}else toast('Esse leilão já aconteceu.');}}

// ---------- App instalável ----------
let _bip=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();_bip=e;const b=$('instBtn');if(b)b.hidden=false;});
function installApp(){if(_bip){_bip.prompt();_bip.userChoice.finally(()=>{_bip=null;$('instBtn').hidden=true;});return;}
 toast(/iphone|ipad/i.test(navigator.userAgent)?'No iPhone: toque em Compartilhar › Adicionar à Tela de Início':'No menu do navegador, escolha "Instalar app" ou "Adicionar à tela inicial"');}
try{if('serviceWorker' in navigator&&/github\.io$/.test(location.hostname))navigator.serviceWorker.register('sw.js');}catch(e){}
// acesso para testes automatizados
window.__r={get NEWIDS(){return NEWIDS},lots,st,BYID,base:()=>base(),show:v=>show(v),renderAll:()=>renderAll(),renderAgenda:()=>renderAgenda(),openLot:l=>openLot(l),closeSheet:()=>closeSheet(),clearAll:()=>clearAll(),isSuc,sheetMode:m=>sheetMode(m)};
