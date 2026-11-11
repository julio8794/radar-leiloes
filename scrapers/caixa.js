// Caixa — listas oficiais por UF. Rodar numa aba aberta em https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp
// Linha: id|UF|cidade|bairro|tipo|modalidade|preco|avaliacao|desconto|area|quartos|financia(1/0)
(()=>{window.__R=[];window.__st={cur:'',done:[],err:[]};const UFS=window.__UFS||'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split(' ');
const num=t=>{t=(t||'').replace(/[^\d,.-]/g,'');if(t.includes(','))t=t.replace(/\./g,'').replace(',','.');return parseFloat(t)||0;};
const MOD=m=>/direta online/i.test(m)?'VDO':/venda online/i.test(m)?'VO':/SFI/i.test(m)?'LSFI':/licita/i.test(m)?'LA':m;
window.__job=(async()=>{for(const u of UFS){__st.cur=u;try{const buf=await (await fetch('/listaweb/Lista_imoveis_'+u+'.csv')).arrayBuffer();let t=new TextDecoder('windows-1252').decode(buf);
 for(const line of t.split(/\r?\n/)){const c=line.split(';').map(x=>x.trim());if(c.length<11||c[1]!==u)continue;const id=c[0].replace(/\D/g,'');if(!id)continue;
  const d=c[9]||'';const area=(d.match(/([\d.,]+)\s*de [aá]rea privativa/i)||[])[1];const qto=(d.match(/(\d+)\s*qto/i)||[])[1];
  __R.push([id,u,c[2],c[3],(d.split(',')[0]||'Imóvel').trim(),MOD(c[10]),Math.round(num(c[5])),Math.round(num(c[6])),Math.round(num(c[7])),area?Math.round(num(area)):'',qto||'',/sim/i.test(c[8])?1:0].map(x=>String(x).replace(/[|\n\r]/g,' ')).join('|'));}
 __st.done.push(u);}catch(e){__st.err.push(u)}await new Promise(r=>setTimeout(r,400));}__st.cur='FIM';})();return 'iniciado';})()
