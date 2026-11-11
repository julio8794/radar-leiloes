import json,sys,re
j=json.load(open(sys.argv[1]));t=j[0]['text'] if isinstance(j,list) else j
m=re.search(r'IN[IÍ]CIO\n(.*?)\nFIM',t,re.S)
if not m: sys.exit('marcador INICIO/FIM não encontrado')
body=m.group(1)
open(sys.argv[2],'w').write(body+'\n');print(sys.argv[2],body.count('\n')+1,'linhas')
