#!/usr/bin/env python3
"""Radar de Leilões — gera radar-leiloes.html a partir dos arquivos em raw/.

Uso:  python3 build.py [AAAA-MM-DD]     (data da coleta; padrão = hoje)
Entradas (raw/): caixa.txt superbid.txt mega.txt leilaoimovel.txt detranba.txt
                 mg_cal.txt rs_cal.txt agenda_extra.txt   (qualquer um pode faltar)
Base (base/):    municipios.txt states.txt template.html
Saída:           radar-leiloes.html (mesma pasta) + relatorio.txt
"""
import re, sys, os, json, gzip, base64, unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
R = lambda f: os.path.join(HERE, 'raw', f)
BASE = lambda f: os.path.join(HERE, 'base', f)
TODAY = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else date.today()
REPORT = []
def log(*a):
    s = ' '.join(str(x) for x in a); print(s); REPORT.append(s)

def lines(f):
    p = R(f)
    if not os.path.exists(p) or os.path.getsize(p) < 10:
        log('AVISO: sem dados em', f); return []
    return [l.rstrip('\n') for l in open(p, encoding='utf-8') if l.strip()]

def norm(s):
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', s.upper().replace("'", ' ').replace('-', ' ')).strip()

MUN, NAME = {}, {}
for l in open(BASE('municipios.txt'), encoding='utf-8'):
    n, uf, la, lo = l.rstrip('\n').split('|')
    MUN[(norm(n), uf)] = (float(la), float(lo)); NAME[(norm(n), uf)] = n
ALIAS = {'EMBU': 'EMBU DAS ARTES', 'MOJI MIRIM': 'MOGI MIRIM', 'MOJI DAS CRUZES': 'MOGI DAS CRUZES', 'SANTA ISABEL DO PARA': 'SANTA IZABEL DO PARA', 'ASSU': 'ACU'}
CAP = {'AC':'Rio Branco','AL':'Maceió','AM':'Manaus','AP':'Macapá','BA':'Salvador','CE':'Fortaleza','DF':'Brasília','ES':'Vitória','GO':'Goiânia','MA':'São Luís','MG':'Belo Horizonte','MS':'Campo Grande','MT':'Cuiabá','PA':'Belém','PB':'João Pessoa','PE':'Recife','PI':'Teresina','PR':'Curitiba','RJ':'Rio de Janeiro','RN':'Natal','RO':'Porto Velho','RR':'Boa Vista','RS':'Porto Alegre','SC':'Florianópolis','SE':'Aracaju','SP':'São Paulo','TO':'Palmas'}
miss = Counter()
def key(city, uf):
    k = norm(re.sub(r'^Leil[aã]o (em|no|na) ', '', city or '', flags=re.I))
    k = 'BRASILIA' if uf == 'DF' else ALIAS.get(k, k)
    if (k, uf) in MUN: return (k, uf)
    for k2 in (k.replace(' D ', ' D'), k.replace('DOESTE', 'D OESTE'), k.replace(' DO ', ' D ')):
        if (k2, uf) in MUN: return (k2, uf)
    return None
def geo(city, uf):
    k = key(city, uf)
    if k: return MUN[k]
    miss[(city, uf)] += 1; return None
def canon(city, uf):
    k = key(city, uf); return NAME[k] if k else (city or '').title()

def money(s):
    s = (s or '').strip()
    if not s: return ''
    try: return str(round(float(s.replace('.', '').replace(',', '.')) if ',' in s else float(s)))
    except: return ''
clean = lambda s, n=90: re.sub(r'\s+', ' ', (s or '').replace('|', ' ')).strip()[:n]

def still_open(end):  # 'AAAA-MM-DD HH:MM' ou 'AAAA-MM-DD'
    if not end: return True
    try: return datetime.fromisoformat(end[:16].replace(' ', 'T') if len(end) > 10 else end + 'T23:59') >= datetime.combine(TODAY, datetime.min.time())
    except: return True

