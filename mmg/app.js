/* ============================================================
   OSTEO HELP MMG — scheda del paziente con osteoporosi (app separata da Osteo Help)
   Anamnesi e terapie → forme secondarie (stesso motore di «Esami normali»),
   esami di I livello → forme compatibili (stesso motore di «Esami alterati»),
   cosa serve per il DeFRA, rischio di frattura, Nota 79, storico DXA/DeFRA/fratture, report.
   I dati restano solo nel browser di questo dispositivo (localStorage).
   ============================================================ */
const PZ_KEY = "oh-pazienti-v1";
const DEFRA_URL = "https://defra-osteoporosi.it/";
const hx = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const num = v => { if(v === "" || v == null) return null; const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
const fmtN = (n, d) => n == null ? "—" : n.toFixed(d == null ? 1 : d).replace(".", ",").replace("-", "−");
const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const pDate = s => { if(!s) return null; const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +(m[3] || 1)) : null; };
const fmtD = s => { const d = pDate(s); return d ? (/^\d{4}-\d{2}$/.test(s) ? "" : String(d.getDate()).padStart(2, "0") + "/") + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear() : "—"; };
const fmtM = d => d ? ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"][d.getMonth()] + " " + d.getFullYear() : "—";
const monthsSince = s => { const d = pDate(s); if(!d) return null; const n = new Date(); return (n.getFullYear() - d.getFullYear()) * 12 + (n.getMonth() - d.getMonth()) + (n.getDate() < d.getDate() ? -1 : 0); };
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
function ageOf(s){ const d = pDate(s); if(!d) return null; const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if(n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--; return a; }
const byDateDesc = (a, b) => (b.data || "").localeCompare(a.data || "");

let PZ = [], pzStorageOk = true;
try{ const s = localStorage.getItem(PZ_KEY); const a = s ? JSON.parse(s) : []; PZ = Array.isArray(a) ? a : []; }catch(e){ pzStorageOk = false; }
function savePz(p){ if(p) p.agg = todayISO(); try{ localStorage.setItem(PZ_KEY, JSON.stringify(PZ)); pzStorageOk = true; }catch(e){ pzStorageOk = false; } }
const pzGet = id => PZ.find(p => p.id === id);
function pzBlank(){
  return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome:"", sesso:null, nascita:"", peso:"", altezza:"", postmeno:null,
    feats:[], lab:{}, labData:"", egfr:"", vitd:"", fam:null, nessunaFx:false, gcMesi12:false, disab:false, anamOk:false, ci:{},
    fratture:[], dxa:[], defra:[], terapie:[], note:"", creato: todayISO(), agg: todayISO() };
}
const pzName = p => p.nome && p.nome.trim() ? p.nome.trim() : "Paziente senza nome";
function pzRoute(){ const m = /^paz-([a-z0-9]+)(?:-([a-z]+))?$/.exec(routeNow()); return m ? { p: pzGet(m[1]), sez: m[2] || "" } : { p:null, sez:"" }; }


/* ============================================================
   INTERFACCIA DELL'APP
   ============================================================ */
