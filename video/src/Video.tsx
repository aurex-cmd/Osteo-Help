import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { FPS, LEAD, SCENES, TRANSITION, timing } from "./script";
import STEPS from "./app-steps.json";

// Inter variabile, incluso nel progetto (rsms/inter, SIL Open Font License)
const fontFamily = "Inter";
loadFont({ family: fontFamily, url: staticFile("fonts/inter-latin-wght-normal.woff2"), weight: "100 900" });

// palette dell'app Osteo Help
const C = {
  bg: "#F7F5F1", ink: "#1B2433", muted: "#6F7988", line: "#E1E5EB", box: "#FFFFFF",
  pri: "#6A5C92", priBox: "#ECE8F7", sec: "#B04E37", secBox: "#F7E4DE",
  teal: "#0E7571", tealBox: "#DDF1EF", peach: "#F7C6B7", mint: "#B0DFCC",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const fade = (f: number, from: number, len = 18) => interpolate(f, [from, from + len], [0, 1], { ...clamp, easing: ease });
const useSpring = (delay: number, damping = 16) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } });
};

/* ---------- elementi comuni ---------- */
const Rise: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const s = useSpring(delay);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 50}px)`, ...style }}>{children}</div>;
};

const Kicker: React.FC<{ n: number; text: string; delay?: number }> = ({ n, text, delay = 0 }) => (
  <Rise delay={delay}><div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.muted }}>{n} · {text}</div></Rise>
);

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({ children, delay = 4, size = 92 }) => (
  <Rise delay={delay}><div style={{ fontSize: size, lineHeight: 1.04, fontWeight: 800, letterSpacing: -2.5, color: C.ink }}>{children}</div></Rise>
);

// evidenziatore che scorre sotto una parola
const Mark: React.FC<{ children: React.ReactNode; color: string; bg: string; delay: number }> = ({ children, color, bg, delay }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 16], [0, 100], { ...clamp, easing: ease });
  return <span style={{ position: "relative", color, whiteSpace: "nowrap" }}>
    <span style={{ position: "absolute", left: -8, right: -8, bottom: 4, height: "42%", background: bg, borderRadius: 10, zIndex: -1, clipPath: `inset(0 ${100 - w}% 0 0)` }} />
    {children}
  </span>;
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 90), b = Math.cos(f / 110);
  const blob = (c: string, x: number, y: number, r: number) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c, filter: "blur(120px)", opacity: 0.55 }} />
  );
  return <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    {blob(C.peach, 980 + a * 60, 240 + b * 40, 360)}
    {blob(C.mint, 80 + b * 50, 1500 + a * 60, 420)}
  </AbsoluteFill>;
};

const Brand: React.FC = () => (
  <div style={{ position: "absolute", top: 150, left: 90, display: "flex", alignItems: "center", gap: 22 }}>
    <div style={{ width: 76, height: 76, borderRadius: 20, background: C.ink, color: C.bg, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>OH</div>
    <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, color: C.ink }}>Osteo Help</div>
  </div>
);

const Caption: React.FC<{ lines: ReturnType<typeof timing>["lines"] }> = ({ lines }) => {
  const f = useCurrentFrame();
  const cur = lines.find(l => f >= l.from - 4 && f < l.to + 8) ?? null;
  if (!cur) return null;
  const o = Math.min(fade(f, cur.from - 4, 8), interpolate(f, [cur.to, cur.to + 8], [1, 0], clamp));
  return <div style={{ position: "absolute", left: 70, right: 70, bottom: 250, display: "flex", justifyContent: "center", opacity: o }}>
    <div style={{ background: "rgba(27,36,51,.88)", color: "#fff", fontSize: 40, lineHeight: 1.32, fontWeight: 500, padding: "22px 34px", borderRadius: 26, textAlign: "center", maxWidth: 900 }}>{cur.cap}</div>
  </div>;
};

const Source: React.FC<{ text?: string }> = ({ text }) => text
  ? <div style={{ position: "absolute", left: 90, right: 90, bottom: 150, fontSize: 24, color: C.muted, textAlign: "center" }}>Fonte: {text}</div>
  : null;

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 330, bottom: 460, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>{children}</div>
);

/* ---------- icone ---------- */
const Person: React.FC<{ color: string; light?: boolean }> = ({ color, light }) => (
  <svg viewBox="0 0 40 72" width={58} height={104}>
    <circle cx="20" cy="12" r="10" fill={color} opacity={light ? 0.45 : 1} />
    <path d="M4 34a16 16 0 0 1 32 0v34H4z" fill={color} opacity={light ? 0.45 : 1} />
  </svg>
);

const Tube: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={C.teal} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 5h20M17.5 5v31a6.5 6.5 0 0 0 13 0V5" /><path d="M17.5 22h13" />
  </svg>
);

/* ---------- scene ---------- */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const s = useSpring(6, 10);
  const pulse = 1 + Math.sin(f / 9) * 0.025;
  return <Body>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
      <div style={{ width: 300, height: 300, borderRadius: "50%", background: C.box, border: `4px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: 170, fontWeight: 800, color: C.ink, transform: `scale(${s * pulse})`, boxShadow: "0 30px 80px rgba(27,36,51,.10)" }}>?</div>
    </div>
    <Title delay={18} size={104}>Osteoporosi.<br /><span style={{ color: C.pri }}>Qual è la causa?</span></Title>
    <Rise delay={34}><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {["frattura da fragilità", "DXA"].map(t => <span key={t} style={{ fontSize: 34, fontWeight: 600, padding: "12px 24px", borderRadius: 40, background: C.box, color: C.muted }}>{t}</span>)}
    </div></Rise>
  </Body>;
};

