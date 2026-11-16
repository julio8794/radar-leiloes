// Portal Zuk — imóveis em leilão (página pública com botão "Carregar mais").
// Rodar numa aba em https://www.portalzuk.com.br/leilao-de-imoveis
// Saída no formato único de lotes (u_zuk.txt)
(()=>{window.__R=[];window.__st={cur:0,err:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();
const money=s=>Math.round(+s.replace(/[^\d,]/g,'').replace(',','.'))||'';
const parse=()=>{const now=Date.now();for(const c of document.querySelectorAll('.card-property.card_lotes_div')){try{
 const a=c.querySelector('a[href*="/imovel/"]');if(!a)continue;const href=a.href;const id='zk'+(href.match(/(\d+-\d+)\/?$/)||[,''])[1];if(id==='zk')continue;
 const L0=c.innerText.split('\n').map(s=>s.trim()).filter(Boolean);const il=L0.findIndex(s=>/^.+\s\/\s[A-Z]{2}\s*-/.test(s));if(il<1)continue;const tags=L0.slice(0,il-1);const tipo=L0[il-1];const lm=L0[il].match(/^(.*?)\s*\/\s*([A-Z]{2})\s*-\s*(.*)$/);const L=L0.slice(il-1);
 const rounds=[];let cur=null,pct='';for(const s of L.slice(2)){if(/^R\$/.test(s)){cur={v:money(s),d:null};rounds.push(cur);}else if(cur&&/^\d{1,2}$/.test(s)){pct=+s;}else{const m=s.match(/(\d\d)\/(\d\d)\/(\d{4}) às (\d\d:\d\d)/);if(m&&cur)cur.d=`${m[3]}-${m[2]}-${m[1]} ${m[4]}`;}}
 const open=rounds.find(r=>r.d&&new Date(r.d.replace(' ','T')+':00-03:00')>=now)||rounds[rounds.length-1];if(!open)continue;
 let aval='';if(rounds.length>1&&rounds[0].v>open.v)aval=rounds[0].v;else if(pct&&open.v)aval=Math.round(open.v/(1-pct/100));const desc=aval&&open.v?Math.round(100-open.v*100/aval):'';
 const im=c.querySelector('img');let img=im?(im.getAttribute('data-src')||im.getAttribute('src')||''):'';if(/NaoDisp/i.test(img))img='';
 const area=(L.find(s=>/m²|ha /.test(s))||'');const rua=L[2]&&!/m²|ha |leil|lance/i.test(L[2])?L[2]:'';
 const mod=(tags.length?tags.join(' ')+' · ':'')+(rounds.length>1?(rounds.indexOf(open)+1)+'º leilão':/venda/i.test(c.innerText)?'Venda direta':'Leilão');
 window.__M=window.__M||{};if(__M[id])continue;__M[id]=1;
 __R.push([id,'zuk','imo','Imóveis',S(mod),S(tipo+(lm[3]?' · '+lm[3]:'')+(area?' · '+area.split(' ')[0]:'')).slice(0,80),open.v,aval,desc,S(lm[1]),lm[2],'','',open.d||'','Portal Zuk',0,S(mod),href,img,S(rua+(rua?', ':'')+lm[3])].join('|'));}catch(e){__st.err++;}}};
window.__job=(async()=>{for(let i=0;i<(window.__MAXC??80);i++){__st.cur=i;const b=document.getElementById('btn_carregarMais');const n0=document.querySelectorAll('.card-property.card_lotes_div').length;if(!b||b.offsetParent===null)break;b.click();
  let k=0;while(k<20&&document.querySelectorAll('.card-property.card_lotes_div').length===n0){await new Promise(r=>setTimeout(r,500));k++;}if(k>=20)break;await new Promise(r=>setTimeout(r,700));}
 parse();__st.cur='FIM';})();return 'iniciado';})()
