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
const FIG = { open:null };
const FIG_SHEETS = {
  chi:   { t:"Chi è", ic:"👤", k:"dati", body: p => datiAnag(p) },
  fx:    { t:"Le fratture", ic:"🦴", k:"dati", body: p => datiFx(p) },
  anam:  { t:"Malattie e farmaci", ic:"💊", k:"anamnesi", body: p => noHead(vPazAnamnesi(p).html) },
  esami: { t:"Esami del sangue", ic:"🧪", k:"esami", body: p => noHead(vPazEsami(p).html) },
  dxa:   { t:"Densitometria", ic:"🩻", k:"dxa", body: p => noHead(vPazDxa(p).html) },
  defra: { t:"DeFRA", ic:"🎯", k:"defra", body: p => noHead(vPazDefra(p).html) },
  sec:   { t:"Osteoporosi secondaria", ic:"⚠️", k:"anamnesi", body: p => { const S = pzSecondary(p);
    return secReport(p, S) + (S.A.forms.length ? `<p class="lbl">Compatibili con gli esami</p><div class="stack">${S.A.forms.map(x => ohEntry("forma-" + x.cid, COND[x.cid], x.sub)).join("")}</div>` : "") +
      `<div class="btns"><button type="button" class="btn sec" data-fsheet="anam">Malattie e farmaci</button><button type="button" class="btn sec" data-fsheet="esami">Esami del sangue</button></div>`; } },
  storico:{ t:"Controlli nel tempo", ic:"📈", k:"storico", body: p => noHead(vPazStorico(p).html) }
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
  if(ci.denti) add("a", "", "", "denti da sistemare");
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
    fx: { n:2, st: F.fx.length ? (F.recent.length ? "al" : "ok") : p.nessunaFx ? "ok" : "miss",
      t: F.fx.length ? (FX_SEDI[F.fx[0].sede] || "Frattura") + (F.fx[0].grado ? " " + F.fx[0].grado : "") + (F.fx.length > 1 ? " +" + (F.fx.length - 1) : "") : p.nessunaFx ? "Nessuna frattura" : "Le fratture",
      s: F.fx.length ? (F.recent.length ? "recente · " + fmtD(F.fx[0].data) : fmtD(F.fx[0].data)) : p.nessunaFx ? "da fragilità" : "quando, dove, come" },
    anam: { n:3, st: an.st === "miss" ? "miss" : (sec.length || ciOn ? "al" : "ok"), t: an.st === "miss" ? "Malattie e farmaci" : sec.length ? plural(sec.length, "causa secondaria", "cause secondarie") : ciOn ? "Controindicazioni" : "Anamnesi verificata",
      s: an.st === "miss" ? "incolla dal gestionale" : sec.length ? sec[0] : ciOn ? "da conoscere per la terapia" : "nessuna forma secondaria" }
  };
}
/* sulla figura: zona e rischio DeFRA, T-score di colonna e femore */
function figBadges(p, F){
  const dx = F.lastDxa, tF = dx ? [num(dx.tFt), num(dx.tFn)].filter(v => v !== null) : [];
  const ts = (lbl, v) => { if(v === null) return `<button type="button" class="fbd miss" data-fsheet="dxa"><span class="fbd-c">?</span><span class="fbd-t"><b>${lbl}</b><small>DXA da inserire</small></span></button>`;
    const c = tsCat(v); return `<button type="button" class="fbd t-${c[0]}" data-fsheet="dxa" aria-label="T-score ${lbl.toLowerCase()} ${fmtN(v)}, ${c[1].toLowerCase()}"><span class="fbd-c">${fmtN(v)}</span><span class="fbd-t"><b>${lbl}</b><small>${c[1].toLowerCase()}${F.dxaAge > 24 ? " · " + dx.data.slice(0, 4) : ""}</small></span></button>`; };
  const z = F.zona, r = F.rischio;
  const df = z ? `<button type="button" class="fbd zf z-${z}" data-fsheet="defra" aria-label="DeFRA zona ${ZONE[z].t.toLowerCase()}${r !== null ? ", rischio " + fmtN(r, 0) + "%" : ""}"><span class="fbd-c">${r !== null ? fmtN(r, 0) + "<i>%</i>" : "!"}</span><span class="fbd-t"><b>DeFRA</b><small>zona ${ZONE[z].t.toLowerCase()}</small></span></button>`
    : `<button type="button" class="fbd miss" data-fsheet="defra"><span class="fbd-c">?</span><span class="fbd-t"><b>DeFRA</b><small>da calcolare</small></span></button>`;
  return `<div class="fbads">${df}${ts("Colonna", dx ? num(dx.tL) : null)}${ts("Femore", tF.length ? Math.min(...tF) : null)}</div>`;
}
/* caso completo: tutti gli indizi raccolti (dati, fratture, anamnesi, DXA, DeFRA) */
const figDone = (F, spots) => !Object.values(spots).some(x => x.st === "miss") && !!F.zona && !!F.lastDxa;
/* a caso completo restano sulla figura solo i dati che contano, tutti nello stesso modo */
function figSummary(p, F, S){
  /* lati fissi: a sinistra il paziente (età, familiarità, fratture, controindicazioni), a destra gli esami
     (T-score peggiore, cause secondarie, esami del sangue); in basso, più grande di tutti, il DeFRA.
     Colore = gravità: rosso serio, ambra attenzione, verde rassicurante, viola neutro. */
  const sx = [], dx = [], pill = (arr, k, cls, c, b, sm, aria) => arr.push(`<button type="button" class="fbd ${cls}" data-fsheet="${k}" aria-label="${hx(aria || b + ": " + sm)}"><span class="fbd-c">${c}</span><span class="fbd-t"><b>${hx(b)}</b><small>${hx(sm)}</small></span></button>`);
  const ci = p.ci || {}, eg = num(p.egfr), vd = num(p.vitd);
  /* sinistra: il paziente */
  if(F.age !== null) pill(sx, "chi", "k-n", F.age, "anni", (p.sesso === "uomo" ? "uomo" : "donna") + (F.bmi && F.bmi < 20 ? " · BMI " + fmtN(F.bmi) + " basso" : ""), F.age + " anni");
  if(p.fam) pill(sx, "chi", "k-a", "Sì", "Familiarità", "fratture nei genitori");
  else if(p.fam === false) pill(sx, "chi", "k-ok", "No", "Familiarità", "nessuna nei genitori");
  if(F.fx.length){ const f = F.fx[0], rec = F.recent.length;
    pill(sx, "fx", rec ? "k-r" : "k-a", F.fx.length, (FX_SEDI[f.sede] || "Frattura") + (f.grado ? " " + f.grado : ""), (rec ? "recente · " : "") + fmtD(f.data).slice(3) + (F.fx.length > 1 ? " · +" + (F.fx.length - 1) : ""), plural(F.fx.length, "frattura", "fratture") + ", l'ultima: " + (FX_SEDI[f.sede] || f.sede)); }
  else pill(sx, "fx", "k-ok", "0", "Nessuna frattura", "da fragilità");
  const cis = [];
  if(S.hpp) cis.push(["esami", "No bisfosfonati", "fosfatasi alcalina bassa"]);
  else if(ci.esofago) cis.push(["anam", "No bisfosfonati orali", "esofago"]);
  if(eg !== null && eg < 35) cis.push(["esami", "eGFR " + fmtN(eg, 0), eg < 30 ? "no bisfosfonati, cautela" : "no alendronato, zoledronato"]);
  if(ci.cv || F.feats.has("ictus_emiplegia")) cis.push(["anam", "No romosozumab", "infarto o ictus"]);
  if(ci.tev) cis.push(["anam", "No raloxifene", "tromboembolismo"]);
  if(ci.denti) cis.push(["anam", "Denti da sistemare", "prima di antiriassorbitivi"]);
  cis.slice(0, 2).forEach((x, i) => pill(sx, x[0], x[1] === "Denti da sistemare" ? "k-a" : "k-r", "✕", x[1], i === 1 && cis.length > 2 ? "e altre " + (cis.length - 2) : x[2]));
  /* destra: gli esami */
  const d = F.lastDxa, sites = [["colonna", d.tL], ["femore", d.tFt], ["collo femore", d.tFn]].map(([n, v]) => [n, num(v)]).filter(x => x[1] !== null).sort((a, b) => a[1] - b[1]);
  if(sites.length){ const [n, v] = sites[0], c = tsCat(v); pill(dx, "dxa", "t-" + c[0], fmtN(v), "T-score " + n, c[1].toLowerCase() + (F.dxaAge > 24 ? " · " + d.data.slice(0, 4) : ""), "T-score peggiore " + n + " " + fmtN(v) + ", " + c[1].toLowerCase()); }
  const sec = [...new Set([...S.N.note.map(x => x.f.nome), ...S.N.sosp.map(x => x.f.nome), ...S.A.forms.map(x => COND[x.cid])])];
  const short = n => { const t = n.replace(/^Osteoporosi (indotta )?da /i, ""); return t.charAt(0).toUpperCase() + t.slice(1); };
  /* osteoporosi secondaria: un solo bollino, il numero di condizioni e i nomi su una riga; si apre */
  if(sec.length) dx.push(`<button type="button" class="fbd k-a fsec-b" data-fsheet="sec" aria-label="${hx(plural(sec.length, "condizione", "condizioni") + " di osteoporosi secondaria: " + sec.join(", ") + ". Apri l'elenco")}"><span class="fbd-c">${sec.length}</span><span class="fbd-t"><b>Osteoporosi secondaria</b><small>${hx(sec.map(short).join(" · "))}</small></span><span class="fbd-o" aria-hidden="true">›</span></button>`);
  const es = stepStatus(p, "esami", F, S), ls = labStatus(p);
  if(es.st === "miss") pill(dx, "esami", "miss", "?", "Esami del sangue", ls.done + " di " + ls.tot + " inseriti");
  else if(vdLow(vd) || es.st === "warn") pill(dx, "esami", "k-a", "!", "Esami del sangue", vdLow(vd) ? "vitamina D " + vdTxt(vd) : "da rivedere");
  else pill(dx, "esami", "k-ok", "✓", "Esami del sangue", "nella norma");
  /* il DeFRA, in grande */
  const z = F.zona, r = F.rischio;
  const big = `<button type="button" class="fdefra z-${z}" data-fsheet="defra" aria-label="DeFRA zona ${ZONE[z].t.toLowerCase()}${r !== null ? ", rischio di frattura a 10 anni " + fmtN(r, 0) + "%" : ""}"><span class="fdefra-c">${r !== null ? fmtN(r, 0) + "<i>%</i>" : "—"}</span><span class="fdefra-t"><small>DeFRA · rischio a 10 anni</small><b>Zona ${ZONE[z].t.toLowerCase()}</b><span>${ZONE[z].r}</span></span></button>`;
  return `<div class="fsum"><div class="fsum-c">${sx.join("")}</div><div class="fsum-c r">${dx.join("")}</div></div>${big}`;
}
function figStage(p, fig, spots, F, S){
  const d = FIGURE[fig], lblFx = d.fxLbl;
  const pos = { chi:d.testa, fx:d.fx, anam:d.busto };
  if(F && S && figDone(F, spots)) return `<div class="fstage done"><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}"></div>${figSummary(p, F, S)}</div>`;
  return `<div class="fstage"><div class="fimg"><img src="img/${fig}.jpg" alt="${d.alt}">` +
    Object.entries(spots).map(([k, s]) => { const [x, y] = pos[k], left = x > 52;
      const t = k === "fx" && s.st === "miss" && lblFx ? lblFx : s.t;
      return `<button type="button" class="fhs ${s.st}${left ? " l" : ""}" data-fsheet="${k}" style="left:${x}%;top:${y}%" aria-label="${hx(t)}: ${hx(s.s)}"><span class="fdot">${s.st === "ok" ? "✓" : s.st === "al" ? "!" : s.n}</span><span class="ftag"><b>${hx(t)}</b><small>${hx(s.s)}</small></span></button>`;
    }).join("") + (F ? figBadges(p, F) : "") + `</div></div>`;
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
    const th = F.ther[0], nd = th && nextDose(th), d = th && DRUGS[th.farmaco];
    const drug = th ? `<div class="fdrugbig"><span class="fpill">${drugIcon(th.farmaco)}</span><span><b>${dnome(th.farmaco).replace(/ \(.*\)$/, "")}</b><small>${d ? d.via.replace(/\.$/, "") : ""} · dal ${fmtD(th.inizio)}${F.ther.length > 1 ? " · + " + plural(F.ther.length - 1, "altro farmaco", "altri farmaci") : ""}</small></span></div>`
      : p.decisione.tipo === "spec" ? `<div class="fdrugbig spec"><span class="fpill">🩺</span><span><b>Inviato allo specialista</b><small>in attesa della terapia indicata dallo specialista</small></span></div>`
      : `<div class="fdrugbig none"><span class="fpill"><svg class="dic" viewBox="0 0 48 48" aria-hidden="true">${DRUG_SVG.latte}</svg></span><span><b>Nessun farmaco per l'osteoporosi</b><small>calcio con la dieta, vitamina D, movimento</small></span></div>`;
    const MESI = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
    const quando = dt => { const g = daysTo(dt); return g < 0 ? `in ritardo di ${-g} giorni` : g === 0 ? "oggi" : g < 45 ? `tra ${g} giorni` : `tra ${Math.round(g / 30.4)} mesi`; };
    const cal = (cls, lbl, top, big, bot, rel, note) => `<div class="fcal ${cls}"><small>${lbl}</small><div class="fcal-d"><span>${top}</span><b>${big}</b><span>${bot}</span></div><em>${rel}</em>${note ? `<i>${note}</i>` : ""}</div>`;
    const tiles = [];
    if(nd){ const late = daysTo(nd) < 0; tiles.push(cal(late ? "late" : "dose", "Prossima " + doseWord(th.farmaco), MESI[nd.getMonth()], nd.getDate(), nd.getFullYear(), quando(nd), late ? "farla al più presto" : th.farmaco === D_ ? "calcemia prima della dose" : "")); }
    if(F.lastDxa){ const ld = pDate(F.lastDxa.data), from = addMonths(ld, 18), to = addMonths(ld, 24), pl = dxaPlan(F);
      const okp = pl.st === "ok";
      tiles.push(cal(pl.st === "miss" ? "late" : pl.st === "warn" ? "now" : "dxa", "Prossima densitometria", okp ? "da" : "entro", MESI[(okp ? from : to).getMonth()], (okp ? from : to).getFullYear(), pl.st === "miss" ? "da fare subito" : pl.st === "warn" ? "da programmare ora" : quando(from), okp ? "finestra fino a " + MESI[to.getMonth()] + " " + to.getFullYear() : "ultima " + fmtD(F.lastDxa.data))); }
    else tiles.push(cal("late", "Prossima densitometria", "DXA", "?", "", "da richiedere", "nessuna registrata"));
    return `<div class="fnext done"><small>Caso completato · ${dec.t.toLowerCase()} · ${fmtD(p.decisione.data)}</small>${drug}<div class="fcals">${tiles.join("")}</div><a class="fnext-l" href="#paz-${p.id}-${th || p.decisione.tipo !== "mmg" ? "decidi" : "terapia"}">${th || p.decisione.tipo !== "mmg" ? "Rivedi la decisione" : "Registra il farmaco"}</a></div>`;
  }
  if(miss.length && !F.zona || miss.length > 1) { const m = miss[0];
    return `<button type="button" class="fnext" data-fsheet="${m[0]}"><small>Prossimo indizio · ne ${miss.length === 1 ? "manca 1" : "mancano " + miss.length}</small><b>${m[2]}</b><span>${m[3]}</span><em>Apri →</em></button>`; }
  return `<a class="fnext go" href="#paz-${p.id}-decidi"><small>${miss.length ? "Manca ancora: " + miss[0][2].toLowerCase() : "Tutti gli indizi raccolti"}</small><b>Decidi la terapia</b><span>La proposta tiene conto di zona, Nota 79 e controindicazioni</span><em>▶</em></a>`;
}
/* referti come una fila di caselle: icona, nome, valore */
function figInv(p, F, S, done){
  const ls = labStatus(p), e = stepStatus(p, "esami", F, S);
  const it = (k, ic, t, v, st) => `<button type="button" class="finv-i ${st}" data-fsheet="${k}"><span class="fic">${ic}</span><b>${t}</b><small>${v}</small></button>`;
  return `<div class="finv">
    ${done ? "" : it("esami", "🧪", "Esami", e.st === "miss" ? ls.done + "/" + ls.tot : e.st === "warn" ? "da vedere" : "nella norma", e.st === "miss" ? "miss" : e.st === "warn" ? "al" : "ok")}
    ${p.decisione ? it("storico", "📈", "Controlli", "DXA " + (dxaPlan(F).st === "ok" ? "in programma" : "da fare"), dxaPlan(F).st === "ok" ? "ok" : "al") : ""}
  </div>`;
}
const figDocs = p => `<p class="fdocs"><button type="button" class="lnk" data-copy="riepilogo">Copia per la cartella</button><a href="#paz-${p.id}-lettera">Lettera allo specialista</a><a href="#paz-${p.id}-foglio">Foglio per il paziente</a><a href="#paz-${p.id}-report">Report</a></p>`;
function figSheet(p){
  const sh = FIG_SHEETS[FIG.open]; if(!sh) return "";
  return `<div class="fdim" data-fclose></div><div class="fsheet" role="dialog" aria-label="${sh.t}"><div class="fsheet-h"><span class="fic">${sh.ic}</span><b>${sh.t}</b><button type="button" class="btn" data-fclose>Fatto</button></div>
    <div class="fsheet-b">${sh.body(p)}</div></div>`;
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
  return { bar: pzName(p), html: viewSwitch(p, "figura") + `
    <div class="fhud"><div class="fhud-t"><b>${title}</b><small>${done} di ${STEPS.length} indizi raccolti</small></div></div>
    <div class="fprog">${all.map(x => `<i class="${x.st}" title="${x.t}"></i>`).join("")}</div>
    <div class="fgrid"><div class="fcol-l">${figStage(p, fig, spots, F, S)}</div>
    <div class="fcol-r">
      ${figNext(p, F, S, spots)}
      ${figDone(F, spots) ? "" : `<div class="fsec"><p class="flbl">In evidenza</p>${figChips(p, F, S, false) || `<p class="small">Ancora nulla: compaiono qui i dati che contano per la decisione.</p>`}</div>`}
      ${figDone(F, spots) && !p.decisione ? "" : `<div class="fsec"><p class="flbl">${figDone(F, spots) ? "Controlli" : "Referti"}</p>${figInv(p, F, S, figDone(F, spots))}</div>`}
      ${p.decisione ? `<div class="fsec"><p class="flbl">Documenti</p>${figDocs(p)}</div>` : ""}
      <p class="fdel"><button type="button" class="lnk" id="pzDel">Elimina paziente</button></p>
    </div></div>` + figSheet(p) };
}
function viewSwitch(p, cur){
  return `<div class="vsw" role="group" aria-label="Vista"><a href="#paz-${p.id}-figura" aria-pressed="${cur === "figura"}">Figura</a><a href="#paz-${p.id}-percorso" aria-pressed="${cur === "percorso"}">Percorso a passi</a></div>`;
}

