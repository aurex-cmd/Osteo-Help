/* File generato da mmg/tools/aggiorna-dati.py: NON modificare a mano.
   Dati clinici e motori copiati senza modifiche da Osteo Help (index.html, sha256 562b18a7f1ad). */
/* ============================================================
   DATI CLINICI — copiati senza modifiche dall'Osteo Help originale
   ============================================================ */
// --- Esami alterati ---

const COND = {
  iperpara:"Iperparatiroidismo primario", mieloma:"Mieloma multiplo", mgus:"MGUS", talassemia:"Talassemia",
  neoplasia:"Neoplasia / metastasi ossee", ipercalcemiaMaligna:"Ipercalcemia maligna (urgenza)", sarcoidosi:"Sarcoidosi / granulomatosi",
  ipertiroid:"Ipertiroidismo", intoxD:"Intossicazione da vitamina D", farmaciCa:"Farmaci che alzano il calcio (tiazidici, litio)",
  fhh:"Ipercalcemia ipocalciurica familiare", deficitD:"Carenza di vitamina D / osteomalacia",
  osteomalIpoP:"Osteomalacia ipofosfatemica (FGF23)", malassorb:"Malassorbimento (celiachia, IBD, chirurgia bariatrica)",
  ipopara:"Ipoparatiroidismo", irc:"Insufficienza renale cronica (CKD-MBD)", ipomagne:"Ipomagnesiemia",
  fanconi:"Tubulopatia (s. di Fanconi)", paget:"Malattia di Paget", colestasi:"Epatopatia colestatica",
  epatopatia:"Epatopatia cronica / cirrosi", nefrosica:"Sindrome nefrosica", ipofosfatasia:"Ipofosfatasia",
  ipotiroid:"Ipotiroidismo", malnutriz:"Malnutrizione (anche carenza di magnesio o zinco)",
  ipercalciuriaId:"Ipercalciuria idiopatica", acidosiTub:"Acidosi tubulare renale",
  immobiliz:"Immobilizzazione", flogosi:"Flogosi / malattia cronica", connettiv:"Connettivite o artrite infiammatoria",
  ridIntroito:"Ridotto introito di calcio", farmaciD:"Farmaci (anticonvulsivanti)"
};

const LAB2 = {
  iperpara:["PTH","Calciuria 24h","Localizzazione (se indicazione chirurgica): eco → scintigrafia sestamibi → PET-colina"],
  mieloma:["Immunofissazione siero/urine","Catene leggere libere (FLC)","β2-microglobulina","TC total body a basse dosi senza mezzo di contrasto (lesioni litiche)","Valutazione ematologica"],
  mgus:["Immunofissazione siero/urine","Catene leggere libere (FLC)","Emocromo, calcemia, creatinina (escludere i criteri di mieloma)","Valutazione ematologica (rischio di progressione e controlli)"],
  talassemia:["Elettroforesi dell'emoglobina","Assetto marziale (ferritina, saturazione della transferrina)","Analisi genetica alfa-globinica, se elettroforesi e ferro sono normali"],
  neoplasia:["Scintigrafia ossea o PET-TC","PTHrP (se ipercalcemia)","Elettroforesi e immunofissazione (mieloma)","Ricerca del tumore primitivo: mammella, prostata, polmone, rene, tiroide","Marcatori tumorali mirati (es. PSA nell'uomo)"],
  ipercalcemiaMaligna:["PTHrP","1,25(OH)₂-vitamina D (linfomi)","Elettroforesi, immunofissazione e catene leggere libere","TC torace-addome, per cercare la neoplasia"],
  sarcoidosi:["1,25(OH)₂-vit D","TC torace","Calciuria 24h","ACE sierico (bassa resa)"],
  ipertiroid:["FT4","FT3","TRAb / anti-TPO","Scintigrafia tiroidea (se TRAb negativi)"],
  intoxD:["25-OH-vitamina D molto elevata","Calciuria 24h","Anamnesi degli integratori (anche prodotti da banco o galenici)","Se le dosi assunte erano normali: 1,25(OH)₂-vitamina D e valutazione specialistica per un difetto di CYP24A1"],
  farmaciCa:["Revisione farmacologica","Litiemia","PTH"],
  fhh:["Clearance Ca/creatinina (CCCR)","PTH","Test genetico CASR"],
  deficitD:["25-OH-vitamina D","PTH","Magnesemia","Anti-transglutaminasi (tTG) + IgA totali","PTH di nuovo dopo aver corretto la vitamina D"],
  osteomalIpoP:["Fosfaturia (TmP/GFR)","FGF23","1,25(OH)₂-vitamina D","Farmaci: ferro carbossimaltosio endovena, tenofovir, adefovir","Se FGF23 alto senza causa: PET con analoghi della somatostatina (68Ga-DOTATATE o DOTATOC), per cercare il tumore"],
  malassorb:["Anti-transglutaminasi (tTG) + IgA totali","Calprotectina fecale","Elastasi fecale (insufficienza pancreatica)","EGDS/biopsia duodenale (se indicato)"],
  ipopara:["PTH","Magnesemia","Fosforo","Calciuria 24h"],
  irc:["PTH","Fosforo","25-OH-vit D","Esame urine / proteinuria","Ecografia renale"],
  ipomagne:["Magnesemia","Magnesuria (frazione escreta oltre il 2% con magnesio basso: perdita renale)","PTH (inappropriatamente basso)","Potassiemia","Revisione dei farmaci: inibitori di pompa protonica, diuretici, inibitori della calcineurina, cisplatino, anti-EGFR"],
  fanconi:["Fosfaturia (TmP/GFR)","Glicosuria normoglicemica","Aminoaciduria","EGA / bicarbonatemia","Catene leggere libere sieriche (mieloma)"],
  paget:["γGT o fosfatasi alcalina ossea, per escludere l'origine epatica","Scintigrafia ossea (estensione della malattia)","Rx mirata delle sedi che captano (conferma)","Calcemia e 25-OH-vitamina D prima di un eventuale bisfosfonato"],
  colestasi:["GGT","Fosfatasi alcalina frazionata (ossea o epatica)","Bilirubina","Anticorpi antimitocondrio (AMA)","Ecografia epatica"],
  epatopatia:["Transaminasi","GGT","Bilirubina","Ecografia epatica"],
  nefrosica:["Proteinuria 24h","Albuminemia","Esame urine"],
  ipofosfatasia:["PLP (vit B6) sierico","Fosfoetanolammina urinaria","Test genetico ALPL"],
  ipotiroid:["TSH","FT4","Anti-TPO"],
  malnutriz:["Albumina e prealbumina","Magnesemia","Zinco sierico","25-OH-vitamina D","Se la fosfatasi alcalina resta bassa senza malnutrizione: vitamina B6 (ipofosfatasia)"],
  ipercalciuriaId:["Calciuria 24h","PTH","Ca/creatinina urinario","Sodiuria 24h"],
  acidosiTub:["EGA venosa","pH urinario","Bicarbonatemia","Potassiemia","Citraturia 24h"],
  immobiliz:["Quadro clinico / anamnesi","Calciuria 24h","Calcemia e PTH (PTH soppresso)","Marcatori di turnover osseo (CTX, P1NP)"],
  flogosi:["PCR","Ricerca focolaio","Autoimmunità (se indicato)"],
  connettiv:["ANA / ENA","Anti-dsDNA","Complemento (C3/C4)","Fattore reumatoide e anti-CCP"],
  ridIntroito:["Anamnesi alimentare (calcio con la dieta: servono circa 1000–1200 mg al giorno)","Calciuria 24h","25-OH-vitamina D"],
  farmaciD:["Revisione farmacologica","25-OH-vit D"]
};

const FIRST_LEVEL = new Set(["Fosforo","Calciuria 24h","25-OH-vit D","25-OH-vitamina D"]);

/* Frequenza delle forme nella pratica (1 frequente, 2 meno frequente, 3 rara): ordina le forme compatibili,
   così la causa più probabile viene per prima (es. ipocalciuria isolata → ridotto introito di calcio) */
const FREQ = {
  ridIntroito:1, deficitD:1.1, iperpara:1, farmaciCa:1, ipertiroid:1, irc:1, ipercalciuriaId:1, flogosi:1, talassemia:1, immobiliz:1,
  malassorb:2, mgus:2, epatopatia:2, colestasi:2, ipotiroid:2, connettiv:2, farmaciD:2, ipomagne:2, malnutriz:2, neoplasia:2, mieloma:2, nefrosica:2, paget:2,
  fhh:3, sarcoidosi:3, intoxD:3, osteomalIpoP:3, fanconi:3, acidosiTub:3, ipopara:3, ipofosfatasia:3, ipercalcemiaMaligna:3
};
const byFreq = (a, b) => (FREQ[a.cid] || 2) - (FREQ[b.cid] || 2);

const exams = [
  { name:"VES", chip:"VES", screens:"Indice di flogosi", alts:[
    { id:"ves_up", dir:"up", tag:"VES ▲", name:"VES elevata",
      clues:"Dolore osseo, astenia, calo ponderale, febbricola",
      dx:["mieloma","mgus","neoplasia","flogosi","connettiv"] } ] },

  { name:"Emocromo", chip:"Hb", screens:"Anemia, sospetto ematologico", alts:[
    { id:"hb_down", dir:"down", tag:"Hb ▼", name:"Emoglobina ridotta",
      clues:"Astenia, pallore, dolore osseo",
      dx:["mieloma","neoplasia","malassorb","flogosi","talassemia"] },
    { id:"mcv_down", dir:"down", tag:"MCV ▼", name:"MCV",
      clues:"Microcitosi, anche senza anemia",
      dx:["talassemia"] } ] },

  { name:"Elettroforesi proteica", chip:"SPEP",
    screens:"Componente monoclonale, assetto proteico", alts:[
    { id:"spep_up", dir:"up", tag:"Picco monoclonale", name:"Componente monoclonale (picco)",
      clues:"Dolore osseo, fratture patologiche, IRC, ipercalcemia",
      dx:["mieloma","mgus"] },
    { id:"spep_down", dir:"down", tag:"Albumina ▼", name:"Ipoalbuminemia",
      clues:"Edemi, calo ponderale, segni di malassorbimento",
      dx:["malassorb","malnutriz","epatopatia","nefrosica"] } ] },

  { name:"Calcemia (corretta)", chip:"Ca²⁺", screens:"Equilibrio del calcio",
    note:"Correggere sempre la <b>calcemia per l'albumina</b>: Ca corretto (mg/dL) = Ca misurato + 0,8 × (4 − Albumina g/dL).<div class=\"cc-calc\"><label>Calcio misurato <span>(mg/dL)</span><input type=\"number\" step=\"0.1\" inputmode=\"decimal\" class=\"cc-in\" data-k=\"ca\" placeholder=\"es. 8.5\"></label><label>Albumina <span>(g/dL)</span><input type=\"number\" step=\"0.1\" inputmode=\"decimal\" class=\"cc-in\" data-k=\"alb\" placeholder=\"es. 3.0\"></label><div class=\"cc-out\">Calcio corretto: <b class=\"cc-res\">—</b> mg/dL</div></div>", alts:[
    { id:"ca_up", dir:"up", tag:"Calcio ▲", name:"Ipercalcemia",
      clues:"Poliuria/polidipsia, stipsi, astenia, nefrolitiasi, confusione",
      dx:["iperpara","neoplasia","ipercalcemiaMaligna","mieloma","sarcoidosi","ipertiroid","intoxD","farmaciCa","fhh"] },
    { id:"ca_down", dir:"down", tag:"Calcio ▼", name:"Ipocalcemia",
      clues:"Parestesie, crampi, tetania, Chvostek/Trousseau",
      dx:["deficitD","malassorb","ipopara","irc","ipomagne"] } ] },

  { name:"Fosforo", chip:"PO₄", screens:"Metabolismo del fosfato", alts:[
    { id:"po4_down", dir:"down", tag:"Fosforo ▼", name:"Ipofosforemia",
      clues:"Debolezza muscolare, dolore osseo, astenia",
      dx:["iperpara","deficitD","osteomalIpoP","malassorb","fanconi"] },
    { id:"po4_up", dir:"up", tag:"Fosforo ▲", name:"Iperfosforemia",
      clues:"Prurito, sintomi uremici",
      dx:["irc","ipopara"] } ] },

  { name:"Fosfatasi alcalina totale", chip:"ALP", screens:"Turnover osseo (e colestasi)",
    note:"L'<b>ALP ridotta</b> è spesso trascurata ma rilevante: valutarla prima di iniziare un antiriassorbitivo.", alts:[
    { id:"alp_up", dir:"up", tag:"ALP ▲", name:"ALP elevata",
      clues:"Dolore osseo, deformità, ipoacusia (Paget), frattura recente",
      dx:["deficitD","paget","neoplasia","iperpara","colestasi"] },
    { id:"alp_down", dir:"down", tag:"ALP ▼", name:"ALP ridotta",
      clues:"Fratture/pseudofratture atipiche, perdita precoce dei denti, scarsa mineralizzazione, anamnesi familiare",
      dx:["ipofosfatasia","ipotiroid","malnutriz"] } ] },

  { name:"Creatininemia → eGFR", chip:"eGFR", screens:"Funzione renale",
    note:"Condiziona l'interpretazione di <b>Ca / PO₄ / PTH / vit D</b> e la scelta terapeutica.", alts:[
    { id:"egfr_low", dir:"down", tag:"eGFR ▼", name:"Creatinina ↑ / eGFR ↓",
      clues:"Edemi, ipertensione, sintomi uremici, anemia",
      dx:["irc"] } ] },

  { name:"Calciuria 24h", chip:"Ca/U", screens:"Bilancio renale del calcio", alts:[
    { id:"cau_up", dir:"up", tag:"Calciuria 24h ▲", name:"Ipercalciuria",
      clues:"Nefrolitiasi, ematuria, coliche renali",
      dx:["ipercalciuriaId","iperpara","sarcoidosi","intoxD","ipertiroid","acidosiTub","immobiliz"] },
    { id:"cau_down", dir:"down", tag:"Calciuria 24h ▼", name:"Ipocalciuria",
      clues:"Spesso asintomatica, anamnesi familiare",
      dx:["malassorb","deficitD","ridIntroito","fhh"] } ] },

  { name:"25-OH-vitamina D", chip:"25-OH-D", screens:"Stato vitaminico D / mineralizzazione", alts:[
    { id:"vitd_down", dir:"down", tag:"25-OH-vitamina D ▼", name:"Ipovitaminosi D",
      clues:"Dolore osseo diffuso, debolezza muscolare prossimale, cadute, miopatia",
      dx:["deficitD","malassorb","epatopatia","irc","farmaciD"] } ] }
];

