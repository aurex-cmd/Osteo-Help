import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Background, Body, Mark, PeopleRow, Rise, Source, Title, Tube, clamp, ease, fade, fontFamily, useSpring } from "./Video";
import { FPS, LEAD, TRANSITION } from "./script";
import { BREVE, timingBreve, totalBreve } from "./breve";

/* ---------- l'app disegnata dal vivo: stesse misure e colori di index.html, in px logici ---------- */
const A = {
  ink: "#172231", muted: "#6B7584", faint: "#B5BECA", line: "#E6E9EE", box: "#F2F4F7",
  blue: "#6A5C92", blueBox: "#F1EEFB", teal: "#0E7571", tealBox: "#E3F4F3", amber: "#9A6B1F", amberBox: "#F6EDDA",
};
const LW = 330, LH = 714;                 // schermo logico del telefono
const PHONE_H = 1050, K = PHONE_H / LH, PHONE_W = Math.round(LW * K);
const PHONE_TOP = 470, PHONE_L = (1080 - PHONE_W - 28) / 2, PHONE_R = PHONE_L + PHONE_W + 28;
// da coordinate logiche dello schermo a coordinate del video
const vy = (y: number) => PHONE_TOP + 14 + y * K;
const TOP = 88;                           // barra di stato + barra dell'app

const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 30px 0", fontSize: 15, fontWeight: 600, color: A.ink }}>
    <span>9:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill={A.ink} /><rect x="5" y="5" width="3" height="6" rx="1" fill={A.ink} /><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill={A.ink} /><rect x="15" y="0" width="3" height="11" rx="1" fill={A.ink} /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={A.ink} opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="1.6" fill={A.ink} /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill={A.ink} opacity=".4" /></svg>
    </span>
  </div>
);

const AppBar: React.FC<{ title: string; act?: string }> = ({ title, act }) => (
  <div style={{ position: "absolute", top: 44, left: 0, right: 0, height: 44, display: "grid", gridTemplateColumns: "72px 1fr 72px", alignItems: "center", padding: "0 16px" }}>
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={A.muted} strokeWidth={1.8} strokeLinecap="round"><path d="m15 5-7 7 7 7" /></svg>
    <div style={{ textAlign: "center", fontSize: 14.4, fontWeight: 600, color: A.ink }}>{title}</div>
    <div style={{ textAlign: "right", fontSize: 13.6, fontWeight: 500, color: A.muted }}>{act}</div>
  </div>
);

const Screen: React.FC<{ title: string; act?: string; children: React.ReactNode; scroll?: number }> = ({ title, act, children, scroll = 0 }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: TOP, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      <div style={{ padding: "4px 16px", transform: `translateY(${-scroll}px)` }}>{children}</div>
    </div>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP, background: "#fff" }} />
    <StatusBar /><AppBar title={title} act={act} />
  </div>
);

const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <div style={{ fontSize: 29.6, lineHeight: 1.05, fontWeight: 800, letterSpacing: -0.74, color: A.ink, marginTop: 6 }}>{children}</div>
    <div style={{ height: 1, background: A.line, margin: "14px 0 12px" }} />
  </>
);
const Lbl: React.FC<{ children: React.ReactNode; mt?: number }> = ({ children, mt = 16 }) => (
  <div style={{ fontSize: 10.9, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: A.muted, margin: `${mt}px 0 4px` }}>{children}</div>
);
const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 14.7, lineHeight: 1.45, color: A.muted }}>{children}</div>
);

// tocco del dito: un'ombra che si posa e un'onda che si allarga
const Tap: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [t - 8, t, t + 16], [0, 1, 2], clamp);
  if (k <= 0 || k >= 2) return null;
  return <>
    <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: "50%", background: "rgba(23,34,49,.22)", opacity: k < 1 ? k : 2 - k, transform: `scale(${k < 1 ? 1.3 - k * 0.3 : 1})` }} />
    <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", border: "3px solid rgba(23,34,49,.45)", opacity: k > 1 ? 2 - k : 0, transform: `scale(${k > 1 ? 0.5 + (k - 1) : 0.5})` }} />
  </>;
};

