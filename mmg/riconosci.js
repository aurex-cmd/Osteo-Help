/* ============================================================
   OSTEO HELP MMG — riconoscimento del testo copiato dal gestionale
   Dal riassunto di patologie e farmaci propone le voci dell'anamnesi:
   principi attivi e nomi commerciali, sinonimi e abbreviazioni, parole
   scritte in modo un po' diverso (errori di battitura, plurali, desinenze).
   Tutto avviene nel browser: il testo non viene inviato a nessuno.
   ============================================================ */

/* ogni voce: [tipo, id, termini, opzioni]
   tipo: "f" voce dell'anamnesi (motore di Osteo Help), "c" controindicazione da conoscere
   termini: parole o frasi; «*» in fondo = qualunque desinenza; tutte in minuscolo e senza accenti
   opzioni: v = da verificare (proposta non spuntata), n = nota mostrata al medico */
const RIC_DIZ = [
  /* ---------- farmaci ---------- */
  ["f", "glucocorticoidi", ["prednison*", "deltacortene", "prednisolon*", "metilprednisolon*", "medrol", "urbason", "solumedrol", "solu medrol", "desametason*", "decadron", "soldesam", "betametason*", "bentelan", "celestone", "idrocortison*", "cortone", "deflazacort", "flantadin", "cortisonic*", "terapia cortisonica", "glucocorticoid*", "corticosteroid* sistemic*", "steroid* sistemic*"], { n:"Per il DeFRA conta la dose (prednisone ≥5 mg/die o equivalenti) e la durata." }],
  ["f", "aromatasi", ["letrozol*", "femara", "anastrozol*", "arimidex", "exemestan*", "aromasin", "inibitor* aromatasi", "inibitor* dell aromatasi"]],
  ["f", "adt", ["bicalutamide", "casodex", "abirateron*", "zytiga", "enzalutamide", "xtandi", "apalutamide", "erleada", "darolutamide", "nubeqa", "degarelix", "firmagon", "deprivazione androgenica", "blocco androgenico", "terapia antiandrogenica", "ormonoterapia prostat*"]],
  ["f", "gnrh_o_adt", ["leuprorelin*", "leuprolide", "enantone", "eligard", "triptorelin*", "decapeptyl", "goserelin*", "zoladex"]],
  ["f", "chemio", ["chemioterap*", "ciclofosfamide", "polichemioterap*"]],
  ["f", "mtx", ["metotrexat*", "methotrexat*", "reumaflex", "metoject"], { v:1, n:"La voce riguarda il metotrexato ad alte dosi (oncologia): alle dosi settimanali dell'artrite di solito non va spuntata." }],
  ["f", "dmpa", ["medrossiprogesteron*", "depo provera", "depoprovera"]],
  ["f", "tiroxina_soppr", ["levotiroxina", "eutirox", "tirosint", "syntroid", "l tiroxina", "tiroxina"], { v:1, n:"Spunta solo se la dose è TSH-soppressiva (TSH sotto la norma)." }],
  ["f", "glitazoni", ["pioglitazon*", "actos", "glustin", "rosiglitazon*", "glitazon*", "tiazolidinedion*"]],
  ["f", "sglt2", ["*gliflozin*", "forxiga", "jardiance", "invokana", "steglatro", "xigduo", "synjardy", "vokanamet", "glyxambi", "qtern"]],
  ["f", "anticonvulsivanti", ["carbamazepin*", "tegretol", "fenitoin*", "dintoina", "fenobarbital*", "gardenale", "luminale", "acido valproico", "valproato", "depakin", "depakine", "oxcarbazepin*", "tolep", "levetiracetam", "keppra", "lamotrigin*", "lamictal", "topiramat*", "topamax", "primidone", "mysoline", "lacosamide", "vimpat", "zonisamide", "antiepilettic*"]],
  ["f", "ssri", ["sertralin*", "zoloft", "tatig", "paroxetin*", "sereupin", "daparox", "seroxat", "eutimil", "fluoxetin*", "prozac", "fluoxeren", "citalopram", "elopram", "seropram", "escitalopram", "cipralex", "entact", "fluvoxamin*", "fevarin", "ssri"]],
  ["f", "oppioidi", ["morfin*", "ossicodon*", "oxycontin", "targin", "depalgos", "tapentadol*", "palexia", "fentanil*", "fentanyl", "durogesic", "buprenorfin*", "transtec", "tramadol*", "contramal", "codeina", "tachidol", "co efferalgan", "idromorfon*", "jurnista", "metadone", "oppioid*"], { n:"Conta l'uso cronico." }],
  ["f", "eparina", ["eparin*", "enoxaparin*", "clexane", "inhixa", "nadroparin*", "fraxiparina", "fondaparinux", "arixtra", "warfarin*", "coumadin", "acenocumarol*", "sintrom", "apixaban", "eliquis", "rivaroxaban", "xarelto", "dabigatran", "pradaxa", "edoxaban", "lixiana", "anticoagul*", "tao", "nao", "doac", "dicumarolic*"]],
  ["f", "diuretici_ansa", ["furosemid*", "lasix", "torasemid*", "diuresix", "diuretic* dell ansa", "diuretico ansa"]],
  ["f", "ipp", ["omeprazol*", "mepral", "antra", "losec", "pantoprazol*", "pantorc", "peptazol", "pantopan", "lansoprazol*", "lansox", "limpidex", "zoton", "esomeprazol*", "nexium", "lucen", "esopral", "axagon", "rabeprazol*", "pariet", "inibitor* di pompa", "inibitor* pompa protonica", "ipp"]],
  ["f", "ciclosporina", ["ciclosporin*", "sandimmun", "neoral", "tacrolimus", "prograf", "advagraf", "envarsus"]],
  ["f", "tenofovir", ["tenofovir*", "viread", "truvada", "atripla", "eviplera", "stribild"], { v:1, n:"Conta il tenofovir disoproxil (TDF); il tenofovir alafenamide (TAF) ha un effetto molto minore." }],
  /* farmaci che suggeriscono una malattia */
  ["f", "diabete_t2", ["metformin*", "glucophage", "metforal", "metbay", "sitagliptin*", "januvia", "janumet", "vildagliptin*", "galvus", "linagliptin*", "trajenta", "gliclazid*", "diamicron", "glimepirid*", "amaryl", "repaglinide", "novonorm", "semaglutide", "ozempic", "rybelsus", "dulaglutide", "trulicity", "liraglutide", "victoza"], { v:1, n:"Dedotto da un farmaco antidiabetico: verifica la diagnosi." }],
  ["f", "parkinson", ["levodopa", "madopar", "sinemet", "stalevo", "pramipexol*", "mirapexin", "ropinirol*", "requip", "rasagilin*", "azilect", "safinamide", "xadago"], { v:1, n:"Dedotto da un farmaco antiparkinson: verifica la diagnosi." }],

  /* ---------- malattie ---------- */
  ["f", "diabete_t1", ["diabete mellito tipo 1", "diabete tipo 1", "diabete mellito tipo i", "diabete tipo i", "diabete mellito di tipo 1", "diabete di tipo 1", "dm1", "dmt1", "iddm", "diabete insulino dipendente", "diabete giovanile"]],
  ["f", "diabete_t2", ["diabete mellito tipo 2", "diabete tipo 2", "diabete mellito tipo ii", "diabete tipo ii", "diabete mellito di tipo 2", "diabete di tipo 2", "dm2", "dmt2", "niddm", "diabete non insulino dipendente", "diabete mellito non insulino dipendente"]],
  ["f", "diabete_tipo", ["diabete", "diabetic*", "diabete mellito"], { v:1, n:"Tipo di diabete non indicato: scegli tipo 1 o tipo 2." }],
  ["f", "obesita", ["obesit*", "obeso", "obesa", "grande obesit*"]],
  ["f", "ipopituitarismo", ["ipopituitarismo", "panipopituitarismo", "deficit ipofisari*", "insufficienza ipofisaria", "deficit di gh", "deficit gh"]],
  ["f", "incidentaloma_surr", ["incidentaloma surrenal*", "adenoma surrenal*", "nodulo surrenal*", "massa surrenal*"]],
  ["f", "artrite_reumatoide", ["artrite reumatoide", "poliartrite reumatoide", "ar"]],
  ["f", "spondilite", ["spondilite anchilosante", "spondiloartrit*", "spondilite", "morbo di bechterew", "bechterew"]],
  ["f", "les", ["lupus eritematoso sistemico", "lupus", "les"]],
  ["f", "artrite_psoriasica", ["artrite psoriasica", "artropatia psoriasica", "psoriasi artropatica"]],
  ["f", "sclerodermia", ["sclerodermia", "sclerosi sistemica"]],
  ["f", "mici", ["morbo di crohn", "malattia di crohn", "crohn", "rettocolite ulcerosa", "colite ulcerosa", "rcu", "mici", "malattia infiammatoria cronica intestinale"]],
  ["f", "celiachia_nota", ["celiachia", "morbo celiaco", "malattia celiaca", "enteropatia da glutine"]],
  ["f", "whipple", ["malattia di whipple", "whipple"]],
  ["f", "epatopatia", ["cirrosi", "epatopatia cronica", "epatopatia", "epatite cronica", "hcv", "hbv", "epatite c", "epatite b cronica", "colangite biliare", "cirrosi biliare"]],
  ["f", "ictus_emiplegia", ["ictus", "stroke", "emiplegia", "emiparesi", "ischemia cerebrale", "infarto cerebrale", "emorragia cerebrale", "vasculopatia cerebrale ischemica"]],
  ["f", "lesione_midollare", ["lesione midollare", "paraplegia", "paraplegic*", "tetraplegia", "tetraplegic*", "mielolesione"]],
  ["f", "parkinson", ["morbo di parkinson", "malattia di parkinson", "parkinson", "parkinsonismo"]],
  ["f", "sclerosi_multipla", ["sclerosi multipla"]],
  ["f", "epilessia", ["epilessia", "epilettic*", "crisi comiziali", "comiziale"]],
  ["f", "hiv", ["hiv", "aids", "infezione da hiv"]],
  ["f", "bpco", ["bpco", "broncopneumopatia cronica ostruttiva", "broncopneumopatia cronica", "copd", "enfisema"]],
  ["f", "fibrosi_cistica", ["fibrosi cistica", "mucoviscidosi"]],
  ["f", "emocromatosi", ["emocromatosi", "sovraccarico di ferro"]],
  /* storia clinica e abitudini */
  ["f", "menopausa_precoce", ["menopausa precoce", "insufficienza ovarica precoce", "menopausa chirurgica"], { v:1, n:"Conta se prima dei 45 anni." }],
  ["f", "ovariectomia", ["ovariectomia", "annessiectomia bilaterale", "ovariectomia bilaterale", "isteroannessiectomia"]],
  ["f", "bariatrica", ["chirurgia bariatrica", "bypass gastrico", "by pass gastrico", "sleeve gastrectomy", "sleeve gastrectomia", "gastrectomia verticale", "bendaggio gastrico", "diversione biliopancreatica"]],
  ["f", "gastrectomia", ["gastrectomia", "gastroresezione", "resezione gastrica"]],
  ["f", "trapianto", ["trapianto", "trapiantat*"]],
  ["f", "nefrolitiasi_ricorrente", ["nefrolitiasi", "calcolosi renale", "nefrocalcinosi", "coliche renali", "litiasi renale"], { v:1, n:"La voce riguarda la nefrolitiasi calcica ricorrente." }],
  ["f", "anoressia_dca", ["anoressia nervosa", "anoressia", "disturbo del comportamento alimentare", "dca", "bulimia"]],
  ["f", "alcol", ["etilismo", "alcolismo", "abuso alcolico", "abuso di alcol", "potus", "etilista"], { n:"Per il DeFRA conta da 3 unità al giorno." }],
  ["f", "fumo", ["tabagismo", "fumatore", "fumatrice", "fuma", "sigarette"]],
  ["f", "immobilizzazione", ["allettat*", "allettamento", "immobilizzazione", "costretto a letto", "costretta a letto"]],
  ["f", "calo_ponderale", ["calo ponderale", "dimagrimento"], { v:1, n:"Conta se oltre il 5% in 6–12 mesi." }],
  /* sintomi e segni */
  ["f", "astenia", ["astenia"]],
  ["f", "s_diarrea", ["diarrea cronica", "diarrea"], { v:1, n:"Conta se cronica." }],
  ["f", "cefalea", ["cefalea"]],
  ["f", "ginecomastia", ["ginecomastia"]],
  ["f", "galattorrea", ["galattorrea"]],
  ["f", "amenorrea", ["amenorrea", "oligomenorrea"]],
  ["f", "disf_erettile", ["disfunzione erettile", "deficit erettile", "impotenza"]],
  ["f", "m_libido", ["calo della libido", "riduzione della libido", "calo libido"]],
  ["f", "prurito", ["prurito"]],
  ["f", "orticaria_pigmentosa", ["orticaria pigmentosa", "mastocitosi"]],
  ["f", "condrocalcinosi", ["condrocalcinosi", "pseudogotta"]],
  ["f", "sarcopenia", ["sarcopenia"]],
  ["f", "ipoacusia", ["ipoacusia"], { v:1, n:"La voce riguarda l'ipoacusia precoce." }],

  /* ---------- controindicazioni da conoscere ---------- */
  ["c", "esofago", ["acalasia", "stenosi esofagea", "esofago di barrett", "barrett", "varici esofagee", "esofagite", "diverticolo esofageo"]],
  ["c", "reflusso", ["reflusso gastroesofageo", "reflusso gastro esofageo", "malattia da reflusso", "reflusso", "mrge", "gerd", "ernia iatale"]],
  ["c", "tev", ["trombosi venosa profonda", "tvp", "embolia polmonare", "tromboembolia polmonare", "tromboembolismo venoso", "tromboembolismo", "tep", "trombosi venosa"]],
  ["c", "cv", ["infarto miocardico", "infarto del miocardio", "pregresso infarto", "ima", "imaa", "nstemi", "stemi", "cardiopatia ischemica", "angina", "bypass aortocoronarico", "by pass aortocoronarico", "stent coronarico", "ptca", "sindrome coronarica", "ictus", "arteriopatia obliterante", "vasculopatia periferica"]],
  ["c", "rt", ["metastasi ossee", "metastasi osse*", "radioterapia", "secondarismi ossei"], { v:1, n:"Conta la radioterapia sullo scheletro e i tumori o metastasi ossee." }]
];

