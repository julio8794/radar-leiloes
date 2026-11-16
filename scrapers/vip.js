// VIP Leilões — veículos (página pública /pesquisa, paginação por AJAX). Rodar numa aba em https://www.vipleiloes.com.br/pesquisa
// A VIP informa só a UF do pátio na listagem: o lote fica na capital da UF, com aviso no endereço.
(()=>{window.__R=window.__R||[];window.__M=window.__M||{};window.__st={cur:0,err:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();
const money=s=>Math.round(+String(s).replace(/[^\d,]/g,'').replace(',','.'))||'';
const CAP={AC:'Rio Branco',AL:'Maceió',AM:'Manaus',AP:'Macapá',BA:'Salvador',CE:'Fortaleza',DF:'Brasília',ES:'Vitória',GO:'Goiânia',MA:'São Luís',MG:'Belo Horizonte',MS:'Campo Grande',MT:'Cuiabá',PA:'Belém',PB:'João Pessoa',PE:'Recife',PI:'Teresina',PR:'Curitiba',RJ:'Rio de Janeiro',RN:'Natal',RO:'Porto Velho',RR:'Boa Vista',RS:'Porto Alegre',SC:'Florianópolis',SE:'Aracaju',SP:'São Paulo',TO:'Palmas'};
const grab=()=>{let k=0;for(const b of document.querySelectorAll('a.anc-body')){try{const id='vp'+(b.href.match(/-(\d+)\/?$/)||[,''])[1];if(id==='vp'||__M[id])continue;
 const L=b.innerText.split('\n').map(s=>s.trim()).filter(Boolean);const title=L[0]+' '+(L[1]||'');const iv=L.indexOf('Valor Atual');const ii=L.findIndex(s=>/^Valor inicial/i.test(s));
 const price=iv>=0?money(L[iv+1]):'';const ini=ii>=0?money(L[ii+1]):'';const uf=((L.find(s=>/Local:/.test(s))||'').match(/Local:\s*([A-Z]{2})/)||[])[1];if(!uf||!CAP[uf])continue;
 const di=L.findIndex(s=>/^In[ií]cio:/.test(s));const dm=di>=0?L[di].match(/(\d\d)\/(\d\d)\/(\d{4})/):null;const hm=di>=0&&/^\d\d:\d\d$/.test(L[di+1]||'')?L[di+1]:'10:00';
 const bids=+((L.find(s=>/Lances?$/.test(s))||'0').match(/\d+/)||[0])[0];const km=L.find(s=>/Km$/.test(s))||'';
 const t=title.toLowerCase();const g=/honda cg|cb |biz|pop|bros|titan|fan|xre|nxr|yamaha|factor|fazer|lander|crosser|nmax|suzuki|dafra|shineray|haojue|kawasaki|motos?\b/.test(t)?'moto':/caminh|scania|volvo|mercedes.*(atego|axor|accelo)|iveco|cargo|constellation|delivery|onibus|ônibus|carreta|reboque|semi/i.test(t)?'cam':'car';
 const card=b.closest('.crd-link')||b.parentElement;const img=(card.querySelector('img[src$=".jpg"],img[src$=".jpeg"],img[src$=".webp"]')||card.querySelector('img')||{}).src||'';
 __M[id]=1;k++;__R.push([id,'vip',g,{car:'Carros',moto:'Motos',cam:'Caminhões'}[g],S(km),S(title).slice(0,80),price||ini,'','',CAP[uf],uf,'','',dm?`${dm[3]}-${dm[2]}-${dm[1]} ${hm}`:'','VIP Leilões',bids,'Leilão online',b.href,img,'Pátio em '+uf+' (cidade no anúncio)'].join('|'));}catch(e){__st.err++;}}return k;};
const waitChange=first=>new Promise(res=>{const ok=()=>(document.querySelector('a.anc-body')||{}).href!==first;if(ok())return res(true);const mo=new MutationObserver(()=>{if(ok()){mo.disconnect();res(true);}});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{mo.disconnect();res(ok());},45000);});
// espera por mutação do DOM (não por setTimeout), porque o Chrome limita timers em abas de fundo
window.__job=(async()=>{for(let p=1;p<=(window.__MAXP||300);p++){__st.cur=p;grab();const first=(document.querySelector('a.anc-body')||{}).href;
 const nb=document.querySelector('a.page-link[aria-label="Next"]');if(!nb)break;let ok=false;for(let t=0;t<4&&!ok;t++){const n=document.querySelector('a.page-link[aria-label="Next"]');if(!n)break;n.click();ok=await waitChange(first);}if(!ok)break;}
 grab();__st.cur='FIM';})();return 'iniciado';})()
