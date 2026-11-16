// PNCP — leilões públicos (modalidades 1 = leilão eletrônico, 13 = leilão presencial) com propostas abertas.
// Rodar numa aba em https://pncp.gov.br/app/editais  (API pública documentada: /api/consulta)
// Linha (evento): inicio|fim|UF|cidade|orgao|lotes|sistema|url|lat|lon|obs|valorEstimado|esfera
(()=>{window.__R=[];window.__st={cur:'',err:0,skip:0};const S=x=>String(x??'').replace(/[|\n\r]/g,' ').replace(/\s+/g,' ').trim();
const OK=/alien|venda|ve[ií]culo|sucata|inserv|bens m[oó]veis|bens? |im[oó]ve(l|is)|semovente|materia|equipamento|m[aá]quina|lote|sucatas|apreendid/i;
const NO=/permiss[aã]o|concess[aã]o|loca[cç][aã]o|cess[aã]o de uso|arrendamento|direito real de uso|explora[cç][aã]o comercial|espa[cç]o f[ií]sico|quiosque|box(es)? /i;
const d=new Date();d.setDate(d.getDate()+120);const fim=d.toISOString().slice(0,10).replace(/-/g,'');
window.__job=(async()=>{for(const m of [1,13]){for(let p=1;p<=60;p++){__st.cur=m+' '+p;let j;try{const r=await fetch('/api/consulta/v1/contratacoes/proposta?dataFinal='+fim+'&codigoModalidadeContratacao='+m+'&pagina='+p+'&tamanhoPagina=50');if(r.status===204)break;j=await r.json()}catch(e){__st.err++;break}
 for(const c of (j.data||[])){const ob=S(c.objetoCompra);if(NO.test(ob)||!OK.test(ob)){__st.skip++;continue}const u=c.unidadeOrgao||{},o=c.orgaoEntidade||{};
  const url=c.linkSistemaOrigem||('https://pncp.gov.br/app/editais/'+o.cnpj+'/'+c.anoCompra+'/'+c.sequencialCompra);
  __R.push([S(c.dataAberturaProposta).slice(0,10),S(c.dataEncerramentoProposta).slice(0,10),S(u.ufSigla),S(u.municipioNome),S(o.razaoSocial).slice(0,70),'',S(c.usuarioNome).slice(0,40),S(url),'','',ob.slice(0,220),c.valorTotalEstimado||'',S(o.esferaId)].join('|'));}
 if(p>=(j.totalPaginas||1))break;await new Promise(r=>setTimeout(r,300));}}__st.cur='FIM';})();return 'iniciado';})()
