/* ============================================================
   OSTEO HELP MMG — scheda del paziente con osteoporosi (app separata da Osteo Help)
   Anamnesi e terapie → forme secondarie (stesso motore di «Esami normali»),
   esami di I livello → forme compatibili (stesso motore di «Esami alterati»),
   rischio di frattura, Nota 79, storico DXA/DeFRA/fratture, report.
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
/* date anche parziali: «2019» (solo anno: si conta da metà anno), «2019-05», «2019-05-14» */
const pDate = s => { if(!s) return null; const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(s); return m ? new Date(+m[1], m[2] ? +m[2] - 1 : 6, +(m[3] || 1)) : null; };
const fmtD = s => { const d = pDate(s); if(!d) return "—"; if(/^\d{4}$/.test(s)) return s; return (/^\d{4}-\d{2}$/.test(s) ? "" : String(d.getDate()).padStart(2, "0") + "/") + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear(); };
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
/* rivalutazione: si conserva lo storico (fratture, DXA, DeFRA, terapie); si rifanno anamnesi, esami, DeFRA e decisione */
function pzRivaluta(p){
  const F = pzFacts(p), S = pzSecondary(p);
  (p.visite = p.visite || []).push({ data: p.decisione ? p.decisione.data : (p.rival ? p.rival.dal : p.creato), zona: F.zona || "", rischio: F.rischio, minT: F.minT,
    dec: p.decisione ? p.decisione.tipo : "", farmaci: F.ther.map(t => t.farmaco), fx: F.fx.length,
    sec: [...S.N.note, ...S.N.sosp].map(x => x.f.nome).concat(S.A.forms.map(x => COND[x.cid])),
    esami: { lab: p.lab, labData: p.labData, egfr: p.egfr, vitd: p.vitd, caTot: p.caTot, albVal: p.albVal, labVal: p.labVal } });
  p.rival = { dal: todayISO() }; p.fxRiv = false; if(!(p.fratture || []).length) p.nessunaFx = false; p.anamOk = false; p.decisione = null;
  p.lab = {}; p.labData = ""; p.egfr = ""; p.vitd = ""; p.caTot = ""; p.albVal = ""; p.labVal = {};
  savePz(p);
}
/* anamnesi completa: basta aver inserito patologie o farmaci, oppure «Anamnesi muta»; in rivalutazione va rivista */
const anamHas = p => (p.feats || []).length > 0 || Object.entries(p.ci || {}).some(([k, v]) => v && k !== "denti");
const anamDone = p => !!p.anamOk || (!p.rival && anamHas(p));
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

/* la riga del BMI c'è sempre, anche vuota: se comparisse solo dopo, i pulsanti sotto si sposterebbero mentre il medico li tocca */
const bmiTxt = F => F.bmi ? "BMI " + fmtN(F.bmi) + " kg/m²" + (F.bmi < 20 ? " — basso peso: è un fattore di rischio" : "") : "BMI: si calcola da peso e altezza";
/* glucocorticoidi (prednisone ≥5 mg/die o equivalenti): "" non indicato, "0" meno di 3 mesi o dose minore, "3" più di 3 mesi, "12" più di 12 mesi */
const gcDurOf = p => p.gcDur || (p.gcMesi12 ? "12" : "");
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

/* le fratture del paziente in poche parole, per dire perché rientra in una condizione della Nota 79 */
function fxBreve(F, sedi){
  const g = {}; F.vert.forEach(f => { const k = f.grado || "di gravità non nota"; g[k] = (g[k] || 0) + 1; });
  const v = ["grave", "moderata", "lieve", "di gravità non nota"].filter(k => g[k]).map(k => g[k] === 1 ? "1 frattura vertebrale " + k : g[k] + " fratture vertebrali " + (k === "di gravità non nota" ? k : k.replace(/a$/, "e")));
  if(F.fem.length) v.push(F.fem.length === 1 ? "1 frattura di femore" : F.fem.length + " fratture di femore");
  if(sedi) F.oth.filter(f => sedi.includes(f.sede)).forEach(f => v.push("frattura " + ({ polso:"di avambraccio", omero:"di omero", bacino:"di bacino", tibia:"di tibia" }[f.sede] || "di " + (FX_SEDI[f.sede] || "").toLowerCase())));
  return v.join(", ");
}
/* ---------- Nota 79 (testo della determina AIFA dell'8 settembre 2025) ---------- */
const RO_NB = "solo se non è possibile seguire altri trattamenti efficaci (intolleranza, inefficacia, fine del periodo consentito)";
function nota79(p, F){
  const out = [], serm = F.donna ? [RX_, BZ_] : [];
  if(F.nVF >= 1){
    const ext = [];
    if(F.nVF >= 3) ext.push("3 o più fratture vertebrali o di femore");
    if(F.minT !== null && F.minT <= -4) ext.push("frattura con T-score ≤ −4");
    if(F.gc && gcDurOf(p) === "12") ext.push("frattura in terapia con prednisone ≥5 mg/die da oltre 12 mesi");
    if(F.fxInTerapia) ext.push("nuova frattura vertebrale o di femore nonostante almeno 1 anno di terapia in Nota 79");
    if(ext.length) out.push({ sez:"Prevenzione secondaria", cond: ext.join("; "), s:[[T_], [D_, Z_], [A_, R_, I_]], spec:true });
    /* con 1 o 2 fratture vale anche la riga «1-2 fratture» (alendronato, risedronato, zoledronato di I scelta), anche quando c'è una condizione da teriparatide */
    if(F.nVF <= 2) out.push({ sez:"Prevenzione secondaria", cond: fxBreve(F).replace(/^1 f/, "F"), s:[[A_, R_, Z_], [D_, I_, ...serm]] });
  }
  if(F.donna && p.postmeno === true && F.minT !== null){
    const lim = F.age !== null && F.age > 65 ? -2 : -2.5;
    const site5 = F.fx.some(f => ["polso","omero","bacino","femore","tibia"].includes(f.sede) && (monthsSince(f.data) ?? 999) <= 60);
    if(F.minT < lim && F.minT > -5 && (F.vertLievi >= 2 || F.vertModGr >= 1 || site5))
      out.push({ sez:"Prevenzione secondaria", cond:`Donna in postmenopausa${lim === -2 ? " oltre i 65 anni" : ""}, T-score ${fmtN(F.minT)}, ${fxBreve(F, ["polso","omero","bacino","tibia"])}`, s:[[AB_], [D_, Z_], [A_, R_, I_]], spec:true, alt:true });
  }
  /* romosozumab: serve il rischio a 10 anni ≥20% da un calcolatore validato; la sola zona del DeFRA non basta */
  const r20 = F.rischio !== null && F.rischio >= 20, r20t = `rischio a 10 anni ${fmtN(F.rischio, 0)}% sul DeFRA`;
  if(F.donna && F.minT !== null && r20){
    const lim = F.vertModGr >= 2 || F.femRecent2y ? -2 : -2.5;
    if(F.minT < lim && (F.vertModGr >= 1 || F.vertLievi >= 2 || F.fem.length >= 1))
      out.push({ sez:"Prevenzione secondaria", cond:"T-score " + fmtN(F.minT) + ", " + fxBreve(F) + ", " + r20t, nb:RO_NB, s:[[RO_]], spec:true, alt:true });
  }
  if(F.oth.length >= 1 && F.minT !== null && F.minT <= -3)
    out.push({ sez:"Prevenzione secondaria", cond:"Frattura " + ({ polso:"di avambraccio", omero:"di omero", bacino:"di bacino", tibia:"di tibia", coste:"costale" }[F.oth[0].sede] || "non vertebrale") + " con T-score " + fmtN(F.minT), s:[[A_, R_, Z_], [D_, I_, ...serm]] });
  if(F.donna && F.oth.length >= 2 && F.minT !== null && F.minT < -2.5 && r20)
    out.push({ sez:"Prevenzione secondaria", cond:F.oth.length + " fratture non vertebrali, T-score " + fmtN(F.minT) + ", " + r20t, nb:RO_NB, s:[[RO_]], spec:true, alt:true });
  const prim = F.donna ? p.postmeno === true : (F.age !== null && F.age >= 50);
  if(prim){
    if(F.gc && (gcDurOf(p) === "3" || gcDurOf(p) === "12")) out.push({ sez:"Prevenzione primaria", cond:"Prednisone equivalente ≥5 mg/die in atto o previsto per più di 3 mesi", s:[[A_, R_, Z_], [D_]] });
    if(F.adj) out.push({ sez:"Prevenzione primaria", cond:F.feats.has("aromatasi") ? "Inibitori dell'aromatasi per carcinoma mammario" : "Deprivazione androgenica per carcinoma prostatico", s:[[A_, R_, Z_, D_]] });
    if(F.minT !== null && F.minT <= -4) out.push({ sez:"Prevenzione primaria", cond:"T-score " + fmtN(F.minT), s:[[A_, R_], [D_, Z_, I_, ...serm]] });
    else if(F.minT !== null && F.minT <= -3 && (p.fam === true || F.comorb.length))
      out.push({ sez:"Prevenzione primaria", cond:"T-score " + fmtN(F.minT) + " con " + [p.fam === true ? "familiarità per fratture di vertebre o femore" : "", F.comorb.length ? "comorbilità a rischio (" + F.comorb.join(", ") + ")" : ""].filter(Boolean).join(" e "), s:[[A_, R_], [D_, Z_, I_, ...serm]] });
  }
  return out;
}
/* i dati che mancano e che possono cambiare la Nota 79: meglio dirlo che sbagliare */
function nota79Pend(p, F){
  const m = [];
  if(F.donna && p.postmeno === null) m.push(["chi", "Indica se è in postmenopausa: serve per la prevenzione primaria e per l'abaloparatide."]);
  if(F.gc && !gcDurOf(p)) m.push(["anam", "Glucocorticoidi: indica dose e durata (prednisone ≥5 mg/die da più di 3 o di 12 mesi). Cambia la Nota 79" + (F.nVF ? ", anche per il teriparatide." : ".")]);
  if(F.vert.some(f => !f.grado)) m.push(["fx", "Indica la gravità delle fratture vertebrali (Genant: lieve, moderata, grave): per abaloparatide e romosozumab la Nota distingue le lievi dalle moderate o gravi."]);
  if(F.donna && F.rischio === null && F.minT !== null && F.minT < -2 && (F.nVF || F.oth.length >= 2)) m.push(["defra", "Inserisci il rischio a 10 anni in % dal DeFRA: per il romosozumab la Nota chiede un rischio ≥20%."]);
  if(F.minT === null) m.push(["dxa", "Senza densitometria (colonna o femore, DXA in struttura pubblica o convenzionata) diverse condizioni della Nota non si possono verificare."]);
  return m;
}
/* livello di scelta del farmaco in una condizione della Nota: I, II o III */
const N79_LEV = ["I", "II", "III"];
const n79Lev = (c, id) => { const i = c.s.findIndex(g => g.includes(id)); return i < 0 ? null : N79_LEV[i]; };

/* ---------- controindicazioni e cautele, farmaco per farmaco ---------- */
function pzSecondary(p){
  const N = withPz(p, computeN), A = withPz(p, computeA);
  const ids = new Set([...N.note, ...N.sosp].map(x => x.f.id));
  const hpp = (p.lab || {}).ALP === "basso" || ids.has("gen_ipofosfatasia");
  return { N, A, hpp };
}
/* gerarchia delle forme secondarie, per quello che cambiano nella cura:
   1 prima di trattare (correggere o escludere prima del farmaco, o cambia il farmaco), 2 da approfondire (si tratta intanto),
   3 fattori noti: si tratta comunque (alcuni da rivedere se possibile) */
const SEC_L1 = new Set(["tiroxina", "gen_ipofosfatasia",
  "ipofosfatasia", "deficitD", "osteomalIpoP", "fanconi", "ipopara", "ipomagne"]);
const SEC_RIVEDI = new Set(["op_ipp", "op_ssri", "op_diuretici", "op_glitazoni", "op_sglt2", "op_oppioidi", "op_dmpa", "op_tenofovir", "vita_fumo", "vita_alcol", "vita_basso_peso", "vita_immobilizzazione", "vita_anoressia", "op_calo"]);
const SEC_LEV = [{ t:"Urgenza medica", s:"se il calcio è molto alto (oltre 14 mg/dL) o ci sono sintomi: subito in ospedale, idratazione e bisfosfonato endovena", k:"r" },
  { t:"Prima di trattare", s:"da correggere prima del farmaco: senza correzione non funziona o fa danno", k:"r" },
  { t:"Da approfondire", s:"si indaga, anche con urgenza, ma intanto si tratta", k:"a" },
  { t:"Fattori noti", s:"spiegano il rischio, si tratta comunque", k:"g" }];
