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

Dalla home si consultano anche: pattern da riconoscere (un tocco ne mostra il risultato), esame per esame, catalogo delle forme, calcio corretto, bibliografia.

**Logica (invariata rispetto all'originale)**
- *Esami alterati*: compaiono le forme compatibili con **tutti** i reperti segnati. Se nessuna forma da sola li spiega, il quadro viene letto come più cause indipendenti. Un esame segnato N esclude le forme in cui quell'esame è un reperto chiave.
- *Esami normali*: ogni forma ha trigger forti (bastano da soli) o lievi (contano se si sommano). Le forme sono divise in cause note presenti e sospetti da approfondire. Il sesso nasconde le voci non pertinenti.

## File

| File | Contenuto |
|---|---|
| `index.html` | L'intera app (HTML, CSS, JavaScript e icone SVG incorporate, nessuna dipendenza) |
| `favicon.svg` | Icona della scheda del browser (SVG, con `favicon-32.png` come riserva) |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon-180.png`, `favicon-32.png` | Installazione come app (PWA) |
| `.nojekyll` | Fa servire i file a GitHub Pages così come sono |

Unica risorsa esterna: il font Inter da Google Fonts (senza connessione si usa il font di sistema).

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