const RIC_STOP = new Set(["di", "del", "della", "dello", "dei", "degli", "delle", "da", "dal", "dalla", "a", "al", "alla", "e", "ed", "in", "con", "per", "il", "lo", "la", "i", "gli", "le", "un", "una", "uno", "mg", "cp", "cpr", "fl", "ui", "die", "mcg", "ml", "tipo"]);
const RIC_NEG = new Set(["no", "non", "nega", "negato", "negata", "negativo", "negativa", "negativi", "assenza", "assente", "esclus", "escluso", "esclusa", "ex", "sospes", "sospeso", "sospesa"]);
const ricNorm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`]/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
/* tipo 2 / tipo II: le cifre romane e arabe valgono uguale */
const ricTok = s => ricNorm(s).split(" ").filter(Boolean).map((t, i, a) => a[i - 1] === "tipo" && (t === "ii" || t === "i") ? (t === "ii" ? "2" : "1") : t);
function ricLev(a, b, max){
  if(Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for(let i = 1; i <= a.length; i++){
    const cur = [i]; let best = i;
    for(let j = 1; j <= b.length; j++){ cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); best = Math.min(best, cur[j]); }
    if(best > max) return max + 1; prev = cur;
  }
  return prev[b.length];
}
/* una parola del testo corrisponde a una parola del dizionario anche con piccoli errori */
function ricEq(t, k){
  if(k.startsWith("*")){ const core = k.replace(/\*/g, ""); return t.includes(core); }
  if(k.endsWith("*")){ const st = k.slice(0, -1); if(t.startsWith(st)) return true; return st.length >= 6 && t.length >= st.length && ricLev(t.slice(0, st.length), st, 1) <= 1; }
  if(t === k) return true;
  if(k.length < 6 || /\d/.test(k)) return false;   /* sigle, nomi commerciali corti e parole brevi: solo uguali */
  return ricLev(t, k, k.length >= 9 ? 2 : 1) <= (k.length >= 9 ? 2 : 1);
}
const RIC_TERMS = RIC_DIZ.flatMap(([tipo, id, terms, o]) => terms.map(t => ({ tipo, id, o: o || {}, toks: ricTok(t).filter(x => !RIC_STOP.has(x) || /^\d$/.test(x)), raw: t })))
  .sort((a, b) => b.toks.length - a.toks.length);   /* prima le frasi più lunghe */

/* analizza il testo: restituisce le voci trovate, con il frammento di testo e se sono negate */
function riconosci(text){
  const found = new Map();
  const segs = String(text || "").split(/[\n\r;•·|]+|,(?!\d)/).map(s => s.replace(/^[\s\-–—*•·>]+/, "").trim()).filter(Boolean);
  segs.forEach(seg => {
    const all = ricTok(seg), idx = [];   /* parole utili e loro posizione nella frase */
    all.forEach((t, i) => { if(!RIC_STOP.has(t) || /^\d$/.test(t)) idx.push(i); });
    const toks = idx.map(i => all[i]), used = new Array(toks.length).fill(false);
    RIC_TERMS.forEach(T => {
      const n = T.toks.length; if(!n) return;
      for(let s = 0; s + n <= toks.length; s++){
        if(used.slice(s, s + n).some(Boolean)) continue;
        let ok = true; for(let j = 0; j < n; j++) if(!ricEq(toks[s + j], T.toks[j])){ ok = false; break; }
        if(!ok) continue;
        /* «non insulino dipendente» non è tipo 1 */
        if(T.id === "diabete_t1" && all.slice(Math.max(0, idx[s] - 1), idx[s + n - 1] + 1).includes("non")) continue;
        for(let j = 0; j < n; j++) used[s + j] = true;
        const before = all.slice(Math.max(0, idx[s] - 3), idx[s]), neg = before.some(w => RIC_NEG.has(w) || w.startsWith("esclus") || w.startsWith("negativ"));
        const key = T.tipo + ":" + T.id, prev = found.get(key);
        if(!prev || (prev.neg && !neg)) found.set(key, { tipo:T.tipo, id:T.id, o:T.o, seg: seg.length > 70 ? seg.slice(0, 68) + "…" : seg, neg });
      }
    });
  });
  /* il diabete generico serve solo se il tipo non è indicato */
  if(found.has("f:diabete_tipo") && (found.has("f:diabete_t1") || (found.has("f:diabete_t2") && !found.get("f:diabete_t2").o.v))) found.delete("f:diabete_tipo");
  /* sleeve e bypass sono chirurgia bariatrica, non gastrectomia per altre cause */
  if(found.has("f:bariatrica") && found.has("f:gastrectomia") && /sleeve|verticale/.test(ricNorm(text))) found.delete("f:gastrectomia");
  return [...found.values()];
}