const PeopleRow: React.FC<{ label: string; sub: string; solid: number; light: number; delay: number; tag: string }> = ({ label, sub, solid, light, delay, tag }) => {
  const f = useCurrentFrame();
  return <Rise delay={delay}>
    <div style={{ background: C.box, borderRadius: 36, padding: "34px 36px", display: "flex", flexDirection: "column", gap: 22, boxShadow: "0 20px 60px rgba(27,36,51,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div><div style={{ fontSize: 46, fontWeight: 800, color: C.ink }}>{label}</div><div style={{ fontSize: 28, color: C.muted, marginTop: 4 }}>{sub}</div></div>
        <div style={{ fontSize: 54, fontWeight: 800, color: C.pri, opacity: fade(f, delay + 40, 14) }}>{tag}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const on = f >= delay + 12 + i * 4;
          const kind = i < solid ? "p" : i < solid + light ? "l" : "s";
          const col = !on ? C.line : kind === "s" ? C.sec : C.pri;
          const sc = interpolate(f, [delay + 12 + i * 4, delay + 20 + i * 4], [0.6, 1], clamp);
          return <div key={i} style={{ transform: `scale(${sc})` }}><Person color={col} light={on && kind === "l"} /></div>;
        })}
      </div>
    </div>
  </Rise>;
};

const S2: React.FC<{ at: number[] }> = ({ at }) => (
  <Body>
    <Kicker n={1} text="Quanto è frequente" />
    <Title>Nella maggior parte dei casi è <Mark color={C.pri} bg={C.priBox} delay={22}>primaria</Mark></Title>
    <PeopleRow label="Donna" sub="primaria = post-menopausale" solid={7} light={1} delay={at[1]} tag="7–8 su 10" />
    <PeopleRow label="Uomo" sub="primaria = senile o idiopatica" solid={4} light={1} delay={at[2]} tag="~1 su 2" />
    <Rise delay={at[2] + 30}><div style={{ display: "flex", gap: 40, fontSize: 30, color: C.muted, fontWeight: 600 }}>
      <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: C.pri, marginRight: 12, verticalAlign: -2 }} />primaria</span>
      <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: C.sec, marginRight: 12, verticalAlign: -2 }} />secondaria</span>
    </div></Rise>
  </Body>
);

