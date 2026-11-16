// ================= Garagem (área privada, só no artefato do Claude) =================
// Dados compartilhados entre as pessoas com acesso ao artefato: coleção "garagem" (1 doc por bem)
// e "config/padrao" (margem, comissão). Fotos da vistoria vão para "assets"; análise por IA via "sample".
const GAR={on:false,db:null,user:null,assets:null,sample:null,lim:null,me:null,items:new Map(),cfg:{margem:20,com:5},filtro:'ativos',editing:null,names:{}};
const GST=[['interesse','Interesse','#5B6675'],['vistoria','Em vistoria','#2F6FDE'],['lance','Lance dado','#B8860B'],['arrematado','Arrematado','#0B8A63'],['preparo','Preparando','#7A4FB5'],['avenda','À venda','#D97706'],['vendido','Vendido','#14284B'],['descartado','Descartado','#9AA3AE']];
const GSTM=Object.fromEntries(GST.map(s=>[s[0],s]));
const ATIVOS=['interesse','vistoria','lance'],POSSE=['arrematado','preparo','avenda'];
const CHK=[['lataria','Lataria e estrutura'],['pintura','Pintura'],['vidros','Vidros, faróis e lanternas'],['pneus','Pneus e rodas'],['interior','Interior e bancos'],['motor','Motor e câmbio (aparente)'],['eletrica','Painel e elétrica'],['docs','Documentação, chassi e motor'],['sinistro','Sinistro / monta / laudo']];
const CHKI=[['ok','OK'],['atencao','Atenção'],['ruim','Ruim']];
const num=v=>{const n=+String(v??'').replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');return isFinite(n)?n:0;};
const gid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

function presetCustos(g,suc){if(g==='imo')return[{k:'itbi',l:'ITBI (~3% do lance)',pct:3},{k:'registro',l:'Escritura e registro (~1,5%)',pct:1.5},{k:'debitos',l:'IPTU / condomínio atrasados',v:0},{k:'desocupacao',l:'Desocupação / advogado',v:0},{k:'reforma',l:'Reforma (além da vistoria)',v:0}];
 return[{k:'patio',l:'Pátio / remoção (ver edital)',v:0},{k:'doc',l:suc?'Baixa e documentação':'Transferência, vistoria e taxas',v:suc?300:900},{k:'debitos',l:'IPVA / multas não baixados',v:0},{k:'transp',l:'Transporte / guincho / viagem',v:300},{k:'outros',l:'Outros (limpeza, chave, etc.)',v:150}];}

function novoItem(l){const suc=l&&isSuc(l);return{id:l?l.id:'m'+gid(),lotId:l?l.id:'',src:l?l.src:'manual',g:l?l.g:'car',title:l?l.title:'Novo veículo',link:l?l.link:'',img:l?l.img:'',city:l?l.city:'',uf:l?l.uf:'',
 end:l&&l.end?+l.end:null,ano:l?l.ano||null:null,sub:l?l.sub||'':'',status:'interesse',criado:Date.now(),upd:Date.now(),por:GAR.me||'',
 lance:l&&l.price?l.price:0,aval:l&&l.aval?l.aval:0,fipe:0,venda:0,margem:GAR.cfg.margem,com:GAR.cfg.com,custos:presetCustos(l?l.g:'car',suc),reparos:[],
 vistoria:{check:{},notas:'',ia:null},fotos:[],arremate:0,reais:[],vendido:{valor:0,data:''},notas:''};}

// ---------- cálculo ----------
function gCalc(it){const L=num(it.lance),com=num(it.com)/100;const venda=num(it.venda)||(num(it.fipe)?Math.round(num(it.fipe)*(it.g==='imo'?1:0.9)):0)||(it.g==='imo'?num(it.aval):0);
 const pctBase=(it.custos||[]).filter(c=>c.pct).reduce((s,c)=>s+num(c.pct)/100,0);const fixos=(it.custos||[]).filter(c=>!c.pct).reduce((s,c)=>s+num(c.v),0);
 const rep=(it.reparos||[]).filter(r=>!r.off).reduce((s,r)=>s+(num(r.min)+num(r.max))/2,0);const repMax=(it.reparos||[]).filter(r=>!r.off).reduce((s,r)=>s+num(r.max),0);
 const custoTotal=L*(1+com+pctBase)+fixos+rep;const lucro=venda?venda-custoTotal:null;
 const alvo=venda*num(it.margem)/100;const lanceMax=venda?Math.max(0,Math.floor((venda-alvo-fixos-rep)/(1+com+pctBase)/50)*50):null;
 const lanceMaxPess=venda?Math.max(0,Math.floor((venda-alvo-fixos-repMax)/(1+com+pctBase)/50)*50):null;
 const A=num(it.arremate);const reais=(it.reais||[]).reduce((s,r)=>s+num(r.valor),0);const custoReal=A?A*(1+com+pctBase)+reais:0;const vv=num(it.vendido&&it.vendido.valor);
 return{venda,vendaAuto:!num(it.venda)&&venda>0,fixos,rep,repMax,custoTotal,lucro,margemAtual:venda&&lucro!=null?lucro*100/venda:null,lanceMax,lanceMaxPess,custoReal,lucroReal:vv&&A?vv-custoReal:null,pctBase};}
function semaforo(it,c){if(!c.venda||c.lanceMax==null||!num(it.lance))return['gray','Informe valor de venda/FIPE'];const L=num(it.lance);
 return L<=c.lanceMax?['ok','Dentro do limite']:L<=c.lanceMax*1.1?['warn','No limite: só com reparos baixos']:['bad','Acima do limite'];}

// ---------- persistência ----------
const _saveT={},_saving={},_dirty={};
function gSave(it,now){_dirty[it.id]=Date.now()+Math.random();it.upd=Date.now();GAR.items.set(it.id,it);clearTimeout(_saveT[it.id]);_saveT[it.id]=setTimeout(()=>gWrite(it.id),now?0:900);}
async function gWrite(id){if(_saving[id]){_saveT[id]=setTimeout(()=>gWrite(id),400);return;}const it=GAR.items.get(id);if(!it)return;const stamp=_dirty[id];_saving[id]=true;
 try{await GAR.db.collection('garagem').doc(id).set(JSON.parse(JSON.stringify(it)));}catch(e){toast(e&&e.code==='quota_exceeded'?'Espaço da garagem cheio: apague itens antigos.':e&&e.code==='invalid_argument'?'Sem permissão para salvar (peça acesso de colaborador).':'Não salvou agora; tente de novo.');}
 finally{_saving[id]=false;if(_dirty[id]===stamp)delete _dirty[id];}}
async function gDelete(id){GAR.items.delete(id);try{await GAR.db.collection('garagem').doc(id).delete();}catch(e){toast('Não consegui apagar agora.');}}
function gAddLot(l){if(GAR.items.has(l.id)){gOpen(l.id);return;}const it=novoItem(l);gSave(it,true);toast('Adicionado à Garagem');refreshGarBtn(l);}

// ---------- tela da garagem ----------
function gList(){const f=GAR.filtro;return[...GAR.items.values()].filter(it=>f==='todos'||(f==='ativos'?ATIVOS.includes(it.status):f==='posse'?POSSE.includes(it.status):it.status===f)).sort((a,b)=>(b.upd||0)-(a.upd||0));}
function renderGaragem(){const box=$('garBox');if(!box)return;const all=[...GAR.items.values()];
 const cnt=k=>all.filter(it=>it.status===k).length;const inv=all.filter(it=>POSSE.includes(it.status)).reduce((s,it)=>s+gCalc(it).custoReal,0);
 const realizado=all.filter(it=>it.status==='vendido').reduce((s,it)=>s+(gCalc(it).lucroReal||0),0);
 const potencial=all.filter(it=>ATIVOS.includes(it.status)).map(gCalc).filter(c=>c.lucro!=null&&c.lucro>0).reduce((s,c)=>s+c.lucro,0);
 const chips=[['ativos','Em análise',all.filter(it=>ATIVOS.includes(it.status)).length],['posse','Comprados',all.filter(it=>POSSE.includes(it.status)).length],...GST.map(s=>[s[0],s[1],cnt(s[0])]),['todos','Todos',all.length]];
 const L=gList();
 box.innerHTML=`<div class="gk"><div><span>Em análise</span><b>${all.filter(it=>ATIVOS.includes(it.status)).length}</b><small>lucro potencial ${brlK(potencial)}</small></div>
  <div><span>Capital investido</span><b>${brlK(inv)}</b><small>${all.filter(it=>POSSE.includes(it.status)).length} bens comprados</small></div>
  <div><span>Lucro realizado</span><b class="${realizado<0?'neg':''}">${brlK(realizado)}</b><small>${cnt('vendido')} vendidos</small></div></div>
 <div class="gchips">${chips.filter(c=>c[2]||['ativos','posse','todos'].includes(c[0])).map(c=>`<button data-gf="${c[0]}" class="${GAR.filtro===c[0]?'on':''}">${c[1]} <i>${c[2]}</i></button>`).join('')}</div>
 <div class="gact"><button id="gNew" class="btn g">＋ Adicionar à mão</button>${favs.size?`<button id="gImp" class="btn g">Trazer ${favs.size} favorito${favs.size>1?'s':''} deste aparelho</button>`:''}<button id="gCsv" class="btn g">Exportar planilha</button></div>
 <div id="gList">${L.length?L.map(gCard).join(''):`<div class="empty">${all.length?'Nada neste filtro.':'Sua garagem está vazia. Abra um lote no Radar e toque em <b>🚗 Garagem</b>, ou adicione um veículo à mão.'}</div>`}</div>`;
 resolveNames(L.map(it=>it.por).filter(Boolean));}
function gCard(it){const c=gCalc(it);const s=GSTM[it.status]||GST[0];const [sc,st_]=semaforo(it,c);const g=G[it.g]||G.car;
 const line=POSSE.includes(it.status)||it.status==='vendido'?(c.lucroReal!=null?`Lucro real <b class="${c.lucroReal<0?'neg':'pos'}">${brl(Math.round(c.lucroReal))}</b>`:`Investido ${brl(Math.round(c.custoReal))}`)
  :`Lance ${num(it.lance)?brl(num(it.lance)):'—'} · máx <b class="${sc}">${c.lanceMax!=null?brl(c.lanceMax):'?'}</b>`;
 return `<div class="gcard" data-gid="${esc(it.id)}"><div class="gi" style="background:${g.c}">${g.ic}${it.fotos&&it.fotos[0]?`<img data-f src="/_blob/${esc(it.fotos[0])}" alt="">`:''}</div>
  <div class="gb"><div class="gt">${esc(it.title)}</div><div class="gm">${[it.ano,it.city&&it.city+(it.uf?'/'+it.uf:''),it.end?'até '+new Date(it.end).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):''].filter(Boolean).join(' · ')}</div><div class="gl">${line}</div></div>
  <span class="gs" style="background:${s[2]}">${s[1]}</span></div>`;}
async function resolveNames(ids){if(!GAR.user||!ids.length)return;try{const u=[...new Set(ids)].filter(i=>!(i in GAR.names));if(!u.length)return;const ps=await GAR.user.profiles(u);u.forEach(i=>{GAR.names[i]=(ps&&ps[i]&&ps[i].name)||'';});}catch(e){}}
function gExportCsv(){const H=['Status','Bem','Cidade','UF','Ano','Lance atual','Lance máximo','Venda prevista','Reparos (média)','Custo total previsto','Lucro previsto','Arremate','Custos reais','Venda real','Lucro real','Link'];
 const rows=[...GAR.items.values()].map(it=>{const c=gCalc(it);return[GSTM[it.status][1],it.title,it.city,it.uf,it.ano||'',num(it.lance),c.lanceMax||'',c.venda||'',Math.round(c.rep),Math.round(c.custoTotal),c.lucro!=null?Math.round(c.lucro):'',num(it.arremate)||'',(it.reais||[]).reduce((s,r)=>s+num(r.valor),0)||'',num(it.vendido&&it.vendido.valor)||'',c.lucroReal!=null?Math.round(c.lucroReal):'',it.link];});
 const csv='﻿'+[H,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');
 window.claude.use('downloads').then(d=>d?d.save({filename:'garagem-radar.csv',data:csv}).then(()=>toast('Planilha salva')).catch(()=>{}):toast('Download indisponível aqui'));}

// ---------- editor ----------
function gOpen(id){const it=GAR.items.get(id);if(!it)return;GAR.editing=id;const c=gCalc(it);const veh=it.g!=='imo';
 const stSel=`<select data-f="status">${GST.map(s=>`<option value="${s[0]}" ${it.status===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select>`;
 const field=(k,label,v,ph,type)=>`<label class="gf"><span>${label}</span><input data-f="${k}" inputmode="decimal" value="${v?esc(String(v)):''}" placeholder="${ph||''}" ${type?`type="${type}"`:''}></label>`;
 $('sheetBox').innerHTML=`<button class="close" id="sx" aria-label="Fechar">✕</button><span class="tag gray">Garagem</span> <span class="tag" style="background:${GSTM[it.status][2]};color:#fff">${GSTM[it.status][1]}</span>
 <h2 contenteditable="true" id="gTitle" spellcheck="false">${esc(it.title)}</h2><p class="mut">${[it.ano,it.city&&it.city+'/'+it.uf,it.sub].filter(Boolean).map(esc).join(' · ')}${it.por&&GAR.names[it.por]?' · adicionado por '+esc(GAR.names[it.por]):''}</p>
 <div id="gSum"></div>
 <div class="gsec"><div class="g2">${`<label class="gf"><span>Situação</span>${stSel}</label>`}${field('lance','Lance atual (R$)',num(it.lance))}${field(veh?'fipe':'aval',veh?'Valor FIPE (R$)':'Avaliação (R$)',num(veh?it.fipe:it.aval),veh?'consulte na ficha do lote':'')}${field('venda','Venda prevista (R$)',num(it.venda),c.vendaAuto?'auto: '+brl(c.venda):'quanto você vende')}${field('margem','Margem mínima (%)',num(it.margem))}${field('com','Comissão leiloeiro (%)',num(it.com))}</div>
  ${it.link?`<a class="btn" href="${esc(it.link)}" target="_blank" rel="noopener">Abrir anúncio oficial</a>`:field('link','Link do anúncio',it.link,'https://','url')}</div>
 ${veh?`<details class="gsec" ${it.status==='vistoria'||!it.vistoria.ia?'open':''}><summary>🔍 Vistoria</summary>
  <div class="chk">${CHK.map(([k,l])=>`<div class="ck"><span>${l}</span><div class="ckb">${CHKI.map(([v,t])=>`<button data-ck="${k}" data-v="${v}" class="${(it.vistoria.check||{})[k]===v?'on '+v:''}">${t}</button>`).join('')}</div></div>`).join('')}</div>
  <label class="gf"><span>Anotações da vistoria (km, barulhos, o que viu no pátio)</span><textarea data-f="vistoria.notas" rows="3">${esc(it.vistoria.notas||'')}</textarea></label>
  <div class="gfotos" id="gFotos">${(it.fotos||[]).map(f=>`<div class="gph"><img src="/_blob/${esc(f)}" alt=""><button data-rmf="${esc(f)}" aria-label="Remover foto">✕</button></div>`).join('')}</div>
  <div class="gact">${GAR.assets?`<label class="btn g gup">📷 Adicionar fotos<input type="file" id="gFile" accept="image/*" multiple hidden></label>`:''}${GAR.sample?`<button class="btn" id="gIA">✨ Analisar com IA</button>`:''}</div>
  <div id="gIAout">${it.vistoria.ia?iaHtml(it.vistoria.ia):'<p class="mut">A IA olha as fotos e os dados do anúncio, aponta problemas visíveis e estima o custo de cada reparo. Use prints do anúncio e fotos da visita ao pátio.</p>'}</div></details>`:''}
 <details class="gsec" open><summary>🛠 Reparos previstos <b id="gRepT">${brl(Math.round(c.rep))}</b></summary><div id="gRep">${repHtml(it)}</div><button class="btn g" id="gRepAdd">＋ Reparo</button></details>
 <details class="gsec"><summary>💸 Custos de compra <b>${brl(Math.round(c.fixos+num(it.lance)*c.pctBase))}</b></summary><div id="gCus">${(it.custos||[]).map((x,i)=>`<label class="gf row"><span>${esc(x.l)}</span><input data-cu="${i}" inputmode="decimal" value="${x.pct!=null?x.pct:num(x.v)}"><em>${x.pct!=null?'%':'R$'}</em></label>`).join('')}</div></details>
 <details class="gsec" ${POSSE.includes(it.status)||it.status==='vendido'?'open':''}><summary>📒 Depois do arremate</summary>
  <div class="g2">${field('arremate','Valor arrematado (R$)',num(it.arremate))}${field('vendido.valor','Vendido por (R$)',num(it.vendido&&it.vendido.valor))}<label class="gf"><span>Data da venda</span><input data-f="vendido.data" type="date" value="${esc((it.vendido&&it.vendido.data)||'')}"></label></div>
  <div class="mut" style="margin:6px 0">Gastos reais (peças, mão de obra, documentos...)</div><div id="gReais">${reaisHtml(it)}</div><button class="btn g" id="gReaisAdd">＋ Lançar gasto</button></details>
 <label class="gf"><span>Notas</span><textarea data-f="notas" rows="3" placeholder="Estratégia, contatos, prazos...">${esc(it.notas||'')}</textarea></label>
 <div class="gact"><button class="btn g" id="gDel">Apagar da garagem</button>${it.lotId&&BYID.get(it.lotId)?'<button class="btn g" id="gLot">Ver no Radar</button>':''}</div>
 <p class="note">Os valores são estimativas para decidir o lance. Confira débitos, laudo e regras no edital. Salvo automaticamente e visível para quem tem acesso a este app.</p>`;
 $('sheet').classList.add('on');$('sx').onclick=closeSheet;gSum(it);}
function gSum(it){const c=gCalc(it);const [sc,txt]=semaforo(it,c);const el=$('gSum');if(!el)return;
 el.innerHTML=`<div class="gsum ${sc}"><div class="gsm"><span>Lance máximo</span><b>${c.lanceMax!=null?brl(c.lanceMax):'—'}</b><small>${c.lanceMaxPess!=null&&c.repMax>c.rep?'pessimista '+brl(c.lanceMaxPess):txt}</small></div>
  <div class="gsm"><span>Lucro no lance atual</span><b class="${c.lucro!=null&&c.lucro<0?'neg':''}">${c.lucro!=null?brl(Math.round(c.lucro)):'—'}</b><small>${c.margemAtual!=null?Math.round(c.margemAtual)+'% da venda':'informe a venda'}</small></div>
  <div class="gsm"><span>Custo total</span><b>${brl(Math.round(c.custoTotal))}</b><small>venda ${c.venda?brl(c.venda)+(c.vendaAuto?' (90% FIPE)':''):'?'}</small></div></div>
  ${c.lucroReal!=null?`<div class="gsum ${c.lucroReal>=0?'ok':'bad'}"><div class="gsm"><span>Lucro real</span><b>${brl(Math.round(c.lucroReal))}</b><small>custo real ${brl(Math.round(c.custoReal))}</small></div></div>`:''}`;
 const t=$('gRepT');if(t)t.textContent=brl(Math.round(c.rep));}
function repHtml(it){return (it.reparos||[]).length?(it.reparos.map((r,i)=>`<div class="grep ${r.off?'off':''}"><input data-rp="${i}" data-k="item" value="${esc(r.item||'')}" placeholder="Peça / serviço"><input data-rp="${i}" data-k="min" inputmode="decimal" value="${num(r.min)||''}" placeholder="mín"><input data-rp="${i}" data-k="max" inputmode="decimal" value="${num(r.max)||''}" placeholder="máx"><button data-rpx="${i}" title="Remover">✕</button>${r.obs?`<small>${esc(r.obs)}${r.ia?' · IA':''}</small>`:''}</div>`).join('')):'<p class="mut">Nenhum reparo ainda. Faça a vistoria ou adicione à mão.</p>';}
function reaisHtml(it){return (it.reais||[]).map((r,i)=>`<div class="grep"><input data-re="${i}" data-k="desc" value="${esc(r.desc||'')}" placeholder="Descrição"><input data-re="${i}" data-k="valor" inputmode="decimal" value="${num(r.valor)||''}" placeholder="R$"><input data-re="${i}" data-k="data" type="date" value="${esc(r.data||'')}"><button data-rex="${i}">✕</button></div>`).join('');}
function setPath(o,p,v){const k=p.split('.');let x=o;for(let i=0;i<k.length-1;i++){x[k[i]]=x[k[i]]||{};x=x[k[i]];}x[k[k.length-1]]=v;}
const NUMF=new Set(['lance','fipe','aval','venda','margem','com','arremate','vendido.valor']);
function bindEditorOnce(){const box=$('sheetBox');const cur=()=>GAR.editing&&GAR.items.get(GAR.editing);
 box.addEventListener('input',e=>{const t=e.target;const it=cur();if(!it)return;
  if(t.dataset.f){const v=NUMF.has(t.dataset.f)?num(t.value):t.value;setPath(it,t.dataset.f,v);if(t.dataset.f==='status')return;}
  else if(t.dataset.cu!=null){const x=it.custos[+t.dataset.cu];if(x.pct!=null)x.pct=num(t.value);else x.v=num(t.value);}
  else if(t.dataset.rp!=null){const r=it.reparos[+t.dataset.rp];r[t.dataset.k]=t.dataset.k==='item'?t.value:num(t.value);}
  else if(t.dataset.re!=null){const r=it.reais[+t.dataset.re];r[t.dataset.k]=t.dataset.k==='valor'?num(t.value):t.value;}
  else if(t.id==='gTitle'){it.title=t.textContent.trim().slice(0,120);}
  else return;gSum(it);gSave(it);});
 box.addEventListener('change',e=>{const it=cur();if(it&&e.target.dataset.f==='status'){setPath(it,'status',e.target.value);gSave(it,true);gOpen(it.id);}});
 box.addEventListener('click',async e=>{const b=e.target.closest('button');const it=cur();if(!b||!it)return;
  if(b.dataset.ck){it.vistoria.check=it.vistoria.check||{};it.vistoria.check[b.dataset.ck]=it.vistoria.check[b.dataset.ck]===b.dataset.v?'':b.dataset.v;b.parentElement.querySelectorAll('button').forEach(x=>x.className=x===b&&it.vistoria.check[b.dataset.ck]?'on '+b.dataset.v:'');gSave(it);return;}
  if(b.id==='gRepAdd'){it.reparos.push({item:'',min:0,max:0});$('gRep').innerHTML=repHtml(it);gSave(it);return;}
  if(b.dataset.rpx!=null){it.reparos.splice(+b.dataset.rpx,1);$('gRep').innerHTML=repHtml(it);gSum(it);gSave(it);return;}
  if(b.id==='gReaisAdd'){it.reais.push({desc:'',valor:0,data:new Date().toISOString().slice(0,10)});$('gReais').innerHTML=reaisHtml(it);gSave(it);return;}
  if(b.dataset.rex!=null){it.reais.splice(+b.dataset.rex,1);$('gReais').innerHTML=reaisHtml(it);gSum(it);gSave(it);return;}
  if(b.dataset.rmf){it.fotos=it.fotos.filter(f=>f!==b.dataset.rmf);b.parentElement.remove();gSave(it);return;}
  if(b.id==='gIA'){runIA(it,b);return;}
  if(b.id==='gDel'){if(confirmDel(b)){await gDelete(it.id);closeSheet();renderGaragem();toast('Apagado da garagem');}return;}
  if(b.id==='gLot'){const l=BYID.get(it.lotId);closeSheet();openLot(l);return;}});
 box.addEventListener('change',e=>{if(e.target.id==='gFile'){const it=cur();if(it)uploadFotos(it,e.target.files);}});}
function confirmDel(b){if(b.dataset.sure){return true;}b.dataset.sure=1;b.textContent='Toque de novo para apagar';setTimeout(()=>{delete b.dataset.sure;b.textContent='Apagar da garagem';},4000);return false;}

// ---------- fotos ----------
const _blobs={};
async function shrink(file){try{const bmp=await createImageBitmap(file);const k=Math.min(1,1600/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(b=>r(b||file),'image/jpeg',0.82));}catch(e){return file;}}
async function uploadFotos(it,files){const list=[...files].slice(0,12);if(!list.length)return;toast('Enviando '+list.length+' foto'+(list.length>1?'s':'')+'...');
 for(const f of list){const b=await shrink(f);try{const a=await GAR.assets.upload(b);it.fotos=[...(it.fotos||[]),a.id];_blobs[a.id]=b;
   $('gFotos').insertAdjacentHTML('beforeend',`<div class="gph"><img src="${URL.createObjectURL(b)}" alt=""><button data-rmf="${esc(a.id)}" aria-label="Remover foto">✕</button></div>`);}catch(e){toast('Uma foto não subiu (tamanho ou permissão).');}}
 gSave(it,true);}
async function fotoBlobs(it){const out=[];for(const id of (it.fotos||[]).slice(-(GAR.lim&&GAR.lim.maxCount||8))){if(_blobs[id]){out.push(_blobs[id]);continue;}
 try{const r=await fetch('/_blob/'+id);if(r.ok){const b=await r.blob();_blobs[id]=b;out.push(b);}}catch(e){}}return out;}

// ---------- vistoria por IA ----------
function iaHtml(ia){if(!ia)return'';return `<div class="gia"><p><b>${esc(ia.estado||'')}</b>${ia.confianca?` · confiança ${esc(ia.confianca)}`:''}${ia.nfotos!=null?` · ${ia.nfotos} foto${ia.nfotos===1?'':'s'}`:''}${ia.quando?` · ${new Date(ia.quando).toLocaleDateString('pt-BR')}`:''}</p><p>${esc(ia.resumo||'')}</p>
 ${(ia.riscos||[]).length?`<p class="mut"><b>Riscos:</b> ${ia.riscos.map(esc).join(' · ')}</p>`:''}${(ia.verificar||[]).length?`<p class="mut"><b>Conferir no pátio/edital:</b> ${ia.verificar.map(esc).join(' · ')}</p>`:''}</div>`;}
async function runIA(it,btn){const out=$('gIAout');btn.disabled=true;out.innerHTML='<p class="mut">Analisando fotos e dados… (pode levar até 1 minuto)</p>';
 try{const imgs=GAR.lim?await fotoBlobs(it):[];const chk=CHK.map(([k,l])=>`- ${l}: ${({ok:'OK',atencao:'atenção',ruim:'ruim'})[(it.vistoria.check||{})[k]]||'não avaliado'}`).join('\n');
  const prompt=`Você é um vistoriador de veículos de leilão no Brasil e orçamentista de oficina independente.
Avalie o veículo abaixo para quem vai dar lance e revender. ${imgs.length?`Há ${imgs.length} foto(s) anexada(s) (prints do anúncio e/ou fotos do pátio).`:'Não há fotos: baseie-se só nos dados e diga que a confiança é baixa.'}
Dados: ${it.title} | ano ${it.ano||'?'} | ${it.sub||''} | cidade ${it.city||'?'}/${it.uf||''} | lance atual R$ ${num(it.lance)||'?'} | FIPE informada R$ ${num(it.fipe)||'?'} | origem ${SRCN[it.src]||it.src}.
Checklist do usuário:\n${chk}\nAnotações: ${(it.vistoria.notas||'').slice(0,1500)||'nenhuma'}
Liste só problemas visíveis ou fortemente indicados (não invente). Para cada um, estime custo em reais de peça+mão de obra em oficina independente na região, com faixa mínima e máxima realista. Inclua itens de praxe de veículo de leilão parado (bateria, pneus vencidos, fluidos, chave) apenas se fizer sentido.
Responda SOMENTE com JSON neste formato:
{"estado":"bom|regular|ruim|sucata","confianca":"baixa|media|alta","resumo":"2-3 frases","itens":[{"item":"peça ou serviço","obs":"o que foi visto","gravidade":"leve|media|grave","min":0,"max":0}],"riscos":["..."],"verificar":["o que conferir pessoalmente"],"revenda_sugerida":0}`;
  const res=await GAR.sample.json(prompt,{images:imgs.length?imgs:undefined,modelTier:'default',onText:()=>{out.innerHTML='<p class="mut">Escrevendo a análise…</p>';}});
  if(!res||!Array.isArray(res.itens))throw{code:'invalid_json'};
  it.reparos=[...(it.reparos||[]).filter(r=>!r.ia),...res.itens.slice(0,30).map(x=>({item:String(x.item||'').slice(0,80),obs:[x.gravidade,x.obs].filter(Boolean).join(': ').slice(0,160),min:num(x.min),max:Math.max(num(x.max),num(x.min)),ia:true}))];
  it.vistoria.ia={estado:res.estado||'',confianca:res.confianca||'',resumo:String(res.resumo||'').slice(0,600),riscos:(res.riscos||[]).slice(0,8).map(String),verificar:(res.verificar||[]).slice(0,8).map(String),nfotos:imgs.length,quando:Date.now(),revenda:num(res.revenda_sugerida)};
  if(!num(it.venda)&&num(res.revenda_sugerida))it.venda=num(res.revenda_sugerida);
  if(it.status==='interesse')it.status='vistoria';gSave(it,true);gOpen(it.id);toast('Vistoria por IA concluída');}
 catch(e){const m={not_granted:'Você não autorizou o uso do Claude neste app.',rate_limited:'Muitas análises seguidas: tente daqui a pouco.',images_unavailable:'Envio de fotos indisponível aqui; a análise vai só com os dados.',image_rejected:'Alguma foto não foi aceita (formato/tamanho).',invalid_json:'A resposta veio incompleta. Tente de novo.',refused:'A IA não analisou essas imagens. Tente outras fotos.'}[e&&e.code]||'Não deu para analisar agora. Tente de novo.';
  out.innerHTML=`<p class="warn">${m}</p>`;btn.disabled=false;}}

// ---------- integração com o app ----------
function refreshGarBtn(l){const b=$('sGar');if(b)b.textContent=GAR.items.has(l.id)?'✓ Na garagem':'🚗 Garagem';}
async function garInit(){try{if(!window.claude||!window.claude.use)return;const db=await window.claude.use('db');if(!db)return;GAR.db=db;
 GAR.user=await window.claude.use('user').catch(()=>null);GAR.me=GAR.user?await GAR.user.id().catch(()=>null):null;
 GAR.assets=await window.claude.use('assets').catch(()=>null);GAR.sample=await window.claude.use('sample').catch(()=>null);
 if(GAR.sample){const lim=await GAR.sample.limits().catch(()=>null);GAR.lim=lim&&lim.images||null;}
 GAR.on=true;document.body.classList.add('gar-on');bindEditorOnce();
 document.querySelectorAll('[data-v="favs"]').forEach(b=>{const s=b.querySelector('.ti');b.lastChild.textContent='Garagem';if(s&&!s.querySelector('svg'))s.textContent='🚗';});
 $('v-favs').querySelector('.page').innerHTML='<div class="card panel"><h3>Garagem</h3><p class="mut" id="garNote">Carregando…</p><div id="garBox"></div></div>';
 const t=setTimeout(()=>{const n=$('garNote');if(n)n.textContent='Os dados da garagem ainda não chegaram. Verifique a conexão.';},10000);
 db.collection('garagem').onSnapshot(s=>{clearTimeout(t);const nm=new Map(s.docs.map(d=>[d.id,JSON.parse(JSON.stringify(d.data()))]));for(const [k,v] of GAR.items)if(_dirty[k])nm.set(k,v);GAR.items=nm;
   const n=$('garNote');if(n)n.textContent='Seus bens em acompanhamento, do interesse até a venda. Compartilhado com quem tem acesso a este app.';
   if($('v-favs').classList.contains('on'))renderGaragem();if(GAR.editing&&$('sheet').classList.contains('on')&&!$('sheetBox').contains(document.activeElement)){const it=GAR.items.get(GAR.editing);if(it)gSum(it);}},
  e=>{clearTimeout(t);const n=$('garNote');if(n)n.textContent='Não foi possível abrir a garagem neste acesso.';});
 db.doc('config/padrao').get().then(s=>{if(s.exists){const d=s.data();GAR.cfg={margem:num(d.margem)||20,com:num(d.com)||5};}}).catch(()=>{});
 $('v-favs').addEventListener('click',e=>{const f=e.target.closest('[data-gf]');if(f){GAR.filtro=f.dataset.gf;renderGaragem();return;}const c=e.target.closest('.gcard');if(c){gOpen(c.dataset.gid);return;}
  if(e.target.id==='gNew'){const it=novoItem(null);gSave(it,true);gOpen(it.id);return;}
  if(e.target.id==='gCsv'){gExportCsv();return;}
  if(e.target.id==='gImp'){let n=0;favs.forEach(id=>{const l=BYID.get(id);if(l&&!GAR.items.has(id)){gSave(novoItem(l),true);n++;}});toast(n?n+' favorito(s) trazidos para a garagem':'Eles já estão na garagem');return;}});
 if($('v-favs').classList.contains('on'))renderGaragem();}catch(e){console.warn('garagem indisponível',e);}}
{const _rf=renderFavs;renderFavs=function(){if(GAR.on)renderGaragem();else _rf();};}
{const _ol=openLot;openLot=function(l){_ol(l);if(!l||!GAR.on)return;GAR.editing=null;const acts=$('sheetBox').querySelector('.acts');if(!acts)return;const fb=$('sFav');
 if(fb){fb.id='sGar';fb.onclick=()=>gAddLot(l);refreshGarBtn(l);}}}
{const _cs=closeSheet;closeSheet=function(){GAR.editing=null;_cs();if(GAR.on&&$('v-favs').classList.contains('on'))renderGaragem();};}
setTimeout(garInit,0);