// navigazione come su iPhone: la nuova schermata entra da destra, la precedente scivola un po' a sinistra
const Nav: React.FC<{ screens: { t: number; el: React.ReactNode }[] }> = ({ screens }) => {
  const f = useCurrentFrame();
  let cur = 0; screens.forEach((s, i) => { if (f >= s.t) cur = i; });
  return <>{screens.map((s, i) => {
    if (i < cur - 1 || i > cur) return null;
    const enter = interpolate(f, [screens[cur].t, screens[cur].t + 14], [0, 1], { ...clamp, easing: ease });
    const x = i === cur ? (cur === 0 ? 0 : (1 - enter) * LW) : -enter * LW * 0.28;
    return <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${x}px)`, boxShadow: i === cur && cur > 0 ? "-8px 0 24px rgba(0,0,0,.08)" : "none" }}>{s.el}</div>;
  })}</>;
};

const Dock: React.FC<{ title?: string; sub?: string; show: number }> = ({ title, sub, show }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "10px 16px 22px", background: "linear-gradient(to top,#fff 70%,rgba(255,255,255,0))" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 12, padding: "14px 16px", background: title ? A.ink : A.box, color: title ? "#fff" : A.muted, transform: `translateY(${(1 - show) * 90}px)` }}>
      {title ? <>
        <div><b style={{ display: "block", fontSize: 15.7 }}>{title}</b><span style={{ display: "block", fontSize: 12.5, opacity: 0.7 }}>{sub}</span></div>
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
      </> : <b style={{ fontSize: 15.7, padding: "8px 0" }}>{sub}</b>}
    </div>
  </div>
);

// il telefono: entra dal basso e contiene lo schermo logico ingrandito
const Phone: React.FC<{ children: React.ReactNode; out?: number }> = ({ children, out = 1e9 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 18, mass: 0.8 } });
  const leave = interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: ease });
  return <div style={{ position: "absolute", left: 0, right: 0, top: PHONE_TOP, display: "flex", justifyContent: "center", opacity: pop * (1 - leave) }}>
    <div style={{ width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: C.ink, padding: 14, boxShadow: "0 40px 100px rgba(27,36,51,.25)", transform: `translateY(${(1 - pop) * 80 - leave * 60}px) scale(${0.94 + pop * 0.06 - leave * 0.06})` }}>
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: LW, height: LH, transform: `scale(${K})`, transformOrigin: "0 0", fontFamily }}>{children}</div>
      </div>
    </div>
  </div>;
};

// titolo in alto, come nelle prime scene
const AppTitle: React.FC<{ children: React.ReactNode; out?: number; size?: number }> = ({ children, out = 1e9, size = 84 }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 90, right: 90, top: 290, opacity: interpolate(f, [out, out + 12], [1, 0], clamp) }}><Title size={size}>{children}</Title></div>;
};

// etichetta accanto al telefono, all'altezza dell'elemento toccato, con un trattino che la collega
const Callout: React.FC<{ t: number; until?: number; side: "l" | "r"; y: number; tone?: "pri" | "teal" | "ink"; children: React.ReactNode }> = ({ t, until = 1e9, side, y, tone = "pri", children }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - t, fps: FPS, config: { damping: 15, mass: 0.6 } });
  const o = Math.min(s, interpolate(f, [until, until + 10], [1, 0], clamp));
  if (o <= 0) return null;
  const col = tone === "teal" ? C.teal : tone === "ink" ? C.ink : C.pri;
  const pos: React.CSSProperties = side === "l" ? { right: 1080 - PHONE_L + 26 } : { left: PHONE_R + 26 };
  return <div style={{ position: "absolute", top: vy(y), ...pos, transform: `translateY(-50%) translateX(${(1 - s) * (side === "l" ? -30 : 30)}px)`, opacity: o, display: "flex", alignItems: "center", flexDirection: side === "l" ? "row" : "row-reverse" }}>
    <div style={{ maxWidth: 240, background: "#fff", borderRadius: 24, padding: "14px 20px", fontSize: 35, fontWeight: 800, lineHeight: 1.15, color: col, letterSpacing: -0.5, boxShadow: "0 14px 40px rgba(27,36,51,.14)", textAlign: side === "l" ? "right" : "left" }}>{children}</div>
    <div style={{ width: 22, height: 4, borderRadius: 2, background: col }} />
  </div>;
};

/* --- esami alterati --- */
type Ex = { n: string; tri?: boolean };
const ALT_GROUPS: [string, Ex[]][] = [
  ["Elettroforesi / flogosi", [{ n: "VES" }, { n: "Albumina" }]],
  ["Metabolismo calcio-fosforo", [{ n: "Calcio (corretto)" }, { n: "Fosforo" }, { n: "Fosfatasi alcalina" }, { n: "Calciuria 24h" }, { n: "25-OH-vit D" }, { n: "PTH" }]],
];
const ROW = 46, LBL = 34, ALT_TOP = TOP + 4 + 6 + 31 + 27 + 42; // h1, linea, sottotitolo
// y del centro di ciascuna riga d'esame, per piazzare i tocchi
const altRowY: Record<string, number> = {};
{ let y = ALT_TOP; for (const [, ex] of ALT_GROUPS) { y += LBL; for (const e of ex) { altRowY[e.n] = y + ROW / 2; y += ROW; } } }

const TriBtn: React.FC<{ on?: boolean; children: string; n?: boolean }> = ({ on, children, n }) => (
  <span style={{ minWidth: n ? 30 : 34, height: 32, borderRadius: 7, border: `1px solid ${on ? A.blue : A.line}`, background: on ? A.blueBox : "transparent", color: on ? A.blue : n ? A.faint : A.muted, display: "grid", placeItems: "center", fontSize: n ? 11.5 : 12.8, fontWeight: 600 }}>{children}</span>
);

const ExamList: React.FC<{ up: Record<string, boolean> }> = ({ up }) => (
  <Screen title="Esami alterati" act="Azzera">
    <H1>Esami di I livello</H1>
    <Sub>Segna ▲ o ▼ gli esami fuori norma.</Sub>
    {ALT_GROUPS.map(([g, ex]) => <div key={g}>
      <div style={{ height: LBL, display: "flex", alignItems: "flex-end" }}><Lbl mt={0}>{g}</Lbl></div>
      {ex.map(e => <div key={e.n} style={{ height: ROW, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${A.line}` }}>
        <span style={{ fontSize: 15.2, fontWeight: 600, color: A.ink }}>{e.n}</span>
        <span style={{ display: "flex", gap: 4 }}><TriBtn on={up[e.n]}>▲</TriBtn><TriBtn n>N</TriBtn><TriBtn>▼</TriBtn></span>
      </div>)}
    </div>)}
  </Screen>
);

