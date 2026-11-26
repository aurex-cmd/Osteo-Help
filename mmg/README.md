# Osteo Help MMG

Software per il medico di medicina generale: gestione del paziente con osteoporosi, dalla raccolta dei dati al DeFRA, alla terapia e al follow-up.

È un'app **separata** da Osteo Help, con lo stesso stile. Osteo Help (`../index.html`) non viene modificato: questa app ne usa una copia dei dati clinici e dei motori di ragionamento, e ne apre le schede in un'altra scheda del browser.

## Come si usa

Per ogni paziente un **percorso guidato in 7 passi**: in cima a ogni pagina una barra mostra a che passo si è («Passo 3 di 7») e quale viene dopo; in fondo «Indietro» e «Avanti». La scheda del paziente mostra il percorso con lo stato di ogni passo (fatto, attenzione, da fare) e un pulsante «Continua» che porta al prossimo passo da fare. L'elenco dei pazienti dice per ognuno a che passo è rimasto.

1. Dati e fratture · 2. Anamnesi e farmaci · 3. Esami del sangue · 4. Densitometria · 5. DeFRA · 6. Terapia (con la decisione del medico: terapia avviata, invio allo specialista, nessun farmaco, decisione rimandata) · 7. Follow-up.


- **Gestionale osteoporosi** (pagina iniziale): nuovo paziente, archivio dei pazienti, **Da fare** (scadenze di tutti i pazienti in ordine di urgenza: dose di denosumab in ritardo o vicina, infusione annuale di zoledronato, fine di teriparatide/abaloparatide/romosozumab, bisfosfonato da 5 anni o zoledronato da 3, DXA da ripetere, frattura recente senza terapia, decisione rimandata), promemoria del backup se l'archivio è cambiato e l'ultimo backup ha più di 14 giorni, backup e ripristino, blocco con codice. Sul computer la pagina è su due colonne.
- **Scheda del paziente**: zona del DeFRA e T-score minimo, avvisi, cose da fare per quel paziente, i 7 passi con lo stato (ok, manca, attenzione) e quattro documenti: **Copia per la cartella** (riepilogo in testo da incollare nel gestionale), **Report**, **Lettera allo specialista** (già compilata, con quesito e firma modificabili) e **Foglio per il paziente** (come prendere il farmaco, data della prossima dose, denti, calcio, vitamina D, movimento, prevenzione delle cadute, prossimi controlli).
  1. **Dati e fratture**: anagrafica, BMI, menopausa, familiarità per fratture di femore o vertebre, fratture da fragilità (sede, data, gravità vertebrale secondo Genant, frattura nonostante almeno un anno di terapia).
  2. **Anamnesi e terapie**: le voci di «Esami normali» di Osteo Help; le forme secondarie sono riconosciute in automatico con lo stesso motore e rimandano alle schede di Osteo Help. In più: glucocorticoidi da oltre 12 mesi, grave disabilità motoria, controindicazioni da conoscere (esofago, tromboembolismo, eventi cardiovascolari, radioterapia scheletrica, problemi dentari) e visita odontoiatrica eseguita. In cima, **Incolla dal gestionale**: si incolla il riassunto di problemi e terapia esportato dal gestionale e l'app propone le voci da spuntare (anamnesi e controindicazioni). Riconosce principi attivi e nomi commerciali, sinonimi e abbreviazioni (BPCO, AR, DM2, TVP, IMA…), tipo 1/tipo 2 anche in numeri romani, desinenze diverse e piccoli errori di battitura; segnala le voci negate nel testo («ex fumatore», «nega…», «no…») e quelle da verificare (L-tiroxina, metotrexato, diabete senza tipo, farmaci che suggeriscono una malattia) lasciandole non spuntate. Il dizionario è in `riconosci.js`; tutto avviene nel browser. Ogni sezione mostra un'anteprima delle voci che contiene.
  3. **Esami di I livello**: la griglia ▲ N ▼ di «Esami alterati» con un campo facoltativo per il valore e il pulsante «Tutti gli altri nella norma». eGFR, 25-OH-vitamina D, calcio totale e albumina si scrivono in numeri e segnano da soli le righe corrispondenti (eGFR < 60; vitamina D bassa sotto 75 nmol/L (30 ng/mL, obiettivo nel paziente con osteoporosi o a rischio di ipovitaminosi D secondo la Nota 96) e alta sopra 250 nmol/L (100 ng/mL), con l'invito a ridurre l'integrazione; solo sopra 375 nmol/L (150 ng/mL) entra nel motore come «alta» e fa comparire l'intossicazione da vitamina D tra le forme compatibili (soglie della Tabella I delle linee guida SIOMMMS: Adami S et al., Reumatismo 2011;63(3):129-147); l'unità predefinita è nmol/L, con ng/mL a scelta; calcio corretto per l'albumina = calcio + 0,8 × (4 − albumina), limiti 8,5–10,5 mg/dL; albumina < 3,5 g/dL, anche in g/L); forme compatibili ed esami di II livello con lo stesso motore. Avvisi per fosfatasi alcalina bassa (ipofosfatasia: bisfosfonati controindicati), ipocalcemia e carenza di vitamina D.
  4. **DeFRA**: cosa serve per completarlo, riepilogo dei dati da riportare, collegamento al calcolatore (defra-osteoporosi.it). Il medico inserisce la **zona** indicata dal DeFRA, le cui soglie dipendono dall'età, e se vuole la percentuale di rischio a 10 anni (se presente, decide la soglia del 20% della Nota 79 per il romosozumab):
     - **verde** (basso rischio): nessun farmaco per l'osteoporosi; vitamina D (Nota 96), calcio, attività fisica, prevenzione delle cadute;
     - **gialla** (rischio moderato): terapia di prima linea dal MMG, bisfosfonati orali o denosumab, con vitamina D;
     - **arancione** (alto) e **rossa** (altissimo, con priorità): invio allo specialista dell'osso per anabolici (teriparatide, abaloparatide) o romosozumab, poi un antiriassorbitivo.
  5. **Indicazioni alla terapia**: condizioni della Nota 79 secondo la determina AIFA dell'8 settembre 2025 (n. 1127/2025), con I, II e III scelta, sotto l'indicazione che viene dalla zona del DeFRA; ogni farmaco è segnato «controindicato» o «cautela» in base ai dati del paziente. Terapie in corso con promemoria (denosumab da non interrompere, rivalutazione dei bisfosfonati a 5 anni o 3 per lo zoledronato, durata massima degli anabolici), condizione della Nota 79 che giustifica ogni farmaco in corso, registrazione delle dosi di denosumab e zoledronato con la data della prossima. Senza decisione registrata il pulsante in fondo porta alla decisione invece che al passo successivo.
  6. **Storico e follow-up**: DXA nel tempo (grafico, differenza con la precedente), prossima DXA tra 18 e 24 mesi dall'ultima, zone del DeFRA nel tempo (migliorata o peggiorata), rischio imminente di rifrattura se c'è una frattura negli ultimi 24 mesi.
  - **Report** stampabile o da salvare in PDF.
- **Guida per il MMG**: cos'è l'osteoporosi, cosa comporta, perché si cura, perché cercare le forme secondarie, esami di I livello, DeFRA, Nota 79, calcio, vitamina D e stile di vita, follow-up; una scheda per ognuno dei 10 farmaci. La scheda dello zoledronato ha in più «Guarda come agisce», che apre `fpps.html`: un'animazione 3D in 14 passaggi sul blocco della FPPS (via 1: apoptosi dell'osteoclasta, effetto terapeutico; via 2: IPP, linfociti T γδ, citochine e reazione di fase acuta, modulata dai glucocorticoidi). Usa three.js da cdnjs, quindi senza connessione non parte.

- **Pazienti senza nome**: nell'archivio hanno una ✕ rossa per eliminarli subito (dopo conferma), senza aprire la scheda.

## Vista a figura

