// Radar de Leilões · função "vistoria": recebe dados + fotos de um veículo e pede a análise à IA da Anthropic.
// Segredo necessário (Edge Functions > Secrets): ANTHROPIC_API_KEY. SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem.
// Proteções: só garagens existentes; no máximo LIMITE_DIA análises por garagem por dia.
const LIMITE_DIA = 40;
const MODELO = "claude-sonnet-5-5";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-garage-key, apikey, authorization", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "método" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!, svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ erro: "A chave da IA ainda não foi configurada no Supabase." }, 503);
  const space = req.headers.get("x-garage-key") || "";
  const H = { apikey: svc, Authorization: `Bearer ${svc}`, "content-type": "application/json" };
  // garagem existe?
  const ok = await fetch(`${url}/rest/v1/rpc/space_exists`, { method: "POST", headers: H, body: JSON.stringify({ k: space }) }).then(r => r.json()).catch(() => false);
  if (ok !== true) return json({ erro: "Link da garagem inválido." }, 403);
  // limite diário
  const hoje = new Date().toISOString().slice(0, 10);
  const uso = await fetch(`${url}/rest/v1/ia_uso?space=eq.${encodeURIComponent(space)}&dia=eq.${hoje}&select=n`, { headers: H }).then(r => r.json()).catch(() => []);
  const n = (uso && uso[0] && uso[0].n) || 0;
  if (n >= LIMITE_DIA) return json({ erro: `Limite de ${LIMITE_DIA} análises por dia atingido.` }, 429);
  await fetch(`${url}/rest/v1/ia_uso`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ space, dia: hoje, n: n + 1 }) });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.prompt !== "string") return json({ erro: "pedido inválido" }, 400);
  // fotos: só do nosso bucket, desta garagem, até 8
  const pref = `${url}/storage/v1/object/public/fotos/${space}/`;
  const fotos: string[] = (Array.isArray(body.fotos) ? body.fotos : []).filter((u: string) => typeof u === "string" && u.startsWith(pref)).slice(0, 8);
  const imgs = [];
  for (const u of fotos) {
    const r = await fetch(u); if (!r.ok) continue;
    const buf = new Uint8Array(await r.arrayBuffer()); let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    imgs.push({ type: "image", source: { type: "base64", media_type: r.headers.get("content-type") || "image/jpeg", data: btoa(s) } });
  }
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODELO, max_tokens: 2000, messages: [{ role: "user", content: [...imgs, { type: "text", text: String(body.prompt).slice(0, 12000) }] }] }),
  });
  const out = await resp.json().catch(() => null);
  if (!resp.ok) return json({ erro: (out && out.error && out.error.message) || "A IA não respondeu." }, 502);
  const text = (out.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  const m = text.match(/\{[\s\S]*\}/);
  try { return json({ ok: true, fotos: imgs.length, resultado: JSON.parse(m ? m[0] : text) }); }
  catch { return json({ erro: "Resposta da IA veio fora do formato. Tente de novo." }, 502); }
});