# ======================= CAIXA =======================
cx_rows, agg = [], defaultdict(lambda: [0, 0, 10**12])
cx_uf, cx_mod = Counter(), Counter()
MODN = {'VDO': 'Venda Direta Online', 'VO': 'Venda Online', 'LSFI': 'Leilão SFI', 'LA': 'Licitação Aberta'}
for l in lines('caixa.txt'):
    c = l.split('|')
    if len(c) < 12: continue
    id_, uf, city, bairro, tipo, mod, preco, aval, desc, area, qto, fin = c[:12]
    g = geo(city, uf)
    if not g: g = MUN[key(CAP[uf], uf)]; city = CAP[uf]
    cn = canon(city, uf)
    cx_rows.append('|'.join([id_, uf, cn, bairro, tipo, mod, preco, aval, desc, area, qto, fin, f'{g[0]:.3f}', f'{g[1]:.3f}']))
    a = agg[(cn, uf, round(g[0], 3), round(g[1], 3))]; a[0] += 1; a[1] += int(desc or 0); a[2] = min(a[2], int(preco or 0) or a[2])
    cx_uf[uf] += 1; cx_mod[MODN.get(mod, mod)] += 1
cities = ['|'.join(map(str, [k[0], k[1], k[2], k[3], v[0], round(v[1] / v[0]), round(v[2] / 1000) if v[2] < 10**12 else 0])) for k, v in sorted(agg.items(), key=lambda x: -x[1][0])]
log('Caixa:', len(cx_rows), 'imóveis em', len(cities), 'cidades')

# ======================= DETRAN-BA =======================
FIXBA = {**{n: 'Feira de Santana' for n in ('275', '276', '277', '297', '298')}, **{n: 'Jacobina' for n in ('280', '281', '302', '303')},
         **{n: 'Simões Filho' for n in ('290', '291', '292', '313', '314')}, '235': 'Santo Antônio de Jesus', '243': 'Santo Antônio de Jesus',
         '278': 'Guanambi', '299': 'Guanambi', '294': 'Brumado'}
nb_raw = [l.split('|') for l in lines('detranba.txt')]
by_auc = defaultdict(Counter)
def ba_city(addr):
    m = re.search(r',\s*([^,]+?)\s*-\s*B', addr or '')
    return m.group(1).strip() if m else ''
for c in nb_raw:
    if len(c) >= 7 and ba_city(c[3]): by_auc[c[0].split('-')[0]][ba_city(c[3])] += 1
nb_rows = []
for c in nb_raw:
    if len(c) < 7: continue
    lid, title, cat, addr, price, dt, slug = c[:7]
    title = re.sub(r'^(VE[IÍ]CULO CONSERVADO|SUCATA( APROVEIT[AÁ]VEL)?( COM MOTOR INSERV[IÍ]VEL)?|SUCATA INSERV[IÍ]VEL)\s+', '', title.strip(), flags=re.I)
    if not title.strip():
        s = re.sub(r'^\d+-\d+-(veiculo-conservado|sucata-aproveitavel(-com-motor-inservivel)?|sucata[a-z-]*?)-', '', slug)
        m = re.search(r'-(\d{4})(\d{4})$', s)
        title = (s[:m.start()] if m else s).replace('-', ' ').upper() + (f' - {m.group(1)}/{m.group(2)}' if m else '')
    title = re.sub(r'^(HONDA|YAMAHA|SUZUKI|DAFRA|SHINERAY|GM|FIAT|VW|FORD|HYUNDAI|RENAULT|TOYOTA|CITROEN|PEUGEOT|NISSAN|KIA|MMC|JTA|HAOJUE|TRAXX|SUNDOWN|KASINSKI|MOTOCAR|BRAVAX|HUARI|IMP|JAC|CHERY|LIFAN|M\.BENZ|MBENZ|AUDI|BMW|VOLVO|JEEP|DODGE|MITSUBISHI|KAWASAKI|AGRALE|IVECO|SCANIA)(?=[A-Z0-9])', r'\1/', title)
    if dt and dt < TODAY.isoformat(): continue
    city = ba_city(addr); auc = lid.split('-')[0]
    if not city: city = by_auc[auc].most_common(1)[0][0] if by_auc[auc] else FIXBA.get(auc, 'Salvador')
    g = geo(city, 'BA') or MUN[key('Salvador', 'BA')]
    street = addr.split(',')[0].strip() if ',' in addr else ''
    nb_rows.append('|'.join([lid, title, cat, canon(city, 'BA'), street, price, dt, f'{g[0]:.3f}', f'{g[1]:.3f}', slug]))
log('Detran-BA:', len(nb_rows), 'lotes')