function secLevels(p, S){
  S = S || pzSecondary(p); const eg = num(p.egfr), out = [], seen = new Set();
  const add = (nome, lev, src, href, riv) => { if(seen.has(nome)) return; seen.add(nome); out.push({ nome, lev, src, href, riv: !!riv }); };
  const ircLev = 2;   /* le soglie di eGFR per i farmaci sono nelle controindicazioni */
  S.N.note.forEach(x => add(x.f.nome, SEC_L1.has(x.f.id) ? 1 : 3, "anam", OH + "#causa-" + x.f.id, SEC_RIVEDI.has(x.f.id)));
  S.N.sosp.forEach(x => add(x.f.nome, SEC_L1.has(x.f.id) ? 1 : 2, "anam", OH + "#causa-" + x.f.id));
  S.A.forms.forEach(x => add(COND[x.cid], x.cid === "ipercalcemiaMaligna" ? 0 : x.cid === "irc" ? ircLev : SEC_L1.has(x.cid) ? 1 : 2, "esami", OH + "#forma-" + x.cid));
  if((p.ci || {}).irc) add(COND.irc, ircLev, "anam", OH + "#forma-irc");
  return out.sort((a, b) => a.lev - b.lev);
}
/* le forme secondarie in una riga, per livello */
const secGroups = (p, S) => { const it = secLevels(p, S); return [0, 1, 2, 3].map(l => [l, it.filter(x => x.lev === l)]).filter(g => g[1].length); };
const secText = (p, S) => secGroups(p, S).map(([l, xs]) => SEC_LEV[l].t + ": " + xs.map(x => x.nome + (x.riv ? " (da rivedere se possibile)" : "")).join(", ")).join("; ");
function drugFlags(p, F, S){
  const lab = p.lab || {}, eg = num(p.egfr), vd = num(p.vitd), ci = p.ci || {}, fl = {};
  const add = (ids, kind, why) => ids.forEach(id => { (fl[id] = fl[id] || { ci:[], warn:[] })[kind].push(why); });
  if(S.hpp){ add(BISF, "ci", "fosfatasi alcalina bassa: escludere l'ipofosfatasia (bisfosfonati controindicati)"); add([D_, RO_], "warn", "fosfatasi alcalina bassa: escludere l'ipofosfatasia prima di qualsiasi antiriassorbitivo"); }
  if(eg !== null){
    if(eg < 35) add([A_, Z_], "ci", `eGFR ${fmtN(eg, 0)} mL/min (sotto 35)`);
    if(eg < 30){ add([R_, I_], "ci", `eGFR ${fmtN(eg, 0)} mL/min (sotto 30)`); add([T_, AB_], "ci", "insufficienza renale grave"); add([D_], "warn", "insufficienza renale grave: escludere CKD-MBD e osso adinamico, rischio di ipocalcemia (valutazione specialistica)"); }
  } else if(lab.eGFR === "basso" || ci.irc) add([A_, R_, I_, Z_, D_, T_, AB_], "warn", (ci.irc ? "insufficienza renale cronica" : "eGFR ridotto") + ": inserisci il valore dell'eGFR per verificare le soglie");
  if(lab.Ca === "basso") add(ANTIRIASS, "ci", "ipocalcemia da correggere prima di iniziare");
  if(lab.Ca === "alto") add(ANABOL, "ci", "ipercalcemia");
  if(lab.PTH === "alto" && lab.Ca === "alto") add(ANABOL, "ci", "sospetto iperparatiroidismo");
  if(S.A.forms.some(x => x.cid === "paget")){ add([T_, AB_], "ci", "sospetto morbo di Paget"); add([A_, R_, I_, D_, RX_, BZ_, RO_], "warn", "sospetto morbo di Paget: l'unica terapia indicata è lo zoledronato endovena"); }
  else if(lab.ALP === "alto") add(ANABOL, "warn", "fosfatasi alcalina elevata da spiegare (Paget?)");
  if(vdLow(vd) || lab.D === "basso") add([...ANTIRIASS, ...ANABOL], "warn", "correggere prima la carenza di vitamina D" + (vd !== null ? ` (${vdTxt(vd)})` : ""));
  if(ci.esofago) add(ORALI, "ci", "disturbi esofagei o impossibilità a restare in piedi/seduti");
  if(ci.reflusso && !ci.esofago) add(ORALI, "warn", "reflusso gastroesofageo: assunzione corretta (a digiuno, con un bicchiere d'acqua, in piedi o seduti per 30 minuti); se sintomatico valutare un farmaco non orale");
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
    azione:"Terapia antiriassorbitiva (bisfosfonati orali o denosumab) senza necessità di intervento specialistico, sempre con vitamina D." },
  arancione:{ t:"Arancione", r:"alto rischio", cls:"d", chi:"Specialista dell'osso",
    azione:"Invio allo specialista: terapia anabolica (teriparatide, abaloparatide) o con romosozumab, prescrivibili dallo specialista su piano terapeutico, poi un antiriassorbitivo; sempre con vitamina D." },
  rossa:{ t:"Rossa", r:"altissimo rischio", cls:"d", chi:"Specialista dell'osso, con priorità",
    azione:"Invio prioritario allo specialista: terapia anabolica o con romosozumab, prescrivibili dallo specialista su piano terapeutico, poi un antiriassorbitivo; sempre con vitamina D. Nell'attesa: calcio, vitamina D e prevenzione delle cadute." }
};
const ZONE_ORDER = ["verde", "gialla", "arancione", "rossa"];
const zoneHigh = z => z === "arancione" || z === "rossa";
const zchip = z => ZONE[z] ? `<span class="zn z-${z}"><i></i>${ZONE[z].t}</span>` : "—";
function riskCat(z){ return z && ZONE[z] ? Object.assign({ k:z }, ZONE[z]) : null; }
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

