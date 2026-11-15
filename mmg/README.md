# Osteo Help MMG

Software per il medico di medicina generale: gestione del paziente con osteoporosi, dalla raccolta dei dati al DeFRA, alla terapia e al follow-up.

È un'app **separata** da Osteo Help, con lo stesso stile. Osteo Help (`../index.html`) non viene modificato: questa app ne usa una copia dei dati clinici e dei motori di ragionamento, e ne apre le schede in un'altra scheda del browser.

## Come si usa

Per ogni paziente un **percorso guidato in 7 passi**: in cima a ogni pagina una barra mostra a che passo si è («Passo 3 di 7») e quale viene dopo; in fondo «Indietro» e «Avanti». La scheda del paziente mostra il percorso con lo stato di ogni passo (fatto, attenzione, da fare) e un pulsante «Continua» che porta al prossimo passo da fare. L'elenco dei pazienti dice per ognuno a che passo è rimasto.

1. Dati e fratture · 2. Anamnesi e farmaci · 3. Esami del sangue · 4. Densitometria · 5. DeFRA · 6. Terapia (con la decisione del medico: terapia avviata, invio allo specialista, nessun farmaco, decisione rimandata) · 7. Follow-up.


- **I miei pazienti** (pagina iniziale): elenco, nuovo paziente, **Da fare** (scadenze di tutti i pazienti in ordine di urgenza: dose di denosumab in ritardo o vicina, infusione annuale di zoledronato, fine di teriparatide/abaloparatide/romosozumab, bisfosfonato da 5 anni o zoledronato da 3, DXA da ripetere, frattura recente senza terapia, decisione rimandata), promemoria del backup se l'archivio è cambiato e l'ultimo backup ha più di 14 giorni, backup e ripristino, blocco con codice. Sul computer la pagina è su due colonne.
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
- **Guida per il MMG**: cos'è l'osteoporosi, cosa comporta, perché si cura, perché cercare le forme secondarie, esami di I livello, DeFRA e Nota 79, calcio, vitamina D e stile di vita, follow-up; una scheda per ognuno dei 10 farmaci.

## Vista a figura

La scheda del paziente si apre come **figura** (la si può cambiare con «Percorso a passi»; l'app ricorda la scelta). La figura dipende da sesso, età e fratture recenti: donna o uomo giovane (sotto i 60 anni), donna o uomo anziano, donna con il polso ingessato (frattura di polso negli ultimi 24 mesi), uomo in carrozzina con frattura di femore (negli ultimi 24 mesi). Per un paziente nuovo si sceglie prima «Chi entra in ambulatorio?».

- **Punti sulla figura** («indizi»): testa → chi è (età, peso, menopausa, familiarità); frattura → fratture da fragilità; busto → malattie e farmaci (con «Incolla dal gestionale»). Ogni punto pulsa finché manca, diventa verde quando è completo e rosso quando contiene qualcosa che pesa sulla decisione; l'etichetta accanto riassume il dato.
- **Sulla scrivania**: esami del sangue, densitometria, DeFRA e, dopo la decisione, i controlli. Ogni punto o referto apre un riquadro dal basso con la stessa parte della scheda a passi.
- **In evidenza** restano i dati che contano: frattura recente (rischio imminente), rischio molto alto, controindicazioni (esofago, eGFR, fosfatasi alcalina bassa, rischio cardiovascolare, TEV, denti), vitamina D bassa, glucocorticoidi, forme secondarie, zona del DeFRA, T-score minimo, più le prime cose da fare.
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
| `img/` | Illustrazioni dei pazienti (figura intera e viso) |
| `osteohelp-dati.js` | **Generato**: dati clinici e motori copiati senza modifiche da `../index.html` |
| `tools/aggiorna-dati.py` | Rigenera `osteohelp-dati.js` |
| `manifest.webmanifest` | Installazione come app (PWA), con le icone di Osteo Help |

Dopo ogni modifica dei contenuti clinici di Osteo Help: `python3 mmg/tools/aggiorna-dati.py`.

Pubblicata insieme a Osteo Help si apre su `…/mmg/`; le schede di Osteo Help sono raggiunte con `../#causa-…` e `../#forma-…`. Se si sposta l'app in un repository a sé, basta cambiare la costante `OH` in `app.js` con l'indirizzo di Osteo Help.

## Avvertenze

Ausilio alla decisione, non sostitutivo del giudizio del medico. Verificare sempre il testo vigente della Nota 79 e le schede tecniche dei farmaci.
