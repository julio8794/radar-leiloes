// Sodré Santoro — lotes públicos por seção. Rodar numa aba em https://www.sodresantoro.com.br/<secao>/lotes
// Entre seções: window.__R=JSON.parse(sessionStorage.getItem('ssR')||'[]') antes de rodar, para acumular.
// (secao = veiculos | materiais | imoveis | sucatas). Acumula em window.__R entre seções (rode uma seção por vez).
(()=>{window.__R=window.__R||[];window.__M=window.__M||{};window.__st={cur:0,err:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();
const sec=location.pathname.split('/')[1];
const money=s=>Math.round(+String(s).replace(/[^\d,]/g,'').replace(',','.'))||'';
const grab=()=>{let k=0;for(const a of document.querySelectorAll('a.wrapper[href*="/lote/"]')){try{const m=a.href.match(/leilao\/(\d+)\/lote\/(\d+)/);if(!m)continue;const id='ss'+m[2];if(__M[id])continue;
 const L=a.innerText.split('\n').map(s=>s.trim()).filter(Boolean);const i0=L.findIndex(s=>/^Leil[aã]o \d+/.test(s));if(i0<0)continue;
 const title=L[i0+2]||L[i0+1];const com=L[i0+3]||'';const dt=L.find(s=>/^\d\d\/\d\d\/\d\d \d\d:\d\d/.test(s))||'';const dm=dt.match(/(\d\d)\/(\d\d)\/(\d\d) (\d\d:\d\d)/);
 const il=L.findIndex(s=>/^Lance (atual|inicial)|^Valor/i.test(s));const price=il>=0?money(L[il+1]):'';
 const loc=L.slice().reverse().find(s=>/^.+\s\/\s[A-Z]{2}$/.test(s))||'';const lm=loc.match(/^(.*?)\s*\/\s*([A-Z]{2})$/)||['','Guarulhos','SP'];const semLocal=!loc;
 const tags=L.slice(il+2).filter(s=>s!=='-'&&s!==loc&&!/^Financiar$/i.test(s));const dano=tags.find(s=>/MONTA|SUCATA|SINISTR|PERDA/i.test(s))||'';
 let g='div';if(sec==='imoveis')g='imo';else if(sec==='veiculos'||sec==='sucatas'){g=/moto|honda cg|cb |biz|fan |titan|yamaha|factor|bros|xre|pop 1/i.test(title)?'moto':/caminh|scania|volvo fh|mb axor|atego|iveco|onibus|ônibus|carreta|reboque|semi/i.test(title)?'cam':'car';}else g=/trator|escavad|retro|p[aá] carreg|empilhad|m[aá]quina|torno|compressor|gerador/i.test(title)?'maq':/notebook|computador|celular|monitor|impressora|tv /i.test(title)?'tec':/m[oó]veis|mesa|cadeira|arm[aá]rio|geladeira|fog[aã]o/i.test(title)?'casa':'ind';
 const sub=sec==='sucatas'?'Sucata':sec==='materiais'?(L[il+3]||L[il+2]||''):dano||(tags.find(s=>/SEGURO|FINANC|RECUPERAD|FROTA|JUDICI/i.test(s))||'');
 const im=a.querySelector('img');const img=im?(im.getAttribute('src')||im.getAttribute('data-src')||''):'';
 __M[id]=1;k++;__R.push([id,'sodre',g,{veiculos:'Veículos',materiais:'Materiais e equipamentos',imoveis:'Imóveis',sucatas:'Sucatas'}[sec]||sec,S(sub).slice(0,40),S(title).slice(0,80),price,'','',S(lm[1]),lm[2],'','',dm?`20${dm[3]}-${dm[2]}-${dm[1]} ${dm[4]}`:'','Sodré Santoro · '+S(com).slice(0,40),0,'Leilão '+m[1],a.href,img,semLocal?'Local de retirada no edital (sede Sodré Santoro, Guarulhos/SP)':''].join('|'));}catch(e){__st.err++;}}return k;};
window.__job=(async()=>{await new Promise(r=>setTimeout(r,2000));for(let p=1;p<=80;p++){__st.cur=sec+' '+p;grab();try{sessionStorage.setItem('ssR',JSON.stringify(__R))}catch(e){}
 const first=(document.querySelector('a.wrapper[href*="/lote/"]')||{}).href;const nb=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()===String(p+1));if(!nb)break;nb.click();
 let w=0;while(w<40&&(document.querySelector('a.wrapper[href*="/lote/"]')||{}).href===first){await new Promise(r=>setTimeout(r,400));w++;}if(w>=40)break;await new Promise(r=>setTimeout(r,1200));}
 __st.cur='FIM '+sec;})();return 'iniciado '+sec;})()