/* anabolici (teriparatide, abaloparatide) e romosozumab: quali rientrano davvero nella Nota 79 con i dati del paziente, e perché */
function n79Ana(p, F, fl, n79){
  const ok = [], no = [];
  [T_, AB_, RO_].forEach(id => { const cs = n79.filter(c => c.s.some(l => l.includes(id))); if(!cs.length) return;
    const ci = fl[id] && fl[id].ci.length ? fl[id].ci : null;
    (ci ? no : ok).push({ id, cond: cs.map(c => c.cond), ci }); });
  return { ok, no };
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
/* icone dei farmaci (dalle illustrazioni di Osteo-Time, 48×48) */
const DRUG_SVG = {"capsula": "<g transform=\"rotate(-40 24 24)\"><path d=\"M24 16H14a8 8 0 0 0 0 16h10z\" fill=\"#B8ACEB\"/><path d=\"M24 16h10a8 8 0 0 1 0 16H24z\" fill=\"#FFFFFF\"/><rect x=\"6\" y=\"16\" width=\"36\" height=\"16\" rx=\"8\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 16v16\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M11.5 20.5h6\" stroke=\"#fff\" stroke-width=\"2.6\" stroke-linecap=\"round\" opacity=\".9\"/><path d=\"M28 20.5h5\" stroke=\"#E2DCF8\" stroke-width=\"2.6\" stroke-linecap=\"round\"/></g>", "compressa": "<path d=\"M9 21v6a15 10 0 0 0 30 0v-6\" fill=\"#CBC1F2\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><ellipse cx=\"24\" cy=\"21\" rx=\"15\" ry=\"10\" fill=\"#F5F2FD\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M15.5 16.5l17 9\" stroke=\"#7C6CC2\" stroke-width=\"2.4\" stroke-linecap=\"round\"/><path d=\"M15 21.5q2-4 7-5\" stroke=\"#fff\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/>", "siringa": "<g transform=\"rotate(45 24 24)\"><rect x=\"18\" y=\"19\" width=\"12\" height=\"13\" fill=\"#B8ACEB\"/><rect x=\"18\" y=\"10\" width=\"12\" height=\"22\" rx=\"2.5\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 10V4M19.5 4h9M15 10h18\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><rect x=\"21.5\" y=\"32\" width=\"5\" height=\"3.5\" rx=\"1\" fill=\"#7C6CC2\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 35.5V44\" stroke=\"#3B3266\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M18 14.5h4M18 18.5h4M18 22.5h4\" stroke=\"#3B3266\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></g>", "flebo": "<path d=\"M14 6h20a3 3 0 0 1 3 3v19a8 8 0 0 1-8 8H19a8 8 0 0 1-8-8V9a3 3 0 0 1 3-3z\" fill=\"#FFFFFF\"/><path d=\"M11 19h26v9a8 8 0 0 1-8 8H19a8 8 0 0 1-8-8z\" fill=\"#DCC8F5\"/><path d=\"M14 6h20a3 3 0 0 1 3 3v19a8 8 0 0 1-8 8H19a8 8 0 0 1-8-8V9a3 3 0 0 1 3-3z\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><circle cx=\"24\" cy=\"10\" r=\"1.8\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2\"/><path d=\"M28 13.5h5M28 17h3\" stroke=\"#3B3266\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M24 36v3q0 5 6 5h7\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M16 23q1.5 5 1.5 8\" stroke=\"#fff\" stroke-width=\"2.4\" stroke-linecap=\"round\" fill=\"none\"/>", "penna": "<g transform=\"rotate(45 24 24)\"><rect x=\"19\" y=\"7\" width=\"10\" height=\"27\" rx=\"4\" fill=\"#B8ACEB\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><rect x=\"20.5\" y=\"2\" width=\"7\" height=\"6\" rx=\"2\" fill=\"#7C6CC2\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><rect x=\"21.2\" y=\"17\" width=\"5.6\" height=\"9\" rx=\"2\" fill=\"#FFFFFF\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M21 34h6l-1.5 5h-3z\" fill=\"#FFFFFF\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M24 39v5\" stroke=\"#3B3266\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M22.5 12h3\" stroke=\"#fff\" stroke-width=\"2.2\" stroke-linecap=\"round\"/></g>", "sole": "<g stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M24 4.5v5M24 38.5v5M4.5 24h5M38.5 24h5M10.2 10.2l3.5 3.5M34.3 34.3l3.5 3.5M10.2 37.8l3.5-3.5M34.3 13.7l3.5-3.5\"/></g><circle cx=\"24\" cy=\"24\" r=\"9\" fill=\"#FFD66B\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M19.5 21.5q1.5-3 4.5-3.5\" stroke=\"#FFF3C4\" stroke-width=\"2.4\" fill=\"none\" stroke-linecap=\"round\"/>", "latte": "<path d=\"M13 6h22l-3 36a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z\" fill=\"#DDEEF8\"/><path d=\"M14.1 18q4.9 3 9.9 0t9.9 0L31.3 42a2.5 2.5 0 0 1-2.5 2.3h-9.6A2.5 2.5 0 0 1 16.7 42z\" fill=\"#FFFFFF\"/><path d=\"M13 6h22l-3 36a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3z\" fill=\"none\" stroke=\"#3B3266\" stroke-width=\"2.4\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M18 22l1.4 16\" stroke=\"#E3EEF6\" stroke-width=\"2.4\" stroke-linecap=\"round\"/>"};
const DRUG_ICOMAP = { alendronato:"capsula", risedronato:"capsula", ibandronato:"compressa", raloxifene:"compressa", bazedoxifene:"compressa", denosumab:"siringa", zoledronato:"flebo", teriparatide:"penna", abaloparatide:"penna", romosozumab:"siringa" };
const drugIcon = (id, cls) => `<svg class="dic${cls ? " " + cls : ""}" viewBox="0 0 48 48" aria-hidden="true">${DRUG_SVG[DRUG_ICOMAP[id] || "compressa"]}</svg>`;
/* come si somministra: iniezione, infusione o compressa (per icone e parole giuste) */
const SOMM = { [D_]:"iniezione", [T_]:"iniezione", [AB_]:"iniezione", [RO_]:"iniezione", [Z_]:"infusione" };
const sommOf = id => SOMM[id] || "compressa";
const doseWord = id => sommOf(id) === "compressa" ? "dose" : sommOf(id);
const daysTo = d => Math.round((d - new Date(new Date().toDateString())) / 864e5);
const fmtDt = d => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
/* u: 0 urgente, 1 da fare presto, 2 da programmare */
function pzTodo(p, F){
  F = F || pzFacts(p); const out = [], add = (u, t, s, k) => out.push({ u, t, s, href:`#paz-${p.id}${k ? "-" + k : ""}` });
  F.ther.forEach(t => {
    const n = nextDose(t), m = monthsSince(t.inizio);
    if(n){ const dd = daysTo(n);
      if(t.farmaco === D_ && dd < -28) add(0, "Denosumab: iniezione in ritardo", `Era prevista il ${fmtDt(n)}, ${-dd} giorni fa. Oltre 4 settimane di ritardo aumenta il rischio di fratture vertebrali multiple: somministrare al più presto.`, "terapia");
      else if(dd <= 30) add(dd < 0 ? 0 : 1, `${dnome(t.farmaco)}: prossima ${doseWord(t.farmaco)}`, (dd < 0 ? `Prevista il ${fmtDt(n)}, ${-dd} giorni fa.` : dd === 0 ? "Prevista oggi." : `Il ${fmtDt(n)}, tra ${dd} giorni.`) + (t.farmaco === D_ ? " Calcemia prima della dose." : ""), "terapia"); }
    const fm = FINE_MESI[t.farmaco];
    if(fm && m !== null && m >= fm - 3) add(m >= fm ? 0 : 1, `${dnome(t.farmaco)}: ${m >= fm ? "periodo concluso" : "si avvicina la fine"}`, `Iniziato il ${fmtD(t.inizio)}, durata massima ${fm} mesi: subito dopo serve un antiriassorbitivo.`, "terapia");
    const ra = RIVAL_ANNI[t.farmaco];
    if(ra && m !== null && m >= ra * 12) add(2, `${dnome(t.farmaco)} da ${Math.floor(m / 12)} anni`, "Rivalutare il rischio di frattura per decidere se proseguire o fare una pausa terapeutica.", "terapia");
  });
  if(F.recent.length && !F.ther.length && !(p.decisione && p.decisione.tipo === "spec")) add(0, "Frattura recente senza terapia", `Frattura il ${fmtD(F.recent[0].data)}: rischio imminente di rifrattura.`, "terapia");
  if(F.lastDxa){ const pl = dxaPlan(F); if(pl.st !== "ok") add(pl.st === "miss" ? 1 : 2, pl.t, pl.s, "dxa"); }
  if(p.decisione && p.decisione.tipo !== "attesa" && monthsSince(p.decisione.data) >= 12) add(2, "Rivalutazione annuale", `Ultima valutazione il ${fmtD(p.decisione.data)}: nuove fratture, esami, DeFRA e terapia.`, "figura");
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
  const sec = secText(p, S); if(sec) L.push("Forme secondarie. " + sec);
  const ll = labLine(p); if(ll) L.push("Esami" + (p.labData ? " del " + fmtD(p.labData) : "") + ": " + ll);
  if(S.hpp) L.push("Fosfatasi alcalina bassa: escludere l'ipofosfatasia (bisfosfonati controindicati)");
  if(n79.length) L.push("Nota 79: " + n79.map(c => c.cond).join("; "));
  if(p.decisione && DECISIONI[p.decisione.tipo]) L.push("Decisione: " + DECISIONI[p.decisione.tipo].t + " (" + fmtD(p.decisione.data) + ")");
  if(F.ther.length) L.push("Terapia in corso: " + F.ther.map(t => dnome(t.farmaco) + " dal " + fmtD(t.inizio) + (nextDose(t) ? ", prossima " + doseWord(t.farmaco) + " " + fmtDt(nextDose(t)) : "")).join("; "));
  if(supList(p).length) L.push("Vitamina D e calcio: " + supTxt(p) + (p.supDal ? " dal " + fmtD(p.supDal) : "") + (p.supNota ? " (" + p.supNota + ")" : ""));
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
  /* promemoria discreto: una riga sola, non un riquadro */
  return `<p class="bk bkline" title="I pazienti sono salvati solo in questo browser: se si cancellano i dati di navigazione o si cambia computer vanno persi."><i aria-hidden="true"></i>${LAST_BK ? `Ultimo backup ${g} giorni fa` : "Nessun backup dell'archivio"} · <button type="button" class="lnk" id="pzExport2">Salva backup</button></p>`;
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

function labStatus(p){
  const lab = p.lab || {}, done = PZ_EXAMS.filter(e => lab[e.id]).length;
  return { done, tot: PZ_EXAMS.length };
}

/* ---------- elenco pazienti ---------- */
/* icone a tratto (24×24) della pagina iniziale */
const MIC = {
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M15.5 4.8a3.4 3.4 0 0 1 0 6.4M17.5 14.3c2.4.6 4 2.7 4 5.7"/>',
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
const avatar = p => { const v = figViso(p); return v ? `<span class="pav img" aria-hidden="true"><img src="${v}" alt=""></span>` : `<span class="pav" aria-hidden="true"><svg viewBox="3 4 38 38">${AVATAR[p.sesso || ""] || AVATAR[""]}</svg></span>`; };
/* vista del paziente preferita: figura (predefinita) o percorso a passi */
let VISTA = "figura";
const setVista = v => { if(VISTA !== v){ VISTA = v; try{ localStorage.setItem("oh-mmg-vista", v); }catch(e){} } };
const initials = p => { const w = pzName(p).replace(/[^\p{L}\s.]/gu, " ").split(/[\s.]+/).filter(Boolean); return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase() : "?"; };
/* scheda di un paziente nell'archivio */
function pzCards(list){
  return list.slice().sort((a, b) => pzName(a).localeCompare(pzName(b), "it", { sensitivity:"base" })).map(p => {
    const F = pzFacts(p), all = allSteps(p), nx = nextStep(all), pl = dxaPlan(F);
    const bits = [p.sesso ? (p.sesso === "donna" ? "Donna" : "Uomo") : "", F.age !== null ? F.age + " anni" : ""].filter(Boolean).join(", ");
    const anon = !(p.nome && p.nome.trim()), dn = id => dnome(id).replace(/ \(.*\)$/, "");
    const dec = p.decisione && p.decisione.tipo;
    /* scheda ordinata in tre fasce: chi è (nome, sesso ed età, zona DeFRA a destra), la terapia, a che punto è il percorso */
    const ic = (cls, inner) => `<span class="pti ${cls}">${inner}</span>`;
    const ter = F.ther.length ? [ic("on", drugIcon(F.ther[0].farmaco)), F.ther.map(t => dn(t.farmaco)).join(" + "), "dal " + fmtD(F.ther[0].inizio)]
      : dec === "spec" ? [ic("spec", secIcon("spec")), "Inviato allo specialista", "terapia da registrare"]
      : dec === "mmg" ? [ic("reg", secIcon("reg")), "Farmaco da registrare", "terapia decisa"]
      : dec === "nessuno" ? (supList(p).length ? [ic("sup", `<svg class="dic" viewBox="0 0 48 48" aria-hidden="true">${DRUG_SVG.sole}</svg>`), "Solo vitamina D e calcio", supTxt(p)] : [ic("none", "—"), "Nessun farmaco", "vitamina D e calcio da registrare"])
      : dec === "attesa" ? [ic("none", secIcon("attesa")), "Decisione rimandata", "in attesa di esami"]
      : [ic("miss", ""), "Terapia da decidere", ""];
    const q = [pzName(p), ...F.ther.map(t => dn(t.farmaco))].join(" ").toLowerCase();
    const done = !nx, stTxt = nx ? `Passo ${nx.i + 1} di ${STEPS.length} · ${nx.t}` : pl.st !== "ok" ? pl.t : "Percorso completo";
    const miss = nx && nx.s && /^Manca/.test(nx.s) ? nx.s : "";
    return `<div class="pitem${anon ? " anon" : ""}" data-q="${hx(q)}"><a class="pcard" href="#paz-${p.id}">
      <span class="ptop">${avatar(p)}<span class="pid"><b>${hx(pzName(p))}</b><small>${bits || "Dati da completare"}</small></span>${F.zona ? `<span class="pzone z-${F.zona}">Zona ${ZONE[F.zona].t.toLowerCase()}</span>` : ""}</span>
      <span class="pter${F.ther.length || dec === "spec" || dec === "mmg" || (dec === "nessuno" && supList(p).length) ? "" : " no"}">${ter[0]}<span><b>${hx(ter[1])}</b>${ter[2] ? `<small>${hx(ter[2])}</small>` : ""}</span>${CHEV}</span>
      <span class="pst${done && pl.st === "ok" ? " ok" : ""}"><span class="proad" aria-hidden="true">${all.map(x => `<i class="${x.st}${nx && x.i === nx.i ? " next" : ""}">${MARK[x.st] || x.i + 1}</i>`).join("")}</span><small><b>${hx(stTxt)}</b>${miss ? `<br>${hx(miss.charAt(0).toUpperCase() + miss.slice(1))}` : ""}</small></span></a>${anon ? `<button type="button" class="pdel" data-pzdel="${p.id}" aria-label="Elimina questo paziente senza nome" title="Elimina">✕</button>` : ""}</div>`;
  }).join("");
}
/* archivio: tutti i pazienti, con la ricerca */
function vArchivio(){
  return { bar:"Archivio pazienti", html: head("Archivio pazienti", PZ.length ? plural(PZ.length, "paziente", "pazienti") + " in questo browser, in ordine alfabetico." : "Nessun paziente ancora.") + (PZ.length ? `
    <input class="search" id="pzQ" type="search" placeholder="Cerca per nome, iniziali, codice o farmaco" autocomplete="off" aria-label="Cerca un paziente">
    <div class="pcards" id="pzList">${pzCards(PZ)}</div><p class="pempty" id="pzNone" hidden>Nessun paziente con questo nome.</p>`
    : `<div class="pempty">Nessun paziente in archivio.<br>Inizia con «Nuovo paziente» dalla home.</div>`) };
}
function vPazienti(){
  const todo = PZ.flatMap(p => pzTodo(p).map(x => Object.assign({ p }, x))).sort((a, b) => a.u - b.u);
  return { bar:"Gestionale osteoporosi", html: `<div class="mhome"><div class="mh-l">` + `<div class="mh-h">` + head("Gestionale osteoporosi", "I tuoi pazienti con osteoporosi: per ognuno un percorso guidato in 7 passi, dai dati alla terapia, fino ai controlli.") + `</div>
    <div class="mh-btns">
    <button type="button" class="entry big violet mh-new" id="pzNew"><span class="ibox">${mic("add", "ic")}</span><div><b>Nuovo paziente</b><small>Inizia il percorso dal passo 1</small></div>${CHEV}</button>
    <a class="entry big arc mh-arc" href="#archivio"><span class="ibox">${mic("users", "ic")}</span><div><b>Archivio pazienti</b><small>${PZ.length ? plural(PZ.length, "paziente", "pazienti") + ", con la ricerca per nome" : "Ancora vuoto"}</small></div>${CHEV}</a>
    </div>
    ${pzStorageOk ? backupAlert() : `<div class="alert mh-bk"><b>Archivio non disponibile</b>Il browser non permette di salvare i dati (navigazione privata o dati del sito bloccati): i pazienti inseriti andranno persi alla chiusura.</div>`}
    <div class="mh-todo">${PZ.length ? `<p class="lbl">Da fare${todo.length ? " · " + todo.length : ""}</p>` + (todo.length ? `<div class="todo">${todo.slice(0, 15).map(x => todoItem(x, true)).join("")}</div>${todo.length > 15 ? `<p class="small">e altri ${todo.length - 15}: li trovi nella scheda di ciascun paziente.</p>` : ""}`
      : `<p class="hint">Nessuna scadenza: qui compaiono DXA da ripetere, dosi di denosumab e zoledronato, fine degli anabolici, rivalutazioni dopo 5 anni e fratture recenti senza terapia.</p>`) : ""}</div>
    </div><div class="mh-r">
    <div class="mh-cons"><p class="lbl">Consulta</p>
    <div class="rows mrows">
      <a class="rowlink" href="#guida"><span class="ibox s">${mic("book")}</span><span>Guida per il medico di medicina generale<small>Cos'è l'osteoporosi, perché si cura, i farmaci</small></span>${CHEV}</a>
      <a class="rowlink" href="#guida-nota79"><span class="ibox s">${mic("book")}</span><span>Nota 79<small>Quando i farmaci sono a carico del SSN: I, II e III scelta</small></span>${CHEV}</a>
      <a class="rowlink" href="#guida-nota96"><span class="ibox s">${mic("book")}</span><span>Vitamina D e Nota 96<small>Quando dosarla, quando è rimborsabile, come correggerla</small></span>${CHEV}</a>
      <a class="rowlink" href="#guida-dxa-lea"><span class="ibox s">${mic("book")}</span><span>A chi fare la densitometria in LEA<small>Fattori di rischio maggiori e minori, con il conteggio</small></span>${CHEV}</a>
    </div></div>
    <div class="mh-cons mh-arch"><p class="lbl">Backup e sicurezza</p>
    <div class="rows mrows">
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
  { k:"dati", t:"Chi è", fare:"Anagrafica, peso e altezza, menopausa, familiarità." },
  { k:"fratture", t:"Fratture", fare:"Fratture da fragilità: dove, quando, gravità delle vertebrali." },
  { k:"anamnesi", t:"Anamnesi e farmaci", fare:"Malattie, farmaci e abitudini: le forme secondarie vengono riconosciute da sole." },
  { k:"esami", t:"Esami del sangue", fare:"Esami di I livello, per escludere le forme secondarie prima di trattare." },
  { k:"dxa", t:"Densitometria (DEXA)", fare:"T-score di colonna e femore dall'ultima DXA." },
  { k:"defra", t:"DeFRA", fare:"Calcola il rischio sul DeFRA e riporta qui la zona di colore." },
  { k:"terapia", t:"Terapia", fare:"Cosa fare secondo la zona e la Nota 79, e la tua decisione." }
  /* il follow-up non è un passo: è la sezione «Controlli nel tempo» del caso completo */
];
const STEP_IX = Object.fromEntries(STEPS.map((x, i) => [x.k, i]));
const DECISIONI = {
  mmg:{ t:"Terapia avviata da me", s:"Registra il farmaco qui sotto." },
  spec:{ t:"Inviato allo specialista", s:"Per anabolico o romosozumab, o per approfondire una forma secondaria." },
  nessuno:{ t:"Nessun farmaco per l'osteoporosi", s:"Vitamina D, calcio, attività fisica; nuova valutazione nel tempo." },
  attesa:{ t:"Decisione rimandata", s:"In attesa di esami o accertamenti." }
};
const DEC_ZONA = { verde:"nessuno", gialla:"mmg", arancione:"spec", rossa:"spec" };
/* vitamina D e calcio: si registrano a parte, per tutti (anche per chi non fa un farmaco per l'osteoporosi) */
const SUP_VD = ["Colecalciferolo 1.000 UI al giorno", "Colecalciferolo 2.000 UI al giorno", "Colecalciferolo 10.000 UI alla settimana", "Colecalciferolo 25.000 UI ogni 2 settimane", "Colecalciferolo 25.000 UI al mese", "Colecalciferolo 50.000 UI al mese", "Calcifediolo 0,266 mg ogni 2 settimane", "Calcifediolo 0,266 mg al mese"];
const SUP_CA = ["Calcio 500 mg al giorno", "Calcio 1000 mg al giorno", "Colecalciferolo con calcio (associazione)"];
const supList = p => [p.supVD, p.supCa].filter(Boolean);
const supTxt = p => supList(p).map((x, i) => i ? x.charAt(0).toLowerCase() + x.slice(1) : x).join(" · ");
const supSel = (p, k, opts, none) => `<select data-pf="${k}"><option value="">${none}</option>${opts.map(o => `<option value="${hx(o)}"${p[k] === o ? " selected" : ""}>${hx(o)}</option>`).join("")}</select>`;
function stepStatus(p, k, F, S){
  F = F || pzFacts(p);
  if(k === "dati"){
    const m = [];
    if(!p.nascita) m.push("data di nascita"); if(!p.sesso) m.push("sesso"); if(!F.bmi) m.push("peso e altezza");
    if(p.sesso === "donna" && p.postmeno === null) m.push("menopausa"); if(p.fam === null) m.push("familiarità");
    return m.length ? { st:"miss", s:"Mancano: " + m.join(", ") } : { st:"ok", s:[F.age + " anni", "BMI " + fmtN(F.bmi), p.fam ? "familiarità" : ""].filter(Boolean).join(" · ") };
  }
  if(k === "fratture"){
    if(!F.fx.length && !p.nessunaFx) return { st:"miss", s:"Da indicare: fratture da fragilità o nessuna" };
    if(p.rival && F.fx.length && !p.fxRiv) return { st:"miss", s:"Nuove fratture dall'ultima valutazione?" };
    return { st:"ok", s:F.fx.length ? plural(F.fx.length, "frattura", "fratture") + (F.recent.length ? " · recente" : "") : "Nessuna frattura da fragilità" };
  }
  S = S || pzSecondary(p);
  if(k === "anamnesi"){ const n = S.N.note.length + S.N.sosp.length;
    return !anamDone(p) ? { st:"miss", s:p.rival ? "Da rivedere" : "Da compilare (o anamnesi muta)" } : n ? { st:"warn", s:plural(n, "forma secondaria", "forme secondarie") + " da considerare" } : { st:"ok", s:"Nessuna forma secondaria associata" }; }
  if(k === "esami"){ const ls = labStatus(p), n = S.A.forms.length;
    return ls.done < ls.tot ? { st:"miss", s:`${ls.done} di ${ls.tot} esami registrati` } : n || S.hpp ? { st:"warn", s:n ? plural(n, "forma compatibile", "forme compatibili") + " con gli esami" : "Fosfatasi alcalina bassa" } : { st:"ok", s:"Esami nella norma" }; }
  if(k === "dxa") return !F.lastDxa ? { st:"miss", s:"Nessuna densitometria" } : F.dxaAge > 24 ? { st:"warn", s:`Ultima del ${fmtD(F.lastDxa.data)}: più vecchia di 24 mesi` } : { st:"ok", s:`T-score minimo ${fmtN(F.minT)} (${fmtD(F.lastDxa.data)})` };
  if(k === "defra" && p.rival && F.zona && (F.lastDefra.data || "") < p.rival.dal) return { st:"miss", s:`Da ricalcolare: l'ultimo è del ${fmtD(F.lastDefra.data)}` };
  if(k === "defra") return F.zona ? { st:"ok", s:"Zona " + ZONE[F.zona].t.toLowerCase() + " → " + ZONE[F.zona].chi } : { st:"miss", s:"Zona non ancora inserita" };
  if(k === "terapia"){ const d = p.decisione && DECISIONI[p.decisione.tipo];
    return !d ? { st:"miss", s:"Decisione da prendere" } : { st:p.decisione.tipo === "attesa" ? "warn" : "ok", s:d.t + " (" + fmtD(p.decisione.data) + ")" + (F.ther.length ? " · " + F.ther.map(t => DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome.replace(/ \(.*\)$/, "") : t.farmaco).join(", ") : "") }; }
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
    : `<div class="alert ok"><b>Percorso completato</b>${pl.t}. A ogni controllo: nuova DXA (passo 5), DeFRA (passo 6), nuove fratture (passo 2).</div>`;
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
function datiAnag(p){
  const F = pzFacts(p);
  return `
    <div class="grid2">
      <label class="fld" style="grid-column:1/-1">Nome, iniziali o codice<input type="text" data-pf="nome" value="${hx(p.nome)}" autocomplete="off"></label>
      <label class="fld">Data di nascita<input type="date" data-pf="nascita" value="${hx(p.nascita)}"></label>
      <div class="fld">Sesso<div class="seg" role="group">${segPz("sesso", "donna", "Donna", p.sesso)}${segPz("sesso", "uomo", "Uomo", p.sesso)}</div></div>
      <label class="fld">Peso (kg)<input type="text" inputmode="decimal" autocomplete="off" data-pf="peso" value="${hx(p.peso)}"></label>
      <label class="fld">Altezza (cm)<input type="text" inputmode="decimal" autocomplete="off" data-pf="altezza" value="${hx(p.altezza)}"></label>
    </div>
    <p class="small" data-live="bmi">${bmiTxt(F)}</p>
    ${p.sesso === "donna" ? `<div class="fld">In postmenopausa?<div class="seg" role="group">${segPz("postmeno", true, "Sì", p.postmeno)}${segPz("postmeno", false, "No", p.postmeno)}</div></div>` : ""}
    <div class="fld">Frattura di femore o vertebrale in uno dei genitori?<div class="seg" role="group">${segPz("fam", true, "Sì", p.fam)}${segPz("fam", false, "No", p.fam)}</div></div>`;
}
function datiFx(p){
  const F = pzFacts(p);
  const fxRows = F.fx.map(f => `<li class="rec"><span><b>${FX_SEDI[f.sede] || f.sede}${f.sede === "vertebra" && f.grado ? " · " + f.grado : ""}</b><small>${fmtD(f.data)}${f.inTerapia ? " · durante terapia da ≥1 anno" : ""}</small></span><button type="button" class="x" data-del="fratture:${p.fratture.indexOf(f)}" aria-label="Elimina">✕</button></li>`).join("");
  return `    <p class="lbl">Fratture da fragilità</p>
    <p class="small">Fratture per traumi minimi (cadere dalla propria altezza o meno). Le vertebrali con il criterio di Genant: lieve 20–25%, moderata 25–40%, grave oltre il 40% di riduzione di un'altezza vertebrale.</p>
    ${fxRows ? `<ul class="list recs">${fxRows}</ul>` : ckPz("data-pbool", "nessunaFx", p.nessunaFx, "Nessuna frattura da fragilità pregressa")}
    ${p.rival && F.fx.length ? `<div class="confirm">${ckPz("data-pbool", "fxRiv", p.fxRiv, `<b>Nessuna nuova frattura</b> dalla valutazione precedente (prima del ${fmtD(p.rival.dal)})`)}</div>` : ""}
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Sede<select id="fxSede">${Object.entries(FX_SEDI).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <div class="fld fxwhen"><span>Quando · basta l'anno</span><span class="fxw"><input type="number" id="fxAnno" inputmode="numeric" min="1930" max="${new Date().getFullYear()}" placeholder="Anno" aria-label="Anno della frattura">
          <select id="fxMese" aria-label="Mese (facoltativo)"><option value="">mese</option>${["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"].map((m, i) => `<option value="${String(i + 1).padStart(2, "0")}">${m}</option>`).join("")}</select>
          <input type="number" id="fxGiorno" inputmode="numeric" min="1" max="31" placeholder="giorno" aria-label="Giorno (facoltativo)"></span></div>
        <label class="fld">Gravità (vertebre)<select id="fxGrado"><option value="">non nota</option>${Object.entries(FX_GRADO).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
      </div>
      ${ckPz("data-tmp", "fxInT", false, "Avvenuta nonostante almeno 1 anno di terapia per l'osteoporosi")}
      <button type="button" class="btn" data-add="fratture">Salva la frattura</button>
    </div>`;
}
function vPazDati(p){
  return { bar: pzName(p), html: head("Dati e fratture", "Chi è il paziente e quali fratture ha avuto.") + datiAnag(p) + datiFx(p) };
}

/* ---------- 2 · anamnesi e terapie ---------- */
const CI_LBL = { esofago:"Disturbi esofagei (stenosi, acalasia) o impossibilità a stare in piedi o seduti per 30 minuti", tev:"Tromboembolismo venoso pregresso", irc:"Insufficienza renale cronica (con l'eGFR negli esami si scelgono i farmaci)",
  cv:"Pregresso infarto o ictus, alto rischio cardiovascolare", rt:"Radioterapia sullo scheletro, tumori o metastasi ossee", reflusso:"Reflusso gastroesofageo o ernia iatale (cautela con i bisfosfonati orali)", denti:"Visita odontoiatrica da fare per il nulla osta alla terapia (problemi dentari aperti o cure invasive programmate)" };
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
/* un gruppo dell'anamnesi: chiuso, si apre toccandolo; il numero dice quante voci sono spuntate */
const pzGroup = (key, label, sub, nsel, body) => `<details class="acc pzax" data-pax="${key}"${pzOpenAx.has(key) ? " open" : ""}><summary><span>${label}<small>${sub}</small></span><span class="n"${nsel ? "" : " hidden"}>${nsel}</span>${CHEV}</summary><div class="accbody">${body}</div></details>`;
const pzaxBadge = el => { const ax = el.closest("details.pzax"); if(!ax) return; const n = ax.querySelectorAll('.ck[aria-pressed="true"]').length, badge = ax.querySelector(".n"); badge.textContent = n; badge.hidden = !n; };
function secReport(p, S){
  const item = (x, isSosp) => `<a class="entry ${x.hasForte ? "teal" : ""}" target="_blank" rel="noopener" href="${OH}#causa-${x.f.id}"><div><b>${x.f.nome}</b><small>${FORMA_CAT[x.f.cat] || x.f.cat} · <span class="badge ${x.hasForte ? "forte" : "lieve"}">${badgeOf(x, isSosp)}</span> · ${x.fired.filter(t => t[2] !== "supp").map(t => FEATLABEL[t[0]]).join(", ")}</small></div>${CHEV}</a>`;
  if(!(p.feats || []).length) return `<p class="hint">Spunta farmaci, malattie, segni e abitudini: le forme secondarie compaiono qui.</p>`;
  if(!S.N.note.length && !S.N.sosp.length) return `<div class="alert ok"><b>Nessuna forma secondaria associata</b>Gli elementi spuntati non orientano verso cause secondarie note. Restano da valutare gli esami di I livello.</div>`;
  return (S.N.note.length ? `<p class="lbl">Cause note presenti</p><div class="stack">${S.N.note.map(x => item(x, false)).join("")}</div>` : "") +
    (S.N.sosp.length ? `<p class="lbl">Sospetti da approfondire</p><div class="stack">${S.N.sosp.map(x => item(x, true)).join("")}</div>` : "");
}
/* «Anamnesi muta» come una voce: in cima, selezionabile; toglie le altre e, se la si deseleziona, le rimette */
const anamMutaHTML = p => ckPz("data-amuta", "1", p.anamOk && p.anamMuta, "<b>Anamnesi muta</b> · nessuna malattia, farmaco o controindicazione rilevante per l'osso");
const anamNovHTML = p => p.rival && !p.anamOk ? `<div class="amuta"><button type="button" class="btn sec" data-anov>Nessuna novità dalla valutazione precedente</button><small>Oppure aggiorna le voci qui sopra.</small></div>` : "";
function vPazAnamnesi(p){
  const own = new Set(p.feats || []), vis = id => !FEATSEX[id] || !p.sesso || FEATSEX[id] === p.sesso;
  const axes = AXES.map((a, i) => {
    const all = axisFeats(a).filter(f => vis(f[0])); if(!all.length) return "";
    const nsel = all.filter(f => own.has(f[0])).length;
    const body = a.groups.map(g => { const fs = g.feats.filter(f => vis(f[0])); return fs.length ? `<p class="lbl" style="margin:10px 0 0">${g.sub}</p><div>` + fs.map(f => ckPz("data-pfeat", f[0], own.has(f[0]), f[1])).join("") + `</div>` : ""; }).join("");
    return pzGroup(String(i), a.label, `${all.slice(0, 4).map(f => f[1].replace(/ \(.*$/, "")).join(", ")}${all.length > 4 ? "…" : ""} · ${all.length} voci`, nsel, body);
  }).join("");
  return { bar: pzName(p), html: head("Anamnesi e farmaci", "Spunta malattie, farmaci e abitudini: le forme secondarie compaiono in fondo alla pagina. Se non c'è nulla, usa «Anamnesi muta».") + `
    ${p.sesso ? "" : `<p class="hint">Indica il sesso nei dati del paziente per nascondere le voci non pertinenti.</p>`}
    <div class="gestbox"><p class="gestbox-t">Incolla dal gestionale<small>Copia il riassunto di patologie e farmaci: l'app propone le voci da spuntare</small></p>
      <textarea class="area" data-pf="testoGest" id="gestIn" rows="6" placeholder="Incolla qui l'elenco dei problemi e la terapia in corso (anche con nomi commerciali e dosi)">${hx(p.testoGest)}</textarea>
      <div class="btns"><button type="button" class="btn" id="gestGo">Riconosci</button></div>
      <div id="gestRes">${gestResHTML(p)}</div>
      <p class="small">Riconosce principi attivi e nomi commerciali, sinonimi, abbreviazioni (BPCO, AR, DM2, TVP…) e parole scritte in modo un po' diverso. Il testo resta in questo browser. Controlla sempre le proposte prima di aggiungerle.</p>
    </div>
    <div data-live="amuta">${anamMutaHTML(p)}</div>
    <div>${axes}
    ${pzGroup("dfn", "Altri dati per DeFRA e Nota 79", (p.feats || []).includes("glucocorticoidi") ? "Durata dei glucocorticoidi, grave disabilità motoria" : "Grave disabilità motoria", (gcDurOf(p) ? 1 : 0) + (p.disab ? 1 : 0),
      ((p.feats || []).includes("glucocorticoidi") ? [["3", "Glucocorticoidi: prednisone ≥5 mg/die (o equivalenti) per più di 3 mesi"], ["12", "Glucocorticoidi: prednisone ≥5 mg/die (o equivalenti) da più di 12 mesi"], ["0", "Glucocorticoidi per meno di 3 mesi o a dose minore"]].map(([v, t]) => ckPz("data-gcdur", v, gcDurOf(p) === v, t)).join("") : "")
      + ckPz("data-pbool", "disab", p.disab, "Grave disabilità motoria"))}
    ${(() => { const ci = Object.entries(CI_LBL).filter(([k]) => k !== "denti");
      return pzGroup("ci", "Controindicazioni da conoscere prima della terapia", ci.slice(0, 3).map(([, t]) => t.replace(/ \(.*$/, "")).join(", ") + "… · " + ci.length + " voci", ci.filter(([k]) => (p.ci || {})[k]).length,
        ci.map(([k, t]) => ckPz("data-pci", k, (p.ci || {})[k], t)).join("")); })()}
    ${pzGroup("dent", "Odontoiatria", "Visita per il nulla osta prima di bisfosfonati, denosumab o romosozumab", p.dentista || (p.ci || {}).denti ? 1 : 0,
      [["fare", "Visita odontoiatrica da fare per il nulla osta"], ["ok", "Visita odontoiatrica fatta, bocca in ordine"]].map(([v, t]) => ckPz("data-dent", v, (p.dentista ? "ok" : (p.ci || {}).denti ? "fare" : "") === v, t)).join(""))}</div>
    <div data-live="anov">${anamNovHTML(p)}</div>
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
  if(A.sel.length === 1 && A.sel[0][0] === "Alb" && A.sel[0][1] === "d") out.push(`<div class="alert info"><b>Albumina bassa isolata</b>Nell'anziano è frequente e poco specifica: malnutrizione proteica, infiammazione cronica, malattie epatiche o renali. Da sola non basta a sospettare un malassorbimento: lo fanno pensare calcio, fosforo o vitamina D bassi, PTH alto, calciuria bassa, insieme ai sintomi intestinali.</div>`);
  if(A.kind === "none" && labStatus(p).done) out.push(`<p class="hint">Tutti gli esami registrati sono nella norma.</p>`);
  else {
    const tags = `<div class="tags">${A.sel.map(s => `<span class="tag ${s[1]}">${ftag(s)}</span>`).join("")}</div>`;
    out.push(`<p class="lbl">${A.kind === "inter" ? "Forme compatibili" + (A.forms.length > 1 ? " · dalla più frequente" : "") : A.kind === "multi" ? "Più cause possibili" : "Nessuna forma nota"}</p>` + tags +
      (A.forms.length ? (A.byForm.length ? `<p class="small">Tocca una forma per gli esami di II livello. ${L2_NOTE}</p>` : "") + `<div>${A.forms.map((x, i) => { const l2 = (A.byForm.find(b => b[0] === x.cid) || [, []])[1];
        return `<details class="acc l2f"${i ? "" : " open"}><summary><span>${COND[x.cid]}<small>${[x.sub, l2.length ? plural(l2.length, "esame", "esami") + " di II livello" : ""].filter(Boolean).join(" · ")}</small></span>${CHEV}</summary><div class="accbody">${l2.length ? `<ul class="list">${l2.map((e, j) => `<li><i>${j + 1}</i>${e}</li>`).join("")}</ul>` : ""}<p class="small"><a target="_blank" rel="noopener" href="${OH}#forma-${x.cid}">Scheda in Osteo Help ↗</a></p></div></details>`; }).join("")}</div>` : `<p class="hint">Nessuna forma in elenco spiega questi reperti.</p>`));
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
    <p class="small">${p.sesso === "uomo" ? "Nell'uomo aggiungi il testosterone totale. " : ""}Se sospetti una celiachia: anti-transglutaminasi con IgA totali.</p>
    <div data-live="lab">${labReport(p, pzSecondary(p))}</div>` };
}

/* ---------- 4 · DeFRA ---------- */
function vPazDefra(p){
  const F = pzFacts(p), rc = riskCat(F.zona);
  const hist = F.defra.map(d => `<li class="rec"><span><b>${zchip(d.zona)}</b><small>${fmtD(d.data)}${num(d.rischio) !== null ? " · rischio a 10 anni " + fmtN(num(d.rischio), 0) + "%" : ""}${d.note ? " · " + hx(d.note) : ""}</small></span><button type="button" class="x" data-del="defra:${p.defra.indexOf(d)}" aria-label="Elimina">✕</button></li>`).join("");
  const form = `<div class="addbox">
      <div class="zpick" role="group" aria-label="Zona del DeFRA">${ZONE_ORDER.map(z => `<button type="button" class="zbtn z-${z}" data-zona="${z}" aria-pressed="false"><i></i><span><b>${ZONE[z].t}</b><small>${ZONE[z].r}</small></span></button>`).join("")}</div>
      <div class="grid2">
        <label class="fld">Data<input type="date" id="dfD" value="${todayISO()}"></label>
        <label class="fld">Rischio a 10 anni, % (facoltativo)<input type="text" inputmode="decimal" autocomplete="off" id="dfR" placeholder="fratture maggiori"></label>
        <label class="fld" style="grid-column:1/-1">Nota (facoltativa)<input type="text" id="dfN"></label>
      </div>
      <button type="button" class="btn" data-add="defra">Salva la zona del DeFRA</button>
    </div>`;
  const serve = `<div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>`;
  const zone = `<ul class="list zleg">${ZONE_ORDER.map(z => `<li>${zchip(z)}<span><b>${ZONE[z].r[0].toUpperCase() + ZONE[z].r.slice(1)} → ${ZONE[z].chi}</b><small>${ZONE[z].azione}</small></span></li>`).join("")}</ul>
    <p class="small">Le soglie delle zone dipendono dall'età: per questo basta riportare la zona che indica il DeFRA. La rimborsabilità resta legata alle condizioni della Nota 79.</p>`;
  const acc = (t, body, open) => `<details class="dsec"${open ? " open" : ""}><summary><span>${t}</span></summary><div class="dsec-b">${body}</div></details>`;
  const head0 = head("DeFRA e rischio di frattura", "Il DeFRA (SIOMMMS e SIR) stima il rischio di fratture maggiori a 10 anni, unendo DXA e fattori clinici, e lo colloca in una zona di colore.");
  if(rc){ const r = F.rischio;
    return { bar: pzName(p), html: head("DeFRA e rischio di frattura") + `
    <div class="dfz z-${F.zona}"><span class="dfz-c">${r !== null ? fmtN(r, 0) + "<i>%</i>" : ""}</span><span><small>Zona del DeFRA · ${fmtD(F.lastDefra.data)}</small><b>Zona ${rc.t.toLowerCase()}</b><span>${rc.r} → ${rc.chi}</span></span></div>
    ${acc("Aggiorna il DeFRA", serve + form, false)}
    ${F.defra.length > 1 ? acc("Tutti i DeFRA (" + F.defra.length + ")", `<ul class="list recs">${hist}</ul>`, false) : `<p class="small">Inserito per errore? <button type="button" class="lnk" data-del="defra:${p.defra.indexOf(F.lastDefra)}">Elimina questo DeFRA</button></p>`}
    ${acc("Cosa significano le zone", zone, false)}` };
  }
  return { bar: pzName(p), html: head0 + `
    ${serve}
    <p class="lbl">Zona di rischio</p>${form}
    ${acc("Cosa significano le zone", zone, false)}` };
}

/* ---------- 5 · terapia ---------- */
function choiceHTML(p, F, fl, ids){
  return ids.map(id => { const f = fl[id];
    return `<span class="dchip${f && f.ci.length ? " ci" : f && f.warn.length ? " warn" : ""}">${dlink(id)}${f && f.ci.length ? " <i>controindicato</i>" : f && f.warn.length ? " <i>cautela</i>" : ""}</span>`; }).join("");
}
function vPazTerapia(p){
  const F = pzFacts(p), notes = therapyNotes(F), n79 = nota79(p, F);
  const n79of = id => { const c = n79.filter(c => c.s.some(l => l.includes(id))); return c.length ? "Nota 79: " + c.map(x => x.cond).join(" / ") + (c.some(x => x.spec) && [T_, AB_, RO_].includes(id) ? " (prescrizione su piano terapeutico specialistico)" : "") : "Con i dati inseriti non rientra in una condizione della Nota 79: verifica i dati o prescrivi fuori Nota."; };
  const all = (p.terapie || []).slice().sort((a, b) => (b.inizio || "").localeCompare(a.inizio || ""));
  const rows = all.map(t => { const i = p.terapie.indexOf(t), nd = !t.fine && nextDose(t);
    const nt = !t.fine && notes.find(n => n.id === t.farmaco);
    return `<li class="rec"><span><b>${DRUGS[t.farmaco] ? DRUGS[t.farmaco].nome : hx(t.farmaco)}</b><small>dal ${fmtD(t.inizio)}${t.fine ? " al " + fmtD(t.fine) : " · in corso"}${t.note ? " · " + hx(t.note) : ""}</small>${nt ? `<small class="tnote">${nt.s}</small><small class="n79l">${n79of(nt.id)}</small>` : ""}${nd ? `<small class="dose-i">Ultima dose ${fmtD(lastDose(t))} · <b>prossima ${fmtDt(nd)}</b>${(t.dosi || []).length ? " · " + plural(t.dosi.length + 1, "dose", "dosi") + " registrate" : ""}</small>
      <span class="dose"><input type="date" id="dz${i}" value="${todayISO()}" aria-label="Data della dose"><button type="button" class="btn sec mini" data-dose="${i}">Registra dose fatta</button></span>` : ""}</span>${t.fine ? "" : `<button type="button" class="btn sec mini" data-stop="${p.terapie.indexOf(t)}">Termina</button>`}<button type="button" class="x" data-del="terapie:${p.terapie.indexOf(t)}" aria-label="Elimina">✕</button></li>`; }).join("");
  const sug = F.zona ? DEC_ZONA[F.zona] : null, cur = p.decisione ? p.decisione.tipo : null;
  return { bar: pzName(p), html: head("Terapia", "Il registro dei farmaci: inizio, dosi fatte, sospensione. La proposta, con Nota 79 e controindicazioni, è in «Decidi la terapia».") + `
    <div class="btns"><a class="btn sec" href="#paz-${p.id}-decidi">Decidi la terapia</a></div>
    ${rows ? `<ul class="list recs">${rows}</ul>` : `<p class="hint">Nessuna terapia registrata.</p>`}
    ${notes.length ? `<p class="small"><a href="#paz-${p.id}-foglio">Foglio per il paziente</a>: come prendere la terapia e cosa fare a casa, da stampare.</p>` : ""}
    <p class="lbl">Vitamina D e calcio</p>
    <div class="addbox supbox">
      <div class="grid2">
        <label class="fld" style="grid-column:1/-1">Vitamina D${supSel(p, "supVD", SUP_VD, "Nessuna")}</label>
        <label class="fld" style="grid-column:1/-1">Calcio${supSel(p, "supCa", SUP_CA, "Basta la dieta")}</label>
        <label class="fld">Dal<input type="date" data-pf="supDal" value="${hx(p.supDal || "")}"></label>
        <label class="fld">Nota (facoltativa)<input type="text" data-pf="supNota" value="${hx(p.supNota || "")}" placeholder="es. nome commerciale"></label>
      </div>
      <p class="small">Si salva da solo. Dosi e rimborsabilità: <a href="#guida-nota96">Vitamina D e Nota 96</a>.</p>
    </div>
    <p class="lbl">${rows ? "Aggiungi un farmaco" : "Registra un farmaco"}</p>
    <div class="addbox">
      <div class="grid2">
        <label class="fld">Farmaco<select id="thF">${DRUG_ORDER.map(id => `<option value="${id}">${DRUGS[id].nome}</option>`).join("")}</select></label>
        <label class="fld">Inizio<input type="date" id="thI" value="${todayISO()}"></label>
        <label class="fld" style="grid-column:1/-1">Nota (facoltativa)<input type="text" id="thN"></label>
      </div>
      <button type="button" class="btn" data-add="terapie">Aggiungi terapia</button>
    </div>
    <details class="dsec"${cur ? "" : " open"}><summary><span>${cur ? "Decisione: " + DECISIONI[cur].t.toLowerCase() + " · " + fmtD(p.decisione.data) : "La tua decisione"}</span></summary><div class="dsec-b">
    <div class="decs">${Object.entries(DECISIONI).map(([k, d]) => `<button type="button" class="dec" data-dec="${k}" aria-pressed="${cur === k}"><span class="cb">${TICK}</span><span><b>${d.t}${sug === k ? ` <em>consigliata</em>` : ""}</b><small>${d.s}</small></span></button>`).join("")}</div>
    ${cur === "spec" || (!cur && zoneHigh(F.zona)) ? `<p class="small"><a href="#paz-${p.id}-lettera">Lettera allo specialista</a>: già compilata, aggiungi il quesito e stampala.</p>` : ""}
    </div></details>
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
/* una densitometria = una scheda: la data in testa, sotto i tre siti con il loro T-score e il confronto con la DXA precedente */
function dxaCard(p, d, prev, big){
  const sites = SERIES.map(([k, nome]) => [k, nome, num(d[k])]).filter(x => x[2] !== null);
  const worst = sites.length ? Math.min(...sites.map(x => x[2])) : null, wc = worst !== null ? tsCat(worst) : null;
  const rows = sites.map(([k, nome, v]) => { const c = tsCat(v), pv = prev ? num(prev[k]) : null;
    let tr = ""; if(pv !== null){ const dl = Math.round((v - pv) * 10) / 10;
      tr = Math.abs(dl) < TS_LSC ? `<em class="st">= stabile</em>` : dl > 0 ? `<em class="up">▲ ${fmtN(dl)}</em>` : `<em class="dn">▼ ${fmtN(-dl)}</em>`; }
    return `<li class="t-${c[0]}"><span class="dxv">${fmtN(v)}</span><span class="dxn"><b>${nome}</b><small>${c[1].toLowerCase()}</small></span>${tr}</li>`; }).join("");
  return `<div class="dxcard${big ? " big" : ""}">
    <div class="dxh"><span><small>Densitometria</small><b>${fmtD(d.data)}</b></span>${wc ? `<span class="dxw t-${wc[0]}">${wc[1]}</span>` : ""}</div>
    <ul class="dxs">${rows || `<li class="none">Nessun T-score inserito</li>`}</ul>
    <div class="dxf">${prev ? `<small>Confronto con la DXA del ${fmtD(prev.data)}; sotto ${fmtN(TS_LSC)} è stabile.</small>` : "<small></small>"}<button type="button" class="lnk" data-del="dxa:${p.dxa.indexOf(d)}">Elimina</button></div></div>`;
}
function vPazDxa(p){
  const F = pzFacts(p), pl = dxaPlan(F), L = F.dxa;
  const form = `<div class="addbox">
      <div class="grid2">
        <label class="fld">Data della DXA<input type="date" id="dxD" value="${todayISO()}"></label>
        <div class="fld">T-score colonna (L1–L4)<div class="tsrow"><button type="button" class="sgn" data-sgn="dxL" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxL" aria-label="T-score colonna (L1–L4)"></div></div>
        <div class="fld">T-score femore totale<div class="tsrow"><button type="button" class="sgn" data-sgn="dxFt" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxFt" aria-label="T-score femore totale"></div></div>
        <div class="fld">T-score collo femorale<div class="tsrow"><button type="button" class="sgn" data-sgn="dxFn" aria-pressed="true" aria-label="Segno del T-score: meno (tocca per più)">−</button><input type="text" inputmode="decimal" autocomplete="off" id="dxFn" aria-label="T-score collo femorale"></div></div>
      </div>
      <p class="small">Il segno meno è già inserito: per −2,7 scrivi solo 2,7. Tocca «−» per cambiarlo in «+» se il T-score è positivo.</p>
      <button type="button" class="btn" data-add="dxa">Salva la densitometria</button>
    </div>`;
  const asc = L.slice().reverse().filter(d => pDate(d.data) && [d.tL, d.tFt, d.tFn].some(v => num(v) !== null));
  const chart = asc.length > 1 ? lineChart(asc.map(d => ({ x: pDate(d.data), tL: num(d.tL), tFt: num(d.tFt), tFn: num(d.tFn) })), SERIES,
    { label:"Andamento del T-score", bands:[[-99, -2.5, "b-op", "Osteoporosi"], [-2.5, -1, "b-on", "Osteopenia", 1], [-1, 99, "b-ok", "Normale", 1]] }) : "";
  return { bar: pzName(p), html: head("Densitometria (DEXA)", L.length ? "Ogni scheda è una densitometria: la data e i T-score di quel referto." : "Riporta il T-score di colonna lombare e femore dal referto della DXA.") + `
    ${L.length ? dxaCard(p, L[0], L[1], true) : ""}
    ${L.length ? `<div class="alert ${pl.st === "ok" ? "ok" : pl.st === "warn" ? "warn" : ""}"><b>${pl.t}</b>${pl.s}${F.gc ? " Con glucocorticoidi ad alte dosi si può anticipare a 12 mesi." : ""}</div>` : `<div class="alert info"><b>Nessuna densitometria</b>Se il paziente non ha una DXA lombare e femorale recente, richiedila (<a href="#guida-dxa-lea">a chi farla in LEA</a>) e torna a questo passo quando hai il referto. Per la Nota 79 deve essere eseguita in una struttura pubblica o convenzionata.</div>`}
    ${L.length ? `<details class="dxadd"><summary><span class="dxplus">+</span><span><b>Aggiungi una nuova densitometria</b><small>di solito dopo 18–24 mesi dalla precedente</small></span></summary>${form}</details>` : form}
    ${chart ? `<p class="lbl">T-score nel tempo</p>${chart}` : ""}
    ${L.length > 1 ? `<details class="dxprev"><summary>${plural(L.length - 1, "densitometria precedente", "densitometrie precedenti")}</summary>${L.slice(1).map((d, i) => dxaCard(p, d, L[i + 2], false)).join("")}</details>` : ""}
    <p class="small">T-score uguale o inferiore a −2,5: osteoporosi; tra −1 e −2,5: osteopenia.</p>` };
}
function vPazStorico(p){
  const F = pzFacts(p), pl = dxaPlan(F), notes = therapyNotes(F), d = p.decisione && DECISIONI[p.decisione.tipo];
  const dfAsc = F.defra.slice().reverse().filter(d => pDate(d.data) && ZONE[d.zona]);
  const dfChart = dfAsc.length ? `<div class="ztl">${dfAsc.map((d, i) => { const prev = dfAsc[i - 1], dir = prev ? Math.sign(ZONE_ORDER.indexOf(d.zona) - ZONE_ORDER.indexOf(prev.zona)) : 0;
    return `<div class="ztl-i z-${d.zona}"><i></i><b>${ZONE[d.zona].t}</b><small>${fmtM(pDate(d.data))}${dir > 0 ? " · peggiorata" : dir < 0 ? " · migliorata" : ""}</small></div>`; }).join("")}</div>` : "";
  const imm = F.recent.length ? `<div class="alert"><b>Rischio imminente di rifrattura</b>${plural(F.recent.length, "frattura", "fratture")} negli ultimi 24 mesi (l'ultima il ${fmtD(F.recent[0].data)}). Dopo una frattura il rischio di una nuova frattura è massimo nei primi 1–2 anni: la terapia va iniziata o rivista subito, insieme alla prevenzione delle cadute.</div>`
    : F.fx.length ? `<div class="alert info"><b>Rischio di rifrattura</b>Una frattura da fragilità all'incirca raddoppia il rischio di altre fratture, anche dopo anni. Ultima frattura: ${fmtD(F.fx[0].data)}.</div>` : "";
  return { bar: pzName(p), html: head("Follow-up", "Come va nel tempo. A ogni controllo: nuova DXA al passo 5, nuova zona al passo 6, nuove fratture al passo 2.") + `
    ${imm}
    ${notes.length ? notes.map((n, i) => `<div class="alert info"><b>${n.nome} · ${n.durata ? "da " + n.durata : "in corso"}</b>${n.s}${i === 0 ? ` <a href="#paz-${p.id}-terapia">Dosi e sospensione</a>` : ""}</div>`).join("")
      : d ? `<div class="alert info"><b>Decisione: ${d.t}</b>${fmtD(p.decisione.data)}. <a href="#paz-${p.id}-decidi">Rivedi</a></div>` : ""}
    ${(p.visite || []).length ? `<p class="lbl">Valutazioni precedenti</p><ul class="list recs vis">${p.visite.slice().reverse().map(v => `<li class="rec"><span><b>${fmtD(v.data)}${v.zona && ZONE[v.zona] ? ` · <span class="zn z-${v.zona}"><i></i>zona ${ZONE[v.zona].t.toLowerCase()}</span>` : ""}</b><small>${[v.minT !== null && v.minT !== undefined ? "T-score " + fmtN(v.minT) : "", v.dec && DECISIONI[v.dec] ? DECISIONI[v.dec].t.toLowerCase() : "", v.farmaci.length ? v.farmaci.map(id => DRUGS[id] ? DRUGS[id].nome.replace(/ \(.*\)$/, "") : id).join(" + ") : "", v.sec.length ? plural(v.sec.length, "forma secondaria", "forme secondarie") : ""].filter(Boolean).join(" · ")}</small></span></li>`).join("")}</ul>` : ""}
    <p class="lbl">T-score nel tempo</p>
    ${dxaChartHTML(F) || `<p class="hint">Nessuna DXA registrata.</p>`}
    <p class="lbl">Zona del DeFRA nel tempo</p>
    ${dfChart || `<p class="hint">Nessuna zona registrata.</p>`}
    <p class="lbl">Fratture</p>
    ${F.fx.length ? `<ul class="list recs">${F.fx.map(f => `<li class="rec"><span><b>${FX_SEDI[f.sede]}${f.grado ? " · " + f.grado : ""}</b><small>${fmtD(f.data)}</small></span></li>`).join("")}</ul>` : `<p class="hint">${p.nessunaFx ? "Nessuna frattura da fragilità." : "Nessuna frattura registrata."}</p>`}` };
}

/* ---------- report ---------- */
function vPazReport(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), fl = drugFlags(p, F, S), rc = riskCat(F.zona), pl = dxaPlan(F), vh = veryHigh(p, F);
  const miss = [], sec = (title, items, empty) => { if(items.length) return `<p class="lbl">${title}</p><ul class="list">${items.map(x => `<li>${x}</li>`).join("")}</ul>`; if(empty) miss.push(empty); return ""; };
  const anam = (p.feats || []).map(id => FEATLABEL[id]).filter(Boolean).concat(p.fam === true ? ["Familiarità per fratture di femore o vertebre"] : []);
  const nomi = ids => ids.map(id => dnome(id).replace(/ \(.*\)$/, "") + (fl[id] && fl[id].ci.length ? " (controindicato)" : "")).join(", ");
  const ll = labLine(p), td = pzTodo(p, F), dec = p.decisione && DECISIONI[p.decisione.tipo];
  const body = sec("Fratture da fragilità", F.fx.length ? F.fx.map(fxTxt) : p.nessunaFx ? ["Nessuna"] : [], "fratture")
    + sec("Anamnesi e terapie", anam, anamDone(p) ? "" : "anamnesi")
    + sec("Forme secondarie", secGroups(p, S).map(([l, xs]) => SEC_LEV[l].t + " (" + SEC_LEV[l].s + "): " + xs.map(x => x.nome + (x.riv ? " — da rivedere se possibile" : "")).join("; ")), "")
    + sec("Esami di I livello" + (p.labData ? " (" + fmtD(p.labData) + ")" : ""), ll ? [ll] : [], "esami")
    + (S.A.byForm.length ? `<p class="note">${S.A.byForm.length ? "Esami di II livello, solo su sospetto clinico, partendo da " + COND[S.A.byForm[0][0]].toLowerCase() + ": " + S.A.byForm[0][1].join("; ") + "." : ""}</p>` : "")
    + (S.hpp ? `<p class="note"><b>Fosfatasi alcalina bassa:</b> escludere l'ipofosfatasia; bisfosfonati controindicati.</p>` : "")
    + sec("Densitometria (T-score)", F.dxa.map(d => fmtD(d.data) + " — " + tsTxt(d)), "densitometria")
    + (F.lastDxa ? `<p class="note">${pl.t}.</p>` : "")
    + sec("Rischio di frattura (DeFRA)", F.defra.filter(d => ZONE[d.zona]).map(d => fmtD(d.data) + " — " + defraTxt(d, F)), "zona del DeFRA")
    + (rc ? `<p class="note"><b>Zona ${rc.t.toLowerCase()} → ${rc.chi}.</b> ${rc.azione}</p>` : "")
    + (vh.length ? `<p class="note"><b>Rischio molto alto:</b> ${vh.join("; ")}.</p>` : "")
    + sec("Nota 79", n79.map(c => `<b>${c.cond}</b>${c.nb ? ", " + c.nb : ""} — ${c.s.map((l, i) => l.length ? ["I", "II", "III"][i] + " scelta: " + nomi(l) : "").filter(Boolean).join("; ")}`), "")
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
  const sec = secLevels(p, S).filter(x => x.lev < 3).map(x => x.nome);
  if(sec.length) r.push("inquadramento di una possibile forma secondaria (" + sec.slice(0, 4).join(", ") + ")");
  if(!r.length) r.push("valutazione specialistica dell'osteoporosi e indicazione alla terapia");
  return r;
}
/* nella lettera: se il paziente rientra per un farmaco dello specialista, solo quei farmaci, ognuno con il suo perché */
function n79Lettera(n79){
  if(!n79.length) return "nessuna condizione con i dati disponibili";
  const sp = [T_, AB_, RO_].flatMap(id => n79.filter(c => c.s.some(l => l.includes(id))).map(c => dnome(id).replace(/ \(.*\)$/, "") + ", " + n79Lev(c, id) + " scelta: " + (/^T-score/.test(c.cond) ? c.cond : c.cond.charAt(0).toLowerCase() + c.cond.slice(1))));
  return sp.length ? sp.join("; ") : n79.map(c => c.cond).join("; ");
}
function letterData(p){
  const F = pzFacts(p), S = pzSecondary(p), n79 = nota79(p, F), ll = labLine(p);
  const ci = p.ci || {}, ciTxt = [ci.esofago && "disturbi esofagei", ci.tev && "tromboembolismo venoso pregresso", (ci.cv || F.feats.has("ictus_emiplegia")) && "pregresso infarto o ictus / rischio cardiovascolare", ci.rt && "radioterapia scheletrica o tumori ossei", ci.denti && "problemi dentari aperti", ci.irc && "insufficienza renale cronica", num(p.egfr) !== null && num(p.egfr) < 35 && "eGFR " + fmtN(num(p.egfr), 0) + " mL/min"].filter(Boolean);
  const anam = (p.feats || []).map(id => FEATLABEL[id]).filter(Boolean).concat(p.fam === true ? ["familiarità per fratture di femore o vertebre"] : []);
  const rows = [
    ["Fratture da fragilità", F.fx.length ? F.fx.map(fxTxt).join("; ") : p.nessunaFx ? "nessuna" : "non note"],
    ["Densitometria (T-score)", F.dxa.length ? F.dxa.slice(0, 3).map(d => fmtD(d.data) + ": " + tsTxt(d)).join("; ") : "non disponibile"],
    ["DeFRA", F.zona ? fmtD(F.lastDefra.data) + ": " + defraTxt(F.lastDefra, F) : "non calcolato"],
    ["Anamnesi e fattori di rischio", anam.length ? anam.join(", ") : "nulla di rilevante"],
    ["Forme secondarie considerate", secText(p, S) || "nessuna"],
    ["Esami" + (p.labData ? " del " + fmtD(p.labData) : ""), (ll || "non disponibili")],
    ["Terapie per l'osteoporosi", (p.terapie || []).length ? p.terapie.map(t => dnome(t.farmaco) + " dal " + fmtD(t.inizio) + (t.fine ? " al " + fmtD(t.fine) : " (in corso)")).join("; ") : "nessuna"],
    ["Da tenere presente per la terapia", ciTxt.length ? ciTxt.join(", ") : "nessuna controindicazione nota"],
    ["Nota 79", n79Lettera(n79)]
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
    return `<div class="fg-d"><b class="fdn">${drugIcon(t.farmaco)}${dnome(t.farmaco)}</b><p>${PAZ_ISTR[t.farmaco] || ""}</p>${n ? `<p class="fg-next">${daysTo(n) < 0 ? `${sommOf(t.farmaco) === "infusione" ? "L'infusione" : sommOf(t.farmaco) === "iniezione" ? "L'iniezione" : "La dose"} era prevista il <b>${fmtDt(n)}</b>: la faccia al più presto.` : `Prossima ${doseWord(t.farmaco)}: <b>${fmtDt(n)}</b>`}</p>` : ""}</div>`; }).join("")
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
    <ul class="list fg"><li>${F.lastDxa ? pl.t.replace(/^Prossima DXA: /, "Densitometria (MOC): ") : "Densitometria (MOC): da prenotare secondo le indicazioni del medico"}.</li><li>Torni dal medico se ha una nuova frattura, un mal di schiena improvviso e forte o se si accorge di essere ${p.sesso === "donna" ? "diventata più bassa" : "diventato più basso"}.</li></ul>
  </div>` };
}

/* ---------- guida per il MMG ---------- */
/* ---------- densitometria in LEA: DPCM 12 gennaio 2017, Allegato 4A ---------- */
const LEA_MAG = [
  ["Fratture e osteoporosi documentate", ["Precedenti fratture da fragilità (causate da trauma minimo)", "Riscontro radiologico di fratture vertebrali", "Riscontro radiologico di osteoporosi"]],
  ["Terapie croniche (attuate o previste)", ["Corticosteroidi sistemici per più di 3 mesi a dosi ≥5 mg/die di equivalente prednisonico", "Levotiroxina a dosi soppressive", "Antiepilettici", "Anticoagulanti (eparina)", "Immunosoppressori", "Antiretrovirali", "Sali di litio", "Agonisti del GnRH", "Chemioterapia in età pediatrica *", "Radioterapia in età pediatrica *"]],
  ["Solo donne in menopausa", ["Anamnesi familiare materna di frattura osteoporotica in età inferiore a 75 anni", "Menopausa prima dei 45 anni", "Magrezza: indice di massa corporea < 19 kg/m²"]]
];
const LEA_PAT = [
  ["Malattie endocrine", "amenorrea primaria non trattata; amenorrea secondaria per oltre un anno; ipogonadismi; iperparatiroidismo; ipertiroidismo; sindrome di Cushing; acromegalia; deficit di GH; iperprolattinemia; diabete mellito tipo 1"],
  ["Malattie metaboliche e nutrizionali", "rachitismi/osteomalacia; sindromi da denutrizione, compresa l'anoressia nervosa e le sindromi correlate"],
  ["Malattie gastroenterologiche", "celiachia e sindromi da malassorbimento; malattie infiammatorie intestinali croniche severe; epatopatie croniche colestatiche; fibrosi cistica"],
  ["Malattie renali", "insufficienza renale cronica; sindrome nefrosica; nefrotubulopatie croniche; ipercalciuria idiopatica"],
  ["Emopatie con coinvolgimento osseo", "mieloma; linfoma; leucemia; talassemia; drepanocitosi; mastocitosi"],
  ["Malattie reumatologiche", "artrite reumatoide (incluso morbo di Still); spondilite anchilosante; artropatia psoriasica; connettiviti sistemiche"],
  ["Altre patologie e condizioni", "patologie genetiche con alterazioni metaboliche e displasiche dell'apparato scheletrico; trapianto d'organo; allettamento e immobilizzazioni prolungate (oltre 3 mesi); paralisi cerebrale, distrofia muscolare, atrofia muscolare e spinale"]
];
const LEA_MIN = {
  donna: ["Età superiore ai 65 anni", "Anamnesi familiare materna di osteoporosi severa", "Amenorrea premenopausale di durata superiore ai 6 mesi", "Scarso apporto di calcio con la dieta (< 1200 mg/die)", "Fumo di sigaretta (> 20 sigarette/die)", "Abuso di alcol (> 60 g/die)"],
  uomo: ["Anamnesi familiare di osteoporosi severa", "Magrezza: indice di massa corporea < 19 kg/m²", "Scarso apporto di calcio con la dieta (< 1200 mg/die)", "Fumo di sigaretta (> 20 sigarette/die)", "Abuso di alcol (> 60 g/die)"]
};
const leaCk = (grp, i, t) => `<button type="button" class="ck" data-lea="${grp}" aria-pressed="false"><span class="cb">${TICK}</span><span>${t}</span></button>`;
const LEA_DXA_HTML = `
    <p class="note">La densitometria ossea (DXA) è a carico del SSN se c'è <b>almeno un fattore di rischio maggiore</b> oppure, nella donna in menopausa e nell'uomo oltre i 60 anni, <b>almeno tre fattori di rischio minori</b>. Sono i criteri nazionali dei LEA, che valgono anche in Veneto. Spunta quelli presenti: il risultato compare in fondo.</p>
    <p class="lbl">Fattori di rischio maggiori · ne basta uno</p>
    ${LEA_MAG.map(([t, l], g) => `<p class="small"><b>${g + 1}. ${t}</b></p><div class="leag">${l.map((x, i) => leaCk("mag", i, x)).join("")}</div>`).join("")}
    <p class="small"><b>4. Patologie a rischio di osteoporosi</b></p>
    <div class="leag">${LEA_PAT.map(([t, l]) => leaCk("mag", 0, `<b>${t}</b><small>${l}</small>`)).join("")}</div>
    <p class="small">* Chemioterapia e radioterapia in età pediatrica valgono nell'adulto solo se associate a 3 o più fattori di rischio minori.</p>
    <p class="lbl">Fattori di rischio minori · ne servono almeno tre</p>
    <div class="seg" role="group" aria-label="Chi è il paziente" id="leaSx"><button type="button" data-leasx="donna" aria-pressed="true">Donna in menopausa</button><button type="button" data-leasx="uomo" aria-pressed="false">Uomo oltre i 60 anni</button></div>
    <div class="leag" data-leamin="donna">${LEA_MIN.donna.map((x, i) => leaCk("min", i, x)).join("")}</div>
    <div class="leag" data-leamin="uomo" hidden>${LEA_MIN.uomo.map((x, i) => leaCk("min", i, x)).join("")}</div>
    <div class="alert info" id="leaOut" role="status"><b>Spunta i fattori presenti</b>Con almeno un fattore maggiore, o tre minori, la DXA rientra nei LEA.</div>
    <p class="small">Fonte: criteri di accesso alla densitometria ossea, DPCM 12 gennaio 2017, Allegato 4A (LEA nazionali). L'elenco serve da promemoria: la prescrizione resta del medico.</p>`;
/* ---------- vitamina D: Nota 96 (testo AIFA, aggiornamento del 10 febbraio 2023) ---------- */
const NOTA96_HTML = `
    <p class="note">La Nota 96 regola la rimborsabilità di colecalciferolo, colecalciferolo con calcio e calcifediolo nell'adulto (≥18 anni), per la prevenzione e il trattamento della carenza di vitamina D.</p>
    <p class="lbl">A · Rimborsabile senza dosare la 25-OH-vitamina D</p>
    <ul class="list"><li><i>1</i><span>Persone istituzionalizzate.</span></li><li><i>2</i><span>Persone con gravi deficit motori o allettate che vivono al proprio domicilio.</span></li><li><i>3</i><span>Donne in gravidanza o in allattamento.</span></li><li><i>4</i><span>Persone con osteoporosi di qualsiasi causa <b>non candidate</b> a terapia remineralizzante (Nota 79).</span></li></ul>
    <p class="lbl">B · Rimborsabile dopo il dosaggio della 25-OH-vitamina D</p>
    <ul class="list"><li><i>1</i><span>Sotto <b>30 nmol/L</b> (12 ng/mL) con sintomi attribuibili (astenia intensa, mialgie, dolori diffusi o localizzati, cadute frequenti immotivate), oppure come riscontro occasionale anche senza sintomi.</span></li>
    <li><i>2</i><span>Sotto <b>50 nmol/L</b> (20 ng/mL) in terapia di lunga durata con farmaci che interferiscono con la vitamina D (antiepilettici, glucocorticoidi, antiretrovirali, antimicotici, colestiramina, orlistat) o con malattie che causano malassorbimento.</span></li>
    <li><i>3</i><span>Sotto <b>75 nmol/L</b> (30 ng/mL) con iperparatiroidismo primario o secondario.</span></li>
    <li><i>4</i><span>Sotto <b>75 nmol/L</b> (30 ng/mL) con osteoporosi di qualsiasi causa od osteopatia accertata <b>candidate a terapia remineralizzante</b>: la correzione va fatta <b>prima</b> di iniziare il farmaco.</span></li></ul>
    <div class="alert info"><b>Nel paziente che inizia un farmaco per l'osteoporosi</b>Si dosa la 25-OH-vitamina D: sotto 75 nmol/L (30 ng/mL) la vitamina D è rimborsabile e la terapia per l'osso si inizia dopo averla corretta.</div>
    <p class="lbl">Come correggere (Allegato 1 della Nota)</p>
    <ul class="list"><li><i>1</i><span><b>0–30 nmol/L</b> (0–12 ng/mL): colecalciferolo 300.000 UI in tutto, in non più di 12 settimane (dosi giornaliere, settimanali o mensili, mai oltre 100.000 UI per dose), oppure calcifediolo 0,266 mg due volte al mese.</span></li>
    <li><i>2</i><span><b>30–50 nmol/L</b> (13–20 ng/mL), quando la Nota lo prevede: colecalciferolo 750–1000 UI al giorno (o dosi settimanali o mensili corrispondenti), oppure calcifediolo 0,266 mg al mese.</span></li>
    <li><i>3</i><span><b>Sopra 50 nmol/L</b> (20 ng/mL): la supplementazione non è rimborsata, salvo osteoporosi, osteomalacia, patologie ossee riconosciute o iperparatiroidismo (stesse dosi del punto 2).</span></li>
    <li><i>4</i><span>Ricontrollare la 25-OH-vitamina D dopo circa 3 mesi, soprattutto se i sintomi non passano. Mantenimento per tutta la durata della terapia per l'osteoporosi.</span></li></ul>
    <p class="small">Lo schema non si applica, e serve lo specialista, con eGFR sotto 30, urolitiasi, ipercalcemia, sarcoidosi, neoplasie metastatiche, linfomi. Il dosaggio non è uno screening: va chiesto con sintomi, farmaci interferenti o malassorbimento, patologia ossea da trattare, PTH elevato. Fonte: Nota AIFA 96 e Allegato 1 (aggiornamento con determina n. 48 del 10 febbraio 2023).</p>`;
/* ---------- Nota 79: testo della determina AIFA dell'8 settembre 2025 ---------- */
const N79_GUIDA = [
  ["Prevenzione secondaria · fratture vertebrali o di femore", [
    ["1-2 fratture (b)", "Alendronato (± vit. D), risedronato, zoledronato (d)", "Denosumab (e), ibandronato, raloxifene, bazedoxifene", ""],
    ["≥3 fratture", "Teriparatide (g)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"],
    ["≥1 frattura + T-score colonna o femore (c) ≤ −4", "Teriparatide (g)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"],
    ["≥1 frattura + trattamento da più di 12 mesi con prednisone o equivalenti ≥5 mg/die", "Teriparatide (g)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"],
    ["Nuova frattura vertebrale o femorale nonostante trattamento in Nota 79 da almeno 1 anno", "Teriparatide (g)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"],
    ["Donne in postmenopausa con T-score colonna o femore < −2,5 e > −5,0 (< −2,0 e > −5,0 oltre i 65 anni) + ≥2 fratture vertebrali lievi o almeno 1 moderata, o storia di frattura di avambraccio, omero, sacro, pelvi, anca, femore o tibia negli ultimi 5 anni", "Abaloparatide (h)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"],
    ["Donne con T-score colonna o femore < −2,5 (< −2,0 se ≥2 fratture vertebrali moderate o gravi, o frattura femorale nei 2 anni precedenti) + almeno 1 frattura vertebrale moderata o grave, o ≥2 lievi, o frattura femorale + rischio di frattura a 10 anni ≥20% (calcolatore validato) + impossibilità a seguire altri trattamenti efficaci (intolleranza, inefficacia o fine del periodo autorizzato)", "Romosozumab (f) per al massimo 12 mesi, seguito da antiriassorbitivi (bisfosfonati o denosumab)", "Denosumab (e), zoledronato (d)", "Alendronato (± vit. D), risedronato, ibandronato"]
  ]],
  ["Prevenzione secondaria · fratture non vertebrali e non femorali", [
    ["+ T-score colonna o femore ≤ −3", "Alendronato (± vit. D), risedronato, zoledronato (d)", "Denosumab (e), ibandronato, raloxifene, bazedoxifene", ""],
    ["Donne con T-score colonna o femore < −2,5 + ≥2 fratture non vertebrali + rischio di frattura a 10 anni ≥20% (calcolatore validato) + impossibilità a seguire altri trattamenti efficaci", "Romosozumab (f) per al massimo 12 mesi, seguito da antiriassorbitivi (bisfosfonati o denosumab)", "", ""]
  ]],
  ["Prevenzione primaria · donne in menopausa o uomini di almeno 50 anni", [
    ["Trattamento in atto o previsto per più di 3 mesi con prednisone equivalente ≥5 mg/die", "Alendronato (± vit. D), risedronato, zoledronato (d)", "Denosumab (e)", ""],
    ["Blocco ormonale adiuvante: donne con carcinoma mammario o uomini con carcinoma prostatico", "Alendronato (± vit. D), risedronato, zoledronato (d), denosumab (e)", "", ""],
    ["T-score colonna o femore (c) ≤ −4", "Alendronato (± vit. D), risedronato", "Denosumab (e), zoledronato (d), ibandronato, raloxifene, bazedoxifene", ""],
    ["T-score colonna o femore (c) ≤ −3 + familiarità per fratture di vertebre o femore, oppure comorbilità a rischio di frattura (artrite reumatoide o altre connettiviti, diabete, BPCO, malattia infiammatoria cronica intestinale, AIDS, m. di Parkinson, sclerosi multipla, grave disabilità motoria)", "Alendronato (± vit. D), risedronato", "Denosumab (e), zoledronato (d), ibandronato, raloxifene, bazedoxifene", ""]
  ]]
];
const N79_NOTE = [
  ["a", "Il passaggio dalla I scelta alle successive richiede intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni al farmaco della classe precedente o, per teriparatide e abaloparatide, la fine del periodo massimo di trattamento. Da valutare il cambio di terapia anche per una frattura vertebrale o di femore dopo almeno un anno di trattamento con i farmaci della classe precedente."],
  ["b", "La frattura vertebrale si diagnostica con il criterio di Genant (riduzione di almeno il 20% di un'altezza vertebrale); per il romosozumab contano in modo diverso le fratture lievi e quelle moderate o gravi."],
  ["c", "La densitometria deve essere DXA lombare e/o femorale, eseguita in strutture pubbliche o convenzionate con il SSN."],
  ["d", "Lo zoledronato è prescrivibile e somministrabile solo in strutture ospedaliere pubbliche o convenzionate."],
  ["e", "Il denosumab è prescrivibile anche dal medico di medicina generale (ricetta ripetibile, RR)."],
  ["f", "Romosozumab: solo donne, su diagnosi e piano terapeutico di centri ospedalieri o specialisti (internista, reumatologo, endocrinologo, ginecologo, geriatra, ortopedico, fisiatra, nefrologo), per al massimo 12 mesi, non rinnovabile."],
  ["g", "Teriparatide: su diagnosi e piano terapeutico specialistico di 6 mesi, rinnovabile per altri 6 mesi non più di tre volte (24 mesi in tutto)."],
  ["h", "Abaloparatide: su diagnosi e piano terapeutico specialistico di 6 mesi, rinnovabile per altri 6 mesi non più di due volte (18 mesi in tutto)."]
];
const NOTA79_HTML = `
    <p class="note">La Nota 79 limita la prescrizione a carico del SSN dei farmaci per l'osteoporosi alle condizioni qui sotto. Per ogni condizione: <b>I scelta</b>, poi <b>II</b> e <b>III</b> solo nei casi della nota (a). Le lettere rimandano alle note in fondo.</p>
    ${N79_GUIDA.map(([sez, rows]) => `<p class="lbl">${sez}</p><div class="n79g">${rows.map(([c, i1, i2, i3]) => `<div class="n79r"><p class="n79c">${c}</p><dl>${[["I scelta", i1], ["II scelta", i2], ["III scelta", i3]].filter(x => x[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div>`).join("")}</div>`).join("")}
    <p class="lbl">Note</p>
    <ul class="list n79n">${N79_NOTE.map(([k, t]) => `<li><i>${k}</i><span>${t}</span></li>`).join("")}</ul>
    <div class="alert info"><b>Prima di iniziare</b>In tutte le indicazioni è raccomandato un adeguato apporto di calcio e vitamina D (vedi la pagina sulla Nota 96), attività fisica, sospensione del fumo e prevenzione delle cadute; prima di trattare vanno escluse le forme secondarie.</div>
    <p class="small">Fonte: Nota AIFA 79, allegato alla determina del Presidente AIFA n. 1127 dell'8 settembre 2025. Nella scheda di ogni paziente, in «Decidi la terapia», l'app indica per ciascun farmaco la condizione e il livello di scelta. Verifica sempre il testo vigente.</p>`;
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
    <p class="note">Il risultato cade in una di <b>quattro zone</b>, con soglie che salgono con l'età: <b>verde</b> (basso rischio) solo vitamina D, calcio e stile di vita; <b>gialla</b> (rischio moderato) terapia antiriassorbitiva (bisfosfonati orali o denosumab) senza necessità di intervento specialistico; <b>arancione</b> (alto) e <b>rossa</b> (altissimo) invio allo specialista: terapia anabolica o con romosozumab, prescrivibili dallo specialista su piano terapeutico. La stima del rischio aiuta così sia a scegliere la terapia più appropriata sia a decidere chi deve prescriverla.</p>
    <p class="note">Servono: età, sesso, peso, altezza, fratture da fragilità (sede, numero), familiarità per frattura di femore o vertebre, fumo, alcol, glucocorticoidi, malattie (artrite reumatoide e connettiviti, diabete, BPCO, MICI, HIV, Parkinson, sclerosi multipla, grave disabilità motoria), terapia ormonale adiuvante, T-score di colonna e femore.</p>
    <p class="note">La <b>Nota 79</b> stabilisce quando i farmaci sono a carico del SSN: in prevenzione secondaria (fratture vertebrali o di femore; altre fratture con T-score ≤ −3) e in prevenzione primaria (glucocorticoidi ≥5 mg/die per più di 3 mesi, blocco ormonale adiuvante, T-score ≤ −4, oppure ≤ −3 con familiarità o comorbilità). Il rischio a 10 anni ≥ 20% calcolato con un calcolatore validato entra nei criteri del romosozumab (per la donna in zona arancione o rossa). Fumo e alcol, in quanto modificabili, non contano ai fini della rimborsabilità.</p>
    <p class="note">Il passaggio dalla I alla II scelta richiede intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni; una nuova frattura dopo almeno un anno di terapia giustifica un cambio di classe. Zoledronato solo in strutture ospedaliere; denosumab prescrivibile dal MMG; teriparatide, abaloparatide e romosozumab su piano terapeutico specialistico.</p>
    <p class="note"><a href="#guida-nota79">Tutte le condizioni della Nota 79, con I, II e III scelta</a></p>
    <div class="btns"><a class="btn" href="${DEFRA_URL}" target="_blank" rel="noopener">Apri il DeFRA ↗</a></div>` },
  { k:"base", t:"Calcio, vitamina D e stile di vita", s:"Per tutti, prima e durante la terapia", html:`
    <ul class="list"><li><i>1</i><span><b>Calcio</b>: 1000–1200 mg al giorno, possibilmente con la dieta (latte, yogurt, formaggi, acque ricche di calcio); integratore solo per la quota mancante.</span></li>
    <li><i>2</i><span><b>Vitamina D</b>: correggere la carenza prima di iniziare un farmaco (la carenza ne riduce l'efficacia e favorisce l'ipocalcemia). Nel candidato alla terapia per l'osteoporosi si dosa la 25-OH-vitamina D: sotto 75 nmol/L (30 ng/mL) è rimborsabile e va corretta prima di iniziare il farmaco (Nota 96; vedi la pagina sulla Nota 96). Secondo le linee guida SIOMMMS (Adami et al., Reumatismo 2011;63:129-147) si parla di carenza sotto 50 nmol/L, insufficienza tra 50 e 75, eccesso sopra 250 e intossicazione sopra 375 nmol/L (150 ng/mL); nei pazienti con malattie granulomatose o iperparatiroidismo primitivo l'integrazione va fatta con cautela, controllando periodicamente la 25(OH)D.</span></li>
    <li><i>3</i><span><b>Attività fisica</b> regolare, con esercizi di carico e di equilibrio.</span></li>
    <li><i>4</i><span><b>Cadute</b>: vista, farmaci sedativi e ipotensivi, casa sicura, calzature.</span></li>
    <li><i>5</i><span><b>Fumo</b> da sospendere, <b>alcol</b> sotto le 3 unità al giorno, peso adeguato.</span></li>
    <li><i>6</i><span><b>Bocca</b>: visita odontoiatrica e igiene orale prima di bisfosfonati, denosumab, romosozumab.</span></li></ul>` },
  { k:"dxa-lea", t:"A chi fare la densitometria in LEA", s:"Criteri di accesso alla DXA a carico del SSN", html: LEA_DXA_HTML },
  { k:"nota79", t:"Nota 79", s:"Quando i farmaci per l'osteoporosi sono a carico del SSN", html: NOTA79_HTML },
  { k:"nota96", t:"Vitamina D e Nota 96", s:"Quando dosarla, quando è rimborsabile, come correggerla", html: NOTA96_HTML },
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
  if(route === "archivio") return vArchivio();
  if(route.startsWith("guida-")) return vGuidaTopic(route.slice(6));
  if(route.startsWith("farmaco-")) return vFarmaco(route.slice(8));
  const m = /^paz-([a-z0-9]+)(?:-([a-z]+))?$/.exec(route); if(!m) return null;
  const p = pzGet(m[1]); if(!p) return { redirect:"" };
  if(!m[2] || m[2] === "percorso") return { redirect: "paz-" + p.id + "-figura" };
  if(m[2] === "figura") return vFigura(p);
  /* i passi del vecchio percorso: si apre la stessa sezione sulla figura */
  const SH = { dati:"chi", fratture:"fx", anamnesi:"anam", esami:"esami", dxa:"dxa", defra:"defra", storico:"storico" }[m[2]];
  if(SH){ FIG.anim = FIG.open !== SH; FIG.open = SH; setTimeout(() => { FIG.anim = false; }); return { redirect: "paz-" + p.id + "-figura" }; }
  if(m[2] === "decidi"){ if(figWide()){ FIG.anim = false; FIG.open = "decidi"; return { redirect: "paz-" + p.id + "-figura" }; } return vDecidi(p); }
  const V = { "":vPaz, dati:vPazDati, fratture:vPazDati, anamnesi:vPazAnamnesi, esami:vPazEsami, dxa:vPazDxa, defra:vPazDefra, terapia:vPazTerapia, storico:vPazStorico, report:vPazReport, lettera:vPazLettera, foglio:vPazFoglio }[m[2] || ""];
  return V ? V(p) : { redirect:"paz-" + p.id };
}
const pzParent = r => /^paz-[a-z0-9]+-(figura|percorso)$/.test(r) ? "" : /^paz-[a-z0-9]+-/.test(r) ? r.replace(/-[a-z]+$/, "") : r.startsWith("paz-") ? "" : r.startsWith("guida-") || r.startsWith("farmaco-") ? "guida" : null;

/* aggiornamento delle parti che dipendono dai dati, senza ridisegnare i campi */
const PZ_LIVE = {
  stepper: p => { const m = /-([a-z]+)$/.exec(routeNow()); return m && STEP_IX[m[1]] !== undefined ? stepperInner(p, m[1]) : ""; },
  cacorr: caLine,
  sec: p => secReport(p, pzSecondary(p)), amuta: anamMutaHTML, anov: anamNovHTML, lab: p => labReport(p, pzSecondary(p)),
  bmi: p => bmiTxt(pzFacts(p))
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
  if(e.target.id === "pzQ"){ const q = e.target.value.trim().toLowerCase(); let n = 0; document.querySelectorAll("#pzList .pitem").forEach(a => { a.hidden = q && !a.dataset.q.includes(q); if(!a.hidden) n++; }); const nn = $("#pzNone"); if(nn) nn.hidden = n > 0; }
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
document.addEventListener("toggle", e => { const d = e.target; if(d.matches && d.matches("details.pzax")){ const i = d.dataset.pax; d.open ? pzOpenAx.add(i) : pzOpenAx.delete(i); } }, true);
document.addEventListener("click", e => {
  const t = e.target;
  if(t.closest("#pzExport, #pzExport2")){ doExport(); return; }
  if(t.closest("#pzLockSet")){ setPin(); return; }
  if(t.closest("#pzLockOff")){ removePin(); return; }
  if(t.closest("#pzLockNow")){ showLock(); return; }
  if(t.closest("#lockForgot")){ if(confirm("Senza il codice l'unico modo per riaprire l'app è cancellare l'archivio di questo browser (potrai poi ripristinare un backup). Cancellare tutto?")){ try{ localStorage.removeItem(PZ_KEY); localStorage.removeItem(PIN_KEY); }catch(e){} location.hash = ""; location.reload(); } return; }
  const sc = t.closest("[data-scroll]"); if(sc){ const el = $(sc.dataset.scroll); if(el){ el.scrollIntoView({ behavior:"smooth", block:"center" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } return; }
  const pdel = t.closest("[data-pzdel]");
  if(pdel){ const q = PZ.find(x => String(x.id) === pdel.dataset.pzdel); if(q && confirm("Eliminare questo paziente senza nome e i dati inseriti?")){ PZ.splice(PZ.indexOf(q), 1); savePz(); render(); } return; }
  if(t.closest("#pzNew")){ const p = pzBlank(); PZ.push(p); savePz(); go("paz-" + p.id + "-figura"); return; }
  if(t.closest("#pzPrint")){ window.print(); return; }
  if(t.closest("#qReset")){ const { p } = pzRoute(); if(p){ p.quesito = ""; savePz(p); render(); } return; }
  const zb = t.closest(".zbtn"); if(zb){ document.querySelectorAll(".zbtn").forEach(x => x.setAttribute("aria-pressed", x === zb)); return; }
  const vu = t.closest("[data-vdu]");
  if(vu){ VD_U = vu.dataset.vdu; try{ localStorage.setItem("oh-mmg-vitd-unit", VD_U); }catch(e){} render(); return; }
  const sg = t.closest(".sgn[data-sgn]");
  if(sg){ const neg = sg.getAttribute("aria-pressed") !== "true"; sg.setAttribute("aria-pressed", neg); sg.textContent = neg ? "−" : "+"; sg.setAttribute("aria-label", "Segno del T-score: " + (neg ? "meno (tocca per più)" : "più (tocca per meno)")); return; }
  const tmp = t.closest(".ck[data-tmp]"); if(tmp){ tmp.setAttribute("aria-pressed", tmp.getAttribute("aria-pressed") !== "true"); return; }
  const lc = t.closest(".ck[data-lea]");
  if(lc){ lc.setAttribute("aria-pressed", lc.getAttribute("aria-pressed") !== "true"); leaUpdate(); return; }
  const lx = t.closest("[data-leasx]");
  if(lx){ document.querySelectorAll("[data-leasx]").forEach(b => b.setAttribute("aria-pressed", b === lx)); document.querySelectorAll("[data-leamin]").forEach(g => { g.hidden = g.dataset.leamin !== lx.dataset.leasx; }); leaUpdate(); return; }
  const { p } = pzRoute(); if(!p) return;
  if(t.closest("#pzDel")){ if(confirm("Eliminare " + pzName(p) + " e tutti i suoi dati?")){ PZ.splice(PZ.indexOf(p), 1); savePz(); history.replaceState(null, "", location.pathname + location.search); stack.length = 0; stack.push(""); render(); } return; }
  const s = t.closest("[data-pset]");
  if(s){ const k = s.dataset.pset, v = s.dataset.val === "true" ? true : s.dataset.val === "false" ? false : s.dataset.val; p[k] = p[k] === v ? null : v; savePz(p); render(); return; }
  const b = t.closest(".ck[data-pbool]");
  if(b){ const k = b.dataset.pbool; p[k] = !p[k]; b.setAttribute("aria-pressed", p[k]); pzaxBadge(b); if(k === "disab"){ p.anamOk = true; p.anamMuta = false; delete p.anamPrev; } savePz(p); pzLive(p); return; }
  const c = t.closest(".ck[data-pci]");
  if(c){ p.ci = p.ci || {}; const k = c.dataset.pci; p.ci[k] = !p.ci[k]; c.setAttribute("aria-pressed", p.ci[k]); pzaxBadge(c); p.anamOk = true; p.anamMuta = false; delete p.anamPrev; savePz(p); pzLive(p); return; }
  const f = t.closest(".ck[data-pfeat]");
  if(f){ const id = f.dataset.pfeat, set = new Set(p.feats || []); set.has(id) ? set.delete(id) : set.add(id); p.feats = [...set]; f.setAttribute("aria-pressed", set.has(id));
    pzaxBadge(f);
    p.anamOk = true; p.anamMuta = false; delete p.anamPrev; savePz(p); pzLive(p); return; }
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
    p.feats = [...set];
    /* prednisone o deltacortene con dose e durata scritte nel testo: «5 mg/die da 2 anni» */
    let gcMsg = "";
    if(set.has("glucocorticoidi") && !gcDurOf(p)){
      const ln = (p.testoGest || "").split(/\n/).find(l => /predniso(?!lon)|deltacortene/i.test(l));
      if(ln){ const mg = /(\d+(?:[.,]\d+)?)\s*mg/i.exec(ln), an = /da\s+(\d+|un|uno|due|tre)\s+ann/i.exec(ln), me = /da\s+(\d+)\s+mes/i.exec(ln);
        const dose = mg ? parseFloat(mg[1].replace(",", ".")) : null, mesi = an ? 12 * ({ un:1, uno:1, due:2, tre:3 }[an[1].toLowerCase()] || +an[1]) : me ? +me[1] : null;
        if(dose !== null && mesi !== null){ p.gcDur = dose < 5 ? "0" : mesi > 12 ? "12" : mesi > 3 ? "3" : "0"; p.gcMesi12 = p.gcDur === "12";
          gcMsg = " Prednisone " + fmtN(dose) + " mg da " + mesi + " mesi: " + (p.gcDur === "12" ? "oltre 12 mesi" : p.gcDur === "3" ? "oltre 3 mesi" : "sotto la soglia della Nota 79") + ", controlla."; } } }
    p.anamOk = true; p.anamMuta = false; delete p.anamPrev; savePz(p); render(); toast(plural(keys.length, "voce aggiunta", "voci aggiunte") + ": controlla le voci." + gcMsg); return;
  }
  if(t.closest("[data-amuta]")){
    if(p.anamOk && p.anamMuta){ const pr = p.anamPrev; p.anamMuta = false;
      if(pr){ p.feats = pr.feats || []; p.ci = Object.assign({}, pr.ci || {}, { denti: (p.ci || {}).denti }); p.disab = !!pr.disab; delete p.anamPrev; }
      p.anamOk = anamHas(p) || !!p.disab; savePz(p); render(); if(pr) toast("Ripristinate le voci selezionate prima."); return; }
    const ci = Object.assign({}, p.ci || {}); delete ci.denti;
    if(anamHas(p) || p.disab) p.anamPrev = { feats: (p.feats || []).slice(), ci, disab: !!p.disab };
    p.feats = []; p.ci = { denti: (p.ci || {}).denti }; p.disab = false; p.anamOk = true; p.anamMuta = true;
    savePz(p); render(); toast(p.anamPrev ? "Anamnesi muta: le altre voci sono state tolte (deselezionala per riaverle)." : "Anamnesi muta."); return; }
  if(t.closest("[data-anov]")){ p.anamOk = true; savePz(p); render(); toast("Anamnesi confermata."); return; }
  const gd = t.closest("[data-gcdur]");
  if(gd){ p.gcDur = gcDurOf(p) === gd.dataset.gcdur ? "" : gd.dataset.gcdur; p.gcMesi12 = p.gcDur === "12"; savePz(p); render(); return; }
  const dn = t.closest("[data-dent]");
  if(dn){ p.ci = p.ci || {}; const cur = p.dentista ? "ok" : p.ci.denti ? "fare" : "", v = cur === dn.dataset.dent ? "" : dn.dataset.dent; p.dentista = v === "ok"; p.ci.denti = v === "fare"; savePz(p); render(); return; }
  const dz = t.closest("[data-dose]");
  if(dz){ const th = p.terapie[+dz.dataset.dose], el = document.getElementById("dz" + dz.dataset.dose); if(th && el && el.value){ th.dosi = (th.dosi || []).concat(el.value).sort(); savePz(p); render(); toast("Dose registrata: prossima il " + fmtDt(nextDose(th)) + "."); } return; }
  const cp = t.closest("[data-copy]");
  if(cp){ cp.dataset.copy === "lettera" ? copyText(letterText(p), "Lettera copiata.") : copyText(pzText(p), "Riepilogo copiato: incollalo nella cartella del paziente."); return; }
  if(t.closest("#labAllN")){ p.lab = p.lab || {}; let n = 0, vd = false;
    /* la vitamina D non si dà per normale senza il valore: va dosata o corretta comunque */
    PZ_EXAMS.forEach(e => { if(p.lab[e.id]) return; if(e.id === "D" && num(p.vitd) === null){ vd = true; return; } p.lab[e.id] = "norm"; n++; });
    savePz(p); render(); toast((n ? plural(n, "esame segnato", "esami segnati") + " nella norma." : "Tutti gli esami erano già indicati.") + (vd ? " La vitamina D resta da inserire con il valore." : "")); return; }
  const st = t.closest("[data-stop]");
  if(st){ const th = p.terapie[+st.dataset.stop]; if(th){ th.fine = todayISO(); savePz(p); render(); } return; }
  const ad = t.closest("[data-add]");
  if(ad){ addRec(p, ad.dataset.add, false); return; }
});
/* aggiunge frattura, DXA, DeFRA o terapia dal modulo aperto. auto = salvataggio da solo quando si chiude
   la scheda o si va avanti: in quel caso salva solo se nel modulo c'è qualcosa di compilato, senza avvisi */
function addRec(p, k, auto){
  const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const no = msg => { if(!auto) alert(msg); return false; };
  let rec = null, msg = "";
  if(k === "fratture"){ if(!document.getElementById("fxAnno")) return false;
    const an = +v("fxAnno"), me = v("fxMese"), gi = +v("fxGiorno"), oggi = new Date();
    if(auto && !an) return false;
    if(!an || an < 1930 || an > oggi.getFullYear()) return no("Indica almeno l'anno della frattura.");
    if(gi && !me) return no("Per indicare il giorno scegli anche il mese.");
    const dd = an + (me ? "-" + me + (gi ? "-" + String(gi).padStart(2, "0") : "") : "");
    const chk = pDate(dd); if(gi && (gi > 31 || chk.getMonth() !== +me - 1)) return no("Il giorno non esiste in quel mese.");
    if(me && pDate(an + "-" + me) > oggi) return no("La data è nel futuro.");
    const it = document.querySelector('.ck[data-tmp="fxInT"]');
    rec = { sede: v("fxSede"), data: dd, grado: v("fxSede") === "vertebra" ? v("fxGrado") : "", inTerapia: !!it && it.getAttribute("aria-pressed") === "true" };
    p.fratture.push(rec); p.nessunaFx = false; if(p.rival) p.fxRiv = true; msg = "Frattura aggiunta: " + (FX_SEDI[rec.sede] || rec.sede) + " · " + fmtD(dd); }
  if(k === "dxa"){ if(!document.getElementById("dxD")) return false;
    const any = [v("dxL"), v("dxFt"), v("dxFn")].some(x => num(x) !== null);
    if(auto && !any) return false;
    if(!v("dxD") || !any) return no("Indica la data e almeno un T-score.");
    /* il segno viene dal pulsante −/+ (già su «−»); un «-» o «−» scritto a mano vale comunque come negativo */
    const T = id => { const raw = v(id).replace("−", "-"), n = num(raw); if(n === null) return ""; const sg = document.querySelector(`[data-sgn="${id}"]`), neg = /^\s*-/.test(raw) || (sg && sg.getAttribute("aria-pressed") === "true"); return String(neg ? -Math.abs(n) : Math.abs(n)); };
    rec = { data: v("dxD"), tL: T("dxL"), tFt: T("dxFt"), tFn: T("dxFn") }; p.dxa.push(rec); msg = "Densitometria del " + fmtD(rec.data) + " salvata"; }
  if(k === "defra"){ const zb = document.querySelector('.zbtn[aria-pressed="true"]');
    if(auto && !zb) return false;
    if(!zb || !v("dfD")) return no("Scegli la zona indicata dal DeFRA e la data.");
    rec = { data: v("dfD"), zona: zb.dataset.zona, rischio: num(v("dfR")) === null ? "" : String(num(v("dfR"))), note: v("dfN") }; p.defra.push(rec);
    msg = "DeFRA salvato: zona " + ZONE[rec.zona].t.toLowerCase() + (rec.rischio ? ", " + rec.rischio + "%" : ""); }
  if(k === "terapie"){ if(auto) return false; if(!v("thI")) return no("Indica la data di inizio."); rec = { farmaco: v("thF"), inizio: v("thI"), fine:"", note: v("thN") }; p.terapie.push(rec); msg = dnome(rec.farmaco) + " aggiunto"; }
  if(!rec) return false;
  savePz(p);
  if(auto){ toast(msg); return true; }
  render(); toast(msg);
  /* la voce appena aggiunta si illumina nell'elenco */
  const el = document.querySelector(`[data-del="${k}:${p[k].indexOf(rec)}"]`), li = el && el.closest("li");
  if(li){ li.scrollIntoView({ block:"nearest", behavior:"smooth" }); li.classList.add("flash"); }
  return true;
}
/* conteggio dei fattori di rischio per la DXA in LEA */
function leaUpdate(){
  const out = document.getElementById("leaOut"); if(!out) return;
  const mag = document.querySelectorAll('.ck[data-lea="mag"][aria-pressed="true"]').length;
  const g = document.querySelector("[data-leamin]:not([hidden])"), min = g ? g.querySelectorAll('.ck[aria-pressed="true"]').length : 0;
  const ok = mag > 0 || min >= 3;
  out.className = "alert " + (ok ? "ok" : "info");
  out.innerHTML = ok ? `<b>Rientra nei LEA</b>${mag ? plural(mag, "fattore maggiore", "fattori maggiori") : ""}${mag && min ? " e " : ""}${min ? plural(min, "fattore minore", "fattori minori") : ""}.${mag && min < 3 ? " Se l'unico fattore maggiore è chemio o radioterapia in età pediatrica, servono anche 3 fattori minori." : ""}`
    : `<b>${mag + min ? "Non ancora" : "Spunta i fattori presenti"}</b>${min ? plural(min, "fattore minore", "fattori minori") + ": ne servono almeno tre, oppure un fattore maggiore." : "Con almeno un fattore maggiore, o tre minori, la DXA rientra nei LEA."}`;
}
/* moduli lasciati a metà: si salvano da soli quando si chiude la scheda, si cambia sezione o si lascia la pagina */
function commitPending(p){ if(!p) return false; let n = false; ["fratture", "dxa", "defra"].forEach(k => { if(addRec(p, k, true)) n = true; }); return n; }

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
  const m = /^paz-([a-z0-9]+)(-[a-z]+)?$/.exec(route), back = m ? (m[2] && m[2] !== "-figura" && m[2] !== "-percorso" ? "paz-" + m[1] : "") : null;
  const sk = m && m[2] ? m[2].slice(1) : null, isStep = false, pp = m ? pzGet(m[1]) : null;
  const top = isStep && pp ? `<div class="stepper noprint" data-live="stepper">${stepperInner(pp, sk)}</div>` : "";
  const nav = isStep && pp ? stepNav(pp, sk) : "";
  const fsb = document.querySelector(".fsheet-b"), fsTop = fsb ? fsb.scrollTop : 0;
  $("#main").innerHTML = `<div class="screen">${top}${v.html}${nav}</div>`;
  if(!changed){ const nb = document.querySelector(".fsheet-b"); if(nb) nb.scrollTop = fsTop; }
  document.body.classList.toggle("fopen", !!document.querySelector(".fsheet"));
  document.body.classList.toggle("figv", !!document.querySelector(".fgrid"));
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
  { const m = /^paz-([a-z0-9]+)/.exec(current || ""); if(m) commitPending(pzGet(m[1])); }
  FIG.open = null;
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
