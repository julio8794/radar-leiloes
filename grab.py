import json,sys,re
raw=open(sys.argv[1],encoding='utf-8').read()
try:
    j=json.loads(raw);t=j[0]['text'] if isinstance(j,list) else j
except Exception: t=raw
m=re.search(r'IN[IÍ]CIO\n(.*?)\nFIM',t,re.S)
if not m: sys.exit('marcador INICIO/FIM não encontrado')
body=m.group(1)
open(sys.argv[2],'w',encoding='utf-8').write(body+'\n');print(sys.argv[2],body.count('\n')+1,'linhas')
