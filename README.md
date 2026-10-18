# Osteo Help — versione minimal

Strumento di ragionamento clinico per l'**osteoporosi secondaria**: dalle alterazioni degli esami di primo livello, o dal quadro clinico quando gli esami sono normali, alle forme secondarie da sospettare e agli accertamenti di secondo livello.

È la riscrittura grafica di [Osteo Help](https://github.com/aurex-cmd/Osteo-Help): stessi contenuti clinici e stessa logica, interfaccia ridotta all'essenziale (niente sfondi, illustrazioni, testi introduttivi o blocchi ripetuti). La versione originale resta nel suo repository.

## Come si usa

L'app procede per schermate, una cosa alla volta:

1. **Home**: si sceglie da dove partire, *Esami alterati* o *Esami normali*.
2. **Inserimento**: si segnano gli esami (▲ alto, ▼ basso, N normale) oppure si spuntano farmaci, malattie, segni e anamnesi. La barra in basso dice subito quanti risultati ci sono.
3. **Risultato**: l'elenco delle forme compatibili, con gli esami di II livello consigliati.
4. **Scheda**: toccando una forma si apre la sua scheda, con in alto l'etichetta colorata della categoria (es. Endocrinologia, Farmaci) (reperti tipici, esami di II livello, perché fa male all'osso; per le forme cliniche: quando considerarla, conferma, nota).

In alto a destra nella home un pulsante (luna / sole) passa dal tema chiaro allo scuro; la scelta viene ricordata. Senza scelta, l'app segue il tema del dispositivo.

In fondo a ogni scheda la sezione **Fonti** riporta le voci di bibliografia dedicate a quella forma, con il loro numero: toccandolo si apre la bibliografia evidenziando la voce. Le schede senza una fonte dedicata rimandano alle linee guida generali.

La home, su fondo grigio chiaro, è una griglia di tessere come in Osteoclick: in alto i due percorsi (esami alterati in corallo, esami normali in verde menta), poi catalogo delle forme, pattern da riconoscere (un tocco ne mostra il risultato), esame per esame e calcio corretto. La bibliografia si apre dal link in fondo alla pagina.

