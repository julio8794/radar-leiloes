// Leilão Imóvel (agregador). Rodar numa aba em https://www.leilaoimovel.com.br/
// Sem login o site mostra só as primeiras ~60 páginas; ritmo lento (1 página a cada 2,5 s) para não ser bloqueado.
// Linha: id|UF|cidade|bairro|tipo|preco|avaliacao|desconto|encerramento|tags|caminho
(()=>{window.__R=[];const M={};window.__st={cur:'',p:0,n429:0,vazias:0};
const parse=(h)=>{const d=new DOMParser().parseFromString(h,'text/html');let k=0;for(const c of d.querySelectorAll('.place-box')){const a=c.querySelector('a[href*="/imovel/"]');if(!a)continue;const href=a.getAttribute('href');const id=href.split('/').pop();if(M[id])continue;M[id]=1;
const t=c.innerText.replace(/\s+/g,' ');const alt=(c.querySelector('img[alt]')||{}).alt||'';const m=alt.match(/\['([^']*)'\] - \['([^']*)'\]\/\['([A-Z]{2})'\]/);const uf=(href.split('/')[2]||'').toUpperCase();
const rs=[...t.matchAll(/R\$ ?([\d\.]+,\d\d)/g)].map(x=>x[1]);const ds=(t.match(/(\d{1,3})% /)||[])[1]||'';const end=(t.match(/(\d\d\/\d\d\/\d{4} \d\d:\d\d)/)||[])[1]||'';
const tt=(t.match(/\d+% (.{3,80}?) em (.{2,40}?) \/ [A-Z]{2} - \d+/)||t.match(/(?:,\d\d )([A-ZÁ-Úa-zá-ú ]{3,60}?) em (.{2,40}?) \/ [A-Z]{2} - \d+/)||[]);
const tags=[...c.querySelectorAll('a[href^="/imoveis/"]')].map(x=>x.innerText.trim()).join('/');
__R.push([id,uf,m?m[2]:(tt[2]||''),m?m[1]:'',tt[1]||'',rs[0]||'',rs[1]||'',ds,end,tags,href].map(x=>String(x).replace(/[|\n\r]/g,' ')).join('|'));k++}return d.querySelectorAll('a[href*="/imovel/"]').length};
window.__job=(async()=>{for(let p=1;p<=70;p++){__st.cur=p;const r=await fetch('/encontre-seu-imovel?venda=3,4,12,5,8&pag='+p);if(r.status===429){__st.n429++;if(__st.n429>6)break;await new Promise(r=>setTimeout(r,20000));p--;continue}
const n=parse(await r.text());__st.p++;if(!n){__st.vazias++;if(__st.vazias>=3)break}else __st.vazias=0;await new Promise(r=>setTimeout(r,2500))}__st.cur='FIM'})();return 'iniciado';})()
