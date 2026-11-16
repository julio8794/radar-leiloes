// Copart Brasil — lista pública de lotes (tabela da busca). Rodar numa aba em
// https://www.copart.com.br/lotSearchResults/?free=true&query=   (espera a tabela carregar)
// Saída no formato único de lotes (u_): id|src|g|cat|sub|titulo|preco|aval|desc|cidade|UF|lat|lon|fim|vendedor|lances|modalidade|link|foto|endereco
(()=>{window.__R=[];const M={};window.__st={cur:0,err:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();
const num=t=>{const m=(t||'').match(/R\$\s*([\d.]+,\d\d)/);return m?Math.round(+m[1].replace(/\./g,'').replace(',','.')):''};
const pad=n=>String(n).padStart(2,'0');const today=new Date();const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const grab=()=>{let k=0;for(const r of document.querySelectorAll('table tbody tr')){const c=[...r.cells].map(x=>S(x.innerText));if(c.length<14)continue;const id=(c[2].match(/\d{5,}/)||[])[0];if(!id||M[id])continue;M[id]=1;k++;
 const cat=c[7],dano=c[8];const g=/moto/i.test(cat)?'moto':/caminh|[oô]nibus|pesad|implement|carreta|reboque/i.test(cat)?'cam':/m[aá]quina|trator|agr[ií]c/i.test(cat)?'maq':'car';
 const pm=c[10].match(/^(.*?)\s*-\s*([A-Z]{2})$/);const dm=c[11].match(/(\d\d)[\/.](\d\d)[\/.](\d{4})\s*(\d\d:\d\d)?/);const end=dm?`${dm[3]}-${dm[2]}-${dm[1]} ${dm[4]||'10:00'}`:'';
 const price=num(c[14]),aval=num(c[9]);const desc=price&&aval&&aval>price?Math.round(100-price*100/aval):'';
 const im=r.querySelector('img');const img=im?(im.getAttribute('lazy-src')||im.getAttribute('src')||''):'';const sub=/grande monta/i.test(dano)?'Grande monta (sucata)':dano;
 __R.push(['cp'+id,'copart',g,S(cat),S(sub),S(`${c[4]} ${c[5]} ${c[3]}`).slice(0,80),price,aval,desc,pm?pm[1]:c[10],pm?pm[2]:'','','',end,'Copart',0,S(c[12])?'Leilão Copart · '+S(c[12]):'Leilão Copart (venda direta / data a definir)','https://www.copart.com.br/lot/'+id,img,'Pátio '+c[10]].join('|'));}return k;};
window.__job=(async()=>{const sel=document.querySelector('select[name$="_length"]');if(sel){sel.value='100';sel.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,5000));}
 for(let p=1;p<=(window.__MAXP||400);p++){__st.cur=p;let n=0;for(let w=0;w<12&&!n;w++){n=grab();if(!n)await new Promise(r=>setTimeout(r,800));}
  const nx=[...document.querySelectorAll('.paginate_button.next, a.next, li.next a, [aria-label="Next"]')].find(e=>!/disabled/.test(e.className+(e.parentElement||{}).className));if(!nx||!n&&p>1)break;nx.click();await new Promise(r=>setTimeout(r,2500));}
 __st.cur='FIM';})();return 'iniciado';})()