const Chip: React.FC<{ children: React.ReactNode; tone?: "blue" | "teal" }> = ({ children, tone = "blue" }) => (
  <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: tone === "blue" ? A.blueBox : A.tealBox, color: tone === "blue" ? A.blue : A.teal, marginRight: 6 }}>{children}</span>
);

const Entry: React.FC<{ title: string; sub?: React.ReactNode; tone: "teal" | "plain" }> = ({ title, sub, tone }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, borderRadius: 10, padding: "14px 14px 14px 19px", background: tone === "teal" ? A.tealBox : A.box, marginBottom: 10 }}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: 2, background: tone === "teal" ? A.teal : A.faint }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: tone === "teal" ? A.teal : A.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: A.muted, marginTop: 3 }}>{sub}</div>}
    </div>
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={A.faint} strokeWidth={2} strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
  </div>
);

const Numbered: React.FC<{ items: string[] }> = ({ items }) => (
  <div>{items.map((t, i) => <div key={t} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: `1px solid ${A.line}`, fontSize: 14.5, lineHeight: 1.4, color: A.ink }}>
    <span style={{ color: A.muted, fontSize: 12.5, paddingTop: 2 }}>{i + 1}</span><span>{t}</span></div>)}</div>
);

const AppAlterati: React.FC<{ at: number[]; frames: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const tCa = 40, tPth = Math.max(at[1] - 10, tCa + 50), tDock = tPth + 52;
  const n = Math.round(interpolate(f, [tPth + 4, tPth + 16], [9, 1], clamp));
  const dockIn = interpolate(f, [tCa + 2, tCa + 14], [0, 1], { ...clamp, easing: ease });
  const up = { "Calcio (corretto)": f >= tCa, PTH: f >= tPth };
  const list = <div style={{ position: "absolute", inset: 0 }}>
    <ExamList up={up} />
    {f < tCa + 2 ? <Dock sub="Segna almeno un esame alterato" show={1} />
      : <Dock show={dockIn} title={`${n} ${n === 1 ? "forma compatibile" : "forme compatibili"}`} sub={f >= tPth ? "Calcio (corretto) ▲ · PTH ▲" : "Calcio (corretto) ▲"} />}
  </div>;
  const result = <Screen title="Risultato" act="Modifica">
    <H1>Forma compatibile</H1>
    <div style={{ marginBottom: 14 }}><Chip>Calcio (corretto) ▲</Chip><Chip>PTH ▲</Chip></div>
    <Entry tone="teal" title="Iperparatiroidismo primario" />
    <Lbl mt={20}>Esami di II livello</Lbl>
    <Numbered items={["PTH", "Localizzazione (se indicazione chirurgica): eco → scintigrafia sestamibi → PET-colina"]} />
  </Screen>;
  return <>
    <AppTitle>Un esame è <Mark color={C.sec} bg={C.secBox} delay={16}>alterato</Mark>?</AppTitle>
    <Callout t={tCa + 2} until={tDock + 6} side="l" y={altRowY["Calcio (corretto)"]}>Calcio alto</Callout>
    <Callout t={tCa + 14} until={tPth + 6} side="r" y={LH - 52} tone="ink">9 forme possibili</Callout>
    <Callout t={tPth + 2} until={tDock + 6} side="l" y={altRowY["PTH"]}>+ PTH alto</Callout>
    <Callout t={tPth + 18} until={tDock + 6} side="r" y={LH - 52} tone="ink">ne resta una</Callout>
    <Callout t={tDock + 22} side="r" y={TOP + 128} tone="teal">la forma compatibile</Callout>
    <Callout t={tDock + 34} side="l" y={TOP + 220}>gli esami per confermarla</Callout>
    <Phone>
    <Nav screens={[{ t: 0, el: list }, { t: tDock + 8, el: result }]} />
    <Tap x={LW - 16 - 30 - 4 - 34 - 4 - 17} y={altRowY["Calcio (corretto)"]} t={tCa} />
    <Tap x={LW - 16 - 30 - 4 - 34 - 4 - 17} y={altRowY["PTH"]} t={tPth} />
    <Tap x={LW / 2} y={LH - 52} t={tDock} />
  </Phone>
  </>;
};

