# Osteoporosi secondaria — Esami di primo livello

Strumento interattivo di ragionamento clinico per orientarsi dalle **alterazioni degli esami di primo livello** al **sospetto di osteoporosi secondaria**, fino al **pannello di accertamenti di secondo livello** mirato.

Applicazione web autocontenuta (un solo file `index.html`, nessuna dipendenza da installare). Pensata per uso clinico-educativo, destinata a specialisti e medici di medicina generale.

## Funzionalità

- **Combinatore diagnostico** — selezionando i reperti alterati (▲ eccesso / ▼ difetto) compaiono le forme secondarie compatibili con *tutti* i reperti scelti (logica di intersezione). Più reperti si aggiungono, più la rosa si restringe.
- **Pannello di II livello consigliato** — per i sospetti emersi viene proposto l'insieme degli accertamenti mirati, con gli esami ad alta resa (comuni a più sospetti) evidenziati e ordinati per primi.
- **Pattern da riconoscere** — combinazioni classiche (es. PTH↑ + Ca↑ → iperPTH primario) cliccabili: un tocco le carica nel combinatore.
- **Schede esame per esame** — alterazioni possibili, indizi clinici e forme da sospettare, con ricerca testuale e filtro per direzione.
- **Blocco "Complementari · II livello"** — PTH e TSH, fuori dal nucleo di primo livello ma dirimenti se letti con la calcemia.
- **Bibliografia** — riferimenti generali e una fonte verificata per ciascuna forma specifica (autori, rivista, anno, DOI).

## Note tecniche

- File singolo `index.html`, HTML/CSS/JS vanilla.
- Unica risorsa esterna: i web font Google Fonts (via CDN, richiede connessione).
- Nessun build, nessun framework, nessuna libreria da installare.
- Layout responsive e stampabile (le sezioni interattive sono nascoste in stampa).

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository (es. `osteoporosi-secondaria`).
2. Carica nella *root* del repository i file: `index.html`, `README.md`, `.nojekyll`.
3. Vai in **Settings → Pages**.
4. In **Source** scegli il branch `main` e la cartella `/ (root)`, poi **Save**.
5. Dopo qualche minuto l'app sarà online all'indirizzo:
   `https://<tuo-utente>.github.io/osteoporosi-secondaria/`

Il file `.nojekyll` (vuoto) serve a far servire il sito così com'è, senza l'elaborazione Jekyll di GitHub Pages.

## Avvertenze

Strumento di **ausilio al ragionamento clinico**, non sostitutivo del giudizio dello specialista e non un algoritmo diagnostico. Le alterazioni sono espresse in senso direzionale (▲/▼) senza soglie numeriche: i valori vanno adattati ai range del proprio laboratorio. La composizione del pannello di primo livello segue le indicazioni SIOMMMS / ISS-SNLG; verificare i singoli item rispetto alla versione delle linee guida adottata.

## Fonti

L'elenco completo dei riferimenti (linee guida italiane intersocietarie, SIOMMMS, IOF/ESCEO e una fonte per ciascuna forma specifica) è riportato nella sezione **Bibliografia** in fondo all'applicazione.
