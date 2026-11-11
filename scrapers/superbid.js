// Superbid Exchange — catálogo público por categoria. Rodar numa aba em https://www.superbid.net/todas-categorias
// Resultado: window.__R (linhas) ; status: window.__st.cur === 'FIM' quando terminar.
// Linha: id|titulo|categoria|subcategoria|preco|cidade - UF|lat|lon|fim(AAAA-MM-DD HH:MM)|loja|lances|modalidade|leiloeiro|slugCategoria
(()=>{const CATS=window.__CATS||['imoveis','carros-motos','caminhoes-onibus','maquinas-pesadas-agricolas','industrial-maquinas-equipamentos','tecnologia','partes-e-pecas','movimentacao-transporte','eletrodomesticos','moveis-e-decoracao','cozinhas-e-restaurantes','sucatas-materiais-residuos','embarcacoes-aeronaves','materiais-para-construcao-civil','alimentos-e-bebidas','animais','artes-decoracao-colecionismo','bolsas-canetas-joias-e-relogios'];
const MAXP=window.__MAXP||50;const S=x=>String(x??'').replace(/[|\n\r]/g,' ').trim();
window.__R=[];window.__seen=new Set();window.__st={cur:'',done:[],err:0};
window.__job=(async()=>{for(const c of CATS){for(let p=1;p<=MAXP;p++){__st.cur=c+' '+p;let of=[];
 try{const h=await (await fetch('/categorias/'+c+'?pageNumber='+p+'&pageSize=120')).text();const j=JSON.parse(new DOMParser().parseFromString(h,'text/html').getElementById('__NEXT_DATA__').textContent);of=(j.props.pageProps.offersList||{}).offers||[];}catch(e){__st.err++;break;}
 for(const o of of){if(__seen.has(o.id))continue;__seen.add(o.id);const pr=o.product||{},loc=pr.location||{},g=loc.locationGeo||{},sc=pr.subCategory||{},a=o.auction||{};
  __R.push([o.id,S(pr.shortDesc).slice(0,80),S((sc.category||{}).description),S(sc.description),o.price||(o.offerDetail||{}).currentMinBid||'',S(loc.city),g.lat!=null?(+g.lat).toFixed(3):'',g.lon!=null?(+g.lon).toFixed(3):'',S(o.endDate).slice(0,16),S((o.store||{}).name).slice(0,30),o.totalBids||0,S(a.modalityDesc),S(a.auctioneer).slice(0,40),c].join('|'));}
 if(of.length<120)break;await new Promise(r=>setTimeout(r,200));}
 __st.done.push(c);}__st.cur='FIM';})();return 'iniciado';})()
