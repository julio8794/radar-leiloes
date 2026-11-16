// Freitas Leiloeiro — lotes públicos por categoria. Rodar numa aba em
// https://www.freitasleiloeiro.com.br/Leiloes/Pesquisar?query=&categoria=N  (N = 1 veículos, 2 imóveis, 3 materiais)
// Acumula entre categorias via sessionStorage('ftR'). A listagem não traz cidade: usa São Paulo/SP (sede) com aviso, salvo imóveis com "CIDADE/UF" no título.
(()=>{window.__R=JSON.parse(sessionStorage.getItem('ftR')||'[]');window.__M={};__R.forEach(r=>__M[r.split('|')[0]]=1);window.__st={cur:0,err:0};
const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();const money=s=>Math.round(+String(s).replace(/[^\d,]/g,'').replace(',','.'))||'';
const cat=+(new URLSearchParams(location.search).get('categoria')||1);
const parse=()=>{for(const c of document.querySelectorAll('.cardlote')){try{const a=c.querySelector('a[href*="LoteDetalhes"]');if(!a)continue;const u=new URL(a.href);const id='ft'+u.searchParams.get('leilaoId')+'-'+u.searchParams.get('loteNumero');if(__M[id])continue;
 const L=c.innerText.split('\n').map(s=>s.trim()).filter(Boolean);const dm=(L.find(s=>/\d\d\/\d\d\/\d{4}/.test(s))||'').match(/(\d\d)\/(\d\d)\/(\d{4})\s*(\d\d:\d\d)?/);
 const ip=L.findIndex(s=>/^R\$/.test(s));const title=L[2]||'';const extra=ip>3?L.slice(3,ip).join(' · '):'';const com=L[ip+2]||'';
 const t=title.toLowerCase();let g;if(cat===2)g='imo';else if(cat===1)g=/^(honda|yamaha|suzuki|dafra|shineray|kawasaki|haojue)\/|moto/i.test(title)?'moto':/caminh|scania|volvo\/fh|iveco|onibus|ônibus|reboque|semi-?reb/i.test(t)?'cam':'car';else g=/trator|escavad|retro|empilhad|m[aá]quina|compressor|gerador/i.test(t)?'maq':/notebook|computador|celular|monitor|impressora/i.test(t)?'tec':/m[oó]veis|mesa|cadeira|arm[aá]rio|geladeira|fog[aã]o/i.test(t)?'casa':'ind';
 const cm=title.match(/([A-ZÀ-Ú][A-ZÀ-Ú .'-]{2,})\s*[\/-]\s*([A-Z]{2})\b/);const city=g==='imo'&&cm?cm[1].trim():'São Paulo',uf=g==='imo'&&cm?cm[2]:'SP';
 const imgs=[...c.querySelectorAll('img')].map(i=>i.getAttribute('src')||i.getAttribute('data-src')||'').filter(s=>/FOTOS/i.test(s));
 __M[id]=1;__R.push([id,'freitas',g,{1:'Veículos',2:'Imóveis',3:'Materiais'}[cat]||'Diversos',S(com).slice(0,40),S(title).slice(0,80),money(L[ip]||''),'','',city,uf,'','',dm?`${dm[3]}-${dm[2]}-${dm[1]} ${dm[4]||'10:00'}`:'','Freitas Leiloeiro',0,'Leilão '+u.searchParams.get('leilaoId'),a.href,imgs[0]||'',g==='imo'&&cm?'':'Local de visitação no edital do leilão'].join('|'));}catch(e){__st.err++;}}};
window.__job=(async()=>{for(let i=0;i<120;i++){__st.cur=i;const b=[...document.querySelectorAll('button,a')].find(x=>/Carregar mais lotes/i.test(x.innerText)&&x.offsetParent!==null);const n0=document.querySelectorAll('.cardlote').length;
  if(!b){window.scrollTo(0,document.body.scrollHeight);await new Promise(r=>setTimeout(r,1500));if(document.querySelectorAll('.cardlote').length===n0)break;continue;}b.click();
  let w=0;while(w<40&&document.querySelectorAll('.cardlote').length===n0){await new Promise(r=>setTimeout(r,400));w++;}if(w>=40)break;}
 parse();sessionStorage.setItem('ftR',JSON.stringify(__R));__st.cur='FIM '+cat;})();return 'iniciado '+cat;})()
