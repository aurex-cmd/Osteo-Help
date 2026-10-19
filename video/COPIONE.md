# Copione per la voce (ElevenLabs)

Una generazione per scena, modello Eleven Multilingual v2, stessa voce per tutte,
ritmo normale (in ElevenLabs: Speed 1.0–1.1).
Salvare gli MP3 in `public/voce/` con il nome indicato: le durate dei file
fissano i tempi delle scene (vedi `src/audio.json`).

| File | Testo |
|---|---|
| `domanda.mp3` | Hai posto diagnosi di osteoporosi, per una frattura da fragilità o con la densitometria. A questo punto la domanda è: qual è la causa? |
| `primaria.mp3` | Nella maggior parte dei casi, l'osteoporosi è primaria. Nella donna in post-menopausa, lo è in sette, otto casi su dieci. Nell'uomo, in circa la metà dei casi. |
| `esclusione.mp3` | Attenzione, però: non esiste un esame che confermi la forma primaria. È una diagnosi di esclusione: si pone dopo aver escluso le cause secondarie. |
| `esami.mp3` | Per escluderle, di solito bastano pochi esami del sangue e delle urine: gli esami di primo livello. TSH e PTH, in senso stretto, sono esami di secondo livello. Però permettono di escludere cause frequenti, come l'ipertiroidismo e l'iperparatiroidismo: per questo, in Osteo Help, rientrano tra quelli di primo livello. |
| `normali.mp3` | Se sono tutti nella norma, si esclude già quasi il novanta per cento delle osteoporosi secondarie. |
| `resto.mp3` | Per la quota restante conta la storia clinica del paziente: i farmaci che assume, le malattie di cui soffre, i segni che presenta. |
| `app.mp3` | In Osteo Help apri la sezione: esami di primo livello normali, e seleziona ciò che riguarda il paziente. Per esempio, una terapia con glucocorticoidi e con inibitori di pompa protonica. L'app propone le forme secondarie da considerare. Per ciascuna c'è una scheda: quando sospettarla, come confermarla, su quali fonti. |
| `sintesi.mp3` | In sintesi: il più delle volte l'osteoporosi è primaria. Ma si può affermarlo solo dopo aver escluso le forme secondarie. |

Render: `npm run render -- --browser-executable=<chrome-headless-shell>`