/* --- esami normali: farmaci --- */
const FARMACI: [string, string[]][] = [
  ["Endocrinologia e diabetologia", ["Glucocorticoidi sistemici", "L-tiroxina a dose TSH-soppressiva", "Glitazoni (tiazolidinedioni)"]],
  ["Neurologia e psichiatria", ["Antiepilettici", "SSRI"]],
  ["Gastroenterologia", ["Inibitori di pompa protonica"]],
];
const CK = 40, NORM_TOP = TOP + 4 + 6 + 31 + 27 + 22 + 6;
const ckY: Record<string, number> = {};
{ let y = NORM_TOP; for (const [, it] of FARMACI) { y += LBL; for (const t of it) { ckY[t] = y + CK / 2; y += CK; } } }

const Check: React.FC<{ on: number }> = ({ on }) => (
  <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on > 0 ? A.teal : A.faint}`, background: on > 0 ? A.teal : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto", transform: `scale(${1 + Math.sin(Math.min(on, 1) * Math.PI) * 0.25})` }}>
    {on > 0 && <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: Math.min(1, on * 2) }}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}
  </span>
);

const AppNormali: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tG = 40, tI = Math.max(at[1] - 4, tG + 44), tDock = tI + 46;
  const on = (t: number) => f >= t ? interpolate(f, [t, t + 8], [0.01, 1], clamp) : 0;
  const ticked: Record<string, number> = { "Glucocorticoidi sistemici": on(tG), "Inibitori di pompa protonica": on(tI) };
  const k = (f >= tI ? 1 : 0) + (f >= tG ? 1 : 0);
  const list = <div style={{ position: "absolute", inset: 0 }}>
    <Screen title="Esami normali" act="Azzera">
      <H1>Quadro clinico</H1>
      <Sub>Spunta ciò che il paziente presenta.</Sub>
      <div style={{ fontSize: 16, fontWeight: 700, color: A.ink, marginTop: 14 }}>Farmaci</div>
      {FARMACI.map(([g, it]) => <div key={g}>
        <div style={{ height: LBL, display: "flex", alignItems: "flex-end" }}><Lbl mt={0}>{g}</Lbl></div>
        {it.map(t => <div key={t} style={{ height: CK, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${A.line}`, fontSize: 14.9, fontWeight: ticked[t] ? 600 : 400, color: A.ink }}>
          <Check on={ticked[t] ?? 0} />{t}</div>)}
      </div>)}
    </Screen>
    {k === 0 ? <Dock sub="Spunta almeno un elemento" show={1} />
      : <Dock show={1} title={`${k} ${k === 1 ? "forma" : "forme"} da considerare`} sub={`${k} ${k === 1 ? "elemento spuntato" : "elementi spuntati"}`} />}
  </div>;
  const result = <Screen title="Risultato" act="Modifica">
    <H1>Da considerare</H1>
    <Lbl mt={4}>Cause note presenti</Lbl>
    <div style={{ height: 6 }} />
    <Entry tone="teal" title="Osteoporosi indotta da glucocorticoidi" sub={<>Farmaci · <b style={{ color: A.teal }}>causa riconosciuta</b></>} />
    <Entry tone="plain" title="Osteoporosi da inibitori di pompa protonica" sub={<>Farmaci · <b style={{ color: A.amber }}>associazione possibile</b></>} />
  </Screen>;
  return <>
    <AppTitle>Esami tutti <Mark color={C.teal} bg={C.tealBox} delay={16}>normali</Mark>?</AppTitle>
    <Callout t={14} until={tDock + 6} side="r" y={TOP + 90} tone="ink">la storia del paziente</Callout>
    <Callout t={tG + 2} until={tDock + 6} side="l" y={ckY["Glucocorticoidi sistemici"]} tone="teal">glucocorticoidi</Callout>
    <Callout t={tI + 2} until={tDock + 6} side="l" y={ckY["Inibitori di pompa protonica"]} tone="teal">IPP</Callout>
    <Callout t={tI + 16} until={tDock + 6} side="r" y={LH - 52} tone="ink">2 forme da considerare</Callout>
    <Callout t={tDock + 22} side="r" y={TOP + 112} tone="teal">causa riconosciuta</Callout>
    <Callout t={tDock + 34} side="l" y={TOP + 182}>associazione possibile</Callout>
    <Phone>
    <Nav screens={[{ t: 0, el: list }, { t: tDock + 8, el: result }]} />
    <Tap x={26} y={ckY["Glucocorticoidi sistemici"]} t={tG} />
    <Tap x={26} y={ckY["Inibitori di pompa protonica"]} t={tI} />
    <Tap x={LW / 2} y={LH - 52} t={tDock} />
  </Phone>
  </>;
};