# ======================= LOTES GERAIS =======================
rows, seen = [], set()
def add(*f): rows.append('|'.join(str(x) for x in f))
SBG = {'imoveis':'imo','caminhoes-onibus':'cam','maquinas-pesadas-agricolas':'maq','industrial-maquinas-equipamentos':'ind','tecnologia':'tec','partes-e-pecas':'ind',
       'movimentacao-transporte':'maq','eletrodomesticos':'casa','moveis-e-decoracao':'casa','cozinhas-e-restaurantes':'casa','sucatas-materiais-residuos':'suc',
       'embarcacoes-aeronaves':'div','materiais-para-construcao-civil':'ind','alimentos-e-bebidas':'div','animais':'div','artes-decoracao-colecionismo':'div','bolsas-canetas-joias-e-relogios':'div'}
NM = {'industrial-maquinas-equipamentos':'Industrial e equipamentos','maquinas-pesadas-agricolas':'Máquinas pesadas e agrícolas','imoveis':'Imóveis','carros-motos':'Carros e motos','tecnologia':'Tecnologia','caminhoes-onibus':'Caminhões e ônibus','eletrodomesticos':'Eletrodomésticos','movimentacao-transporte':'Movimentação e transporte','partes-e-pecas':'Partes e peças','bolsas-canetas-joias-e-relogios':'Joias e relógios','moveis-e-decoracao':'Móveis e decoração','cozinhas-e-restaurantes':'Cozinhas e restaurantes','animais':'Animais','sucatas-materiais-residuos':'Sucatas e resíduos','embarcacoes-aeronaves':'Embarcações e aeronaves','alimentos-e-bebidas':'Alimentos e bebidas','materiais-para-construcao-civil':'Materiais de construção','artes-decoracao-colecionismo':'Arte e colecionismo'}
sbt = Counter(); n0 = 0
for l in lines('superbid.txt'):
    c = l.split('|')
    if len(c) < 14: continue
    id_, title, cat, sub, price, cityuf, la, lo, end, store, bids, modal, auct, slug = c[:14]
    sbt[NM.get(slug, slug)] += 1
    if id_ in seen or not still_open(end): continue
    seen.add(id_)
    m = re.match(r'^(.*?)\s*-\s*([A-Z]{2})$', cityuf); city, uf = (m.group(1), m.group(2)) if m else (cityuf, '')
    if not la or not lo or la in ('0', '0.000'):
        g = geo(city, uf) if uf else None
        if not g: continue
        la, lo = f'{g[0]:.3f}', f'{g[1]:.3f}'
    g = ('moto' if cat.startswith('Moto') or sub.startswith('Moto') else 'car') if slug == 'carros-motos' else SBG.get(slug, 'ind')
    try: p = str(round(float(price))) if price and float(price) > 0 else ''
    except: p = ''
    add('sb' + id_, 'superbid', g, clean(cat, 40), clean(sub, 40), clean(title, 80), p, '', '', city, uf, la, lo, end, clean(store, 30), bids or 0, clean(modal or 'Leilão online', 30), '')
log('Superbid:', len(rows), 'lotes abertos de', sum(sbt.values()), 'coletados'); n0 = len(rows)

TIP = re.compile(r'residencial-(apartamento|casa-condominio|casa|terreno|sobrado|kitnet|flat|cobertura|lote)|comercial-(sala|loja|galpao|predio|terreno|imovel)|rural-|industrial', re.I)
for l in lines('leilaoimovel.txt'):
    c = l.split('|')
    if len(c) < 11: continue
    id_, uf, city, bairro, tipo, price, aval, desc, end, tags, href = c[:11]
    if 'caixa' in href.lower(): continue
    e = ''
    m = re.match(r'(\d\d)/(\d\d)/(\d{4}) (\d\d:\d\d)', end)
    if m: e = f'{m.group(3)}-{m.group(2)}-{m.group(1)} {m.group(4)}'
    if not still_open(e): continue
    g = geo(city, uf)
    if not g: continue
    t = tipo.strip()
    if len(t) < 3:
        m = TIP.search(href); t = (m.group(0).split('-', 1)[-1].replace('-', ' ') if m else 'Imóvel').capitalize()
    t = re.sub(r'\s+(Emgea|Caixa|Santander|Bradesco|Itau|Itaú)$', '', t)
    tg = [x for x in tags.split('/') if x]
    add('li' + id_, 'li', 'imo', 'Imóveis', clean(tg[0] if tg else 'Leilão', 30), clean(t + (' · ' + bairro.title() if bairro else ''), 80), money(price), money(aval), desc or '',
        canon(city, uf), uf, f'{g[0]:.3f}', f'{g[1]:.3f}', e, clean(tg[1] if len(tg) > 1 else 'Leiloeiro parceiro', 30), '', clean(tg[0] if tg else 'Leilão', 30), href)