const complementari = [
  { name:"Paratormone (PTH)", chip:"PTH", screens:"Asse calcio-PTH · chiave di lettura",
    note:"Sempre interpretato con la calcemia: <b>PTH↑ + Ca↑</b> → iperPTH primario; <b>PTH↑ + Ca↓/N</b> → iperPTH secondario; <b>PTH↓ + Ca↑</b> → ipercalcemia PTH-indipendente.", alts:[
    { id:"pth_up", dir:"up", tag:"PTH ▲", name:"PTH elevato",
      clues:"Da leggere con la calcemia · dolore osseo, nefrolitiasi se primario",
      dx:["iperpara","deficitD","malassorb","irc"] },
    { id:"pth_down", dir:"down", tag:"PTH ▼", name:"PTH soppresso",
      clues:"Da leggere con la calcemia · sintomi della causa di base",
      dx:["ipopara","ipomagne","neoplasia","mieloma","sarcoidosi","intoxD","ipertiroid"] } ] },

  { name:"TSH", chip:"TSH", screens:"Funzione tiroidea", alts:[
    { id:"tsh_down", dir:"down", tag:"TSH ▼", name:"TSH soppresso",
      clues:"Cardiopalmo, calo ponderale, tremori, intolleranza al caldo",
      dx:["ipertiroid"] } ] }
];

const patterns = [
  { ids:["pth_up","ca_up"], dx:"Iperparatiroidismo primario", hint:"PTH↑ con Ca↑ e vit D normale" },
  { ids:["pth_up","vitd_down"], dx:"Iperparatiroidismo secondario", hint:"PTH↑ con vit D↓ e Ca normale/bassa" },
  { ids:["pth_down","ca_down"], dx:"Ipoparatiroidismo (o ipomagnesiemia)" },
  { ids:["ca_down","po4_down","alp_up","vitd_down"], dx:"Osteomalacia" },
  { ids:["ca_up","cau_down"], dx:"Ipercalcemia ipocalciurica familiare" },
  { ids:["ves_up","hb_down","spep_up"], dx:"Mieloma multiplo" },
  { ids:["egfr_low","po4_up"], dx:"CKD-MBD / Osteodistrofia renale" }
];

const NOTES = {
  iperpara:"L'eccesso di PTH accelera il riassorbimento osseo, con perdita soprattutto dell'osso corticale: per questo la DXA va fatta anche al terzo distale del radio. Tipici ipercalcemia, ipofosforemia e ipercalciuria. La calciuria 24h distingue l'iperparatiroidismo dall'ipercalcemia ipocalciurica familiare (calciuria bassa) e pesa sull'indicazione chirurgica, come la nefrolitiasi. La paratiroidectomia migliora la BMD.",
  mieloma:"Le plasmacellule neoplastiche aumentano il riassorbimento osseo e bloccano la formazione di osso nuovo: lesioni litiche, fratture patologiche, ipercalcemia. Orientano la diagnosi una componente monoclonale insieme a ipercalcemia, insufficienza renale, anemia o lesioni ossee (criteri CRAB). Una frattura vertebrale apparentemente osteoporotica con VES alta o anemia va sempre indagata in questo senso.",
  mgus:"Anche senza progressione a mieloma il clone plasmacellulare altera il rimodellamento: aumenta il rapporto RANKL/OPG e produce citochine (DKK1, MIP-1α) che attivano gli osteoclasti e frenano gli osteoblasti. Ne derivano maggiore porosità della corticale e un rischio di frattura aumentato, soprattutto vertebrale. La MGUS è però comune dopo i 50 anni (circa 3%): trovarla non chiude la ricerca di altre cause. Va seguita per il rischio di evoluzione in mieloma.",
  talassemia:"Nelle forme major e intermedia l'eritropoiesi inefficace espande il midollo e, con il sovraccarico di ferro, l'ipogonadismo e le altre carenze ormonali, causa osteoporosi e fratture. Anche il portatore (talassemia minor) può avere BMD ridotta e una peggiore qualità dell'osso, pur con un rischio minore: non va considerato neutro. La microcitosi può esserci anche senza anemia.",
  neoplasia:"Le metastasi ossee alterano il rimodellamento con lesioni litiche, addensanti o miste e fratture patologiche. Vengono soprattutto da mammella, prostata, polmone, rene e tiroide. Alcune neoplasie causano anche un'ipercalcemia mediata dal PTHrP, con PTH soppresso. Dolore osseo persistente, anche notturno, anemia e VES alta devono far pensare a una neoplasia. Nel mieloma la scintigrafia può essere negativa: serve l'immunofissazione.",
  ipercalcemiaMaligna:"Emergenza oncologica, non legata di per sé all'osteoporosi ma da riconoscere sempre quando la calcemia è molto alta (oltre 14 mg/dL o con sintomi). Di solito è dovuta al PTHrP (PTH soppresso); più di rado a metastasi litiche o alla produzione di calcitriolo, tipica di alcuni linfomi. L'esordio rapido dà confusione, poliuria e disidratazione. Si tratta subito: idratazione endovena, poi bisfosfonato endovena, o denosumab se la funzione renale è ridotta; la calcitonina agisce nelle prime ore.",
  sarcoidosi:"I macrofagi dei granulomi producono 1,25(OH)₂-vitamina D (calcitriolo) senza controllo: ipercalciuria (spesso il primo reperto), ipercalcemia e PTH soppresso. Lo stesso meccanismo c'è in tubercolosi, infezioni fungine e alcuni linfomi. La 1,25(OH)₂-vitamina D alta e la TC del torace orientano la diagnosi. La 25-OH-vitamina D è spesso normale o bassa, ma va integrata con cautela: la supplementazione può scatenare l'ipercalcemia.",
  ipertiroid:"L'eccesso di ormoni tiroidei accelera il turnover osseo con prevalenza del riassorbimento: si perde massa ossea e aumenta il rischio di frattura, anche nell'ipertiroidismo subclinico. Il danno è in gran parte reversibile con il ritorno all'eutiroidismo. Lo stesso accade con la L-tiroxina a dose soppressiva.",
  intoxD:"Ad alte concentrazioni la vitamina D, tramite il calcitriolo, attiva gli osteoclasti e aumenta il riassorbimento osseo; insieme al maggiore assorbimento intestinale di calcio ne derivano ipercalcemia, ipercalciuria, nefrocalcinosi e PTH soppresso. Anche senza intossicazione franca, dosi molto alte riducono la densità ossea (10.000 UI al giorno per 3 anni) e boli annuali da 500.000 UI aumentano cadute e fratture. Di solito la 25-OH-vitamina D è molto oltre 100 ng/mL (250 nmol/L), per errori di dosaggio o prodotti mal formulati. Con dosi normali, un'ipercalcemia con PTH soppresso e calcitriolo alto può dipendere da un difetto genetico dell'enzima che inattiva la vitamina D (CYP24A1), che si manifesta anche nell'adulto con calcoli e nefrocalcinosi.",
  farmaciCa:"I tiazidici riducono l'escrezione urinaria di calcio: non causano osteoporosi (sono anzi lievemente protettivi), ma possono smascherare un iperparatiroidismo primario. Il litio sposta verso l'alto la soglia del recettore del calcio e può dare un iperparatiroidismo con calciuria bassa, simile all'ipercalcemia ipocalciurica familiare, e perdita ossea. Rivalutare la terapia e ricontrollare il calcio dopo la sospensione, se possibile.",
  fhh:"Mutazione inattivante del recettore del calcio (CASR): ipercalcemia lieve con calciuria bassa e PTH normale o lievemente alto, benigna e da non operare. Rapporto clearance calcio/creatinina: sotto 0,01 suggerisce questa forma, sopra 0,02 l'iperparatiroidismo primario; tra i due serve il test genetico. Utile cercare ipercalcemia nei familiari di primo grado. Non causa osteoporosi: è in elenco per non confonderla con l'iperparatiroidismo.",
  deficitD:"La carenza di vitamina D (25-OH-vitamina D sotto 20 ng/mL, grave sotto 10–12) induce un iperparatiroidismo secondario che aumenta il riassorbimento osseo. Se grave e prolungata compromette la mineralizzazione (osteomalacia): dolore osseo, debolezza dei muscoli prossimali, cadute, fosfatasi alcalina alta, calcio e fosforo bassi. Cause frequenti: poca esposizione al sole (anziani istituzionalizzati, allettati, abbigliamento coprente), obesità, malassorbimento (da qui la ricerca della celiachia), farmaci induttori. Se il PTH resta alto dopo aver corretto la vitamina D, va considerato un iperparatiroidismo primario normocalcemico.",
  osteomalIpoP:"Il rene perde fosfato in eccesso: ipofosforemia, fosfaturia inappropriata, 1,25(OH)₂-vitamina D bassa o inappropriatamente normale, fino all'osteomalacia con dolore osseo, debolezza e pseudofratture. Con FGF23 alto le cause sono: il ferro carbossimaltosio endovena, oggi la più frequente, soprattutto con infusioni ripetute; un piccolo tumore mesenchimale (osteomalacia oncogenica), che la PET con analoghi della somatostatina localizza; le forme genetiche (XLH). Il carbossimaltosio impedisce la degradazione dell'FGF23 intatto, che nella carenza di ferro viene prodotto in eccesso ma subito scisso nei frammenti inattivi: l'FGF23 attivo sale, riduce i trasportatori del fosfato nel tubulo renale e blocca l'attivazione della vitamina D. Il calcitriolo basso riduce l'assorbimento intestinale di fosfato e calcio, e l'iperparatiroidismo secondario che ne deriva aumenta ancora la fosfaturia. Con FGF23 basso, pensare alle tubulopatie (sindrome di Fanconi, tenofovir).",
  malassorb:"Il malassorbimento di calcio e vitamina D (celiachia, IBD, chirurgia bariatrica, insufficienza pancreatica) causa iperparatiroidismo secondario e una mineralizzazione insufficiente. Spesso si associano calciuria bassa, albumina bassa e carenze multiple (ferro, folati, B12).",
  ipopara:"Il PTH è insufficiente: ipocalcemia con iperfosforemia e turnover osseo molto basso. Cause: chirurgia del collo (la più frequente), autoimmune, genetica, ipomagnesiemia grave (reversibile). La BMD è spesso normale o aumentata; la qualità dell'osso è alterata, ma un aumento del rischio di frattura non è dimostrato con certezza.",
  irc:"Il rene malato produce meno calcitriolo e trattiene fosforo: ne derivano ipocalcemia e iperparatiroidismo secondario, con aumento del riassorbimento e osteodistrofia renale. L'insieme di queste alterazioni si chiama CKD-MBD (<i>Chronic Kidney Disease–Mineral and Bone Disorder</i>). Dallo stadio 3b la DXA misura la massa ossea ma non distingue l'osteoporosi dalle altre forme di osteodistrofia; va interpretata con PTH e fosfatasi alcalina, e la terapia va decisa con il nefrologo.",
  ipomagne:"Il magnesio basso riduce la secrezione e l'azione del PTH: l'ipocalcemia non si corregge finché non si corregge il magnesio, e il PTH resta normale o basso nonostante il calcio basso. Spesso c'è anche ipokaliemia. Cause: farmaci (inibitori di pompa protonica, diuretici), alcol, diarrea cronica e malassorbimento, perdite renali (anche genetiche, come la sindrome di Gitelman). La magnesuria distingue la perdita renale da quella intestinale.",
  fanconi:"Il tubulo prossimale del rene non funziona e perde con le urine fosfato, bicarbonato, glucosio e aminoacidi. La perdita di fosfato abbassa la fosforemia e lascia all'osso poco fosfato per mineralizzarsi; il danno tubulare riduce anche la produzione di calcitriolo. Ne derivano l'osteomalacia e, spesso, un'acidosi metabolica. Può essere acquisita (tenofovir, mieloma multiplo) o ereditaria.",
  paget:"Rimodellamento osseo focale, accelerato e disorganizzato, in uno o più segmenti (bacino, rachide, cranio, femore, tibia): dolore, deformità, a volte sordità o fratture. Non è osteoporosi ma entra nella diagnosi differenziale della fosfatasi alcalina alta, che però può essere normale nelle forme con una sola sede. Diagnosi con Rx; la scintigrafia mostra l'estensione. Si tratta con zoledronato se c'è dolore osseo.",
  colestasi:"Nelle epatopatie colestatiche (es. colangite biliare primitiva) il malassorbimento della vitamina D e l'effetto tossico di bilirubina e acidi biliari sull'osso causano l'osteodistrofia epatica. GGT e fosfatasi alcalina frazionata indicano se la fosfatasi alta viene dal fegato o dall'osso; gli AMA orientano verso la colangite biliare primitiva.",
  epatopatia:"Nell'epatopatia cronica concorrono malnutrizione, ipogonadismo, calo di IGF-1, infiammazione e, nelle forme avanzate, una ridotta attivazione della vitamina D: la perdita ossea è frequente, soprattutto nella cirrosi. Transaminasi, GGT ed ecografia servono per l'inquadramento.",
  nefrosica:"Con la proteinuria nefrosica si perde nelle urine la proteina che trasporta la vitamina D: ne derivano carenza di vitamina D e bilancio del calcio negativo, a cui spesso si aggiungono i glucocorticoidi usati per la terapia. Spie: proteinuria 24h e albumina bassa.",
  ipofosfatasia:"Deficit genetico di fosfatasi alcalina (gene ALPL): si accumula il pirofosfato, che blocca la mineralizzazione, con fratture e pseudofratture, perdita precoce dei denti, condrocalcinosi. La spia è la fosfatasi alcalina sempre bassa, dopo aver escluso le cause comuni (terapia antiriassorbitiva, ipotiroidismo, carenza di zinco o magnesio, malnutrizione). I bisfosfonati, analoghi del pirofosfato, peggiorano il difetto e sono controindicati. Conferma con vitamina B6 elevata (a integratori sospesi) e test genetico.",
  ipotiroid:"L'ipotiroidismo rallenta il turnover osseo e di per sé pesa poco sull'osteoporosi; il rischio viene soprattutto da una terapia sostitutiva sovradosata (TSH basso). Può abbassare la fosfatasi alcalina.",
  malnutriz:"La carenza di proteine e calorie riduce la formazione di osso; quelle di magnesio e zinco ne ostacolano anche la mineralizzazione. La fosfatasi alcalina è bassa perché è un enzima che contiene zinco e ha bisogno del magnesio. Albumina e prealbumina basse. Se la fosfatasi resta bassa a carenze corrette, va considerata l'ipofosfatasia.",
  ipercalciuriaId:"Il rene perde troppo calcio con calcemia normale: il bilancio del calcio diventa negativo, con calcoli e BMD ridotta. Calciuria 24h alta con PTH di solito normale; un PTH alto con calcemia normale fa pensare piuttosto a una carenza di vitamina D o a un iperparatiroidismo normocalcemico. La dieta ricca di sale aumenta la calciuria. Risponde ai tiazidici.",
  acidosiTub:"L'acidosi metabolica cronica viene tamponata dall'osso, con dissoluzione del minerale e ipercalciuria; la forma distale dà nefrocalcinosi e ipopotassiemia. Per la diagnosi: EGA, pH urinario e bicarbonatemia.",
  immobiliz:"Senza carico meccanico il riassorbimento osseo aumenta subito: il calcio liberato alza la calciuria e sopprime il PTH. La perdita è rapida nelle prime settimane di allettamento o paralisi; nei giovani e in chi ha un turnover alto (es. Paget) può comparire ipercalcemia. Con PTH alto la causa è un'altra.",
  flogosi:"L'infiammazione cronica (citochine, RANKL) attiva gli osteoclasti e riduce la formazione ossea: l'osteoporosi accompagna molte malattie infiammatorie croniche. Con VES alta conviene dosare la PCR e cercare la causa: malattie reumatologiche, infiammatorie intestinali, infezioni croniche, neoplasie.",
  connettiv:"Connettiviti e artriti infiammatorie sommano infiammazione cronica, glucocorticoidi, ridotta mobilità e talvolta danno renale: la perdita ossea ha più cause. ANA ed ENA, anti-dsDNA e complemento orientano verso una connettivite; fattore reumatoide e anti-CCP verso l'artrite reumatoide.",
  ridIntroito:"Un apporto di calcio insufficiente per anni mantiene un iperparatiroidismo secondario lieve, che preleva calcio dall'osso. Il quadro (calciuria bassa, PTH alto) è lo stesso della carenza di vitamina D: la 25-OH-vitamina D normale e una dieta povera di latticini e acque calciche orientano qui. Il fabbisogno è circa 1000 mg al giorno, 1200 mg dopo la menopausa e dopo i 65 anni.",
  farmaciD:"Gli antiepilettici induttori enzimatici (fenobarbital, fenitoina, primidone, carbamazepina) accelerano il catabolismo della vitamina D, con ipovitaminosi D, iperparatiroidismo secondario e, nei casi più gravi, osteomalacia. Dosare la 25-OH-vitamina D e integrarla; valutare con il neurologo un farmaco non induttore."
};

