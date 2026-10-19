// Copione: una voce per scena. Il testo parlato ha i numeri in lettere;
// le didascalie mostrano la stessa frase in forma leggibile.
import audio from "./audio.json";

export const FPS = 30;

export type Line = { say: string; cap: string };
export type SceneDef = { id: string; lines: Line[]; src?: string };

export const SCENES: SceneDef[] = [
  { id: "domanda", lines: [
    { say: "Hai posto diagnosi di osteoporosi, per una frattura da fragilità o con la densitometria.", cap: "Hai posto diagnosi di osteoporosi, per una frattura da fragilità o con la DXA." },
    { say: "A questo punto la domanda è: qual è la causa?", cap: "A questo punto la domanda è: qual è la causa?" },
  ]},
  { id: "primaria", src: "Fitzpatrick, Mayo Clin Proc 2002 · Ebeling, N Engl J Med 2008", lines: [
    { say: "Nella maggior parte dei casi, l'osteoporosi è primaria.", cap: "Nella maggior parte dei casi l'osteoporosi è primaria." },
    { say: "Nella donna in post-menopausa, lo è in sette, otto casi su dieci.", cap: "Nella donna in post-menopausa lo è in 7–8 casi su 10." },
    { say: "Nell'uomo, in circa la metà dei casi.", cap: "Nell'uomo, in circa la metà dei casi." },
  ]},
  { id: "esclusione", lines: [
    { say: "Attenzione, però: non esiste un esame che confermi la forma primaria.", cap: "Attenzione, però: non esiste un esame che confermi la forma primaria." },
    { say: "È una diagnosi di esclusione: si pone dopo aver escluso le cause secondarie.", cap: "È una diagnosi di esclusione: si pone dopo aver escluso le cause secondarie." },
  ]},
  { id: "esami", src: "Tannenbaum, J Clin Endocrinol Metab 2002", lines: [
    { say: "Per escluderle, di solito bastano pochi esami del sangue e delle urine: gli esami di primo livello.", cap: "Per escluderle, di solito bastano pochi esami del sangue e delle urine: gli esami di I livello." },
    { say: "TSH e PTH, in senso stretto, sono esami di secondo livello.", cap: "TSH e PTH, in senso stretto, sono esami di II livello." },
    { say: "Però permettono di escludere cause frequenti, come l'ipertiroidismo e l'iperparatiroidismo: per questo, in Osteo Help, rientrano tra quelli di primo livello.", cap: "Però permettono di escludere cause frequenti, come ipertiroidismo e iperparatiroidismo: per questo in Osteo Help rientrano tra quelli di I livello." },
  ]},
  { id: "normali", src: "Tannenbaum, J Clin Endocrinol Metab 2002: 86% delle forme secondarie non note", lines: [
    { say: "Se sono tutti nella norma, si esclude già quasi il novanta per cento delle osteoporosi secondarie.", cap: "Se sono tutti nella norma, si esclude già quasi il 90% delle osteoporosi secondarie." },
  ]},
  { id: "resto", lines: [
    { say: "Per la quota restante conta la storia clinica del paziente: i farmaci che assume, le malattie di cui soffre, i segni che presenta.", cap: "Per la quota restante conta la storia clinica: i farmaci che il paziente assume, le malattie di cui soffre, i segni che presenta." },
  ]},
  { id: "app", lines: [
    { say: "In Osteo Help apri la sezione: esami di primo livello normali, e seleziona ciò che riguarda il paziente.", cap: "In Osteo Help apri «Esami di I livello normali» e seleziona ciò che riguarda il paziente." },
    { say: "Per esempio, una terapia con glucocorticoidi e con inibitori di pompa protonica.", cap: "Per esempio, una terapia con glucocorticoidi e con inibitori di pompa protonica." },
    { say: "L'app propone le forme secondarie da considerare. Per ciascuna c'è una scheda: quando sospettarla, come confermarla, su quali fonti.", cap: "L'app propone le forme secondarie da considerare. Per ciascuna c'è una scheda: quando sospettarla, come confermarla, su quali fonti." },
  ]},
  { id: "sintesi", lines: [
    { say: "In sintesi: il più delle volte l'osteoporosi è primaria.", cap: "In sintesi: il più delle volte l'osteoporosi è primaria." },
    { say: "Ma si può affermarlo solo dopo aver escluso le forme secondarie.", cap: "Ma si può affermarlo solo dopo aver escluso le forme secondarie." },
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