log('Leilão Imóvel:', len(rows) - n0); n0 = len(rows)

CATN = {'imo':'Imóveis','car':'Carros','moto':'Motos','cam':'Caminhões','maq':'Máquinas','ind':'Industrial','tec':'Tecnologia','casa':'Bens de consumo','div':'Diversos'}
for l in lines('mega.txt'):
    c = l.split('|')
    if len(c) < 11: continue
    id_, sec, cat, uf, loc, title, plast, pfirst, dt, tipo, href = c[:11]
    m2 = re.match(r'(\d\d)/(\d\d)/(\d{4}) (\d\d:\d\d)', dt)
    e = f'{m2.group(3)}-{m2.group(2)}-{m2.group(1)} {m2.group(4)}' if m2 else ''
    if not still_open(e): continue
    m = re.match(r'^(.*?),\s*([A-Z]{2})$', loc.strip())
    if not m: continue
    city, uf = m.group(1), m.group(2); g_ = geo(city, uf)
    if not g_: continue
    tl = (cat + ' ' + title).lower()
    if sec == 'veiculos': g = 'moto' if cat == 'motos' or title.lower().startswith('moto') else ('cam' if re.search(r'caminh|onibus|ônibus|reboque', tl) else 'car')
    elif sec == 'imoveis': g = 'imo'
    elif sec == 'industrial': g = 'maq' if re.search(r'maquin|trator|escavad|agric', tl) else 'ind'
    elif sec == 'bens-de-consumo': g = 'tec' if re.search(r'eletron|inform|celular|notebook|computad', tl) else 'casa'
    else: g = 'div'
    pf, pl = money(pfirst), money(plast)
    aval = pf if pf and pl and int(pl) < int(pf) else ''
    d = str(round(100 - int(pl) * 100 / int(pf))) if aval else ''
    add('mg' + id_, 'mega', g, CATN[g], clean(cat.replace('-', ' ').capitalize(), 30), clean(title, 80), pl if aval else pf, aval, d, canon(city, uf), uf,
        f'{g_[0]:.3f}', f'{g_[1]:.3f}', e, 'Mega Leilões', '', tipo or 'Leilão', href)
log('Mega Leilões:', len(rows) - n0)

# ======================= AGENDA DETRANS =======================
EV = []
def ev(ini, fim, uf, cities, org, lotes, leil, url, obs=''):
    if fim < TODAY.isoformat(): return
    g = None
    for cty in cities.split(';'):
        g = geo(cty.strip(), uf)
        if g: break
    g = g or MUN[key(CAP[uf], uf)]
    EV.append('|'.join(map(str, [ini, fim, uf, ';'.join(canon(x.strip(), uf) for x in cities.split(';')), org, lotes, leil, url, f'{g[0]:.4f}', f'{g[1]:.4f}', obs])))
# MG (texto da página de calendário)
mg = '\n'.join(lines('mg_cal.txt'))
for c, ed, d, h, q, p in re.findall(r'\n([A-ZÁÉÍÓÚÂÊÔÃÕÇ\' \-]{3,40})\n+Edital nº ([\d/]+)\n+Data: ([^\n]+)\nHora: ([^\n]+)\nQuantidade de Veículos: (\d+)\.\nPátio: ([^\n]+)\.', '\n' + mg):
    a = re.findall(r'(\d\d)/(\d\d)/(\d{4})', d)
    if not a: continue
    fim = date(int(a[-1][2]), int(a[-1][1]), int(a[-1][0]))
    try: ini = date(int(a[0][2]), int(a[0][1]), int(a[0][0])) if len(a) > 1 else fim.replace(day=int(re.match(r'(\d\d)', d).group(1)))
    except ValueError: ini = fim
    if ini > fim: ini = (fim.replace(day=1) - timedelta(days=1)).replace(day=int(re.match(r'(\d\d)', d).group(1)))
    ev(ini.isoformat(), fim.isoformat(), 'MG', c.strip().title(), 'Detran-MG', q, 'Sistema de Leilões Detran-MG', 'https://leilao.detran.mg.gov.br', f'Edital {ed} · pátio {p}')