/* --- la scheda, poi il marchio --- */
const Scheda: React.FC<{ scroll: number }> = ({ scroll }) => (
  <Screen title="Scheda" scroll={scroll}>
    <span style={{ display: "inline-block", fontSize: 11.2, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", padding: "4px 8px", borderRadius: 6, background: A.amberBox, color: A.amber, marginTop: 4 }}>Farmaci</span>
    <H1>Osteoporosi indotta da glucocorticoidi</H1>
    <Lbl>Quando considerarla</Lbl>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", fontSize: 15, fontWeight: 600, color: A.ink }}>
      <span style={{ color: A.teal }}>✓</span><span style={{ flex: 1 }}>Assume glucocorticoidi sistemici</span><span style={{ fontSize: 12.8, color: A.teal }}>forte</span>
    </div>
    <Lbl>Conferma</Lbl>
    <div style={{ fontSize: 14.7, lineHeight: 1.5, color: A.ink }}>Prednisone-equivalente ≥5 mg/die per più di 3 mesi, in atto o previsto (soglia della Nota 79 AIFA). Il rischio aumenta già a dosi più basse.</div>
    <Lbl>Nota</Lbl>
    <div style={{ fontSize: 14.7, lineHeight: 1.5, color: A.ink }}>Riducono la formazione ossea e aumentano il riassorbimento nelle prime settimane. Il rischio di frattura sale già nei primi 3–6 mesi e si riduce in parte alla sospensione.</div>
    <Lbl>Fonti</Lbl>
    {[["12", "Humphrey MB et al. 2022 American College of Rheumatology Guideline for the Prevention and Treatment of Glucocorticoid-Induced Osteoporosis. Arthritis Rheumatol 2023."], ["5", "AIFA. Aggiornamento della Nota 79. 2022."]].map(([n, t]) =>
      <div key={n} style={{ display: "flex", gap: 12, padding: "8px 0", fontSize: 13, lineHeight: 1.45, color: A.muted }}><b style={{ color: "#2F5F96", fontSize: 14 }}>{n}</b><span>{t}</span></div>)}
  </Screen>
);

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const s = useSpring(t, 14);
  const f = useCurrentFrame();
  return <Body>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, opacity: s, transform: `scale(${0.9 + s * 0.1})` }}>
      <div style={{ width: 230, height: 230, borderRadius: 56, background: C.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ color: "#fff", fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>OH</span>
        <span style={{ width: 108, height: 11, borderRadius: 6, background: "#7CC3BF", transform: `scaleX(${interpolate(f, [t + 10, t + 26], [0, 1], { ...clamp, easing: ease })})` }} />
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, color: C.ink }}>Osteo Help</div>
      <div style={{ fontSize: 38, lineHeight: 1.35, color: C.muted, textAlign: "center", opacity: fade(f, t + 16) }}>Dagli esami di primo livello e dalla clinica<br />alle possibili cause secondarie</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginTop: 10, opacity: fade(f, t + 30) }}>
        <div style={{ width: 80, height: 3, borderRadius: 2, background: C.line }} />
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.5, color: C.ink }}>Dr. Aurelio Guarnaccia</div>
      </div>
    </div>
  </Body>;
};

