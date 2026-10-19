# Copione per la voce (ElevenLabs)

Una generazione per scena, modello Eleven Multilingual v2, stessa voce per tutte,
ritmo normale (in ElevenLabs: Speed 1.0–1.1).
Salvare gli MP3 in `public/voce/` con il nome indicato: le durate dei file
fissano i tempi delle scene (vedi `src/audio.json`).

| File | Testo |
|---|---|
| `domanda.mp3` | Hai appena diagnosticato un'osteoporosi, con una frattura da fragilità o con la densitometria. La domanda è: qual è la causa? |
| `primaria.mp3` | Nella maggior parte dei casi, la risposta è semplice: l'osteoporosi è primaria. Nella donna dopo la menopausa succede sette, otto volte su dieci. Nell'uomo, più o meno una volta su due. |
| `esclusione.mp3` | Ma attenzione: primaria non si dimostra direttamente. Ci si arriva escludendo le cause secondarie. |
| `esami.mp3` | Per escluderle, il più delle volte bastano pochi esami del sangue e delle urine: gli esami di primo livello. TSH e PTH, a rigore, sarebbero esami di secondo livello. Ma escludono cause frequenti, come l'ipertiroidismo e l'iperparatiroidismo: per questo, in Osteo Help, li trovi tra quelli di primo livello. |
| `normali.mp3` | Se questi esami sono tutti normali, abbiamo già escluso quasi nove cause secondarie su dieci. |
| `resto.mp3` | Per quel piccolo resto, si guarda alla storia del paziente: farmaci, malattie, segni clinici. |
| `app.mp3` | In Osteo Help apri la sezione: esami di primo livello normali, e spunti ciò che il paziente presenta. Per esempio: glucocorticoidi e inibitori di pompa protonica. L'app ti mostra le forme da considerare, e per ognuna una scheda: quando sospettarla, come confermarla, e le fonti. |
| `sintesi.mp3` | In sintesi: quasi sempre è primaria. Ma lo diciamo solo dopo aver escluso le secondarie. |

Render: `npm run render -- --browser-executable=<chrome-headless-shell>`
