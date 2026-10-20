// Versione breve (~50 s): stesso stile, frasi più corte, l'app animata invece degli screenshot.
// Le battute di ogni scena sono pezzi della stessa frase: diventano le didascalie a tempo.
import audio from "./audio-breve.json";
import { SceneDef, TRANSITION, Voice, timing } from "./script";

export const BREVE: SceneDef[] = [
  { id: "b1", lines: [
    { say: "Hai fatto diagnosi di osteoporosi.", cap: "Hai fatto diagnosi di osteoporosi." },
    { say: "Ora la domanda è: qual è la causa?", cap: "Ora la domanda è: qual è la causa?" },
  ]},
  { id: "b2", src: "Fitzpatrick, Mayo Clin Proc 2002 · Ebeling, N Engl J Med 2008", lines: [
    { say: "Il più delle volte, è primaria:", cap: "Il più delle volte è primaria:" },
    { say: "in sette, otto casi su dieci nella donna in post-menopausa,", cap: "in 7–8 casi su 10 nella donna in post-menopausa," },
    { say: "in circa la metà nell'uomo.", cap: "in circa la metà nell'uomo." },
  ]},
  { id: "b3", lines: [
    { say: "Ma la forma primaria non si dimostra con un esame:", cap: "Ma la forma primaria non si dimostra con un esame:" },
    { say: "si pone escludendo le cause secondarie.", cap: "si pone escludendo le cause secondarie." },
  ]},
  { id: "b4", src: "Tannenbaum, J Clin Endocrinol Metab 2002: 86% delle forme secondarie non note", lines: [
    { say: "Bastano pochi esami del sangue e delle urine, quelli di primo livello:", cap: "Bastano pochi esami del sangue e delle urine, quelli di I livello:" },
    { say: "se sono nella norma, si esclude già quasi il novanta per cento delle forme secondarie.", cap: "se sono nella norma, si esclude già quasi il 90% delle forme secondarie." },
  ]},
  { id: "b5", extra: 1.6, lines: [
    { say: "Se un esame è alterato, segnalalo in Osteo Help:", cap: "Se un esame è alterato, segnalalo in Osteo Help:" },
    { say: "l'app restringe le forme compatibili e indica come confermarle.", cap: "l'app restringe le forme compatibili e indica come confermarle." },
  ]},
  { id: "b6", extra: 1.6, lines: [
    { say: "Se sono tutti normali, parti dalla storia del paziente:", cap: "Se sono tutti normali, parti dalla storia del paziente:" },
    { say: "farmaci, malattie, segni clinici.", cap: "farmaci, malattie, segni clinici." },
  ]},
  { id: "b7", extra: 3.8, lines: [
    { say: "Per ogni forma, una scheda con le fonti.", cap: "Per ogni forma, una scheda con le fonti." },
    { say: "Osteo Help.", cap: "Osteo Help." },
  ]},
];

export const VOICE_BREVE = audio as Record<string, Voice>;
export const timingBreve = (s: SceneDef) => timing(s, VOICE_BREVE);
export const totalBreve = () =>
  BREVE.reduce((a, s) => a + timingBreve(s).frames, 0) - TRANSITION * (BREVE.length - 1);
