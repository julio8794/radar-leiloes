// Mega Leilões. Rodar numa aba em https://www.megaleiloes.com.br/
// Linha: id|secao|categoria|UF|"Cidade, UF"|titulo|preco_ultimo|preco_primeiro|data(DD/MM/AAAA HH:MM)|tipo|caminho
(()=>{window.__R=[];const M={};window.__st={cur:'',done:[],err:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').trim();
window.__job=(async()=>{for(const s of ['veiculos','imoveis','bens-de-consumo','industrial','animais','outros']){for(let p=1;p<=200;p++){__st.cur=s+' '+p;let h='';try{h=await (await fetch('/'+s+'?pagina='+p)).text()}catch(e){__st.err++;break}
const d=new DOMParser().parseFromString(h,'text/html');const cs=[...d.querySelectorAll('.card')].filter(c=>c.querySelector('a[href*="megaleiloes.com.br/'+s+'/"]'));let nw=0;
for(const c of cs){const a=c.querySelector('a[href*="megaleiloes.com.br/'+s+'/"]');const href=a.getAttribute('href').split('?')[0].replace('https://www.megaleiloes.com.br','');const id=href.split('-').pop().toUpperCase();if(M[id])continue;nw++;
const t=c.innerText.replace(/\s+/g,' ');const parts=href.split('/');const tit=S((c.querySelector('.card-title')||{}).innerText);
const pr=[...t.matchAll(/R\$ ?([\d\.]+,\d\d)/g)].map(x=>x[1]);const dts=[...t.matchAll(/(\d\d\/\d\d\/\d{4}) às (\d\d:\d\d)/g)].map(x=>x[1]+' '+x[2]);
const loc=S((c.querySelector('.card-locality')||{}).innerText);const tipo=/Extrajudicial/.test(t)?'Extrajudicial':(/Judicial/.test(t)?'Judicial':(/Venda/.test(t)?'Venda':''));
M[id]=1;__R.push([id,s,parts[2]||'',(parts[3]||'').toUpperCase(),loc,tit.slice(0,90),pr[pr.length-1]||'',pr[0]||'',dts[dts.length-1]||'',tipo,href].join('|'));}
if(!cs.length||!nw)break;await new Promise(r=>setTimeout(r,300))}__st.done.push(s)}__st.cur='FIM'})();return 'iniciado';})()
