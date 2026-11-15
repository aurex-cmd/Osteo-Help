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
/* vitamina D: si inserisce e si mostra in nmol/L (predefinita) o in ng/mL; internamente si conserva in ng/mL (1 ng/mL = 2,496 nmol/L) */
const VD_F = 2.496;
let VD_U = "nmol"; try{ if(localStorage.getItem("oh-mmg-vitd-unit") === "ng") VD_U = "ng"; }catch(e){}   /* nmol/L come unità predefinita */
const vdUnit = () => VD_U === "nmol" ? "nmol/L" : "ng/mL";
const vdShow = ng => ng === null ? "" : VD_U === "nmol" ? String(Math.round(ng * VD_F)) : String(Math.round(ng * 10) / 10);
/* soglie in nmol/L (Linee guida SIOMMMS, Adami et al., Reumatismo 2011;63:129-147, Tabella I: carenza <50, insufficienza 50-75,
   eccesso >250, intossicazione >375): bassa sotto 75 (obiettivo nel paziente con osteoporosi o a rischio, Nota 96), alta (eccesso) sopra 250;
   solo sopra 375 (150 ng/mL) la vitamina D entra nel motore come «alta» e fa sospettare un'intossicazione */
const SIOMMMS_VD = "Linee guida SIOMMMS, Reumatismo 2011";
const VD_BASSA = 75, VD_ALTA = 250, VD_TOSS = 375, vdNmol = ng => Math.round(ng * VD_F);
const vdLow = ng => ng !== null && vdNmol(ng) < VD_BASSA, vdHigh = ng => ng !== null && vdNmol(ng) > VD_ALTA, vdToss = ng => ng !== null && vdNmol(ng) > VD_TOSS;
const vdTxt = ng => VD_U === "nmol" ? fmtN(ng * VD_F, 0) + " nmol/L" : fmtN(ng, 0) + " ng/mL";
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
    avv:["Esofagite e disturbi gastrici, soprattutto con reflusso o assunzione scorretta","Osteonecrosi della mandibola e fratture atipiche di femore: rare, legate soprattutto alla durata","Dopo 5 anni rivalutare il rischio di frattura per decidere se proseguire o fare una pausa terapeutica (la DXA di controllo resta ogni 18–24 mesi)"],
    nota79:"I scelta in quasi tutte le condizioni della Nota 79. Prescrivibile dal MMG." },
  [R_]: { nome:"Risedronato", classe:"Bisfosfonato (orale)", via:"35 mg una volta alla settimana (anche gastroresistente, da prendere dopo colazione), oppure 75 mg per due giorni consecutivi al mese.",
    come:"Come l'alendronato: frena il riassorbimento osseo.",
    efficacia:"Riduce le fratture vertebrali, di femore e non vertebrali.",
    assunzione:"Formulazione standard: a digiuno, con acqua naturale, in piedi o seduti per 30 minuti. Formulazione gastroresistente: subito dopo la colazione.",
    ci:["Ipocalcemia","Insufficienza renale grave (clearance della creatinina sotto 30 mL/min)","Gravidanza e allattamento","Ipofosfatasia (bisfosfonati controindicati)"],
    avv:["Disturbi esofagei e gastrici","Osteonecrosi della mandibola e fratture atipiche di femore: rare","Dopo 5 anni rivalutare il rischio di frattura per decidere se proseguire o fare una pausa terapeutica (la DXA di controllo resta ogni 18–24 mesi)"],
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
    avv:["Reazione di fase acuta dopo la prima infusione","Osteonecrosi della mandibola e fratture atipiche: rare","Dopo 3 anni rivalutare il rischio di frattura per decidere se proseguire o fare una pausa terapeutica (la DXA di controllo resta ogni 18–24 mesi)"],
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
  const zona = lastDefra && ZONE[lastDefra.zona] ? lastDefra.zona : null, rischio = lastDefra ? num(lastDefra.rischio) : null;
  const feats = new Set(p.feats || []);
  const recent = fx.filter(f => { const m = monthsSince(f.data); return m !== null && m <= 24; });
  const peso = num(p.peso), alt = num(p.altezza);
  const bmi = peso && alt ? peso / Math.pow(alt / 100, 2) : null;
  const dxaAge = lastDxa ? monthsSince(lastDxa.data) : null;
  const ther = (p.terapie || []).filter(t => !t.fine).sort((a, b) => (b.inizio || "").localeCompare(a.inizio || ""));
  return { age, fx, vert, fem, oth, nVF: vert.length + fem.length, dxa, lastDxa, minT, defra, lastDefra, zona, rischio, feats, recent, bmi, dxaAge, ther,
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
  const r20 = F.rischio !== null ? F.rischio >= 20 : zoneHigh(F.zona), r20t = F.rischio !== null ? `rischio a 10 anni ${fmtN(F.rischio, 0)}% sul DeFRA` : "rischio a 10 anni ≥ 20% (da confermare sul DeFRA)";
  if(F.donna && F.minT !== null && r20){
    const lim = F.vertModGr >= 2 || F.femRecent2y ? -2 : -2.5;
    if(F.minT < lim && (F.vertModGr >= 1 || F.vertLievi >= 2 || F.fem.length >= 1))
      out.push({ sez:"Prevenzione secondaria", cond:"Fratture vertebrali o di femore, T-score sotto " + fmtN(lim) + ", " + r20t + ": solo se non è possibile seguire altri trattamenti efficaci (intolleranza, inefficacia, fine del periodo consentito)", s:[[RO_]], spec:true, alt:true });
  }
  if(F.oth.length >= 1 && F.minT !== null && F.minT <= -3)
    out.push({ sez:"Prevenzione secondaria", cond:"Frattura non vertebrale e non femorale con T-score ≤ −3", s:[[A_, R_, Z_], [D_, I_, ...serm]] });
  if(F.donna && F.oth.length >= 2 && F.minT !== null && F.minT < -2.5 && r20)
    out.push({ sez:"Prevenzione secondaria", cond:"2 o più fratture non vertebrali, T-score sotto −2,5, " + r20t + ": solo se non è possibile seguire altri trattamenti efficaci", s:[[RO_]], spec:true, alt:true });
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
  if(vdLow(vd) || lab.D === "basso") add([...ANTIRIASS, ...ANABOL], "warn", "correggere prima la carenza di vitamina D" + (vd !== null ? ` (${vdTxt(vd)})` : ""));
  if(ci.esofago) add(ORALI, "ci", "disturbi esofagei o impossibilità a restare in piedi/seduti");
  if(ci.tev) add([RX_, BZ_], "ci", "tromboembolismo venoso pregresso");
  if(ci.cv || F.feats.has("ictus_emiplegia")){ add([RO_], "ci", "pregresso infarto o ictus / rischio cardiovascolare"); add([RX_, BZ_], "warn", "rischio di ictus"); }
  if(ci.rt) add(ANABOL, "ci", "radioterapia scheletrica o tumori ossei");
  if(ci.denti) add([...BISF, D_, RO_], "warn", "sistemare prima i problemi dentari (osteonecrosi della mandibola)");
  return fl;
}

/* ---------- rischio: categoria del DeFRA e rischio imminente ---------- */
/* zone del DeFRA: le soglie cambiano con l'età e le indica il calcolatore; il medico inserisce solo la zona */
const ZONE = {
  verde:{ t:"Verde", r:"basso rischio", cls:"ok", chi:"Medico di medicina generale",
    azione:"Nessun farmaco per l'osteoporosi. Vitamina D (Nota 96), calcio con la dieta, attività fisica e prevenzione delle cadute; nuova valutazione nel tempo." },
  gialla:{ t:"Gialla", r:"rischio moderato", cls:"warn", chi:"Medico di medicina generale",
    azione:"Terapia di prima linea: bisfosfonati orali o denosumab, sempre con vitamina D." },
  arancione:{ t:"Arancione", r:"alto rischio", cls:"d", chi:"Specialista dell'osso",
    azione:"Invio allo specialista per una terapia di II o III livello: anabolico (teriparatide, abaloparatide) o romosozumab, seguito da un antiriassorbitivo; sempre con vitamina D." },
  rossa:{ t:"Rossa", r:"altissimo rischio", cls:"d", chi:"Specialista dell'osso, con priorità",
    azione:"Invio prioritario allo specialista per anabolico o romosozumab, seguito da un antiriassorbitivo; sempre con vitamina D. Nell'attesa non lasciare il paziente senza protezione: calcio, vitamina D e prevenzione delle cadute." }
};
const ZONE_ORDER = ["verde", "gialla", "arancione", "rossa"];
const zoneHigh = z => z === "arancione" || z === "rossa";
const zchip = z => ZONE[z] ? `<span class="zn z-${z}"><i></i>${ZONE[z].t}</span>` : "—";
function riskCat(z){ return z && ZONE[z] ? Object.assign({ k:z }, ZONE[z]) : null; }
const zoneAlert = (rc, extra) => `<div class="alert zal z-${rc.k}"><b>Zona ${rc.t.toLowerCase()} · ${rc.r} → ${rc.chi}</b>${rc.azione}${extra || ""}</div>`;
function veryHigh(p, F){
  const r = [];
  if(F.recent.length) r.push("frattura da fragilità negli ultimi 24 mesi (rischio imminente di rifrattura)");
  if(F.nVF >= 3) r.push("3 o più fratture vertebrali o di femore");
  if(F.nVF >= 1 && F.minT !== null && F.minT <= -4) r.push("frattura con T-score ≤ −4");
  if(F.nVF >= 1 && F.gc) r.push("frattura in terapia con glucocorticoidi");
  if(F.fxInTerapia) r.push("nuova frattura durante la terapia");
  if(F.zona === "rossa") r.push("zona rossa del DeFRA (altissimo rischio)");
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
    else if(ORALI.includes(t.farmaco)) s = y !== null && y >= 5 ? "Oltre 5 anni di bisfosfonato orale: rivalutare il rischio di frattura (DXA, nuove fratture, zona del DeFRA) per decidere se proseguire o fare una pausa terapeutica; la pausa solo se il rischio non è più alto." : "Controllare l'assunzione corretta e l'aderenza. DXA di controllo ogni 18–24 mesi. Dopo 5 anni di terapia si rivaluta il rischio di frattura per decidere se proseguire o fare una pausa terapeutica.";
    else if(t.farmaco === Z_) s = y !== null && y >= 3 ? "Oltre 3 anni di zoledronato: rivalutare il rischio di frattura (DXA, nuove fratture, zona del DeFRA) per decidere se proseguire o fare una pausa terapeutica; la pausa solo se il rischio non è più alto." : "DXA di controllo ogni 18–24 mesi. Dopo 3 infusioni annuali si rivaluta il rischio di frattura per decidere se proseguire o fare una pausa terapeutica.";
    else if(t.farmaco === T_) s = m !== null && m >= 18 ? "Si avvicina il limite di 24 mesi: pianificare con lo specialista il passaggio a un antiriassorbitivo." : "Massimo 24 mesi, poi sempre un antiriassorbitivo.";
    else if(t.farmaco === AB_) s = m !== null && m >= 12 ? "Si avvicina il limite di 18 mesi: pianificare il passaggio a un antiriassorbitivo." : "Massimo 18 mesi, poi un antiriassorbitivo.";
    else if(t.farmaco === RO_) s = m !== null && m >= 9 ? "Si avvicina il limite di 12 mesi: pianificare il passaggio a un antiriassorbitivo." : "12 mesi, poi un antiriassorbitivo.";
    else if(t.farmaco === RX_ || t.farmaco === BZ_) s = "Attenzione a tromboembolismo e ictus; sospendere in caso di immobilizzazione prolungata.";
    return { id: t.farmaco, nome, da: t.inizio, durata: m === null ? "" : (m < 1 ? "meno di un mese" : m < 12 ? plural(m, "mese", "mesi") : fmtN(y, 1) + " anni"), s };
  });
}

/* ---------- dosi programmate, scadenze e «da fare» ---------- */
const DOSE_MESI = { [D_]:6, [Z_]:12 };              /* denosumab ogni 6 mesi, zoledronato ogni anno */
const FINE_MESI = { [T_]:24, [AB_]:18, [RO_]:12 };  /* durata massima degli anabolici e del romosozumab */
const RIVAL_ANNI = { [A_]:5, [R_]:5, [I_]:5, [Z_]:3 };
const dnome = id => DRUGS[id] ? DRUGS[id].nome : String(id || "Terapia");
const lastDose = t => (t.dosi || []).concat(t.inizio ? [t.inizio] : []).filter(x => pDate(x)).sort().pop() || null;
function nextDose(t){ const m = DOSE_MESI[t.farmaco], l = lastDose(t); return m && l ? addMonths(pDate(l), m) : null; }
const daysTo = d => Math.round((d - new Date(new Date().toDateString())) / 864e5);
const fmtDt = d => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
/* u: 0 urgente, 1 da fare presto, 2 da programmare */
function pzTodo(p, F){
  F = F || pzFacts(p); const out = [], add = (u, t, s, k) => out.push({ u, t, s, href:`#paz-${p.id}${k ? "-" + k : ""}` });
  F.ther.forEach(t => {
    const n = nextDose(t), m = monthsSince(t.inizio);
    if(n){ const dd = daysTo(n);
      if(t.farmaco === D_ && dd < -28) add(0, "Denosumab: dose in ritardo", `Era prevista il ${fmtDt(n)}, ${-dd} giorni fa. Oltre 4 settimane di ritardo aumenta il rischio di fratture vertebrali multiple: somministrare al più presto.`, "terapia");
      else if(dd <= 30) add(dd < 0 ? 0 : 1, `${dnome(t.farmaco)}: prossima dose`, (dd < 0 ? `Prevista il ${fmtDt(n)}, ${-dd} giorni fa.` : dd === 0 ? "Prevista oggi." : `Il ${fmtDt(n)}, tra ${dd} giorni.`) + (t.farmaco === D_ ? " Calcemia prima della dose." : ""), "terapia"); }
    const fm = FINE_MESI[t.farmaco];
    if(fm && m !== null && m >= fm - 3) add(m >= fm ? 0 : 1, `${dnome(t.farmaco)}: ${m >= fm ? "periodo concluso" : "si avvicina la fine"}`, `Iniziato il ${fmtD(t.inizio)}, durata massima ${fm} mesi: subito dopo serve un antiriassorbitivo.`, "terapia");
    const ra = RIVAL_ANNI[t.farmaco];
    if(ra && m !== null && m >= ra * 12) add(2, `${dnome(t.farmaco)} da ${Math.floor(m / 12)} anni`, "Rivalutare il rischio di frattura per decidere se proseguire o fare una pausa terapeutica.", "terapia");
  });
  if(F.recent.length && !F.ther.length && !(p.decisione && p.decisione.tipo === "spec")) add(0, "Frattura recente senza terapia", `Frattura il ${fmtD(F.recent[0].data)}: rischio imminente di rifrattura.`, "terapia");
  if(F.lastDxa){ const pl = dxaPlan(F); if(pl.st !== "ok") add(pl.st === "miss" ? 1 : 2, pl.t, pl.s, "dxa"); }
  if(p.decisione && p.decisione.tipo === "attesa") add(2, "Decisione sulla terapia rimandata", `Dal ${fmtD(p.decisione.data)}, in attesa di esami o accertamenti.`, "terapia");
  return out.sort((a, b) => a.u - b.u);
}
const todoItem = (x, who) => `<a class="todo-i u${x.u}" href="${x.href}"><i></i><span>${who ? `<em>${hx(pzName(x.p))}</em>` : ""}<b>${x.t}</b><small>${x.s}</small></span>${CHEV}</a>`;