/* ---------- decisione terapeutica ---------- */
function proposta(p, F, S, fl){
  const okd = id => !(fl[id] && fl[id].ci.length);
  if(!F.zona) return null;
  if(F.zona === "verde") return { tipo:"nessuno", t:"Nessun farmaco per l'osteoporosi", s:ZONE.verde.azione, opz:[] };
  if(zoneHigh(F.zona)){
    const spec = [T_, ...(F.donna ? [AB_, RO_] : [])];
    return { tipo:"spec", t:"Invio allo specialista dell'osso" + (F.zona === "rossa" ? ", con priorità" : ""), s:ZONE[F.zona].azione, opz: spec, nota:"Cosa potrà valutare lo specialista" };
  }
  /* zona gialla: prima linea dal MMG, bisfosfonati o denosumab, il primo senza controindicazioni */
  const ord = [A_, R_, D_, Z_], best = ord.find(okd);
  return { tipo:"mmg", t: best ? "Terapia di prima linea: " + dnome(best) : "Prima linea non utilizzabile", s:ZONE.gialla.azione, opz: ord, best };
}
function vDecidi(p){
  const F = pzFacts(p), S = pzSecondary(p), fl = drugFlags(p, F, S), n79 = nota79(p, F), pr = proposta(p, F, S, fl), fig = figOf(p);
  if(!pr) return { redirect: "paz-" + p.id + "-figura" };
  const n79of = id => n79.filter(c => c.s.some(l => l.includes(id)));
  const drug = (id, best) => { const f = fl[id] || { ci:[], warn:[] }, c = n79of(id), ci = f.ci.length;
    return `<div class="fdrug${best ? " best" : ""}${ci ? " no" : ""}">${best ? `<span class="frk">Consigliato</span>` : ""}<b class="fdn">${drugIcon(id)}${dnome(id)}</b><small>${DRUGS[id].via}</small>
      ${f.ci.map(x => `<div class="fwarn">Controindicato: ${x}</div>`).join("")}${f.warn.map(x => `<div class="fwarn a">Cautela: ${x}</div>`).join("")}
      ${!ci ? `<div class="fn79">${c.length ? "Nota 79: " + c.map(x => x.cond).join(" / ") + (c.some(x => x.spec) && [T_, AB_, RO_].includes(id) ? " (piano terapeutico specialistico)" : "") : "Con i dati inseriti è fuori dalle condizioni della Nota 79."}</div>` : ""}</div>`; };
  const ls = labStatus(p), vd = num(p.vitd), lab = p.lab || {}, eg = num(p.egfr);
  const chk = [];
  const c = (st, t, s) => chk.push(`<div class="td ${st}"><i>${st === "ok" ? "✓" : "!"}</i><span>${t}<small>${s}</small></span></div>`);
  if(ls.done < ls.tot) c("w", "Completa gli esami di I livello", `${ls.done} di ${ls.tot}: servono a escludere le forme secondarie`);
  if(S.N.note.length + S.N.sosp.length + S.A.forms.length) c("w", "Forme secondarie da considerare", [...S.N.note, ...S.N.sosp].map(x => x.f.nome).concat(S.A.forms.map(x => COND[x.cid])).slice(0, 3).join(", "));
  if(S.hpp) c("w", "Escludi l'ipofosfatasia", "fosfatasi alcalina bassa: bisfosfonati controindicati");
  if(vd === null && lab.D !== "norm") c("w", "Dosa la 25-OH-vitamina D", "o correggila comunque: in terapia per l'osteoporosi è rimborsabile (Nota 96)");
  else if(vdLow(vd) || lab.D === "basso") c("w", "Correggi la vitamina D", (vd !== null ? vdTxt(vd) + ": " : "") + "sotto 75 nmol/L, il valore da raggiungere (Nota 96)");
  else c("ok", "Vitamina D adeguata", vd !== null ? vdTxt(vd) : "nella norma");
  if(pr.tipo !== "nessuno") p.dentista ? c("ok", "Visita odontoiatrica eseguita", "bocca in ordine") : c("w", "Visita odontoiatrica", "prima di bisfosfonati, denosumab o romosozumab");
  if(lab.Ca === "norm" && (eg === null || eg >= 35)) c("ok", "Calcemia" + (eg !== null ? " ed eGFR" : "") + " nella norma", [AUTO.Ca(p) ? AUTO.Ca(p).val : "", eg !== null ? fmtN(eg, 0) + " mL/min" : ""].filter(Boolean).join(" · ") || "dagli esami");
  else if(lab.Ca === "basso") c("w", "Correggi l'ipocalcemia", "prima di qualsiasi antiriassorbitivo");
  const keys = [
    ["Frattura", F.fx.length ? (FX_SEDI[F.fx[0].sede] || "") + " · " + fmtD(F.fx[0].data) : "nessuna", F.recent.length ? "r" : ""],
    ["T-score minimo", F.minT !== null ? fmtN(F.minT) : "—", ""],
    ["DeFRA", `<span class="zn z-${F.zona}"><i></i>Zona ${ZONE[F.zona].t.toLowerCase()}</span>`, "y"],
    ["Da sapere", [p.ci && p.ci.esofago ? "esofago" : "", S.hpp ? "ALP bassa" : "", eg !== null && eg < 35 ? "eGFR " + fmtN(eg, 0) : "", p.ci && p.ci.cv ? "cardiovascolare" : ""].filter(Boolean).join(", ") || "nessuna controindicazione", (p.ci && (p.ci.esofago || p.ci.cv)) || S.hpp || (eg !== null && eg < 35) ? "r" : ""]
  ];
  const cur = p.decisione && p.decisione.tipo;
  let actions = "";
  if(pr.tipo === "mmg" && pr.best) actions = `<button type="button" class="btn sec" data-fdec="spec">Invia allo specialista</button><button type="button" class="btn" data-fdec="mmg:${pr.best}">Prescrivo ${dnome(pr.best).replace(/ \(.*\)$/, "").toLowerCase()}</button>`;
  else if(pr.tipo === "mmg") actions = `<button type="button" class="btn" data-fdec="spec">Invia allo specialista</button>`;
  else if(pr.tipo === "spec") actions = `<a class="btn sec" href="#paz-${p.id}-terapia">Imposto io la terapia</a><button type="button" class="btn" data-fdec="spec">Invia allo specialista</button>`;
  else actions = `<a class="btn sec" href="#paz-${p.id}-terapia">Valuto un farmaco</a><button type="button" class="btn" data-fdec="nessuno">Confermo: nessun farmaco</button>`;
  return { bar:"Decisione terapeutica", html: `
    <div class="fwin big"><span class="fwin-f" style="background-image:url(img/${fig}-viso.jpg)"></span><span><small>${hx(pzName(p))}${F.age !== null ? " · " + F.age + " anni" : ""}</small><b>Obiettivo: evitare la prossima frattura</b></span></div>
    <div class="fkeys">${keys.map(k => `<div class="fkey ${k[2]}"><small>${k[0]}</small><b>${k[1]}</b></div>`).join("")}</div>
    ${vh.length ? `<div class="alert"><b>Rischio molto alto</b>${vh.join("; ")}.${pr.tipo === "mmg" ? " Valuta comunque l'invio allo specialista per un anabolico." : ""}</div>` : ""}
    <p class="lbl">${pr.tipo === "spec" ? "Indicazione · zona " + ZONE[F.zona].t.toLowerCase() : pr.tipo === "nessuno" ? "Indicazione · zona verde" : "Terapia consigliata · zona gialla, la imposti tu"}</p>
    <div class="fprop ${pr.tipo}"><b>${pr.t}</b><small>${pr.s}</small></div>
    ${pr.tipo === "mmg" ? (pr.best ? drug(pr.best, true) : "") + pr.opz.filter(id => id !== pr.best).map(id => drug(id, false)).join("") : ""}
    ${pr.tipo === "spec" ? `<p class="lbl">${pr.nota}</p>` + pr.opz.map(id => drug(id, false)).join("") + `<p class="small">Nell'attesa: calcio con la dieta, vitamina D, prevenzione delle cadute. La lettera allo specialista è già compilata.</p>` : ""}
    <p class="lbl">Prima della prima dose</p><div class="todo fchk">${chk.join("")}</div>
    ${cur ? `<p class="small">Decisione registrata il ${fmtD(p.decisione.data)}: ${DECISIONI[cur].t.toLowerCase()}.</p>` : ""}
    <div class="fact">${actions}</div>
    <p class="small">Ausilio alla decisione: la scelta resta del medico. Verifica il testo vigente della Nota 79 e le schede tecniche.</p>` };
}

/* ---------- interazioni ---------- */
document.addEventListener("click", e => {
  const t = e.target;
  const op = t.closest("[data-fsheet]");
  if(op){ e.preventDefault(); FIG.open = op.dataset.fsheet; render(); const b = document.querySelector(".fsheet-b"); if(b) b.scrollTop = 0; return; }
  if(t.closest("[data-fclose]")){ FIG.open = null; render(); return; }
  const fd = t.closest("[data-fdec]");
  if(fd){ const { p } = pzRoute(); if(!p) return; const [tipo, farm] = fd.dataset.fdec.split(":");
    p.decisione = { tipo, data: todayISO() };
    if(farm && !(p.terapie || []).some(x => x.farmaco === farm && !x.fine)) (p.terapie = p.terapie || []).push({ farmaco: farm, inizio: todayISO(), fine:"", note:"" });
    savePz(p);
    if(tipo === "spec"){ toast("Invio allo specialista registrato: ecco la lettera."); go("paz-" + p.id + "-lettera"); }
    else { toast(farm ? dnome(farm) + " registrato da oggi. Prossimo passo: il foglio per il paziente." : "Decisione registrata."); go("paz-" + p.id + "-figura"); }
  }
});
document.addEventListener("keydown", e => { if(e.key === "Escape" && FIG.open){ FIG.open = null; render(); } });
