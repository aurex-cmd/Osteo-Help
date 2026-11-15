# Osteo Help MMG

Software per il medico di medicina generale: gestione del paziente con osteoporosi, dalla raccolta dei dati al DeFRA, alla terapia e al follow-up.

È un'app **separata** da Osteo Help, con lo stesso stile. Osteo Help (`../index.html`) non viene modificato: questa app ne usa una copia dei dati clinici e dei motori di ragionamento, e ne apre le schede in un'altra scheda del browser.

## Come si usa

- **I miei pazienti** (pagina iniziale): elenco, nuovo paziente, backup e ripristino.
- **Scheda del paziente**: zona del DeFRA e T-score minimo, avvisi, sei sezioni con lo stato (ok, manca, attenzione).
  1. **Dati e fratture**: anagrafica, BMI, menopausa, familiarità per fratture di femore o vertebre, fratture da fragilità (sede, data, gravità vertebrale secondo Genant, frattura nonostante almeno un anno di terapia).
  2. **Anamnesi e terapie**: le voci di «Esami normali» di Osteo Help; le forme secondarie sono riconosciute in automatico con lo stesso motore e rimandano alle schede di Osteo Help. In più: glucocorticoidi da oltre 12 mesi, grave disabilità motoria, controindicazioni da conoscere (esofago, tromboembolismo, eventi cardiovascolari, radioterapia scheletrica, problemi dentari).
  3. **Esami di I livello**: la griglia ▲ N ▼ di «Esami alterati», più eGFR e 25-OH-vitamina D in numeri; forme compatibili ed esami di II livello con lo stesso motore. Avvisi per fosfatasi alcalina bassa (ipofosfatasia: bisfosfonati controindicati), ipocalcemia e carenza di vitamina D.
  4. **DeFRA**: cosa serve per completarlo, riepilogo dei dati da riportare, collegamento al calcolatore (defra-osteoporosi.it). Il medico inserisce solo la **zona** indicata dal DeFRA, le cui soglie dipendono dall'età:
     - **verde** (basso rischio): nessun farmaco per l'osteoporosi; vitamina D (Nota 96), calcio, attività fisica, prevenzione delle cadute;
     - **gialla** (rischio moderato): terapia di prima linea dal MMG, bisfosfonati orali o denosumab, con vitamina D (terapia ormonale con il ginecologo dove indicata);
     - **arancione** (alto) e **rossa** (altissimo, con priorità): invio allo specialista dell'osso per anabolici (teriparatide, abaloparatide) o romosozumab, poi un antiriassorbitivo.
  5. **Indicazioni alla terapia**: condizioni della Nota 79 secondo la determina AIFA dell'8 settembre 2025 (n. 1127/2025), con I, II e III scelta, sotto l'indicazione che viene dalla zona del DeFRA; ogni farmaco è segnato «controindicato» o «cautela» in base ai dati del paziente. Terapie in corso con promemoria (denosumab da non interrompere, rivalutazione dei bisfosfonati a 5 anni o 3 per lo zoledronato, durata massima degli anabolici).
  6. **Storico e follow-up**: DXA nel tempo (grafico, differenza con la precedente), prossima DXA tra 18 e 24 mesi dall'ultima, zone del DeFRA nel tempo (migliorata o peggiorata), rischio imminente di rifrattura se c'è una frattura negli ultimi 24 mesi.
  - **Report** stampabile o da salvare in PDF.
- **Guida per il MMG**: cos'è l'osteoporosi, cosa comporta, perché si cura, perché cercare le forme secondarie, esami di I livello, DeFRA e Nota 79, calcio, vitamina D e stile di vita, follow-up; una scheda per ognuno dei 10 farmaci.

## Privacy

I dati restano solo nel browser del dispositivo (localStorage), senza server. Backup e ripristino con un file JSON. Se il dispositivo è condiviso conviene usare iniziali o un codice al posto del nome.

## File

| File | Contenuto |
|---|---|
| `index.html` | Pagina dell'app e stile (ripreso da Osteo Help) |
| `app.js` | Schede del paziente, DeFRA, Nota 79, storico, report, guida e farmaci |
| `osteohelp-dati.js` | **Generato**: dati clinici e motori copiati senza modifiche da `../index.html` |
| `tools/aggiorna-dati.py` | Rigenera `osteohelp-dati.js` |
| `manifest.webmanifest` | Installazione come app (PWA), con le icone di Osteo Help |

Dopo ogni modifica dei contenuti clinici di Osteo Help: `python3 mmg/tools/aggiorna-dati.py`.

Pubblicata insieme a Osteo Help si apre su `…/mmg/`; le schede di Osteo Help sono raggiunte con `../#causa-…` e `../#forma-…`. Se si sposta l'app in un repository a sé, basta cambiare la costante `OH` in `app.js` con l'indirizzo di Osteo Help.

## Avvertenze

Ausilio alla decisione, non sostitutivo del giudizio del medico. Verificare sempre il testo vigente della Nota 79 e le schede tecniche dei farmaci.