La scheda del paziente si apre come **figura** (la si può cambiare con «Percorso a passi»; l'app ricorda la scelta). La figura dipende da sesso, età e fratture recenti: donna o uomo giovane (sotto i 60 anni), donna o uomo anziano, e, con una frattura negli ultimi 24 mesi, donna o uomo in carrozzina (femore, a qualunque età), con il busto ortopedico (vertebre) o con il polso immobilizzato (polso); con più fratture recenti vale la più grave, nell'ordine femore, vertebre, polso. Per un paziente nuovo si sceglie prima «Chi entra in ambulatorio?».

- **Punti sulla figura** («indizi»): testa → chi è (età, peso, menopausa, familiarità); frattura → fratture da fragilità; busto → malattie e farmaci (con «Incolla dal gestionale»). Ogni punto pulsa finché manca, diventa verde quando è completo e rosso quando contiene qualcosa che pesa sulla decisione; l'etichetta accanto riassume il dato.
- **La strada dei 7 passi** (su PC): tra la figura e il pannello a destra, in verticale e numerata come nel percorso a tappe, con lo stato di ogni passo (✓ fatto, ! da rivedere, numero se manca), «prossimo» sotto il passo da fare e il passo aperto evidenziato. Toccando un passo si apre la sezione; «Terapia» porta a «Decidi la terapia» (senza zona del DeFRA apre prima il DeFRA). Sul PC la vista a figura è più larga e le barrette in alto non ci sono più; sul telefono restano.
- **Sezioni con «Indietro» e «Avanti»**: toccando un punto o un bollino si apre la sezione (su PC nel pannello a destra, sul telefono in una scheda che sale dal basso come quelle di iOS: sale e scende in 0,5 s con la stessa curva, il fondo si scurisce insieme, e si chiude anche trascinandola verso il basso dalla maniglia, dalla testata o dal contenuto già in cima; se il trascinamento è breve torna su), con in alto, solo sul telefono, le sei sezioni in ordine (Chi è, Fratture, Anamnesi, Esami, DXA, DeFRA), ognuna con un pallino di stato (su PC c'è già la strada dei 7 passi), e in basso «‹ Indietro» e «Avanti ›»; dopo il DeFRA il pulsante diventa «Decidi la terapia». La sezione aperta si accende sulla figura (punto o bollino evidenziato, il resto attenuato); su PC la figura resta ferma mentre si scorre il modulo. «Riepilogo» torna alla colonna con la prossima mossa.
- **Medaglioni in basso sulla figura**: esami del sangue, DeFRA (cerchio nel colore della zona, con il rischio a 10 anni in % se inserito), T-score della colonna e T-score del femore (il peggiore tra femore totale e collo), colorati per classe: rosso osteoporosi, ambra osteopenia, verde normale; con l'anno se la DXA ha più di 24 mesi. Se mancano sono tratteggiati con «?»; toccandoli si apre il riquadro del DeFRA o della densitometria.
- **Caso completo** (dati, fratture, anamnesi, densitometria e DeFRA inseriti): i punti spariscono e sulla figura restano solo i dati che contano, tutti nello stesso formato (cerchio colorato con il valore e due righe di testo) e sempre allo stesso posto. A sinistra il paziente: età, familiarità (sì o no), le fratture (una sola: sede e data; più di una: «Fratture multiple» con il numero, le sedi su una riga e l'elenco con le date che si apre toccandolo) o «Nessuna frattura», fino a due controindicazioni (no bisfosfonati, eGFR sotto 35, no romosozumab, no raloxifene, visita odontoiatrica per il nulla osta alla terapia). A destra gli esami: T-score peggiore con la sede, osteoporosi secondaria in un solo bollino (il numero di condizioni nel cerchio e i nomi su una riga; toccandolo si apre l'elenco completo, con le cause dall'anamnesi, quelle compatibili con gli esami e il collegamento alla scheda di Osteo Help, più i pulsanti per malattie e farmaci ed esami), esami del sangue (tratteggiati finché mancano, poi «nella norma» o da rivedere, con la vitamina D bassa). In basso, più grande di tutto e nel colore della zona, il **DeFRA** con il rischio a 10 anni in %. Il colore dice la gravità: rosso serio, ambra attenzione, verde rassicurante, viola neutro. Ogni dato si tocca per correggerlo; «In evidenza» e i referti spariscono dalla colonna a destra (restano i controlli dopo la decisione).
- **Sulla scrivania**: esami del sangue, densitometria, DeFRA e, dopo la decisione, i controlli. Ogni punto o referto apre un riquadro dal basso con la stessa parte della scheda a passi.
- **Colonna a destra**, in quattro blocchi: **la prossima mossa** (una sola: un'urgenza come la dose di denosumab in ritardo, oppure il prossimo indizio da raccogliere, oppure «Decidi la terapia», oppure «Caso completato» con il farmaco in corso in primo piano e due date grandi a calendario: la prossima dose di denosumab o zoledronato, con «tra N mesi» e in rosso se è in ritardo, e la prossima densitometria, con l'inizio della finestra dei 18–24 mesi, in ambra o rosso se è da fare); **in evidenza** (finché il caso non è completo: la controindicazione principale, perché zona e T-score sono già sulla figura; il resto in una riga «Inoltre»); **referti** (esami e, dopo la decisione, controlli come caselle con il valore); **documenti** (copia per la cartella, lettera, foglio per il paziente, report), che compaiono solo dopo la decisione. In fondo, «Elimina paziente».
- **Decidi la terapia** (si sblocca con la zona del DeFRA): zona verde → nessun farmaco; zona gialla → prima linea dal MMG con il primo farmaco senza controindicazioni tra alendronato, risedronato, denosumab e zoledronato, gli altri barrati con il motivo o con le cautele, e la condizione della Nota 79 per ciascuno; zona arancione o rossa → invio allo specialista, con gli anabolici che potrà valutare e le loro controindicazioni. Sotto, «Prima della prima dose» (esami, forme secondarie, ipofosfatasia, vitamina D, visita odontoiatrica, calcemia ed eGFR). «Prescrivo…» registra la decisione e il farmaco da oggi; «Invia allo specialista» registra la decisione e apre la lettera.

Le illustrazioni sono in `img/` (figura intera e viso, usato anche come avatar nell'elenco dei pazienti).

## Privacy

I dati restano solo nel browser del dispositivo (localStorage), senza server. Backup e ripristino con un file JSON. Se il dispositivo è condiviso conviene usare iniziali o un codice al posto del nome e attivare il **blocco con codice**: l'app chiede il codice all'apertura e dopo 15 minuti senza attività. Il blocco nasconde l'archivio a chi usa lo stesso computer ma non cifra i dati; se si dimentica il codice si può solo cancellare l'archivio e ripristinare un backup.

## File

| File | Contenuto |
|---|---|
| `index.html` | Pagina dell'app e stile (ripreso da Osteo Help) |
| `app.js` | Schede del paziente, DeFRA, Nota 79, storico, report, guida e farmaci |
| `riconosci.js` | Dizionario e riconoscimento del testo copiato dal gestionale (farmaci, malattie, sinonimi, errori di battitura) |
| `figura.js` | Vista a figura del paziente e decisione terapeutica |
| `fpps.html` | Animazione 3D del meccanismo d'azione dello zoledronato (pagina autonoma, aperta dalla scheda del farmaco) |
| `img/` | Illustrazioni dei pazienti (figura intera e viso) |
| `osteohelp-dati.js` | **Generato**: dati clinici e motori copiati senza modifiche da `../index.html` |
| `tools/aggiorna-dati.py` | Rigenera `osteohelp-dati.js` |
| `manifest.webmanifest` | Installazione come app (PWA), con le icone di Osteo Help |

Dopo ogni modifica dei contenuti clinici di Osteo Help: `python3 mmg/tools/aggiorna-dati.py`.

Pubblicata insieme a Osteo Help si apre su `…/mmg/`; le schede di Osteo Help sono raggiunte con `../#causa-…` e `../#forma-…`. Se si sposta l'app in un repository a sé, basta cambiare la costante `OH` in `app.js` con l'indirizzo di Osteo Help.

## Avvertenze

Ausilio alla decisione, non sostitutivo del giudizio del medico. Verificare sempre il testo vigente della Nota 79 e le schede tecniche dei farmaci.


### Data delle fratture

Basta l'anno; mese e giorno sono facoltativi. La data si salva come «2019», «2019-05» o «2019-05-14» e si mostra nello stesso modo («2019», «05/2019», «14/05/2019»). Con il solo anno, per i calcoli (frattura recente negli ultimi 24 mesi) si conta da metà anno.

### Salvataggio di fratture, densitometrie e DeFRA

I pulsanti «Salva la frattura», «Salva la densitometria» e «Salva la zona del DeFRA» sono in evidenza; dopo il salvataggio compare un avviso («Frattura aggiunta: Polso / avambraccio · 2025») e la voce nuova si illumina nell'elenco. Se si lascia il modulo compilato a metà (anno della frattura scritto, un T-score inserito, zona del DeFRA scelta) e si chiude la scheda, si passa a un'altra sezione o si cambia pagina, i dati si salvano da soli, con lo stesso avviso.

### Dopo l'invio allo specialista

Con la decisione «Invia allo specialista», in cima a «Decidi la terapia» compare «Terapia indicata dallo specialista»: tutti i farmaci, con la loro icona; toccandone uno si registra da oggi (la data si corregge in Terapia) e nella figura compaiono il farmaco, la prossima dose e la prossima densitometria. Dalla figura ci si arriva con «Registra il farmaco dello specialista».

### Nota 79: come la applica l'app

Testo di riferimento: determina AIFA dell'8 settembre 2025. Per ogni farmaco la decisione terapeutica indica la condizione della Nota in cui rientra il paziente e se il farmaco è di **I, II o III scelta**; per la II e la III ricorda che servono intolleranza, incapacità di assunzione corretta, effetti collaterali o controindicazioni ai farmaci della scelta precedente (o la fine del periodo massimo di teriparatide o abaloparatide). Lo zoledronato è segnato come somministrabile solo in struttura ospedaliera pubblica o convenzionata. Nella zona gialla il farmaco consigliato è alendronato, poi risedronato, poi denosumab (che il MMG prescrive da sé), poi zoledronato (solo in ospedale); su ogni farmaco resta scritto se per la Nota è di I o II scelta. Sul denosumab, nella decisione e nella scheda del paziente, c'è l'avviso sull'effetto rebound alla sospensione.

Dove la Nota chiede un dato che manca, l'app non lo dà per scontato e lo chiede in «Da completare per la Nota 79»: postmenopausa (prevenzione primaria e abaloparatide), dose e durata dei glucocorticoidi (≥5 mg/die da più di 3 mesi per la prevenzione primaria, da più di 12 mesi per il teriparatide), gravità delle fratture vertebrali secondo Genant (abaloparatide e romosozumab), rischio a 10 anni in % (romosozumab: ≥20%; la sola zona del DeFRA non basta). Dal testo del gestionale, «Prednisone 5 mg/die da 2 anni» imposta da solo la durata.

### Guida: densitometria in LEA, Nota 79 e Nota 96

- **Nota 79** (anche da «Consulta» e da «Decidi la terapia»): tutte le condizioni della determina AIFA dell'8 settembre 2025, divise in prevenzione secondaria (fratture vertebrali o di femore; non vertebrali e non femorali) e primaria, con I, II e III scelta per ciascuna e le note a–h (passaggio di scelta, Genant, DXA, zoledronato in ospedale, denosumab prescrivibile dal MMG, piani terapeutici di romosozumab, teriparatide e abaloparatide).

- **A chi fare la densitometria in LEA** (anche da «Consulta» in home e dal passo Densitometria): fattori di rischio maggiori (ne basta uno: fratture e osteoporosi documentate, terapie croniche, patologie a rischio per categoria, e nella donna in menopausa familiarità materna, menopausa prima dei 45 anni, BMI < 19) e minori (ne servono tre, separati per donna in menopausa e uomo oltre i 60 anni), da spuntare con il risultato in fondo. Fonte: DPCM 12 gennaio 2017, Allegato 4A.
- **Vitamina D e Nota 96**: scenari senza dosaggio e con dosaggio (soglie 30, 50, 75 nmol/L), schema di correzione dell'Allegato 1, esclusioni. Fonte: Nota AIFA 96, aggiornamento del 10 febbraio 2023. Nel paziente che inizia un farmaco per l'osteoporosi la vitamina D si dosa: sotto 75 nmol/L è rimborsabile e va corretta prima.

### Home: due pulsanti, Consulta e Backup

La home non mostra l'elenco dei pazienti (un MMG ne ha molti): ha due pulsanti, come Osteo Help e Osteoclick, **Nuovo paziente** e **Archivio pazienti**. L'archivio è una pagina a parte con tutti i pazienti in ordine alfabetico e la ricerca per nome, iniziali o codice; i pazienti senza nome si eliminano da lì. L'archivio ha un viola più tenue del nuovo paziente. Sotto i due pulsanti, il promemoria del backup è una sola riga discreta («Nessun backup dell'archivio · Salva backup»), con la spiegazione al passaggio del mouse. In home restano poi «Da fare» e «Consulta».


«Consulta» è in quest'ordine: Guida per il medico di medicina generale, Nota 79, Vitamina D e Nota 96, A chi fare la densitometria in LEA. Salvataggio, ripristino e blocco con codice sono in un gruppo a parte, «Backup e sicurezza».

### Decisione terapeutica: prima l'indicazione, il resto a richiesta

In alto il paziente in una riga (età, frattura, T-score, rischio %). Poi un solo riquadro nel colore della zona: l'indicazione, il farmaco consigliato con il livello di scelta della Nota 79 (e l'avviso sul rebound se è il denosumab), il rischio molto alto se c'è, e subito i pulsanti. Tutto il resto è in sezioni chiuse che si aprono con un tocco, con un numero che dice quante voci contengono: «Da completare per la Nota 79», «Dettagli del farmaco consigliato», «Altre opzioni» (o «Cosa potrà valutare lo specialista»), «Prima della prima dose» («3 da fare»). Ogni farmaco è una riga con icona ed etichetta (I scelta, II scelta, fuori Nota 79, controindicato) che si apre sui dettagli.

### Niente più percorso a passi

La scheda del paziente è solo la figura (con la strada dei 7 passi su PC). Il vecchio «Percorso a passi» non c'è più: i suoi indirizzi (dati, anamnesi, esami, densitometria, DeFRA, controlli) aprono la stessa sezione sulla figura, così i link dalla decisione, dalla lista «Da fare» e dalle note portano al posto giusto. «Terapia» resta una pagina a sé, per registrare le dosi; le note libere sono in «Chi è».

**DeFRA già inserito**: la scheda mostra solo la zona, nel suo colore, con il rischio % e la data; «Aggiorna il DeFRA» (cosa serve, link al calcolatore, modulo), lo storico e «Cosa significano le zone» si aprono a richiesta.

**Decidi la terapia su PC** si apre nel pannello di destra, come le altre sezioni (passo 6 della strada evidenziato, figura sempre visibile, «‹ DeFRA» per tornare indietro). Dopo «Prescrivo…» o la scelta del farmaco dello specialista il pannello si chiude e la figura mostra il farmaco e le date. Sul telefono resta una pagina a sé.

**Intestazione del paziente**: il nome in grande, sotto due etichette (sesso ed età) e l'avanzamento con sette trattini colorati e «N di 7 passi». Al posto di «Nome, età» su una riga e delle barrette.

**Barra in alto** nella figura: solo la freccia indietro e «Fatto», senza il nome (è già in grande sotto).

**Insufficienza renale cronica** riconosciuta incollando dal gestionale («insufficienza renale (cronica)», IRC, CKD, dialisi, emodialisi…): diventa una voce tra le controindicazioni da conoscere. Finché manca l'eGFR la figura mostra «Insufficienza renale · inserisci l'eGFR», bisfosfonati, denosumab e anabolici ricevono l'avviso di verificare le soglie, la CKD-MBD compare nell'osteoporosi secondaria e la lettera la riporta. Con l'eGFR inserito valgono le soglie già presenti (sotto 35 e sotto 30 mL/min).

**Niente doppione sulla DXA** a caso completato: tolta la sezione «Controlli · DXA in programma», che ripeteva il calendario «Prossima densitometria». Il calendario ora è cliccabile e apre «Controlli nel tempo» (anche dal passo 7 Follow-up della strada su PC).

**Pulsanti «Salva» visibili su PC**: nel pannello di destra «Salva la frattura», «Salva la densitometria» e «Salva la zona del DeFRA» erano bianchi su bianco (la regola `.addbox .btn` sovrascriveva lo sfondo). Ora hanno il colore normale.

**Meno doppioni, grafica più semplice**:
- **Terapia** è ora solo il registro dei farmaci (inizio, dosi, sospensione), con il consiglio di follow-up e la condizione della Nota 79 dentro la riga del farmaco. Indicazione della zona, forme secondarie, rischio molto alto e tabelle della Nota 79 restano solo in «Decidi la terapia». La decisione si cambia in un pannello richiudibile in fondo.
- **Prossima densitometria** solo nel calendario del riquadro finale e in Densitometria (tolta da Controlli nel tempo; la nota sui glucocorticoidi è passata in Densitometria).
- **Densitometria e DeFRA con un solo dato**: niente riga ripetuta sotto il riepilogo; resta un piccolo «elimina». L'elenco compare dalla seconda DXA o dal secondo DeFRA.
- **Esami**: eGFR, vitamina D, calcio corretto e albumina scritti in alto non ricompaiono come righe dell'elenco. Le forme compatibili e gli esami di II livello sono un solo elenco: ogni forma si apre sui suoi esami e sulla scheda di Osteo Help.
- **Controlli nel tempo**: un solo riquadro per farmaco e decisione; tolto «Report da stampare» (è già in Documenti).
- **Decidi la terapia**: «Rischio molto alto» è un avviso a parte sotto la scheda della zona, non più una riga rossa dentro la scheda gialla.
- **Su PC** l'avanzamento «N di 7 passi» in alto è nascosto: lo mostra già la strada numerata. Su iPhone resta.

**Home su PC**: a sinistra Nuovo paziente, Archivio, la riga del backup e sotto «Da fare»; a destra sempre «Consulta» in alto, poi Backup e sicurezza. Su iPhone l'ordine non cambia.

**Inviato allo specialista cliccabile**: nel riquadro finale la scheda «Inviato allo specialista» si tocca e apre la scelta del farmaco indicato dallo specialista (tolto il link ripetuto sotto).

**Icone dei farmaci nei colori dell'app**: i simboli (capsula, compressa, siringa, flebo, penna) passano dal rosa al lilla e viola dell'app, anche lo sfondo dei riquadri.

**Terapia dello specialista più semplice**: in «Decidi la terapia» il riquadro dello specialista sta sempre in cima.
- Senza farmaco registrato: «Che terapia ha indicato lo specialista?», data di inizio e un solo tocco sul farmaco.
- Con farmaco registrato: mostra la terapia in corso e «Lo specialista ha cambiato terapia»; la nuova scelta chiude quella in corso alla data indicata e parte dallo stesso giorno. Toccare un secondo farmaco non lo aggiunge più in parallelo.
- Associazione possibile: «Teriparatide + denosumab» (registra entrambi; il riquadro finale mostra «Teriparatide + Denosumab · in associazione» con la prossima iniezione di denosumab).
- Nell'uomo non compaiono romosozumab, abaloparatide, ibandronato, raloxifene e bazedoxifene.
- Nel riquadro finale il link diventa «Lo specialista ha cambiato terapia?».

**Farmaco nell'archivio**: ogni scheda dell'archivio mostra, sotto età e zona, il farmaco in corso con l'icona e la data di inizio (o «Teriparatide + Denosumab» per l'associazione), oppure «Inviato allo specialista», «Nessun farmaco per l'osteoporosi», «Decisione rimandata». La ricerca trova anche per farmaco (es. «denosumab»).

**iPad come il PC**: la vista da PC (figura, strada dei passi e pannello a destra; home su due colonne) parte da 744 px di larghezza invece che da 900, purché lo schermo sia alto almeno 560 px. Così iPad e iPad mini in verticale e in orizzontale hanno la vista da PC, mentre l'iPhone tenuto in orizzontale resta con le schede dal basso. Tra 744 e 1023 px la strada dei passi mostra solo i numeri.

**Rivalutazione del paziente già visto**: nel riquadro finale «↻ Rivaluta il paziente» spiega cosa succede e ha il pulsante «Inizia la rivalutazione».
- Si conservano fratture, densitometrie, DeFRA e terapie in corso (le terapie restano attive finché non si decide altro).
- Si rifanno: conferma «Nessuna nuova frattura dalla valutazione precedente» (o si aggiunge la nuova frattura), anamnesi da riconfermare, esami del sangue (vuoti), un nuovo DeFRA (quello vecchio risulta «da ricalcolare») e la decisione. La DXA si ripete solo se è il momento.
- La valutazione precedente viene salvata (data, zona, T-score, decisione, farmaci, forme secondarie ed esami) e compare in «Controlli nel tempo» → «Valutazioni precedenti».
- In intestazione compare l'etichetta «Rivalutazione dal …» finché non c'è la nuova decisione.
- Nella home, «Da fare» propone la «Rivalutazione annuale» quando l'ultima decisione ha più di 12 mesi.

**Icona propria di Osteo Help MMG** (`icone/`): come quella di Osteo Help (OH con la lineetta verde acqua) ma su fondo viola dell'app. Favicon SVG e 32 px, icona per la schermata Home di iPhone/iPad (180 px), icone 192 e 512 px per il manifest, più la versione «maskable» per Android. Il nome sotto l'icona resta «Osteo MMG».

**Anamnesi senza conferma**: tolta la casella «Anamnesi e terapie verificate». L'anamnesi è completa appena si inserisce una patologia, un farmaco o una controindicazione (anche dal testo del gestionale): basta «Fatto». Se non c'è nulla, in fondo c'è il pulsante «Anamnesi muta» (con «annulla»). In rivalutazione l'anamnesi va rivista: si aggiorna una voce oppure si tocca «Nessuna novità dalla valutazione precedente».

**Anamnesi muta come voce selezionabile**: in cima alle voci dell'anamnesi, con la stessa casella delle altre. Selezionarla toglie farmaci, malattie, controindicazioni e «grave disabilità motoria» (non la visita odontoiatrica), ma le ricorda: deselezionandola tornano tutte come prima. Selezionare una qualsiasi voce toglie l'anamnesi muta. Con l'anamnesi muta il riquadro «Incolla dal gestionale» resta chiuso. La visita odontoiatrica «da fare» non conta più come voce dell'anamnesi.

**Anamnesi con un solo stile**: tutte le scelte sono righe con la casella a sinistra. «Anamnesi muta» è una riga come le altre; dose e durata dei glucocorticoidi e la visita odontoiatrica («da fare per il nulla osta» / «fatta, bocca in ordine») sono righe che si escludono a vicenda (ritoccando la riga scelta la si toglie). «Incolla dal gestionale» è sempre aperto.

**Figura e riquadro finale più ordinati**:
- Le pill a destra hanno il pallino a destra, allineate al bordo come quelle a sinistra.
- Controindicazioni in un'unica pill «Controindicazioni» con il numero e i motivi (es. «esofago · eGFR 32»). Toccandola si aprono sotto, collegate, le sotto-pill senza icona con i farmaci da evitare e il perché («No bisfosfonati orali · esofago», «No alendronato e zoledronato · eGFR 32 mL/min»); ogni sotto-pill apre la sezione da cui viene. La visita odontoiatrica da fare resta una pill a parte.
- Riquadro del caso concluso: l'avviso sul rebound sta dentro la scheda del denosumab; la scheda del farmaco si tocca per rivedere decisione e terapia (al posto del link «Rivedi la decisione»); le due date (prossima dose e prossima densitometria) hanno la stessa altezza; «Rivaluta il paziente» è un riquadro a sé in fondo.

**Albumina bassa e malassorbimento** (solo nella copia del motore usata da MMG, `osteohelp-dati.js`; Osteo Help non cambia): il malassorbimento compare solo se c'è almeno un segno del metabolismo minerale (calcio, fosforo o vitamina D bassi, PTH alto, calciuria bassa); albumina o emoglobina basse da sole non bastano. L'albumina bassa isolata orienta prima verso malnutrizione (ora tra le forme frequenti) e flogosi/malattia cronica (l'albumina è una proteina negativa di fase acuta), poi epatopatia e sindrome nefrosica, con un avviso che spiega che nell'anziano è un reperto frequente e aspecifico.

La stessa correzione sull'albumina è stata applicata anche a Osteo Help (`index.html`, su richiesta): malassorbimento solo con un segno del metabolismo minerale, flogosi tra le cause di albumina bassa, malnutrizione frequente, nota «Albumina bassa isolata» nel risultato; nella scheda «Ipoalbuminemia» le cause sono ora in ordine malnutrizione, flogosi, epatopatia, nefrosica, malassorbimento.

**Osteoporosi secondaria apribile sulla figura**: come le controindicazioni, la pill «Osteoporosi secondaria» si apre su sotto-pill collegate, raggruppate per provenienza: «Da malattie e farmaci» (con i nomi) apre Malattie e farmaci, «Compatibili con gli esami» apre Esami del sangue. Si apre una sola delle due pill alla volta. Le pill apribili non hanno più la freccia.

**Gerarchia delle forme secondarie** (`SEC_L1`, `SEC_RIVEDI`, `secLevels` in app.js), per quello che cambiano nella cura:
1. **Prima di trattare** (rosso): da correggere o escludere prima del farmaco, o cambiano la scelta del farmaco. Levotiroxina TSH-soppressiva, ipogonadismo maschile, ipofosfatasia; dagli esami carenza di vitamina D / osteomalacia (anche ipofosfatemica e Fanconi), iperparatiroidismo, ipertiroidismo, ipercalcemia (maligna, da farmaci, intossicazione da vitamina D), mieloma, neoplasia, ipoparatiroidismo, ipomagnesiemia, Paget; insufficienza renale se eGFR sotto 30 o non noto.
2. **Da approfondire** (ambra): si tratta l'osteoporosi mentre si indaga. Tutti gli altri sospetti, compresi malassorbimento e celiachia non diagnosticata, e le altre forme compatibili con gli esami.
3. **Fattori noti** (grigio): spiegano il rischio, si tratta comunque. Malattie croniche note e farmaci; IPP, SSRI, diuretici dell'ansa, glitazoni, SGLT2-inibitori, oppioidi, medrossiprogesterone, tenofovir e gli stili di vita sono segnati «da rivedere se possibile».

Sulla figura la pill «Osteoporosi secondaria» prende il colore del livello più alto e si apre su una sotto-pill per livello (porta alla sezione da modificare, o alla scheda per livelli se le fonti sono miste). La scheda «Osteoporosi secondaria» è divisa per livelli. In «Decidi la terapia» solo il livello 1 è una cosa da fare; il livello 2 è un promemoria (icona «i») che non blocca. Riepilogo, report e lettera riportano i livelli; il quesito della lettera cita solo i livelli 1 e 2.

**Cushing al livello 2** (da approfondire): l'ipercortisolismo endogeno si indaga e si cura, ma intanto l'osteoporosi si tratta. **La stessa gerarchia è in Osteo Help** (`index.html`): risultati di «Esami normali» e «Esami alterati» divisi per livello con la spiegazione, il livello in testa a ogni scheda, e una pagina in Consulta, «Forme secondarie: cosa cambiano nella cura» (`#livelli`), che spiega i tre livelli con esempi.

**Livello 1 ristretto a ciò che blocca davvero** (MMG e Osteo Help): levotiroxina TSH-soppressiva, ipofosfatasia (anche sospetta), carenza di vitamina D / osteomalacia (anche ipofosfatemica, Fanconi), ipocalcemia (ipoparatiroidismo, ipomagnesiemia). Passano al livello 2, perché un antiriassorbitivo non è controindicato: iperparatiroidismo primario, ipertiroidismo, mieloma, neoplasie, ipercalcemie, intossicazione da vitamina D, Paget, insufficienza renale, ipogonadismo maschile, Cushing. Le soglie di eGFR per i farmaci restano nelle controindicazioni (MMG); in Osteo Help la scheda «Insufficienza renale cronica» ha la sezione «eGFR e farmaci» e nel risultato la voce ricorda di considerare l'eGFR.

**Morbo di Paget**: anche il solo sospetto (forma compatibile con gli esami) fa proporre in «Decidi la terapia» lo zoledronato endovena come unica terapia, qualunque sia la zona del DeFRA («Sospetto morbo di Paget», nessuna altra opzione, niente invito all'anabolico); teriparatide e abaloparatide risultano controindicati, gli altri farmaci con l'avviso «nel Paget l'unica terapia indicata è lo zoledronato». In Osteo Help la scheda del Paget ha la sezione «Terapia» e nel risultato la voce ricorda «terapia: solo zoledronato endovena».

**Ipercalcemia maligna come urgenza medica**: fuori dai tre livelli, come livello a sé («Urgenza medica», in rosso pieno), legato al calcio molto alto (oltre 14 mg/dL) o ai sintomi: subito in ospedale, idratazione e bisfosfonato endovena (o denosumab se la funzione renale è ridotta). In MMG compare un avviso rosso in cima a «Decidi la terapia»; in Osteo Help il risultato la mostra in testa, la scheda ha la sezione «Terapia» e la pagina dei livelli la spiega a parte.

**Niente pill dell'età sulla figura**: età e sesso sono già sotto il nome. Sulla figura compare solo, se basso, il BMI («BMI basso · sotto 20 kg/m²»).

### Ordine delle pill sulla figura e scheda del farmaco
- Le pill si leggono dall'alto a sinistra in giù, poi a destra: a sinistra la fragilità (T-score peggiore, fratture, familiarità, BMI basso); a destra le cause e ciò che va sistemato (osteoporosi secondaria, esami del sangue), poi ciò che limita la terapia (controindicazioni con le sotto-pill, visita odontoiatrica).
- Il riquadro del caso completo usa gli stessi colori pieni delle pill: fondo verde acqua più acceso (#BFE6E2), icona del farmaco bianca su cerchio pieno (verde terapia, viola specialista, giallo da registrare, grigio nessun farmaco), avviso rebound con barra gialla, «Rivaluta» con bordo viola pieno.

### Schede dell'archivio pazienti
- Ogni scheda è divisa in tre fasce: chi è (avatar, nome, sesso ed età, zona DeFRA come etichetta colorata a destra), la terapia (icona su cerchio pieno: verde farmaco in corso, viola specialista, giallo da registrare, grigio nessun farmaco, tratteggiata da decidere) e la barra del percorso con il passo e cosa manca; la scheda ha un unico sfondo bianco, senza separatori, così si legge come un solo paziente.
- Le schede dell'archivio sono di nuovo su fondo grigio, unico per tutta la scheda.

### Vitamina D e calcio
- Nella pagina Terapia c'è la sezione «Vitamina D e calcio», per tutti i pazienti: vitamina D (colecalciferolo o calcifediolo con le dosi più usate), calcio (500 o 1000 mg, o l'associazione), data di inizio e nota. Si salva da sola.
- Se la decisione è «nessun farmaco» (es. zona verde), nel caso completo e nell'archivio compare «Solo vitamina D e calcio» con le dosi (icona del sole su cerchio giallo); se non è ancora registrata, la scheda invita a farlo e porta alla pagina Terapia.
- Con un farmaco, sotto il nome del farmaco compare «con colecalciferolo …». Le dosi finiscono anche nel testo «Copia per la cartella».
- Gerarchia nella scheda: il nome è più grande; terapia (in un riquadro bianco, icona e testo più piccoli) e percorso sono rientrati nella colonna del nome, sotto di lui.
- Il percorso nella scheda dell'archivio è la strada a pallini numerati del PC, in orizzontale e in piccolo: ✓ verde i passi fatti, ! ambra quelli da rivedere, bordo viola il prossimo, grigi quelli da fare.

### Immagini salvate sul dispositivo (service worker)
- `sw.js` alla prima apertura scarica tutte le immagini dei pazienti (figure e visi) e le icone; dalla seconda volta le legge dal telefono o dal PC, senza rete, e compaiono subito.
- Pagina e script si chiedono sempre prima alla rete, così gli aggiornamenti arrivano subito; la copia salvata serve solo offline (l'app si apre anche senza connessione).
- Se si sostituiscono le immagini, aumentare `VER` in `sw.js`: le copie vecchie vengono cancellate e riscaricate.
- Anche nella scheda del paziente (telefono e tablet stretto), sotto sesso ed età, le barrette sono sostituite dalla stessa strada a pallini dell'archivio; su PC resta la strada verticale a sinistra.

### Densitometria: una scheda per ogni DXA
- In cima c'è la scheda dell'ultima densitometria: la data in testa con il giudizio peggiore (osteoporosi / osteopenia / normale), sotto i tre siti con il T-score in un cerchio colorato e, se c'è una DXA precedente, la variazione (▲ ▼ o = stabile, soglia 0,2).
- Sotto: quando ripeterla. Il modulo per una nuova DXA è aperto solo se non ce n'è nessuna; altrimenti è un riquadro chiuso «+ Aggiungi una nuova densitometria» (di solito dopo 18–24 mesi), che si apre al tocco.
- Poi il grafico del T-score nel tempo e, chiuse, le densitometrie precedenti, ognuna con la sua scheda.

### Invio per un anabolico solo se in Nota 79
- Nell'avviso «Rischio molto alto» di «Decidi la terapia» l'app controlla la Nota 79 (`n79Ana` in app.js): se il paziente rientra per teriparatide, abaloparatide o romosozumab, dice per quale farmaco e con quale condizione, e propone l'invio allo specialista.
- Se almeno un anabolico è in Nota, quelli in Nota ma controindicati compaiono sotto con il motivo. Se nessun anabolico è indicato (non in Nota, o solo controindicati), degli anabolici non si parla: resta solo «Rischio molto alto … inizia la terapia senza ritardi». I dati mancanti per la Nota restano nella sezione «Da completare per la Nota 79».

### Decidi la terapia: perché quel farmaco
- Il titolo della zona gialla è «Terapia consigliata» (vale anche quando è di II scelta) (non più «Prescrivi tu la terapia»).
- Nella stessa scheda bianca del farmaco consigliato, sotto una linea sottile, c'è l'etichetta «Nota 79 AIFA · I/II scelta» con la condizione della Nota; se è di II scelta dice perché (I scelta controindicata e motivo, oppure zoledronato di I scelta ma solo ospedaliero). Se il paziente non rientra nella Nota, il riquadro rosso «Fuori Nota 79» lo dice.

### Testi giustificati nei riquadri
- I testi lunghi dentro i riquadri (avvisi, Nota 79 del farmaco, rischio molto alto, rebound, note sotto i calendari, ecc.) sono giustificati, con la sillabazione italiana (`hyphens:auto`, la pagina è `lang="it"`) per non lasciare spazi larghi tra le parole sul telefono.

### Anabolico come terapia consigliata
- Se per la Nota 79 un anabolico è di I scelta per il paziente e non è controindicato (es. 3 o più fratture vertebrali o di femore → teriparatide; nella donna anche abaloparatide per la sua condizione), «Decidi la terapia» lo propone come «Terapia consigliata», con la sua Nota 79 e la frase «La prescrive lo specialista con piano terapeutico».
- L'unico pulsante è «Invia allo specialista». Sotto, in «Cosa potrà valutare lo specialista», gli altri anabolici in Nota. L'avviso «Rischio molto alto» in questo caso riporta solo i motivi del rischio, senza ripetere gli anabolici.
- Il riquadro della Nota sotto il farmaco non è giustificato (testo breve, colonna stretta).
- Se un'altra condizione della Nota dà di I scelta un farmaco che il MMG può prescrivere (alendronato, risedronato, zoledronato, denosumab), l'anabolico non diventa la proposta: resta come alternativa nell'avviso «Rischio molto alto» (es. abaloparatide in una donna con frattura di polso recente e T-score −3,2, dove l'alendronato è di I scelta).

### I 7 passi
1 Chi è · 2 Fratture · 3 Anamnesi e farmaci · 4 Esami del sangue · 5 Densitometria · 6 DeFRA · 7 Terapia.
- Le fratture sono un passo a sé (prima erano nel passo 1 «Dati e fratture»); il follow-up non è più un passo: resta la sezione «Controlli nel tempo» del caso completo.
- Sulla figura, sia a caso in corso sia a caso completo, ci sono sempre le stesse pill nello stesso posto, che si riempiono man mano: a sinistra la fragilità dalla più pesante: T-score peggiore, fratture, familiarità, BMI solo se sotto 20 (l'età non è sulla figura: compare sotto il nome, con la stessa animazione, quando viene inserita la data di nascita); a destra le forme secondarie (o «nessuna»), gli esami del sangue, poi le controindicazioni e la visita odontoiatrica solo se ci sono; in basso, grande, il DeFRA. Le pill compaiono solo quando c'è il dato: finché manca, il suo spazio è vuoto. Sulla figura c'è un solo punto come quelli di una volta (pallino viola con il numero e l'alone che pulsa, etichetta bianca accanto): il prossimo passo, nel posto dove comparirà la sua pill. Quando il dato arriva compare la pill con una breve animazione (sul telefono parte quando si chiude la scheda). I numeri in ordine restano nella strada sotto il nome. Niente più punti anatomici né albero.
- Su PC, toccando un passo nella strada a destra della figura si apre il suo pannello e, se quel dato manca, sulla figura compare (evidenziato) il suo punto nel posto dove arriverà la pill; il punto del prossimo passo resta, attenuato. Le pill già presenti restano tutte visibili, attenuate tranne quella della sezione aperta.

- **DeFRA senza elenchi da ricopiare**: nella sezione DeFRA (passo 6) sono stati tolti «Cosa serve» (la lista dei dati con ok/manca) e «Da riportare nel DeFRA» (il riepilogo dei valori), perché nel calcolatore le risposte non si possono incollare. Restano il pulsante «Apri il DeFRA», la scelta della zona di rischio e la legenda delle zone.

- **Controllo di semplicità e correzioni**:
  - il «Report» andava in errore quando nessun esame del sangue era alterato (mancava `byForm` nel risultato vuoto di `computeA`): corretto;
  - foglio per il paziente: «diventata più bassa» per le donne;
  - esami: la nota sul testosterone compare solo per gli uomini; tolto «PTH e TSH se non già eseguiti» (sono già nell'elenco) e il suggerimento ripetuto in fondo;
  - testi delle zone DeFRA in italiano piano: niente «prima linea» né «II o III livello» (si confondevano con le scelte della Nota 79);
  - anamnesi: «Vampate al volto (flushing)», «Storia delle fratture» al posto di «pattern fratturativo»;
  - decisione suggerita: etichetta «consigliata».

- **Semplificazioni concordate**:
  - zone DeFRA: gialla «terapia antiriassorbitiva senza necessità di intervento specialistico»; arancione e rossa «terapia anabolica o con romosozumab, prescrivibili dallo specialista su piano terapeutico»; ripristinati «Flushing» e «Anamnesi e pattern fratturativo»;
  - Nota 79 in breve: le condizioni dicono i dati del paziente che lo fanno rientrare («Donna in postmenopausa oltre i 65 anni, T-score −3,1, 1 frattura vertebrale moderata»), non il testo intero della nota (`fxBreve`); la limitazione del romosozumab è a parte (`nb`, `RO_NB`);
  - lettera allo specialista: alla voce Nota 79 solo i farmaci dello specialista in cui il paziente rientra, ognuno con livello di scelta e motivo (`n79Lettera`);
  - esami: gli esami con il valore scritto (vitamina D, eGFR, calcio corretto, albumina) restano nella griglia con lo stato calcolato e il valore, invece di sparire;
  - un solo nome per passo: «Anamnesi e farmaci», «Densitometria (DEXA)», «Fratture», anche nelle schede e sul pulsante Avanti; sul telefono le schede vanno a capo;
  - anamnesi: tutti i gruppi chiusi e apribili, con il numero di voci spuntate (`pzGroup`); «Altri dati per DeFRA e Nota 79», «Controindicazioni» e «Odontoiatria» (separata) come gli altri gruppi.
- Zona gialla: tolto «La terapia la imposta il medico di medicina generale»; resta «Terapia antiriassorbitiva (bisfosfonati orali o denosumab) senza necessità di intervento specialistico, sempre con vitamina D.»

- **Icone vettoriali al posto delle emoji**: le sezioni (Chi è, Fratture, Anamnesi e farmaci, Esami del sangue, Densitometria, DeFRA, Forme secondarie, Controlli, Decidi la terapia) e le decisioni nell'archivio e nel riepilogo (specialista, farmaco da registrare, decisione rimandata) usano icone a tratto 24×24 (`SEC_SVG`, `secIcon` in `figura.js`), lo stesso stile della pagina iniziale; nel titolo della scheda stanno in un riquadro grigio come le icone della home.
- Icone delle sezioni: contorno viola scuro (#3B3266) e riempimento lavanda (#CBC1F2) sulle forme chiuse (classe `.f`); sui cerchi colorati dell'archivio restano bianche.

- **Vitamina D e calcio a schema libero** (Terapia):
  - vitamina D: molecola (colecalciferolo o calcifediolo), dose libera (UI o mg secondo la molecola), «ogni N giorni / settimane / mesi»; il testo si compone da solo («Colecalciferolo 25.000 UI ogni 10 giorni», «… 100.000 UI al mese»); sopra, schemi frequenti da un tocco, poi modificabili; cambiando molecola la dose si svuota;
  - calcio: dose libera in mg al giorno (vuoto = basta la dieta);
  - i dati salvati con il vecchio elenco fisso si convertono nei campi (`supMigrate`); `p.supVD` e `p.supCa` restano il testo usato da archivio, riepilogo e cartella (`supCompose`);
  - «Registra un farmaco»: nessun farmaco preselezionato (prima compariva l'alendronato, che sembrava assegnato); senza scelta non si salva; chiuso se la decisione è «nessun farmaco» o «specialista»; per gli uomini non compaiono romosozumab, abaloparatide, ibandronato, raloxifene e bazedoxifene.

- **Proposta di vitamina D e calcio** (Terapia), al posto degli schemi frequenti; aggiunto il **calcitriolo** (dose in µg). La proposta (`vdProposta`, regole commentate in `app.js`) segue l'Allegato 1 della Nota 96:
  1. eGFR <30, nefrolitiasi, calcio o calciuria alti → niente schema, decide lo specialista (calcitriolo possibile nell'IRC avanzata);
  2. malassorbimento (MICI, celiachia, chirurgia bariatrica o gastrica) o epatopatia → calcifediolo;
  3. 25-OH-D <30 nmol/L → attacco 50.000 UI a settimana per 6 settimane (300.000 UI), poi mantenimento; col calcifediolo 0,266 mg ogni 2 settimane per 3 mesi, poi al mese;
  4. 30–50 → mantenimento; 50–75 → mantenimento solo con osteoporosi, farmaco per l'osso o PTH alto; ≥75 → mantenimento solo in terapia per l'osso;
  5. mantenimento 25.000 UI al mese, ogni 2 settimane con obesità, glucocorticoidi o antiepilettici;
  6. senza valore: se inizia un farmaco → «dosala prima»; osteoporosi non candidata o allettamento → mantenimento senza dosare;
  7. calcio 500 mg al giorno con un farmaco per l'osso.
  «Usa la proposta» riempie i campi (la prima fase), mette in nota la durata e il mantenimento successivo, e la data di inizio se manca.
- Proposta di vitamina D: mantenimento 25.000 UI ogni 2 settimane (prima al mese); con obesità, glucocorticoidi o antiepilettici 25.000 UI a settimana.
- Proposta di vitamina D con valore buono (≥50 nmol/L senza farmaco per l'osso): se la vitamina D è registrata, «continua lo schema attuale»; se non lo è, avvisa che il valore può dipendere da una vitamina D già in corso («continuala e registrala»), e solo altrimenti «non serve integrare».
- Vitamina D e calcio: pulsante «Salva vitamina D e calcio» (conferma con il testo salvato e «Salvata il …»; mette la data di inizio se manca). I campi restano comunque registrati mentre si scrive, così non si perde nulla uscendo senza premere.
- Il pulsante di vitamina D e calcio si chiama solo «Salva»; il calcio è facoltativo (vuoto = basta la dieta).

- **Regole di design applicate a grafico, tabelle e riquadri**:
  - densitometrie e DeFRA come vere tabelle (Data · Colonna · Femore totale · Collo; Data · Zona · Rischio a 10 anni), cifre allineate a destra; i T-score da osteoporosi in grassetto (`dxaTable`, `defraTable`), nel report e in «Controlli nel tempo»;
  - DeFRA nel tempo: l'ultimo valore come numero grande con zona e differenza dal precedente («17% · ▲ +3 punti dal apr 2024 (14%)», `defraTile`), sotto la tabella;
  - T-score con un solo modello: in «Controlli nel tempo» la stessa scheda del passo 5 (cerchi colorati per categoria); nella scheda la variazione è scritta per intero («▲ migliorata di 0,2», «▼ peggiorata di 0,2», «= stabile»);
  - grafico del T-score: legenda sopra il grafico, testi più grandi (leggibili sul telefono), riquadro con data e tre valori quando si passa o si tocca una data (colonne invisibili larghe almeno 24 px, linea verticale sulla data, raggiungibile anche da tastiera).
- **Passi nella scheda sul telefono**: al posto delle sei etichette su due righe (con i nomi lunghi che andavano a capo, e senza la Terapia) c'è una fila di sette pallini numerati come il percorso sotto il nome: ✓ fatti, numero se mancano, «!» da completare, quello aperto pieno viola. Toccandoli si apre il passo (il 7 apre «Decidi la terapia»); il nome è nel titolo della scheda.
- **Modulo del DeFRA rifatto**: zone sempre 2×2 (sul computer, nel pannello, quattro in fila tagliavano «Arancione» e «alto rischio»), con bordo e la zona scelta evidenziata; «Rischio a 10 anni» con il simbolo % nel campo e una riga di spiegazione sotto, accanto alla data e allineato; nota a tutta larghezza; pulsante «Salva».
- **Moduli uniformi**: in tutti i riquadri per inserire dati (fratture, densitometria, DeFRA, vitamina D e calcio, farmaco) il pulsante si chiama «Salva» e sta a destra in fondo; «facoltativo» è dentro il campo e non nell'etichetta; le spiegazioni brevi nei moduli sono allineate a sinistra (giustificate creavano buchi); nelle fratture sede e gravità affiancate, poi la data; nel farmaco «Scegli…» (prima tagliato). Il calcio vuoto vale «basta la dieta».
- **Fratture più veloci da inserire e da correggere**:
  - nel modulo «Quante fratture uguali» con − e + (fino a 12): per 4 vertebrali lievi del 2024 basta un salvataggio, si creano 4 fratture con la stessa sede, data e gravità;
  - ogni frattura inserita si apre toccandola: sede, gravità (solo per le vertebre), anno/mese/giorno e «durante la terapia» si cambiano sul posto e si salvano da soli; la riga resta aperta e l'elenco non si riordina mentre la si modifica; una data non valida viene segnalata e non cambia nulla; «Elimina questa frattura» in fondo alla riga.
- Proposta di vitamina D senza valore: «Dosa la 25-OH-vitamina D: nella valutazione per osteoporosi serve il valore…» (non più «dosala se ha sintomi…», lettura troppo letterale della Nota 96). Testo della proposta giustificato.
- **Fratture in momenti diversi e di gravità diverse**: «Quante fratture in questa sede» con − e +; dalla seconda in poi compare una riga ciascuna (gravità, anno, mese), all'inizio uguale alla prima e poi modificabile; i valori scritti restano se si cambia il numero. La data si può lasciare vuota («data non nota», per le fratture pregresse viste alla radiografia), anche nella modifica di una frattura già inserita.
- «Usa la proposta» (vitamina D) viola e a destra. La proposta «mantenimento senza dosare» vale solo se la decisione è «nessun farmaco» (prima scattava con l'osteoporosi anche prima di decidere).
- **Modulo fratture semplificato**: in alto Sede e Quante (− / +); sotto una riga per frattura con Gravità (solo vertebre), Anno e Mese («non serve»), numerate 1ª, 2ª… quando sono più di una; le nuove righe partono uguali all'ultima. Tolto il giorno (anche nella modifica: se anno e mese non cambiano, il giorno già salvato resta). Anno vuoto = data non nota.
- **Fratture in due passi**: prima Sede e Quante con il pulsante «Aggiungi frattura»; toccandolo compaiono sotto le righe (gravità solo per le vertebre, anno, mese) per il numero scelto, la spunta della terapia e «Salva». Dopo il salvataggio il modulo torna al primo passo.
- Fratture: la spunta «avvenuta nonostante almeno 1 anno di terapia» è ora per ogni frattura (colonna «In terapia» in ogni riga), non più una sola per tutte.
- Le sezioni «da fare» compaiono solo se c'è qualcosa da fare: «Prima della prima dose» in «Decidi la terapia» e «Da fare» nella pagina iniziale.
- Pulsanti secondari in tutta l'app (es. «Invia allo specialista», «Indietro», «Imposto io la terapia»): bianchi con bordo e testo viola; i − e + dei contatori restano neutri.
- Home: «Nuovo paziente» lavanda e «Archivio pazienti» menta (#B0DFCC, lo stesso verde di Osteo Help), senza bordi: due colori come nella home di Osteo Help.
- Home: su iPhone e schermi piccoli (fino a 600px) il titolo va su due righe, «Gestionale» sopra e «osteoporosi» sotto; su PC resta su una riga.
- PC, vista a figura: passando col mouse sui passi della strada verticale il pallino si ingrandisce (e la scritta accanto un po' meno) e a destra compare, con una breve animazione, l'anteprima di quella sezione; uscendo dalla strada torna quello che c'era prima. Con il clic la sezione resta aperta.
- Lo spazio della barra di scorrimento della finestra è sempre riservato: quando compare (per esempio con una scheda lunga a destra) la pagina non si sposta più di lato, e la figura del paziente resta ferma.
- Archivio a lista compatta: un elenco unico con una riga per paziente (nome, sesso ed età, zona DeFRA, terapia e passo a cui è arrivato), senza riquadri grigi, così ne stanno molti di più per schermata. Su PC nome, terapia e pallini dei passi stanno sulla stessa riga. Tolta la riga «Mancano…» dalla scheda: si vede aprendo il paziente.
- Anteprima dei passi su PC: dopo un clic, se la pagina scorre e sotto il mouse fermo finisce un altro passo, la sua anteprima non copre più la sezione appena aperta; riparte quando si muove il mouse.
- Schede dei passi uniformate, con la stessa grammatica per tutte:
  - ogni scheda si apre con una riga di introduzione grigia (aggiunta in «Chi è» e nel DeFRA; in «Fratture» il testo sui traumi minimi e Genant è diventato l'introduzione);
  - tutti i menu apribili (gruppi dell'anamnesi, fratture inserite, densitometrie precedenti, sezioni di DeFRA e decisione) hanno la freccia in giù che si gira quando si aprono;
  - «Aggiorna il DeFRA» è nel riquadro tratteggiato col +, come «Aggiungi una nuova densitometria»;
  - «Elimina questo DeFRA» è in rosso a destra, come gli altri «Elimina»;
  - «Note» in «Chi è» è un campo come gli altri, con il segnaposto «facoltative».
- Anamnesi ed esami più leggeri:
  - introduzioni più corte;
  - riquadro «Incolla dal gestionale» più basso (3 righe) e senza la nota lunga, solo «controllale prima di aggiungerle»;
  - sotto ogni gruppo dell'anamnesi compaiono le voci spuntate (es. «Diabete tipo 2»), altrimenti solo quante sono («17 voci»), su una riga; si aggiorna mentre spunti;
  - negli esami la frase sul calcio corretto compare solo quando serve, e «Nessuna forma nota» non compare finché non c'è un esame fuori norma.
- Esami del sangue: albumina, calcio totale, 25-OH-vitamina D ed eGFR non sono più in alto, ma nelle loro righe dell'elenco con la casella del valore (unità nel segnaposto). Scritto il valore, accanto compare subito «▲ alto», «▼ basso» o «nella norma»; per il calcio anche il valore corretto per l'albumina. Senza valore restano i pulsanti ▲ N ▼. Per la vitamina D l'unità (nmol/L o ng/mL) si sceglie sotto il nome. In alto resta solo la data dei prelievi.
- Esami, avviso sulla vitamina D bassa riscritto: il titolo dice se è carenza o insufficienza col valore; sotto una frase sola su cosa fare (portarla ad almeno 75 nmol/L prima della terapia per l'osso, e perché); le soglie e le fonti in piccolo in fondo, nell'unità scelta.
- Telefono: le schede che salgono dal basso hanno tutte la stessa altezza (86% dello schermo), anche quando il contenuto è corto; i pulsanti Indietro e Avanti restano sempre in fondo, nello stesso punto.
- Esami: il pulsante si chiama «Tutti nella norma» (segna nella norma gli esami non ancora indicati; la vitamina D va comunque scritta col valore).
- Pulsanti: in tutta l'app i pulsanti stanno a destra (per esempio «Riconosci», «Tutti nella norma», «Apri il DeFRA», «Stampa»), come «Salva». Fanno eccezione solo «Indietro» in fondo alle schede, a sinistra, e i due pulsanti affiancati della proposta di terapia.
- Stile unico per tutte le schede dei passi (telefono e PC): fondo grigio chiaro e ogni blocco in una card bianca con bordo sottile (gruppi di campi, «Incolla dal gestionale», gruppi dell'anamnesi, fratture, gruppi di esami, densitometria, grafico, avvisi, «Aggiungi», menu apribili). Gli avvisi sono bianchi con la striscia colorata a sinistra. Il colore resta solo per pulsanti, scelte selezionate e significato (zone del DeFRA, T-score, avvisi). Etichette dei campi nere e caselle con bordo più visibile. In «Chi è» i campi sono in tre card con titolo: «Dati», «Menopausa e familiarità» (solo «Familiarità» per gli uomini), «Note».
- Densitometria: nella card di ogni DXA, a sinistra dei T-score, un disegno semplice di colonna lombare (L1–L4) e femore; ogni sito ha il colore del suo T-score (rosso osteoporosi, giallo osteopenia, verde normale, grigio se manca) e il collo femorale è una zona a parte del femore. Il confronto con la DXA precedente («▼ peggiorata di…») è sotto il nome del sito.
- Densitometria, disegno rifatto: colonna e femore più distanziati; le vertebre L1–L4 sono viste di fronte come nella DXA, con i fianchi appena incavati, i processi trasversi (più lunghi in L3) e i dischi grigi tra una vertebra e l'altra.
- Densitometria: il disegno di colonna e femore è al centro della card; i T-score del femore (collo femorale e femore totale) sono in alto a destra, quello della colonna in basso a sinistra, ognuno legato alla sua parte da una linea sottile con un pallino. Le linee del femore passano sopra il disegno, così non attraversano la colonna e non si incrociano; si ricalcolano da sole quando cambia la larghezza (telefono, PC, densitometrie precedenti aperte).
- Densitometria rifatta prendendo spunto da un'immagine di riferimento: ossa color osso con il contorno, e colorate secondo il T-score solo le zone misurate dalla DXA (il riquadro dentro ogni vertebra L1–L4, la regione del femore totale e il riquadro del collo, bordato di bianco). Le scritte sono in riquadri tinti del colore della categoria, con categoria e confronto separati da una linea: la colonna in alto a sinistra, a destra del femore il collo femorale in alto e il femore totale in basso. Le linee hanno il colore della categoria e finiscono con un anello sulla zona. In fondo il confronto con la DXA precedente sta in un riquadro con la «i».
- Densitometria in rilievo: vertebre e diafisi del femore sfumate come cilindri (più chiare a sinistra, più scure ai bordi), testa del femore e piccolo trocantere come sfere, dischi sfumati e una leggera ombra sotto le ossa; la sfumatura passa anche sulle zone colorate. Il «+» di «Aggiungi una nuova densitometria» (e di «Aggiorna il DeFRA») è ora disegnato, così sta al centro esatto del cerchio, e quando si apre diventa una X centrata.
- Densitometria: nelle scritte il nome del sito (Colonna, Collo femorale, Femore totale) è più grande; la categoria (osteoporosi, osteopenia, normale) e il confronto («Peggiorata di…», «Migliorata di…») sono più piccoli.
- DeFRA rappresentato come barra a quattro zone (verde, gialla, arancione, rossa) con il segno sulla zona indicata e sopra la percentuale di rischio a 10 anni, se inserita; sotto le zone, chi segue la paziente (medico di famiglia per verde e gialla, specialista dell'osso per arancione e rossa). Il segno sta al centro della zona, perché le soglie cambiano con l'età e non è una scala di percentuali. Con almeno due DeFRA, sotto compare «Zona del DeFRA nel tempo»: le zone come fasce colorate e un pallino per ogni DeFRA, con la percentuale se c'è.
- Decidi la terapia, nuova grafica. Prima della decisione: card bianca come le altre schede, con la zona del DeFRA come etichetta e il farmaco consigliato; lo stato della Nota 79 è un riquadro con il simbolo (verde «✓» se rientra, rosso «!» se è fuori Nota), testo giustificato e, dentro, cosa completare. I due pulsanti stanno sulla stessa riga, il principale a destra. «Prima della prima dose» è sempre aperta in una card; spiegazione del farmaco e altre opzioni sono in un unico menu «Perché … e altre opzioni». Dopo «Prescrivo»: la card diventa «Terapia in corso», con le tappe (inizio, prossima dose se programmata, densitometria di controllo, rivalutazione o fine del trattamento), la barra della durata prevista e i pulsanti «Termina» e «Foglio per la paziente»; sotto restano solo le cose ancora da fare, poi «Proposta iniziale e altre opzioni» e «Cambia decisione», chiusi.
- Ipertiroidismo tra le cause di osteoporosi: nuova voce nelle comorbidità endocrino-metaboliche («Ipertiroidismo (anche subclinico)») e nuova forma secondaria «Ipertiroidismo» con gli esami di conferma (TSH, FT4, FT3; TRAb, anti-TPO, ecografia o scintigrafia) e la nota (prima si cura la tiroide, poi si rivaluta l'osso). Il riconoscimento del testo trova ipertiroidismo, tireotossicosi, Basedow/Graves, gozzo o adenoma tossico, e lo deduce dai farmaci antitiroidei (tiamazolo/Tapazole, propiltiouracile, carbimazolo) da verificare; «ipotiroidismo» non viene confuso con l'ipertiroidismo.
- Riconoscimento del testo: «DM» è il diabete mellito (tipo da scegliere); «DM tipo 2», «DM 2», «DM II» sono tipo 2; «DM tipo 1», «DM 1» sono tipo 1.
- Ipertiroidismo come forma «Prima di trattare» (come la L-tiroxina soppressiva): va corretto prima del farmaco per l'osso. Stessa voce e stessa scheda aggiunte anche in Osteo Help (pagina principale), con la fonte (linee guida ATA 2016).
- Card della decisione presa («Inviato allo specialista» e simili): titolo più piccolo, testo breve allineato a sinistra («Registra qui la terapia che indicherà»), icona bianca nel cerchio.
- Figura: aprendo una voce di «Osteoporosi secondaria» (o delle controindicazioni), il bollino principale resta in primo piano invece di sbiadire con gli altri.
- Densitometrie e DeFRA si possono modificare: «Modifica» nella card di ogni densitometria, sotto la barra del DeFRA e (✎) in «Tutti i DeFRA». Il modulo si apre già compilato, con «Annulla» e «Salva le modifiche», e sostituisce la voce.
- A parità di data vale l'ultimo inserito: un nuovo DeFRA (o una nuova densitometria) dello stesso giorno, per esempio nella rivalutazione, diventa quello attuale, con la sua percentuale.
- La barra del DeFRA dice «Medico di Medicina Generale» invece di «Medico di famiglia».
- Fratture: ogni frattura mostra «Modifica» (si apre e si cambiano sede, gravità, data, «durante terapia»; in fondo «Elimina questa frattura»).
- Densitometria: il segno del T-score torna come prima (un pulsante «−» già scelto accanto alla casella, da toccare per «+»).
- Figura su PC: con una sezione aperta, un clic sul bianco (fuori dal pannello, dai bollini e dai passi) chiude la sezione e torna alla figura completa.
- «Prima di trattare»: «da correggere prima del farmaco, che altrimenti può non funzionare o essere rischioso» (prima: «senza correzione non funziona o fa danno»).
- Osteo Help (pagina principale): stesso testo per «Prima di trattare» e nella guida («può non funzionare o essere rischioso» invece di «fa danno»).
- Correzioni di funzionamento:
  - Prossima dose (denosumab, zoledronato) a fine mese: dal 31/08 la dose dopo 6 mesi è il 28/02, non più il 03/03.
  - Densitometria: non accetta date future né T-score fuori scala (oltre ±6, per esempio 27 invece di 2,7).
  - DeFRA: non accetta date future né un rischio fuori da 0–100%.
  - Data di nascita nel futuro o di oltre 110 anni fa: non viene salvata e compare un avviso (prima la scheda mostrava «−4 anni»).
  - Fratture modificate con il solo anno corrente: non vengono più rifiutate come «nel futuro».
  - Dose registrata: niente date future e niente doppioni della stessa data.
  - Ripristino del backup: si può scegliere di nuovo lo stesso file.
  - Eliminando una voce si chiude la modifica eventualmente aperta.
  - I calendari di nascita, esami, densitometria, DeFRA e dosi non propongono date future.
- Tiroide (ipertiroidismo, anche dagli esami, e L-tiroxina a dose soppressiva): passa da «Prima di trattare» a «Da approfondire», perché non blocca il farmaco per l'osso. Indicazione: la tiroide la cura l'endocrinologo (o si riduce la L-tiroxina); con rischio alto si tratta subito anche l'osso, altrimenti si rivaluta l'osso a funzione tiroidea normale. Compare nel pannello «Osteoporosi secondaria», nella decisione («Tiroide da curare»), nel report e nel riepilogo.
- Lettera allo specialista: la tiroide non è più un motivo di invio («inquadramento di una possibile forma secondaria»); resta solo tra le «Forme secondarie considerate», con «da curare con l'endocrinologo» o «ridurre la L-tiroxina».
- Osteo Help (pagina principale): stessi livelli per ipertiroidismo e L-tiroxina soppressiva («Da approfondire»), schede e pagina dei tre livelli aggiornate.