// primaria = nessuna causa secondaria trovata: si spuntano le categorie una per una
const S3: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const items = ["Cause endocrine", "Cause da farmaci", "Malattie croniche", "Carenze di vitamina D e calcio"];
  const t0 = at[1];
  const stamp = spring({ frame: f - (t0 + items.length * 14 + 10), fps: 30, config: { damping: 11 } });
  return <Body>
    <Kicker n={2} text="Come si arriva alla diagnosi" />
    <Title>Primaria è una diagnosi di <Mark color={C.teal} bg={C.tealBox} delay={24}>esclusione</Mark></Title>
    <Rise delay={20}><div style={{ background: C.box, borderRadius: 40, padding: "40px 44px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 20px 60px rgba(27,36,51,.06)" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>Cause secondarie</div>
      {items.map((t, i) => {
        const k = interpolate(f, [t0 + i * 14, t0 + i * 14 + 10], [0, 1], { ...clamp, easing: ease });
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

const S4: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const hi = interpolate(f, [at[1], at[1] + 12], [0, 1], clamp);
  return <Body>
    <Kicker n={3} text="Gli esami" />
    <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
      <Rise delay={2}><Tube /></Rise>
      <Title size={84}>Bastano gli esami di I livello</Title>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {EXAMS.map(([e, ii], i) => <Rise key={e} delay={at[0] + 30 + i * 5}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 36, fontWeight: 700, padding: "14px 24px", borderRadius: 18,
          background: ii ? `color-mix(in srgb, ${C.priBox} ${hi * 100}%, ${C.tealBox})` : C.tealBox, color: ii && hi > 0.5 ? C.pri : C.teal,
          boxShadow: ii ? `0 0 0 ${hi * 4}px ${C.pri}` : "none" }}>{e}
          {ii && <span style={{ fontSize: 22, fontWeight: 800, background: C.pri, color: "#fff", borderRadius: 8, padding: "3px 9px", opacity: hi }}>II liv.</span>}
        </span>
      </Rise>)}
    </div>
    <Rise delay={at[2]}><div style={{ background: C.box, borderRadius: 28, padding: "28px 32px", borderLeft: `8px solid ${C.pri}`, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>Escludono cause frequenti: <span style={{ color: C.pri }}>ipertiroidismo</span> e <span style={{ color: C.pri }}>iperparatiroidismo</span></div>
      <div style={{ fontSize: 30, color: C.muted, lineHeight: 1.4 }}>Per questo in Osteo Help sono tra gli esami di I livello. TSH: soprattutto in chi assume L-tiroxina. PTH: si legge con calcio e vitamina D.</div>
    </div></Rise>
  </Body>;
};

const S5: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [16, 76], [0, 0.86], { ...clamp, easing: Easing.out(Easing.cubic) });
  const R = 250, L = 2 * Math.PI * R;
  return <Body>
    <Kicker n={4} text="Se sono normali" />
    <Title>Quasi <Mark color={C.teal} bg={C.tealBox} delay={20}>9 su 10</Mark> sono già escluse</Title>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 600, height: 600 }}>
        <svg viewBox="0 0 600 600" width={600} height={600} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={300} cy={300} r={R} fill="none" stroke={C.secBox} strokeWidth={56} />
          <circle cx={300} cy={300} r={R} fill="none" stroke={C.teal} strokeWidth={56} strokeLinecap="round" strokeDasharray={`${L * p} ${L}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 170, fontWeight: 800, color: C.teal, letterSpacing: -6, lineHeight: 1 }}>{Math.round(p * 100)}%</div>
          <div style={{ fontSize: 34, color: C.muted, fontWeight: 600, marginTop: 10, textAlign: "center" }}>cause secondarie<br />escluse</div>
        </div>
      </div>
    </div>
  </Body>;
};

const ICON_PILL = <svg viewBox="0 0 24 24" width={70} height={70} fill="none" stroke={C.sec} strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="m9.3 8.2 5.4 7.6" /></svg>;
const ICON_CLIP = <svg viewBox="0 0 24 24" width={70} height={70} fill="none" stroke={C.sec} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4" /></svg>;
const ICON_EYE = <svg viewBox="0 0 24 24" width={70} height={70} fill="none" stroke={C.sec} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;

const S6: React.FC<{ at: number[] }> = ({ at }) => (
  <Body>
    <Kicker n={5} text="Il piccolo resto" />
    <Title>Per il resto, la <Mark color={C.sec} bg={C.secBox} delay={22}>storia</Mark> del paziente</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {([["Farmaci", ICON_PILL, "glucocorticoidi, inibitori dell'aromatasi…"], ["Malattie", ICON_CLIP, "celiachia, artrite reumatoide, diabete…"], ["Segni clinici", ICON_EYE, "strie rubre, galattorrea, sclere blu…"]] as const).map(([t, ic, ex], i) =>
        <Rise key={t} delay={at[0] + 30 + i * 14}>
          <div style={{ background: C.box, borderRadius: 30, padding: "28px 34px", display: "flex", alignItems: "center", gap: 30 }}>{ic}
            <div><div style={{ fontSize: 42, fontWeight: 800, color: C.ink }}>{t}</div><div style={{ fontSize: 30, color: C.muted, marginTop: 4 }}>{ex}</div></div></div>
        </Rise>)}
    </div>
  </Body>
);

// l'app vera: schermate catturate da index.html, con i tocchi nei punti registrati
const PHONE_H = 1130, PHONE_W = Math.round(PHONE_H * 390 / 844);
// il tasto verde della home, come nell'app
const AppTile: React.FC<{ tap: number }> = ({ tap }) => {
  const f = useCurrentFrame();
  const press = interpolate(f, [tap, tap + 5, tap + 12], [1, 0.95, 1], clamp);
  const ring = interpolate(f, [tap, tap + 22], [0, 1], clamp);
  return <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30, background: C.mint, borderRadius: 44, padding: "38px 36px", transform: `scale(${press})` }}>
    <div style={{ width: 130, height: 130, borderRadius: 32, background: "#fff", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
      <svg viewBox="0 0 24 24" width={70} height={70} fill="none" stroke="#172231" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4" /></svg>
    </div>
    <div><div style={{ fontSize: 46, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>Esami di I livello normali</div><div style={{ fontSize: 32, color: "#333C49", marginTop: 8 }}>Parti da farmaci, malattie e segni clinici</div></div>
    <div style={{ position: "absolute", right: 130, top: "50%", width: 170, height: 170, marginTop: -85, borderRadius: "50%", border: `6px solid ${C.ink}`, opacity: f >= tap ? 1 - ring : 0, transform: `scale(${0.3 + ring})` }} />
  </div>;
};

const SApp: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tileTap = at[0] + 70, phoneIn = tileTap + 20;
  if (f < phoneIn + 6) {
    const out = interpolate(f, [phoneIn - 4, phoneIn + 6], [1, 0], clamp);
    return <Body><div style={{ opacity: out, transform: `scale(${1 + (1 - out) * 0.08})` }}>
      <Kicker n={6} text="Nell'app" />
      <div style={{ height: 40 }} />
      <Rise delay={6}><AppTile tap={tileTap} /></Rise>
    </div></Body>;
  }
  // inizio di ciascuna schermata, in fotogrammi dall'inizio della scena
  const T = [phoneIn, phoneIn + 40, Math.max(at[1] - 10, phoneIn + 80), at[1] + 30, at[1] + 70, at[2], at[2] + 55, at[2] + 140];
  const pop = spring({ frame: f - phoneIn, fps: 30, config: { damping: 18, mass: 0.8 } });
  let cur = 0; T.forEach((t, i) => { if (f >= t) cur = i; });
  const X = 8; // dissolvenza tra schermate
  return <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
    <div style={{ width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: C.ink, padding: 14, boxShadow: "0 40px 100px rgba(27,36,51,.25)", transform: `translateY(${(1 - pop) * 80}px) scale(${0.94 + pop * 0.06})`, opacity: pop }}>
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#fff" }}>
        {STEPS.map((s, i) => {
          if (i < cur - 1 || i > cur) return null;
          const o = i === cur ? interpolate(f, [T[i], T[i] + X], [0, 1], clamp) : 1;
          const slide = i === 7 ? interpolate(f, [T[i], T[i] + 14], [120, 0], { ...clamp, easing: ease }) : 0;
          return <Img key={s.file} src={staticFile(`app/${s.file}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o, transform: `translateY(${slide}px)` }} />;
        })}
        {STEPS.map((s, i) => {
          if (!s.tap || i + 1 >= T.length) return null;
          const t = T[i + 1] - 10; // il dito tocca poco prima del cambio schermata
          const k = interpolate(f, [t - 8, t, t + 16], [0, 1, 2], clamp);
          if (k <= 0 || k >= 2) return null;
          const x = s.tap.x * PHONE_W, y = s.tap.y * PHONE_H;
          return <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: "50%", background: "rgba(27,36,51,.28)", opacity: k < 1 ? k : 2 - k, transform: `scale(${k < 1 ? 1.3 - k * 0.3 : 1})` }} />
            <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: "50%", border: "5px solid rgba(27,36,51,.5)", opacity: k > 1 ? 2 - k : 0, transform: `scale(${k > 1 ? 0.5 + (k - 1) : 0.5})` }} />
          </React.Fragment>;
        })}
      </div>
    </div>
  </div>;
};

