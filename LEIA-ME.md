# Radar de Leilões — kit de atualização

O app fica no ar em https://julio8794.github.io/radar-leiloes/. O `index.html` também abre com dois cliques, offline.

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
   `document.body.innerHTML='<pre id=o></pre>';document.getElementById('o').textContent='INICIO\n'+__R.join('\n')+'\nFIM';__R.length`
5. Chame `get_page_text` com `max_chars` grande (ex.: 5000000). O texto vai para um arquivo em /tmp.
6. Rode `python3 grab.py <arquivo> raw/<fonte>.txt`. Só substitua o arquivo de `raw/` se a coleta vier com volume razoável (veja a tabela).

| fonte (arquivo em raw/) | página onde rodar | script | volume esperado |
|---|---|---|---|
| caixa.txt | https://venda-imoveis.caixa.gov.br/sistema/busca-imovel.asp | scrapers/caixa.js | ~20–25 mil |
| superbid.txt | https://www.superbid.net/todas-categorias | scrapers/superbid.js (leva ~6–10 min) | ~12–14 mil |
| mega.txt | https://www.megaleiloes.com.br/ | scrapers/mega.js | ~800–1.500 |
| leilaoimovel.txt | https://www.leilaoimovel.com.br/ | scrapers/leilaoimovel.js (lento de propósito, ~3 min) | ~1.000–1.300 |
| detranba.txt | https://www.nordesteleiloes.com.br/comitentes/33e04b87-556f-4b2d-bcba-0310641430ea | scrapers/detranba.js (espera a página carregar; ~1 s por página) | centenas a milhares |

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
1. `python3 build.py <data de hoje>` (gera `radar-leiloes.html` e `relatorio.txt`).
2. `cp radar-leiloes.html index.html`.
3. Abra o `index.html` num navegador headless (Playwright em /opt/npm-tools/node_modules/playwright, Chrome em /usr/bin/google-chrome). Confira que a lista mostra lotes e que não há erro no console.
4. Faça o commit de `index.html`, `relatorio.txt` e dos arquivos novos de `raw/`, e o push para `main`. O GitHub Pages publica sozinho em ~1 minuto em https://julio8794.github.io/radar-leiloes/
   - Não envie `radar-leiloes.html`: está no .gitignore e é cópia do index.

**Regras:**
- Só páginas públicas, sem login.
- Respeite limites dos sites: se aparecer HTTP 429 ou bloqueio, pare aquela fonte e mantenha os dados antigos.
- Não use APIs internas não documentadas.
- Se o Chrome não estiver disponível, não faça nada e registre isso em `relatorio.txt`.