/* ---------- esami ricavati dai valori: vitamina D, eGFR, calcio corretto, albumina ---------- */
const albGdl = p => { const v = num(p.albVal); return v === null ? null : v > 15 ? v / 10 : v; };   /* accetta anche g/L */
const caCorr = p => { const c = num(p.caTot), a = albGdl(p); return c === null || a === null ? null : c + 0.8 * (4 - a); };
const AUTO = {
  D:    p => { const v = num(p.vitd); return v === null ? null : { st: vdLow(v) ? "basso" : vdToss(v) ? "alto" : "norm", disp: vdHigh(v) ? "alto" : undefined, val: vdTxt(v) }; },
  eGFR: p => { const v = num(p.egfr); return v === null ? null : { st: v < 60 ? "basso" : "norm", val: fmtN(v, 0) + " mL/min" }; },
  Ca:   p => { const c = caCorr(p); return c === null ? null : { st: c < 8.5 ? "basso" : c > 10.5 ? "alto" : "norm", val: fmtN(c) + " mg/dL" }; },
  Alb:  p => { const a = albGdl(p); return a === null ? null : { st: a < 3.5 ? "basso" : a > 5.2 ? "alto" : "norm", val: fmtN(a) + " g/dL" }; }
};
function applyAuto(p){
  p.lab = p.lab || {}; p.labAuto = p.labAuto || {};
  for(const k in AUTO){ const a = AUTO[k](p); if(a){ p.lab[k] = a.st; p.labAuto[k] = true; } else if(p.labAuto[k]){ delete p.lab[k]; delete p.labAuto[k]; } }
}
const ST_ARR = { alto:"▲ alto", basso:"▼ basso", norm:"nella norma", pres:"presente" };
/* esami in una riga di testo: alterati con il valore, poi quanti nella norma */
function labLine(p){
  const lv = p.labVal || {}, val = e => { const a = AUTO[e.id] && AUTO[e.id](p); return a ? a.val : lv[e.id] ? hx(lv[e.id]) : ""; };
  const lab = Object.assign({}, p.lab || {}); for(const k in AUTO){ const a = AUTO[k](p); if(a && a.disp) lab[k] = a.disp; }
  const alt = PZ_EXAMS.filter(e => lab[e.id] && lab[e.id] !== "norm").map(e => e.name + " " + (e.binary ? "presente" : lab[e.id] === "alto" ? "▲" : "▼") + (val(e) ? " " + val(e) : ""));
  const norm = PZ_EXAMS.filter(e => lab[e.id] === "norm").map(e => e.name + (val(e) ? " " + val(e) : "") + (e.binary ? " assente" : ""));
  return [alt.join("; "), norm.length ? "nella norma: " + norm.join(", ") : ""].filter(Boolean).join(". ");
}
const sessoEta = (p, F) => [p.sesso ? (p.sesso === "donna" ? "donna" : "uomo") : "", F.age !== null ? F.age + " anni" : ""].filter(Boolean).join(", ");
const fxTxt = f => (FX_SEDI[f.sede] || f.sede) + (f.grado ? " (" + f.grado + ")" : "") + " " + fmtD(f.data);
const tsTxt = d => ["colonna " + fmtN(num(d.tL)), "femore totale " + fmtN(num(d.tFt)), "collo " + fmtN(num(d.tFn))].join(", ");
const defraTxt = (d, F) => "zona " + ZONE[d.zona].t.toLowerCase() + " (" + ZONE[d.zona].r + ")" + (num(d.rischio) !== null ? ", rischio a 10 anni " + fmtN(num(d.rischio), 0) + "%" : "");

