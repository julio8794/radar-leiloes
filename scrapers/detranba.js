// Detran-BA via Nordeste Leilões (todos os lotes do comitente DETRAN-BA).
// Rodar numa aba aberta em https://www.nordesteleiloes.com.br/comitentes/33e04b87-556f-4b2d-bcba-0310641430ea
// Linha: lid|titulo|C/S/SM|endereco|preco|data(AAAA-MM-DD)|slug|foto
(()=>{window.__R=[];const M={};window.__st={cur:'',err:0};
const MES={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
const grab=()=>{let k=0;for(const a of document.querySelectorAll('a[title^="Ver detalhes"]')){const slug=(a.getAttribute('href')||'').replace('/lotes/','');if(!slug||M[slug])continue;
 let card=a;while(card.parentElement&&!/R\$/.test(card.innerText))card=card.parentElement;const t=card.innerText.replace(/\s+/g,' ');
 const title=a.getAttribute('title').replace(/^Ver detalhes do lote\s*/,'').replace(/^(VE[IÍ]CULO CONSERVADO|SUCATA[A-ZÁÍÚÇÃÕÊÉ ]*?)\s+(?=[A-Z0-9I]+\/|[A-Z]{3,})/,'').trim();
 const cat=/motor inserv/i.test(t)?'SM':/sucata/i.test(t)?'S':'C';const h2=card.querySelector('h2');const addr=h2?h2.textContent.trim():'';
 const pr=(t.match(/R\$ ?([\d\.]+,\d\d)/)||[])[1]||'';const EN={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};let date='';
 let dm=t.match(/(\d{1,2}) de ([a-zç]{3})\.? de (\d{4})/i);if(dm&&MES[dm[2].toLowerCase()])date=`${dm[3]}-${String(MES[dm[2].toLowerCase()]).padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
 if(!date){dm=t.match(/\b([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}),? (\d{4})/);if(dm&&EN[dm[1].toLowerCase()])date=`${dm[3]}-${String(EN[dm[1].toLowerCase()]).padStart(2,'0')}-${dm[2].padStart(2,'0')}`;}
 if(!date){dm=t.match(/(\d{1,2}) ([A-Za-z]{3})[a-z]*\.? (\d{4})/);const k=dm&&dm[2].toLowerCase();if(dm&&(EN[k]||MES[k]))date=`${dm[3]}-${String(EN[k]||MES[k]).padStart(2,'0')}-${dm[1].padStart(2,'0')}`;}
 const im0=card.querySelector('img');const ims=im0?decodeURIComponent((im0.getAttribute('src')||'').replace(/^.*url=/,'').split('&')[0]):'';const foto=(ims.match(/lotes\/fotos\/([\w.-]+)/)||[])[1]||'';
 M[slug]=1;__R.push([slug.split('-').slice(0,2).join('-'),title,cat,addr,pr.replace(/\./g,'').replace(',00','').replace(',','.'),date,slug,foto].map(x=>String(x).replace(/[|\n\r]/g,' ')).join('|'));k++;}return k;};
window.__job=(async()=>{let vazias=0;for(let p=1;p<=(window.__MAXP||150);p++){__st.cur=p;if(p>1){history.pushState({},'',location.pathname+'?page='+p);dispatchEvent(new PopStateEvent('popstate'));}
 let n=0;for(let w=0;w<10&&!n;w++){await new Promise(r=>setTimeout(r,900));n=grab();}
 if(!n){vazias++;if(vazias>=2)break}else vazias=0;}__st.cur='FIM';})();return 'iniciado';})()
