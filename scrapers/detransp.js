// Detran-SP — tabela oficial de editais de leilão. Rodar numa aba em https://www.detran.sp.gov.br/detransp?id=editais_leilao
// Saída (raw/e_detransp.txt): inicio|fim|UF|cidade1;cidade2|orgao|lotes|plataforma|url|lat|lon|obs|valor|tipo
(()=>{window.__R=[];window.__st={cur:0,err:0};const iso=s=>{const m=(s||'').match(/(\d\d)\/(\d\d)\/(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:''};
const hoje=new Date().toISOString().slice(0,10);
for(const r of document.querySelectorAll('table tr')){const c=[...r.cells].map(x=>x.innerText.trim());if(c.length<4)continue;const ini=iso(c[0]),fim=iso(c[1]);if(!fim||fim<hoje)continue;
 const cid=c[2].split(/\s*,\s*|\s+e\s+/).map(s=>s.trim()).filter(Boolean).join(';');
 __R.push([ini||fim,fim,'SP',cid,'Detran-SP','','leiloeiro credenciado (ver edital)',location.href,'','','Edital '+c[3]+(ini?' · pré-lances desde '+c[0]:'')+' · sessão pública '+c[1]+' · cidades: '+c[2].replace(/\|/g,' '),'','det'].join('|'));}
__st.cur='FIM';return __R.length;})()
