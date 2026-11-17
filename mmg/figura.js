/* ============================================================
   OSTEO HELP MMG — vista a figura del paziente
   Il paziente è una figura con punti da toccare («indizi»): ogni punto apre
   la parte della scheda da compilare; i dati che contano restano in evidenza;
   alla fine «Decidi la terapia» propone la scelta, con gli avvisi.
   Usa gli stessi dati e gli stessi motori della scheda a passi (app.js).
   ============================================================ */

/* figure: immagine, viso per l'elenco, punti (in % dell'immagine) */
const FIGURE = {
  "donna-giovane": { alt:"Donna giovane", testa:[57, 7],  busto:[58, 58], fx:[30, 72] },
  "donna-anziana": { alt:"Donna anziana", testa:[50, 5],  busto:[62, 52], fx:[44, 78] },
  "donna-polso":   { alt:"Donna anziana con il polso ingessato", testa:[50, 5], busto:[66, 44], fx:[52, 63], fxLbl:"Il polso" },
  "donna-vertebre":{ alt:"Donna anziana con il busto ortopedico per una frattura vertebrale", testa:[50, 4], busto:[27, 58], fx:[62, 74], fxLbl:"Le vertebre" },
  "donna-femore":  { alt:"Donna anziana in carrozzina dopo una frattura di femore", testa:[40, 4], busto:[57, 40], fx:[62, 63], fxLbl:"Il femore" },
  "uomo-polso":    { alt:"Uomo anziano con il polso immobilizzato", testa:[50, 4], busto:[70, 46], fx:[44, 70], fxLbl:"Il polso" },
  "uomo-vertebre": { alt:"Uomo anziano con il busto ortopedico per una frattura vertebrale", testa:[50, 4], busto:[24, 58], fx:[62, 74], fxLbl:"Le vertebre" },
  "uomo-giovane":  { alt:"Uomo giovane", testa:[50, 6],  busto:[58, 56], fx:[26, 70] },
  "uomo-anziano":  { alt:"Uomo anziano", testa:[50, 6],  busto:[58, 58], fx:[27, 72] },
  "uomo-femore":   { alt:"Uomo anziano in carrozzina, con frattura di femore", testa:[36, 4], busto:[44, 44], fx:[78, 23], fxLbl:"Il femore" }
};
function figOf(p){
  if(!p.sesso) return null;
  const age = ageOf(p.nascita), old = age === null || age >= 60, fx = (p.fratture || []).slice().sort(byDateDesc);
  const recent = sede => fx.some(f => f.sede === sede && (monthsSince(f.data) ?? 999) <= 24);
  /* frattura recente (24 mesi), dalla più grave: femore, vertebre, polso */
  const sx = p.sesso === "uomo" ? "uomo" : "donna";
  if(recent("femore")) return sx + "-femore";
  if(old && recent("vertebra")) return sx + "-vertebre";
  if(old && recent("polso")) return sx + "-polso";
  return sx + (old ? "-anziano" : "-giovane").replace("anziano", sx === "donna" ? "anziana" : "anziano");
}
const figViso = p => { const f = figOf(p); return f ? `img/${f}-viso.jpg` : null; };

/* stato della vista: quale riquadro è aperto */
const FIG = { open:null, anim:false };
const FIG_SHEETS = {
  chi:   { t:"Chi è", ic:"👤", k:"dati", body: p => datiAnag(p) + `<p class="lbl">Note</p><textarea class="area" data-pf="note" rows="3" placeholder="Note libere">${hx(p.note)}</textarea>` },
  fx:    { t:"Le fratture", ic:"🦴", k:"fratture", body: p => datiFx(p) },
  anam:  { t:"Malattie e farmaci", ic:"💊", k:"anamnesi", body: p => noHead(vPazAnamnesi(p).html) },
  esami: { t:"Esami del sangue", ic:"🧪", k:"esami", body: p => noHead(vPazEsami(p).html) },
  dxa:   { t:"Densitometria", ic:"🩻", k:"dxa", body: p => noHead(vPazDxa(p).html) },
  defra: { t:"DeFRA", ic:"🎯", k:"defra", body: p => noHead(vPazDefra(p).html) },
  sec:   { t:"Osteoporosi secondaria", ic:"⚠️", k:"anamnesi", body: p => { const S = pzSecondary(p), G = secGroups(p, S);
    const SRC = { anam:"da malattie e farmaci", esami:"compatibile con gli esami" };
    return (G.length ? G.map(([l, xs]) => `<div class="seclev sl${l}"><p class="lbl">${SEC_LEV[l].t}</p><p class="small">${SEC_LEV[l].s[0].toUpperCase() + SEC_LEV[l].s.slice(1)}.</p><div class="stack">${xs.map(x => `<a class="entry" href="${x.href}" target="_blank" rel="noopener"><div><b>${x.nome}</b><small>${SRC[x.src]}${x.riv ? " · da rivedere se possibile" : ""}</small></div>${CHEV}</a>`).join("")}</div></div>`).join("")
      : `<p class="hint">Nessuna forma secondaria.</p>`) +
      `<div class="btns"><button type="button" class="btn sec" data-fsheet="anam">Malattie e farmaci</button><button type="button" class="btn sec" data-fsheet="esami">Esami del sangue</button></div>`; } },
  storico:{ t:"Controlli nel tempo", ic:"📈", k:"storico", body: p => noHead(vPazStorico(p).html) },
  /* su PC la decisione si apre nel pannello di destra; sul telefono resta la sua pagina */
  decidi:{ t:"Decidi la terapia", ic:"⚖️", k:"terapia", body: p => { const v = vDecidi(p, true); return v.redirect !== undefined ? `<div class="alert info"><b>Serve prima la zona del DeFRA</b>La proposta di terapia parte dalla zona di rischio: inseriscila nel passo DeFRA.</div><div class="btns"><button type="button" class="btn" data-fsheet="defra">Vai al DeFRA</button></div>` : v.html; } }
};
const noHead = h => h.replace(/^\s*<h1>[\s\S]*?<div class="rule"><\/div>/, "");

/* ---------- cosa resta in evidenza ---------- */
function figChips(p, F, S, done){
  /* poche cose, in ordine di importanza: al massimo 3 riquadri (uno grande se c'è un rischio da segnalare),
     il resto in una riga «altri dati» che si apre solo se serve */
  const c = [], add = (cls, lbl, val, short) => c.push({ cls, lbl, val, short: short || val }), ci = p.ci || {}, eg = num(p.egfr), vd = num(p.vitd);
  if(S.hpp) add("r", "Attenzione", "No bisfosfonati", "ALP bassa: no bisfosfonati");
  else if(ci.esofago) add("r", "Attenzione", "No bisfosfonati orali");
  else if(eg !== null && eg < 35) add("r", "Attenzione", "eGFR " + fmtN(eg, 0), "eGFR " + fmtN(eg, 0) + " mL/min");
  if(ci.cv || F.feats.has("ictus_emiplegia")) add("a", "", "", "no romosozumab");
  if(ci.tev) add("a", "", "", "no raloxifene");
  if(vdLow(vd)) add("a", "", "", "vitamina D " + vdTxt(vd));
  const nA = S.N.note.length + S.N.sosp.length, nE = S.A.forms.length;
  /* a caso completo cause secondarie e glucocorticoidi sono già sulla figura */
  if(!done && (nA || nE)) add("a", "", "", plural(nA + nE, "forma secondaria", "forme secondarie"));
  if(!done && F.gc) add("a", "", "", "glucocorticoidi");
  if(ci.denti) add("a", "", "", "visita odontoiatrica");
  if(!c.length) return "";
  const main = c.filter(x => x.lbl).slice(0, 3), rest = c.filter(x => !main.includes(x));
  const big = main.length === 3 && main[0].cls === "r" && main[0].lbl.startsWith("Rischio");
  const tile = (x, cls, st) => `<div class="fev-i ${cls} ${x.cls}"${st ? ` style="${st}"` : ""}><small>${x.lbl}</small><b>${x.val}</b></div>`;
  let h = `<div class="fmos">` + main.map((x, k) => big ? tile(x, k ? "lv2" : "lv3", k ? "grid-column:span 1" : "grid-row:span 2") : tile(x, "lv2", main.length === 3 && k === 2 ? "grid-column:span 2" : main.length === 1 ? "grid-column:span 2" : "")).join("") + `</div>`;
  if(rest.length) h += `<p class="fmore"><span>Inoltre:</span> ${rest.map(x => x.short).join(" · ")}</p>`;
  return h;
}