const B7: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const out = at[1] - 16;
  const tS = Math.round(out * 0.55);  // la scheda scorre fino alle fonti
  const scroll = interpolate(f, [tS, tS + 18], [0, 170], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <>
    {f < out + 16 && <Phone out={out}><Scheda scroll={scroll} /></Phone>}
    {f < out + 16 && <>
      <AppTitle out={out} size={72}>Per ogni forma, una <Mark color={C.pri} bg={C.priBox} delay={16}>scheda</Mark></AppTitle>
      <Callout t={16} until={tS} side="r" y={TOP + 240} tone="ink">quando sospettarla</Callout>
      <Callout t={30} until={tS} side="l" y={TOP + 310} tone="ink">come confermarla</Callout>
      <Callout t={tS + 22} until={out} side="r" y={TOP + 440 - 170} tone="ink">con le fonti</Callout>
    </>}
    <EndCard t={out + 6} />
  </>;
};

/* --- scene senza telefono --- */
const B1: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const s = useSpring(4, 10);
  const pulse = 1 + Math.sin(f / 9) * 0.025;
  return <Body>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
      <div style={{ width: 300, height: 300, borderRadius: "50%", background: C.box, border: `4px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: 170, fontWeight: 800, color: C.ink, transform: `scale(${s * pulse})`, boxShadow: "0 30px 80px rgba(27,36,51,.10)" }}>?</div>
    </div>
    <Title delay={10} size={110}>Osteoporosi.</Title>
    <Title delay={at[1]} size={110}><span style={{ color: C.pri }}>Qual è la causa?</span></Title>
  </Body>;
};

const B2: React.FC<{ at: number[] }> = ({ at }) => (
  <Body>
    <Title>Il più delle volte è <Mark color={C.pri} bg={C.priBox} delay={22}>primaria</Mark></Title>
    <PeopleRow label="Donna" sub="in post-menopausa" solid={7} light={1} delay={at[1] - 6} tag="7–8 su 10" />
    <PeopleRow label="Uomo" sub="" solid={4} light={1} delay={at[2] - 6} tag="~1 su 2" />
    <Rise delay={at[2] + 24}><div style={{ display: "flex", gap: 40, fontSize: 30, color: C.muted, fontWeight: 600 }}>
      <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: C.pri, marginRight: 12, verticalAlign: -2 }} />primaria</span>
      <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: C.sec, marginRight: 12, verticalAlign: -2 }} />secondaria</span>
    </div></Rise>
  </Body>
);

const B3: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const items = ["Cause endocrine", "Cause da farmaci", "Malattie croniche", "Carenze di vitamina D e calcio"];
  const t0 = at[1] - 6, STEP = 10;
  const stamp = spring({ frame: f - (t0 + items.length * STEP + 8), fps: FPS, config: { damping: 11 } });
  return <Body>
    <Title>La primaria è una diagnosi di <Mark color={C.teal} bg={C.tealBox} delay={22}>esclusione</Mark></Title>
    <Rise delay={14}><div style={{ background: C.box, borderRadius: 40, padding: "40px 44px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 20px 60px rgba(27,36,51,.06)" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>Cause secondarie</div>
      {items.map((t, i) => {
        const k = interpolate(f, [t0 + i * STEP, t0 + i * STEP + 8], [0, 1], { ...clamp, easing: ease });
        return <div key={t} style={{ display: "flex", alignItems: "center", gap: 26, padding: "20px 0", borderTop: i ? `2px solid ${C.line}` : "none" }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", border: `4px solid ${k > 0 ? C.sec : C.line}`, background: k > 0 ? C.sec : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
            <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: k, transform: `scale(${0.5 + k / 2})` }}><path d="m7 7 10 10M17 7 7 17" /></svg>
          </div>
          <div style={{ flex: 1, fontSize: 40, fontWeight: 600, color: C.ink }}>{t}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.sec, opacity: k }}>escluse</div>
        </div>;
      })}
    </div></Rise>
    <div style={{ display: "flex", justifyContent: "center", opacity: stamp, transform: `scale(${0.7 + stamp * 0.3})` }}>
      <div style={{ background: C.pri, color: "#fff", fontSize: 50, fontWeight: 800, padding: "22px 48px", borderRadius: 60, letterSpacing: -0.5 }}>= osteoporosi primaria</div>
    </div>
  </Body>;
};

const EXAMS: [string, boolean?][] = [["Hb"], ["MCV"], ["VES"], ["Elettroforesi"], ["Albumina"], ["Calcio"], ["Fosforo"], ["Fosfatasi alcalina"], ["Calciuria 24h"], ["25-OH-vit D"], ["Creatinina"], ["TSH", true], ["PTH", true]];

const B4: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tick0 = 34, TICK = Math.max(3, Math.floor((at[1] - 8 - tick0) / EXAMS.length));
  const p = interpolate(f, [at[1], at[1] + 70], [0, 0.86], { ...clamp, easing: Easing.out(Easing.cubic) });
  const R = 190, L = 2 * Math.PI * R;
  return <Body>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <Rise delay={2}><Tube size={104} /></Rise>
      <Title size={80}>Bastano gli esami<br />di I livello</Title>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      {EXAMS.map(([e, ii], i) => {
        const ok = interpolate(f, [tick0 + i * TICK, tick0 + i * TICK + 6], [0, 1], clamp);
        return <Rise key={e} delay={8 + i * 2}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 33, fontWeight: 700, padding: "12px 20px", borderRadius: 18, background: ii ? C.priBox : C.tealBox, color: ii ? C.pri : C.teal }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: ii ? C.pri : C.teal, display: "grid", placeItems: "center", opacity: 0.25 + ok * 0.75 }}>
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: ok, transform: `scale(${0.4 + ok * 0.6})` }}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
            </span>{e}
            {ii && <span style={{ fontSize: 20, fontWeight: 800, background: C.pri, color: "#fff", borderRadius: 8, padding: "3px 8px" }}>II liv.</span>}
          </span>
        </Rise>;
      })}
    </div>
    <Rise delay={tick0 + 20}><div style={{ fontSize: 28, color: C.muted, lineHeight: 1.4 }}>TSH e PTH sono a rigore di II livello: in Osteo Help rientrano tra quelli di I livello perché escludono cause frequenti.</div></Rise>
    <div style={{ display: "flex", alignItems: "center", gap: 40, opacity: fade(f, at[1] - 10, 14) }}>
      <div style={{ position: "relative", width: 2 * R + 60, height: 2 * R + 60, flex: "0 0 auto" }}>
        <svg viewBox={`0 0 ${2 * R + 60} ${2 * R + 60}`} width={2 * R + 60} height={2 * R + 60} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke={C.secBox} strokeWidth={46} />
          <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke={C.teal} strokeWidth={46} strokeLinecap="round" strokeDasharray={`${L * p} ${L}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 120, fontWeight: 800, color: C.teal, letterSpacing: -4 }}>{Math.round(p * 100)}%</div>
      </div>
      <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.15, color: C.ink }}>forme secondarie <span style={{ color: C.teal }}>escluse</span><div style={{ fontSize: 30, fontWeight: 600, color: C.muted, marginTop: 12 }}>se gli esami sono<br />nella norma</div></div>
    </div>
  </Body>;
};