const OH = "../";   /* Osteo Help, nella cartella superiore: le sue schede si aprono in un'altra scheda del browser */
const $ = s => document.querySelector(s);
const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
const go = r => { location.hash = r; };
const head = (title, sub) => `<h1>${title}</h1><div class="rule"></div>${sub ? `<p class="sub">${sub}</p>` : ""}`;
const ohEntry = (route, title, sub) => `<a class="entry teal" href="${OH}#${route}" target="_blank" rel="noopener"><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</div>${CHEV}</a>`;
const routeNow = () => location.hash.replace(/^#/, "");

/* ---------- farmaci ---------- */
const A_ = "alendronato", R_ = "risedronato", I_ = "ibandronato", Z_ = "zoledronato", D_ = "denosumab", RX_ = "raloxifene", BZ_ = "bazedoxifene", T_ = "teriparatide", AB_ = "abaloparatide", RO_ = "romosozumab";
const BISF = [A_, R_, I_, Z_], ORALI = [A_, R_, I_], ANTIRIASS = [A_, R_, I_, Z_, D_, RO_], ANABOL = [T_, AB_];
const DRUGS = {
  [A_]: { nome:"Alendronato", classe:"Bisfosfonato (orale)", via:"70 mg per bocca una volta alla settimana (anche in associazione con colecalciferolo).",
    come:"Si lega al minerale dell'osso e frena gli osteoclasti, le cellule che riassorbono l'osso.",
    efficacia:"Riduce le fratture vertebrali, di femore e non vertebrali. È il farmaco di prima scelta più usato.",
    assunzione:"Al mattino a digiuno, con un bicchiere pieno di acqua naturale, restando in piedi o seduti per almeno 30 minuti; poi colazione e altri farmaci.",
    ci:["Anomalie dell'esofago che ne rallentano lo svuotamento (stenosi, acalasia)","Impossibilità a stare in piedi o seduti per 30 minuti","Ipocalcemia","Insufficienza renale: non raccomandato con clearance della creatinina sotto 35 mL/min","Ipofosfatasia (bisfosfonati controindicati)"],
    avv:["Esofagite e disturbi gastrici, soprattutto con reflusso o assunzione scorretta","Osteonecrosi della mandibola e fratture atipiche di femore: rare, legate soprattutto alla durata","Rivalutare la necessità di proseguire dopo 5 anni"],
    nota79:"I scelta in quasi tutte le condizioni della Nota 79. Prescrivibile dal MMG." },
  [R_]: { nome:"Risedronato", classe:"Bisfosfonato (orale)", via:"35 mg una volta alla settimana (anche gastroresistente, da prendere dopo colazione), oppure 75 mg per due giorni consecutivi al mese.",
    come:"Come l'alendronato: frena il riassorbimento osseo.",
    efficacia:"Riduce le fratture vertebrali, di femore e non vertebrali.",
    assunzione:"Formulazione standard: a digiuno, con acqua naturale, in piedi o seduti per 30 minuti. Formulazione gastroresistente: subito dopo la colazione.",
    ci:["Ipocalcemia","Insufficienza renale grave (clearance della creatinina sotto 30 mL/min)","Gravidanza e allattamento","Ipofosfatasia (bisfosfonati controindicati)"],
    avv:["Disturbi esofagei e gastrici","Osteonecrosi della mandibola e fratture atipiche di femore: rare","Rivalutare dopo 5 anni"],
    nota79:"I scelta in quasi tutte le condizioni della Nota 79. Prescrivibile dal MMG." },
  [I_]: { nome:"Ibandronato", classe:"Bisfosfonato (orale o endovena)", via:"150 mg per bocca una volta al mese, oppure 3 mg endovena ogni 3 mesi.",
    come:"Bisfosfonato: frena il riassorbimento osseo.",
    efficacia:"Riduce le fratture vertebrali; l'effetto sulle fratture di femore non è dimostrato.",
    assunzione:"Per bocca: a digiuno, con acqua naturale, in piedi o seduti per 60 minuti.",
    ci:["Anomalie dell'esofago, impossibilità a stare in piedi o seduti per 60 minuti","Ipocalcemia","Non raccomandato con clearance della creatinina sotto 30 mL/min","Ipofosfatasia (bisfosfonati controindicati)"],
    avv:["Disturbi esofagei e gastrici","Osteonecrosi della mandibola e fratture atipiche: rare"],
    nota79:"II o III scelta nella Nota 79." },
  [Z_]: { nome:"Acido zoledronico (zoledronato)", classe:"Bisfosfonato (endovena)", via:"5 mg in infusione endovenosa (almeno 15 minuti) una volta all'anno.",
    come:"Il bisfosfonato più potente: frena a lungo il riassorbimento osseo con una sola infusione all'anno.",
    efficacia:"Riduce le fratture vertebrali, di femore e non vertebrali; utile anche dopo una frattura di femore e quando l'aderenza ai farmaci orali è scarsa.",
    assunzione:"Paziente ben idratato, calcemia e vitamina D normali prima dell'infusione. Nei primi giorni può dare febbre e dolori simil-influenzali (paracetamolo).",
    ci:["Ipocalcemia (correggere prima)","Clearance della creatinina sotto 35 mL/min","Gravidanza e allattamento","Ipofosfatasia (bisfosfonati controindicati)"],
    avv:["Reazione di fase acuta dopo la prima infusione","Osteonecrosi della mandibola e fratture atipiche: rare","Rivalutare dopo 3 anni"],
    nota79:"I o II scelta. Si prescrive e si somministra solo in strutture ospedaliere pubbliche o convenzionate." },
  [D_]: { nome:"Denosumab", classe:"Anticorpo monoclonale anti-RANKL", via:"60 mg sottocute ogni 6 mesi.",
    come:"Blocca RANKL, il segnale che attiva gli osteoclasti: il riassorbimento si ferma, ma l'effetto finisce rapidamente se si salta la dose.",
    efficacia:"Riduce le fratture vertebrali, di femore e non vertebrali; la densità ossea continua a salire per anni. Non si elimina per via renale.",
    assunzione:"Una iniezione ogni 6 mesi, senza ritardi (al massimo 4 settimane). Calcio e vitamina D adeguati prima e durante; calcemia prima di ogni dose.",
    ci:["Ipocalcemia (correggere prima di iniziare)","Ipersensibilità"],
    avv:["NON interrompere né ritardare: alla sospensione il riassorbimento riparte in eccesso (effetto rebound) con rischio di fratture vertebrali multiple. Se si sospende serve un bisfosfonato (di solito zoledronato) per consolidare","Ipocalcemia, soprattutto nell'insufficienza renale grave","Infezioni cutanee (cellulite)","Osteonecrosi della mandibola e fratture atipiche: rare"],
    nota79:"II scelta nella maggior parte delle condizioni, I scelta nel blocco ormonale adiuvante. Prescrivibile anche dal MMG (ricetta ripetibile, RR)." },
  [RX_]: { nome:"Raloxifene", classe:"Modulatore selettivo del recettore degli estrogeni (SERM)", via:"60 mg per bocca al giorno.",
    come:"Agisce come un estrogeno sull'osso (frena il riassorbimento) ma non su mammella e utero.",
    efficacia:"Riduce le fratture vertebrali, non quelle di femore. Riduce anche il rischio di carcinoma mammario invasivo.",
    assunzione:"Una compressa al giorno, in qualsiasi momento. Solo donne in postmenopausa.",
    ci:["Tromboembolismo venoso in atto o pregresso","Sanguinamento uterino non spiegato","Insufficienza epatica o renale grave","Donna in età fertile"],
    avv:["Aumento del rischio di tromboembolismo venoso e di ictus fatale","Vampate di calore, crampi alle gambe"],
    nota79:"II scelta nella Nota 79, solo nella donna." },
  [BZ_]: { nome:"Bazedoxifene", classe:"Modulatore selettivo del recettore degli estrogeni (SERM)", via:"20 mg per bocca al giorno.",
    come:"Come il raloxifene: effetto simil-estrogenico sull'osso.",
    efficacia:"Riduce le fratture vertebrali; sulle non vertebrali solo nelle donne a rischio più alto.",
    assunzione:"Una compressa al giorno. Solo donne in postmenopausa.",
    ci:["Tromboembolismo venoso in atto o pregresso","Sanguinamento uterino non spiegato","Insufficienza epatica"],
    avv:["Aumento del rischio di tromboembolismo venoso e di ictus","Vampate, crampi"],
    nota79:"II scelta nella Nota 79, solo nella donna." },
  [T_]: { nome:"Teriparatide", classe:"Anabolico (analogo del PTH)", via:"20 µg sottocute al giorno, per un massimo di 24 mesi nella vita.",
    come:"Somministrato a dosi quotidiane stimola gli osteoblasti a formare osso nuovo.",
    efficacia:"Riduce le fratture vertebrali e non vertebrali; più efficace dell'alendronato nell'osteoporosi grave e in quella da glucocorticoidi. Alla fine va sempre seguito da un antiriassorbitivo.",
    assunzione:"Iniezione quotidiana con penna. Piano terapeutico dello specialista (6 mesi, rinnovabile fino a 24 mesi).",
    ci:["Ipercalcemia, iperparatiroidismo","Malattia di Paget o fosfatasi alcalina elevata non spiegata","Pregressa radioterapia sullo scheletro, tumori o metastasi ossee","Insufficienza renale grave","Gravidanza, allattamento, epifisi non saldate"],
    avv:["Ipotensione ortostatica, nausea, crampi, lieve ipercalcemia transitoria","Osteosarcoma nell'animale (non confermato nell'uomo): per questo durata limitata"],
    nota79:"I scelta nelle situazioni a rischio più alto (3 o più fratture, frattura con T-score ≤ −4, frattura in corso di glucocorticoidi da oltre 12 mesi, nuova frattura nonostante almeno un anno di terapia). Solo su piano terapeutico specialistico." },
  [AB_]: { nome:"Abaloparatide", classe:"Anabolico (analogo del PTHrP)", via:"80 µg sottocute al giorno, per un massimo di 18 mesi.",
    come:"Stimola la formazione di osso nuovo, come il teriparatide.",
    efficacia:"Riduce le fratture vertebrali e non vertebrali nella donna in postmenopausa. Alla fine va seguito da un antiriassorbitivo.",
    assunzione:"Iniezione quotidiana. Solo donne in postmenopausa, su piano terapeutico specialistico (6 mesi, rinnovabile fino a 18 mesi).",
    ci:["Ipercalcemia, iperparatiroidismo","Malattia di Paget o fosfatasi alcalina elevata non spiegata","Pregressa radioterapia sullo scheletro, tumori ossei","Insufficienza renale grave","Gravidanza, allattamento"],
    avv:["Ipotensione ortostatica, tachicardia, capogiri","Ipercalcemia, ipercalciuria"],
    nota79:"I scelta in donne in postmenopausa con T-score tra −2,5 e −5 (tra −2 e −5 oltre i 65 anni) e fratture vertebrali o recenti fratture non vertebrali maggiori. Solo su piano terapeutico specialistico." },
  [RO_]: { nome:"Romosozumab", classe:"Anticorpo anti-sclerostina (doppia azione)", via:"210 mg sottocute al mese per 12 mesi.",
    come:"Blocca la sclerostina: aumenta la formazione di osso e insieme riduce il riassorbimento.",
    efficacia:"Il più rapido aumento della densità ossea; riduce le fratture vertebrali, non vertebrali e di femore. Dopo 12 mesi serve un antiriassorbitivo.",
    assunzione:"Due iniezioni al mese per 12 mesi. Solo donne, su piano terapeutico specialistico non rinnovabile.",
    ci:["Pregresso infarto miocardico o ictus","Condizioni di rischio cardiovascolare","Ipocalcemia"],
    avv:["Possibile aumento di eventi cardio-cerebrovascolari","Osteonecrosi della mandibola e fratture atipiche: rare","Reazioni nel sito di iniezione"],
    nota79:"Solo donne con fratture, T-score sotto −2,5 (−2 in casi particolari), rischio a 10 anni ≥ 20% calcolato con un calcolatore validato e impossibilità a seguire altri trattamenti efficaci." }
};
const DRUG_ORDER = [A_, R_, I_, Z_, D_, RX_, BZ_, T_, AB_, RO_];
const dlink = id => `<a href="#farmaco-${id}">${DRUGS[id].nome.replace(/ \(.*\)$/, "")}</a>`;

/* ---------- fratture e comorbidità della Nota 79 ---------- */
const FX_SEDI = { vertebra:"Vertebra", femore:"Femore / anca", polso:"Polso / avambraccio", omero:"Omero", bacino:"Bacino / sacro", tibia:"Tibia", coste:"Coste", altra:"Altra sede" };
const FX_GRADO = { lieve:"lieve", moderata:"moderata", grave:"grave" };
const COMORB_N79 = [["artrite_reumatoide","artrite reumatoide"],["les","LES"],["sclerodermia","sclerosi sistemica"],["diabete_t1","diabete tipo 1"],["diabete_t2","diabete tipo 2"],
  ["bpco","BPCO"],["mici","malattia infiammatoria cronica intestinale"],["hiv","HIV/AIDS"],["parkinson","malattia di Parkinson"],["sclerosi_multipla","sclerosi multipla"]];
/* esami di I livello del paziente: gli stessi della griglia «Esami alterati» */
const PZ_EXAMS = COMBO_GROUPS.flatMap(g => g.exams);

/* esegue un motore di Osteo Help con i dati del paziente al posto della schermata corrente */
function withPz(p, fn){
  const sc = Object.assign({}, cstate), ss = new Set(selected), sx = sex;
  for(const k in cstate) delete cstate[k]; Object.assign(cstate, p.lab || {});
  selected.clear(); (p.feats || []).forEach(f => selected.add(f)); sex = p.sesso || null;
  try{ return fn(); } finally { for(const k in cstate) delete cstate[k]; Object.assign(cstate, sc); selected.clear(); ss.forEach(x => selected.add(x)); sex = sx; }
}

function pzFacts(p){
  const age = ageOf(p.nascita);
  const fx = (p.fratture || []).slice().sort(byDateDesc);
  const vert = fx.filter(f => f.sede === "vertebra"), fem = fx.filter(f => f.sede === "femore");
  const oth = fx.filter(f => f.sede !== "vertebra" && f.sede !== "femore");
  const dxa = (p.dxa || []).slice().sort(byDateDesc), lastDxa = dxa[0] || null;
  const tv = lastDxa ? [num(lastDxa.tL), num(lastDxa.tFt), num(lastDxa.tFn)].filter(x => x !== null) : [];
  const minT = tv.length ? Math.min(...tv) : null;
  const defra = (p.defra || []).slice().sort(byDateDesc), lastDefra = defra[0] || null;
  const risk = lastDefra ? num(lastDefra.rischio) : null;
  const feats = new Set(p.feats || []);
  const recent = fx.filter(f => { const m = monthsSince(f.data); return m !== null && m <= 24; });
  const peso = num(p.peso), alt = num(p.altezza);
  const bmi = peso && alt ? peso / Math.pow(alt / 100, 2) : null;
  const dxaAge = lastDxa ? monthsSince(lastDxa.data) : null;
  const ther = (p.terapie || []).filter(t => !t.fine).sort((a, b) => (b.inizio || "").localeCompare(a.inizio || ""));
  return { age, fx, vert, fem, oth, nVF: vert.length + fem.length, dxa, lastDxa, minT, defra, lastDefra, risk, feats, recent, bmi, dxaAge, ther,
    vertModGr: vert.filter(f => f.grado === "moderata" || f.grado === "grave").length,
    vertLievi: vert.filter(f => f.grado === "lieve" || !f.grado).length,
    femRecent2y: fem.some(f => { const m = monthsSince(f.data); return m !== null && m <= 24; }),
    fxInTerapia: fx.some(f => (f.sede === "vertebra" || f.sede === "femore") && f.inTerapia),
    gc: feats.has("glucocorticoidi"), adj: feats.has("aromatasi") || feats.has("adt"),
    comorb: COMORB_N79.filter(c => feats.has(c[0])).map(c => c[1]).concat(p.disab ? ["grave disabilità motoria"] : []),
    donna: p.sesso === "donna" };
}

/* ---------- Nota 79 (testo della determina AIFA dell'8 settembre 2025) ---------- */
function nota79(p, F){
  const out = [], serm = F.donna ? [RX_, BZ_] : [];
  if(F.nVF >= 1){
    const ext = [];
    if(F.nVF >= 3) ext.push("3 o più fratture vertebrali o di femore");
    if(F.minT !== null && F.minT <= -4) ext.push("frattura con T-score ≤ −4");
    if(F.gc && p.gcMesi12) ext.push("frattura in terapia con prednisone ≥5 mg/die da oltre 12 mesi");
    if(F.fxInTerapia) ext.push("nuova frattura vertebrale o di femore nonostante almeno 1 anno di terapia in Nota 79");
    if(ext.length) out.push({ sez:"Prevenzione secondaria", cond: ext.join("; "), s:[[T_], [D_, Z_], [A_, R_, I_]], spec:true });
    else out.push({ sez:"Prevenzione secondaria", cond: plural(F.nVF, "frattura vertebrale o di femore", "fratture vertebrali o di femore"), s:[[A_, R_, Z_], [D_, I_, ...serm]] });
  }
  if(F.donna && p.postmeno !== false && F.minT !== null){
    const lim = F.age !== null && F.age > 65 ? -2 : -2.5;
    const site5 = F.fx.some(f => ["polso","omero","bacino","femore","tibia"].includes(f.sede) && (monthsSince(f.data) ?? 999) <= 60);
    if(F.minT < lim && F.minT > -5 && (F.vertLievi >= 2 || F.vertModGr >= 1 || site5))
      out.push({ sez:"Prevenzione secondaria", cond:`Donna in postmenopausa, T-score tra ${fmtN(lim)} e −5 con fratture vertebrali o frattura di avambraccio, omero, bacino, femore o tibia negli ultimi 5 anni`, s:[[AB_], [D_, Z_], [A_, R_, I_]], spec:true, alt:true });
  }
  if(F.donna && F.minT !== null && F.risk !== null && F.risk >= 20){
    const lim = F.vertModGr >= 2 || F.femRecent2y ? -2 : -2.5;
    if(F.minT < lim && (F.vertModGr >= 1 || F.vertLievi >= 2 || F.fem.length >= 1))
      out.push({ sez:"Prevenzione secondaria", cond:"Fratture vertebrali o di femore, T-score sotto " + fmtN(lim) + ", rischio a 10 anni ≥ 20%: solo se non è possibile seguire altri trattamenti efficaci (intolleranza, inefficacia, fine del periodo consentito)", s:[[RO_]], spec:true, alt:true });
  }
  if(F.oth.length >= 1 && F.minT !== null && F.minT <= -3)
    out.push({ sez:"Prevenzione secondaria", cond:"Frattura non vertebrale e non femorale con T-score ≤ −3", s:[[A_, R_, Z_], [D_, I_, ...serm]] });
  if(F.donna && F.oth.length >= 2 && F.minT !== null && F.minT < -2.5 && F.risk !== null && F.risk >= 20)
    out.push({ sez:"Prevenzione secondaria", cond:"2 o più fratture non vertebrali, T-score sotto −2,5, rischio a 10 anni ≥ 20%: solo se non è possibile seguire altri trattamenti efficaci", s:[[RO_]], spec:true, alt:true });
  const prim = F.donna ? p.postmeno !== false : (F.age === null || F.age >= 50);
  if(prim){
    if(F.gc) out.push({ sez:"Prevenzione primaria", cond:"Prednisone equivalente ≥5 mg/die in atto o previsto per più di 3 mesi", s:[[A_, R_, Z_], [D_]] });
    if(F.adj) out.push({ sez:"Prevenzione primaria", cond:"Blocco ormonale adiuvante (inibitori dell'aromatasi nel carcinoma mammario, deprivazione androgenica nel carcinoma prostatico)", s:[[A_, R_, Z_, D_]] });
    if(F.minT !== null && F.minT <= -4) out.push({ sez:"Prevenzione primaria", cond:"T-score colonna o femore ≤ −4", s:[[A_, R_], [D_, Z_, I_, ...serm]] });
    else if(F.minT !== null && F.minT <= -3 && (p.fam === true || F.comorb.length))
      out.push({ sez:"Prevenzione primaria", cond:"T-score ≤ −3 con " + [p.fam === true ? "familiarità per fratture di vertebre o femore" : "", F.comorb.length ? "comorbilità a rischio (" + F.comorb.join(", ") + ")" : ""].filter(Boolean).join(" e "), s:[[A_, R_], [D_, Z_, I_, ...serm]] });
  }
  return out;
}

/* ---------- controindicazioni e cautele, farmaco per farmaco ---------- */
function pzSecondary(p){
  const N = withPz(p, computeN), A = withPz(p, computeA);
  const ids = new Set([...N.note, ...N.sosp].map(x => x.f.id));
  const hpp = (p.lab || {}).ALP === "basso" || ids.has("gen_ipofosfatasia");
  return { N, A, hpp };
}
function drugFlags(p, F, S){
  const lab = p.lab || {}, eg = num(p.egfr), vd = num(p.vitd), ci = p.ci || {}, fl = {};
  const add = (ids, kind, why) => ids.forEach(id => { (fl[id] = fl[id] || { ci:[], warn:[] })[kind].push(why); });
  if(S.hpp){ add(BISF, "ci", "fosfatasi alcalina bassa: escludere l'ipofosfatasia (bisfosfonati controindicati)"); add([D_, RO_], "warn", "fosfatasi alcalina bassa: escludere l'ipofosfatasia prima di qualsiasi antiriassorbitivo"); }
  if(eg !== null){
    if(eg < 35) add([A_, Z_], "ci", `eGFR ${fmtN(eg, 0)} mL/min (sotto 35)`);
    if(eg < 30){ add([R_, I_], "ci", `eGFR ${fmtN(eg, 0)} mL/min (sotto 30)`); add([T_, AB_], "ci", "insufficienza renale grave"); add([D_], "warn", "insufficienza renale grave: escludere CKD-MBD e osso adinamico, rischio di ipocalcemia (valutazione specialistica)"); }
  } else if(lab.eGFR === "basso") add([A_, R_, I_, Z_, D_], "warn", "eGFR ridotto: inserisci il valore per verificare le soglie");
  if(lab.Ca === "basso") add(ANTIRIASS, "ci", "ipocalcemia da correggere prima di iniziare");
  if(lab.Ca === "alto") add(ANABOL, "ci", "ipercalcemia");
  if(lab.PTH === "alto" && lab.Ca === "alto") add(ANABOL, "ci", "sospetto iperparatiroidismo");
  if(lab.ALP === "alto") add(ANABOL, "warn", "fosfatasi alcalina elevata da spiegare (Paget?)");
  if((vd !== null && vd < 20) || lab.D === "basso") add([...ANTIRIASS, ...ANABOL], "warn", "correggere prima la carenza di vitamina D" + (vd !== null ? ` (${fmtN(vd, 0)} ng/mL)` : ""));
  if(ci.esofago) add(ORALI, "ci", "disturbi esofagei o impossibilità a restare in piedi/seduti");
  if(ci.tev) add([RX_, BZ_], "ci", "tromboembolismo venoso pregresso");
  if(ci.cv || F.feats.has("ictus_emiplegia")){ add([RO_], "ci", "pregresso infarto o ictus / rischio cardiovascolare"); add([RX_, BZ_], "warn", "rischio di ictus"); }
  if(ci.rt) add(ANABOL, "ci", "radioterapia scheletrica o tumori ossei");
  if(ci.denti) add([...BISF, D_, RO_], "warn", "sistemare prima i problemi dentari (osteonecrosi della mandibola)");
  return fl;
}

/* ---------- rischio: categoria del DeFRA e rischio imminente ---------- */
function riskCat(r){
  if(r === null) return null;
  if(r >= 20) return { k:"alto", t:"Alto", cls:"d", txt:"Rischio a 10 anni ≥ 20%: la terapia farmacologica è indicata, accanto a calcio, vitamina D e prevenzione delle cadute." };
  if(r >= 10) return { k:"moderato", t:"Moderato", cls:"w", txt:"Rischio a 10 anni tra 10 e 20%: la terapia va decisa caso per caso; si prescrive a carico del SSN se il paziente rientra in una condizione della Nota 79." };
  return { k:"basso", t:"Basso", cls:"ok", txt:"Rischio a 10 anni sotto il 10%: di regola nessun farmaco per l'osteoporosi; stile di vita, calcio e vitamina D se carenti, e nuova valutazione nel tempo." };
}
function veryHigh(p, F){
  const r = [];
  if(F.recent.length) r.push("frattura da fragilità negli ultimi 24 mesi (rischio imminente di rifrattura)");
  if(F.nVF >= 3) r.push("3 o più fratture vertebrali o di femore");
  if(F.nVF >= 1 && F.minT !== null && F.minT <= -4) r.push("frattura con T-score ≤ −4");
  if(F.nVF >= 1 && F.gc) r.push("frattura in terapia con glucocorticoidi");
  if(F.fxInTerapia) r.push("nuova frattura durante la terapia");
  if(F.risk !== null && F.risk >= 30) r.push("rischio DeFRA ≥ 30%");
  return r;
}

/* ---------- prossima DXA e promemoria delle terapie ---------- */
function dxaPlan(F){
  if(!F.lastDxa) return { st:"miss", t:"Nessuna densitometria registrata", s:"Richiedi una DXA lombare e femorale: serve al DeFRA e alla Nota 79." };
  const d = pDate(F.lastDxa.data), from = addMonths(d, 18), to = addMonths(d, 24), now = new Date();
  if(now > to) return { st:"miss", t:"DXA da ripetere", s:`Ultima il ${fmtD(F.lastDxa.data)}: sono passati più di 24 mesi.` };
  if(now >= from) return { st:"warn", t:"DXA da programmare ora", s:`Ultima il ${fmtD(F.lastDxa.data)}: rientra nella finestra dei 18–24 mesi (entro ${fmtM(to)}).` };
  return { st:"ok", t:"Prossima DXA: " + fmtM(from) + " – " + fmtM(to), s:`Ultima il ${fmtD(F.lastDxa.data)}. Di regola ogni 18–24 mesi, con lo stesso apparecchio.` };
}
function therapyNotes(F){
  return F.ther.map(t => {
    const m = monthsSince(t.inizio), y = m === null ? null : m / 12, nome = DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : (t.farmaco || "Terapia");
    let s = "";
    if(t.farmaco === D_) s = "Non sospendere né ritardare (una dose ogni 6 mesi, al massimo 4 settimane di ritardo). Calcemia prima di ogni dose. Se si decide di sospendere, serve il passaggio a un bisfosfonato.";
    else if(ORALI.includes(t.farmaco)) s = y !== null && y >= 5 ? "Oltre 5 anni di bisfosfonato orale: rivalutare se proseguire o fare una pausa (se il rischio non è più alto)." : "Rivalutare dopo 5 anni. Controllare l'assunzione corretta e l'aderenza.";
    else if(t.farmaco === Z_) s = y !== null && y >= 3 ? "Oltre 3 anni di zoledronato: rivalutare se proseguire o sospendere." : "Rivalutare dopo 3 infusioni annuali.";
    else if(t.farmaco === T_) s = m !== null && m >= 18 ? "Si avvicina il limite di 24 mesi: pianificare con lo specialista il passaggio a un antiriassorbitivo." : "Massimo 24 mesi, poi sempre un antiriassorbitivo.";
    else if(t.farmaco === AB_) s = m !== null && m >= 12 ? "Si avvicina il limite di 18 mesi: pianificare il passaggio a un antiriassorbitivo." : "Massimo 18 mesi, poi un antiriassorbitivo.";
    else if(t.farmaco === RO_) s = m !== null && m >= 9 ? "Si avvicina il limite di 12 mesi: pianificare il passaggio a un antiriassorbitivo." : "12 mesi, poi un antiriassorbitivo.";
    else if(t.farmaco === RX_ || t.farmaco === BZ_) s = "Attenzione a tromboembolismo e ictus; sospendere in caso di immobilizzazione prolungata.";
    return { nome, da: t.inizio, durata: m === null ? "" : (m < 12 ? plural(Math.max(m, 0), "mese", "mesi") : fmtN(y, 1) + " anni"), s };
  });
}

/* ---------- cosa serve per il DeFRA ---------- */
function defraChecklist(p, F){
  const it = [];
  const push = (st, t, s) => it.push({ st, t, s });
  push(F.age === null ? "miss" : F.age < 50 ? "warn" : "ok", "Età", F.age === null ? "Inserisci la data di nascita." : F.age < 50 ? `${F.age} anni: il DeFRA si usa dai 50 anni.` : `${F.age} anni`);
  push(p.sesso ? "ok" : "miss", "Sesso", p.sesso ? (p.sesso === "donna" ? "Donna" + (p.postmeno === true ? ", in postmenopausa" : p.postmeno === false ? ", non in menopausa" : "") : "Uomo") : "Da indicare.");
  push(F.bmi ? "ok" : "miss", "Peso e altezza", F.bmi ? `${fmtN(num(p.peso), 0)} kg, ${fmtN(num(p.altezza), 0)} cm (BMI ${fmtN(F.bmi)})` : "Servono per il calcolo.");
  push(F.fx.length || p.nessunaFx ? "ok" : "miss", "Fratture da fragilità", F.fx.length ? `${F.vert.length} vertebrali, ${F.fem.length} di femore, ${F.oth.length} in altre sedi` : p.nessunaFx ? "Nessuna frattura pregressa" : "Registra le fratture pregresse o conferma che non ce ne sono. Pensa alle vertebrali silenti: una radiografia del rachide dorso-lombare se calo di statura o dorsalgia.");
  push(p.fam === null ? "miss" : "ok", "Familiarità", p.fam === null ? "Frattura di femore o vertebrale nei genitori: da chiedere." : p.fam ? "Sì, fratture di femore o vertebre nei genitori" : "No");
  push(p.anamOk ? "ok" : "miss", "Glucocorticoidi, fumo, alcol, malattie", p.anamOk ? [F.gc ? "glucocorticoidi" : "", F.feats.has("fumo") ? "fumo" : "", F.feats.has("alcol") ? "alcol ≥ 3 unità/die" : "", ...F.comorb].filter(Boolean).join(", ") || "Nessuno dei fattori del DeFRA" : "Compila anamnesi e terapie e confermale.");
  push(p.anamOk ? "ok" : "miss", "Terapia ormonale adiuvante", p.anamOk ? (F.adj ? "Sì (" + [F.feats.has("aromatasi") ? "inibitori dell'aromatasi" : "", F.feats.has("adt") ? "deprivazione androgenica" : ""].filter(Boolean).join(", ") + ")" : "No") : "Inibitori dell'aromatasi o deprivazione androgenica: dall'anamnesi.");
  const hasT = F.lastDxa && (num(F.lastDxa.tL) !== null || num(F.lastDxa.tFt) !== null || num(F.lastDxa.tFn) !== null);
  push(!hasT ? "miss" : F.dxaAge > 24 ? "warn" : "ok", "Densitometria (DXA) lombare e femorale", !hasT ? "Serve una DXA con il T-score di colonna e femore." : `T-score del ${fmtD(F.lastDxa.data)}: colonna ${fmtN(num(F.lastDxa.tL))}, femore totale ${fmtN(num(F.lastDxa.tFt))}, collo ${fmtN(num(F.lastDxa.tFn))}` + (F.dxaAge > 24 ? " — più vecchia di 24 mesi" : ""));
  return it;
}
function labStatus(p){
  const lab = p.lab || {}, done = PZ_EXAMS.filter(e => lab[e.id]).length;
  return { done, tot: PZ_EXAMS.length };
}
const ST_LBL = { ok:"ok", miss:"manca", warn:"attenzione" };
const stTag = st => `<span class="st ${st}">${ST_LBL[st]}</span>`;

/* ---------- elenco pazienti ---------- */
function vPazienti(){
  const rows = PZ.slice().sort((a, b) => pzName(a).localeCompare(pzName(b), "it", { sensitivity:"base" })).map(p => {
    const F = pzFacts(p), pl = dxaPlan(F), bits = [p.sesso ? (p.sesso === "donna" ? "Donna" : "Uomo") : "", F.age !== null ? F.age + " anni" : "", F.risk !== null ? "DeFRA " + fmtN(F.risk) + "%" : ""].filter(Boolean).join(" · ");
    return `<a class="rowlink pzrow" href="#paz-${p.id}" data-q="${hx(pzName(p).toLowerCase())}"><span>${hx(pzName(p))}<small>${bits || "Dati da completare"}${pl.st !== "ok" ? ` · <b class="st-t ${pl.st}">${pl.t}</b>` : ""}</small></span>${CHEV}</a>`;
  }).join("");
  return { bar:"Pazienti", html: head("I miei pazienti", "Dalla raccolta dei dati al DeFRA, alla terapia e al follow-up.") + `
    <div class="btns"><button type="button" class="btn" id="pzNew">+ Nuovo paziente</button><a class="btn sec" href="#guida">Guida per il MMG</a><a class="btn sec" href="${OH}" target="_blank" rel="noopener">Osteo Help ↗</a></div>
    ${PZ.length > 5 ? `<input class="search" id="pzQ" type="search" placeholder="Cerca un paziente" autocomplete="off">` : ""}
    ${PZ.length ? `<div class="rows" id="pzList">${rows}</div>` : `<p class="hint">Nessun paziente in archivio. Inizia con «Nuovo paziente».</p>`}
    ${pzStorageOk ? "" : `<div class="alert"><b>Archivio non disponibile</b>Il browser non permette di salvare i dati (navigazione privata o dati del sito bloccati): i pazienti inseriti andranno persi alla chiusura.</div>`}
    <p class="lbl">Privacy e backup</p>
    <p class="small">I dati restano <b>solo in questo browser, su questo dispositivo</b>: non vengono inviati a nessun server. Se il dispositivo è condiviso usa le iniziali o un codice al posto del nome. Cancellando i dati del browser si perde l'archivio: salva ogni tanto un backup, che serve anche a spostare l'archivio su un altro dispositivo.</p>
    <div class="btns"><button type="button" class="btn sec" id="pzExport"${PZ.length ? "" : " disabled"}>Salva backup</button><label class="btn sec">Ripristina backup<input type="file" id="pzImport" accept="application/json,.json" hidden></label></div>` };
}

/* ---------- scheda del paziente (riepilogo) ---------- */
function pzLink(p, sez, title, sub, st, icon){
  return `<a class="entry plain pzsec" href="#paz-${p.id}-${sez}"><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</div>${st ? stTag(st) : ""}${CHEV}</a>`;
}
function vPaz(p){
  const F = pzFacts(p), S = pzSecondary(p), chk = defraChecklist(p, F), miss = chk.filter(x => x.st !== "ok").length, ls = labStatus(p), pl = dxaPlan(F);
  const nSec = S.N.note.length + S.N.sosp.length, nA = S.A.forms.length, rc = riskCat(F.risk), vh = veryHigh(p, F);
  const info = [p.sesso ? (p.sesso === "donna" ? "Donna" : "Uomo") : "", F.age !== null ? F.age + " anni" : "", F.bmi ? "BMI " + fmtN(F.bmi) : ""].filter(Boolean).join(" · ");
  return { bar:"Scheda paziente", html: head(hx(pzName(p)), info || "Dati anagrafici da completare") + `
    <div class="kpis">
      <div class="kpi"><small>Rischio DeFRA</small><b>${F.risk !== null ? fmtN(F.risk) + "%" : "—"}</b><span>${rc ? rc.t + " · " + fmtD(F.lastDefra.data) : "non inserito"}</span></div>
      <div class="kpi"><small>T-score minimo</small><b>${F.minT !== null ? fmtN(F.minT) : "—"}</b><span>${F.lastDxa ? "DXA " + fmtD(F.lastDxa.data) : "nessuna DXA"}</span></div>
    </div>
    ${vh.length ? `<div class="alert"><b>Rischio di frattura molto alto</b>${vh.join("; ")}. Priorità alla terapia; valuta l'invio allo specialista per un farmaco anabolico.</div>` : ""}
    ${S.hpp ? `<div class="alert"><b>Fosfatasi alcalina bassa</b>Escludi l'ipofosfatasia prima di qualsiasi antiriassorbitivo: i bisfosfonati sono controindicati. <a target="_blank" rel="noopener" href="${OH}#causa-gen_ipofosfatasia">Apri la scheda</a></div>` : ""}
    <div class="stack">
      ${pzLink(p, "dati", "1 · Dati e fratture", "Anagrafica, menopausa, fratture, familiarità", F.bmi && (F.fx.length || p.nessunaFx) && p.fam !== null ? "ok" : "miss")}
      ${pzLink(p, "anamnesi", "2 · Anamnesi e terapie", (p.feats || []).length ? plural(p.feats.length, "elemento", "elementi") + " · " + (nSec ? plural(nSec, "forma secondaria", "forme secondarie") + " da considerare" : "nessuna forma secondaria associata") : "Farmaci, malattie, segni, stile di vita", p.anamOk ? (nSec ? "warn" : "ok") : "miss")}
      ${pzLink(p, "esami", "3 · Esami di I livello", `${ls.done} di ${ls.tot} esami registrati` + (nA ? " · " + plural(nA, "forma compatibile", "forme compatibili") : ""), ls.done < ls.tot ? "miss" : nA || S.hpp ? "warn" : "ok")}
      ${pzLink(p, "defra", "4 · DeFRA e rischio di frattura", miss ? plural(miss, "dato da completare", "dati da completare") + " per il DeFRA" : "Dati pronti" + (F.risk === null ? ": calcola il rischio" : ""), miss ? "miss" : F.risk === null ? "warn" : "ok")}
      ${pzLink(p, "terapia", "5 · Indicazioni alla terapia", F.ther.length ? "In corso: " + F.ther.map(t => DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : t.farmaco).join(", ") : "Nota 79, controindicazioni, terapia in corso", "")}
      ${pzLink(p, "storico", "6 · Storico e follow-up", pl.t, pl.st)}
      ${pzLink(p, "report", "Report", "Riepilogo da stampare o salvare in PDF", "")}
    </div>
    <p class="lbl">Note</p>
    <textarea class="area" data-pf="note" rows="3" placeholder="Note libere">${hx(p.note)}</textarea>
    <div class="btns"><button type="button" class="btn danger" id="pzDel">Elimina paziente</button></div>` };
}

/* ---------- 1 · dati e fratture ---------- */
const segPz = (key, val, txt, cur) => `<button type="button" data-pset="${key}" data-val="${val}" aria-pressed="${cur === val}">${txt}</button>`;
const ckPz = (attr, key, on, txt) => `<button type="button" class="ck" ${attr}="${key}" aria-pressed="${!!on}"><span class="cb">${TICK}</span><span>${txt}</span></button>`;
function vPazDati(p){
  const F = pzFacts(p);
  const fxRows = F.fx.map(f => `<li class="rec"><span><b>${FX_SEDI[f.sede] || f.sede}${f.sede === "vertebra" && f.grado ? " · " + f.grado : ""}</b><small>${fmtD(f.data)}${f.inTerapia ? " · durante terapia da ≥1 anno" : ""}</small></span><button type="button" class="x" data-del="fratture:${p.fratture.indexOf(f)}" aria-label="Elimina">✕</button></li>`).join("");
  return { bar: pzName(p), html: head("Dati e fratture") + `
    <div class="grid2">
      <label class="fld" style="grid-column:1/-1">Nome, iniziali o codice<input type="text" data-pf="nome" value="${hx(p.nome)}" autocomplete="off"></label>
      <label class="fld">Data di nascita<input type="date" data-pf="nascita" value="${hx(p.nascita)}"></label>
      <div class="fld">Sesso<div class="seg" role="group">${segPz("sesso", "donna", "Donna", p.sesso)}${segPz("sesso", "uomo", "Uomo", p.sesso)}</div></div>
      <label class="fld">Peso (kg)<input type="number" inputmode="decimal" data-pf="peso" value="${hx(p.peso)}"></label>
      <label class="fld">Altezza (cm)<input type="number" inputmode="decimal" data-pf="altezza" value="${hx(p.altezza)}"></label>
    </div>
    <p class="small" data-live="bmi">${F.bmi ? "BMI " + fmtN(F.bmi) + " kg/m²" + (F.bmi < 20 ? " — basso peso: è un fattore di rischio" : "") : ""}</p>
    ${p.sesso === "donna" ? `<div class="fld">In postmenopausa?<div class="seg" role="group">${segPz("postmeno", true, "Sì", p.postmeno)}${segPz("postmeno", false, "No", p.postmeno)}</div></div>` : ""}
    <div class="fld">Frattura di femore o vertebrale in uno dei genitori?<div class="seg" role="group">${segPz("fam", true, "Sì", p.fam)}${segPz("fam", false, "No", p.fam)}</div></div>
    <p class="lbl">Fratture da fragilità</p>
    <p class="small">Fratture per traumi minimi (cadere dalla propria altezza o meno). Le vertebrali con il criterio di Genant: lieve 20–25%, moderata 25–40%, grave oltre il 40% di riduzione di un'altezza vertebrale.</p>
    ${fxRows ? `<ul class="list recs">${fxRows}</ul>` : ckPz("data-pbool", "nessunaFx", p.nessunaFx, "Nessuna frattura da fragilità pregressa")}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Sede<select id="fxSede">${Object.entries(FX_SEDI).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label class="fld">Data (anche approssimativa)<input type="date" id="fxData"></label>
        <label class="fld">Gravità (vertebre)<select id="fxGrado"><option value="">non nota</option>${Object.entries(FX_GRADO).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      </div>
      ${ckPz("data-tmp", "fxInT", false, "Avvenuta nonostante almeno 1 anno di terapia per l'osteoporosi")}
      <button type="button" class="btn sec" data-add="fratture">Aggiungi frattura</button>
    </div>` };
}

/* ---------- 2 · anamnesi e terapie ---------- */
const pzOpenAx = new Set();
function secReport(p, S){
  const item = (x, isSosp) => `<a class="entry ${x.hasForte ? "teal" : ""}" target="_blank" rel="noopener" href="${OH}#causa-${x.f.id}"><div><b>${x.f.nome}</b><small>${FORMA_CAT[x.f.cat] || x.f.cat} · <span class="badge ${x.hasForte ? "forte" : "lieve"}">${badgeOf(x, isSosp)}</span> · ${x.fired.filter(t => t[2] !== "supp").map(t => FEATLABEL[t[0]]).join(", ")}</small></div>${CHEV}</a>`;
  if(!(p.feats || []).length) return `<p class="hint">Spunta farmaci, malattie, segni e abitudini: le forme secondarie compaiono qui.</p>`;
  if(!S.N.note.length && !S.N.sosp.length) return `<div class="alert ok"><b>Nessuna forma secondaria associata</b>Gli elementi spuntati non orientano verso cause secondarie note. Restano da valutare gli esami di I livello.</div>`;
  return (S.N.note.length ? `<p class="lbl">Cause note presenti</p><div class="stack">${S.N.note.map(x => item(x, false)).join("")}</div>` : "") +
    (S.N.sosp.length ? `<p class="lbl">Sospetti da approfondire</p><div class="stack">${S.N.sosp.map(x => item(x, true)).join("")}</div>` : "");
}
function vPazAnamnesi(p){
  const own = new Set(p.feats || []), vis = id => !FEATSEX[id] || !p.sesso || FEATSEX[id] === p.sesso;
  const axes = AXES.map((a, i) => {
    const all = axisFeats(a).filter(f => vis(f[0])); if(!all.length) return "";
    const nsel = all.filter(f => own.has(f[0])).length;
    const body = a.groups.map(g => { const fs = g.feats.filter(f => vis(f[0])); return fs.length ? `<p class="lbl" style="margin:10px 0 0">${g.sub}</p><div>` + fs.map(f => ckPz("data-pfeat", f[0], own.has(f[0]), f[1])).join("") + `</div>` : ""; }).join("");
    return `<details class="acc pzax" data-pax="${i}"${pzOpenAx.has(i) ? " open" : ""}><summary><span>${a.label}</span><span class="n"${nsel ? "" : " hidden"}>${nsel}</span>${CHEV}</summary><div class="accbody">${body}</div></details>`;
  }).join("");
  return { bar: pzName(p), html: head("Anamnesi e terapie", "Le stesse voci di «Esami normali»: le forme secondarie vengono riconosciute in automatico.") + `
    ${p.sesso ? "" : `<p class="hint">Indica il sesso nei dati del paziente per nascondere le voci non pertinenti.</p>`}
    <div>${axes}</div>
    <p class="lbl">Altri dati per DeFRA e Nota 79</p>
    <div>
      ${ckPz("data-pbool", "gcMesi12", p.gcMesi12, "Glucocorticoidi (prednisone ≥5 mg/die) da più di 12 mesi")}
      ${ckPz("data-pbool", "disab", p.disab, "Grave disabilità motoria")}
    </div>
    <p class="lbl">Controindicazioni da conoscere prima della terapia</p>
    <div>
      ${ckPz("data-pci", "esofago", (p.ci || {}).esofago, "Disturbi esofagei (stenosi, acalasia) o impossibilità a stare in piedi o seduti per 30 minuti")}
      ${ckPz("data-pci", "tev", (p.ci || {}).tev, "Tromboembolismo venoso pregresso")}
      ${ckPz("data-pci", "cv", (p.ci || {}).cv, "Pregresso infarto o ictus, alto rischio cardiovascolare")}
      ${ckPz("data-pci", "rt", (p.ci || {}).rt, "Radioterapia sullo scheletro, tumori o metastasi ossee")}
      ${ckPz("data-pci", "denti", (p.ci || {}).denti, "Problemi dentari aperti o cure dentarie invasive programmate")}
    </div>
    <div class="confirm">${ckPz("data-pbool", "anamOk", p.anamOk, "<b>Anamnesi e terapie verificate</b> (anche se non c'è nulla da spuntare)")}</div>
    <p class="lbl">Forme secondarie riconosciute</p>
    <div data-live="sec">${secReport(p, pzSecondary(p))}</div>` };
}

/* ---------- 3 · esami di I livello ---------- */
function labReport(p, S){
  const A = S.A, lab = p.lab || {}, out = [];
  if(S.hpp) out.push(`<div class="alert"><b>Fosfatasi alcalina bassa: pensa all'ipofosfatasia</b>Prima di un antiriassorbitivo dosa la vitamina B6 (piridossal-5-fosfato) e, se serve, la fosfoetanolammina urinaria. I bisfosfonati sono controindicati. <a target="_blank" rel="noopener" href="${OH}#causa-gen_ipofosfatasia">Scheda</a></div>`);
  if(lab.Ca === "basso") out.push(`<div class="alert"><b>Ipocalcemia</b>Va corretta (e spiegata) prima di qualsiasi antiriassorbitivo, in particolare denosumab e zoledronato.</div>`);
  const vd = num(p.vitd);
  if((vd !== null && vd < 20) || lab.D === "basso") out.push(`<div class="alert info"><b>Vitamina D bassa</b>Correggi la carenza prima di iniziare la terapia: la carenza ne riduce l'efficacia e aumenta il rischio di ipocalcemia.</div>`);
  if(A.kind === "none") out.push(`<p class="hint">${labStatus(p).done ? "Tutti gli esami registrati sono nella norma." : "Segna ▲ o ▼ gli esami fuori norma e N quelli nella norma."}</p>`);
  else {
    const tags = `<div class="tags">${A.sel.map(s => `<span class="tag ${s[1]}">${ftag(s)}</span>`).join("")}</div>`;
    out.push(`<p class="lbl">${A.kind === "inter" ? "Forme compatibili" : A.kind === "multi" ? "Più cause possibili" : "Nessuna forma nota"}</p>` + tags +
      (A.forms.length ? `<div class="stack">${A.forms.map(x => ohEntry("forma-" + x.cid, COND[x.cid], x.sub)).join("")}</div>` : `<p class="hint">Nessuna forma in elenco spiega questi reperti.</p>`) +
      (A.panel.length ? `<p class="lbl">Esami di II livello suggeriti</p><ul class="list">${A.panel.slice(0, 8).map((x, i) => `<li><i>${i + 1}</i>${x[0]}${x[1] > 1 ? `<em>comune a ${x[1]}</em>` : ""}</li>`).join("")}</ul>` : ""));
  }
  return out.join("");
}
function vPazEsami(p){
  const lab = p.lab || {};
  const btn = (ex, kind, txt, cls, lbl) => `<button type="button" class="${cls}" data-pex="${ex}" data-kind="${kind}" aria-pressed="${lab[ex] === kind}" aria-label="${lbl}">${txt}</button>`;
  const grid = COMBO_GROUPS.map(g => `<p class="lbl">${g.label}</p><div>` + g.exams.map(e => `<div class="row"><span>${e.name}</span><div class="tri">${
    e.binary ? btn(e.id, "pres", "Presente", "u", e.name + " presente") + btn(e.id, "norm", "Assente", "n", e.name + " assente")
      : btn(e.id, "alto", "▲", "u", e.name + " alto") + btn(e.id, "norm", "N", "n", e.name + " normale") + btn(e.id, "basso", "▼", "d", e.name + " basso")}</div></div>`).join("") + `</div>`).join("");
  return { bar: pzName(p), html: head("Esami di I livello", "Per escludere le forme secondarie prima di trattare. Segna ▲ ▼ gli esami fuori norma e N quelli nella norma.") + `
    <div class="grid2">
      <label class="fld">Data dei prelievi<input type="date" data-pf="labData" value="${hx(p.labData)}"></label>
      <label class="fld">eGFR (mL/min)<input type="number" inputmode="decimal" data-pf="egfr" value="${hx(p.egfr)}"></label>
      <label class="fld">25-OH-vitamina D (ng/mL)<input type="number" inputmode="decimal" data-pf="vitd" value="${hx(p.vitd)}"></label>
    </div>
    <div id="pzGrid">${grid}</div>
    <p class="small">Nell'uomo aggiungi il testosterone totale; in base alla clinica anti-transglutaminasi con IgA totali, PTH e TSH se non già eseguiti.</p>
    <div data-live="lab">${labReport(p, pzSecondary(p))}</div>` };
}

/* ---------- 4 · DeFRA ---------- */
function defraSummary(p, F){
  const r = [];
  r.push(["Sesso ed età", (p.sesso ? (p.sesso === "donna" ? "donna" : "uomo") : "—") + ", " + (F.age !== null ? F.age + " anni" : "—")]);
  r.push(["Peso / altezza", (p.peso || "—") + " kg / " + (p.altezza || "—") + " cm"]);
  r.push(["Fratture vertebrali", F.vert.length ? F.vert.length + " (" + F.vert.map(f => f.grado || "gravità non nota").join(", ") + ")" : "nessuna"]);
  r.push(["Fratture di femore", F.fem.length || "nessuna"]);
  r.push(["Altre fratture", F.oth.length ? F.oth.map(f => FX_SEDI[f.sede]).join(", ") : "nessuna"]);
  r.push(["Familiarità femore/vertebre", p.fam === null ? "—" : p.fam ? "sì" : "no"]);
  r.push(["Fumo / alcol", (F.feats.has("fumo") ? "fumatore" : "non fumatore") + " / " + (F.feats.has("alcol") ? "≥ 3 unità al giorno" : "no")]);
  r.push(["Glucocorticoidi", F.gc ? "sì" + (p.gcMesi12 ? ", da oltre 12 mesi" : "") : "no"]);
  r.push(["Malattie", F.comorb.length ? F.comorb.join(", ") : "nessuna delle malattie del DeFRA"]);
  r.push(["Terapia adiuvante", F.adj ? "sì" : "no"]);
  if(F.lastDxa) r.push(["T-score (" + fmtD(F.lastDxa.data) + ")", "colonna " + fmtN(num(F.lastDxa.tL)) + " · femore totale " + fmtN(num(F.lastDxa.tFt)) + " · collo " + fmtN(num(F.lastDxa.tFn))]);
  return `<ul class="list kv">${r.map(x => `<li><span>${x[0]}</span><em>${x[1]}</em></li>`).join("")}</ul>`;
}
function defraLive(p){
  const F = pzFacts(p), chk = defraChecklist(p, F), miss = chk.filter(x => x.st === "miss").length;
  return `<ul class="list chk">${chk.map(x => `<li>${stTag(x.st)}<span><b>${x.t}</b><small>${x.s}</small></span></li>`).join("")}</ul>
    ${miss ? `<div class="alert info"><b>${plural(miss, "dato manca", "dati mancano")}</b>Completa prima i dati, poi apri il DeFRA.</div>` : `<div class="alert ok"><b>Dati pronti per il DeFRA</b>Riportali nel calcolatore e torna qui a inserire il rischio.</div>`}
    <p class="lbl">Da riportare nel DeFRA</p>${defraSummary(p, F)}`;
}
function vPazDefra(p){
  const F = pzFacts(p), rc = riskCat(F.risk);
  const hist = F.defra.map(d => `<li class="rec"><span><b>${fmtN(num(d.rischio))}%</b><small>${fmtD(d.data)}${d.note ? " · " + hx(d.note) : ""}</small></span><button type="button" class="x" data-del="defra:${p.defra.indexOf(d)}" aria-label="Elimina">✕</button></li>`).join("");
  return { bar: pzName(p), html: head("DeFRA e rischio di frattura", "Il DeFRA (SIOMMMS e SIR) stima il rischio di frattura osteoporotica maggiore a 10 anni, unendo DXA e fattori clinici.") + `
    <p class="lbl">Cosa serve</p>
    <div data-live="defra">${defraLive(p)}</div>
    <div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>
    <p class="lbl">Rischio calcolato</p>
    ${rc ? `<div class="alert ${rc.cls === "d" ? "" : rc.cls === "w" ? "warn" : "ok"}"><b>${rc.t}: ${fmtN(F.risk)}% a 10 anni (${fmtD(F.lastDefra.data)})</b>${rc.txt} <a href="#paz-${p.id}-terapia">Indicazioni alla terapia</a></div>` : ""}
    ${hist ? `<ul class="list recs">${hist}</ul>` : ""}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Rischio a 10 anni (%)<input type="number" inputmode="decimal" id="dfR" step="0.1"></label>
        <label class="fld">Data<input type="date" id="dfD" value="${todayISO()}"></label>
        <label class="fld" style="grid-column:1/-1">Nota (facoltativa)<input type="text" id="dfN"></label>
      </div>
      <button type="button" class="btn sec" data-add="defra">Aggiungi risultato</button>
    </div>
    <p class="small">Soglie usate dall'app (orientative): sotto il 10% basso, 10–20% moderato, 20% e oltre alto. La soglia del 20% è quella che la Nota 79 usa per il romosozumab. La rimborsabilità dipende comunque dalle condizioni della Nota 79, nella pagina successiva.</p>` };
}

/* ---------- 5 · terapia ---------- */
function choiceHTML(p, F, fl, ids){
  return ids.map(id => { const f = fl[id];
    return `<span class="dchip${f && f.ci.length ? " ci" : f && f.warn.length ? " warn" : ""}">${dlink(id)}${f && f.ci.length ? " <i>controindicato</i>" : f && f.warn.length ? " <i>cautela</i>" : ""}</span>`; }).join("");
}
function therapyLive(p){
  const F = pzFacts(p), S = pzSecondary(p), fl = drugFlags(p, F, S), n79 = nota79(p, F), rc = riskCat(F.risk), vh = veryHigh(p, F), ls = labStatus(p);
  const pre = [];
  if(ls.done < ls.tot) pre.push(`Esami di I livello incompleti (${ls.done} di ${ls.tot}): <a href="#paz-${p.id}-esami">completa</a> per escludere le forme secondarie.`);
  if(S.N.sosp.length || S.N.note.length) pre.push(`${plural(S.N.note.length + S.N.sosp.length, "forma secondaria", "forme secondarie")} dall'anamnesi: <a href="#paz-${p.id}-anamnesi">vedi</a>. Alcune si curano rimuovendo la causa.`);
  if(S.A.forms.length) pre.push(`Esami compatibili con: ${S.A.forms.map(x => COND[x.cid]).join(", ")}.`);
  if(F.risk === null) pre.push(`Manca il rischio del DeFRA: <a href="#paz-${p.id}-defra">calcolalo</a>.`);
  if(!F.lastDxa) pre.push("Manca la densitometria: senza T-score molte condizioni della Nota 79 non si possono valutare.");
  const tiers = ["I scelta", "II scelta", "III scelta"];
  const n79html = n79.length ? n79.map(c => `<div class="n79${c.spec ? " spec" : ""}"><small>${c.sez}${c.spec ? " · specialista, piano terapeutico" : ""}</small><b>${c.cond}</b>${c.s.map((l, i) => l.length ? `<div class="tier"><span>${c.alt && c.s.length === 1 ? "Opzione" : tiers[i]}</span><div>${choiceHTML(p, F, fl, l)}</div></div>` : "").join("")}</div>`).join("")
    : `<p class="hint">Con i dati inseriti il paziente non rientra in nessuna condizione della Nota 79${F.minT === null ? " (manca il T-score)" : ""}. Un farmaco resta possibile fuori Nota (a carico del paziente) se il rischio lo giustifica.</p>`;
  const flagList = DRUG_ORDER.filter(id => fl[id] && (fl[id].ci.length || fl[id].warn.length)).map(id => `<li><span><b>${DRUGS[id].nome}</b><small>${[...fl[id].ci.map(x => "controindicato: " + x), ...fl[id].warn.map(x => "cautela: " + x)].join(" · ")}</small></span></li>`).join("");
  return `
    ${pre.length ? `<div class="alert info"><b>Prima di scegliere</b>${pre.join("<br>")}</div>` : ""}
    ${vh.length ? `<div class="alert"><b>Rischio molto alto</b>${vh.join("; ")}. Considera l'invio allo specialista per un anabolico (teriparatide, abaloparatide, romosozumab) seguito da un antiriassorbitivo.</div>` : ""}
    ${rc ? `<div class="alert ${rc.cls === "d" ? "" : rc.cls === "w" ? "warn" : "ok"}"><b>DeFRA ${fmtN(F.risk)}% · rischio ${rc.t.toLowerCase()}</b>${rc.txt}</div>` : ""}
    <p class="lbl">Condizioni della Nota 79</p>${n79html}
    ${flagList ? `<p class="lbl">Controindicazioni e cautele per questo paziente</p><ul class="list chk">${flagList}</ul>` : ""}
    <p class="lbl">Per tutti</p>
    <ul class="list"><li><i>1</i>Calcio con la dieta 1000–1200 mg al giorno (integratore solo se la dieta non basta)</li><li><i>2</i>Vitamina D: correggere la carenza; in terapia per l'osteoporosi è rimborsabile senza dosaggio (Nota 96)</li><li><i>3</i>Attività fisica, prevenzione delle cadute, stop al fumo, alcol con moderazione</li><li><i>4</i>Visita odontoiatrica prima di bisfosfonati, denosumab o romosozumab</li></ul>`;
}
function vPazTerapia(p){
  const F = pzFacts(p), notes = therapyNotes(F);
  const all = (p.terapie || []).slice().sort((a, b) => (b.inizio || "").localeCompare(a.inizio || ""));
  const rows = all.map(t => `<li class="rec"><span><b>${DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : hx(t.farmaco)}</b><small>dal ${fmtD(t.inizio)}${t.fine ? " al " + fmtD(t.fine) : " · in corso"}${t.note ? " · " + hx(t.note) : ""}</small></span>${t.fine ? "" : `<button type="button" class="btn sec mini" data-stop="${p.terapie.indexOf(t)}">Termina</button>`}<button type="button" class="x" data-del="terapie:${p.terapie.indexOf(t)}" aria-label="Elimina">✕</button></li>`).join("");
  return { bar: pzName(p), html: head("Indicazioni alla terapia", "Dal rischio del DeFRA e dalle condizioni della Nota 79 (determina AIFA dell'8 settembre 2025), con le controindicazioni del paziente.") + `
    <div data-live="ter">${therapyLive(p)}</div>
    <p class="lbl">Terapie per l'osteoporosi</p>
    ${notes.length ? notes.map(n => `<div class="alert info"><b>${n.nome} · ${n.durata ? "da " + n.durata : "in corso"}</b>${n.s}</div>`).join("") : ""}
    ${rows ? `<ul class="list recs">${rows}</ul>` : `<p class="hint">Nessuna terapia registrata.</p>`}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Farmaco<select id="thF">${DRUG_ORDER.map(id => `<option value="${id}">${DRUGS[id].nome}</option>`).join("")}</select></label>
        <label class="fld">Inizio<input type="date" id="thI" value="${todayISO()}"></label>
        <label class="fld" style="grid-column:1/-1">Nota (facoltativa)<input type="text" id="thN"></label>
      </div>
      <button type="button" class="btn sec" data-add="terapie">Aggiungi terapia</button>
    </div>
    <p class="small">Ausilio alla decisione: verificare sempre il testo vigente della Nota 79 e le schede tecniche.</p>` };
}

/* ---------- 6 · storico e follow-up ---------- */
const SERIES = [["tL", "Colonna", "#2a78d6"], ["tFt", "Femore totale", "#eb6834"], ["tFn", "Collo femorale", "#1baf7a"]];
function lineChart(points, series, opt){
  /* points: [{x:Date, ...valori}]; un asse solo, etichette dirette sull'ultimo punto */
  const W = 520, H = opt.h || 200, L = 40, R = 104, T = 14, B = 26;
  const xs = points.map(pt => pt.x.getTime()), x0 = Math.min(...xs), x1 = Math.max(...xs), span = x1 - x0 || 1;
  const vals = points.flatMap(pt => series.map(s => pt[s[0]]).filter(v => v !== null));
  let y0 = Math.min(...vals, ...(opt.ref || [])), y1 = Math.max(...vals, ...(opt.ref || []));
  y0 = Math.floor(y0 - .5); y1 = Math.ceil(y1 + .5); if(opt.min !== undefined) y0 = Math.min(y0, opt.min); if(opt.max !== undefined) y1 = Math.max(y1, opt.max);
  const X = t => points.length === 1 ? L + (W - L - R) / 2 : L + (t - x0) / span * (W - L - R), Y = v => T + (y1 - v) / (y1 - y0 || 1) * (H - T - B);
  const step = (y1 - y0) > 12 ? 5 : (y1 - y0) > 5 ? 2 : 1, ticks = []; for(let v = Math.ceil(y0 / step) * step; v <= y1; v += step) ticks.push(v);
  let g = ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" class="ax">${String(v).replace("-", "−")}</text>`).join("");
  (opt.ref || []).forEach((v, i) => { g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="rl"/><text x="${L + 4}" y="${Y(v) - 4}" class="ax">${opt.refLbl[i]}</text>`; });
  g += [points[0], points[points.length - 1]].filter((v, i, a) => a.indexOf(v) === i).map(pt => `<text x="${X(pt.x.getTime())}" y="${H - 6}" text-anchor="middle" class="ax">${fmtM(pt.x)}</text>`).join("");
  const used = [];
  series.forEach(s => {
    const pts = points.filter(pt => pt[s[0]] !== null); if(!pts.length) return;
    if(pts.length > 1) g += `<polyline fill="none" stroke="${s[2]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.map(pt => X(pt.x.getTime()) + "," + Y(pt[s[0]])).join(" ")}"/>`;
    g += pts.map(pt => `<circle cx="${X(pt.x.getTime())}" cy="${Y(pt[s[0]])}" r="4.5" fill="${s[2]}" stroke="var(--bg)" stroke-width="2"><title>${s[1]} · ${fmtM(pt.x)}: ${fmtN(pt[s[0]])}${opt.unit || ""}</title></circle>`).join("");
    const last = pts[pts.length - 1]; let ly = Y(last[s[0]]) + 4; while(used.some(u => Math.abs(u - ly) < 13)) ly += 13; used.push(ly);
    if(series.length > 1) g += `<text x="${W - R + 22}" y="${ly}" class="dl">${s[1]}</text>`;
  });
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label}">${g}</svg>${series.length > 1 ? `<figcaption class="legend">${series.map(s => `<span><i style="background:${s[2]}"></i>${s[1]}</span>`).join("")}</figcaption>` : ""}</figure>`;
}
function vPazStorico(p){
  const F = pzFacts(p), pl = dxaPlan(F), asc = F.dxa.slice().reverse();
  const dxaRows = F.dxa.map((d, i) => { const prev = F.dxa[i + 1], dl = prev && num(d.tL) !== null && num(prev.tL) !== null ? num(d.tL) - num(prev.tL) : null;
    return `<li class="rec"><span><b>${fmtD(d.data)}</b><small>colonna ${fmtN(num(d.tL))} · femore totale ${fmtN(num(d.tFt))} · collo ${fmtN(num(d.tFn))}${dl !== null ? ` · colonna ${dl >= 0 ? "+" : "−"}${fmtN(Math.abs(dl))} rispetto alla precedente` : ""}</small></span><button type="button" class="x" data-del="dxa:${p.dxa.indexOf(d)}" aria-label="Elimina">✕</button></li>`; }).join("");
  const dxaChart = asc.length >= 1 && asc.some(d => [d.tL, d.tFt, d.tFn].some(v => num(v) !== null)) ? lineChart(asc.filter(d => pDate(d.data)).map(d => ({ x: pDate(d.data), tL: num(d.tL), tFt: num(d.tFt), tFn: num(d.tFn) })), SERIES, { label:"Andamento del T-score", ref:[-2.5], refLbl:["−2,5"] }) : "";
  const dfAsc = F.defra.slice().reverse().filter(d => pDate(d.data) && num(d.rischio) !== null);
  const dfChart = dfAsc.length ? lineChart(dfAsc.map(d => ({ x: pDate(d.data), r: num(d.rischio) })), [["r", "Rischio DeFRA", "#2a78d6"]], { label:"Andamento del rischio DeFRA", ref:[10, 20], refLbl:["10%", "20%"], min:0, unit:"%" }) : "";
  const imm = F.recent.length ? `<div class="alert"><b>Rischio imminente di rifrattura</b>${plural(F.recent.length, "frattura", "fratture")} negli ultimi 24 mesi (l'ultima il ${fmtD(F.recent[0].data)}). Dopo una frattura il rischio di una nuova frattura è massimo nei primi 1–2 anni: la terapia va iniziata o rivista subito, insieme alla prevenzione delle cadute.</div>`
    : F.fx.length ? `<div class="alert info"><b>Rischio di rifrattura</b>Una frattura da fragilità all'incirca raddoppia il rischio di altre fratture, anche dopo anni. Ultima frattura: ${fmtD(F.fx[0].data)}.</div>` : "";
  return { bar: pzName(p), html: head("Storico e follow-up", "Densitometrie, rischio DeFRA e fratture nel tempo.") + `
    <div class="alert ${pl.st === "ok" ? "ok" : pl.st === "warn" ? "warn" : ""}"><b>${pl.t}</b>${pl.s}${F.gc ? " Con glucocorticoidi ad alte dosi si può anticipare a 12 mesi." : ""}</div>
    ${imm}
    <p class="lbl">Densitometria (T-score)</p>
    ${dxaChart}
    ${dxaRows ? `<ul class="list recs">${dxaRows}</ul>` : `<p class="hint">Nessuna DXA registrata.</p>`}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Data<input type="date" id="dxD" value="${todayISO()}"></label>
        <label class="fld">T-score colonna (L1–L4)<input type="number" inputmode="decimal" step="0.1" id="dxL"></label>
        <label class="fld">T-score femore totale<input type="number" inputmode="decimal" step="0.1" id="dxFt"></label>
        <label class="fld">T-score collo femorale<input type="number" inputmode="decimal" step="0.1" id="dxFn"></label>
      </div>
      <p class="small">I T-score sono negativi: scrivi per esempio −2,7 come -2.7.</p>
      <button type="button" class="btn sec" data-add="dxa">Aggiungi DXA</button>
    </div>
    <p class="lbl">Rischio DeFRA nel tempo</p>
    ${dfChart || `<p class="hint">Nessun rischio registrato. <a href="#paz-${p.id}-defra">Inseriscilo</a>.</p>`}
    <p class="lbl">Fratture</p>
    ${F.fx.length ? `<ul class="list recs">${F.fx.map(f => `<li class="rec"><span><b>${FX_SEDI[f.sede]}${f.grado ? " · " + f.grado : ""}</b><small>${fmtD(f.data)}</small></span></li>`).join("")}</ul>` : `<p class="hint">${p.nessunaFx ? "Nessuna frattura da fragilità." : "Nessuna frattura registrata."}</p>`}
    <p class="small"><a href="#paz-${p.id}-dati">Aggiungi una frattura</a></p>` };
}

/* ---------- report ---------- */
function vPazReport(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), fl = drugFlags(p, F, S), rc = riskCat(F.risk), pl = dxaPlan(F), vh = veryHigh(p, F), lab = p.lab || {};
  const li = a => a.length ? `<ul class="list">${a.map(x => `<li>${x}</li>`).join("")}</ul>` : `<p class="note">—</p>`;
  const anam = (p.feats || []).map(id => FEATLABEL[id]).filter(Boolean);
  const labNorm = PZ_EXAMS.filter(e => lab[e.id] === "norm").map(e => e.name + (e.binary ? " (assente)" : ""));
  const labTxt = PZ_EXAMS.filter(e => lab[e.id] && lab[e.id] !== "norm").map(e => e.name + ": " + ({ alto:"alto ▲", basso:"basso ▼", pres:"presente" }[lab[e.id]])).concat(labNorm.length ? ["Nella norma: " + labNorm.join(", ")] : []);
  const nomi = ids => ids.map(id => DRUGS[id].nome.replace(/ \(.*\)$/, "") + (fl[id] && fl[id].ci.length ? " (controindicato)" : "")).join(", ");
  return { bar:"Report", html: `<div class="report">` + head("Report osteoporosi", hx(pzName(p)) + " · " + [p.sesso ? (p.sesso === "donna" ? "donna" : "uomo") : "", F.age !== null ? F.age + " anni" : "", F.bmi ? "BMI " + fmtN(F.bmi) : ""].filter(Boolean).join(", ") + " · " + fmtD(todayISO())) + `
    <div class="btns noprint"><button type="button" class="btn" id="pzPrint">Stampa o salva in PDF</button></div>
    <p class="lbl">Fratture da fragilità</p>${li(F.fx.map(f => FX_SEDI[f.sede] + (f.grado ? " (" + f.grado + ")" : "") + " — " + fmtD(f.data)).concat(!F.fx.length && p.nessunaFx ? ["Nessuna"] : []))}
    <p class="lbl">Anamnesi e terapie</p>${li(anam.concat(p.fam === true ? ["Familiarità per fratture di femore o vertebre"] : []))}
    <p class="lbl">Forme secondarie dall'anamnesi</p>${li([...S.N.note.map(x => x.f.nome + " — " + badgeOf(x, false)), ...S.N.sosp.map(x => x.f.nome + " — " + badgeOf(x, true))])}
    <p class="lbl">Esami di I livello${p.labData ? " (" + fmtD(p.labData) + ")" : ""}</p>${li(labTxt.concat(num(p.egfr) !== null ? ["eGFR " + fmtN(num(p.egfr), 0) + " mL/min"] : [], num(p.vitd) !== null ? ["25-OH-vitamina D " + fmtN(num(p.vitd), 0) + " ng/mL"] : []))}
    ${S.A.forms.length ? `<p class="note"><b>Forme compatibili con gli esami:</b> ${S.A.forms.map(x => COND[x.cid]).join(", ")}.${S.A.panel.length ? " Esami di II livello: " + S.A.panel.slice(0, 6).map(x => x[0]).join("; ") + "." : ""}</p>` : ""}
    ${S.hpp ? `<p class="note"><b>Fosfatasi alcalina bassa:</b> escludere l'ipofosfatasia; bisfosfonati controindicati.</p>` : ""}
    <p class="lbl">Densitometria</p>${li(F.dxa.map(d => fmtD(d.data) + " — colonna " + fmtN(num(d.tL)) + ", femore totale " + fmtN(num(d.tFt)) + ", collo " + fmtN(num(d.tFn))))}
    <p class="note">${pl.t}.</p>
    <p class="lbl">Rischio di frattura (DeFRA)</p>${li(F.defra.map(d => fmtD(d.data) + " — " + fmtN(num(d.rischio)) + "% a 10 anni"))}
    ${rc ? `<p class="note"><b>Rischio ${rc.t.toLowerCase()}.</b> ${rc.txt}</p>` : ""}
    ${vh.length ? `<p class="note"><b>Rischio molto alto:</b> ${vh.join("; ")}.</p>` : ""}
    <p class="lbl">Nota 79</p>${li(n79.map(c => `<b>${c.cond}</b> — ${c.s.map((l, i) => l.length ? ["I", "II", "III"][i] + " scelta: " + nomi(l) : "").filter(Boolean).join("; ")}`))}
    <p class="lbl">Terapie per l'osteoporosi</p>${li((p.terapie || []).map(t => (DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : t.farmaco) + " dal " + fmtD(t.inizio) + (t.fine ? " al " + fmtD(t.fine) : " (in corso)")))}
    ${p.note ? `<p class="lbl">Note</p><p class="note">${hx(p.note)}</p>` : ""}
    <p class="small">Generato con Osteo Help. Ausilio al ragionamento clinico, non sostitutivo del giudizio del medico; verificare il testo vigente della Nota 79 e le schede tecniche.</p></div>` };
}

/* ---------- guida per il MMG ---------- */
const GUIDA = [
  { k:"cosa", t:"Cos'è l'osteoporosi", s:"In parole semplici", html:`
    <p class="note">È una malattia dello scheletro in cui l'osso diventa meno denso e più fragile, fino a rompersi per traumi minimi: una caduta dalla propria altezza, un colpo di tosse, sollevare un peso. Non dà sintomi finché non compare una frattura.</p>
    <p class="note">L'osso si rinnova continuamente: gli osteoclasti lo riassorbono e gli osteoblasti lo ricostruiscono. Con la menopausa (calo degli estrogeni), l'età, alcuni farmaci e molte malattie il riassorbimento supera la formazione.</p>
    <p class="note">La diagnosi si fa con la densitometria (DXA) di colonna e femore: un <b>T-score uguale o inferiore a −2,5</b> indica osteoporosi, tra −1 e −2,5 osteopenia. Una frattura da fragilità di vertebra o femore basta però per la diagnosi, qualunque sia il T-score.</p>
    <p class="note">In Italia ne soffrono circa 5 milioni di persone, in gran parte donne dopo la menopausa; un uomo su cinque dopo i 50 anni avrà una frattura da fragilità.</p>` },
  { k:"conseguenze", t:"Cosa comporta", s:"Le fratture e le loro conseguenze", html:`
    <ul class="list"><li><i>1</i><span><b>Fratture vertebrali</b>: spesso silenti (circa due su tre non vengono riconosciute). Si sospettano con calo di statura oltre 3–4 cm, cifosi, dorsalgia: una radiografia del rachide dorso-lombare le documenta.</span></li>
    <li><i>2</i><span><b>Frattura di femore</b>: la più grave. Circa 1 paziente su 5 muore entro un anno e molti non recuperano l'autonomia di prima.</span></li>
    <li><i>3</i><span><b>Polso, omero, bacino</b>: segnali di allarme che spesso precedono la frattura di femore.</span></li>
    <li><i>4</i><span><b>Una frattura chiama l'altra</b>: dopo una frattura da fragilità il rischio di una nuova frattura raddoppia, ed è massimo nei primi 1–2 anni (rischio imminente).</span></li></ul>
    <p class="note">Dolore cronico, perdita di autonomia, ricoveri e istituzionalizzazione fanno dell'osteoporosi una malattia con un peso simile a quello delle grandi malattie croniche.</p>` },
  { k:"perche", t:"Perché si cura", s:"Cosa si guadagna con la terapia", html:`
    <p class="note">Lo scopo non è «alzare la densitometria» ma <b>prevenire le fratture</b>. I farmaci riducono il rischio di fratture vertebrali del 30–70%; alendronato, risedronato, zoledronato, denosumab e romosozumab riducono anche le fratture di femore.</p>
    <p class="note">Il beneficio è tanto maggiore quanto più alto è il rischio: nei pazienti a rischio elevato bisogna trattarne 10–20 per 3 anni per evitare una frattura vertebrale; in quelli a basso rischio più di 200. Per questo la terapia si decide sul rischio di frattura (DeFRA, Nota 79) e non solo sul T-score.</p>
    <p class="note">Oggi la maggior parte dei pazienti che hanno avuto una frattura di femore non riceve una terapia per l'osteoporosi: è il divario più grande da colmare, e il MMG è nella posizione migliore per farlo.</p>
    <p class="note">Senza aderenza non c'è beneficio: molti pazienti sospendono i bisfosfonati orali entro un anno. Vale la pena chiedere a ogni controllo come vengono presi.</p>` },
  { k:"secondarie", t:"Perché cercare le forme secondarie", s:"Prima di trattare", html:`
    <p class="note">Nella donna in postmenopausa l'osteoporosi è primaria in 7–8 casi su 10; nell'uomo in circa la metà. Negli altri casi c'è una causa: un farmaco (glucocorticoidi, inibitori dell'aromatasi), una malattia endocrina (iperparatiroidismo, ipertiroidismo, ipogonadismo), il malassorbimento (celiachia), un mieloma, un'insufficienza renale.</p>
    <p class="note">Cercarle cambia la cura:</p>
    <ul class="list"><li><i>1</i><span>alcune si curano <b>rimuovendo la causa</b> (paratiroidectomia, dieta senza glutine, correzione dell'ipogonadismo o della dose di L-tiroxina);</span></li>
    <li><i>2</i><span>alcune non si curano con i farmaci per l'osteoporosi: l'<b>osteomalacia</b> da carenza di vitamina D va prima corretta;</span></li>
    <li><i>3</i><span>in alcune i farmaci sono <b>controindicati</b>: nell'<b>ipofosfatasia</b> (fosfatasi alcalina bassa) i bisfosfonati possono peggiorare la malattia; nell'ipocalcemia denosumab e zoledronato possono causare ipocalcemie gravi; nell'insufficienza renale grave i bisfosfonati non si usano;</span></li>
    <li><i>4</i><span>alcune sono malattie gravi da non perdere (mieloma, metastasi).</span></li></ul>
    <p class="note">Basta poco: gli esami di I livello (con TSH e PTH) e un'anamnesi accurata escludono quasi il 90% delle forme secondarie. Le sezioni «Esami alterati» ed «Esami normali» di Osteo Help guidano il ragionamento; la scheda del paziente ne usa i contenuti e il ragionamento in automatico.</p>
    <div class="btns"><a class="btn sec" target="_blank" rel="noopener" href="${OH}#alterati">Esami alterati</a><a class="btn sec" target="_blank" rel="noopener" href="${OH}#normali">Esami normali</a><a class="btn sec" target="_blank" rel="noopener" href="${OH}#catalogo">Catalogo</a></div>` },
  { k:"esami", t:"Esami di I livello", s:"Cosa chiedere e perché", html:`
    <ul class="list"><li><i>1</i><span><b>VES, emocromo, elettroforesi proteica</b>: flogosi, mieloma, malassorbimento</span></li>
    <li><i>2</i><span><b>Calcemia (corretta per l'albumina), fosforemia</b>: iperparatiroidismo, osteomalacia</span></li>
    <li><i>3</i><span><b>Fosfatasi alcalina totale</b>: alta in osteomalacia, Paget, metastasi; <b>bassa nell'ipofosfatasia</b> — guardare anche i valori bassi</span></li>
    <li><i>4</i><span><b>Creatinina con eGFR</b>: condiziona la scelta del farmaco</span></li>
    <li><i>5</i><span><b>Calciuria delle 24 ore</b>: ipercalciuria, malassorbimento</span></li>
    <li><i>6</i><span><b>25-OH-vitamina D</b>: carenza da correggere prima della terapia</span></li>
    <li><i>7</i><span><b>TSH e PTH</b>: a rigore di II livello, ma utili quasi sempre</span></li>
    <li><i>8</i><span>Nell'uomo <b>testosterone totale</b>; in base alla clinica anti-transglutaminasi con IgA totali</span></li></ul>` },
  { k:"defra", t:"DeFRA e Nota 79", s:"Dal rischio di frattura alla prescrizione", html:`
    <p class="note">Il <b>DeFRA</b> è il calcolatore italiano del rischio di frattura a 10 anni, sviluppato da SIOMMMS e SIR a partire dal FRAX. Rispetto al FRAX considera numero e sede delle fratture, la dose dei glucocorticoidi, più malattie e la densità di colonna e femore. Si usa dai 50 anni.</p>
    <p class="note">Servono: età, sesso, peso, altezza, fratture da fragilità (sede, numero), familiarità per frattura di femore o vertebre, fumo, alcol, glucocorticoidi, malattie (artrite reumatoide e connettiviti, diabete, BPCO, MICI, HIV, Parkinson, sclerosi multipla, grave disabilità motoria), terapia ormonale adiuvante, T-score di colonna e femore.</p>
    <p class="note">La <b>Nota 79</b> stabilisce quando i farmaci sono a carico del SSN: in prevenzione secondaria (fratture vertebrali o di femore; altre fratture con T-score ≤ −3) e in prevenzione primaria (glucocorticoidi ≥5 mg/die per più di 3 mesi, blocco ormonale adiuvante, T-score ≤ −4, oppure ≤ −3 con familiarità o comorbilità). Il rischio a 10 anni ≥ 20% calcolato con un calcolatore validato entra nei criteri del romosozumab. Fumo e alcol, in quanto modificabili, non contano ai fini della rimborsabilità.</p>
    <p class="note">Il passaggio dalla I alla II scelta richiede intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni; una nuova frattura dopo almeno un anno di terapia giustifica un cambio di classe. Zoledronato solo in strutture ospedaliere; denosumab prescrivibile dal MMG; teriparatide, abaloparatide e romosozumab su piano terapeutico specialistico.</p>
    <div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>` },
  { k:"base", t:"Calcio, vitamina D e stile di vita", s:"Per tutti, prima e durante la terapia", html:`
    <ul class="list"><li><i>1</i><span><b>Calcio</b>: 1000–1200 mg al giorno, possibilmente con la dieta (latte, yogurt, formaggi, acque ricche di calcio); integratore solo per la quota mancante.</span></li>
    <li><i>2</i><span><b>Vitamina D</b>: correggere la carenza prima di iniziare un farmaco (la carenza ne riduce l'efficacia e favorisce l'ipocalcemia). In chi è in terapia per l'osteoporosi si punta ad almeno 30 ng/mL; colecalciferolo rimborsabile senza dosaggio in corso di terapia remineralizzante (Nota 96).</span></li>
    <li><i>3</i><span><b>Attività fisica</b> regolare, con esercizi di carico e di equilibrio.</span></li>
    <li><i>4</i><span><b>Cadute</b>: vista, farmaci sedativi e ipotensivi, casa sicura, calzature.</span></li>
    <li><i>5</i><span><b>Fumo</b> da sospendere, <b>alcol</b> sotto le 3 unità al giorno, peso adeguato.</span></li>
    <li><i>6</i><span><b>Bocca</b>: visita odontoiatrica e igiene orale prima di bisfosfonati, denosumab, romosozumab.</span></li></ul>` },
  { k:"followup", t:"Follow-up", s:"DXA ogni 18–24 mesi, rischio di rifrattura", html:`
    <ul class="list"><li><i>1</i><span><b>DXA ogni 18–24 mesi</b>, con lo stesso apparecchio (prima non è di solito utile: le variazioni sono minori dell'errore della misura). Si può anticipare a 12 mesi con glucocorticoidi ad alte dosi.</span></li>
    <li><i>2</i><span><b>Rischio di rifrattura</b>: dopo una frattura è massimo nei primi 1–2 anni. Una nuova frattura dopo almeno un anno di terapia è un motivo per cambiare classe di farmaco (Nota 79).</span></li>
    <li><i>3</i><span><b>Aderenza</b>: chiederla a ogni controllo; per i bisfosfonati orali, verificare come vengono assunti.</span></li>
    <li><i>4</i><span><b>Durata</b>: bisfosfonati da rivalutare dopo 5 anni (3 per lo zoledronato); denosumab da non interrompere senza passare a un bisfosfonato; anabolici per un tempo limitato e poi sempre un antiriassorbitivo.</span></li>
    <li><i>5</i><span><b>Calcemia</b> prima di ogni dose di denosumab; vitamina D e funzione renale periodicamente.</span></li></ul>` }
];
function vGuida(){
  return { bar:"Guida per il MMG", html: head("Osteoporosi: guida per il MMG", "Spiegazioni semplici, dalle basi alla scelta del farmaco.") + `
    <div class="rows">${GUIDA.map(g => `<a class="rowlink" href="#guida-${g.k}"><span>${g.t}<small>${g.s}</small></span>${CHEV}</a>`).join("")}</div>
    <p class="lbl">I farmaci</p>
    <div class="rows">${DRUG_ORDER.map(id => `<a class="rowlink" href="#farmaco-${id}"><span>${DRUGS[id].nome}<small>${DRUGS[id].classe}</small></span>${CHEV}</a>`).join("")}</div>
    <div class="btns"><a class="btn sec" href="#">I miei pazienti</a></div>` };
}
function vGuidaTopic(k){
  const g = GUIDA.find(x => x.k === k); if(!g) return { redirect:"guida" };
  return { bar:"Guida per il MMG", html: head(g.t, g.s) + g.html };
}
function vFarmaco(id){
  const d = DRUGS[id]; if(!d) return { redirect:"guida" };
  return { bar:"Farmaco", html: `<div class="katrow"><span class="kat k-amber">${d.classe}</span></div><h1>${d.nome}</h1><div class="rule"></div>
    <p class="lbl">Come agisce</p><p class="note">${d.come}</p>
    <p class="lbl">Efficacia</p><p class="note">${d.efficacia}</p>
    <p class="lbl">Dose</p><p class="note">${d.via}</p>
    <p class="lbl">Come si prende</p><p class="note">${d.assunzione}</p>
    <p class="lbl">Controindicazioni</p><ul class="list">${d.ci.map((x, i) => `<li><i>${i + 1}</i>${x}</li>`).join("")}</ul>
    <p class="lbl">Avvertenze</p><ul class="list">${d.avv.map((x, i) => `<li><i>${i + 1}</i>${x}</li>`).join("")}</ul>
    <p class="lbl">Nota 79 e prescrizione</p><p class="note">${d.nota79}</p>
    <p class="small">Sintesi per il MMG: fare sempre riferimento alla scheda tecnica e al testo vigente della Nota 79.</p>` };
}

/* ---------- smistamento delle schermate dei pazienti ---------- */
function pzView(route){
  if(route === "") return vPazienti();
  if(route === "guida") return vGuida();
  if(route.startsWith("guida-")) return vGuidaTopic(route.slice(6));
  if(route.startsWith("farmaco-")) return vFarmaco(route.slice(8));
  const m = /^paz-([a-z0-9]+)(?:-([a-z]+))?$/.exec(route); if(!m) return null;
  const p = pzGet(m[1]); if(!p) return { redirect:"" };
  const V = { "":vPaz, dati:vPazDati, anamnesi:vPazAnamnesi, esami:vPazEsami, defra:vPazDefra, terapia:vPazTerapia, storico:vPazStorico, report:vPazReport }[m[2] || ""];
  return V ? V(p) : { redirect:"paz-" + p.id };
}
const pzParent = r => /^paz-[a-z0-9]+-/.test(r) ? r.replace(/-[a-z]+$/, "") : r.startsWith("paz-") ? "" : r.startsWith("guida-") || r.startsWith("farmaco-") ? "guida" : null;

/* aggiornamento delle parti che dipendono dai dati, senza ridisegnare i campi */
const PZ_LIVE = {
  sec: p => secReport(p, pzSecondary(p)), lab: p => labReport(p, pzSecondary(p)), defra: defraLive, ter: therapyLive,
  bmi: p => { const F = pzFacts(p); return F.bmi ? "BMI " + fmtN(F.bmi) + " kg/m²" + (F.bmi < 20 ? " — basso peso: è un fattore di rischio" : "") : ""; }
};
function pzLive(p){ document.querySelectorAll("[data-live]").forEach(el => { const f = PZ_LIVE[el.dataset.live]; if(f) el.innerHTML = f(p); }); }

document.addEventListener("input", e => {
  const el = e.target.closest("[data-pf]"); if(el){ const { p } = pzRoute(); if(!p) return; p[el.dataset.pf] = el.value; savePz(p); if(el.dataset.pf === "nome") $("#barT").textContent = pzName(p); return; }
  if(e.target.id === "pzQ"){ const q = e.target.value.trim().toLowerCase(); document.querySelectorAll("#pzList .pzrow").forEach(a => { a.hidden = q && !a.dataset.q.includes(q); }); }
});
document.addEventListener("change", e => {
  if(e.target.closest("[data-pf]")){ const { p } = pzRoute(); if(p) pzLive(p); return; }
  if(e.target.id === "pzImport"){
    const f = e.target.files && e.target.files[0]; if(!f) return;
    const rd = new FileReader();
    rd.onload = () => { try{ const d = JSON.parse(rd.result), arr = Array.isArray(d) ? d : d.pazienti; if(!Array.isArray(arr)) throw 0;
      let n = 0; arr.forEach(x => { if(!x || !x.id || !/^[a-z0-9]+$/.test(x.id)) return; const p = Object.assign(pzBlank(), x); const i = PZ.findIndex(y => y.id === p.id); if(i >= 0) PZ[i] = p; else PZ.push(p); n++; });
      savePz(); alert(plural(n, "paziente ripristinato", "pazienti ripristinati") + "."); render(); }catch(err){ alert("Il file non è un backup valido di Osteo Help."); } };
    rd.readAsText(f);
  }
});
document.addEventListener("toggle", e => { const d = e.target; if(d.matches && d.matches("details.pzax")){ const i = +d.dataset.pax; d.open ? pzOpenAx.add(i) : pzOpenAx.delete(i); } }, true);
document.addEventListener("click", e => {
  const t = e.target;
  if(t.closest("#pzNew")){ const p = pzBlank(); PZ.push(p); savePz(); go("paz-" + p.id + "-dati"); return; }
  if(t.closest("#pzExport")){
    const blob = new Blob([JSON.stringify({ app:"Osteo Help", versione:1, salvato: new Date().toISOString(), pazienti: PZ }, null, 1)], { type:"application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "osteo-help-pazienti-" + todayISO() + ".json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return;
  }
  if(t.closest("#pzPrint")){ window.print(); return; }
  const tmp = t.closest(".ck[data-tmp]"); if(tmp){ tmp.setAttribute("aria-pressed", tmp.getAttribute("aria-pressed") !== "true"); return; }
  const { p } = pzRoute(); if(!p) return;
  if(t.closest("#pzDel")){ if(confirm("Eliminare " + pzName(p) + " e tutti i suoi dati?")){ PZ.splice(PZ.indexOf(p), 1); savePz(); history.replaceState(null, "", location.pathname + location.search); stack.length = 0; stack.push(""); render(); } return; }
  const s = t.closest("[data-pset]");
  if(s){ const k = s.dataset.pset, v = s.dataset.val === "true" ? true : s.dataset.val === "false" ? false : s.dataset.val; p[k] = p[k] === v ? null : v; savePz(p); render(); return; }
  const b = t.closest(".ck[data-pbool]");
  if(b){ const k = b.dataset.pbool; p[k] = !p[k]; b.setAttribute("aria-pressed", p[k]); savePz(p); pzLive(p); return; }
  const c = t.closest(".ck[data-pci]");
  if(c){ p.ci = p.ci || {}; const k = c.dataset.pci; p.ci[k] = !p.ci[k]; c.setAttribute("aria-pressed", p.ci[k]); savePz(p); pzLive(p); return; }
  const f = t.closest(".ck[data-pfeat]");
  if(f){ const id = f.dataset.pfeat, set = new Set(p.feats || []); set.has(id) ? set.delete(id) : set.add(id); p.feats = [...set]; f.setAttribute("aria-pressed", set.has(id));
    const ax = f.closest("details.pzax"), n = ax.querySelectorAll('.ck[aria-pressed="true"]').length, badge = ax.querySelector(".n"); badge.textContent = n; badge.hidden = !n;
    savePz(p); pzLive(p); return; }
  const x = t.closest("#pzGrid button[data-pex]");
  if(x){ p.lab = p.lab || {}; const ex = x.dataset.pex, k = x.dataset.kind; if(p.lab[ex] === k) delete p.lab[ex]; else p.lab[ex] = k;
    x.closest(".tri").querySelectorAll("button").forEach(y => y.setAttribute("aria-pressed", p.lab[ex] === y.dataset.kind)); savePz(p); pzLive(p); return; }
  const del = t.closest("[data-del]");
  if(del){ const [k, i] = del.dataset.del.split(":"); if(p[k] && p[k][+i] && confirm("Eliminare questa voce?")){ p[k].splice(+i, 1); savePz(p); render(); } return; }
  const st = t.closest("[data-stop]");
  if(st){ const th = p.terapie[+st.dataset.stop]; if(th){ th.fine = todayISO(); savePz(p); render(); } return; }
  const ad = t.closest("[data-add]");
  if(ad){
    const k = ad.dataset.add, v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    if(k === "fratture"){ if(!v("fxData")){ alert("Indica la data della frattura (anche approssimativa)."); return; }
      p.fratture.push({ sede: v("fxSede"), data: v("fxData"), grado: v("fxSede") === "vertebra" ? v("fxGrado") : "", inTerapia: $('.ck[data-tmp="fxInT"]').getAttribute("aria-pressed") === "true" }); p.nessunaFx = false; }
    if(k === "dxa"){ if(!v("dxD") || ![v("dxL"), v("dxFt"), v("dxFn")].some(x => num(x) !== null)){ alert("Indica la data e almeno un T-score."); return; }
      const T = x => { const n = num(x); return n === null ? "" : String(n > 0 && n < 6 && /^\d/.test(x) && confirm("Il T-score " + x + " è positivo: intendevi −" + x + "?") ? -n : n); };
      p.dxa.push({ data: v("dxD"), tL: T(v("dxL")), tFt: T(v("dxFt")), tFn: T(v("dxFn")) }); }
    if(k === "defra"){ const r = num(v("dfR")); if(r === null || r < 0 || r > 100 || !v("dfD")){ alert("Indica il rischio (0–100%) e la data."); return; } p.defra.push({ data: v("dfD"), rischio: String(r), note: v("dfN") }); }
    if(k === "terapie"){ if(!v("thI")){ alert("Indica la data di inizio."); return; } p.terapie.push({ farmaco: v("thF"), inizio: v("thI"), fine:"", note: v("thN") }); }
    savePz(p); render(); return;
  }
});

/* ---------- navigazione ---------- */
const stack = [];
let current = null, actFn = null;
function render(){
  const route = routeNow();
  const v = pzView(route) || { redirect:"" };
  if(v.redirect !== undefined){ history.replaceState(null, "", v.redirect ? "#" + v.redirect : location.pathname + location.search); return render(); }
  const changed = route !== current; current = route;
  $("#main").innerHTML = `<div class="screen">${v.html}</div>`;
  const home = !route;
  $(".bar").classList.toggle("home", home);
  if(home) $("#barT").innerHTML = `<span class="oh">OH</span>Osteo Help <span class="mmg">MMG</span>`; else $("#barT").textContent = v.bar;
  $("#back").style.visibility = home ? "hidden" : "visible";
  if(changed) window.scrollTo(0, 0);
}
function goBack(){ if(stack.length > 1) history.back(); else go(pzParent(current) || ""); }
$("#back").addEventListener("click", goBack);
window.addEventListener("hashchange", () => {
  const r = routeNow();
  if(stack.length > 1 && stack[stack.length - 2] === r) stack.pop(); else stack.push(r);
  render();
});
stack.push(routeNow());
render();
