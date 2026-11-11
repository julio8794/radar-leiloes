import json,sys
# uso: grab.py arquivo_tool saida
j=json.load(open(sys.argv[1]));t=j[0]['text'] if isinstance(j,list) else j
body=t.split('INICIO\n',1)[1].split('\nFIM',1)[0]
open(sys.argv[2],'w').write(body+'\n');print(sys.argv[2],body.count('\n')+1,'linhas')