/* ---------- montaggio ---------- */
const Scene: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, 0, TRANSITION), interpolate(f, [frames - TRANSITION, frames], [1, 0], clamp));
  const y = interpolate(f, [frames - TRANSITION, frames], [0, -40], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};

// nel finale la voce si ferma un attimo prima di «Osteo Help.», per lasciare tempo alla scheda
const GAP = 40;
const STARTS: number[] = [];
{ let from = 0; for (const s of BREVE) { STARTS.push(from); from += timingBreve(s).frames - TRANSITION; } }
const TOTAL = totalBreve();
// fotogramma in cui compare il marchio finale (Brand in alto si spegne)
const END_AT = STARTS[STARTS.length - 1] + timingBreve(BREVE[BREVE.length - 1]).lines[1].from + GAP - 10;

const MUSIC = 0.42, DUCK = 0.2, RAMP = 10;
const SPANS: [number, number][] = BREVE.flatMap((s, i) => timingBreve(s).lines.map((l, k) => {
  const g = s.id === "b7" && k > 0 ? GAP : 0;
  return [STARTS[i] + l.from + g, STARTS[i] + l.to + g] as [number, number];
}));
const musicVolume = (f: number) => {
  const d = Math.min(...SPANS.map(([a, b]) => f < a ? a - f : f > b ? f - b : 0));
  const out = interpolate(f, [TOTAL - 50, TOTAL - 4], [1, 0], clamp);
  return (DUCK + (MUSIC - DUCK) * Math.min(1, d / RAMP)) * out;
};

