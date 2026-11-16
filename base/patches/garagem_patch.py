# Garagem privada (só ativa dentro do artefato do Claude). Rodar depois de local_patch.py.
p = 'base/template.html'
t = open(p, encoding='utf-8').read()
js = open('garagem.js', encoding='utf-8').read()
anchor = "\nfit();renderAll();renderAgenda();show('opo');locLabel();openFromHash();"
assert anchor in t
t = t.replace(anchor, "\n" + js + anchor, 1)
css = """
.gk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
.gk>div{background:var(--bg,#F3F5F7);border-radius:12px;padding:10px}.gk span{display:block;font-size:12px;color:var(--mut,#5b6675)}.gk b{display:block;font-size:20px;margin:2px 0}.gk small{font-size:11.5px;color:var(--mut,#5b6675)}
.neg{color:#D63A2F}.pos{color:#0B8A63}
.gchips{display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}.gchips::-webkit-scrollbar{display:none}
.gchips button{flex:none;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 12px;font-size:13px;color:var(--ink)}.gchips button i{font-style:normal;opacity:.6;margin-left:3px}
.gchips button.on{background:var(--navy,#14284B);color:#fff;border-color:var(--navy,#14284B)}
.gact{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.gact .btn{flex:1 1 auto;width:auto;margin:0}
.btn.g{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.gcard{display:flex;gap:12px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:14px;margin:8px 0;background:var(--card);cursor:pointer}
.gcard:hover{border-color:var(--navy2,#2F4C80)}.gi{position:relative;flex:none;width:64px;height:64px;border-radius:10px;display:grid;place-items:center;font-size:26px;overflow:hidden;color:#fff}
.gi img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.gb{min-width:0;flex:1}.gt{font-weight:700;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm{font-size:12.5px;color:var(--mut,#5b6675);margin:2px 0}.gl{font-size:13px}.gl b.ok{color:#0B8A63}.gl b.warn{color:#B8860B}.gl b.bad{color:#D63A2F}
.gs{flex:none;color:#fff;font-size:11.5px;font-weight:700;border-radius:999px;padding:4px 9px;white-space:nowrap}
#gTitle{outline:none;border-bottom:1px dashed transparent}#gTitle:focus{border-bottom-color:var(--line)}
.gsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-radius:14px;padding:12px;margin:10px 0;background:#EEF1F5;border:2px solid #C9D0DA}
.gsum.ok{background:#E8F6F0;border-color:#0B8A63}.gsum.warn{background:#FFF6DD;border-color:#F5B800}.gsum.bad{background:#FDECEA;border-color:#D63A2F}
.gsm span{display:block;font-size:11.5px;color:var(--mut,#5b6675)}.gsm b{display:block;font-size:18px;margin:2px 0}.gsm small{font-size:11px;color:var(--mut,#5b6675)}
.gsec{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:10px 0;background:var(--card)}.gsec>summary{font-weight:700;cursor:pointer;display:flex;justify-content:space-between;gap:8px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gf{display:block;margin:6px 0}.gf>span{display:block;font-size:12px;color:var(--mut,#5b6675);margin-bottom:3px}
.gf input,.gf select,.gf textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:9px;padding:9px 10px;font:inherit;font-size:15px;background:var(--card);color:var(--ink)}
.gf.row{display:grid;grid-template-columns:1fr 110px 26px;align-items:center;gap:6px}.gf.row>span{margin:0;font-size:13px;color:var(--ink)}.gf.row em{font-style:normal;font-size:12px;color:var(--mut,#5b6675)}
.chk{display:grid;gap:6px;margin:8px 0}.ck{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13.5px}
.ckb{display:flex;gap:4px;flex:none}.ckb button{border:1px solid var(--line);background:var(--card);border-radius:8px;padding:6px 9px;font-size:12.5px;color:var(--ink)}
.ckb button.on.ok{background:#0B8A63;color:#fff;border-color:#0B8A63}.ckb button.on.atencao{background:#F5B800;color:#14284B;border-color:#F5B800}.ckb button.on.ruim{background:#D63A2F;color:#fff;border-color:#D63A2F}
.gfotos{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.gph{position:relative;aspect-ratio:1;border-radius:9px;overflow:hidden;background:#E5E9EF}
.gph img{width:100%;height:100%;object-fit:cover}.gph button{position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:12px}
.gup{cursor:pointer;text-align:center}
.gia{background:#F4F1FB;border:1px solid #D9CFF2;border-radius:10px;padding:8px 12px;margin:8px 0;font-size:13.5px;line-height:1.45}.gia p{margin:4px 0}
.grep{display:grid;grid-template-columns:1fr 78px 78px 30px;gap:6px;margin:6px 0;align-items:center}
.grep input{border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:14px;min-width:0;background:var(--card);color:var(--ink)}
.grep button{border:0;background:none;color:var(--mut,#5b6675);font-size:15px}.grep small{grid-column:1/-1;font-size:11.5px;color:var(--mut,#5b6675);margin-top:-3px}
#gReais .grep{grid-template-columns:1fr 84px 128px 30px}
@media (max-width:420px){.gk b{font-size:17px}.gsum{grid-template-columns:1fr 1fr}.gsum .gsm:last-child{grid-column:1/-1}.ck{flex-direction:column;align-items:flex-start}#gReais .grep{grid-template-columns:1fr 84px 30px}#gReais .grep input[type=date]{grid-column:1/3}}
"""
t = t.replace('</style>', css + '</style>', 1)
open(p, 'w', encoding='utf-8').write(t)
print('garagem ok')