const COMBO_GROUPS = [
  { label:"Emocromo", exams:[{id:"Hb",name:"Hb"},{id:"MCV",name:"MCV"}] },
  { label:"Elettroforesi / flogosi", exams:[{id:"VES",name:"VES"},{id:"MSpike",name:"Picco monoclonale",binary:true},{id:"Alb",name:"Albumina"}] },
  { label:"Metabolismo calcio-fosforo", exams:[{id:"Ca",name:"Calcio (corretto)"},{id:"P",name:"Fosforo"},{id:"ALP",name:"Fosfatasi alcalina"},{id:"CaU",name:"Calciuria 24h"},{id:"D",name:"25-OH-vit D"},{id:"PTH",name:"PTH"}] },
  { label:"Tiroide", exams:[{id:"TSH",name:"TSH"}] },
  { label:"Funzione renale", exams:[{id:"eGFR",name:"Creatinina (eGFR)"}] }
];

const CEXNAME={}; COMBO_GROUPS.forEach(g=>g.exams.forEach(e=>CEXNAME[e.id]=e.name));

const FORMS = [
 {cid:"iperpara",f:[["Ca","u"],["P","d"],["ALP","u"],["CaU","u"],["PTH","u"]],k:{Ca:["u",1],PTH:["u",0]}},
 {cid:"mieloma",f:[["VES","u"],["Hb","d"],["MSpike","u"],["Ca","u"]],k:{MSpike:["u",1]}},
 {cid:"neoplasia",f:[["VES","u"],["Hb","d"],["Ca","u"],["ALP","u"]],k:{PTH:["d",1]}},
 {cid:"ipercalcemiaMaligna",f:[["Ca","u"]],k:{PTH:["d",1]}},
 {cid:"sarcoidosi",f:[["Ca","u"],["CaU","u"]],k:{PTH:["d",1]}},
 {cid:"intoxD",f:[["Ca","u"],["CaU","u"],["D","u"]],k:{PTH:["d",0],D:["u",0]}},
 {cid:"ipertiroid",f:[["Ca","u"],["CaU","u"],["TSH","d"]],k:{TSH:["d",0]}},
 {cid:"fhh",f:[["Ca","u"],["CaU","d"]],k:{Ca:["u",0],CaU:["d",0]}},
 {cid:"farmaciCa",f:[["Ca","u"]],k:{}},
 {cid:"ipopara",f:[["Ca","d"],["P","u"],["PTH","d"]],k:{Ca:["d",0],PTH:["d",1]}},
 {cid:"deficitD",f:[["Ca","d"],["P","d"],["ALP","u"],["CaU","d"],["D","d"],["PTH","u"]],k:{D:["d",0],Ca:["d",1]}},
 {cid:"irc",f:[["Ca","d"],["P","u"],["eGFR","d"],["D","d"],["PTH","u"]],k:{eGFR:["d",0]}},
 {cid:"malassorb",f:[["Hb","d"],["Alb","d"],["Ca","d"],["P","d"],["CaU","d"],["D","d"],["PTH","u"]],k:{Ca:["d",1]}},
 {cid:"ipomagne",f:[["Ca","d"]],k:{}},
 {cid:"paget",f:[["ALP","u"]],k:{ALP:["u",0]}},
 {cid:"colestasi",f:[["ALP","u"]],k:{ALP:["u",0]}},
 {cid:"ipofosfatasia",f:[["ALP","d"]],k:{ALP:["d",0]}},
 {cid:"ipotiroid",f:[["ALP","d"],["TSH","u"]],k:{TSH:["u",0]}},
 {cid:"malnutriz",f:[["Alb","d"],["ALP","d"]],k:{}},
 {cid:"osteomalIpoP",f:[["P","d"]],k:{P:["d",0]}},
 {cid:"fanconi",f:[["P","d"]],k:{P:["d",0]}},
 {cid:"mgus",f:[["VES","u"],["MSpike","u"]],k:{MSpike:["u",1]}},
 {cid:"talassemia",f:[["Hb","d"],["MCV","d"]],k:{MCV:["d",0],Hb:["d",1]}},
 {cid:"flogosi",f:[["VES","u"],["Hb","d"]],k:{VES:["u",0]}},
 {cid:"connettiv",f:[["VES","u"]],k:{VES:["u",0]}},
 {cid:"ipercalciuriaId",f:[["CaU","u"]],k:{CaU:["u",0],Ca:["n",0]}},
 {cid:"acidosiTub",f:[["CaU","u"]],k:{CaU:["u",0]}},
 {cid:"nefrosica",f:[["Alb","d"]],k:{}},
 {cid:"epatopatia",f:[["Alb","d"],["D","d"],["PTH","u"]],k:{}},
 {cid:"immobiliz",f:[["CaU","u"]],k:{}},
 {cid:"ridIntroito",f:[["CaU","d"],["PTH","u"]],k:{}},
 {cid:"farmaciD",f:[["D","d"],["PTH","u"]],k:{}}
];

const ALT2STATE = {hb_down:["Hb","basso"],mcv_down:["MCV","basso"],spep_up:["MSpike","pres"],spep_down:["MSpike","ass"],ves_up:["VES","alto"],ca_up:["Ca","alto"],ca_down:["Ca","basso"],po4_up:["P","alto"],po4_down:["P","basso"],cau_up:["CaU","alto"],cau_down:["CaU","basso"],alp_up:["ALP","alto"],alp_down:["ALP","basso"],vitd_down:["D","basso"],pth_up:["PTH","alto"],pth_down:["PTH","basso"],egfr_low:["eGFR","basso"],tsh_down:["TSH","basso"]};

// --- Esami normali ---

