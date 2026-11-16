# Radar de Leilões — kit de atualização

Para usar o app, abra **radar-leiloes.html** com dois cliques. Ele funciona offline e em qualquer navegador.

Esta pasta guarda tudo o que é preciso para gerar uma versão nova com dados frescos. A atualização automática roda a cada 2 dias e segue o roteiro abaixo.

## Conteúdo
- `radar-leiloes.html`: o app pronto (dados embutidos e compactados).
- `relatorio.txt`: resumo da última atualização (quantos lotes por fonte, avisos).
- `build.py`: lê `raw/` e gera o HTML. Uso: `python3 build.py AAAA-MM-DD`.
- `grab.py`: extrai o bloco `INICIO…FIM` do texto salvo pelo navegador. Uso: `python3 grab.py <arquivo-salvo> raw/<fonte>.txt`.
- `scrapers/*.js`: scripts de coleta que rodam dentro do Chrome, na página certa.
- `raw/`: dados brutos da última coleta, um arquivo por fonte.
  - Se uma fonte falhar, o arquivo antigo dessa fonte é mantido e o app sai com os dados anteriores dela.
- `base/`: arquivos fixos (municípios, contornos dos estados, modelo do app).

## Roteiro de atualização (para o Claude)
Faça a coleta no Chrome do usuário (Claude in Chrome), numa aba nova criada por você. Feche essa aba no fim.

Para cada fonte:
1. Abra a página indicada.
2. Rode o conteúdo do script com `javascript_tool`. Ele inicia um trabalho em segundo plano.
3. A cada 20–40 s, consulte `JSON.stringify({cur:__st.cur,n:__R.length})` até `__st.cur==='FIM'`.
4. Despeje o resultado com:
   `document.body.innerHTML='<pre id=o></pre>';document.getElementById('o').textContent='.'.repeat(300000)+'\nINICIO\n'+__R.join('\n')+'\nFIM\n';__R.length`
   (o preenchimento de pontos antes do bloco faz o texto ir direto para arquivo, sem encher a conversa)
5. Chame `get_page_text` com `max_chars` grande (ex.: 5000000). O texto vai para um arquivo em /tmp.
6. Rode `python3 grab.py <arquivo> raw/<fonte>.txt`. O grab.py aceita "INÍCIO" também, porque a tradução automática do Chrome às vezes troca o marcador. Só substitua o arquivo de `raw/` se a coleta vier com volume razoável (veja a tabela).

| fonte (arquivo em raw/) | página onde rodar | script | volume esperado |
|---|---|---|---|
| caixa.txt | https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp | scrapers/caixa.js | ~20–25 mil |
| superbid.txt | https://www.superbid.net/todas-categorias | scrapers/superbid.js (leva ~6–10 min) | ~12–14 mil |
| mega.txt | https://www.megaleiloes.com.br/ | scrapers/mega.js | ~800–1.500 |
| leilaoimovel.txt | https://www.leilaoimovel.com.br/ | scrapers/leilaoimovel.js (lento de propósito, ~3 min) | ~1.000–1.300 |
| detranba.txt | https://www.nordesteleiloes.com.br/comitentes/33e04b87-556f-4b2d-bcba-0310641430ea | scrapers/detranba.js (espera a página carregar; ~1 s por página) | centenas a milhares |
| u_copart.txt | https://www.copart.com.br/lotSearchResults/?free=true&query= | scrapers/copart.js (~8 min, 100 por página) | ~13–15 mil |
| u_zuk.txt | https://www.portalzuk.com.br/leilao-de-imoveis | scrapers/zuk.js (botão "Carregar mais" é lento: se parar antes do total, rode de novo com `window.__M={}` antes) | ~900–1.200 |
| u_sodre.txt | https://www.sodresantoro.com.br/veiculos/lotes, depois /materiais/lotes, /imoveis/lotes, /sucatas/lotes | scrapers/sodre.js, uma seção por vez; acumula em sessionStorage (antes da 1ª seção rode `sessionStorage.removeItem('ssR')`; nas outras, a 1ª linha comentada do script) | ~2.000 |
| u_freitas.txt | https://www.freitasleiloeiro.com.br/Leiloes/Pesquisar?query=&categoria=1, depois 2 e 3 | scrapers/freitas.js, uma categoria por vez; acumula em sessionStorage('ftR') (limpe antes da 1ª) | ~1.000–1.500 |
| u_vip.txt | https://www.vipleiloes.com.br/pesquisa | scrapers/vip.js (~30 min; deixe a aba em primeiro plano se possível) | ~3.000 |
| e_pncp.txt | https://pncp.gov.br/app/editais | scrapers/pncp.js (API pública documentada do PNCP; leilões de prefeituras, estados, Receita, Detrans) | ~150–250 eventos |

**Fontes genéricas:** qualquer arquivo `raw/u_<fonte>.txt` no formato único de lotes
(`id|fonte|grupo|categoria|sub|título|preço|avaliação|desconto|cidade|UF|lat|lon|fim|vendedor|lances|modalidade|link|foto|endereço`)
entra sozinho no app; lat/lon vazios são geocodificados pela cidade/UF. Arquivos `raw/e_<fonte>.txt`
(`início|fim|UF|cidade|órgão|lotes|plataforma|url|lat|lon|descrição|valor|tipo`) entram na Agenda. Para dar nome
bonito a uma fonte nova, acrescente-a em `SRC_NAMES` no build.py.

**Calendários de Detran:** não usam script, só copiam o texto da página.
- `raw/mg_cal.txt`: abra https://www.detran.mg.gov.br/veiculos/leiloes/calendario-de-leiloes-2026 e espere 3 s.
  - Rode `document.body.innerHTML='<pre id=o></pre>'` com o texto da página entre `INICIO\n` e `\nFIM` (salve `document.body.innerText` antes de trocar).
  - Depois use `get_page_text` + `grab.py`.
  - Na virada do ano, troque 2026 por 2027 no endereço.
- `raw/rs_cal.txt`: mesmo procedimento em https://pcsdetran.rs.gov.br/consulta-calendario-leilao.
- `raw/agenda_extra.txt`: os outros estados, mantidos à mão.
  - Faça 3–4 buscas na web por "leilão Detran" do mês corrente e do seguinte (DF, SP, PR, SC, GO, PE, CE, AL, SE, PB, RN, PI, MA, PA, AM, ES, RJ, MS, MT, TO, AC, RO).
  - Acrescente uma linha por leilão novo com data futura e dados oficiais (data, cidades, nº de lotes, leiloeiro, site). Não repita o que já existe. Formato no topo do arquivo.

**Depois da coleta:**
1. `python3 build.py <data de hoje>`.
2. Abra o HTML gerado num navegador headless e confira que a lista mostra lotes e que não há erro no console.
3. Grave `radar-leiloes.html`, `relatorio.txt` e os arquivos novos de `raw/` de volta nesta pasta do computador.

**Regras:**
- Só páginas públicas, sem login.
- Respeite limites dos sites: se aparecer HTTP 429 ou bloqueio, pare aquela fonte e mantenha os dados antigos.
- Não use APIs internas não documentadas.
- Se o Chrome não estiver disponível, não faça nada e registre isso em `relatorio.txt`.