const S7: React.FC<{ at: number[] }> = ({ at }) => (
  <Body>
    <Title size={120}>Quasi sempre <span style={{ color: C.pri }}>primaria.</span></Title>
    <Rise delay={at[1]}><div style={{ fontSize: 60, lineHeight: 1.15, fontWeight: 700, color: C.ink }}>Ma solo dopo aver <Mark color={C.teal} bg={C.tealBox} delay={at[1] + 10}>escluso le secondarie</Mark>.</div></Rise>
    <Rise delay={at[1] + 40}><div style={{ fontSize: 26, color: C.muted, lineHeight: 1.6, marginTop: 40 }}>
      Fonti: Fitzpatrick LA, Mayo Clin Proc 2002;77:453 · Ebeling PR, N Engl J Med 2008;358:1474 · Tannenbaum C et al., J Clin Endocrinol Metab 2002;87:4431
    </div></Rise>
  </Body>
);

/* ---------- montaggio ---------- */
const Scene: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, 0, TRANSITION), interpolate(f, [frames - TRANSITION, frames], [1, 0], clamp));
  const y = interpolate(f, [frames - TRANSITION, frames], [0, -40], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};

export const Video: React.FC = () => {
  let from = 0;
  return <AbsoluteFill style={{ fontFamily, color: C.ink }}>
    <Background />
    <Brand />
    {SCENES.map((s, i) => {
      const t = timing(s);
      const at = t.lines.map(l => l.from);
      const start = from;
      from += t.frames - TRANSITION;
      const body = { domanda: <S1 />, primaria: <S2 at={at} />, esclusione: <S3 at={at} />, esami: <S4 at={at} />, normali: <S5 />, resto: <S6 at={at} />, app: <SApp at={at} />, sintesi: <S7 at={at} /> }[s.id];
      return <Sequence key={s.id} from={start} durationInFrames={t.frames}>
        {t.hasAudio && <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile(`voce/${s.id}.mp3`)} /></Sequence>}
        <Scene frames={t.frames}>{body}<Caption lines={t.lines} /><Source text={s.src} /></Scene>
      </Sequence>;
    })}
  </AbsoluteFill>;
};
