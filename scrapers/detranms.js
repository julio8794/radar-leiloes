// Detran-MS — página oficial de editais. Rodar numa aba em https://www.detran.ms.gov.br/informativo/editais-leiloes-e-licitacoes/
// Saída (raw/e_detranms.txt): inicio|fim|UF|cidades|orgao|lotes|plataforma|url|lat|lon|obs|valor|tipo
(()=>{window.__R=[];window.__st={cur:0};const iso=s=>{const m=(s||'').match(/(\d\d)\/(\d\d)\/(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:''};const hoje=new Date().toISOString().slice(0,10);
const CID=['Campo Grande','Dourados','Três Lagoas','Corumbá','Ponta Porã','Aquidauana','Naviraí','Nova Andradina','Paranaíba','Coxim','São Gabriel do Oeste','Sidrolândia','Bonito','Amambai','Rio Brilhante','Maracaju','Chapadão do Sul','Miranda','Cassilândia'];
for(const h of document.querySelectorAll('h1,h2,h3,h4')){const ht=h.innerText;if(!/EDITAL DE LEIL/i.test(ht))continue;let s='';let e=h.nextElementSibling;for(let k=0;k<14&&e&&!/^H[1-4]$/.test(e.tagName);k++,e=e.nextElementSibling)s+=e.innerText+'\n';
 const fim=iso((s.match(/encerramento:?\s*([\d\/]+)/i)||[])[1]||ht);if(!fim||fim<hoje)continue;const ini=iso((s.match(/Abertura:?\s*([\d\/]+)/i)||[])[1])||fim;
 const tipo=(ht.match(/–\s*([^–]+?)\s*–/)||[,''])[1].trim();const lotes=(s.match(/(\d+)\s+lotes/i)||[,''])[1];const site=(s.match(/(www\.[a-z0-9.-]+)/i)||[,''])[1];
 const vis=(s.match(/visita[çc][aã]o[^:]*:([^\n]+)/i)||[,''])[1];const cids=CID.filter(c=>vis.toLowerCase().includes(c.toLowerCase()));
 const det=(s.match(/Tipos de ve[ií]culos ofertados:\s*([^\n]+)/i)||[,''])[1].trim();const pub=(s.match(/P[uú]blico Alvo:\s*([^\n]+)/i)||[,''])[1].trim();
 const url=site?'https://'+site:location.href;
 __R.push([ini,fim,'MS',(cids.length?cids:['Campo Grande']).join(';'),'Detran-MS',lotes,site||'leiloeiro oficial',url,'','',[tipo,det,pub?'Quem pode: '+pub:''].filter(Boolean).join(' · ').replace(/\|/g,' '),'','det'].join('|'));}
__st.cur='FIM';return __R.length;})()