const AXES = [
  { label:"Farmaci", groups:[
    { sub:"Oncologia e deprivazione ormonale", feats:[
      ["chemio","Chemioterapici"],
      ["mtx","Metotrexato ad alte dosi"],
      ["aromatasi","Inibitori dell'aromatasi"],
      ["adt","Deprivazione androgenica (ADT)","uomo"],
      ["gnrh","Analoghi / antagonisti del GnRH (non per carcinoma prostatico)"],
      ["dmpa","Medrossiprogesterone depot (contraccettivo iniettabile)","donna"]
    ]},
    { sub:"Endocrinologia e diabetologia", feats:[
      ["glucocorticoidi","Glucocorticoidi sistemici"],
      ["tiroxina_soppr","L-tiroxina a dose TSH-soppressiva"],
      ["glitazoni","Glitazoni (tiazolidinedioni)"],
      ["sglt2","SGLT2-inibitori"]
    ]},
    { sub:"Neurologia e psichiatria", feats:[
      ["anticonvulsivanti","Antiepilettici"],
      ["ssri","SSRI"],
      ["oppioidi","Oppioidi in uso cronico"]
    ]},
    { sub:"Cardiovascolare ed ematologia", feats:[
      ["eparina","Anticoagulanti"],
      ["diuretici_ansa","Diuretici dell'ansa"]
    ]},
    { sub:"Gastroenterologia", feats:[
      ["ipp","Inibitori di pompa protonica"]
    ]},
    { sub:"Immunosoppressione e infettivologia", feats:[
      ["ciclosporina","Inibitori della calcineurina (ciclosporina/tacrolimus)"],
      ["tenofovir","Tenofovir (TDF)"]
    ]}
  ]},
  { label:"Comorbidità", groups:[
    { sub:"Endocrino-metaboliche", feats:[
      ["diabete_t2","Diabete tipo 2"],
      ["diabete_t1","Diabete tipo 1"],
      ["obesita","Obesità"],
      ["ipopituitarismo","Ipopituitarismo / deficit ipofisari noti"],
      ["incidentaloma_surr","Incidentaloma surrenalico"]
    ]},
    { sub:"Reumatologiche e infiammatorie", feats:[
      ["artrite_reumatoide","Artrite reumatoide"],
      ["spondilite","Spondilite anchilosante / spondiloartrite assiale"],
      ["les","Lupus eritematoso sistemico (LES)"],
      ["artrite_psoriasica","Artrite psoriasica"],
      ["sclerodermia","Sclerosi sistemica (sclerodermia)"]
    ]},
    { sub:"Gastro-epatiche e nutrizionali", feats:[
      ["mici","Malattia infiammatoria cronica intestinale (Crohn / RCU)"],
      ["celiachia_nota","Celiachia nota (anche in dieta aglutinata)"],
      ["whipple","Malattia di Whipple"],
      ["epatopatia","Epatopatia cronica / cirrosi"]
    ]},
    { sub:"Renali", feats:[] },
    { sub:"Neurologiche", feats:[
      ["ictus_emiplegia","Ictus / emiplegia"],
      ["lesione_midollare","Lesione midollare / para-tetraplegia"],
      ["parkinson","Malattia di Parkinson"],
      ["sclerosi_multipla","Sclerosi multipla"],
      ["epilessia","Epilessia"]
    ]},
    { sub:"Respiratorie e altre", feats:[
      ["hiv","Infezione da HIV"],
      ["bpco","BPCO"],
      ["fibrosi_cistica","Fibrosi cistica"],
      ["emocromatosi","Emocromatosi / sovraccarico di ferro"]
    ]}
  ]},
  { label:"Sintomi e segni", groups:[
    { sub:"Cute e reazioni allergiche", feats:[
      ["flushing","Flushing"],
      ["orticaria_pigmentosa","Orticaria pigmentosa"],
      ["prurito","Prurito"],
      ["strie_rubre","Strie rubre"],
      ["fragilita_cutanea","Fragilità cutanea"],
      ["ecchimosi","Ecchimosi facili"],
      ["anafilassi","Anafilassi ricorrente / idiopatica"],
      ["anafilassi_imenotteri","Anafilassi da puntura di imenotteri"],
      ["dermatite_erpetiforme","Dermatite erpetiforme"],
      ["iperpigmentazione","Iperpigmentazione cutanea (bronzina)"]
    ]},
    { sub:"Endocrino e riproduttivo", feats:[
      ["m_libido","Calo della libido","uomo"],
      ["disf_erettile","Disfunzione erettile","uomo"],
      ["m_testicoli","Testicoli piccoli / ipotrofici","uomo"],
      ["ginecomastia","Ginecomastia","uomo"],
      ["galattorrea","Galattorrea"],
      ["amenorrea","Amenorrea / oligomenorrea","donna"]
    ]},
    { sub:"Neurologico e visivo", feats:[
      ["cefalea","Cefalea"],
      ["disturbi_visivi","Disturbi del campo visivo"],
      ["lussazione_cristallino","Lussazione del cristallino (ectopia lentis)"]
    ]},
    { sub:"Muscolo-scheletrico e connettivo", feats:[
      ["miopatia","Miopatia prossimale"],
      ["sarcopenia","Sarcopenia / perdita di massa muscolare"],
      ["sclere_blu","Sclere blu"],
      ["dentinogenesi","Dentinogenesi imperfetta"],
      ["perdita_denti_precoce","Perdita precoce dei denti (radice integra)"],
      ["ipoacusia","Ipoacusia precoce"],
      ["lombalgia_infiammatoria","Lombalgia infiammatoria (esordio <45 anni, notturna, rigidità mattutina, migliora col movimento)"],
      ["artropatia_mcf","Artropatia delle metacarpo-falangee (2ª–3ª)"],
      ["artralgie_migranti","Artralgie o artrite migrante da anni, sieronegativa"],
      ["ipermobilita","Ipermobilità articolare marcata"]
    ]},
    { sub:"Gastrointestinale", feats:[
      ["s_diarrea","Diarrea cronica"],
      ["s_steatorrea","Steatorrea"],
      ["s_meteorismo","Meteorismo"],
      ["s_dolore_addominale","Dolore addominale ricorrente"]
    ]},
    { sub:"Generali e habitus", feats:[
      ["astenia","Astenia"],
      ["facies_cushingoide","Facies cushingoide"],
      ["obesita_centrale","Obesità centrale"],
      ["tratti_acromegalici","Tratti acromegalici (mani/piedi, prognatismo)"],
      ["bassa_statura","Bassa statura"],
      ["habitus_marfanoide","Habitus marfanoide (alta statura, arti lunghi, aracnodattilia)"]
    ]}
  ]},
  { label:"Anamnesi e pattern fratturativo", groups:[
    { sub:"Pattern fratturativo", feats:[
      ["frattura_inspiegata","Osteoporosi o fratture inspiegate in età giovane"],
      ["vertebrali_giovane","Fratture vertebrali in soggetto giovane"],
      ["fratture_infanzia","Fratture multiple fin dall'infanzia"],
      ["familiarita_fratture","Familiarità per fratture"]
    ]},
    { sub:"Storia riproduttiva", feats:[
      ["menopausa_precoce","Menopausa prima dei 45 anni","donna"],
      ["ovariectomia","Ovariectomia bilaterale","donna"],
      ["gravidanza_allattamento","Osteoporosi/frattura in gravidanza o allattamento","donna"]
    ]},
    { sub:"Interventi e storia clinica", feats:[
      ["storia_ipofisaria","Patologia/chirurgia/radioterapia ipofisaria"],
      ["bariatrica","Pregressa chirurgia bariatrica"],
      ["gastrectomia","Pregressa gastrectomia / chirurgia gastrica"],
      ["trapianto","Trapianto d'organo (rene, altro organo solido o midollo)"],
      ["nefrolitiasi_ricorrente","Nefrolitiasi calcica ricorrente / nefrocalcinosi"],
      ["tromboembolismo_giovanile","Tromboembolismo in età giovanile"]
    ]},
    { sub:"Stile di vita e nutrizione", feats:[
      ["calo_ponderale","Calo ponderale di oltre il 5% in 6–12 mesi"],
      ["anoressia_dca","Anoressia nervosa / disturbo alimentare noto"],
      ["alcol","Alcol: 3 o più unità al giorno"],
      ["fumo","Tabagismo"],
      ["immobilizzazione","Immobilizzazione prolungata / allettamento"],
      ["basso_peso","Basso peso corporeo (BMI <20 kg/m²)"],
      ["esercizio_intenso","Attività fisica intensa / bassa disponibilità energetica","donna"]
    ]}
  ]}
];

/* Un sintomo per voce nella pagina di scelta: ogni sintomo accende le frasi delle schede che lo contengono,
   così chi ha solo la steatorrea la spunta e ritrova la celiachia. Le frasi delle schede restano come sono. */
const ACCENDE = {
  s_diarrea:["sintomi_gi","diarrea_steatorrea"],
  s_steatorrea:["diarrea_steatorrea"],
  s_meteorismo:["meteorismo"],
  s_dolore_addominale:["sintomi_gi","meteorismo"],
  vertebrali_giovane:["frattura_inspiegata"]
};
/* frasi usate solo nelle schede */
const SPECIFICHE = { "Sintomi e segni":[
    ["sintomi_gi","Sintomi GI ricorrenti (dolore addominale, diarrea)"],
    ["diarrea_steatorrea","Diarrea cronica / steatorrea"],
    ["meteorismo","Meteorismo / dolore addominale ricorrente"]
  ] };