/* ---------- riepilogo da incollare nella cartella del gestionale ---------- */
function pzText(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), pl = dxaPlan(F), L = [];
  L.push("OSTEOPOROSI - riepilogo del " + fmtD(todayISO()));
  L.push([pzName(p), sessoEta(p, F), F.bmi ? "BMI " + fmtN(F.bmi) : ""].filter(Boolean).join(", "));
  L.push("Fratture da fragilità: " + (F.fx.length ? F.fx.map(fxTxt).join("; ") : p.nessunaFx ? "nessuna" : "non registrate"));
  if(F.lastDxa) L.push("DXA del " + fmtD(F.lastDxa.data) + ": T-score " + tsTxt(F.lastDxa));
  if(F.zona) L.push("DeFRA del " + fmtD(F.lastDefra.data) + ": " + defraTxt(F.lastDefra, F));
  const sec = [...S.N.note, ...S.N.sosp].map(x => x.f.nome); if(sec.length) L.push("Forme secondarie dall'anamnesi: " + sec.join(", "));
  const ll = labLine(p); if(ll) L.push("Esami" + (p.labData ? " del " + fmtD(p.labData) : "") + ": " + ll);
  if(S.A.forms.length) L.push("Esami compatibili con: " + S.A.forms.map(x => COND[x.cid]).join(", "));
  if(S.hpp) L.push("Fosfatasi alcalina bassa: escludere l'ipofosfatasia (bisfosfonati controindicati)");
  if(n79.length) L.push("Nota 79: " + n79.map(c => c.cond).join("; "));
  if(p.decisione && DECISIONI[p.decisione.tipo]) L.push("Decisione: " + DECISIONI[p.decisione.tipo].t + " (" + fmtD(p.decisione.data) + ")");
  if(F.ther.length) L.push("Terapia in corso: " + F.ther.map(t => dnome(t.farmaco) + " dal " + fmtD(t.inizio) + (nextDose(t) ? ", prossima dose " + fmtDt(nextDose(t)) : "")).join("; "));
  L.push(pl.t);
  const td = pzTodo(p, F); if(td.length) L.push("Da fare: " + td.map(x => x.t).join("; "));
  return L.join("\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
function toast(m){ let t = $("#toast"); if(!t){ t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 2800); }
async function copyText(s, msg){
  try{ await navigator.clipboard.writeText(s); toast(msg); return; }catch(e){}
  const ta = document.createElement("textarea"); ta.value = s; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
  let ok = false; try{ ok = document.execCommand("copy"); }catch(e){} ta.remove(); ok ? toast(msg) : prompt("Copia il testo:", s);
}

/* ---------- promemoria del backup ---------- */
let LAST_BK = ""; try{ LAST_BK = localStorage.getItem("oh-mmg-backup") || ""; }catch(e){}
function backupAlert(){
  if(!PZ.length) return "";
  const lastAgg = PZ.map(p => p.agg || "").sort().pop() || "";
  if(LAST_BK && LAST_BK >= lastAgg) return "";
  const g = LAST_BK ? Math.round((new Date() - pDate(LAST_BK)) / 864e5) : null;
  if(g !== null && g < 14) return "";
  return `<div class="alert warn bk"><b>${LAST_BK ? `Ultimo backup ${g} giorni fa` : "L'archivio non ha ancora un backup"}</b>I pazienti sono salvati solo in questo browser: se si cancellano i dati di navigazione o si cambia computer vanno persi. <button type="button" class="lnk" id="pzExport2">Salva backup ora</button></div>`;
}
function doExport(){
  const blob = new Blob([JSON.stringify({ app:"Osteo Help", versione:1, salvato: new Date().toISOString(), pazienti: PZ }, null, 1)], { type:"application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "osteo-help-pazienti-" + todayISO() + ".json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  LAST_BK = todayISO(); try{ localStorage.setItem("oh-mmg-backup", LAST_BK); }catch(e){}
  toast("Backup salvato nella cartella dei download."); render();
}

/* ---------- blocco con codice: nasconde l'archivio a chi usa lo stesso computer (non cifra i dati) ---------- */
const PIN_KEY = "oh-mmg-pin", LOCK_MIN = 15;
let PIN = null; try{ PIN = JSON.parse(localStorage.getItem(PIN_KEY) || "null"); }catch(e){}
let locked = !!PIN, lastAct = Date.now();
async function pinHash(pin, salt){
  const b = new TextEncoder().encode(salt + ":" + pin);
  if(window.crypto && crypto.subtle){ const h = await crypto.subtle.digest("SHA-256", b); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, "0")).join(""); }
  let h = 5381; for(const c of b) h = ((h * 33) ^ c) >>> 0; return "d" + h;
}
function showLock(){
  locked = true;
  let el = $("#lock"); if(!el){ el = document.createElement("div"); el.id = "lock"; document.body.appendChild(el); }
  el.innerHTML = `<form class="lockbox" id="lockF"><span class="ibox">${mic("lock", "ic")}</span><h2>Archivio bloccato</h2><p>Inserisci il codice per aprire Osteo Help MMG.</p>
    <input type="password" id="lockIn" autocomplete="off" aria-label="Codice"><p class="lockerr" id="lockErr" hidden>Codice errato.</p>
    <button class="btn" type="submit">Sblocca</button><button type="button" class="lnk" id="lockForgot">Codice dimenticato?</button></form>`;
  el.hidden = false; document.body.classList.add("locked"); $("#main").innerHTML = "";
  setTimeout(() => { const i = $("#lockIn"); if(i) i.focus(); }, 50);
}
function unlock(){ locked = false; lastAct = Date.now(); const el = $("#lock"); if(el){ el.hidden = true; el.innerHTML = ""; } document.body.classList.remove("locked"); current = null; render(); }
async function setPin(){
  const a = prompt("Scegli un codice di almeno 4 caratteri. Servirà ad aprire l'archivio in questo browser."); if(a === null) return;
  if(a.length < 4){ alert("Il codice deve avere almeno 4 caratteri."); return; }
  const b = prompt("Ripeti il codice."); if(b === null) return; if(b !== a){ alert("I due codici non coincidono."); return; }
  const salt = Math.random().toString(36).slice(2); PIN = { salt, hash: await pinHash(a, salt) };
  try{ localStorage.setItem(PIN_KEY, JSON.stringify(PIN)); }catch(e){}
  alert("Codice impostato. L'archivio si blocca all'apertura e dopo " + LOCK_MIN + " minuti senza attività."); render();
}
async function removePin(){
  const a = prompt("Inserisci il codice attuale per toglierlo."); if(a === null) return;
  if(await pinHash(a, PIN.salt) !== PIN.hash){ alert("Codice errato."); return; }
  PIN = null; try{ localStorage.removeItem(PIN_KEY); }catch(e){} toast("Codice tolto."); render();
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
/* icone a tratto (24×24) della pagina iniziale */
const MIC = {
  add:'<circle cx="10" cy="8" r="3.6"/><path d="M3.5 20c0-3.8 2.9-6.3 6.5-6.3s6.5 2.5 6.5 6.3"/><path d="M18.5 7.5v6M15.5 10.5h6"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8.5 7.5h7M8.5 11h5"/>',
  down:'<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  up:'<path d="M12 15V3m-5 5 5-5 5 5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>'
};
const mic = (n, c) => `<svg class="${c || "mi"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MIC[n]}</svg>`;
/* avatar a mezzo busto: uomo, donna (capelli lunghi) o neutro se il sesso non è indicato */
const AVATAR = {
  uomo:'<path class="ab" d="M5 46c0-10.5 7.6-17.5 17-17.5s17 7 17 17.5z"/><circle class="ah" cx="22" cy="17.5" r="7.2"/><path class="ac" d="M14.6 17.2c-.4-5.6 3-8.8 7.4-8.8s7.8 3.2 7.4 8.8c-1-2.7-3.2-4.2-7.4-4.2s-6.4 1.5-7.4 4.2z"/>',
  donna:'<path class="ac" d="M13.4 27c-2.2-9 .5-17.6 8.6-17.6s10.8 8.6 8.6 17.6c-2.4 1.3-5.1 1.8-8.6 1.8s-6.2-.5-8.6-1.8z"/><path class="ab" d="M6 46c0-10 7.2-17 16-17s16 7 16 17z"/><circle class="ah" cx="22" cy="18" r="6.9"/><path class="ac" d="M15.1 17.4c.4-5 3.3-7.6 6.9-7.6 3.1 0 5.8 1.8 6.8 5.7-3.3-.2-7-1.5-8.8-3.7-.9 2.2-2.6 4.3-4.9 5.6z"/>',
  "":'<path class="ab" d="M6 46c0-10 7.2-17 16-17s16 7 16 17z"/><circle class="ah" cx="22" cy="18" r="7.2"/>'
};
const avatar = p => `<span class="pav" aria-hidden="true"><svg viewBox="3 4 38 38">${AVATAR[p.sesso || ""] || AVATAR[""]}</svg></span>`;
const initials = p => { const w = pzName(p).replace(/[^\p{L}\s.]/gu, " ").split(/[\s.]+/).filter(Boolean); return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase() : "?"; };
function vPazienti(){
  const cards = PZ.slice().sort((a, b) => pzName(a).localeCompare(pzName(b), "it", { sensitivity:"base" })).map(p => {
    const F = pzFacts(p), all = allSteps(p), nx = nextStep(all), pl = dxaPlan(F);
    const bits = [p.sesso ? (p.sesso === "donna" ? "Donna" : "Uomo") : "", F.age !== null ? F.age + " anni" : ""].filter(Boolean).join(", ");
    const where = nx ? `Passo ${nx.i + 1} di ${STEPS.length} · ${nx.t}` : pl.st !== "ok" ? pl.t : "Percorso completo";
    return `<a class="pcard" href="#paz-${p.id}" data-q="${hx(pzName(p).toLowerCase())}">
      ${avatar(p)}
      <span class="pbody"><b>${hx(pzName(p))}</b><small>${bits || "Dati da completare"}${F.zona ? ` · <span class="zn z-${F.zona}"><i></i>zona ${ZONE[F.zona].t.toLowerCase()}</span>` : ""}</small>
        <span class="pprog">${all.map(x => `<i class="${x.st}"></i>`).join("")}</span><small class="pwhere">${where}</small></span>${CHEV}</a>`;
  }).join("");
  const todo = PZ.flatMap(p => pzTodo(p).map(x => Object.assign({ p }, x))).sort((a, b) => a.u - b.u);
  return { bar:"Pazienti", html: `<div class="mhome"><div class="mh-l">` + `<div class="mh-h">` + head("I miei pazienti", "Per ogni paziente con osteoporosi, un percorso guidato in 7 passi: dai dati alla terapia, fino ai controlli.") + `</div>
    <button type="button" class="entry big violet mh-new" id="pzNew"><span class="ibox">${mic("add", "ic")}</span><div><b>Nuovo paziente</b><small>Inizia il percorso dal passo 1</small></div>${CHEV}</button>
    <div class="mh-pl">
    ${PZ.length ? `<p class="lbl">Pazienti · ${PZ.length}</p>` : ""}
    ${PZ.length > 5 ? `<input class="search" id="pzQ" type="search" placeholder="Cerca un paziente" autocomplete="off">` : ""}
    ${PZ.length ? `<div class="pcards" id="pzList">${cards}</div>` : `<div class="pempty">Nessun paziente in archivio.<br>Inizia con «Nuovo paziente».</div>`}
    </div></div><div class="mh-r">
    ${pzStorageOk ? backupAlert() : `<div class="alert mh-bk"><b>Archivio non disponibile</b>Il browser non permette di salvare i dati (navigazione privata o dati del sito bloccati): i pazienti inseriti andranno persi alla chiusura.</div>`}
    <div class="mh-todo">${PZ.length ? `<p class="lbl">Da fare${todo.length ? " · " + todo.length : ""}</p>` + (todo.length ? `<div class="todo">${todo.slice(0, 15).map(x => todoItem(x, true)).join("")}</div>${todo.length > 15 ? `<p class="small">e altri ${todo.length - 15}: li trovi nella scheda di ciascun paziente.</p>` : ""}`
      : `<p class="hint">Nessuna scadenza: qui compaiono DXA da ripetere, dosi di denosumab e zoledronato, fine degli anabolici, rivalutazioni dopo 5 anni e fratture recenti senza terapia.</p>`) : ""}</div>
    <div class="mh-cons"><p class="lbl">Consulta</p>
    <div class="rows mrows">
      <a class="rowlink" href="#guida"><span class="ibox s">${mic("book")}</span><span>Guida per il medico di medicina generale<small>Cos'è l'osteoporosi, perché si cura, i farmaci</small></span>${CHEV}</a>
      <button type="button" class="rowlink" id="pzExport"${PZ.length ? "" : " disabled"}><span class="ibox s">${mic("down")}</span><span>Salva backup<small>${LAST_BK ? "Ultimo il " + fmtD(LAST_BK) : "Un file con tutto l'archivio"}</small></span>${CHEV}</button>
      <label class="rowlink"><span class="ibox s">${mic("up")}</span><span>Ripristina backup<small>Anche per spostare l'archivio su un altro computer</small></span>${CHEV}<input type="file" id="pzImport" accept="application/json,.json" hidden></label>
      ${PIN ? `<button type="button" class="rowlink" id="pzLockNow"><span class="ibox s">${mic("lock")}</span><span>Blocca ora<small>Blocco automatico dopo ${LOCK_MIN} minuti senza attività</small></span>${CHEV}</button>
      <button type="button" class="rowlink" id="pzLockOff"><span class="ibox s">${mic("lock")}</span><span>Togli il codice<small>L'archivio si aprirà senza codice</small></span>${CHEV}</button>`
      : `<button type="button" class="rowlink" id="pzLockSet"><span class="ibox s">${mic("lock")}</span><span>Blocco con codice<small>Per un computer usato anche da altri</small></span>${CHEV}</button>`}
    </div></div>
    <p class="foot">${mic("lock", "fi")} I dati restano solo in questo browser e non vengono inviati a nessun server. Se il computer è condiviso usa le iniziali o un codice e attiva il blocco con codice.<br>Ausilio alla decisione, non sostitutivo del giudizio del medico.</p></div></div>` };
}

/* ---------- il percorso: sette passi in ordine, ognuno con il suo stato ---------- */
const STEPS = [
  { k:"dati", t:"Dati e fratture", fare:"Anagrafica, peso e altezza, fratture da fragilità, familiarità." },
  { k:"anamnesi", t:"Anamnesi e farmaci", fare:"Malattie, farmaci e abitudini: le forme secondarie vengono riconosciute da sole." },
  { k:"esami", t:"Esami del sangue", fare:"Esami di I livello, per escludere le forme secondarie prima di trattare." },
  { k:"dxa", t:"Densitometria", fare:"T-score di colonna e femore dall'ultima DXA." },
  { k:"defra", t:"DeFRA", fare:"Calcola il rischio sul DeFRA e riporta qui la zona di colore." },
  { k:"terapia", t:"Terapia", fare:"Cosa fare secondo la zona e la Nota 79, e la tua decisione." },
  { k:"storico", t:"Follow-up", fare:"Prossima densitometria, rischio di rifrattura, andamento nel tempo." }
];
const STEP_IX = Object.fromEntries(STEPS.map((x, i) => [x.k, i]));
const DECISIONI = {
  mmg:{ t:"Terapia avviata da me", s:"Registra il farmaco qui sotto." },
  spec:{ t:"Inviato allo specialista", s:"Per anabolico o romosozumab, o per approfondire una forma secondaria." },
  nessuno:{ t:"Nessun farmaco per l'osteoporosi", s:"Vitamina D, calcio, attività fisica; nuova valutazione nel tempo." },
  attesa:{ t:"Decisione rimandata", s:"In attesa di esami o accertamenti." }
};
const DEC_ZONA = { verde:"nessuno", gialla:"mmg", arancione:"spec", rossa:"spec" };
function stepStatus(p, k, F, S){
  F = F || pzFacts(p);
  if(k === "dati"){
    const m = [];
    if(!p.nascita) m.push("data di nascita"); if(!p.sesso) m.push("sesso"); if(!F.bmi) m.push("peso e altezza");
    if(p.sesso === "donna" && p.postmeno === null) m.push("menopausa"); if(p.fam === null) m.push("familiarità");
    if(!F.fx.length && !p.nessunaFx) m.push("fratture");
    return m.length ? { st:"miss", s:"Mancano: " + m.join(", ") } : { st:"ok", s:[F.age + " anni", "BMI " + fmtN(F.bmi), F.fx.length ? plural(F.fx.length, "frattura", "fratture") : "nessuna frattura"].join(" · ") };
  }
  S = S || pzSecondary(p);
  if(k === "anamnesi"){ const n = S.N.note.length + S.N.sosp.length;
    return !p.anamOk ? { st:"miss", s:"Da compilare e confermare" } : n ? { st:"warn", s:plural(n, "forma secondaria", "forme secondarie") + " da considerare" } : { st:"ok", s:"Nessuna forma secondaria associata" }; }
  if(k === "esami"){ const ls = labStatus(p), n = S.A.forms.length;
    return ls.done < ls.tot ? { st:"miss", s:`${ls.done} di ${ls.tot} esami registrati` } : n || S.hpp ? { st:"warn", s:n ? plural(n, "forma compatibile", "forme compatibili") + " con gli esami" : "Fosfatasi alcalina bassa" } : { st:"ok", s:"Esami nella norma" }; }
  if(k === "dxa") return !F.lastDxa ? { st:"miss", s:"Nessuna densitometria" } : F.dxaAge > 24 ? { st:"warn", s:`Ultima del ${fmtD(F.lastDxa.data)}: più vecchia di 24 mesi` } : { st:"ok", s:`T-score minimo ${fmtN(F.minT)} (${fmtD(F.lastDxa.data)})` };
  if(k === "defra") return F.zona ? { st:"ok", s:"Zona " + ZONE[F.zona].t.toLowerCase() + " → " + ZONE[F.zona].chi } : { st:"miss", s:"Zona non ancora inserita" };
  if(k === "terapia"){ const d = p.decisione && DECISIONI[p.decisione.tipo];
    return !d ? { st:"miss", s:"Decisione da prendere" } : { st:p.decisione.tipo === "attesa" ? "warn" : "ok", s:d.t + " (" + fmtD(p.decisione.data) + ")" + (F.ther.length ? " · " + F.ther.map(t => DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome.replace(/ \(.*\)$/, "") : t.farmaco).join(", ") : "") }; }
  if(k === "storico"){ if(!p.decisione || !F.lastDxa) return { st:"miss", s:"Dopo la densitometria e la decisione sulla terapia" }; const pl = dxaPlan(F); return { st:pl.st, s:pl.t }; }
}
function allSteps(p){ const F = pzFacts(p), S = pzSecondary(p); return STEPS.map((x, i) => Object.assign({ i, k:x.k, t:x.t, fare:x.fare }, stepStatus(p, x.k, F, S))); }
/* il prossimo passo da fare: il primo che manca */
const nextStep = all => all.find(x => x.st === "miss") || null;
const MARK = { ok:"✓", warn:"!", miss:"" };
function stepperInner(p, k){
  const all = allSteps(p), i = STEP_IX[k], cur = all[i];
  return `<div class="stp-bar">${all.map(x => `<a href="#paz-${p.id}-${x.k}" class="stp-s ${x.st}${x.i === i ? " cur" : ""}" aria-label="Passo ${x.i + 1}: ${x.t}"></a>`).join("")}</div>
    <p class="stp-t"><b>Passo ${i + 1} di ${STEPS.length}</b> · ${cur.t}${STEPS[i + 1] ? `<span class="stp-n">poi: ${STEPS[i + 1].t}</span>` : ""}</p>`;
}
function stepNav(p, k){
  const i = STEP_IX[k], prev = STEPS[i - 1], next = STEPS[i + 1];
  return `<div class="stepnav noprint">
    <a class="btn sec" href="#paz-${p.id}${prev ? "-" + prev.k : ""}" aria-label="Indietro: ${prev ? prev.t : "scheda del paziente"}">← Indietro</a>
    ${k === "terapia" && !p.decisione ? `<button type="button" class="btn" data-scroll=".decs">Registra la decisione ↓</button>` : next ? `<a class="btn" href="#paz-${p.id}-${next.k}">Avanti: ${next.t} →</a>` : `<a class="btn" href="#paz-${p.id}">Fine: torna alla scheda</a>`}
  </div>`;
}

/* ---------- scheda del paziente: dove si trova nel percorso ---------- */
function vPaz(p){
  const F = pzFacts(p), S = pzSecondary(p), rc = riskCat(F.zona), vh = veryHigh(p, F), all = allSteps(p), nx = nextStep(all), pl = dxaPlan(F);
  const done = all.filter(x => x.st !== "miss").length;
  const info = [p.sesso ? (p.sesso === "donna" ? "Donna" : "Uomo") : "", F.age !== null ? F.age + " anni" : "", F.bmi ? "BMI " + fmtN(F.bmi) : ""].filter(Boolean).join(" · ");
  const go1 = nx ? `<a class="cont" href="#paz-${p.id}-${nx.k}"><small>Prossimo passo · ${done} di ${STEPS.length} completati</small><b>${nx.i + 1} · ${nx.t}</b><span>${nx.fare}</span><em>Continua →</em></a>`
    : `<div class="alert ok"><b>Percorso completato</b>${pl.t}. Torna al passo 7 a ogni controllo.</div>`;
  return { bar:"Scheda paziente", html: head(hx(pzName(p)), info || "Dati anagrafici da completare") + go1 + `
    ${vh.length ? `<div class="alert"><b>Rischio di frattura molto alto</b>${vh.join("; ")}.</div>` : ""}
    ${S.hpp ? `<div class="alert"><b>Fosfatasi alcalina bassa</b>Escludi l'ipofosfatasia prima di qualsiasi antiriassorbitivo: i bisfosfonati sono controindicati.</div>` : ""}
    ${(() => { const td = pzTodo(p, F); return td.length ? `<p class="lbl">Da fare</p><div class="todo">${td.map(x => todoItem(x, false)).join("")}</div>` : ""; })()}
    <p class="lbl">Il percorso</p>
    <ol class="path">${all.map(x => `<li class="${x.st}${nx && x.i === nx.i ? " next" : ""}"><a href="#paz-${p.id}-${x.k}"><span class="pn">${MARK[x.st] || x.i + 1}</span><span class="pt"><b>${x.t}</b><small>${x.s}</small></span>${nx && x.i === nx.i ? `<span class="st miss">prossimo</span>` : ""}${CHEV}</a></li>`).join("")}</ol>
    <div class="kpis">
      <div class="kpi"><small>Zona DeFRA</small><b>${rc ? zchip(F.zona) : "—"}</b><span>${rc ? rc.r + " · " + fmtD(F.lastDefra.data) : "non inserita"}</span></div>
      <div class="kpi"><small>T-score minimo</small><b>${F.minT !== null ? fmtN(F.minT) : "—"}</b><span>${F.lastDxa ? "DXA " + fmtD(F.lastDxa.data) : "nessuna DXA"}</span></div>
    </div>
    <p class="lbl">Documenti</p>
    <div class="docs">
      <button type="button" class="doc" data-copy="riepilogo"><b>Copia per la cartella</b><small>Riepilogo in testo da incollare nel gestionale</small></button>
      <a class="doc" href="#paz-${p.id}-report"><b>Report</b><small>Scheda completa da stampare o salvare in PDF</small></a>
      <a class="doc" href="#paz-${p.id}-lettera"><b>Lettera allo specialista</b><small>Invio già compilato con i dati del paziente</small></a>
      <a class="doc" href="#paz-${p.id}-foglio"><b>Foglio per il paziente</b><small>Come prendere la terapia, cosa fare a casa</small></a>
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
  return { bar: pzName(p), html: head("Dati e fratture", "Chi è il paziente e quali fratture ha avuto.") + `
    <div class="grid2">
      <label class="fld" style="grid-column:1/-1">Nome, iniziali o codice<input type="text" data-pf="nome" value="${hx(p.nome)}" autocomplete="off"></label>
      <label class="fld">Data di nascita<input type="date" data-pf="nascita" value="${hx(p.nascita)}"></label>
      <div class="fld">Sesso<div class="seg" role="group">${segPz("sesso", "donna", "Donna", p.sesso)}${segPz("sesso", "uomo", "Uomo", p.sesso)}</div></div>
      <label class="fld">Peso (kg)<input type="text" inputmode="decimal" autocomplete="off" data-pf="peso" value="${hx(p.peso)}"></label>
      <label class="fld">Altezza (cm)<input type="text" inputmode="decimal" autocomplete="off" data-pf="altezza" value="${hx(p.altezza)}"></label>
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
const CI_LBL = { esofago:"Disturbi esofagei (stenosi, acalasia) o impossibilità a stare in piedi o seduti per 30 minuti", tev:"Tromboembolismo venoso pregresso",
  cv:"Pregresso infarto o ictus, alto rischio cardiovascolare", rt:"Radioterapia sullo scheletro, tumori o metastasi ossee", denti:"Problemi dentari aperti o cure dentarie invasive programmate" };
/* testo copiato dal gestionale → voci proposte (riconosci.js) */
function gestItems(p){
  const own = new Set(p.feats || []), ci = p.ci || {}, seen = new Set();
  return riconosci(p.testoGest || "").map(r => {
    let id = r.id, note = r.o.n || "", v = !!r.o.v;
    if(id === "gnrh_o_adt"){ id = p.sesso === "donna" ? "gnrh" : "adt"; if(!p.sesso){ v = true; note = "Analogo del GnRH: nell'uomo con carcinoma prostatico è deprivazione androgenica."; } }
    if(id === "diabete_tipo") id = "diabete_t2";
    const label = r.tipo === "f" ? FEATLABEL[id] : CI_LBL[id], key = r.tipo + ":" + id;
    if(!label || seen.has(key) || (r.tipo === "f" && FEATSEX[id] && p.sesso && FEATSEX[id] !== p.sesso)) return null; seen.add(key);
    return { key, tipo:r.tipo, id, label, seg:r.seg, neg:r.neg, v, note, has: r.tipo === "f" ? own.has(id) : !!ci[id] };
  }).filter(Boolean);
}
function gestResHTML(p){
  if(!(p.testoGest || "").trim()) return "";
  const it = gestItems(p); if(!it.length) return `<p class="hint">Nessuna voce riconosciuta nel testo. Spunta le voci a mano nelle sezioni qui sotto.</p>`;
  const sel = it.filter(x => !x.has && !x.neg && !x.v).length;
  return `<p class="small">${plural(it.length, "voce riconosciuta", "voci riconosciute")}. Quelle spuntate verranno aggiunte; le altre sono da controllare (dubbie o negate nel testo).</p>
    <div class="gres">${it.map(x => `<button type="button" class="ck${x.has ? " has" : ""}" data-gsel="${x.key}" aria-pressed="${!x.has && !x.neg && !x.v}"${x.has ? " disabled" : ""}><span class="cb">${TICK}</span><span><b>${x.label}</b><small>«${hx(x.seg)}»${x.has ? " · già presente" : ""}${x.neg ? ` · <em class="gneg">sembra negata nel testo</em>` : ""}${x.note ? " · " + x.note : ""}</small></span></button>`).join("")}</div>
    <div class="btns"><button type="button" class="btn" id="gestAdd">Aggiungi le voci spuntate${sel ? " (" + sel + ")" : ""}</button></div>`;
}
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
    return `<details class="acc pzax" data-pax="${i}"${pzOpenAx.has(i) ? " open" : ""}><summary><span>${a.label}<small>${all.slice(0, 4).map(f => f[1].replace(/ \(.*$/, "")).join(", ")}${all.length > 4 ? "…" : ""} · ${all.length} voci</small></span><span class="n"${nsel ? "" : " hidden"}>${nsel}</span>${CHEV}</summary><div class="accbody">${body}</div></details>`;
  }).join("");
  return { bar: pzName(p), html: head("Anamnesi e farmaci", "Spunta malattie, farmaci e abitudini: le forme secondarie compaiono in fondo alla pagina. Alla fine conferma l'anamnesi.") + `
    ${p.sesso ? "" : `<p class="hint">Indica il sesso nei dati del paziente per nascondere le voci non pertinenti.</p>`}
    <details class="acc gest"${(p.testoGest || "").trim() || !(p.feats || []).length ? " open" : ""}><summary><span>Incolla dal gestionale<small>Copia il riassunto di patologie e farmaci: l'app propone le voci da spuntare</small></span>${CHEV}</summary><div class="accbody">
      <textarea class="area" data-pf="testoGest" id="gestIn" rows="6" placeholder="Incolla qui l'elenco dei problemi e la terapia in corso (anche con nomi commerciali e dosi)">${hx(p.testoGest)}</textarea>
      <div class="btns"><button type="button" class="btn" id="gestGo">Riconosci</button></div>
      <div id="gestRes">${gestResHTML(p)}</div>
      <p class="small">Riconosce principi attivi e nomi commerciali, sinonimi, abbreviazioni (BPCO, AR, DM2, TVP…) e parole scritte in modo un po' diverso. Il testo resta in questo browser. Controlla sempre le proposte prima di aggiungerle.</p>
    </div></details>
    <div>${axes}</div>
    <p class="lbl">Altri dati per DeFRA e Nota 79</p>
    <div>
      ${ckPz("data-pbool", "gcMesi12", p.gcMesi12, "Glucocorticoidi (prednisone ≥5 mg/die) da più di 12 mesi")}
      ${ckPz("data-pbool", "disab", p.disab, "Grave disabilità motoria")}
    </div>
    <p class="lbl">Controindicazioni da conoscere prima della terapia</p>
    <div>
      ${Object.entries(CI_LBL).map(([k, t]) => ckPz("data-pci", k, (p.ci || {})[k], t)).join("")}
      ${ckPz("data-pbool", "dentista", p.dentista, "Visita odontoiatrica recente, bocca in ordine (da fare prima di bisfosfonati, denosumab o romosozumab)")}
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
  if(vdHigh(vd)) out.push(vdToss(vd) ? `<div class="alert"><b>Vitamina D nel range di intossicazione · ${vdTxt(vd)}</b>Sopra 375 nmol/L (150 ng/mL; ${SIOMMMS_VD}): sospendi l'integrazione e controlla calcemia e calciuria. L'intossicazione si caratterizza per ipercalcemia e rapido peggioramento della funzione renale.</div>`
    : `<div class="alert warn"><b>Vitamina D in eccesso · ${vdTxt(vd)}</b>Sopra 250 nmol/L (100 ng/mL): riduci o sospendi l'integrazione e ricontrolla. Si parla di intossicazione sopra 375 nmol/L (150 ng/mL; ${SIOMMMS_VD}).</div>`);
  if(vdLow(vd) || lab.D === "basso") out.push(`<div class="alert info"><b>Vitamina D bassa${vd !== null ? " · " + vdTxt(vd) : ""}</b>Sotto 75 nmol/L (30 ng/mL): carenza sotto 50, insufficienza tra 50 e 75 (${SIOMMMS_VD}); 75 nmol/L è il valore da raggiungere nel paziente con osteoporosi o a rischio di ipovitaminosi D (Nota 96). Correggi la carenza prima di iniziare la terapia: la carenza ne riduce l'efficacia e aumenta il rischio di ipocalcemia.</div>`);
  if(A.kind === "none") out.push(`<p class="hint">${labStatus(p).done ? "Tutti gli esami registrati sono nella norma." : "Segna ▲ o ▼ gli esami fuori norma e N quelli nella norma."}</p>`);
  else {
    const tags = `<div class="tags">${A.sel.map(s => `<span class="tag ${s[1]}">${ftag(s)}</span>`).join("")}</div>`;
    out.push(`<p class="lbl">${A.kind === "inter" ? "Forme compatibili" + (A.forms.length > 1 ? " · dalla più frequente" : "") : A.kind === "multi" ? "Più cause possibili" : "Nessuna forma nota"}</p>` + tags +
      (A.forms.length ? `<div class="stack">${A.forms.map(x => ohEntry("forma-" + x.cid, COND[x.cid], x.sub)).join("")}</div>` : `<p class="hint">Nessuna forma in elenco spiega questi reperti.</p>`) +
      (A.byForm.length ? `<p class="lbl">Esami di II livello</p><p class="small">${L2_NOTE}</p><div>${l2ByFormHTML(A.byForm, cid => COND[cid])}</div>` : ""));
  }
  return out.join("");
}
function triRow(p, e){
  const lab = p.lab || {}, a = AUTO[e.id] && AUTO[e.id](p), lv = (p.labVal || {})[e.id] || "";
  const btn = (kind, txt, cls, lbl) => `<button type="button" class="${cls}" data-pex="${e.id}" data-kind="${kind}" aria-pressed="${lab[e.id] === kind}" aria-label="${lbl}">${txt}</button>`;
  if(a){ const d = a.disp || a.st; return `<span class="auto ${d}" title="Ricavato dal valore inserito sopra">${ST_ARR[d]} · ${a.val}</span>`; }
  return (e.binary ? "" : `<input class="lv" data-lv="${e.id}" value="${hx(lv)}" inputmode="decimal" autocomplete="off" placeholder="valore" aria-label="Valore di ${e.name} (facoltativo)">`) + `<div class="tri">${
    e.binary ? btn("pres", "Presente", "u", e.name + " presente") + btn("norm", "Assente", "n", e.name + " assente")
      : btn("alto", "▲", "u", e.name + " alto") + btn("norm", "N", "n", e.name + " normale") + btn("basso", "▼", "d", e.name + " basso")}</div>`;
}
const caLine = p => { const c = caCorr(p);
  return c !== null ? `Calcio corretto per l'albumina: <b>${fmtN(c)} mg/dL</b> (calcio + 0,8 × (4 − albumina)); segnato sotto con i limiti 8,5–10,5 mg/dL.`
    : num(p.caTot) !== null ? "Inserisci l'albumina per calcolare il calcio corretto." : "Con calcio totale e albumina il calcio corretto si calcola da solo."; };
function vPazEsami(p){
  const grid = COMBO_GROUPS.map(g => `<div class="lgrp"><p class="lbl">${g.label}</p><div>` + g.exams.map(e => `<div class="row"><span>${e.name}</span><div class="rowr" data-trirow="${e.id}">${triRow(p, e)}</div></div>`).join("") + `</div></div>`).join("");
  return { bar: pzName(p), html: head("Esami del sangue", "Esami di I livello, per escludere le forme secondarie prima di trattare. Scrivi i valori che hai; per gli altri segna ▲ ▼ quelli fuori norma, poi «tutti gli altri nella norma».") + `
    <div class="grid2">
      <label class="fld">Data dei prelievi<input type="date" data-pf="labData" value="${hx(p.labData)}"></label>
      <label class="fld">eGFR (mL/min)<input type="text" inputmode="decimal" autocomplete="off" data-pf="egfr" value="${hx(p.egfr)}"></label>
      <label class="fld">Calcio totale (mg/dL)<input type="text" inputmode="decimal" autocomplete="off" data-pf="caTot" value="${hx(p.caTot)}"></label>
      <label class="fld">Albumina (g/dL)<input type="text" inputmode="decimal" autocomplete="off" data-pf="albVal" value="${hx(p.albVal)}"></label>
      <p class="small" data-live="cacorr" style="grid-column:1/-1;margin:0">${caLine(p)}</p>
      <div class="fld" style="grid-column:1/-1">25-OH-vitamina D<div class="vdrow"><input type="text" inputmode="decimal" autocomplete="off" id="vdIn" value="${vdShow(num(p.vitd))}" aria-label="25-OH-vitamina D in ${vdUnit()}"><div class="seg" role="group" aria-label="Unità">${["nmol", "ng"].map(u => `<button type="button" data-vdu="${u}" aria-pressed="${VD_U === u}">${u === "ng" ? "ng/mL" : "nmol/L"}</button>`).join("")}</div></div></div>
    </div>
    <div class="btns"><button type="button" class="btn sec" id="labAllN">Tutti gli altri nella norma</button></div>
    <div id="pzGrid">${grid}</div>
    <p class="small">Nell'uomo aggiungi il testosterone totale; in base alla clinica anti-transglutaminasi con IgA totali, PTH e TSH se non già eseguiti.</p>
    <div data-live="lab">${labReport(p, pzSecondary(p))}</div>` };
}

/* ---------- 4 · DeFRA ---------- */
function defraSummary(p, F){
  const r = [];
  r.push(["Sesso", p.sesso ? (p.sesso === "donna" ? "donna" : "uomo") : "—"]);
  r.push(["Età", F.age !== null ? F.age + " anni" : "—"]);
  r.push(["Peso", p.peso ? hx(p.peso) + " kg" : "—"]);
  r.push(["Altezza", p.altezza ? hx(p.altezza) + " cm" : "—"]);
  r.push(["Fratture vertebrali", F.vert.length ? F.vert.length + " (" + F.vert.map(f => f.grado || "gravità non nota").join(", ") + ")" : "nessuna"]);
  r.push(["Fratture di femore", F.fem.length || "nessuna"]);
  r.push(["Altre fratture", F.oth.length ? F.oth.map(f => FX_SEDI[f.sede]).join(", ") : "nessuna"]);
  r.push(["Familiarità femore/vertebre", p.fam === null ? "—" : p.fam ? "sì" : "no"]);
  r.push(["Fumo / alcol", (F.feats.has("fumo") ? "fumatore" : "non fumatore") + " / " + (F.feats.has("alcol") ? "≥ 3 unità al giorno" : "no")]);
  r.push(["Glucocorticoidi", F.gc ? "sì" + (p.gcMesi12 ? ", da oltre 12 mesi" : "") : "no"]);
  r.push(["Malattie", F.comorb.length ? F.comorb.join(", ") : "nessuna delle malattie del DeFRA"]);
  r.push(["Terapia adiuvante", F.adj ? "sì" : "no"]);
  if(F.lastDxa){ r.push(["T-score colonna lombare", fmtN(num(F.lastDxa.tL))]); r.push(["T-score femore totale", fmtN(num(F.lastDxa.tFt))]); r.push(["T-score collo femorale", fmtN(num(F.lastDxa.tFn))]); r.push(["Data della DXA", fmtD(F.lastDxa.data)]); }
  return `<ul class="list kv">${r.map(x => `<li><span>${x[0]}</span><em>${x[1]}</em></li>`).join("")}</ul>`;
}
function defraLive(p){
  const F = pzFacts(p), chk = defraChecklist(p, F), miss = chk.filter(x => x.st === "miss").length;
  return `<ul class="list chk">${chk.map(x => `<li>${stTag(x.st)}<span><b>${x.t}</b><small>${x.s}</small></span></li>`).join("")}</ul>
    ${miss ? `<div class="alert info"><b>${plural(miss, "dato manca", "dati mancano")}</b>Completa prima i dati, poi apri il DeFRA.</div>` : `<div class="alert ok"><b>Dati pronti per il DeFRA</b>Riportali nel calcolatore e torna qui a inserire il rischio.</div>`}
    <p class="lbl">Da riportare nel DeFRA</p>${defraSummary(p, F)}`;
}
function vPazDefra(p){
  const F = pzFacts(p), rc = riskCat(F.zona);
  const hist = F.defra.map(d => `<li class="rec"><span><b>${zchip(d.zona)}</b><small>${fmtD(d.data)}${num(d.rischio) !== null ? " · rischio a 10 anni " + fmtN(num(d.rischio), 0) + "%" : ""}${d.note ? " · " + hx(d.note) : ""}</small></span><button type="button" class="x" data-del="defra:${p.defra.indexOf(d)}" aria-label="Elimina">✕</button></li>`).join("");
  return { bar: pzName(p), html: head("DeFRA e rischio di frattura", "Il DeFRA (SIOMMMS e SIR) stima il rischio di fratture maggiori a 10 anni, unendo DXA e fattori clinici, e lo colloca in una zona di colore.") + `
    <p class="lbl">Cosa serve</p>
    <div data-live="defra">${defraLive(p)}</div>
    <div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>
    <p class="lbl">Zona di rischio</p>
    ${rc ? zoneAlert(rc, ` <a href="#paz-${p.id}-terapia">Indicazioni alla terapia</a>`) + `<p class="small">Inserita il ${fmtD(F.lastDefra.data)}.</p>` : ""}
    ${hist ? `<ul class="list recs">${hist}</ul>` : ""}
    <div class="addbox">
      <div class="zpick" role="group" aria-label="Zona del DeFRA">${ZONE_ORDER.map(z => `<button type="button" class="zbtn z-${z}" data-zona="${z}" aria-pressed="false"><i></i><span><b>${ZONE[z].t}</b><small>${ZONE[z].r}</small></span></button>`).join("")}</div>
      <div class="grid2">
        <label class="fld">Data<input type="date" id="dfD" value="${todayISO()}"></label>
        <label class="fld">Rischio a 10 anni, % (facoltativo)<input type="text" inputmode="decimal" autocomplete="off" id="dfR" placeholder="fratture maggiori"></label>
        <label class="fld" style="grid-column:1/-1">Nota (facoltativa)<input type="text" id="dfN"></label>
      </div>
      <button type="button" class="btn sec" data-add="defra">Aggiungi zona</button>
    </div>
    <p class="lbl">Cosa significano le zone</p>
    <ul class="list zleg">${ZONE_ORDER.map(z => `<li>${zchip(z)}<span><b>${ZONE[z].r[0].toUpperCase() + ZONE[z].r.slice(1)} → ${ZONE[z].chi}</b><small>${ZONE[z].azione}</small></span></li>`).join("")}</ul>
    <p class="small">Le soglie delle zone dipendono dall'età (a parità di rischio percentuale, un paziente giovane cade in una zona più alta): per questo basta riportare la zona che indica il DeFRA. La rimborsabilità resta legata alle condizioni della Nota 79, nella pagina successiva.</p>` };
}

/* ---------- 5 · terapia ---------- */
function choiceHTML(p, F, fl, ids){
  return ids.map(id => { const f = fl[id];
    return `<span class="dchip${f && f.ci.length ? " ci" : f && f.warn.length ? " warn" : ""}">${dlink(id)}${f && f.ci.length ? " <i>controindicato</i>" : f && f.warn.length ? " <i>cautela</i>" : ""}</span>`; }).join("");
}
function therapyLive(p){
  const F = pzFacts(p), S = pzSecondary(p), fl = drugFlags(p, F, S), n79 = nota79(p, F), rc = riskCat(F.zona), vh = veryHigh(p, F), ls = labStatus(p);
  const pre = [];
  if(ls.done < ls.tot) pre.push(`Esami del sangue incompleti (${ls.done} di ${ls.tot}, <a href="#paz-${p.id}-esami">passo 3</a>): servono per escludere le forme secondarie.`);
  if(S.N.sosp.length || S.N.note.length) pre.push(`${plural(S.N.note.length + S.N.sosp.length, "forma secondaria", "forme secondarie")} dall'anamnesi: <a href="#paz-${p.id}-anamnesi">vedi</a>. Alcune si curano rimuovendo la causa.`);
  if(S.A.forms.length) pre.push(`Esami compatibili con: ${S.A.forms.map(x => COND[x.cid]).join(", ")}.`);
  if(!F.zona) pre.push(`Manca la zona del DeFRA (<a href="#paz-${p.id}-defra">passo 5</a>).`);
  if(!F.lastDxa) pre.push(`Manca la densitometria (<a href="#paz-${p.id}-dxa">passo 4</a>): senza T-score molte condizioni della Nota 79 non si possono valutare.`);
  const tiers = ["I scelta", "II scelta", "III scelta"];
  const n79html = n79.length ? n79.map(c => `<div class="n79${c.spec ? " spec" : ""}"><small>${c.sez}${c.spec ? " · specialista, piano terapeutico" : ""}</small><b>${c.cond}</b>${c.s.map((l, i) => l.length ? `<div class="tier"><span>${c.alt && c.s.length === 1 ? "Opzione" : tiers[i]}</span><div>${choiceHTML(p, F, fl, l)}</div></div>` : "").join("")}</div>`).join("")
    : `<p class="hint">Con i dati inseriti il paziente non rientra in nessuna condizione della Nota 79${F.minT === null ? " (manca il T-score)" : ""}. Un farmaco resta possibile fuori Nota (a carico del paziente) se il rischio lo giustifica.</p>`;
  const flagList = DRUG_ORDER.filter(id => fl[id] && (fl[id].ci.length || fl[id].warn.length)).map(id => `<li><span><b>${DRUGS[id].nome}</b><small>${[...fl[id].ci.map(x => "controindicato: " + x), ...fl[id].warn.map(x => "cautela: " + x)].join(" · ")}</small></span></li>`).join("");
  return `
    ${rc ? `<p class="lbl">Indicazione dalla zona del DeFRA</p>` + zoneAlert(rc) : ""}
    ${pre.length ? `<div class="alert info"><b>Prima di scegliere</b>${pre.join("<br>")}</div>` : ""}
    ${vh.length ? `<div class="alert"><b>Rischio molto alto</b>${vh.join("; ")}. ${zoneHigh(F.zona) ? "Conferma l'invio" : "Considera l'invio"} allo specialista per un anabolico (teriparatide, abaloparatide, romosozumab) seguito da un antiriassorbitivo.</div>` : ""}
    <p class="lbl">Condizioni della Nota 79</p>${n79html}
    ${flagList ? `<p class="lbl">Controindicazioni e cautele per questo paziente</p><ul class="list chk">${flagList}</ul>` : ""}
    <p class="lbl">Per tutti</p>
    <ul class="list"><li><i>1</i>Calcio con la dieta 1000–1200 mg al giorno (integratore solo se la dieta non basta)</li><li><i>2</i>Vitamina D: correggere la carenza; in terapia per l'osteoporosi è rimborsabile senza dosaggio (Nota 96)</li><li><i>3</i>Attività fisica, prevenzione delle cadute, stop al fumo, alcol con moderazione</li><li><i>4</i>${p.dentista ? "Visita odontoiatrica: eseguita ✓" : "Visita odontoiatrica prima di bisfosfonati, denosumab o romosozumab"}</li></ul>`;
}
function vPazTerapia(p){
  const F = pzFacts(p), notes = therapyNotes(F), n79 = nota79(p, F);
  const n79of = id => { const c = n79.filter(c => c.s.some(l => l.includes(id))); return c.length ? "Nota 79: " + c.map(x => x.cond).join(" / ") + (c.some(x => x.spec) ? " (prescrizione su piano terapeutico specialistico)" : "") : "Con i dati inseriti non rientra in una condizione della Nota 79: verifica i dati o prescrivi fuori Nota."; };
  const all = (p.terapie || []).slice().sort((a, b) => (b.inizio || "").localeCompare(a.inizio || ""));
  const rows = all.map(t => { const i = p.terapie.indexOf(t), nd = !t.fine && nextDose(t);
    return `<li class="rec"><span><b>${DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : hx(t.farmaco)}</b><small>dal ${fmtD(t.inizio)}${t.fine ? " al " + fmtD(t.fine) : " · in corso"}${t.note ? " · " + hx(t.note) : ""}</small>${nd ? `<small class="dose-i">Ultima dose ${fmtD(lastDose(t))} · <b>prossima ${fmtDt(nd)}</b>${(t.dosi || []).length ? " · " + plural(t.dosi.length + 1, "dose", "dosi") + " registrate" : ""}</small>
      <span class="dose"><input type="date" id="dz${i}" value="${todayISO()}" aria-label="Data della dose"><button type="button" class="btn sec mini" data-dose="${i}">Registra dose fatta</button></span>` : ""}</span>${t.fine ? "" : `<button type="button" class="btn sec mini" data-stop="${p.terapie.indexOf(t)}">Termina</button>`}<button type="button" class="x" data-del="terapie:${p.terapie.indexOf(t)}" aria-label="Elimina">✕</button></li>`; }).join("");
  const sug = F.zona ? DEC_ZONA[F.zona] : null, cur = p.decisione ? p.decisione.tipo : null;
  return { bar: pzName(p), html: head("Terapia", "Leggi l'indicazione della zona del DeFRA e le condizioni della Nota 79 (determina AIFA dell'8 settembre 2025), poi registra la tua decisione in fondo.") + `
    <div data-live="ter">${therapyLive(p)}</div>
    <p class="lbl">La tua decisione</p>
    <div class="decs">${Object.entries(DECISIONI).map(([k, d]) => `<button type="button" class="dec" data-dec="${k}" aria-pressed="${cur === k}"><span class="cb">${TICK}</span><span><b>${d.t}${sug === k ? ` <em>indicata dalla zona</em>` : ""}</b><small>${d.s}</small></span></button>`).join("")}</div>
    ${cur ? `<p class="small">Registrata il ${fmtD(p.decisione.data)}.</p>` : ""}
    ${cur === "spec" || (!cur && zoneHigh(F.zona)) ? `<div class="alert info"><b>Lettera allo specialista</b>Già compilata con fratture, DXA, zona del DeFRA, esami e terapie: aggiungi il quesito e stampala. <a href="#paz-${p.id}-lettera">Apri la lettera</a></div>` : ""}
    <p class="lbl">Farmaci per l'osteoporosi</p>
    ${notes.length ? notes.map(n => `<div class="alert info"><b>${n.nome} · ${n.durata ? "da " + n.durata : "in corso"}</b>${n.s}<span class="n79l">${n79of(n.id)}</span></div>`).join("") + `<p class="small"><a href="#paz-${p.id}-foglio">Foglio per il paziente</a>: come prendere la terapia e cosa fare a casa, da stampare.</p>` : ""}
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
  const W = 520, H = opt.h || 220, L = 34, R = 132, T = 14, B = 26;
  const xs = points.map(pt => pt.x.getTime()), x0 = Math.min(...xs), x1 = Math.max(...xs), span = x1 - x0 || 1;
  const vals = points.flatMap(pt => series.map(s => pt[s[0]]).filter(v => v !== null));
  let y0 = Math.min(...vals, ...(opt.ref || [])), y1 = Math.max(...vals, ...(opt.ref || []));
  y0 = Math.floor(y0 - .5); y1 = Math.ceil(y1 + .5); if(opt.min !== undefined) y0 = Math.min(y0, opt.min); if(opt.max !== undefined) y1 = Math.max(y1, opt.max);
  const X = t => points.length === 1 ? L + (W - L - R) / 2 : L + (t - x0) / span * (W - L - R), Y = v => T + (y1 - v) / (y1 - y0 || 1) * (H - T - B);
  const step = (y1 - y0) > 12 ? 5 : (y1 - y0) > 5 ? 2 : 1, ticks = []; for(let v = Math.ceil(y0 / step) * step; v <= y1; v += step) ticks.push(v);
  let g = (opt.bands || []).map(b => { const ya = Y(Math.min(b[1], y1)), yb = Y(Math.max(b[0], y0)); return yb > ya ? `<rect x="${L}" y="${ya}" width="${W - L - R}" height="${yb - ya}" class="${b[2]}"/><text x="${L + 6}" y="${b[4] ? ya + 14 : yb - 6}" class="bl ${b[2]}">${b[3]}</text>` : ""; }).join("");
  g += ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" class="ax">${String(v).replace("-", "−")}</text>`).join("");
  (opt.ref || []).forEach((v, i) => { g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="rl"/><text x="${L + 4}" y="${Y(v) - 4}" class="ax">${opt.refLbl[i]}</text>`; });
  g += [points[0], points[points.length - 1]].filter((v, i, a) => a.indexOf(v) === i).map(pt => `<text x="${X(pt.x.getTime())}" y="${H - 6}" text-anchor="middle" class="ax">${fmtM(pt.x)}</text>`).join("");
  const used = [];
  series.forEach(s => {
    const pts = points.filter(pt => pt[s[0]] !== null); if(!pts.length) return;
    if(pts.length > 1) g += `<polyline fill="none" stroke="${s[2]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.map(pt => X(pt.x.getTime()) + "," + Y(pt[s[0]])).join(" ")}"/>`;
    g += pts.map(pt => `<circle cx="${X(pt.x.getTime())}" cy="${Y(pt[s[0]])}" r="4.5" fill="${s[2]}" stroke="var(--bg)" stroke-width="2"><title>${s[1]} · ${fmtM(pt.x)}: ${fmtN(pt[s[0]])}${opt.unit || ""}</title></circle>`).join("");
    const last = pts[pts.length - 1]; let ly = Y(last[s[0]]) + 4; while(used.some(u => Math.abs(u - ly) < 13)) ly += 13; used.push(ly);
    if(series.length > 1) g += `<text x="${W - R + 12}" y="${ly}" class="dl" fill="${s[2]}">${fmtN(last[s[0]])}<tspan class="dn"> ${s[1]}</tspan></text>`;
  });
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.label}">${g}</svg></figure>`;
}
function dxaChartHTML(F){
  const asc = F.dxa.slice().reverse().filter(d => pDate(d.data) && [d.tL, d.tFt, d.tFn].some(v => num(v) !== null));
  if(!asc.length) return "";
  const chart = asc.length > 1 ? lineChart(asc.map(d => ({ x: pDate(d.data), tL: num(d.tL), tFt: num(d.tFt), tFn: num(d.tFn) })), SERIES,
    { label:"Andamento del T-score", bands:[[-99, -2.5, "b-op", "Osteoporosi"], [-2.5, -1, "b-on", "Osteopenia", 1], [-1, 99, "b-ok", "Normale", 1]] }) : "";
  return `<div class="tsum">${tsSummary(asc)}</div>${chart}`;
}
/* variazione minima considerata reale tra due DXA: 0,2 di T-score */
const TS_LSC = 0.2;
const tsCat = v => v <= -2.5 ? ["op", "Osteoporosi"] : v < -1 ? ["on", "Osteopenia"] : ["ok", "Normale"];
function tsSummary(asc){
  return SERIES.map(([k, nome, col]) => {
    const pts = asc.filter(d => num(d[k]) !== null); if(!pts.length) return "";
    const v = num(pts[pts.length - 1][k]), prev = pts.length > 1 ? num(pts[pts.length - 2][k]) : null, c = tsCat(v);
    let tr = "";
    if(prev !== null){ const dl = Math.round((v - prev) * 10) / 10;
      tr = Math.abs(dl) < TS_LSC ? `<span class="tr st">= stabile</span>`
        : dl > 0 ? `<span class="tr up">▲ migliorata di ${fmtN(dl)}</span>` : `<span class="tr dn">▼ peggiorata di ${fmtN(-dl)}</span>`; }
    return `<div class="ts-r"><i style="background:${col}"></i><span class="ts-n">${nome}</span><b class="ts-v">${fmtN(v)}</b><span class="ts-c ${c[0]}">${c[1]}</span>${tr}</div>`;
  }).join("") + (asc.length > 1 ? `<p class="small">Variazioni rispetto alla DXA precedente; sotto ${fmtN(TS_LSC)} si considerano stabili (entro l'errore di misura).</p>` : "");
}
function vPazDxa(p){
  const F = pzFacts(p), pl = dxaPlan(F);
  const dxaRows = F.dxa.map(d => {
    return `<li class="rec"><span><b>${fmtD(d.data)}</b><small>colonna ${fmtN(num(d.tL))} · femore totale ${fmtN(num(d.tFt))} · collo ${fmtN(num(d.tFn))}</small></span><button type="button" class="x" data-del="dxa:${p.dxa.indexOf(d)}" aria-label="Elimina">✕</button></li>`; }).join("");
  return { bar: pzName(p), html: head("Densitometria", "Riporta il T-score di colonna lombare e femore dal referto della DXA.") + `
    ${F.lastDxa ? `<div class="alert ${pl.st === "ok" ? "ok" : pl.st === "warn" ? "warn" : ""}"><b>${pl.t}</b>${pl.s}</div>` : `<div class="alert info"><b>Nessuna densitometria</b>Se il paziente non ha una DXA lombare e femorale recente, richiedila e torna a questo passo quando hai il referto. Per la Nota 79 deve essere eseguita in una struttura pubblica o convenzionata.</div>`}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Data della DXA<input type="date" id="dxD" value="${todayISO()}"></label>
        <div class="fld">T-score colonna (L1–L4)<div class="tsrow"><button type="button" class="sgn" data-sgn="dxL" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxL" aria-label="T-score colonna (L1–L4)"></div></div>
        <div class="fld">T-score femore totale<div class="tsrow"><button type="button" class="sgn" data-sgn="dxFt" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxFt" aria-label="T-score femore totale"></div></div>
        <div class="fld">T-score collo femorale<div class="tsrow"><button type="button" class="sgn" data-sgn="dxFn" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxFn" aria-label="T-score collo femorale"></div></div>
      </div>
      <p class="small">Il segno meno è già inserito: per −2,7 scrivi solo 2,7. Tocca «−» per cambiarlo in «+» se il T-score è positivo.</p>
      <button type="button" class="btn sec" data-add="dxa">Aggiungi DXA</button>
    </div>
    ${dxaChartHTML(F)}
    ${dxaRows ? `<ul class="list recs">${dxaRows}</ul>` : ""}
    <p class="small">T-score uguale o inferiore a −2,5: osteoporosi; tra −1 e −2,5: osteopenia.</p>` };
}
function vPazStorico(p){
  const F = pzFacts(p), pl = dxaPlan(F), notes = therapyNotes(F), d = p.decisione && DECISIONI[p.decisione.tipo];
  const dfAsc = F.defra.slice().reverse().filter(d => pDate(d.data) && ZONE[d.zona]);
  const dfChart = dfAsc.length ? `<div class="ztl">${dfAsc.map((d, i) => { const prev = dfAsc[i - 1], dir = prev ? Math.sign(ZONE_ORDER.indexOf(d.zona) - ZONE_ORDER.indexOf(prev.zona)) : 0;
    return `<div class="ztl-i z-${d.zona}"><i></i><b>${ZONE[d.zona].t}</b><small>${fmtM(pDate(d.data))}${dir > 0 ? " · peggiorata" : dir < 0 ? " · migliorata" : ""}</small></div>`; }).join("")}</div>` : "";
  const imm = F.recent.length ? `<div class="alert"><b>Rischio imminente di rifrattura</b>${plural(F.recent.length, "frattura", "fratture")} negli ultimi 24 mesi (l'ultima il ${fmtD(F.recent[0].data)}). Dopo una frattura il rischio di una nuova frattura è massimo nei primi 1–2 anni: la terapia va iniziata o rivista subito, insieme alla prevenzione delle cadute.</div>`
    : F.fx.length ? `<div class="alert info"><b>Rischio di rifrattura</b>Una frattura da fragilità all'incirca raddoppia il rischio di altre fratture, anche dopo anni. Ultima frattura: ${fmtD(F.fx[0].data)}.</div>` : "";
  return { bar: pzName(p), html: head("Follow-up", "Cosa controllare nel tempo. A ogni controllo: nuova DXA al passo 4, nuova zona al passo 5, nuove fratture al passo 1.") + `
    <div class="alert ${pl.st === "ok" ? "ok" : pl.st === "warn" ? "warn" : ""}"><b>${pl.t}</b>${pl.s}${F.gc ? " Con glucocorticoidi ad alte dosi si può anticipare a 12 mesi." : ""} <a href="#paz-${p.id}-dxa">Densitometria</a></div>
    ${imm}
    ${d ? `<div class="alert info"><b>Decisione: ${d.t}</b>${fmtD(p.decisione.data)}. <a href="#paz-${p.id}-terapia">Terapia</a></div>` : ""}
    ${notes.map(n => `<div class="alert info"><b>${n.nome} · ${n.durata ? "da " + n.durata : "in corso"}</b>${n.s}</div>`).join("")}
    <p class="lbl">T-score nel tempo</p>
    ${dxaChartHTML(F) || `<p class="hint">Nessuna DXA registrata.</p>`}
    <p class="lbl">Zona del DeFRA nel tempo</p>
    ${dfChart || `<p class="hint">Nessuna zona registrata.</p>`}
    <p class="lbl">Fratture</p>
    ${F.fx.length ? `<ul class="list recs">${F.fx.map(f => `<li class="rec"><span><b>${FX_SEDI[f.sede]}${f.grado ? " · " + f.grado : ""}</b><small>${fmtD(f.data)}</small></span></li>`).join("")}</ul>` : `<p class="hint">${p.nessunaFx ? "Nessuna frattura da fragilità." : "Nessuna frattura registrata."}</p>`}
    <div class="btns"><a class="btn sec" href="#paz-${p.id}-report">Report da stampare</a></div>` };
}

/* ---------- report ---------- */
function vPazReport(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), fl = drugFlags(p, F, S), rc = riskCat(F.zona), pl = dxaPlan(F), vh = veryHigh(p, F);
  const miss = [], sec = (title, items, empty) => { if(items.length) return `<p class="lbl">${title}</p><ul class="list">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; if(empty) miss.push(empty); return ""; };
  const anam = (p.feats || []).map(id => FEATLABEL[id]).filter(Boolean).concat(p.fam === true ? ["Familiarità per fratture di femore o vertebre"] : []);
  const nomi = ids => ids.map(id => dnome(id).replace(/ \(.*\)$/, "") + (fl[id] && fl[id].ci.length ? " (controindicato)" : "")).join(", ");
  const ll = labLine(p), td = pzTodo(p, F), dec = p.decisione && DECISIONI[p.decisione.tipo];
  const body = sec("Fratture da fragilità", F.fx.length ? F.fx.map(fxTxt) : p.nessunaFx ? ["Nessuna"] : [], "fratture")
    + sec("Anamnesi e terapie", anam, p.anamOk ? "" : "anamnesi")
    + sec("Forme secondarie dall'anamnesi", [...S.N.note.map(x => x.f.nome + " — " + badgeOf(x, false)), ...S.N.sosp.map(x => x.f.nome + " — " + badgeOf(x, true))], "")
    + sec("Esami di I livello" + (p.labData ? " (" + fmtD(p.labData) + ")" : ""), ll ? [ll] : [], "esami")
    + (S.A.forms.length ? `<p class="note"><b>Forme compatibili con gli esami:</b> ${S.A.forms.map(x => COND[x.cid]).join(", ")}.${S.A.byForm.length ? " Esami di II livello, solo su sospetto clinico, partendo da " + COND[S.A.byForm[0][0]].toLowerCase() + ": " + S.A.byForm[0][1].join("; ") + "." : ""}</p>` : "")
    + (S.hpp ? `<p class="note"><b>Fosfatasi alcalina bassa:</b> escludere l'ipofosfatasia; bisfosfonati controindicati.</p>` : "")
    + sec("Densitometria (T-score)", F.dxa.map(d => fmtD(d.data) + " — " + tsTxt(d)), "densitometria")
    + (F.lastDxa ? `<p class="note">${pl.t}.</p>` : "")
    + sec("Rischio di frattura (DeFRA)", F.defra.filter(d => ZONE[d.zona]).map(d => fmtD(d.data) + " — " + defraTxt(d, F)), "zona del DeFRA")
    + (rc ? `<p class="note"><b>Zona ${rc.t.toLowerCase()} → ${rc.chi}.</b> ${rc.azione}</p>` : "")
    + (vh.length ? `<p class="note"><b>Rischio molto alto:</b> ${vh.join("; ")}.</p>` : "")
    + sec("Nota 79", n79.map(c => `<b>${c.cond}</b> — ${c.s.map((l, i) => l.length ? ["I", "II", "III"][i] + " scelta: " + nomi(l) : "").filter(Boolean).join("; ")}`), "")
    + (dec ? `<p class="lbl">Decisione</p><p class="note">${dec.t} (${fmtD(p.decisione.data)})</p>` : (miss.push("decisione sulla terapia"), ""))
    + sec("Terapie per l'osteoporosi", (p.terapie || []).map(t => dnome(t.farmaco) + " dal " + fmtD(t.inizio) + (t.fine ? " al " + fmtD(t.fine) : " (in corso)") + (!t.fine && nextDose(t) ? ", prossima dose " + fmtDt(nextDose(t)) : "")), "")
    + sec("Da fare", td.map(x => `<b>${x.t}</b> — ${x.s}`), "")
    + (p.note ? `<p class="lbl">Note</p><p class="note">${hx(p.note)}</p>` : "");
  return { bar:"Report", html: `<div class="report">` + head("Report osteoporosi", [hx(pzName(p)), sessoEta(p, F), F.bmi ? "BMI " + fmtN(F.bmi) : "", fmtD(todayISO())].filter(Boolean).join(" · ")) + `
    <div class="btns noprint"><button type="button" class="btn" id="pzPrint">Stampa o salva in PDF</button><button type="button" class="btn sec" data-copy="riepilogo">Copia per la cartella</button></div>
    ${miss.length ? `<p class="small noprint">Non ancora compilati: ${miss.join(", ")}.</p>` : ""}
    ${body}
    <p class="small">Generato con Osteo Help MMG. Ausilio al ragionamento clinico, non sostitutivo del giudizio del medico; verificare il testo vigente della Nota 79 e le schede tecniche.</p></div>` };
}

/* ---------- lettera allo specialista ---------- */
function letterReasons(p, F, S){
  const r = [];
  if(zoneHigh(F.zona)) r.push(`valutazione per terapia anabolica o con romosozumab (zona ${ZONE[F.zona].t.toLowerCase()} del DeFRA${F.rischio !== null ? ", rischio a 10 anni " + fmtN(F.rischio, 0) + "%" : ""})`);
  if(F.recent.length) r.push("frattura da fragilità recente, con rischio imminente di rifrattura");
  if(F.fxInTerapia) r.push("nuova frattura nonostante la terapia in corso");
  if(S.hpp) r.push("fosfatasi alcalina bassa, sospetta ipofosfatasia");
  const sec = [...S.A.forms.map(x => COND[x.cid]), ...S.N.note.map(x => x.f.nome), ...S.N.sosp.map(x => x.f.nome)];
  if(sec.length) r.push("inquadramento di una possibile forma secondaria (" + [...new Set(sec)].slice(0, 4).join(", ") + ")");
  if(!r.length) r.push("valutazione specialistica dell'osteoporosi e indicazione alla terapia");
  return r;
}
function letterData(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), ll = labLine(p);
  const ci = p.ci || {}, ciTxt = [ci.esofago && "disturbi esofagei", ci.tev && "tromboembolismo venoso pregresso", (ci.cv || F.feats.has("ictus_emiplegia")) && "pregresso infarto o ictus / rischio cardiovascolare", ci.rt && "radioterapia scheletrica o tumori ossei", ci.denti && "problemi dentari aperti", num(p.egfr) !== null && num(p.egfr) < 35 && "eGFR " + fmtN(num(p.egfr), 0) + " mL/min"].filter(Boolean);
  const anam = (p.feats || []).map(id => FEATLABEL[id]).filter(Boolean).concat(p.fam === true ? ["familiarità per fratture di femore o vertebre"] : []);
  const rows = [
    ["Fratture da fragilità", F.fx.length ? F.fx.map(fxTxt).join("; ") : p.nessunaFx ? "nessuna" : "non note"],
    ["Densitometria (T-score)", F.dxa.length ? F.dxa.slice(0, 3).map(d => fmtD(d.data) + ": " + tsTxt(d)).join("; ") : "non disponibile"],
    ["DeFRA", F.zona ? fmtD(F.lastDefra.data) + ": " + defraTxt(F.lastDefra, F) : "non calcolato"],
    ["Anamnesi e fattori di rischio", anam.length ? anam.join(", ") : "nulla di rilevante"],
    ["Forme secondarie considerate", [...S.N.note, ...S.N.sosp].map(x => x.f.nome).join(", ") || "nessuna dall'anamnesi"],
    ["Esami" + (p.labData ? " del " + fmtD(p.labData) : ""), (ll || "non disponibili") + (S.A.forms.length ? ". Compatibili con: " + S.A.forms.map(x => COND[x.cid]).join(", ") : "")],
    ["Terapie per l'osteoporosi", (p.terapie || []).length ? p.terapie.map(t => dnome(t.farmaco) + " dal " + fmtD(t.inizio) + (t.fine ? " al " + fmtD(t.fine) : " (in corso)")).join("; ") : "nessuna"],
    ["Da tenere presente per la terapia", ciTxt.length ? ciTxt.join(", ") : "nessuna controindicazione nota"],
    ["Nota 79", n79.length ? n79.map(c => c.cond).join("; ") : "nessuna condizione con i dati disponibili"]
  ];
  return { F, S, rows, quesito: p.quesito || letterReasons(p, F, S).join("; ") };
}
const MED = () => { try{ return localStorage.getItem("oh-mmg-medico") || ""; }catch(e){ return ""; } };
function letterText(p){
  const d = letterData(p), F = d.F, plain = s => String(s).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  return ["Gentile Collega,", "", `invio alla Sua attenzione ${pzName(p)}${sessoEta(p, F) ? " (" + sessoEta(p, F) + ")" : ""} per ${d.quesito}.`, "",
    ...d.rows.map(r => r[0] + ": " + plain(r[1])), "", "Resto a disposizione per ogni chiarimento. Cordiali saluti.", "", MED() || "Il medico di medicina generale", fmtD(todayISO())].join("\n");
}
function vPazLettera(p){
  const d = letterData(p), F = d.F;
  return { bar:"Lettera allo specialista", html: `<div class="report letter">
    <div class="btns noprint"><button type="button" class="btn" id="pzPrint">Stampa o salva in PDF</button><button type="button" class="btn sec" data-copy="lettera">Copia il testo</button></div>
    <p class="small noprint">Il quesito e la firma si possono modificare: tocca il testo evidenziato.</p>
    <p class="lt-h"><b>Richiesta di consulenza specialistica: osteoporosi</b><span>${fmtD(todayISO())}</span></p>
    <p>Gentile Collega,</p>
    <p>invio alla Sua attenzione <b>${hx(pzName(p))}</b>${sessoEta(p, F) ? " (" + sessoEta(p, F) + ")" : ""} per <span class="ce" contenteditable="true" data-ce="quesito" spellcheck="true">${hx(d.quesito)}</span>.</p>
    <ul class="list kv lt">${d.rows.map(r => `<li><span>${r[0]}</span><em>${r[1]}</em></li>`).join("")}</ul>
    <p>Resto a disposizione per ogni chiarimento. Cordiali saluti.</p>
    <p class="lt-f"><input id="medNome" class="noprint" value="${hx(MED())}" placeholder="Nome del medico (resta salvato)" autocomplete="off" aria-label="Firma"><span class="printonly">${hx(MED()) || "Il medico di medicina generale"}</span></p>
    ${p.quesito ? `<p class="small noprint"><button type="button" class="lnk" id="qReset">Ripristina il quesito proposto</button></p>` : ""}
  </div>` };
}

/* ---------- foglio per il paziente ---------- */
const PAZ_ISTR = {
  [A_]: "Una compressa una volta alla settimana, sempre lo stesso giorno. Al mattino appena alzato, a stomaco vuoto, con un bicchiere pieno di acqua naturale (non acqua ricca di calcio, caffè, latte o succhi). Poi resti in piedi o seduto con la schiena dritta per almeno 30 minuti: solo dopo faccia colazione e prenda le altre medicine. Se dimentica la dose, la prenda il mattino dopo e torni al giorno abituale.",
  [R_]: "Si prende al mattino a stomaco vuoto, con un bicchiere pieno di acqua naturale, secondo lo schema prescritto (una volta alla settimana o due giorni consecutivi al mese). Resti in piedi o seduto con la schiena dritta per almeno 30 minuti prima di mangiare o prendere altre medicine.",
  [I_]: "Una compressa al mese, sempre lo stesso giorno. Al mattino a stomaco vuoto, con un bicchiere pieno di acqua naturale. Resti in piedi o seduto con la schiena dritta per almeno 60 minuti prima di mangiare o prendere altre medicine.",
  [Z_]: "Un'infusione in vena una volta all'anno, in ambulatorio. Beva bene il giorno prima e il giorno dell'infusione. Nei 1–3 giorni dopo la prima infusione possono comparire febbre e dolori come in un'influenza: passano da soli e si può prendere paracetamolo.",
  [D_]: "Un'iniezione sotto la pelle ogni 6 mesi. È molto importante non saltarla e non ritardarla (al massimo 4 settimane): se si interrompe, l'effetto finisce in fretta e il rischio di fratture delle vertebre sale. Non la sospenda mai di sua iniziativa. Prima di ogni iniezione serve l'esame del calcio nel sangue.",
  [RX_]: "Una compressa al giorno, a qualsiasi ora. Va sospesa, d'accordo con il medico, prima di un intervento o se deve restare a letto a lungo. Avvisi subito il medico se compaiono gonfiore e dolore a un polpaccio o affanno improvviso.",
  [BZ_]: "Una compressa al giorno, a qualsiasi ora. Va sospesa, d'accordo con il medico, prima di un intervento o se deve restare a letto a lungo. Avvisi subito il medico se compaiono gonfiore e dolore a un polpaccio o affanno improvviso.",
  [T_]: "Un'iniezione sotto la pelle ogni giorno con la penna, possibilmente alla stessa ora, per un massimo di 24 mesi. Tenga la penna in frigorifero. Le prime volte faccia l'iniezione da seduto: può dare un leggero capogiro. Alla fine serve sempre un altro farmaco per mantenere il risultato.",
  [AB_]: "Un'iniezione sotto la pelle ogni giorno con la penna, per un massimo di 18 mesi. Prima del primo uso la penna va tenuta in frigorifero. Le prime volte faccia l'iniezione da seduto: può dare capogiri o battito accelerato. Alla fine serve un altro farmaco per mantenere il risultato.",
  [RO_]: "Due iniezioni sotto la pelle una volta al mese per 12 mesi. Avvisi subito il medico in caso di dolore al petto, difficoltà a parlare o debolezza di un braccio o di una gamba. Alla fine serve un altro farmaco per mantenere il risultato."
};
function vPazFoglio(p){
  const F = pzFacts(p), pl = dxaPlan(F), ther = F.ther, antir = ther.some(t => [...BISF, D_, RO_].includes(t.farmaco));
  const drugs = ther.length ? ther.map(t => { const n = nextDose(t);
    return `<div class="fg-d"><b>${dnome(t.farmaco)}</b><p>${PAZ_ISTR[t.farmaco] || ""}</p>${n ? `<p class="fg-next">${daysTo(n) < 0 ? `La dose era prevista il <b>${fmtDt(n)}</b>: la faccia al più presto.` : `Prossima dose: <b>${fmtDt(n)}</b>`}</p>` : ""}</div>`; }).join("")
    : `<p class="note">Al momento non è prevista una terapia specifica per l'osteoporosi: sono importanti i consigli qui sotto.</p>`;
  return { bar:"Foglio per il paziente", html: `<div class="report foglio">
    <div class="btns noprint"><button type="button" class="btn" id="pzPrint">Stampa</button></div>
    <h1>Le cure per le sue ossa</h1><div class="rule"></div>
    <p class="sub">${hx(pzName(p))} · ${fmtD(todayISO())}</p>
    <p class="lbl">La sua terapia</p>${drugs}
    ${antir ? `<p class="note"><b>Denti:</b> si lavi bene i denti ogni giorno e vada dal dentista con regolarità. Prima di estrazioni o impianti avvisi il dentista che prende questo farmaco. <b>Avvisi il medico</b> se compare un dolore nuovo alla coscia o all'inguine.</p>` : ""}
    <p class="lbl">Ogni giorno</p>
    <ul class="list fg">
      <li><b>Calcio con il cibo</b>: latte, yogurt e formaggi, verdure a foglia verde, legumi, acqua ricca di calcio. Il calcio in compresse solo se lo prescrive il medico.</li>
      <li><b>Vitamina D</b>: la prenda come indicato dal medico, senza saltare le dosi.</li>
      <li><b>Movimento</b>: cammini almeno 30 minuti al giorno; esercizi di equilibrio e di forza aiutano a non cadere.</li>
      <li><b>Niente fumo</b> e poco alcol (al massimo un bicchiere di vino al giorno).</li>
    </ul>
    <p class="lbl">Per non cadere in casa</p>
    <ul class="list fg">
      <li>Tolga tappeti scivolosi e fili dal pavimento; tenga una luce accesa di notte tra letto e bagno.</li>
      <li>Usi scarpe chiuse con suola antiscivolo; metta maniglie e tappetini antiscivolo in bagno.</li>
      <li>Si alzi lentamente dal letto e dalla sedia; controlli la vista con regolarità.</li>
    </ul>
    <p class="lbl">Prossimi controlli</p>
    <ul class="list fg"><li>${F.lastDxa ? pl.t.replace(/^Prossima DXA: /, "Densitometria (MOC): ") : "Densitometria (MOC): da prenotare secondo le indicazioni del medico"}.</li><li>Torni dal medico se ha una nuova frattura, un mal di schiena improvviso e forte o se si accorge di essere diventato più basso.</li></ul>
  </div>` };
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
    <p class="note">Il risultato cade in una di <b>quattro zone</b>, con soglie che salgono con l'età: <b>verde</b> (basso rischio) solo vitamina D, calcio e stile di vita; <b>gialla</b> (rischio moderato) terapia di prima linea dal MMG, bisfosfonati orali o denosumab; <b>arancione</b> (alto) e <b>rossa</b> (altissimo) invio allo specialista per anabolici o romosozumab. La stima del rischio aiuta così sia a scegliere la terapia più appropriata sia a decidere chi deve prescriverla.</p>
    <p class="note">Servono: età, sesso, peso, altezza, fratture da fragilità (sede, numero), familiarità per frattura di femore o vertebre, fumo, alcol, glucocorticoidi, malattie (artrite reumatoide e connettiviti, diabete, BPCO, MICI, HIV, Parkinson, sclerosi multipla, grave disabilità motoria), terapia ormonale adiuvante, T-score di colonna e femore.</p>
    <p class="note">La <b>Nota 79</b> stabilisce quando i farmaci sono a carico del SSN: in prevenzione secondaria (fratture vertebrali o di femore; altre fratture con T-score ≤ −3) e in prevenzione primaria (glucocorticoidi ≥5 mg/die per più di 3 mesi, blocco ormonale adiuvante, T-score ≤ −4, oppure ≤ −3 con familiarità o comorbilità). Il rischio a 10 anni ≥ 20% calcolato con un calcolatore validato entra nei criteri del romosozumab (per la donna in zona arancione o rossa). Fumo e alcol, in quanto modificabili, non contano ai fini della rimborsabilità.</p>
    <p class="note">Il passaggio dalla I alla II scelta richiede intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni; una nuova frattura dopo almeno un anno di terapia giustifica un cambio di classe. Zoledronato solo in strutture ospedaliere; denosumab prescrivibile dal MMG; teriparatide, abaloparatide e romosozumab su piano terapeutico specialistico.</p>
    <div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>` },
  { k:"base", t:"Calcio, vitamina D e stile di vita", s:"Per tutti, prima e durante la terapia", html:`
    <ul class="list"><li><i>1</i><span><b>Calcio</b>: 1000–1200 mg al giorno, possibilmente con la dieta (latte, yogurt, formaggi, acque ricche di calcio); integratore solo per la quota mancante.</span></li>
    <li><i>2</i><span><b>Vitamina D</b>: correggere la carenza prima di iniziare un farmaco (la carenza ne riduce l'efficacia e favorisce l'ipocalcemia). In chi è in terapia per l'osteoporosi si punta ad almeno 75 nmol/L (30 ng/mL); colecalciferolo rimborsabile senza dosaggio in corso di terapia remineralizzante (Nota 96). Secondo le linee guida SIOMMMS (Adami et al., Reumatismo 2011;63:129-147) si parla di carenza sotto 50 nmol/L, insufficienza tra 50 e 75, eccesso sopra 250 e intossicazione sopra 375 nmol/L (150 ng/mL); nei pazienti con malattie granulomatose o iperparatiroidismo primitivo l'integrazione va fatta con cautela, controllando periodicamente la 25(OH)D.</span></li>
    <li><i>3</i><span><b>Attività fisica</b> regolare, con esercizi di carico e di equilibrio.</span></li>
    <li><i>4</i><span><b>Cadute</b>: vista, farmaci sedativi e ipotensivi, casa sicura, calzature.</span></li>
    <li><i>5</i><span><b>Fumo</b> da sospendere, <b>alcol</b> sotto le 3 unità al giorno, peso adeguato.</span></li>
    <li><i>6</i><span><b>Bocca</b>: visita odontoiatrica e igiene orale prima di bisfosfonati, denosumab, romosozumab.</span></li></ul>` },
  { k:"followup", t:"Follow-up", s:"DXA ogni 18–24 mesi, rischio di rifrattura", html:`
    <ul class="list"><li><i>1</i><span><b>DXA ogni 18–24 mesi</b>, con lo stesso apparecchio (prima non è di solito utile: le variazioni sono minori dell'errore della misura). Si può anticipare a 12 mesi con glucocorticoidi ad alte dosi.</span></li>
    <li><i>2</i><span><b>Rischio di rifrattura</b>: dopo una frattura è massimo nei primi 1–2 anni. Una nuova frattura dopo almeno un anno di terapia è un motivo per cambiare classe di farmaco (Nota 79).</span></li>
    <li><i>3</i><span><b>Aderenza</b>: chiederla a ogni controllo; per i bisfosfonati orali, verificare come vengono assunti.</span></li>
    <li><i>4</i><span><b>Durata</b>: bisfosfonati: dopo 5 anni (3 per lo zoledronato) si rivaluta il rischio di frattura per decidere un'eventuale pausa terapeutica, mentre la DXA di controllo resta ogni 18–24 mesi; denosumab da non interrompere senza passare a un bisfosfonato; anabolici per un tempo limitato e poi sempre un antiriassorbitivo.</span></li>
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
  const V = { "":vPaz, dati:vPazDati, anamnesi:vPazAnamnesi, esami:vPazEsami, dxa:vPazDxa, defra:vPazDefra, terapia:vPazTerapia, storico:vPazStorico, report:vPazReport, lettera:vPazLettera, foglio:vPazFoglio }[m[2] || ""];
  return V ? V(p) : { redirect:"paz-" + p.id };
}
const pzParent = r => /^paz-[a-z0-9]+-/.test(r) ? r.replace(/-[a-z]+$/, "") : r.startsWith("paz-") ? "" : r.startsWith("guida-") || r.startsWith("farmaco-") ? "guida" : null;

/* aggiornamento delle parti che dipendono dai dati, senza ridisegnare i campi */
const PZ_LIVE = {
  stepper: p => { const m = /-([a-z]+)$/.exec(routeNow()); return m && STEP_IX[m[1]] !== undefined ? stepperInner(p, m[1]) : ""; },
  cacorr: caLine,
  sec: p => secReport(p, pzSecondary(p)), lab: p => labReport(p, pzSecondary(p)), defra: defraLive, ter: therapyLive,
  bmi: p => { const F = pzFacts(p); return F.bmi ? "BMI " + fmtN(F.bmi) + " kg/m²" + (F.bmi < 20 ? " — basso peso: è un fattore di rischio" : "") : ""; }
};
function pzLive(p){
  document.querySelectorAll("[data-live]").forEach(el => { const f = PZ_LIVE[el.dataset.live]; if(f) el.innerHTML = f(p); });
  Object.keys(AUTO).forEach(k => { const el = document.querySelector(`[data-trirow="${k}"]`), e = PZ_EXAMS.find(x => x.id === k); if(el && e && !el.contains(document.activeElement)) el.innerHTML = triRow(p, e); });
}

document.addEventListener("input", e => {
  if(e.target.id === "vdIn"){ const { p } = pzRoute(); if(!p) return; const v = num(e.target.value); p.vitd = v === null ? "" : String(Math.round((VD_U === "nmol" ? v / VD_F : v) * 10) / 10); applyAuto(p); savePz(p); return; }
  const lv = e.target.closest("[data-lv]"); if(lv){ const { p } = pzRoute(); if(!p) return; p.labVal = p.labVal || {}; p.labVal[lv.dataset.lv] = lv.value.trim(); savePz(p); return; }
  const ce = e.target.closest("[data-ce]"); if(ce){ const { p } = pzRoute(); if(p){ p[ce.dataset.ce] = ce.innerText.trim(); savePz(p); } return; }
  if(e.target.id === "medNome"){ try{ localStorage.setItem("oh-mmg-medico", e.target.value); }catch(err){} return; }
  const el = e.target.closest("[data-pf]"); if(el){ const { p } = pzRoute(); if(!p) return; p[el.dataset.pf] = el.value; if(["egfr", "caTot", "albVal"].includes(el.dataset.pf)) applyAuto(p); savePz(p); if(el.dataset.pf === "nome") $("#barT").textContent = pzName(p); return; }
  if(e.target.id === "pzQ"){ const q = e.target.value.trim().toLowerCase(); document.querySelectorAll("#pzList .pcard").forEach(a => { a.hidden = q && !a.dataset.q.includes(q); }); }
});
document.addEventListener("change", e => {
  if(e.target.closest("[data-pf]") || e.target.id === "vdIn"){ const { p } = pzRoute(); if(p) pzLive(p); return; }
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
  if(t.closest("#pzExport, #pzExport2")){ doExport(); return; }
  if(t.closest("#pzLockSet")){ setPin(); return; }
  if(t.closest("#pzLockOff")){ removePin(); return; }
  if(t.closest("#pzLockNow")){ showLock(); return; }
  if(t.closest("#lockForgot")){ if(confirm("Senza il codice l'unico modo per riaprire l'app è cancellare l'archivio di questo browser (potrai poi ripristinare un backup). Cancellare tutto?")){ try{ localStorage.removeItem(PZ_KEY); localStorage.removeItem(PIN_KEY); }catch(e){} location.hash = ""; location.reload(); } return; }
  const sc = t.closest("[data-scroll]"); if(sc){ const el = $(sc.dataset.scroll); if(el){ el.scrollIntoView({ behavior:"smooth", block:"center" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } return; }
  if(t.closest("#pzNew")){ const p = pzBlank(); PZ.push(p); savePz(); go("paz-" + p.id + "-dati"); return; }
  if(t.closest("#pzPrint")){ window.print(); return; }
  if(t.closest("#qReset")){ const { p } = pzRoute(); if(p){ p.quesito = ""; savePz(p); render(); } return; }
  const zb = t.closest(".zbtn"); if(zb){ document.querySelectorAll(".zbtn").forEach(x => x.setAttribute("aria-pressed", x === zb)); return; }
  const vu = t.closest("[data-vdu]");
  if(vu){ VD_U = vu.dataset.vdu; try{ localStorage.setItem("oh-mmg-vitd-unit", VD_U); }catch(e){} render(); return; }
  const sg = t.closest(".sgn[data-sgn]");
  if(sg){ const neg = sg.getAttribute("aria-pressed") !== "true"; sg.setAttribute("aria-pressed", neg); sg.textContent = neg ? "−" : "+"; sg.setAttribute("aria-label", "Segno del T-score: " + (neg ? "meno (tocca per più)" : "più (tocca per meno)")); return; }
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
  const dc = t.closest(".dec[data-dec]");
  if(dc){ const k = dc.dataset.dec; p.decisione = p.decisione && p.decisione.tipo === k ? null : { tipo:k, data:todayISO() }; savePz(p); render(); return; }
  if(t.closest("#gestGo")){ const el = $("#gestIn"); if(el){ p.testoGest = el.value; savePz(p); } $("#gestRes").innerHTML = gestResHTML(p); if(!$("#gestRes").innerHTML) toast("Incolla prima il testo dal gestionale."); return; }
  const gs = t.closest(".ck[data-gsel]"); if(gs){ if(!gs.disabled) gs.setAttribute("aria-pressed", gs.getAttribute("aria-pressed") !== "true"); return; }
  if(t.closest("#gestAdd")){
    const keys = [...document.querySelectorAll('.ck[data-gsel][aria-pressed="true"]')].map(x => x.dataset.gsel); if(!keys.length){ toast("Nessuna voce spuntata."); return; }
    const set = new Set(p.feats || []); p.ci = p.ci || {};
    keys.forEach(k => { const [tp, id] = k.split(":"); if(tp === "f") set.add(id); else p.ci[id] = true; });
    p.feats = [...set]; savePz(p); render(); toast(plural(keys.length, "voce aggiunta", "voci aggiunte") + ": controlla e conferma l'anamnesi."); return;
  }
  const dz = t.closest("[data-dose]");
  if(dz){ const th = p.terapie[+dz.dataset.dose], el = document.getElementById("dz" + dz.dataset.dose); if(th && el && el.value){ th.dosi = (th.dosi || []).concat(el.value).sort(); savePz(p); render(); toast("Dose registrata: prossima il " + fmtDt(nextDose(th)) + "."); } return; }
  const cp = t.closest("[data-copy]");
  if(cp){ cp.dataset.copy === "lettera" ? copyText(letterText(p), "Lettera copiata.") : copyText(pzText(p), "Riepilogo copiato: incollalo nella cartella del paziente."); return; }
  if(t.closest("#labAllN")){ p.lab = p.lab || {}; let n = 0; PZ_EXAMS.forEach(e => { if(!p.lab[e.id]){ p.lab[e.id] = "norm"; n++; } }); savePz(p); render(); toast(n ? plural(n, "esame segnato", "esami segnati") + " nella norma." : "Tutti gli esami erano già indicati."); return; }
  const st = t.closest("[data-stop]");
  if(st){ const th = p.terapie[+st.dataset.stop]; if(th){ th.fine = todayISO(); savePz(p); render(); } return; }
  const ad = t.closest("[data-add]");
  if(ad){
    const k = ad.dataset.add, v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
    if(k === "fratture"){ if(!v("fxData")){ alert("Indica la data della frattura (anche approssimativa)."); return; }
      p.fratture.push({ sede: v("fxSede"), data: v("fxData"), grado: v("fxSede") === "vertebra" ? v("fxGrado") : "", inTerapia: $('.ck[data-tmp="fxInT"]').getAttribute("aria-pressed") === "true" }); p.nessunaFx = false; }
    if(k === "dxa"){ if(!v("dxD") || ![v("dxL"), v("dxFt"), v("dxFn")].some(x => num(x) !== null)){ alert("Indica la data e almeno un T-score."); return; }
      /* il segno viene dal pulsante −/+ (già su «−»); un «-» o «−» scritto a mano vale comunque come negativo */
      const T = id => { const raw = v(id).replace("−", "-"), n = num(raw); if(n === null) return ""; const neg = /^\s*-/.test(raw) || document.querySelector(`[data-sgn="${id}"]`).getAttribute("aria-pressed") === "true"; return String(neg ? -Math.abs(n) : Math.abs(n)); };
      p.dxa.push({ data: v("dxD"), tL: T("dxL"), tFt: T("dxFt"), tFn: T("dxFn") }); }
    if(k === "defra"){ const zb = document.querySelector('.zbtn[aria-pressed="true"]'); if(!zb || !v("dfD")){ alert("Scegli la zona indicata dal DeFRA e la data."); return; } p.defra.push({ data: v("dfD"), zona: zb.dataset.zona, rischio: num(v("dfR")) === null ? "" : String(num(v("dfR"))), note: v("dfN") }); }
    if(k === "terapie"){ if(!v("thI")){ alert("Indica la data di inizio."); return; } p.terapie.push({ farmaco: v("thF"), inizio: v("thI"), fine:"", note: v("thN") }); }
    savePz(p); render(); return;
  }
});

/* ---------- navigazione ---------- */
const stack = [];
let current = null, actFn = null, doneTo = null;
function render(){
  if(locked) return;
  const route = routeNow();
  const v = pzView(route) || { redirect:"" };
  if(v.redirect !== undefined){ history.replaceState(null, "", v.redirect ? "#" + v.redirect : location.pathname + location.search); return render(); }
  const changed = route !== current; current = route;
  /* sezioni del paziente: «Fatto» riporta alla scheda; nella scheda riporta all'elenco */
  const m = /^paz-([a-z0-9]+)(-[a-z]+)?$/.exec(route), back = m ? (m[2] ? "paz-" + m[1] : "") : null;
  const sk = m && m[2] ? m[2].slice(1) : null, isStep = sk && STEP_IX[sk] !== undefined, pp = m ? pzGet(m[1]) : null;
  const top = isStep && pp ? `<div class="stepper noprint" data-live="stepper">${stepperInner(pp, sk)}</div>` : "";
  const nav = isStep && pp ? stepNav(pp, sk) : "";
  $("#main").innerHTML = `<div class="screen">${top}${v.html}${nav}</div>`;
  doneTo = back; $("#act").hidden = back === null;
  const home = !route;
  $(".bar").classList.toggle("home", home);
  if(home) $("#barT").innerHTML = `<span class="oh">OH</span>Osteo Help <span class="mmg">MMG</span>`; else $("#barT").textContent = v.bar;
  $("#back").style.visibility = home ? "hidden" : "visible";
  if(changed) window.scrollTo(0, 0);
}
function goBack(){ if(stack.length > 1) history.back(); else go(pzParent(current) || ""); }
$("#back").addEventListener("click", goBack);
$("#act").addEventListener("click", () => { if(doneTo !== null) go(doneTo); });
window.addEventListener("hashchange", () => {
  const r = routeNow();
  if(stack.length > 1 && stack[stack.length - 2] === r) stack.pop(); else stack.push(r);
  render();
});
stack.push(routeNow());
document.addEventListener("submit", async e => {
  if(e.target.id !== "lockF") return; e.preventDefault();
  const v = $("#lockIn").value; if(PIN && await pinHash(v, PIN.salt) === PIN.hash) unlock(); else { $("#lockErr").hidden = false; $("#lockIn").value = ""; $("#lockIn").focus(); }
});
["pointerdown", "keydown", "input"].forEach(ev => document.addEventListener(ev, () => { lastAct = Date.now(); }, true));
setInterval(() => { if(PIN && !locked && Date.now() - lastAct > LOCK_MIN * 60000) showLock(); }, 20000);
if(locked) showLock(); else render();