const BrandSmall: React.FC = () => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", top: 150, left: 90, display: "flex", alignItems: "center", gap: 22, opacity: interpolate(f, [END_AT - 10, END_AT], [1, 0], clamp) }}>
    <div style={{ width: 76, height: 76, borderRadius: 20, background: C.ink, color: C.bg, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>OH</div>
    <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, color: C.ink }}>Osteo Help</div>
  </div>;
};

export const Breve: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, color: C.ink }}>
    <Audio src={staticFile("musica/sottofondo.mp3")} volume={musicVolume} />
    <Background />
    <BrandSmall />
    {BREVE.map((s, i) => {
      const t = timingBreve(s);
      const at = t.lines.map((l, k) => l.from + (s.id === "b7" && k > 0 ? GAP : 0));
      const body = { b1: <B1 at={at} />, b2: <B2 at={at} />, b3: <B3 at={at} />, b4: <B4 at={at} />, b5: <AppAlterati at={at} frames={t.frames} />, b6: <AppNormali at={at} />, b7: <B7 at={at} /> }[s.id];
      return <Sequence key={s.id} from={STARTS[i]} durationInFrames={t.frames}>
        {t.hasAudio && (s.id !== "b7"
          ? <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile(`voce-breve/${s.id}.mp3`)} /></Sequence>
          : <>
            <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile("voce-breve/b7.mp3")} endAt={t.lines[1].from - Math.round(LEAD * FPS)} /></Sequence>
            <Sequence from={t.lines[1].from + GAP}><Audio src={staticFile("voce-breve/b7.mp3")} startFrom={t.lines[1].from - Math.round(LEAD * FPS)} /></Sequence>
          </>)}
        <Scene frames={t.frames}>{body}<Source text={s.src} /></Scene>
      </Sequence>;
    })}
  </AbsoluteFill>
);