const FORME = [
  { kind:"sospetto", id:"ipogonadismo", nome:"Ipogonadismo maschile", cat:"Endocrina", sesso:"uomo", calc:"vermeulen",
    suppressedBy:["adt"],
    trigger:[["m_libido","forte"],["disf_erettile","lieve"],["m_testicoli","forte"],["ginecomastia","lieve"],["astenia","lieve"],["sarcopenia","lieve"],["frattura_inspiegata","lieve"]],
    conferma:["Testosterone totale: mattino, a digiuno, confermato ×2","Se SHBG alterata (obesità, diabete): testosterone libero calcolato (calcolatore sotto)","FSH/LH: alti → primario (testicolare); bassi/normali → secondario (centrale)","Se secondario: prolattina, ferritina, ± RM sellare"],
    nota:"Il deficit di testosterone, e del suo derivato estradiolo, toglie il freno al riassorbimento osseo: è una causa frequente e trattabile nell'uomo. Il testosterone è basso sotto 264–300 ng/dL (circa 9,2–10,4 nmol/L) su due prelievi del mattino. Oltre alle cause testicolari e ipofisarie, considerare le forme funzionali: obesità, malattie croniche, oppioidi, glucocorticoidi." },
  { id:"gio", nome:"Osteoporosi indotta da glucocorticoidi", cat:"Farmaci",
    trigger:[["glucocorticoidi","forte"]],
    conferma:["Prednisone-equivalente ≥5 mg/die per più di 3 mesi, in atto o previsto (soglia della Nota 79 AIFA). Il rischio aumenta già a dosi più basse."],
    nota:"Riducono la formazione ossea (apoptosi di osteoblasti e osteociti), aumentano il riassorbimento nelle prime settimane e riducono l'assorbimento intestinale del calcio. Il rischio di frattura sale già nei primi 3–6 mesi, cresce con la dose e si riduce in parte alla sospensione. Le fratture avvengono a valori di BMD più alti che nell'osteoporosi postmenopausale: la DXA sottostima il rischio." },
  { id:"ipo_adt", nome:"Ipogonadismo iatrogeno (ADT)", cat:"Farmaci", sesso:"uomo",
    trigger:[["adt","forte"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Nel carcinoma prostatico la deprivazione androgenica abbatte testosterone ed estradiolo e accelera il riassorbimento; la perdita ossea è massima nel primo anno. Comprende agonisti del GnRH (leuprorelina, goserelina, triptorelina), antagonisti (degarelix, relugolix) e orchiectomia. Gli antiandrogeni da soli (es. bicalutamide) hanno un effetto sull'osso molto minore." },
  { id:"tiroxina", nome:"Osteoporosi da L-tiroxina soppressiva", cat:"Farmaci",
    trigger:[["tiroxina_soppr","forte"]],
    conferma:["TSH sotto il limite inferiore in corso di L-tiroxina; rischio maggiore con TSH <0,1 mU/L"],
    nota:"L'eccesso di ormone tiroideo accelera il turnover osseo. Il rischio riguarda soprattutto la donna in postmenopausa con TSH <0,1 mU/L; nella donna in premenopausa e nell'uomo i dati sono meno chiari. Spesso basta ridurre la dose, salvo che la soppressione sia voluta (es. carcinoma tiroideo ad alto rischio)." },
  { id:"ipo_aromatasi", nome:"Osteoporosi da inibitori dell'aromatasi", cat:"Farmaci",
    trigger:[["aromatasi","forte"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Bloccano la conversione degli androgeni in estrogeni e azzerano gli estrogeni residui: la perdita ossea è più rapida che nella menopausa naturale. Esempi: anastrozolo, letrozolo, exemestane. Uso tipico nel carcinoma mammario ormono-sensibile della donna in postmenopausa; più raro nell'uomo (carcinoma mammario maschile, usi off-label). DXA all'avvio; bisfosfonato o denosumab secondo il rischio." },
  { id:"ipo_gnrh", nome:"Ipogonadismo iatrogeno da analoghi GnRH", cat:"Farmaci",
    trigger:[["gnrh","forte"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Fuori dal carcinoma prostatico (per quello vedi l'ipogonadismo da ADT). Si usano per endometriosi, fibromi uterini, soppressione ovarica nel carcinoma mammario in premenopausa (spesso insieme agli inibitori dell'aromatasi, con perdita ossea molto rapida) e pubertà precoce. L'ipogonadismo indotto accelera il riassorbimento; la perdita è in parte reversibile alla sospensione. Esempi: leuprorelina, triptorelina, goserelina." },
  { id:"anticonv", nome:"Osteoporosi da anticonvulsivanti", cat:"Farmaci",
    trigger:[["anticonvulsivanti","forte"]],
    conferma:["25-OH-vitamina D (spesso ridotta); se si sospetta osteomalacia anche calcemia, fosforo, fosfatasi alcalina e PTH"],
    nota:"Gli antiepilettici induttori enzimatici (fenitoina, fenobarbital, primidone, carbamazepina; più debolmente oxcarbazepina) accelerano il catabolismo epatico della vitamina D, con iperparatiroidismo secondario e rischio di osteomalacia. Il valproato riduce la BMD con un meccanismo diverso, non enzimatico. Topiramato e acetazolamide possono dare acidosi metabolica. Tutti aumentano il rischio di cadute." },
  { id:"op_eparina", nome:"Osteoporosi da anticoagulanti", cat:"Farmaci",
    trigger:[["eparina","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"L'eparina non frazionata usata per mesi (es. in gravidanza) riduce la formazione e aumenta il riassorbimento; con le eparine a basso peso molecolare il rischio è minore. Il warfarin ha un'associazione modesta e discussa. I DOAC (apixaban, rivaroxaban, dabigatran, edoxaban) sembrano neutri o più sicuri." },
  { id:"op_cni", nome:"Osteoporosi da inibitori della calcineurina", cat:"Farmaci",
    trigger:[["ciclosporina","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Nei modelli animali aumentano il turnover con prevalenza del riassorbimento. Nell'uomo l'effetto diretto dei farmaci è difficile da separare da quello degli steroidi e della malattia di base (trapianto, insufficienza renale); il tacrolimus sembra pesare meno della ciclosporina. Esempi: ciclosporina, tacrolimus." },
  { id:"op_chemio", nome:"Osteoporosi da chemioterapici", cat:"Farmaci",
    trigger:[["chemio","forte"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Il meccanismo principale è l'insufficienza gonadica indotta (menopausa precoce, ipogonadismo maschile); si aggiunge la tossicità diretta su osso e rene. Esempi: alchilanti (ciclofosfamide); ifosfamide, che può dare tubulopatia con perdita di fosfato (sindrome di Fanconi); derivati del platino (il cisplatino può dare ipomagnesiemia)." },
  { id:"op_diuretici", nome:"Osteoporosi da diuretici dell'ansa", cat:"Farmaci",
    trigger:[["diuretici_ansa","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Aumentano l'escrezione urinaria di calcio; i tiazidici, al contrario, la riducono e sono lievemente protettivi. L'aumento del rischio di frattura è modesto e in buona parte legato alle cadute (ipotensione ortostatica, urgenza minzionale), soprattutto nell'anziano. Esempi: furosemide, torasemide, bumetanide." },
  { id:"op_ipp", nome:"Osteoporosi da inibitori di pompa protonica", cat:"Farmaci",
    trigger:[["ipp","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    osso:["Magnesemia, se l'uso è prolungato"],
    nota:"Associazione modesta con fratture di femore e vertebre, con uso cronico (in genere oltre un anno) e ad alte dosi. Meccanismi proposti: minore assorbimento del calcio (soprattutto come carbonato) per la ridotta acidità gastrica, e ipomagnesiemia, che a sua volta riduce la secrezione di PTH. Esempi: omeprazolo, esomeprazolo, pantoprazolo, lansoprazolo." },
  { id:"op_ssri", nome:"Osteoporosi da SSRI", cat:"Farmaci",
    trigger:[["ssri","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"La serotonina agisce sugli osteoblasti (recettori 5-HT) e riduce la formazione ossea. Aumentano anche le cadute (sedazione, iponatriemia). Esempi: sertralina, paroxetina, fluoxetina, citalopram, escitalopram." },
  { id:"op_glitazoni", nome:"Osteoporosi da glitazoni", cat:"Farmaci",
    trigger:[["glitazoni","forte"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"L'attivazione di PPAR-gamma spinge le cellule staminali mesenchimali a diventare adipociti anziché osteoblasti e riduce la formazione ossea. Nella donna il rischio di frattura è circa doppio, soprattutto in sedi periferiche (mano, piede, omero). Esempio in uso: pioglitazone; il rosiglitazone non è più in commercio in Europa." },
  { id:"op_sglt2", nome:"Osteoporosi da SGLT2-inibitori", cat:"Farmaci",
    trigger:[["sglt2","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Un aumento delle fratture è emerso con canagliflozin (studio CANVAS), ma non è stato confermato né con dapagliflozin ed empagliflozin né nelle meta-analisi. Meccanismi possibili: aumento di fosfato e PTH, calo di peso, cadute da deplezione di volume." },
  { id:"op_tenofovir", nome:"Osteoporosi da tenofovir (TDF)", cat:"Farmaci",
    trigger:[["tenofovir","forte"]],
    conferma:["Fosforemia e TmP/GFR (perdita renale di fosfato); glicosuria con glicemia normale e proteinuria tubulare indicano la tubulopatia"],
    nota:"Il tenofovir disoproxil (TDF), usato per HIV, epatite B e profilassi pre-esposizione (PrEP), riduce la BMD e può causare una tubulopatia prossimale con perdita renale di fosfato e osteomalacia. Il tenofovir alafenamide (TAF) pesa molto meno su osso e rene: valutare il passaggio." },
  { id:"op_mtx", nome:"Osteopatia da metotrexato", cat:"Farmaci",
    trigger:[["mtx","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Alle dosi oncologiche inibisce la proliferazione degli osteoblasti e può causare l'osteopatia da metotrexato: dolore osseo, osteoporosi e fratture, tipicamente agli arti inferiori. Alle basse dosi settimanali usate in reumatologia l'effetto è incerto e probabilmente minimo." },
  { id:"op_dmpa", nome:"Osteoporosi da medrossiprogesterone depot", cat:"Farmaci", sesso:"donna",
    trigger:[["dmpa","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    nota:"Il contraccettivo iniettabile trimestrale (DMPA) sopprime l'asse ipotalamo-ipofisi-ovaio e abbassa gli estrogeni, con calo della BMD soprattutto nei primi due anni; per questo la scheda tecnica raccomanda di rivalutarne l'uso oltre i due anni. La perdita è in gran parte reversibile alla sospensione. Particolare attenzione nell'adolescente, che non ha ancora raggiunto il picco di massa ossea." },
  { id:"op_oppioidi", nome:"Osteoporosi da oppioidi", cat:"Farmaci",
    trigger:[["oppioidi","lieve"]],
    conferma:["Nessun test: legata al farmaco assunto"],
    osso:["Testosterone (nell'uomo) o estradiolo (nella donna in premenopausa), se si sospetta ipogonadismo"],
    nota:"L'uso cronico sopprime l'asse ipotalamo-ipofisi-gonadi e causa ipogonadismo, con perdita ossea; inoltre sedazione e capogiri aumentano le cadute. Esempi: morfina, ossicodone, fentanyl, tapentadolo, tramadolo, metadone." },
  { kind:"sospetto", id:"mastocitosi", nome:"Mastocitosi sistemica", cat:"Ematologica / sistemica",
    trigger:[["flushing","forte"],["orticaria_pigmentosa","forte"],["anafilassi_imenotteri","forte"],["anafilassi","forte"],["prurito","lieve"],["sintomi_gi","lieve"],["vertebrali_giovane","lieve"],["frattura_inspiegata","lieve"]],
    conferma:["Triptasi sierica basale (sospetta sopra 20 ng/mL; valori più bassi non escludono, soprattutto nell'osteoporosi isolata)","Mutazione KIT D816V su sangue periferico con metodica sensibile","Se positiva o sospetto alto: biopsia osteomidollare (aggregati di mastociti clonali)","Con triptasi alta e KIT negativo: numero di copie del gene TPSAB1 (alfa-triptasemia ereditaria)"],
    nota:"Nel midollo osseo si accumulano mastociti clonali, quasi sempre con la mutazione KIT D816V. Infiltrano l'osso e rilasciano mediatori (istamina, eparina, citochine) che attivano gli osteoclasti; le fratture vertebrali possono essere il primo segno, con esami di primo livello normali. Segnali d'allarme: anafilassi grave da puntura di imenotteri (soprattutto con ipotensione e senza orticaria) e anafilassi ricorrente senza causa. Una triptasi alta non basta: l'alfa-triptasemia ereditaria, presente nel 4–6% delle persone, la alza senza mastocitosi." },
  { kind:"sospetto", id:"oi", nome:"Osteogenesi imperfetta", cat:"Genetica / del collagene",
    trigger:[["sclere_blu","forte"],["fratture_infanzia","forte"],["familiarita_fratture","lieve"],["dentinogenesi","forte"],["ipoacusia","lieve"],["bassa_statura","lieve"]],
    conferma:["Valutazione clinico-genetica (COL1A1/COL1A2; pannello esteso se negativo)","Anamnesi familiare strutturata"],
    nota:"Difetto del collagene di tipo I (geni COL1A1 e COL1A2) che rende l'osso fragile; le forme lievi possono essere diagnosticate in età adulta. I due geni spiegano circa l'85–90% dei casi: un test negativo non esclude la malattia (forme recessive o con altri geni) e la diagnosi può restare clinica. Utile l'invio al genetista per consulenza e pannello esteso." },
  { id:"diabete", nome:"Diabete mellito tipo 2", cat:"Endocrina",
    trigger:[["diabete_t2","forte"],["obesita","lieve","supp"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"La qualità dell'osso peggiora (accumulo di prodotti di glicazione avanzata, basso turnover, microarchitettura alterata) mentre la BMD resta normale o alta: a parità di T-score il rischio di frattura è maggiore. Pesano anche le cadute (neuropatia, retinopatia, ipoglicemie) e alcuni farmaci (glitazoni, insulina). Per questo gli algoritmi di rischio basati sulla BMD lo sottostimano." },
  { kind:"sospetto", id:"cushing", nome:"Ipercortisolismo endogeno (Cushing)", cat:"Endocrina",
    trigger:[["facies_cushingoide","forte"],["strie_rubre","forte"],["obesita_centrale","lieve"],["fragilita_cutanea","lieve"],["ecchimosi","lieve"],["miopatia","lieve"],["incidentaloma_surr","forte"]],
    conferma:["Escluso l'uso di glucocorticoidi (anche inalatori, topici, infiltrazioni), test di prima linea: cortisolo libero urinario 24h, cortisolo salivare notturno, soppressione overnight con desametasone 1 mg","Desametasone overnight: 1 mg alle ore 23, cortisolo sierico alle 8 — normale se <1,8 µg/dL (50 nmol/L); mancata soppressione = positivo","Diagnosi su due test concordanti di tipo diverso, poi inquadramento ACTH"],
    nota:"L'eccesso di cortisolo riduce la formazione ossea e l'assorbimento del calcio, come nella forma da farmaci; le fratture vertebrali possono essere il primo segno. Cause: adenoma ipofisario ACTH-secernente, adenoma surrenalico, secrezione ectopica di ACTH. Anche l'ipercortisolismo lieve autonomo, spesso scoperto per un incidentaloma surrenalico, si associa a fratture vertebrali." },
  { kind:"sospetto", id:"acromegalia", nome:"Acromegalia", cat:"Endocrina",
    trigger:[["tratti_acromegalici","forte"],["cefalea","lieve"],["disturbi_visivi","lieve"]],
    conferma:["IGF-1; se elevata, GH durante OGTT; RMN ipofisi"],
    nota:"L'eccesso di GH e IGF-1 aumenta il turnover osseo. La BMD è spesso normale, ma la qualità dell'osso vertebrale è ridotta e le fratture vertebrali sono frequenti, soprattutto se coesiste ipogonadismo. Causa: adenoma ipofisario GH-secernente." },
  { kind:"sospetto", id:"iperprl", nome:"Iperprolattinemia", cat:"Endocrina",
    trigger:[["galattorrea","forte"],["amenorrea","forte"],["m_libido","lieve"],["cefalea","lieve"],["disturbi_visivi","lieve"]],
    conferma:["Prolattina sierica (escludere farmaci, ipotiroidismo, gravidanza, macroprolattina); se confermata, RMN ipofisi"],
    nota:"La prolattina elevata inibisce le gonadotropine e causa ipogonadismo, con calo di estrogeni o testosterone e perdita ossea. Cause: prolattinoma, farmaci (antipsicotici, metoclopramide, domperidone), ipotiroidismo, insufficienza renale." },
  { kind:"sospetto", id:"deficit_gh", nome:"Deficit di GH dell'adulto", cat:"Endocrina",
    trigger:[["ipopituitarismo","forte"],["storia_ipofisaria","forte"],["astenia","lieve"],["sarcopenia","lieve"]],
    conferma:["IGF-1 (un valore normale non esclude). Con almeno tre altri deficit ipofisari e IGF-1 bassa la diagnosi è già probabile; negli altri casi serve un test di stimolo del GH (ipoglicemia insulinica, glucagone o macimorelin)"],
    nota:"Il deficit di GH dell'adulto riduce massa e densità ossea. Sospettare in ipopituitarismo, dopo chirurgia/radioterapia ipofisaria o trauma cranico." },
  { id:"dm1", nome:"Diabete mellito tipo 1", cat:"Endocrina",
    trigger:[["diabete_t1","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"A differenza del tipo 2 la BMD è spesso ridotta: manca l'insulina, che stimola la formazione ossea, già negli anni in cui si costruisce il picco di massa ossea. Il rischio di frattura di femore è aumentato di diverse volte (fino a 5–6) e cresce con le complicanze e con le ipoglicemie." },
  { kind:"sospetto", id:"poi", nome:"Insufficienza ovarica primaria (POI) / menopausa precoce", cat:"Endocrina", sesso:"donna",
    trigger:[["menopausa_precoce","forte"],["ovariectomia","forte"]],
    conferma:["POI (<40 anni): amenorrea o oligomenorrea da almeno 4 mesi e FSH >25 UI/L; ripetere il dosaggio dopo 4–6 settimane solo se la diagnosi è incerta","Menopausa precoce: cessazione mestruale tra 40 e 45 anni"],
    nota:"La carenza precoce di estrogeni accelera il riassorbimento osseo. Cause: idiopatica, genetica (sindrome di Turner, premutazione FMR1), autoimmune, iatrogena (chemio o radioterapia, ovariectomia bilaterale). La terapia ormonale sostitutiva fino all'età media della menopausa protegge l'osso." },
  { id:"op_calo", nome:"Calo ponderale marcato", cat:"Stile di vita / nutrizione",
    trigger:[["calo_ponderale","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"Un calo di oltre il 5% del peso in 6–12 mesi accelera la perdita ossea e, nell'anziano, aumenta il rischio di frattura di femore. Contano il minor carico meccanico e il minor apporto di calcio e proteine. Se il calo non è voluto, è un sintomo da indagare prima di attribuirlo alla dieta: celiachia, ipertiroidismo, diabete scompensato, neoplasia, depressione. Dopo chirurgia bariatrica vale la scheda dedicata." },

  { id:"reuma_ar", nome:"Artrite reumatoide", cat:"Reumatologica",
    trigger:[["artrite_reumatoide","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"L'infiammazione cronica (TNF-α, IL-6) aumenta l'espressione di RANKL, che determina attivazione osteoclastica e perdita ossea sia periarticolare sia generalizzata; il rischio fratturativo correla con l'attività della malattia e si somma all'effetto dei glucocorticoidi. È un fattore di rischio indipendente." },
  { id:"reuma_spa", nome:"Spondilite anchilosante / spondiloartrite assiale", cat:"Reumatologica",
    trigger:[["spondilite","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"L'infiammazione cronica causa perdita di osso trabecolare vertebrale, paradossalmente associata a neoformazione ossea (sindesmofiti, anchilosi); le fratture vertebrali sono frequenti e spesso misconosciute. La BMD lombare in proiezione antero-posteriore è inaffidabile perché sovrastimata dalle calcificazioni: preferire il femore o la proiezione laterale." },
  { id:"reuma_les", nome:"Lupus eritematoso sistemico (LES)", cat:"Reumatologica",
    trigger:[["les","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"Concorrono l'infiammazione cronica, i glucocorticoidi spesso usati a lungo, la carenza di vitamina D per la fotoprotezione, l'eventuale nefrite e, dopo ciclofosfamide, l'insufficienza ovarica precoce. Il rischio di frattura è in parte indipendente dalla dose di cortisonico." },
  { id:"reuma_psa", nome:"Artrite psoriasica", cat:"Reumatologica",
    trigger:[["artrite_psoriasica","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"L'infiammazione sistemica (TNF-α, IL-17, IL-23) contribuisce alla perdita ossea. I dati sono meno uniformi che nell'artrite reumatoide, ma è descritto un aumento del rischio di frattura, a cui si sommano le comorbidità metaboliche e gli eventuali glucocorticoidi." },
  { id:"reuma_ssc", nome:"Sclerosi sistemica (sclerodermia)", cat:"Reumatologica",
    trigger:[["sclerodermia","forte"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"La perdita di osso ha più cause: l'infiammazione cronica; il malassorbimento, quando la malattia coinvolge l'intestino, con carenza di vitamina D; la ridotta attività fisica, perché la pelle indurita e le contratture articolari limitano i movimenti; il basso peso; il danno dei piccoli vasi. Ne derivano una BMD ridotta e un rischio di frattura aumentato." },

  { id:"gi_mici", nome:"Malattia infiammatoria cronica intestinale (IBD)", cat:"Gastro-epatica",
    trigger:[["mici","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D, calcemia e PTH (malassorbimento)","DXA alla diagnosi se ci sono fattori di rischio e durante i glucocorticoidi"],
    nota:"L'infiammazione intestinale (citochine che aumentano RANKL) si somma al malassorbimento di calcio e vitamina D, soprattutto nel Crohn ileale o dopo resezioni, ai glucocorticoidi e al basso peso. Il rischio è maggiore con malattia attiva e di lunga durata; il controllo dell'infiammazione protegge anche l'osso." },
  { id:"gi_celiachia", nome:"Celiachia nota", cat:"Gastro-epatica",
    trigger:[["celiachia_nota","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["Anti-transglutaminasi IgA, per verificare l'aderenza alla dieta","25-OH-vitamina D e PTH"],
    nota:"L'atrofia dei villi riduce l'assorbimento di calcio e vitamina D, con iperparatiroidismo secondario; si aggiunge una componente infiammatoria. Con la dieta senza glutine la BMD migliora soprattutto nel primo anno, ma un deficit può restare, specie se la diagnosi è arrivata in età adulta. La causa più comune di mancato recupero è una dieta non rigorosa." },
  { id:"gi_whipple", nome:"Malattia di Whipple nota", cat:"Gastro-epatica",
    trigger:[["whipple","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D, calcemia, fosforo, PTH e fosfatasi alcalina (malassorbimento)","Testosterone nell'uomo, se si sospetta ipogonadismo","DXA se ci sono stati malassorbimento prolungato, calo di peso o glucocorticoidi prima della diagnosi"],
    nota:"L'infezione cronica da Tropheryma whipplei infiltra la mucosa del tenue: ne derivano malassorbimento di calcio e vitamina D, calo di peso e infiammazione sistemica. In una piccola casistica di uomini già trattati la BMD era ridotta al femore e la perdita ossea era legata all'ipogonadismo. Spesso, prima della diagnosi, i dolori articolari sono stati curati per anni come un'artrite sieronegativa, con glucocorticoidi o immunosoppressori, che pesano anch'essi sull'osso. Con la terapia antibiotica il malassorbimento regredisce e la massa ossea può recuperare (descritto in singoli casi)." },
  { id:"gi_epatopatia", nome:"Epatopatia cronica / cirrosi", cat:"Gastro-epatica",
    trigger:[["epatopatia","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D","Testosterone nell'uomo, se si sospetta ipogonadismo","DXA nella cirrosi e nella colestasi cronica"],
    nota:"Osteodistrofia epatica: concorrono il calo di IGF-1, l'ipogonadismo, l'effetto tossico di bilirubina e acidi biliari sugli osteoblasti, il basso peso e, nelle colestasi, il malassorbimento della vitamina D. L'osteoporosi riguarda circa un cirrotico su tre ed è più frequente nelle forme colestatiche (es. colangite biliare primitiva) e prima del trapianto." },
  { id:"gi_bariatrica", nome:"Osteopatia post-chirurgia bariatrica", cat:"Gastro-epatica",
    trigger:[["bariatrica","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D, calcemia, PTH e fosfatasi alcalina","Calciuria 24h, per valutare l'assorbimento del calcio"],
    nota:"Le procedure malassorbitive (bypass gastrico, diversione biliopancreatica) riducono l'assorbimento di calcio e vitamina D, con iperparatiroidismo secondario anche quando la 25-OH-vitamina D è normale. Si aggiungono il calo di peso rapido e il minor carico sullo scheletro. Anche la sleeve gastrectomy riduce la massa ossea, ma meno del bypass; il bendaggio è la procedura più neutra. Il rischio di frattura aumenta negli anni successivi all'intervento." },
  { id:"gi_gastrectomia", nome:"Malattia ossea post-gastrectomia", cat:"Gastro-epatica",
    trigger:[["gastrectomia","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D, calcemia, fosforo, fosfatasi alcalina e PTH (osteomalacia)"],
    nota:"La minore acidità gastrica, il transito accelerato e l'esclusione del duodeno riducono l'assorbimento di calcio e vitamina D. Ne deriva una malattia ossea che combina osteoporosi e osteomalacia, più marcata dopo gastrectomia totale e che può comparire anche molti anni dopo l'intervento." },

  { kind:"sospetto", id:"gi_celiachia_occulta", nome:"Celiachia non ancora diagnosticata", cat:"Gastro-epatica",
    trigger:[["dermatite_erpetiforme","forte"],["diarrea_steatorrea","lieve"],["meteorismo","lieve"],["calo_ponderale","lieve"],["frattura_inspiegata","lieve"]],
    conferma:["Anti-transglutaminasi (tTG) IgA + IgA totali, con dieta contenente glutine","Se IgA totali basse: anti-tTG o anti-gliadina deamidata (DGP) IgG","Anti-endomisio (EMA) IgA a conferma","Biopsia duodenale (diagnosi nell'adulto)"],
    nota:"L'atrofia dei villi riduce l'assorbimento di calcio e vitamina D, con iperparatiroidismo secondario, e si aggiunge una componente infiammatoria. Per questo la celiachia silente o atipica può presentarsi come osteoporosi isolata, con esami di primo livello normali. Gli indizi sono cutanei e gastrointestinali; la conferma è sierologica, da fare prima di togliere il glutine." },

  { kind:"sospetto", id:"gi_whipple_occulta", nome:"Malattia di Whipple non ancora diagnosticata", cat:"Gastro-epatica",
    trigger:[["artralgie_migranti","lieve"],["diarrea_steatorrea","lieve"],["calo_ponderale","lieve"],["meteorismo","lieve"]],
    conferma:["EGDS con biopsie duodenali multiple: macrofagi PAS-positivi nella lamina propria","PCR per Tropheryma whipplei sulla biopsia, a conferma","Se l'istologia è negativa ma il sospetto resta: PCR su altri tessuti o liquidi (liquido sinoviale, liquor)","Invio gastroenterologico o infettivologico"],
    nota:"L'infezione cronica da Tropheryma whipplei infiltra la mucosa del tenue: malassorbimento di calcio e vitamina D, calo di peso e infiammazione sistemica riducono la massa ossea, e nell'uomo può aggiungersi l'ipogonadismo. È una malattia rara, più frequente nell'uomo di mezza età. Le artralgie migranti precedono spesso di anni i sintomi intestinali (diarrea, calo di peso, dolore addominale) e vengono scambiate per un'artrite sieronegativa, curata con glucocorticoidi o immunosoppressori che pesano anch'essi sull'osso; possono associarsi febbre, linfoadenopatie e disturbi neurologici. Un peggioramento dopo l'inizio di immunosoppressori o farmaci biologici deve far pensare a questa diagnosi. La PCR su saliva o feci da sola non basta: esistono portatori sani." },

  { kind:"sospetto", id:"reuma_spa_occulta", nome:"Spondiloartrite assiale non ancora diagnosticata", cat:"Reumatologica",
    trigger:[["lombalgia_infiammatoria","forte"],["vertebrali_giovane","lieve"],["frattura_inspiegata","lieve"]],
    conferma:["PCR (spesso normale: non esclude)","HLA-B27","RM delle sacroiliache (± Rx bacino)","Invio reumatologico"],
    nota:"L'infiammazione cronica causa perdita di osso trabecolare vertebrale, anche mentre si forma osso nuovo (sindesmofiti). La perdita ossea può precedere di anni la diagnosi e presentarsi con fratture vertebrali nel giovane, mentre la lombalgia infiammatoria viene a lungo scambiata per meccanica. La BMD lombare in proiezione antero-posteriore può risultare falsamente alta per le calcificazioni: preferire il femore o la proiezione laterale." },

  { id:"altre_hiv", nome:"Infezione da HIV", cat:"Infettiva / sistemica",
    trigger:[["hiv","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA negli uomini dopo i 50 anni, nelle donne in postmenopausa e con altri fattori di rischio (fratture da fragilità, glucocorticoidi, ipogonadismo, cadute)","25-OH-vitamina D, calcemia e fosforemia","Con TDF: funzione tubulare (TmP/GFR, glicosuria con glicemia normale, proteinuria tubulare)"],
    nota:"L'infezione cronica (attivazione immunitaria e infiammazione persistente), il basso peso, l'ipogonadismo e la carenza di vitamina D riducono la massa ossea. Si aggiunge la terapia antiretrovirale: all'avvio la BMD cala del 2–6% nei primi 1–2 anni, di più con il tenofovir disoproxil (TDF) e con alcuni inibitori delle proteasi. Il passaggio a tenofovir alafenamide (TAF) o a uno schema senza tenofovir fa recuperare parte della BMD: va discusso con l'infettivologo." },
  { id:"altre_bpco", nome:"BPCO", cat:"Respiratoria",
    trigger:[["bpco","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA","Rx del rachide dorso-lombare o morfometria con DXA (VFA), per le fratture vertebrali silenti","25-OH-vitamina D"],
    nota:"Nella BPCO l'osteoporosi è molto frequente, e il rischio cresce con la gravità della malattia. Le cause sono diverse: l'infiammazione sistemica; i glucocorticoidi, soprattutto i cicli orali per le riacutizzazioni, il cui effetto si accumula (quelli inalatori pesano solo ad alte dosi); il fumo; il basso peso; la carenza di vitamina D; la poca attività fisica; l'ipossiemia. Le fratture vertebrali sono spesso silenti, ma riducono il volume della gabbia toracica e peggiorano così la funzione respiratoria." },
  { id:"altre_cf", nome:"Fibrosi cistica", cat:"Respiratoria / genetica",
    trigger:[["fibrosi_cistica","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA (Z-score), da ripetere nel tempo","25-OH-vitamina D, calcemia, PTH","Estradiolo o testosterone se pubertà ritardata o sintomi di ipogonadismo"],
    nota:"Malattia ossea della fibrosi cistica: inizia nell'infanzia e impedisce di raggiungere il picco di massa ossea. Concorrono il malassorbimento delle vitamine D e K (insufficienza pancreatica), l'infiammazione e le infezioni croniche, i glucocorticoidi, il basso peso, il ritardo puberale e l'ipogonadismo, il diabete correlato alla fibrosi cistica e la poca attività fisica. Il difetto di CFTR agisce anche direttamente sulle cellule dell'osso. Dopo il trapianto di polmone la perdita ossea accelera." },
  { id:"altre_emocromatosi", nome:"Emocromatosi / sovraccarico di ferro", cat:"Metabolica / genetica",
    trigger:[["emocromatosi","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA","Testosterone (uomo) o estradiolo (donna), con LH e FSH","25-OH-vitamina D"],
    nota:"Il ferro in eccesso danneggia direttamente gli osteoblasti e stimola gli osteoclasti; depositandosi nell'ipofisi causa ipogonadismo ipogonadotropo. Concorrono diabete ed epatopatia. Vale sia per l'emocromatosi ereditaria sia per il sovraccarico da trasfusioni (talassemia, mielodisplasie). L'osteoporosi può precedere la diagnosi e non sempre migliora con i salassi." },
  { kind:"sospetto", id:"plo", nome:"Osteoporosi della gravidanza e allattamento (PLO)", cat:"Della gravidanza/allattamento", sesso:"donna",
    trigger:[["gravidanza_allattamento","forte"],["vertebrali_giovane","lieve"]],
    conferma:["Fratture documentate con imaging vertebrale: in gravidanza e allattamento si preferisce la RM, senza radiazioni","DXA (Z-score), dopo il parto","Esclusione delle altre cause secondarie: calcemia, PTH, 25-OH-vitamina D, TSH, celiachia, farmaci (eparina, glucocorticoidi)"],
    nota:"Forma rara: fratture da fragilità, quasi sempre vertebrali e spesso multiple, nel terzo trimestre o nei primi mesi di allattamento, in giovani donne di solito senza fattori di rischio noti. L'allattamento fa perdere fisiologicamente il 5–10% della massa ossea (estrogeni bassi, PTHrP prodotto dalla mammella): le fratture compaiono quando la massa ossea di partenza è bassa o si somma un'altra causa, presente in circa metà dei casi. In genere si consiglia di sospendere l'allattamento. Diversa è l'osteoporosi transitoria dell'anca del terzo trimestre (dolore all'anca, edema midollare alla RM)." },

  { kind:"sospetto", id:"emocromatosi_occulta", nome:"Emocromatosi non ancora diagnosticata", cat:"Metabolica / genetica",
    trigger:[["artropatia_mcf","forte"],["iperpigmentazione","lieve"],["astenia","lieve"]],
    conferma:["Saturazione della transferrina e ferritina: sospette con saturazione oltre il 45% nella donna e oltre il 50% nell'uomo","Se aumentate, test genetico HFE: conta l'omozigosi C282Y; H63D da sola non spiega un sovraccarico","Con altro genotipo, RM epatica per quantificare il ferro"],
    nota:"Può presentarsi con osteoporosi prima della diagnosi: il ferro in eccesso danneggia direttamente gli osteoblasti, stimola gli osteoclasti e, depositandosi nell'ipofisi, causa ipogonadismo ipogonadotropo. Indizi fuori dall'osso: artropatia della 2ª e 3ª metacarpo-falangea, pelle bronzina, astenia, diabete, transaminasi alte. L'assetto marziale non è nel primo livello e va richiesto. Una ferritina alta con saturazione normale fa pensare piuttosto a infiammazione, alcol o steatosi." },

  { id:"renale_trapianto", nome:"Osteoporosi post-trapianto d'organo", cat:"Post-trapianto",
    trigger:[["trapianto","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA prima del trapianto o appena possibile dopo, da ripetere a 6–12 mesi","Rx del rachide o morfometria con DXA (VFA)","Calcemia, fosforemia, PTH, 25-OH-vitamina D, funzione renale"],
    nota:"La perdita ossea è rapida nei primi 6–12 mesi dopo trapianto di organo solido o di midollo, e le fratture vertebrali sono frequenti già nel primo anno. Concorrono la malattia di base (insufficienza renale, epatica, cardiaca o respiratoria, spesso già con osteoporosi prima del trapianto), i glucocorticoidi ad alte dosi, gli inibitori della calcineurina e, nel trapianto di rene, l'iperparatiroidismo persistente e l'ipofosforemia. Meglio valutare l'osso già prima del trapianto." },
  { kind:"sospetto", id:"renale_rta", nome:"Acidosi tubulare distale incompleta", cat:"Renale",
    trigger:[["nefrolitiasi_ricorrente","forte"]],
    conferma:["pH urinario del mattino persistentemente >5,5","Test di acidificazione: con furosemide e fludrocortisone (meglio tollerato) o con cloruro d'ammonio; un test con furosemide anormale va confermato con il cloruro d'ammonio","Ipocitraturia a supporto"],
    nota:"Si dice incompleta perché il bicarbonato nel sangue è normale: il rene non riesce ad acidificare le urine, ma il difetto emerge solo con un test da carico. L'acido trattenuto viene tamponato dall'osso, che perde minerale; l'ipocitraturia favorisce calcoli e nefrocalcinosi. Cause da cercare: sindrome di Sjögren e altre malattie autoimmuni, rene a spugna, farmaci." },

  { kind:"sospetto", id:"gen_marfan", nome:"Sindrome di Marfan", cat:"Genetica",
    trigger:[["habitus_marfanoide","forte"],["lussazione_cristallino","forte"],["ipermobilita","lieve"]],
    conferma:["Criteri di Ghent: dilatazione della radice aortica (ecocardiogramma, Z-score ≥2) ed ectopia lentis (visita oculistica) sono i due criteri cardinali","Valutazione genetica FBN1"],
    nota:"Malattia del connettivo da difetto della fibrillina-1 (gene FBN1): habitus marfanoide, lussazione del cristallino verso l'alto, dilatazione della radice aortica. La BMD è spesso ridotta e può essere il primo segno nelle forme lievi. La diagnosi conta soprattutto per il rischio aortico." },
  { kind:"sospetto", id:"gen_eds", nome:"Sindrome di Ehlers-Danlos", cat:"Genetica",
    trigger:[["ipermobilita","forte"],["fragilita_cutanea","lieve"],["ecchimosi","lieve"]],
    conferma:["Criteri clinici della classificazione 2017, con lo score di Beighton per l'ipermobilità","Genetica secondo il sottotipo sospettato; per la forma ipermobile, la più comune, non esiste un test genetico e la diagnosi resta clinica"],
    nota:"Gruppo eterogeneo di disordini del connettivo: ipermobilità articolare, iperestensibilità e fragilità cutanea, ecchimosi facili, cicatrici atrofiche. Il collagene fibrillare alterato fa parte anche della matrice ossea (il tipo V si assembla con il tipo I), e la minore massa muscolare, con il ridotto carico meccanico, dà un osso più piccolo: la fragilità dipende dalla qualità e dalle dimensioni dell'osso più che dalla densità. Negli adulti con forma classica o ipermobile le fratture vertebrali sono più frequenti che nei controlli, anche con BMD normale o poco ridotta: la DXA da sola può sottostimare il rischio e conviene cercare le fratture vertebrali." },
  { kind:"sospetto", id:"gen_omocistinuria", nome:"Omocistinuria", cat:"Genetica",
    trigger:[["habitus_marfanoide","forte"],["lussazione_cristallino","lieve"],["tromboembolismo_giovanile","lieve"]],
    conferma:["Omocisteina plasmatica totale molto elevata (insieme a vitamina B12 e folati, per escludere le cause acquisite)","Metionina (elevata nella forma classica da deficit di CBS)","Genetica (CBS)"],
    nota:"Malattia metabolica ereditaria (deficit di cistationina-β-sintasi): habitus marfanoide ma con lussazione del cristallino verso il basso, tromboembolismo, possibile ritardo cognitivo, osteoporosi e scoliosi. L'osso è fragile perché l'omocisteina in eccesso si lega al collagene e ne ostacola i legami crociati (cross-link), indebolendo la matrice; stimola inoltre gli osteoclasti. Si distingue dalla Marfan per la trombofilia e la direzione della lussazione. Le forme lievi si presentano nell'adulto, spesso con una trombosi, e rispondono alla vitamina B6." },

  { id:"vita_anoressia", nome:"Anoressia nervosa / disturbo alimentare", cat:"Stile di vita / nutrizione",
    trigger:[["anoressia_dca","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA lombare e femorale (prima dei 50 anni si legge lo Z-score)","25-OH-vitamina D, calcemia, fosforemia e magnesemia (fosforo e magnesio scendono durante la rialimentazione)","Estradiolo nella donna, testosterone nell'uomo"],
    nota:"Osteoporosi frequente e precoce, anche nel maschio. Concorrono l'ipogonadismo ipotalamico (amenorrea; testosterone basso nell'uomo), l'eccesso di cortisolo, la resistenza al GH con IGF-1 basso, il basso peso e la malnutrizione. Se la malattia inizia nell'adolescenza manca il picco di massa ossea, e il recupero è spesso incompleto anche dopo la rialimentazione. La pillola estroprogestinica non protegge l'osso e maschera l'amenorrea; se serve una terapia ormonale, si usa l'estradiolo per via transdermica." },
  { id:"vita_alcol", nome:"Abuso cronico di alcol", cat:"Stile di vita / nutrizione",
    trigger:[["alcol","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D, calcemia e magnesemia","Testosterone nell'uomo","Funzione epatica (transaminasi, γGT, albumina)"],
    nota:"Il rischio di frattura aumenta da 3 unità alcoliche al giorno in su; fino a 2 unità non c'è un aumento dimostrato. Concorrono l'effetto tossico diretto sugli osteoblasti, l'ipogonadismo, la malnutrizione con carenza di vitamina D e magnesio, l'epatopatia e le cadute. È una delle cause più frequenti di osteoporosi nell'uomo." },
  { id:"vita_fumo", nome:"Tabagismo", cat:"Stile di vita / nutrizione",
    trigger:[["fumo","lieve"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"Fattore di rischio indipendente dalla BMD: il fumo attuale aumenta il rischio di frattura di circa il 25%, quello di femore fino a quasi il doppio. Riduce l'attività degli osteoblasti, accelera il metabolismo degli estrogeni e anticipa la menopausa. Il rischio negli ex fumatori è più basso: smettere serve anche all'osso." },
  { id:"vita_immobilizzazione", nome:"Immobilizzazione prolungata", cat:"Stile di vita / nutrizione",
    trigger:[["immobilizzazione","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["Calcemia, PTH e calciuria delle 24 ore","25-OH-vitamina D"],
    nota:"Osteoporosi da disuso: senza carico meccanico il riassorbimento aumenta subito, mentre la formazione si riduce; la perdita è rapida già nelle prime settimane di allettamento. Il calcio liberato dall'osso alza la calciuria e sopprime il PTH; nei giovani e nelle immobilizzazioni lunghe può dare ipercalcemia. Per ictus e lesione midollare ci sono le schede neurologiche dedicate." },
  { id:"vita_basso_peso", nome:"Basso peso corporeo (BMI <20 kg/m²)", cat:"Stile di vita / nutrizione",
    trigger:[["basso_peso","lieve"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"Il rischio di frattura cresce quando il BMI scende sotto 20 kg/m²: minore massa ossea di base, meno carico meccanico, meno estrogeni prodotti dal tessuto adiposo e spesso un apporto alimentare scarso. L'effetto passa in gran parte attraverso la BMD. Un basso peso non costituzionale o recente va spiegato: disturbo alimentare, malassorbimento (celiachia), ipertiroidismo, neoplasia." },
  { kind:"sospetto", id:"vita_fha", nome:"Amenorrea ipotalamica funzionale / bassa disponibilità energetica", cat:"Stile di vita / nutrizione", sesso:"donna",
    trigger:[["esercizio_intenso","forte"],["amenorrea","lieve"],["basso_peso","lieve"]],
    conferma:["Amenorrea da almeno 3 mesi o cicli più lunghi di 45 giorni","LH e FSH bassi o normali, con estradiolo basso","È una diagnosi di esclusione: β-hCG, prolattina, TSH e FT4, FSH (per la POI), testosterone e segni di iperandrogenismo (per l'ovaio policistico); RM ipofisaria se cefalea, disturbi visivi o altri deficit ipofisari"],
    osso:["DXA (Z-score) se l'amenorrea dura da almeno 6 mesi, o prima se ci sono fratture da stress","25-OH-vitamina D"],
    nota:"Nella giovane donna con bassa disponibilità energetica (restrizione alimentare, attività fisica intensa o stress) l'ipotalamo spegne l'asse gonadico: estrogeni bassi e perdita ossea (triade dell'atleta, oggi REDs). Ha gli stessi effetti sull'osso dell'anoressia, ma passa più spesso inosservata: va sospettata davanti a osteoporosi o fratture da stress con amenorrea. La terapia è ripristinare il bilancio energetico; la pillola estroprogestinica non protegge l'osso e provoca sanguinamenti che simulano il ciclo." },
  { kind:"sospetto", id:"gen_ipofosfatasia", nome:"Ipofosfatasia dell'adulto (HPP)", cat:"Genetica",
    trigger:[["perdita_denti_precoce","forte"],["frattura_inspiegata","lieve"]],
    conferma:["Fosfatasi alcalina bassa e confermata più volte, escluse le altre cause (terapia antiriassorbitiva, ipotiroidismo, carenza di zinco o magnesio, celiachia, malnutrizione)","Vitamina B6 (piridossal-5-fosfato) elevata, dopo aver sospeso gli integratori di B6","Fosfoetanolammina urinaria a supporto","Gene ALPL"],
    nota:"È una causa di fratture nel giovane adulto che spesso non viene riconosciuta. Si presenta con fratture e pseudofratture ricorrenti (metatarsi, femore), perdita precoce dei denti con la radice intatta, condrocalcinosi e dolori muscolari. Il segnale è la fosfatasi alcalina sempre bassa, che spesso passa inosservata perché i referti mettono in evidenza solo i valori alti. Senza fosfatasi alcalina si accumula il pirofosfato, che impedisce la mineralizzazione dell'osso. I bisfosfonati sono analoghi strutturali del pirofosfato e possono ridurre ancora l'attività della fosfatasi alcalina: aggravano il difetto di mineralizzazione e sono controindicati, e con il loro uso sono state descritte anche fratture atipiche. Di solito si evita anche il denosumab. Esiste una terapia enzimatica sostitutiva (asfotase alfa), approvata per le forme a esordio pediatrico." },

  { id:"neuro_ictus", nome:"Ictus / emiplegia", cat:"Neurologica",
    trigger:[["ictus_emiplegia","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D","DXA del femore dal lato paretico"],
    nota:"Osteoporosi da disuso, più marcata sul lato paretico e soprattutto nel primo anno. Le cadute sono più frequenti e con loro aumentano le fratture, in particolare di femore sul lato paretico. Pesano anche la carenza di vitamina D e, se usati, anticoagulanti e antiepilettici." },
  { id:"neuro_midollo", nome:"Lesione midollare / para-tetraplegia", cat:"Neurologica",
    trigger:[["lesione_midollare","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["DXA di femore totale, femore distale e tibia prossimale (la colonna è poco affidabile)","25-OH-vitamina D","Calcemia nelle prime settimane"],
    nota:"Sotto il livello della lesione la perdita ossea è rapida e marcata nei primi 12–18 mesi e prosegue più lentamente per anni. Oltre metà delle persone con lesione motoria completa ha una frattura nel corso della vita, quasi sempre attorno al ginocchio (femore distale, tibia prossimale) e dopo traumi minimi. Nel giovane, nelle prime settimane, può comparire ipercalcemia da immobilizzazione." },
  { id:"neuro_parkinson", nome:"Malattia di Parkinson", cat:"Neurologica",
    trigger:[["parkinson","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D"],
    nota:"Ridotta mobilità, rigidità, instabilità posturale e cadute, spesso con carenza di vitamina D e calo di peso, portano a BMD bassa e a un rischio elevato di frattura di femore. La prevenzione delle cadute conta quanto la terapia per l'osso." },
  { id:"neuro_sm", nome:"Sclerosi multipla", cat:"Neurologica",
    trigger:[["sclerosi_multipla","forte"]],
    conferma:["Nessun test: condizione già nota"],
    osso:["25-OH-vitamina D"],
    nota:"Concorrono ridotta mobilità, cadute, carenza di vitamina D e cicli ripetuti di glucocorticoidi ad alte dosi. Il rischio cresce con la disabilità." },
  { id:"neuro_epilessia", nome:"Epilessia", cat:"Neurologica",
    trigger:[["epilessia","lieve"]],
    conferma:["Nessun test: condizione già nota"],
    nota:"Il rischio di frattura viene dai traumi durante le crisi e, soprattutto, dagli antiepilettici (vedi la forma da anticonvulsivanti); la malattia in sé aggiunge poco." }
];

/* ============================================================
   MOTORE — stessa logica dell'originale
   ============================================================ */
const allExams = exams.concat(complementari);
const altIndex = {};
allExams.forEach(e => e.alts.forEach(a => { altIndex[a.id] = Object.assign({}, a, { examName: e.name }); }));
const dxToAlts = {};
Object.keys(altIndex).forEach(id => altIndex[id].dx.forEach(cid => { (dxToAlts[cid] = dxToAlts[cid] || []).push(id); }));
const cstate = {};

function selFindings(){ const s=[]; for(const ex in cstate){ const st=cstate[ex]; if(st==='alto')s.push([ex,'u']); else if(st==='basso')s.push([ex,'d']); else if(st==='pres')s.push([ex,'u']); } return s; }
function covers(f,s){ return f.f.some(x=>x[0]===s[0] && x[1]===s[1]); }
function contradicted(f,sel){ return sel.some(s=>{ const k=f.k[s[0]]; return k && k[0]!==s[1]; }); }
function normEx(f){ for(const ex in cstate){ if(cstate[ex]==='norm'){ const k=f.k[ex]; if(k && k[1]===0 && k[0]!=='n') return ex; } } return null; }
function ftag(s){ return CEXNAME[s[0]] + (s[0]==='MSpike'?'':(s[1]==='u'?' ▲':' ▼')); }
function multiCauseF(elig, sel){
  const key=s=>s[0]+':'+s[1];
  const cov = elig.map(f=>({f,c:sel.filter(s=>covers(f,s))})).filter(x=>x.c.length);
  const coverable=new Set(); cov.forEach(x=>x.c.forEach(s=>coverable.add(key(s))));
  const pool=cov.map(x=>({f:x.f,all:x.c.slice()})); const unc=new Set([...coverable]); const chosen=[];
  while(unc.size){ let best=null,bestN=0; pool.forEach(pp=>{const n=pp.all.filter(s=>unc.has(key(s))).length; if(n>bestN){best=pp;bestN=n;}}); if(!best||bestN===0)break; const covd=best.all.filter(s=>unc.has(key(s))); chosen.push({f:best.f,covers:covd}); covd.forEach(s=>unc.delete(key(s))); pool.splice(pool.indexOf(best),1); }
  return { chosen, leftover: sel.filter(s=>!coverable.has(key(s))) };
}
/* Esito esami alterati: kind = none | inter (forme che spiegano tutto) | multi (più cause) | empty */
function computeA(){
  const sel = selFindings();
  if(!sel.length) return { sel, kind:"none", forms:[], leftover:[], panel:[], excluded:[] };
  const elig = FORMS.filter(f => !normEx(f) && !contradicted(f, sel));
  const inter = elig.filter(f => sel.every(s => covers(f, s)));
  let kind, forms = [], leftover = [];
  if(inter.length){ kind = "inter"; forms = inter.map(f => ({ cid: f.cid })).sort(byFreq); }
  else {
    const mc = multiCauseF(elig, sel);
    if(mc.chosen.length){ kind = "multi"; forms = mc.chosen.map(c => ({ cid: c.f.cid, sub: "spiega " + c.covers.map(ftag).join(" · ") })).sort(byFreq); leftover = mc.leftover; }
    else kind = "empty";
  }
  const sels = new Set(); for(const ex in cstate){ if(cstate[ex]) sels.add(CEXNAME[ex]); }
  const freq = {}; forms.forEach(x => (LAB2[x.cid]||[]).forEach(ex => { if(!FIRST_LEVEL.has(ex) && !sels.has(ex)) freq[ex] = (freq[ex]||0) + 1; }));
  const panel = Object.keys(freq).sort((a,b) => freq[b]-freq[a]).map(ex => [ex, freq[ex]]);
  /* esami di II livello forma per forma, nello stesso ordine (dalla più probabile) */
  const byForm = forms.map(x => [x.cid, (LAB2[x.cid]||[]).filter(ex => !FIRST_LEVEL.has(ex) && !sels.has(ex))]).filter(x => x[1].length);
  const excluded = FORMS.filter(f => { const e = normEx(f); return e && !contradicted(f, sel) && sel.some(s => covers(f, s)); }).map(f => [f.cid, CEXNAME[normEx(f)]]);
  return { sel, kind, forms, leftover, panel, byForm, excluded };
}
/* esami di II livello per forma: aperti quelli della causa più probabile; solo su sospetto clinico */
const L2_NOTE = "Da richiedere solo se c'è un sospetto clinico, partendo dalla causa più probabile.";
function l2ByFormHTML(byForm, name){
  return byForm.map((x, i) => `<details class="acc l2f"${i ? "" : " open"}><summary><span>${name(x[0])}<small>${x[1].length === 1 ? "1 esame" : x[1].length + " esami"}${i ? "" : " · causa più probabile"}</small></span>${'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 6 6 6-6 6"/></svg>'}</summary><div class="accbody"><ul class="list">${x[1].map((e, j) => `<li><i>${j+1}</i>${e}</li>`).join("")}</ul></div></details>`).join("");
}

function axisFeats(a){ return a.groups ? a.groups.flatMap(g=>g.feats) : a.feats; }
const FEATLABEL = {}, FEATSEX = {};
AXES.forEach(a => axisFeats(a).forEach(f => { FEATLABEL[f[0]] = f[1]; if(f[2]) FEATSEX[f[0]] = f[2]; }));
Object.values(SPECIFICHE).forEach(l => l.forEach(f => { FEATLABEL[f[0]] = f[1]; }));

const FORMA = {}; FORME.forEach(f => { FORMA[f.id] = f; });
const W = { forte:2, lieve:1 };
let sex = null;
const selected = new Set();
/* voci spuntate più le voci specifiche accese da quelle generiche */
function active(){ const a = new Set(selected); selected.forEach(id => (ACCENDE[id]||[]).forEach(x => a.add(x))); return a; }
function visibleForms(){ return FORME.filter(f => !f.sesso || !sex || f.sesso === sex); }
function featVisible(id){ return !FEATSEX[id] || !sex || FEATSEX[id] === sex; }
function computeN(){
  const act = active();
  const matched = visibleForms().map(f => {
    const fired = f.trigger.filter(t => act.has(t[0]));
    const primary = fired.filter(t => t[2] !== "supp");
    /* ogni voce spuntata conta una volta sola per scheda, anche se accende più frasi (prima le più forti) */
    const used = new Set(); let score = 0;
    [...fired].sort((a,b) => W[b[1]] - W[a[1]]).forEach(t => {
      const s = [...selected].find(x => !used.has(x) && (x === t[0] || (ACCENDE[x]||[]).includes(t[0])));
      if(s){ used.add(s); score += W[t[1]]; }
    });
    const hasForte = primary.some(t => t[1] === "forte");
    return { f, fired, primary, score, hasForte };
  }).filter(x => x.primary.length > 0 && !(x.f.suppressedBy && x.f.suppressedBy.some(id => act.has(id))));
  const byScore = (a,b) => b.score - a.score || b.hasForte - a.hasForte;
  return { note: matched.filter(x => x.f.kind !== "sospetto").sort(byScore), sosp: matched.filter(x => x.f.kind === "sospetto").sort(byScore) };
}

const FORMA_CAT = { "Farmaci":"Farmaci", "Endocrina":"Endocrinologia", "Reumatologica":"Reumatologia", "Gastro-epatica":"Gastroenterologia", "Ematologica / sistemica":"Ematologia",
  "Post-trapianto":"Trapianti", "Renale":"Nefrologia", "Genetica":"Genetica", "Genetica / del collagene":"Genetica", "Metabolica / genetica":"Genetica",
  "Stile di vita / nutrizione":"Stile di vita", "Neurologica":"Neurologia", "Respiratoria":"Pneumologia", "Respiratoria / genetica":"Pneumologia",
  "Infettiva / sistemica":"Malattie infettive", "Della gravidanza/allattamento":"Gravidanza" };
function badgeOf(x, isSosp){ return isSosp ? (x.hasForte ? "sospetto forte" : "da considerare") : (x.hasForte ? "causa riconosciuta" : "associazione possibile"); }
