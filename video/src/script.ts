// Copione: una voce per scena. Il testo parlato ha i numeri in lettere;
// le didascalie mostrano la stessa frase in forma leggibile.
import audio from "./audio.json";

export const FPS = 30;

export type Line = { say: string; cap: string };
export type SceneDef = { id: string; lines: Line[]; src?: string };

export const SCENES: SceneDef[] = [
  { id: "domanda", lines: [
    { say: "Hai appena diagnosticato un'osteoporosi, con una frattura da fragilità o con la densitometria.", cap: "Hai appena diagnosticato un'osteoporosi, con una frattura da fragilità o con la DXA." },
    { say: "La domanda è: qual è la causa?", cap: "La domanda è: qual è la causa?" },
  ]},
  { id: "primaria", src: "Fitzpatrick, Mayo Clin Proc 2002 · Ebeling, N Engl J Med 2008", lines: [
    { say: "Nella maggior parte dei casi, la risposta è semplice: l'osteoporosi è primaria.", cap: "Nella maggior parte dei casi la risposta è semplice: l'osteoporosi è primaria." },
    { say: "Nella donna dopo la menopausa succede sette, otto volte su dieci.", cap: "Nella donna dopo la menopausa succede 7–8 volte su 10." },
    { say: "Nell'uomo, più o meno una volta su due.", cap: "Nell'uomo, più o meno una volta su due." },
  ]},
  { id: "esclusione", lines: [
    { say: "Ma attenzione: primaria non si dimostra direttamente.", cap: "Ma attenzione: primaria non si dimostra direttamente." },
    { say: "Ci si arriva escludendo le cause secondarie.", cap: "Ci si arriva escludendo le cause secondarie." },
  ]},
  { id: "esami", src: "Tannenbaum, J Clin Endocrinol Metab 2002", lines: [
    { say: "Per escluderle, il più delle volte bastano pochi esami del sangue e delle urine: gli esami di primo livello.", cap: "Per escluderle, il più delle volte bastano pochi esami del sangue e delle urine: gli esami di I livello." },
    { say: "TSH e PTH, a rigore, sarebbero esami di secondo livello.", cap: "TSH e PTH, a rigore, sarebbero esami di II livello." },
    { say: "Ma escludono cause frequenti, come l'ipertiroidismo e l'iperparatiroidismo: per questo, in Osteo Help, li trovi tra quelli di primo livello.", cap: "Ma escludono cause frequenti, come ipertiroidismo e iperparatiroidismo: per questo in Osteo Help sono tra quelli di I livello." },
  ]},
  { id: "normali", src: "Tannenbaum, J Clin Endocrinol Metab 2002: 86% delle cause secondarie non note", lines: [
    { say: "Se questi esami sono tutti normali, abbiamo già escluso quasi nove cause secondarie su dieci.", cap: "Se questi esami sono tutti normali, abbiamo già escluso quasi 9 cause secondarie su 10." },
  ]},
  { id: "resto", lines: [
    { say: "Per quel piccolo resto, si guarda alla storia del paziente: farmaci, malattie, segni clinici.", cap: "Per quel piccolo resto si guarda alla storia del paziente: farmaci, malattie, segni clinici." },
  ]},
  { id: "app", lines: [
    { say: "In Osteo Help apri la sezione: esami di primo livello normali, e spunti ciò che il paziente presenta.", cap: "In Osteo Help apri «Esami di I livello normali» e spunti ciò che il paziente presenta." },
    { say: "Per esempio: glucocorticoidi e inibitori di pompa protonica.", cap: "Per esempio: glucocorticoidi e inibitori di pompa protonica." },
    { say: "L'app ti mostra le forme da considerare, e per ognuna una scheda: quando sospettarla, come confermarla, e le fonti.", cap: "L'app ti mostra le forme da considerare e, per ognuna, una scheda: quando sospettarla, come confermarla, le fonti." },
  ]},
  { id: "sintesi", lines: [
    { say: "In sintesi: quasi sempre è primaria.", cap: "In sintesi: quasi sempre è primaria." },
    { say: "Ma lo diciamo solo dopo aver escluso le secondarie.", cap: "Ma lo diciamo solo dopo aver escluso le secondarie." },
  ]},
];

// Senza audio la durata è stimata da un parlato a ritmo normale (~15 caratteri al secondo).
const CPS = 15, TAIL = 1.1;
export const LEAD = 0.5;
const DUR = audio as Record<string, number>;

export function timing(s: SceneDef) {
  const chars = s.lines.map(l => l.say.length);
  const total = chars.reduce((a, b) => a + b, 0);
  const speech = DUR[s.id] ?? total / CPS + (s.lines.length - 1) * 0.45;
  const frames = Math.round((LEAD + speech + TAIL) * FPS);
  let t = LEAD;
  const lines = s.lines.map((l, i) => {
    const d = speech * chars[i] / total;
    const r = { ...l, from: Math.round(t * FPS), to: Math.round((t + d) * FPS) };
    t += d;
    return r;
  });
  return { frames, lines, hasAudio: s.id in DUR };
}

export const TRANSITION = 14;
export const totalFrames = () =>
  SCENES.reduce((a, s) => a + timing(s).frames, 0) - TRANSITION * (SCENES.length - 1);