# RS (texto do calendário pcsdetran.rs.gov.br)
rs = '\n'.join(lines('rs_cal.txt'))
for blk in re.split(r'(?=Edital EMAV:)', rs)[1:]:
    n = re.search(r'Veículos/Sucatas:\s*(\d+)', blk); d = re.search(r'Data do Leilão:\s*(\d\d)/(\d\d)/(\d{4})\s*(\d\d:\d\d)?', blk)
    u = re.search(r'Local do Leilão:\s*(\S+)', blk); lo = re.search(r'Leiloeiro Oficial:\s*([^\n]+)', blk); ed = re.search(r'Edital EMAV:\s*([\d/]+)', blk)
    cs = [x.strip().title() for x in re.findall(r'Cidade:\s*([^\n]+)', blk)]
    if not (n and d): continue
    iso = f'{d.group(3)}-{d.group(2)}-{d.group(1)}'
    host = re.sub(r'https?://(www\.)?|/.*', '', u.group(1)) if u else ''
    ev(iso, iso, 'RS', ';'.join(dict.fromkeys(cs)) or 'Porto Alegre', 'Detran-RS', n.group(1), host or 'ver edital', u.group(1) if u else 'https://pcsdetran.rs.gov.br/consulta-calendario-leilao',
       f'Edital EMAV {ed.group(1) if ed else ""}' + (f' · {d.group(4)}' if d.group(4) else '') + (f' · leiloeiro {lo.group(1).strip().title()}' if lo else ''))
# Outros estados (arquivo mantido à mão / pela tarefa agendada): ini|fim|UF|cidades;sep|orgao|lotes|leiloeiro|url|obs
for l in lines('agenda_extra.txt'):
    if l.startswith('#'): continue
    c = l.split('|')
    if len(c) >= 8: ev(*c[:8], c[8] if len(c) > 8 else '')
# Detran-BA a partir dos lotes
if nb_rows:
    ds = sorted({r.split('|')[6] for r in nb_rows if r.split('|')[6]}); cs = Counter(r.split('|')[3] for r in nb_rows)
    ev(ds[0], ds[-1], 'BA', ';'.join(c for c, _ in cs.most_common(12)), 'Detran-BA', len(nb_rows), 'Nordeste Leilões', 'https://www.nordesteleiloes.com.br', 'Lotes detalhados no mapa (filtro de fonte Detran-BA)')
EV.sort()
log('Agenda:', len(EV), 'leilões de Detran,', sum(int(e.split('|')[5]) for e in EV), 'lotes')

# ======================= HTML =======================
gz = lambda s: base64.b64encode(gzip.compress(s.encode('utf-8'), 9)).decode()
t = open(BASE('template.html'), encoding='utf-8').read()
DD = TODAY.strftime('%d/%m/%Y')
data = '\n'.join([
    f"const DATA_DATE='{DD}';",
    "const DETRANBA=" + json.dumps('\n'.join(nb_rows), ensure_ascii=False) + ";",
    "const AGENDA=" + json.dumps('\n'.join(EV), ensure_ascii=False) + ";",
    "const CITIES=" + json.dumps('\n'.join(cities), ensure_ascii=False) + ";",
    "const STATES=" + json.dumps(open(BASE('states.txt'), encoding='utf-8').read()) + ";",
    "const CX_UF=" + json.dumps(dict(cx_uf)) + ";",
    f"const CX_COUNT={len(cx_rows)};",
    f"const CX_CITIES={len(cities)};",
    "const CX_MOD=" + json.dumps(dict(cx_mod), ensure_ascii=False) + ";",
    "const SB_TOTALS=" + json.dumps(dict(sbt), ensure_ascii=False) + ";",
])
out = t.replace('/*DATA*/', data).replace('<script>\n(async()=>{', '<script>const LOTS_GZ="' + gz('\n'.join(rows)) + '";const CAIXA_GZ="' + gz('\n'.join(cx_rows)) + '";</script>\n<script>\n(async()=>{', 1)
assert 'LOTS_GZ="' in out and '/*DATA*/' not in out
dest = os.path.join(HERE, 'radar-leiloes.html')
open(dest, 'w', encoding='utf-8').write(out)
log('Não localizados no mapa:', sum(miss.values()), miss.most_common(5))
log(f'OK: {dest} ({len(out)//1024} KB) · {len(rows)+len(cx_rows)+len(nb_rows)} lotes · dados de {DD}')
open(os.path.join(HERE, 'relatorio.txt'), 'w', encoding='utf-8').write('\n'.join(REPORT) + '\n')