/* ---------- i punti sulla figura ---------- */
function figSpots(p, F, S){
  const anagMiss = !p.nascita || !p.sesso || !F.bmi || p.fam === null || (p.sesso === "donna" && p.postmeno === null);
  const st = k => stepStatus(p, k, F, S);
  const an = st("anamnesi"), ciOn = Object.values(p.ci || {}).some(Boolean);
  const sec = [...S.N.note, ...S.N.sosp].map(x => x.f.nome);
  return {
    chi: { n:1, st: anagMiss ? "miss" : "ok", t: anagMiss ? "Chi è" : (F.age + " anni"),
      s: anagMiss ? "età, peso, familiarità" : ["BMI " + fmtN(F.bmi), p.fam ? "familiarità" : ""].filter(Boolean).join(" · ") },
    fx: { n:2, st: p.rival && F.fx.length && !p.fxRiv ? "miss" : F.fx.length ? (F.recent.length ? "al" : "ok") : p.nessunaFx ? "ok" : "miss",
      t: F.fx.length ? (FX_SEDI[F.fx[0].sede] || "Frattura") + (F.fx[0].grado ? " " + F.fx[0].grado : "") + (F.fx.length > 1 ? " +" + (F.fx.length - 1) : "") : p.nessunaFx ? "Nessuna frattura" : "Le fratture",
      s: p.rival && F.fx.length && !p.fxRiv ? "nuove fratture?" : F.fx.length ? (F.recent.length ? "recente · " + fmtD(F.fx[0].data) : fmtD(F.fx[0].data)) : p.nessunaFx ? "da fragilità" : "quando, dove, come" },
    anam: { n:3, st: an.st === "miss" ? "miss" : (sec.length || ciOn ? "al" : "ok"), t: an.st === "miss" ? "Malattie e farmaci" : sec.length ? plural(sec.length, "causa secondaria", "cause secondarie") : ciOn ? "Controindicazioni" : (p.anamMuta && !anamHas(p) ? "Anamnesi muta" : "Anamnesi completa"),
      s: an.st === "miss" ? "incolla dal gestionale" : sec.length ? sec[0] : ciOn ? "da conoscere per la terapia" : "nessuna forma secondaria" }
  };
}
/* caso completo: tutti gli indizi raccolti (dati, fratture, anamnesi, DXA, DeFRA) */
const figDone = (F, spots) => !Object.values(spots).some(x => x.st === "miss") && !!F.zona && !!F.lastDxa;
/* a caso completo restano sulla figura solo i dati che contano, tutti nello stesso modo */
function figSummary(p, F, S){
  /* lati fissi: a sinistra la fragilità, a destra cause, esami e controindicazioni; in basso, più grande di tutti, il DeFRA.
     Colore = gravità: rosso serio, ambra attenzione, verde rassicurante, viola neutro. */
  const sx = [], dx = [], pill = (arr, k, cls, c, b, sm, aria) => arr.push(`<button type="button" class="fbd ${cls}" data-fsheet="${k}" aria-label="${hx(aria || b + ": " + sm)}"><span class="fbd-c">${c}</span><span class="fbd-t"><b>${hx(b)}</b><small>${hx(sm)}</small></span></button>`);
  const ci = p.ci || {}, eg = num(p.egfr), vd = num(p.vitd);
  /* si legge dall'alto a sinistra in giù, poi dall'alto a destra in giù:
     sinistra = la fragilità (T-score, fratture, familiarità, BMI basso);
     destra = ciò che la spiega o va sistemato prima (forme secondarie, esami del sangue) e ciò che limita la terapia (controindicazioni, dentista) */
  const d = F.lastDxa, sites = [["colonna", d.tL], ["femore", d.tFt], ["collo femore", d.tFn]].map(([n, v]) => [n, num(v)]).filter(x => x[1] !== null).sort((a, b) => a[1] - b[1]);
  if(sites.length){ const [n, v] = sites[0], c = tsCat(v); pill(sx, "dxa", "t-" + c[0], fmtN(v), "T-score " + n, c[1].toLowerCase() + (F.dxaAge > 24 ? " · " + d.data.slice(0, 4) : ""), "T-score peggiore " + n + " " + fmtN(v) + ", " + c[1].toLowerCase()); }
  /* una frattura: sede e data; più fratture: «Fratture multiple», le sedi su una riga, si apre l'elenco con le date */
  const fxNome = f => (FX_SEDI[f.sede] || "Frattura") + (f.grado ? " " + f.grado : "");
  if(F.fx.length === 1){ const f = F.fx[0], rec = F.recent.length;
    pill(sx, "fx", rec ? "k-r" : "k-a", "1", fxNome(f), (rec ? "recente · " : "") + fmtD(f.data), "Frattura: " + fxNome(f) + ", " + fmtD(f.data)); }
  else if(F.fx.length > 1){ const rec = F.recent.length, sedi = [...new Set(F.fx.map(f => (FX_SEDI[f.sede] || f.sede).split(" / ")[0]))];
    sx.push(`<button type="button" class="fbd ${rec ? "k-r" : "k-a"} fsec-b" data-fsheet="fx" aria-label="${hx(F.fx.length + " fratture: " + F.fx.map(f => fxNome(f) + " " + fmtD(f.data)).join(", ") + ". Apri l'elenco")}"><span class="fbd-c">${F.fx.length}</span><span class="fbd-t"><b>Fratture multiple</b><small>${hx((rec ? "1 recente · " : "") + sedi.join(" · "))}</small></span><span class="fbd-o" aria-hidden="true">›</span></button>`); }
  else pill(sx, "fx", "k-ok", "0", "Nessuna frattura", "da fragilità");
  if(p.fam) pill(sx, "chi", "k-a", "Sì", "Familiarità", "fratture nei genitori");
  else if(p.fam === false) pill(sx, "chi", "k-ok", "No", "Familiarità", "nessuna nei genitori");
  /* età e sesso sono già sotto il nome: sulla figura resta solo il BMI se è basso */
  if(F.bmi && F.bmi < 20) pill(sx, "chi", "k-a", fmtN(F.bmi), "BMI basso", "sotto 20 kg/m²", "BMI " + fmtN(F.bmi) + ", basso");
  const sec = [...new Set([...S.N.note.map(x => x.f.nome), ...S.N.sosp.map(x => x.f.nome), ...S.A.forms.map(x => COND[x.cid]), ...(ci.irc ? [COND.irc] : [])])];
  const short = n => { const t = n.replace(/^Osteoporosi (indotta )?da /i, ""); return t.charAt(0).toUpperCase() + t.slice(1); };
  /* osteoporosi secondaria: un solo bollino con il numero e i nomi; toccandolo si aprono sotto le singole forme, ognuna porta alla sezione da modificare */
  const nm2 = n => /^Farmaci \(/.test(n) ? "Farmaci " + n.replace(/^Farmaci \((.*)\)$/, "$1") : short(n).replace(/\s*\(.*\)$/, "").replace(/ \/ .*$/, "");
  const G = secGroups(p, S);
  if(sec.length){ const op = !!FIG.secOpen, top = G.length ? G[0][0] : 3;
    dx.push(`<button type="button" class="fbd k-${SEC_LEV[top].k} fsec-b" data-secopen aria-expanded="${op}" aria-label="${hx(plural(sec.length, "condizione", "condizioni") + " di osteoporosi secondaria: " + sec.join(", ") + (op ? ". Chiudi" : ". Apri"))}"><span class="fbd-c">${sec.length}</span><span class="fbd-t"><b>Osteoporosi secondaria</b><small>${hx(G.length ? G[0][1].length + " " + SEC_LEV[top].t.toLowerCase() + (G.length > 1 ? " · altre " + (sec.length - G[0][1].length) : "") : "")}</small></span></button>`);
    if(op) G.forEach(([l, xs]) => { const src = [...new Set(xs.map(x => x.src))], k = src.length === 1 ? src[0] : "sec";
      dx.push(`<button type="button" class="fbd fsub sec sl${l}" data-fsheet="${k}" aria-label="${hx(SEC_LEV[l].t + ": " + xs.map(x => x.nome).join(", ") + ". Apri")}"><span class="fbd-t"><b>${SEC_LEV[l].t}</b><small>${hx(xs.map(x => nm2(x.nome)).join(", "))}</small></span></button>`); }); }
  const es = stepStatus(p, "esami", F, S), ls = labStatus(p);
  if(es.st === "miss") pill(dx, "esami", "miss", "?", "Esami del sangue", ls.done + " di " + ls.tot + " inseriti");
  else if(vdLow(vd) || es.st === "warn") pill(dx, "esami", "k-a", "!", "Esami del sangue", vdLow(vd) ? "vitamina D " + vdTxt(vd) : "da rivedere");
  else pill(dx, "esami", "k-ok", "✓", "Esami del sangue", "nella norma");
  /* controindicazioni: una sola pill con i motivi; toccandola si aprono sotto i farmaci da evitare e perché */
  const cig = [];
  if(S.hpp) cig.push(["esami", "fosfatasi alcalina bassa", "No bisfosfonati"]);
  else if(ci.esofago) cig.push(["anam", "esofago", "No bisfosfonati orali"]);
  if(ci.irc && eg === null) cig.push(["esami", "insufficienza renale", "Inserisci l'eGFR per le soglie dei farmaci"]);
  if(eg !== null && eg < 35) cig.push(["esami", "eGFR " + fmtN(eg, 0), eg < 30 ? "No bisfosfonati, teriparatide, abaloparatide" : "No alendronato e zoledronato"]);
  if(ci.cv || F.feats.has("ictus_emiplegia")) cig.push(["anam", "infarto o ictus", "No romosozumab"]);
  if(ci.tev) cig.push(["anam", "tromboembolismo", "No raloxifene e bazedoxifene"]);
  if(cig.length){ const op = !!FIG.ciOpen;
    dx.push(`<button type="button" class="fbd k-ci fsec-b" data-ciopen aria-expanded="${op}" aria-label="${hx(plural(cig.length, "controindicazione", "controindicazioni") + ": " + cig.map(x => x[1]).join(", ") + (op ? ". Chiudi" : ". Apri"))}"><span class="fbd-c">${cig.length}</span><span class="fbd-t"><b>Controindicazioni</b><small>${hx(cig.map(x => x[1]).join(" · "))}</small></span></button>`);
    if(op) cig.forEach(x => dx.push(`<button type="button" class="fbd fsub ci" data-fsheet="${x[0]}"><span class="fbd-t"><b>${hx(x[2])}</b><small>${hx(/^eGFR/.test(x[1]) ? x[1] + " mL/min" : x[1])}</small></span></button>`)); }
  if(ci.denti) pill(dx, "anam", "k-a", "!", "Visita odontoiatrica", "nulla osta alla terapia");
  /* il DeFRA, in grande */
  const z = F.zona, r = F.rischio;
  const big = `<button type="button" class="fdefra z-${z}" data-fsheet="defra" aria-label="DeFRA zona ${ZONE[z].t.toLowerCase()}${r !== null ? ", rischio di frattura a 10 anni " + fmtN(r, 0) + "%" : ""}"><span class="fdefra-c">${r !== null ? fmtN(r, 0) + "<i>%</i>" : "—"}</span><span class="fdefra-t"><small>DeFRA · rischio a 10 anni</small><b>Zona ${ZONE[z].t.toLowerCase()}</b><span>${ZONE[z].r}</span></span></button>`;
  return `<div class="fsum${(FIG.ciOpen && cig.length) || (FIG.secOpen && sec.length) ? " ciop" : ""}"><div class="fsum-c">${sx.join("")}</div><div class="fsum-c r">${dx.join("")}</div></div>${big}`;
}
const FIG_TREE = true;
function figStage(p, fig, spots, F, S){
  const d = FIGURE[fig], lblFx = d.fxLbl;
  const pos = { chi:d.testa, fx:d.fx, anam:d.busto };
  if(F && S && figDone(F, spots)) return `<div class="fstage done"${FIG.open && FIG.open !== "decidi" ? ` data-on="${FIG.open === "sec" ? "anam" : FIG.open}"` : ""}><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}"></div>${figSummary(p, F, S)}</div>`;
  /* caso in corso: i 7 passi sulla figura, in ordine. A sinistra il paziente (1 chi è, 2 fratture, 3 anamnesi),
     a destra gli esami (4 esami, 5 densitometria, 6 DeFRA), in basso, grande, 7 terapia: si legge come la strada */
  const on = FIG.open && FIG.open !== "decidi" ? ` data-on="${FIG.open === "sec" ? "anam" : FIG.open}"` : "";
  if(!F) return `<div class="fstage"${on}><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}"></div></div>`;
  const all = allSteps(p), nx = nextStep(all), ls = labStatus(p), es = stepStatus(p, "esami", F, S);
  const dxS = figSecSt(p, "dxa", F, S, spots), dfS = figSecSt(p, "defra", F, S, spots), esS = es.st === "miss" ? "miss" : es.st === "warn" ? "al" : "ok";
  const ms = F.lastDxa ? Math.min(...[F.lastDxa.tL, F.lastDxa.tFt, F.lastDxa.tFn].map(num).filter(v => v !== null)) : null;
  const ST = [
    ["dati", "chi", spots.chi.st, "Chi è", spots.chi.s],  /* età e sesso sono già sotto il nome */
    ["fratture", "fx", spots.fx.st, spots.fx.t, spots.fx.s],
    ["anamnesi", "anam", spots.anam.st, spots.anam.t, spots.anam.s],
    ["esami", "esami", esS, "Esami del sangue", es.st === "miss" ? ls.done + " di " + ls.tot + " inseriti" : es.st === "warn" ? "da rivedere" : "nella norma"],
    ["dxa", "dxa", dxS, "Densitometria", F.lastDxa && isFinite(ms) ? "T-score " + fmtN(ms) + " · " + tsCat(ms)[1].toLowerCase() : "T-score da inserire"],
    ["defra", "defra", dfS, "DeFRA", F.zona ? "zona " + ZONE[F.zona].t.toLowerCase() + (F.rischio !== null ? " · " + fmtN(F.rischio, 0) + "%" : "") : "zona da inserire"]
  ];
  const pillS = ([k, sh, st, t, sm], i) => { const isNx = nx && nx.k === k, cls = st === "ok" ? "k-ok" : st === "al" ? "k-a" : isNx ? "k-n nx" : "miss";
    return `<button type="button" class="fbd fstep ${cls}" data-fsheet="${sh}" aria-label="${hx("Passo " + (i + 1) + ": " + t + ", " + sm)}"><span class="fbd-c">${st === "ok" ? "✓" : st === "al" ? "!" : i + 1}</span><span class="fbd-t"><b>${hx(t)}</b><small>${hx(sm)}</small></span></button>`; };
  const ready = !all.slice(0, 6).some(x => x.st === "miss"), t7 = all[6];
  const terIn = `<span class="fter-c">${t7.st === "ok" ? "✓" : "7"}</span><span class="fter-t"><small>Passo 7 · terapia</small><b>${ready ? "Decidi la terapia" : "Terapia"}</b><span>${ready ? "zona e Nota 79 pronte" : "dopo i passi da 1 a 6"}</span></span>`;
  const ter = ready ? `<a class="fter on" href="#paz-${p.id}-decidi" aria-label="Passo 7: decidi la terapia">${terIn}</a>`
    : `<button type="button" class="fter" data-fsheet="${ST.find(x => x[2] === "miss")[1]}" aria-label="Passo 7: terapia, dopo i passi da 1 a 6">${terIn}</button>`;
  /* albero di Natale: i 6 punti sulla figura come all'inizio (pallino + etichetta), non collegati, dalla testa in giù
     a zig zag, sempre più aperti: 1 al centro sulla testa, poi sinistra e destra alternate. Ogni etichetta guarda verso il centro.
     (FIG_TREE = false: le due colonne di pill) */
  if(FIG_TREE){
    const POS = [[50, 12], [38, 24], [62, 36], [30, 48], [70, 60], [22, 72]];
    const dot = ([k, sh, st, t, sm], i) => { const [x, y] = POS[i], isNx = nx && nx.k === k, c = st === "ok" ? "ok" : st === "al" ? "al" : isNx ? "miss" : "later";
      return `<button type="button" class="fhs ${c}${x > 52 ? " l" : ""}" data-fsheet="${sh}" style="left:${x}%;top:${y}%" aria-label="${hx("Passo " + (i + 1) + ": " + t + ", " + sm)}"><span class="fdot">${st === "ok" ? "✓" : st === "al" ? "!" : i + 1}</span><span class="ftag"><b>${hx(t)}</b><small>${hx(sm)}</small></span></button>`; };
    return `<div class="fstage steps"${on}><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}">${ST.map(dot).join("")}</div>${ter}</div>`;
  }
  return `<div class="fstage steps"${on}><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}"></div>
    <div class="fsum"><div class="fsum-c">${ST.slice(0, 3).map(pillS).join("")}</div><div class="fsum-c r">${ST.slice(3).map((x, i) => pillS(x, i + 3)).join("")}</div></div>${ter}</div>`;
}
/* la prossima mossa: una sola cosa da fare, la più utile adesso */
function figNext(p, F, S, spots){
  const urg = pzTodo(p, F).find(x => x.u === 0 && !/^Frattura recente/.test(x.t));
  if(urg) return `<a class="fnext urg" href="${urg.href}"><small>Urgente</small><b>${urg.t}</b><span>${urg.s}</span></a>`;
  const ls = labStatus(p), clues = [
    ["chi", spots.chi.st === "miss", "Chi è", "età, peso e altezza, familiarità"],
    ["fx", spots.fx.st === "miss", "Le fratture", "sede e data delle fratture da fragilità"],
    ["anam", spots.anam.st === "miss", "Malattie e farmaci", "incolla il riassunto dal gestionale"],
    ["esami", ls.done < ls.tot, "Esami del sangue", `${ls.done} di ${ls.tot} esami di I livello`],
    ["dxa", !F.lastDxa, "Densitometria", "T-score di colonna e femore"],
    ["defra", !F.zona, "DeFRA", "calcola il rischio e riporta la zona"]
  ], miss = clues.filter(c => c[1]), dec = p.decisione && DECISIONI[p.decisione.tipo];
  if(dec){
    /* decisione presa: in primo piano il farmaco, poi due date grandi: prossima dose e prossima densitometria */
    const th = F.ther.find(t => nextDose(t)) || F.ther[0], nd = th && nextDose(th), d = th && DRUGS[th.farmaco], multi = F.ther.length > 1;
    const rivedi = `#paz-${p.id}-${th || p.decisione.tipo !== "mmg" ? "decidi" : "terapia"}`;
    const drug = th ? `<a class="fdrugbig go" href="${rivedi}" title="Rivedi la decisione e la terapia"><span class="fpill">${drugIcon(th.farmaco)}</span><span><b>${F.ther.map(t => dnome(t.farmaco).replace(/ \(.*\)$/, "")).join(" + ")}</b><small>${multi ? "in associazione" : d ? d.via.replace(/\.$/, "") : ""} · dal ${fmtD(th.inizio)}${p.decisione.tipo === "spec" ? " · indicato dallo specialista" : ""}</small>${supList(p).length ? `<small>con ${hx(supTxt(p).charAt(0).toLowerCase() + supTxt(p).slice(1))}</small>` : ""}${F.ther.some(t => t.farmaco === D_) ? `<small class="freb-in"><b>Rebound:</b> non sospendere né ritardare le dosi; se si interrompe serve un bisfosfonato.</small>` : ""}</span>${CHEV}</a>`
      : p.decisione.tipo === "spec" ? `<a class="fdrugbig spec go" href="#paz-${p.id}-decidi"><span class="fpill">🩺</span><span><b>Inviato allo specialista</b><small>Tocca per registrare la terapia indicata dallo specialista</small></span>${CHEV}</a>`
      : p.decisione.tipo === "mmg" ? `<a class="fdrugbig reg go" href="#paz-${p.id}-terapia"><span class="fpill">💊</span><span><b>Farmaco da registrare</b><small>Tocca per indicare il farmaco e la data di inizio</small></span>${CHEV}</a>`
      : p.decisione.tipo === "nessuno" ? `<a class="fdrugbig none${supList(p).length ? " sup" : ""} go" href="#paz-${p.id}-terapia" title="Vitamina D e calcio"><span class="fpill"><svg class="dic" viewBox="0 0 48 48" aria-hidden="true">${DRUG_SVG[supList(p).length ? "sole" : "latte"]}</svg></span><span><b>${supList(p).length ? "Solo vitamina D e calcio" : "Nessun farmaco per l'osteoporosi"}</b><small>${supList(p).length ? hx(supTxt(p)) + (p.supDal ? " · dal " + fmtD(p.supDal) : "") : "Tocca per registrare vitamina D e calcio"}</small></span>${CHEV}</a>`
      : `<a class="fdrugbig none go" href="${rivedi}" title="Rivedi la decisione"><span class="fpill"><svg class="dic" viewBox="0 0 48 48" aria-hidden="true">${DRUG_SVG.latte}</svg></span><span><b>Decisione rimandata</b><small>in attesa di esami o accertamenti</small></span>${CHEV}</a>`;
    const MESI = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
    const quando = dt => { const g = daysTo(dt); return g < 0 ? `in ritardo di ${-g} giorni` : g === 0 ? "oggi" : g < 45 ? `tra ${g} giorni` : `tra ${Math.round(g / 30.4)} mesi`; };
    const cal = (cls, lbl, top, big, bot, rel, note, sh) => { const tg = sh ? "button" : "div"; return `<${tg}${sh ? ` type="button" data-fsheet="${sh}" title="Apri i controlli nel tempo"` : ""} class="fcal ${cls}"><small>${lbl}</small><div class="fcal-d"><span>${top}</span><b>${big}</b><span>${bot}</span></div><em>${rel}</em>${note ? `<i>${note}</i>` : ""}</${tg}>`; };
    const tiles = [];
    if(nd){ const late = daysTo(nd) < 0; tiles.push(cal(late ? "late" : "dose", "Prossima " + doseWord(th.farmaco), MESI[nd.getMonth()], nd.getDate(), nd.getFullYear(), quando(nd), late ? "farla al più presto" : th.farmaco === D_ ? "calcemia prima della dose" : "")); }
    if(F.lastDxa){ const ld = pDate(F.lastDxa.data), from = addMonths(ld, 18), to = addMonths(ld, 24), pl = dxaPlan(F);
      const okp = pl.st === "ok";
      tiles.push(cal(pl.st === "miss" ? "late" : pl.st === "warn" ? "now" : "dxa", "Prossima densitometria", okp ? "da" : "entro", MESI[(okp ? from : to).getMonth()], (okp ? from : to).getFullYear(), pl.st === "miss" ? "da fare subito" : pl.st === "warn" ? "da programmare ora" : quando(from), okp ? "finestra fino a " + MESI[to.getMonth()] + " " + to.getFullYear() : "ultima " + fmtD(F.lastDxa.data), "storico")); }
    else tiles.push(cal("late", "Prossima densitometria", "DXA", "?", "", "da richiedere", "nessuna registrata", "dxa"));
    /* decisione presa ma con dati ancora mancanti: lo si dice, e si va dritti a completarli */
    const mancano = allSteps(p).filter(x => x.st === "miss" && STEP_IX[x.k] <= STEP_IX.defra), RS = { dati:"chi", fratture:"fx", anamnesi:"anam", esami:"esami", dxa:"dxa", defra:"defra" };
    const avviso = mancano.length ? `<button type="button" class="fmiss" data-fsheet="${RS[mancano[0].k]}"><b>Da completare:</b> ${mancano.map(x => x.t.toLowerCase() + " (" + x.s.replace(/^Mancano?:\s*/, "") + ")").join("; ")} ›</button>` : "";
    return `<div class="fnext done"><small>${mancano.length ? "Decisione presa" : "Caso completato"} · ${dec.t.toLowerCase()} · ${fmtD(p.decisione.data)}</small>${avviso}${drug}<div class="fcals">${tiles.join("")}</div>
      <details class="frival"><summary>↻ Rivaluta il paziente<small>controllo periodico: nuova valutazione</small></summary><p>Per il controllo periodico. Restano fratture, densitometrie, DeFRA e terapie in corso; si rifanno la conferma delle nuove fratture, l'anamnesi, gli esami del sangue, il DeFRA e la decisione. La valutazione di oggi resta nei Controlli nel tempo.</p><button type="button" class="btn" data-rival>Inizia la rivalutazione</button></details></div>`;
  }
  if(miss.length && !F.zona || miss.length > 1) { const m = miss[0];
    return `<button type="button" class="fnext" data-fsheet="${m[0]}"><small>Prossimo passo da completare</small><b>${m[2]}</b><span>${m[3]}</span><em>Apri →</em></button>`; }
  return `<a class="fnext go" href="#paz-${p.id}-decidi"><small>${miss.length ? "Manca ancora: " + miss[0][2].toLowerCase() : "Dati completi"}</small><b>Decidi la terapia</b><span>La proposta tiene conto di zona, Nota 79 e controindicazioni</span><em>▶</em></a>`;
}
const figDocs = p => `<p class="fdocs"><button type="button" class="lnk" data-copy="riepilogo">Copia per la cartella</button><a href="#paz-${p.id}-lettera">Lettera allo specialista</a><a href="#paz-${p.id}-foglio">Foglio per il paziente</a><a href="#paz-${p.id}-report">Report</a></p>`;
/* le sezioni in ordine: si naviga con Indietro / Avanti; quella aperta si accende sulla figura */
const FIG_SEQ = ["chi", "fx", "anam", "esami", "dxa", "defra"];
const FIG_TAB = { chi:"Chi è", fx:"Fratture", anam:"Anamnesi", esami:"Esami", dxa:"DXA", defra:"DeFRA" };
const figWide = () => window.matchMedia("(min-width:744px) and (min-height:560px)").matches;
function figSecSt(p, k, F, S, spots){
  if(spots[k]) return spots[k].st === "miss" ? "miss" : spots[k].st === "al" ? "al" : "ok";
  if(k === "esami"){ const e = stepStatus(p, "esami", F, S).st; return e === "warn" ? "al" : e; }
  if(k === "dxa") return F.lastDxa ? (F.dxaAge > 24 ? "al" : "ok") : "miss";
  return stepStatus(p, "defra", F, S).st === "miss" ? "miss" : "ok";
}
function figSecInner(p, F, S, spots, wide){
  const k = FIG.open, sh = FIG_SHEETS[k], i = FIG_SEQ.indexOf(k === "sec" ? "anam" : k);
  /* su PC le sezioni sono già nella strada dei 7 passi, in mezzo: le schede servono solo sul telefono */
  const tabs = i < 0 || wide ? "" : `<div class="fstabs" role="tablist">${FIG_SEQ.map((x, j) => `<button type="button" role="tab" class="fstab ${figSecSt(p, x, F, S, spots)}" aria-selected="${j === i}" data-fsheet="${x}"><i></i>${FIG_TAB[x]}</button>`).join("")}</div>`;
  const prev = i > 0 ? `<button type="button" class="btn sec" data-fsheet="${FIG_SEQ[i - 1]}">‹ Indietro</button>` : k === "decidi" ? `<button type="button" class="btn sec" data-fsheet="defra">‹ DeFRA</button>` : `<span></span>`;
  const next = k === "decidi" ? "" : i < 0 ? `<button type="button" class="btn" data-fclose>Fatto</button>`
    : i < FIG_SEQ.length - 1 ? `<button type="button" class="btn" data-fsheet="${FIG_SEQ[i + 1]}">Avanti<small>${FIG_TAB[FIG_SEQ[i + 1]]}</small> ›</button>`
    : `<a class="btn" href="#paz-${p.id}-decidi">Decidi la terapia ›</a>`;
  return `<div class="fsheet-h"><span class="fic">${sh.ic}</span><span class="fsh-t">${k === "decidi" ? `<small>Passo 7 di ${STEPS.length}</small>` : i >= 0 ? `<small>Passo ${i + 1} di ${STEPS.length}</small>` : ""}<b>${sh.t}</b></span><button type="button" class="btn sec mini" data-fclose aria-label="Chiudi">${wide ? "Riepilogo" : "Chiudi"}</button></div>
    ${tabs}<div class="fsheet-b">${sh.body(p)}</div><div class="fsheet-f">${prev}${next}</div>`;
}
function figSheet(p, F, S, spots){
  if(!FIG_SHEETS[FIG.open] || figWide()) return "";
  /* l'animazione di apertura solo quando la scheda si apre, non a ogni aggiornamento o cambio di sezione */
  const a = FIG.anim ? " in" : "";
  return `<div class="fdim${a}" data-fclose></div><div class="fsheet${a}" role="dialog" aria-label="${FIG_SHEETS[FIG.open].t}"><div class="fgrab" aria-hidden="true"></div>${figSecInner(p, F, S, spots, false)}</div>`;
}

/* ---------- la vista ---------- */
function vFigura(p){
  const fig = figOf(p);
  if(!fig) return { bar: pzName(p), html: viewSwitch(p, "figura") + `<div class="fpick"><p class="flbl">Chi entra in ambulatorio?</p><div class="fpick-b">
      <button type="button" data-pset="sesso" data-val="donna"><img src="img/donna-anziana.jpg" alt=""><b>Una donna</b></button>
      <button type="button" data-pset="sesso" data-val="uomo"><img src="img/uomo-anziano.jpg" alt=""><b>Un uomo</b></button></div>
      <p class="small">Poi tocca i punti sulla figura per raccogliere gli indizi.</p></div>` };
  const F = pzFacts(p), S = pzSecondary(p), all = allSteps(p), done = all.filter(x => x.st !== "miss").length, spots = figSpots(p, F, S);
  const title = [hx(pzName(p)), F.age !== null ? F.age + " anni" : ""].filter(Boolean).join(", ");
  const panel = !!FIG_SHEETS[FIG.open] && figWide();
  return { bar: "", html: viewSwitch(p, "figura") + `
    <div class="fhud">
      <h1 class="fhud-n${p.nome && p.nome.trim() ? "" : " anon"}">${hx(pzName(p))}</h1>
      <div class="fhud-m">${p.rival && !p.decisione ? `<span class="fhud-c riv">Rivalutazione dal ${fmtD(p.rival.dal)}</span>` : ""}${p.sesso ? `<span class="fhud-c">${p.sesso === "donna" ? "Donna" : "Uomo"}</span>` : ""}${F.age !== null ? `<span class="fhud-c">${F.age} anni</span>` : ""}<span class="fhud-p" title="${done} di ${STEPS.length} passi completati" aria-label="${done} di ${STEPS.length} passi completati"><span class="proad" aria-hidden="true">${all.map(x => `<i class="${x.st}${nextStep(all) && x.i === nextStep(all).i ? " next" : ""}">${MARK[x.st] || x.i + 1}</i>`).join("")}</span></span></div>
    </div>
    <div class="fgrid${panel ? " panel" : ""}"><div class="fcol-l">${figStage(p, fig, spots, F, S)}</div>${figRoad(p, all)}
    <div class="fcol-r">${panel ? `<div class="fpanel" role="region" aria-label="${FIG_SHEETS[FIG.open].t}">${figSecInner(p, F, S, spots, true)}</div>` : `
      ${figNext(p, F, S, spots)}
      ${figDone(F, spots) ? "" : `<div class="fsec"><p class="flbl">In evidenza</p>${figChips(p, F, S, false) || `<p class="small">Ancora nulla: compaiono qui i dati che contano per la decisione.</p>`}</div>`}
      ${p.decisione ? `<div class="fsec"><p class="flbl">Documenti</p>${figDocs(p)}</div>` : ""}
      <p class="fdel"><button type="button" class="lnk" id="pzDel">Elimina paziente</button></p>`}
    </div></div>` + figSheet(p, F, S, spots) };
}
/* su PC, tra la figura e il pannello: la strada numerata dei 7 passi, come nel percorso a tappe */
const ROAD_SHEET = { dati:"chi", fratture:"fx", anamnesi:"anam", esami:"esami", dxa:"dxa", defra:"defra" };
function figRoad(p, all){
  const nx = nextStep(all), on = { chi:"dati", fx:"fratture", anam:"anamnesi", sec:"anamnesi", esami:"esami", dxa:"dxa", defra:"defra", storico:"storico", decidi:"terapia" }[FIG.open];
  return `<nav class="froad" aria-label="I 7 passi"><ol>${all.map(x => {
    const cls = [x.st, nx && x.i === nx.i ? "next" : "", on === x.k ? "on" : ""].filter(Boolean).join(" ");
    const inner = `<span class="pn">${MARK[x.st] || x.i + 1}</span><span class="frd-t"><b>${x.t}</b>${nx && x.i === nx.i ? `<small>prossimo</small>` : ""}</span>`;
    const lab = `Passo ${x.i + 1}: ${x.t}. ${x.s}`;
    if(x.k === "terapia" && !pzFacts(p).zona) return `<li class="${cls}"><button type="button" data-fsheet="defra" title="Per decidere la terapia serve prima la zona del DeFRA" aria-label="${hx(lab + " Serve prima la zona del DeFRA.")}">${inner}</button></li>`;
    return `<li class="${cls}">${ROAD_SHEET[x.k] ? `<button type="button" data-fsheet="${ROAD_SHEET[x.k]}" title="${hx(x.s)}" aria-label="${hx(lab)}">${inner}</button>` : `<a href="#paz-${p.id}-decidi" title="${hx(x.s)}" aria-label="${hx(lab)}">${inner}</a>`}</li>`; }).join("")}</ol></nav>`;
}
function viewSwitch(p, cur){ return "";
  return `<div class="vsw" role="group" aria-label="Vista"><a href="#paz-${p.id}-figura" aria-pressed="${cur === "figura"}">Figura</a><a href="#paz-${p.id}-percorso" aria-pressed="${cur === "percorso"}">Percorso a passi</a></div>`;
}

/* ---------- decisione terapeutica ---------- */
const REBOUND = `<div class="fwarn a reb"><b>Effetto rebound</b>: non interrompere né ritardare (una dose ogni 6 mesi, al massimo 4 settimane di ritardo). Alla sospensione il riassorbimento riparte in eccesso con rischio di fratture vertebrali multiple: se si sospende serve un bisfosfonato (di solito zoledronato) per consolidare. Da spiegare al paziente prima di iniziare.</div>`;
function proposta(p, F, S, fl){
  const okd = id => !(fl[id] && fl[id].ci.length);
  if(!F.zona) return null;
  /* sospetto morbo di Paget: l'unica terapia indicata è lo zoledronato endovena, qualunque sia la zona */
  if(S.A.forms.some(x => x.cid === "paget")) return { tipo:"mmg", paget:true, t: okd(Z_) ? "Sospetto morbo di Paget: zoledronato endovena" : "Sospetto morbo di Paget: zoledronato non utilizzabile",
    s:"Nel Paget l'unica terapia indicata è lo zoledronato endovena; gli altri farmaci per l'osteoporosi non lo sono e gli anabolici sono controindicati. Conferma il sospetto (fosfatasi alcalina ossea, scintigrafia, radiografie) e prescrivi lo zoledronato in struttura ospedaliera.", opz:[Z_], best: okd(Z_) ? Z_ : null };
  /* anabolico di I scelta nella Nota 79 (es. 3 o più fratture vertebrali o di femore: teriparatide): è la terapia consigliata,
     ma la prescrive lo specialista con piano terapeutico, quindi l'unica azione è l'invio */
  const n79a = nota79(p, F), anaI = [T_, ...(F.donna ? [AB_] : [])].filter(id => okd(id) && n79a.some(c => n79Lev(c, id) === "I"));
  /* se un'altra condizione della Nota dà di I scelta un farmaco che il MMG può prescrivere, l'anabolico resta un'alternativa (avviso sotto), non la proposta */
  const mmgI = [A_, R_, Z_, D_].some(id => okd(id) && n79a.some(c => n79Lev(c, id) === "I"));
  if(anaI.length && !mmgI) return { tipo:"spec", ana:true, t:"Terapia consigliata: " + dnome(anaI[0]), s:ZONE[F.zona].azione,
    opz:[T_, ...(F.donna ? [AB_, RO_] : [])].filter(id => id !== anaI[0] && n79a.some(c => c.s.some(l => l.includes(id)))), best: anaI[0] };
  if(F.zona === "verde") return { tipo:"nessuno", t:"Nessun farmaco per l'osteoporosi", s:ZONE.verde.azione, opz:[] };
  if(zoneHigh(F.zona)){
    const spec = [T_, ...(F.donna ? [AB_, RO_] : [])];
    return { tipo:"spec", t:"Invio allo specialista dell'osso" + (F.zona === "rossa" ? ", con priorità" : ""), s:ZONE[F.zona].azione, opz: spec, nota:"Cosa potrà valutare lo specialista" };
  }
  /* zona gialla: prima linea dal MMG. L'ordine segue la Nota 79: prima i farmaci di I scelta per la condizione
     del paziente (di solito alendronato, risedronato, zoledronato), poi quelli di II scelta (denosumab) */
  const n79 = nota79(p, F), lev = id => { const l = n79.map(c => n79Lev(c, id)).filter(Boolean).map(x => N79_LEV.indexOf(x)); return l.length ? Math.min(...l) : 9; };
  /* scelta del medico: dopo gli orali il denosumab, che il MMG prescrive da sé, poi lo zoledronato (solo in ospedale).
     Il livello di scelta della Nota (I, II) resta scritto su ogni farmaco */
  const base = [A_, R_, D_, Z_], ord = base.filter(id => lev(id) < 9).concat(base.filter(id => lev(id) === 9)), best = ord.find(okd);
  return { tipo:"mmg", t: best ? "Terapia consigliata: " + dnome(best) : "Nessun farmaco utilizzabile dal medico di medicina generale", s:ZONE.gialla.azione, opz: ord, best };
}
function vDecidi(p, inPanel){
  const F = pzFacts(p), S = pzSecondary(p), fl = drugFlags(p, F, S), n79 = nota79(p, F), pr = proposta(p, F, S, fl), fig = figOf(p), vh = veryHigh(p, F);
  if(!pr) return { redirect: "paz-" + p.id + "-figura" };
  const n79of = id => n79.filter(c => c.s.some(l => l.includes(id)));
  /* per ogni farmaco: la condizione della Nota in cui rientra e se è di I, II o III scelta */
  const n79txt = id => { const c = n79of(id); if(!c.length) return "Con i dati inseriti è fuori dalle condizioni della Nota 79.";
    const lv = c.map(x => N79_LEV.indexOf(n79Lev(x, id))), m = Math.min(...lv), cc = c.filter((x, i) => lv[i] === m), L = N79_LEV[m];
    return `<b>Nota 79 · ${L} scelta</b>: ${cc.map(x => x.cond).join(" / ")}` + (m > 0 ? `. <em>Solo dopo intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni ai farmaci di ${N79_LEV[m - 1]} scelta${[T_, AB_].some(x => cc.some(y => y.s[0].includes(x))) ? " (o alla fine del periodo massimo di teriparatide o abaloparatide)" : ""}.</em>` : "")
      + (cc.some(x => x.spec) && [T_, AB_, RO_].includes(id) ? (m > 0 ? " " : ". ") + "Piano terapeutico specialistico." : "") + (id === Z_ ? " Solo in struttura ospedaliera pubblica o convenzionata." : ""); };
  /* livello di scelta in breve, per l'etichetta del farmaco */
  const levTag = id => { const f = fl[id] || { ci:[] }; if(f.ci.length) return ["no", "controindicato"]; const c = n79of(id); if(!c.length) return ["out", "fuori Nota 79"];
    const m = Math.min(...c.map(x => N79_LEV.indexOf(n79Lev(x, id)))); return [m ? "l2" : "l1", N79_LEV[m] + " scelta"]; };
  /* farmaco: una riga (icona, nome, etichetta) che si apre sui dettagli */
  const drug = (id, open) => { const f = fl[id] || { ci:[], warn:[] }, ci = f.ci.length, [tc, tt] = levTag(id);
    return `<details class="dd${ci ? " no" : ""}"${open ? " open" : ""}><summary>${drugIcon(id)}<span class="dd-n"><b>${dnome(id).replace(/ \(.*\)$/, "")}</b><small>${sommOf(id)}${f.warn.length ? " · " + plural(f.warn.length, "cautela", "cautele") : ""}</small></span><em class="dtag ${tc}">${tt}</em></summary>
      <div class="dd-b"><small>${DRUGS[id].via}</small>
      ${f.ci.map(x => `<div class="fwarn">Controindicato: ${x}</div>`).join("")}${f.warn.map(x => `<div class="fwarn a">Cautela: ${x}</div>`).join("")}
      ${!ci ? `<div class="fn79">${n79txt(id)}</div>` : ""}${id === D_ ? REBOUND : ""}</div></details>`; };
  /* sotto il farmaco consigliato: perché è quello (condizione della Nota 79 e livello di scelta) e, se non è di I scelta, perché */
  const okd = id => !(fl[id] && fl[id].ci.length), nmL = id => dnome(id).replace(/ \(.*\)$/, "").toLowerCase();
  const andL = a => a.length > 1 ? a.slice(0, -1).join(", ") + " e " + a[a.length - 1] : a[0] || "";
  const whyBest = id => { const c = n79of(id);
    if(!c.length) return `<p class="dwhy out"><em>Fuori Nota 79</em>Con i dati inseriti il paziente non rientra in una condizione della Nota 79: il farmaco non sarebbe a carico del SSN. Verifica i dati o valuta l'invio allo specialista.</p>`;
    const lv = c.map(x => N79_LEV.indexOf(n79Lev(x, id))), m = Math.min(...lv), cc = c.filter((x, i) => lv[i] === m);
    let why = "";
    if(m > 0){ const first = [...new Set(cc.flatMap(x => x.s[0]))].filter(x => x !== id), no = first.filter(x => !okd(x)), si = first.filter(okd);
      const rs = [...new Set(no.flatMap(x => fl[x].ci))];
      if(no.length) why += ` La I scelta (${andL(no.map(nmL))}) è controindicata: ${rs.join("; ")}.`;
      if(si.includes(Z_)) why += " Lo zoledronato, anch'esso di I scelta, si fa solo in struttura ospedaliera: lo trovi tra le altre opzioni.";
      else if(si.length) why += ` Di I scelta restano ${andL(si.map(nmL))}: li trovi tra le altre opzioni.`; }
    if([T_, AB_, RO_].includes(id)) why += " La prescrive lo specialista con piano terapeutico: dal medico di medicina generale serve l'invio.";
    return `<p class="dwhy"><em>Nota 79 AIFA · ${N79_LEV[m]} scelta</em>${hx(cc.map(x => x.cond).join(" / "))}.${why}</p>`; };
  const pend = nota79Pend(p, F), PSTEP = { chi:"dati", fx:"fratture", anam:"anamnesi", defra:"defra", dxa:"dxa" };
  const ls = labStatus(p), vd = num(p.vitd), lab = p.lab || {}, eg = num(p.egfr);
  const chk = []; let nDo = 0;
  const c = (st, t, s) => { if(st === "w") nDo++; chk.push(`<div class="td ${st}"><i>${st === "ok" ? "✓" : st === "i" ? "i" : "!"}</i><span>${t}<small>${s}</small></span></div>`); };
  if(ls.done < ls.tot) c("w", "Completa gli esami di I livello", `${ls.done} di ${ls.tot}: servono a escludere le forme secondarie`);
  { const G = secGroups(p, S), g = l => (G.find(x => x[0] === l) || [, []])[1];
    if(g(0).length) c("w", "Urgenza medica", g(0).map(x => x.nome).join(", ") + ": invio urgente in ospedale");
    if(g(1).length) c("w", "Prima di trattare", g(1).map(x => x.nome).join(", "));
    if(g(2).length) c("i", "Da approfondire, intanto si può trattare", g(2).map(x => x.nome).join(", ")); }
  if(S.hpp) c("w", "Escludi l'ipofosfatasia", "fosfatasi alcalina bassa: bisfosfonati controindicati");
  if(vd === null && lab.D !== "norm") c("w", "Dosa la 25-OH-vitamina D", "sotto 75 nmol/L è rimborsabile (Nota 96) e va corretta prima di iniziare il farmaco");
  else if(vdLow(vd) || lab.D === "basso") c("w", "Correggi la vitamina D", (vd !== null ? vdTxt(vd) + ": " : "") + "sotto 75 nmol/L, il valore da raggiungere (Nota 96)");
  else c("ok", "Vitamina D adeguata", vd !== null ? vdTxt(vd) : "nella norma");
  if(pr.tipo !== "nessuno") p.dentista ? c("ok", "Visita odontoiatrica eseguita", "bocca in ordine") : c("w", "Visita odontoiatrica", "prima di bisfosfonati, denosumab o romosozumab");
  if(lab.Ca === "norm" && (eg === null || eg >= 35)) c("ok", "Calcemia" + (eg !== null ? " ed eGFR" : "") + " nella norma", [AUTO.Ca(p) ? AUTO.Ca(p).val : "", eg !== null ? fmtN(eg, 0) + " mL/min" : ""].filter(Boolean).join(" · ") || "dagli esami");
  else if(lab.Ca === "basso") c("w", "Correggi l'ipocalcemia", "prima di qualsiasi antiriassorbitivo");
  const cur = p.decisione && p.decisione.tipo;
  /* terapia indicata dallo specialista: un farmaco alla volta (cambiarlo chiude il precedente), più l'associazione teriparatide + denosumab */
  const specBlk = (() => {
    const on = F.ther.filter(t => !t.fine).map(t => t.farmaco), uomo = p.sesso === "uomo";
    const SOLO_DONNA = [I_, RX_, BZ_, AB_, RO_];
    const ids = [D_, Z_, A_, R_, I_, T_, AB_, RO_, RX_, BZ_].filter(id => !(uomo && SOLO_DONNA.includes(id)));
    const opts = ids.map(id => [id, dnome(id).replace(/ \(.*\)$/, ""), sommOf(id)]).concat([[T_ + "+" + D_, "Teriparatide + denosumab", "in associazione"]]);
    const cur = opts.find(o => o[0].split("+").sort().join("+") === on.slice().sort().join("+"));
    const btn = o => { const sel = cur && cur[0] === o[0], ic = o[0].includes("+") ? drugIcon(T_) : drugIcon(o[0]);
      return `<button type="button" class="fspec-b${sel ? " on" : ""}" data-fspec="${o[0]}"${sel ? " disabled" : ""}>${ic}<span><b>${o[1]}</b><small>${sel ? "in corso" : o[2]}</small></span></button>`; };
    const dt = `<label class="fld fspec-d">Inizio<input type="date" id="fspD" value="${todayISO()}"></label>`;
    const list = `<div class="fspec">${opts.map(btn).join("")}</div>${uomo ? `<p class="small">Nell'uomo non sono indicati romosozumab, abaloparatide, ibandronato, raloxifene e bazedoxifene.</p>` : ""}`;
    if(!on.length) return `<div class="fspecbox"><p class="fspec-t">Che terapia ha indicato lo specialista?</p><p class="small">Scegli il farmaco: si registra con la data di inizio e compaiono le date della prossima dose e della densitometria.</p>${dt}${list}</div>`;
    const tt = F.ther.filter(t => !t.fine);
    return `<div class="fspecbox"><p class="fspec-t">Terapia indicata dallo specialista</p>
      <div class="fspec-cur">${tt.map(t => `<div>${drugIcon(t.farmaco)}<span><b>${dnome(t.farmaco).replace(/ \(.*\)$/, "")}</b><small>dal ${fmtD(t.inizio)}</small></span></div>`).join("")}</div>
      <details class="fspec-ch"><summary>Lo specialista ha cambiato terapia</summary><p class="small">Scegli la nuova terapia: quella in corso si chiude alla data indicata, la nuova parte dallo stesso giorno.</p>${dt}${list}</details></div>`; })();
  let actions = "";
  if(pr.tipo === "mmg" && pr.best) actions = `<button type="button" class="btn" data-fdec="mmg:${pr.best}">Prescrivo ${dnome(pr.best).replace(/ \(.*\)$/, "").toLowerCase()}</button><button type="button" class="btn sec" data-fdec="spec">Invia allo specialista</button>`;
  else if(pr.tipo === "mmg") actions = `<button type="button" class="btn" data-fdec="spec">Invia allo specialista</button>`;
  else if(pr.ana) actions = `<button type="button" class="btn" data-fdec="spec">Invia allo specialista</button>`;
  else if(pr.tipo === "spec") actions = `<button type="button" class="btn" data-fdec="spec">Invia allo specialista</button><a class="btn sec" href="#paz-${p.id}-terapia">Imposto io la terapia</a>`;
  else actions = `<button type="button" class="btn" data-fdec="nessuno">Confermo: nessun farmaco</button><a class="btn sec" href="#paz-${p.id}-terapia">Valuto un farmaco</a>`;
  /* i fatti che contano, in una riga */
  const facts = [F.fx.length ? (FX_SEDI[F.fx[0].sede] || "Frattura").split(" / ")[0] + " " + fmtD(F.fx[0].data) : "nessuna frattura", F.minT !== null ? "T-score " + fmtN(F.minT) : "", F.rischio !== null ? "rischio " + fmtN(F.rischio, 0) + "%" : ""].filter(Boolean).join(" · ");
  const sec = (t, badge, body, open) => `<details class="dsec"${open ? " open" : ""}><summary><span>${t}</span>${badge ? `<em class="dbadge">${badge}</em>` : ""}</summary><div class="dsec-b">${body}</div></details>`;
  const others = pr.tipo === "mmg" ? pr.opz.filter(id => id !== pr.best) : pr.tipo === "spec" ? pr.opz : [];
  const best = (pr.tipo === "mmg" || pr.ana) && pr.best ? pr.best : null;
  return { bar:"Decisione terapeutica", html: `
    ${inPanel ? "" : `<div class="dhead"><span class="dav" style="background-image:url(img/${fig}-viso.jpg)"></span><span><b>${hx(pzName(p))}</b><small>${F.age !== null ? F.age + " anni · " : ""}${facts}</small></span></div>`}
    ${secLevels(p, S).some(x => x.lev === 0) ? `<div class="dvh-a urg"><b>Urgenza medica se il calcio è molto alto</b>Con calcio oltre 14 mg/dL o sintomi (confusione, poliuria, disidratazione) sospetta un'ipercalcemia maligna: invio urgente in ospedale per idratazione e bisfosfonato endovena (denosumab se la funzione renale è ridotta). La terapia dell'osteoporosi viene dopo.</div>` : ""}
    ${cur === "spec" ? specBlk : ""}
    <div class="dverd z-${F.zona}">
      <small class="dzone"><i></i>Zona ${ZONE[F.zona].t.toLowerCase()} del DeFRA</small>
      <b class="dtit">${pr.paget ? "Sospetto morbo di Paget" : best ? "Terapia consigliata" : pr.t}</b>
      ${best ? `<div class="dbest${pr.paget ? "" : " wn"}"><div class="dbest-r">${drugIcon(best)}<span><b>${dnome(best).replace(/ \(.*\)$/, "")}</b><small>${DRUGS[best].via.replace(/\.$/, "")}</small></span>${pr.paget ? `<em class="dtag ${levTag(best)[0]}">${levTag(best)[1]}</em>` : ""}</div>${!pr.paget ? whyBest(best) : ""}</div>${best === D_ ? `<p class="dreb"><b>Rebound:</b> mai sospendere o ritardare le dosi; se si interrompe serve un bisfosfonato.</p>` : ""}` : ""}
      ${pr.paget ? `<p class="dnote">${pr.s}</p>` : ""}
      ${pr.tipo === "spec" ? `<p class="dnote">La lettera allo specialista è già compilata. Nell'attesa: calcio, vitamina D, prevenzione delle cadute.</p>` : pr.tipo === "nessuno" ? `<p class="dnote">${ZONE.verde.azione}</p>` : ""}
      <div class="dact">${actions}</div>
      ${cur ? `<p class="dcur">Decisione registrata il ${fmtD(p.decisione.data)}: ${DECISIONI[cur].t.toLowerCase()}.</p>` : ""}
    </div>
    ${(() => { const r = pr.paget ? [] : vh.filter(x => !/zona rossa/i.test(x)); if(!r.length) return "";
      /* l'invio per un anabolico si propone solo se il paziente rientra nella Nota 79, e si dice per quale farmaco */
      if(pr.ana) return `<div class="dvh-a"><b>Rischio molto alto</b>${r.join("; ")}.</div>`;
      const A = n79Ana(p, F, fl, n79), nm = id => dnome(id).replace(/ \(.*\)$/, "");
      const okL = A.ok.map(x => `<li><b>${nm(x.id)}</b>${x.id === RO_ ? " (solo se non si possono seguire altri trattamenti efficaci)" : ""}<small>${hx(x.cond.join("; ").replace(/: solo se non è possibile seguire altri trattamenti efficaci.*$/, ""))}</small></li>`).join("");
      const noL = A.no.map(x => `<li class="ci"><b>${nm(x.id)}</b>: in Nota 79 ma controindicato<small>${hx(x.ci.join("; "))}</small></li>`).join(""); /* senza un anabolico in Nota non si parla di anabolici: resta solo il rischio */
      return A.ok.length ? `<div class="dvh-a ana"><b>Rischio molto alto</b>${r.join("; ")}.<p>Rientra nella Nota 79 per ${A.ok.map(x => nm(x.id)).join(" e ")}: valuta l'invio allo specialista per la prescrizione con piano terapeutico.</p><ul>${okL}${noL}</ul></div>`
        : `<div class="dvh-a"><b>Rischio molto alto</b>${r.join("; ")}: inizia la terapia senza ritardi.</div>`; })()}
    ${pend.length ? sec("Da completare per la Nota 79", pend.length, `<ul class="dpend">${pend.map(([k, t]) => `<li><a href="#paz-${p.id}-${PSTEP[k]}">${t}</a></li>`).join("")}</ul>`, false) : ""}
    ${best ? sec("Dettagli del farmaco consigliato", "", drug(best, true), false) : ""}
    ${others.length ? sec(pr.tipo === "spec" ? "Cosa potrà valutare lo specialista" : "Altre opzioni", others.length, others.map(id => drug(id, false)).join(""), false) : ""}
    ${sec("Prima della prima dose", nDo ? nDo + " da fare" : "tutto ok", `<div class="todo fchk">${chk.join("")}</div>`, false)}
    <p class="small">Ausilio alla decisione: la scelta resta del medico. Verifica il testo vigente della <a href="#guida-nota79">Nota 79</a> e le schede tecniche.</p>` };
}

/* torna alla figura senza pannelli aperti (anche se si è già sulla figura) */
function figBack(p){ const r = "paz-" + p.id + "-figura"; FIG.open = null; if(routeNow() === r) render(); else go(r); }
/* ---------- interazioni ---------- */
document.addEventListener("click", e => {
  const t = e.target;
  if(t.closest("[data-ciopen]")){ FIG.ciOpen = !FIG.ciOpen; if(FIG.ciOpen) FIG.secOpen = false; FIG.anim = false; render(); return; }
  if(t.closest("[data-secopen]")){ FIG.secOpen = !FIG.secOpen; if(FIG.secOpen) FIG.ciOpen = false; FIG.anim = false; render(); return; }
  const op = t.closest("[data-fsheet]");
  if(op){ e.preventDefault(); if(FIG.open){ const { p } = pzRoute(); commitPending(p); } FIG.anim = !FIG.open; FIG.open = op.dataset.fsheet; render(); FIG.anim = false; const b = document.querySelector(".fsheet-b"); if(b) b.scrollTop = 0;
    const pn = document.querySelector(".fpanel"); if(pn && pn.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + pn.getBoundingClientRect().top - 70 }); return; }
  if(t.closest("[data-fclose]")){ figClose(); return; }
  if(t.closest("[data-rival]")){ const { p } = pzRoute(); if(!p) return; pzRivaluta(p); toast("Rivalutazione iniziata: la valutazione precedente è salvata nei Controlli nel tempo."); FIG.anim = true; FIG.open = "chi"; render(); return; }
  const fs = t.closest("[data-fspec]");
  if(fs){ const { p } = pzRoute(); if(!p) return; const id = fs.dataset.fspec;
    const ids = id.split("+"), dIn = document.getElementById("fspD"), d = (dIn && dIn.value) || todayISO(), nm = x => dnome(x).replace(/ \(.*\)$/, "");
    p.terapie = p.terapie || [];
    const chiusi = p.terapie.filter(x => !x.fine && !ids.includes(x.farmaco)); chiusi.forEach(x => { x.fine = d; });
    ids.forEach(x => { if(!p.terapie.some(y => y.farmaco === x && !y.fine)) p.terapie.push({ farmaco: x, inizio: d, fine:"", note:"indicato dallo specialista" }); });
    savePz(p); toast((chiusi.length ? chiusi.map(x => nm(x.farmaco)).join(" e ") + (chiusi.length > 1 ? " chiusi. " : " chiuso. ") : "") + ids.map(nm).join(" + ") + " dal " + fmtD(d) + ", come indicato dallo specialista."); figBack(p); return; }
  const fd = t.closest("[data-fdec]");
  if(fd){ const { p } = pzRoute(); if(!p) return; const [tipo, farm] = fd.dataset.fdec.split(":");
    p.decisione = { tipo, data: todayISO() };
    if(farm && !(p.terapie || []).some(x => x.farmaco === farm && !x.fine)) (p.terapie = p.terapie || []).push({ farmaco: farm, inizio: todayISO(), fine:"", note:"" });
    savePz(p);
    if(tipo === "spec"){ toast("Invio allo specialista registrato: ecco la lettera."); go("paz-" + p.id + "-lettera"); }
    else { toast(farm ? dnome(farm) + " registrato da oggi. Prossimo passo: il foglio per il paziente." : "Decisione registrata."); figBack(p); }
  }
});
document.addEventListener("keydown", e => { if(e.key === "Escape" && FIG.open) figClose(); });

/* chiusura della scheda dal basso: scende con la stessa curva con cui è salita (come le schede di iOS) */
function figClose(){
  { const { p } = pzRoute(); commitPending(p); }
  const sh = document.querySelector(".fsheet"), dm = document.querySelector(".fdim");
  if(!sh){ FIG.open = null; render(); return; }
  if(sh.classList.contains("out")) return;
  sh.style.transition = ""; sh.style.transform = ""; if(dm){ dm.style.transition = ""; dm.style.opacity = ""; }
  sh.classList.remove("in"); if(dm) dm.classList.remove("in");
  void sh.offsetHeight;
  sh.classList.add("out"); if(dm) dm.classList.add("out");
  let fatto = false; const fine = () => { if(fatto) return; fatto = true; FIG.open = null; render(); };
  sh.addEventListener("transitionend", e => { if(e.target === sh) fine(); });
  setTimeout(fine, 560);
}
/* trascinare la scheda verso il basso la chiude: dalla maniglia, dalla testata o dal contenuto già in cima */
let figDrag = null;
document.addEventListener("touchstart", e => {
  const sh = e.target.closest(".fsheet"); if(!sh || sh.classList.contains("out") || e.touches.length > 1) return;
  if(e.target.closest("select, textarea, input[type=range]")) return;
  figDrag = { sh, dm: document.querySelector(".fdim"), body: e.target.closest(".fsheet-b"), y0: e.touches[0].clientY, active:false, dy:0, t:0, v:0 };
}, { passive:true });
document.addEventListener("touchmove", e => {
  const g = figDrag; if(!g) return;
  const y = e.touches[0].clientY;
  if(!g.active){
    const d = y - g.y0;
    if(d < -4 || (g.body && g.body.scrollTop > 0)){ figDrag = null; return; }
    if(d < 6) return;
    g.active = true; g.y0 = y; g.ly = y; g.t = performance.now(); g.sh.style.transition = "none"; if(g.dm) g.dm.style.transition = "none";
  }
  const now = performance.now(), dy = Math.max(0, y - g.y0);
  g.v = (y - g.ly) / Math.max(1, now - g.t); g.ly = y; g.t = now; g.dy = dy;
  g.sh.style.transform = `translate(-50%,${dy}px)`;
  if(g.dm) g.dm.style.opacity = String(Math.max(0, 1 - dy / g.sh.offsetHeight));
  e.preventDefault();
}, { passive:false });
const figDragEnd = () => {
  const g = figDrag; figDrag = null; if(!g || !g.active) return;
  if(g.dy > g.sh.offsetHeight * 0.25 || g.v > 0.5) return figClose();
  /* non abbastanza: torna su */
  const ease = "cubic-bezier(.32,.72,0,1)";
  g.sh.style.transition = `transform .5s ${ease}`; g.sh.style.transform = "translate(-50%,0)";
  if(g.dm){ g.dm.style.transition = `opacity .5s ${ease}`; g.dm.style.opacity = ""; }
  setTimeout(() => { if(!g.sh.classList.contains("out")){ g.sh.style.transition = ""; g.sh.style.transform = ""; if(g.dm) g.dm.style.transition = ""; } }, 520);
};
document.addEventListener("touchend", figDragEnd);
document.addEventListener("touchcancel", figDragEnd);
/* passando da schermo largo a stretto (o viceversa) la sezione aperta passa da pannello a riquadro */
window.matchMedia("(min-width:744px) and (min-height:560px)").addEventListener("change", () => { if(FIG.open) render(); });