**Logica (invariata rispetto all'originale)**
- *Esami alterati*: compaiono le forme compatibili con **tutti** i reperti segnati. Se nessuna forma da sola li spiega, il quadro viene letto come più cause indipendenti. Un esame segnato N esclude le forme in cui quell'esame è un reperto chiave.
- *Esami normali*: ogni forma ha trigger forti (bastano da soli) o lievi (contano se si sommano). Le forme sono divise in cause note presenti e sospetti da approfondire. Il sesso nasconde le voci non pertinenti.

## Correzioni rispetto all'Osteo Help originale

- **Osteoporosi da inibitori dell'aromatasi**: non più limitata alla donna. Il farmaco si usa, raramente, anche nell'uomo; la voce compare quindi con entrambi i sessi.

### Revisione della categoria Farmaci

- **Testi**: riscritte note e criteri di conferma delle 16 forme farmacologiche e delle due voci sui farmaci nel percorso "esami alterati". Tra le correzioni di sostanza:
  - soglia dei glucocorticoidi allineata alla Nota 79 AIFA (≥5 mg/die per più di 3 mesi, in atto o previsto);
  - rosiglitazone indicato come non più in commercio in Europa;
  - segnale di fratture da SGLT2-inibitori limitato al canagliflozin;
  - magnesemia tra gli esami per valutare l'osso per gli inibitori di pompa protonica (non nella conferma);
  - TmP/GFR e segni di tubulopatia per il tenofovir.
- **Analoghi del GnRH**: la voce del quadro clinico ora precisa "non per carcinoma prostatico", per evitare il doppione con la deprivazione androgenica (ADT).
- **Pesi**: inibitori della calcineurina e diuretici dell'ansa passano da forte a lieve. Compaiono ancora tra le cause note, ma come "associazione possibile" invece che "causa riconosciuta".
- **Nuove forme**: osteoporosi da medrossiprogesterone depot (solo donna, peso lieve) e da oppioidi in uso cronico (peso lieve), con le relative voci nel quadro clinico.
- **Esami alterati**: "Farmaci (tiazidici, litio)" diventa "Farmaci che alzano il calcio (tiazidici, litio)".

### Revisione della categoria Endocrino-metaboliche

- **Testi**: riscritte note e criteri di conferma delle 9 forme endocrino-metaboliche e delle 5 voci endocrinologiche del percorso "esami alterati". Tra le correzioni di sostanza:
  - soglie del testosterone corrette (264–300 ng/dL, circa 9,2–10,4 nmol/L);
  - POI: un solo FSH >25 UI/L basta, come nelle linee guida ESHRE 2024;
  - deficit di GH: test con glucagone o macimorelin al posto di GHRH-arginina e regola dei tre deficit ipofisari;
  - Cushing: esclusione dei glucocorticoidi esogeni e ipercortisolismo lieve autonomo;
  - ipercalcemia ipocalciurica familiare: zona grigia del rapporto di clearance tra 0,01 e 0,02.
- **Pesi**: per l'ipogonadismo maschile, ginecomastia e disfunzione erettile passano da forte a lieve. Da sole portano la forma tra i "da considerare" invece che tra i "sospetti forti".
- **Nuova voce**: "Incidentaloma surrenalico" nel quadro clinico, criterio forte per il Cushing.
- **Nomi e categorie**: "Diabete tipo 2 — rischio sottostimato dalla BMD" diventa "Diabete mellito tipo 2"; "Calo ponderale marcato" passa a Stili di vita e nutrizione; la voce "Osteoporosi/Fratture inspiegate in giovani" diventa "Osteoporosi o fratture inspiegate in età giovane".
- **Esami alterati**: per l'ipertiroidismo si aggiunge la scintigrafia tiroidea se i TRAb sono negativi.

### Revisione della categoria Reumatologiche

- **Testi**: riscritte le note di LES, artrite psoriasica e sclerosi sistemica; artrite reumatoide e spondilite anchilosante restano come nell'originale.
- **Spondiloartrite assiale (sospetto)**: rinominata "Spondiloartrite assiale non ancora diagnosticata", per distinguerla dalla forma già nota; PCR e HLA-B27 prima della RM delle sacroiliache.
- **Esami alterati**: "Connettivite" diventa "Connettivite o artrite infiammatoria", con fattore reumatoide e anti-CCP tra gli esami di II livello; nota della flogosi riscritta.

### Revisione della categoria Gastro-epatiche

- **Esami per valutare l'osso**: nuova sezione nelle schede, separata dalla conferma (che resta la conferma diagnostica). Per IBD, celiachia nota, epatopatia, chirurgia bariatrica e gastrectomia elenca gli esami che misurano l'effetto della malattia sull'osso (25-OH-vitamina D, calcemia, PTH, fosfatasi alcalina, DXA dove indicata).
- **Nomi**: le due forme "Celiachia" diventano "Celiachia nota" e "Celiachia non ancora diagnosticata".
- **Celiachia non ancora diagnosticata**: sierologia con dieta contenente glutine; test IgG se le IgA totali sono basse.
- **Testi**: riscritte le note delle 6 forme; per la chirurgia bariatrica la sleeve gastrectomy non è più descritta come neutra per l'osso.
- **Esami alterati**: elastasi fecale tra gli esami del malassorbimento; esami della colestasi riordinati con ecografia epatica; "Epatopatia" diventa "Epatopatia cronica / cirrosi".

### Revisione Renali e Neurologiche

- **Acidosi tubulare distale incompleta**: test di acidificazione anche con furosemide e fludrocortisone (un risultato anormale va confermato con cloruro d'ammonio); cause da cercare nella nota.
- **Neurologiche**: note riscritte; nuova sezione "Esami per valutare l'osso" per ictus, lesione midollare (DXA anche a femore distale e tibia prossimale), Parkinson e sclerosi multipla.
- **Esami alterati**: "IRC / CKD-MBD" diventa "Insufficienza renale cronica (CKD-MBD)", con la sigla spiegata nella nota; catene leggere libere per la sindrome di Fanconi; citraturia per l'acidosi tubulare; sodiuria e PTH chiariti per l'ipercalciuria idiopatica.

### Revisione Genetiche ed Ematologiche

- **Testi**: riscritte note e conferme di Marfan, Ehlers-Danlos, omocistinuria (meccanismo osseo: alterati legami crociati del collagene), ipofosfatasia (bisfosfonati controindicati perché analoghi del pirofosfato), osteogenesi imperfetta e mastocitosi (mastociti clonali nel midollo; KIT D816V su sangue prima della biopsia).
- **Pesi**: lussazione del cristallino da lieve a forte per la Marfan; familiarità per fratture da forte a lieve per l'osteogenesi imperfetta.
- **Esami alterati**: TC total body a basse dosi senza mezzo di contrasto per il mieloma; analisi genetica alfa-globinica per la talassemia; anche la talassemia minor può ridurre la BMD.

### Revisione Stili di vita e nutrizione

- **Testi**: riscritte le note delle 7 forme. Tra le correzioni di sostanza:
  - anoressia anche nel maschio; la pillola estroprogestinica non protegge l'osso (estradiolo transdermico se serve una terapia ormonale);
  - alcol: rischio di frattura da 3 unità al giorno in su;
  - fumo: rischio di frattura di femore quasi raddoppiato, più basso negli ex fumatori;
  - basso peso e calo ponderale non voluto vanno spiegati (celiachia, ipertiroidismo, neoplasia);
  - amenorrea ipotalamica funzionale: criteri di diagnosi e DXA come nella linea guida Endocrine Society 2017.
- **Esami per valutare l'osso**: nuova sezione per anoressia, alcol, immobilizzazione e amenorrea ipotalamica.
- **Pesi**: basso peso corporeo da forte a lieve. Compare come "associazione possibile" invece che "causa riconosciuta".
- **Soglie nelle voci del quadro clinico**: "Alcol: 3 o più unità al giorno", "Basso peso corporeo (BMI <20 kg/m²)", "Calo ponderale di oltre il 5% in 6–12 mesi".
- **Esami alterati**: carenza di vitamina D con soglie, magnesemia e PTH da ricontrollare dopo la correzione; malnutrizione con la spiegazione della fosfatasi alcalina bassa e il rimando all'ipofosfatasia; 25-OH-vitamina D per distinguere il ridotto introito di calcio dalla carenza di vitamina D; PTH soppresso nell'immobilizzazione.
- **Nessun riferimento al FRAX**: tolto anche dalla nota del diabete tipo 2.

### Revisione Altre condizioni

- **Testi**: riscritte le note di HIV (recupero della BMD passando da TDF a TAF), BPCO (fratture vertebrali silenti), fibrosi cistica, emocromatosi, osteoporosi della gravidanza e allattamento (RM, cause secondarie da escludere, osteoporosi transitoria dell'anca) e post-trapianto (valutare l'osso già prima).
- **Esami per valutare l'osso**: nuova sezione per HIV, BPCO, fibrosi cistica, emocromatosi nota e trapianto.
- **Emocromatosi non ancora diagnosticata**: nuovo nome; soglie di saturazione della transferrina (oltre 45% nella donna, oltre 50% nell'uomo) e ruolo dei genotipi HFE come nelle linee guida EASL 2022.
- **Esami alterati**: riviste neoplasia, ipercalcemia maligna, sarcoidosi, intossicazione da vitamina D (difetto di CYP24A1), ipomagnesiemia (frazione escreta), Paget (prima esclusa l'origine epatica della fosfatasi), MGUS e osteomalacia ipofosfatemica, con il ferro carbossimaltosio endovena tra le cause e il suo meccanismo (blocco della degradazione dell'FGF23 intatto).

### Bibliografia

- Aggiunte 9 fonti nell'elenco "esami normali" a supporto delle revisioni Farmaci ed Endocrino-metaboliche: Nota 79 AIFA (2022), linee guida ESE sull'incidentaloma surrenalico (2023), AACE sul deficit di GH (2019), due studi sul diabete (Vilaca 2020, Leslie 2018), glitazoni (Loke 2009), CANVAS (Neal 2017), ACOG sul medrossiprogesterone (2014), oppioidi (Fountas 2020).
- Aggiunte 3 fonti per le Gastro-epatiche: linee guida ECCO sulle manifestazioni extraintestinali delle IBD (2024), EASL sulla nutrizione nell'epatopatia cronica (2019), AACE/ASMBS sulla chirurgia bariatrica (2019).
- Aggiunte 3 fonti per Renali e Neurologiche: KDIGO 2017 sulla CKD-MBD, Walsh 2007 sul test con furosemide e fludrocortisone, posizione ufficiale ISCD 2019 sulla lesione midollare.
- Aggiunte 3 fonti per Genetiche ed Ematologiche: linee guida sull'omocistinuria (Morris 2017), alfa-triptasemia ereditaria (Lyons 2016), linee guida TIF 2025 sulla talassemia (elenco "alterati").
- Aggiunte 6 fonti per Stili di vita e nutrizione: linea guida Endocrine Society sull'amenorrea ipotalamica funzionale (Gordon 2017), estrogeni nell'anoressia (Misra 2011), alcol (Kanis 2005), fumo (Kanis 2005), indice di massa corporea (De Laet 2005), calo ponderale (Ensrud 2003).
- Aggiunte 5 fonti per Altre condizioni: linee guida EACS sull'HIV (2023), ECFS sulla fibrosi cistica (2011), EASL sull'emocromatosi (2022), Kovacs e Ralston su gravidanza e allattamento (2015), studi PHOSPHARE sul ferro carbossimaltosio (Wolf 2020, elenco "alterati").
- Aggiunte 24 fonti per le forme che non ne avevano una dedicata: 17 nell'elenco "esami normali" (anticonvulsivanti ed epilessia, eparine, inibitori della calcineurina, diuretici dell'ansa, inibitori di pompa protonica, SSRI, metotrexato, analoghi del GnRH, artrite reumatoide, LES, artrite psoriasica, sclerosi sistemica, gastrectomia, BPCO, ictus, Parkinson, sclerosi multipla) e 7 nell'elenco "alterati" (tiazidici, litio, ipomagnesiemia, sindrome di Fanconi, ipercalciuria idiopatica, acidosi tubulare, epatopatia cronica). Dove manca una linea guida dedicata la fonte è uno studio o una metanalisi sul rischio di frattura.
- Aggiornata la nota finale dell'elenco: glitazoni, SGLT2-inibitori, diabete, cause gastro-epatiche (tranne la gastrectomia), acidosi tubulare, lesione midollare, stili di vita (tranne l'immobilizzazione), HIV, fibrosi cistica e gravidanza ora hanno una fonte propria.

## File

| File | Contenuto |
|---|---|
| `index.html` | L'intera app (HTML, CSS, JavaScript e icone SVG incorporate, nessuna dipendenza) |
| `favicon.svg` | Icona della scheda del browser (SVG, con `favicon-32.png` come riserva) |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon-180.png`, `favicon-32.png` | Installazione come app (PWA) |
| `.nojekyll` | Fa servire i file a GitHub Pages così come sono |

Unica risorsa esterna: il font Manrope da Google Fonts (senza connessione si usa il font di sistema).

Le icone della home sono di [Health Icons](https://healthicons.org) (© 2021 Resolve to Save Lives, licenza MIT), incorporate in `index.html`; provetta e calcolatrice sono disegnate per questa app. Nelle schede la categoria di ogni forma è indicata da un'etichetta colorata sopra il titolo.

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository (es. `osteo-help-minimal`), pubblico, senza README.
2. Carica nella *root* tutti i file di questa cartella, compreso `.nojekyll`.
3. **Settings → Pages → Build and deployment**: *Deploy from a branch*, branch `main`, cartella `/ (root)`, **Save**.
4. Dopo qualche minuto l'app è online su `https://<utente>.github.io/osteo-help-minimal/`.

Per aprire direttamente una schermata: `…/#alterati` oppure `…/#normali`.

## Installazione come app

- **iPhone/iPad (Safari)**: Condividi → Aggiungi alla schermata Home.
- **Android (Chrome)**: menu ⋮ → Installa app.
- **Desktop (Chrome/Edge)**: icona di installazione nella barra degli indirizzi.

## Avvertenze

Ausilio al ragionamento clinico, non sostitutivo del giudizio dello specialista e non un algoritmo diagnostico. Le alterazioni sono direzionali (▲ ▼), senza soglie numeriche: vanno lette sui range del proprio laboratorio. Nella sezione "Esami normali" i trigger forte/lieve sono una proposta ragionata, da validare nella pratica. La bibliografia completa è in fondo a ciascuna sezione.

Creato dal Dr. Aurelio Guarnaccia.
