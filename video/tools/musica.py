"""Base musicale originale per il video: pad caldo, arpeggio morbido, basso.
Uso: python3 tools/musica.py <durata_secondi> <uscita.wav>"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
DUR = float(sys.argv[1]); OUT = sys.argv[2]
N = int(DUR * SR)
rng = np.random.default_rng(7)
BPM = 72; BEAT = 60 / BPM; BAR = 4 * BEAT
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# Fa maggiore: Fmaj7 – Rem9 – Sibmaj7 – Do6/9, due battute ciascuno
CHORDS = [(41, [53, 57, 60, 64]), (38, [50, 53, 57, 60, 64]), (46, [53, 58, 62, 65]), (36, [55, 57, 60, 64])]
SPAN = 2 * BAR

def env(n, a, r):
    e = np.ones(n); a = int(a * SR); r = int(r * SR)
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r)
    return e

def pad_voice(f, n):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.006, 0, 0.0055):  # tre oscillatori leggermente scordati
        for h in range(1, 7):
            s += np.sin(2 * np.pi * f * (1 + det) * h * t + rng.uniform(0, 6.3)) / h ** 1.6
    return s

mix_pad = np.zeros(N); mix_arp = np.zeros(N); mix_bass = np.zeros(N)
k = 0; t0 = 0.0
while t0 < DUR:
    root, notes = CHORDS[k % 4]
    i0 = int(t0 * SR); n = min(int((SPAN + 1.6) * SR), N - i0)
    if n <= 0: break
    e = env(n, 1.4, 1.6)
    for m in notes:
        mix_pad[i0:i0 + n] += pad_voice(hz(m), n) * e * 0.10
    tb = np.arange(n) / SR
    mix_bass[i0:i0 + n] += np.sin(2 * np.pi * hz(root) * tb) * env(n, 0.6, 1.6) * 0.30
    # arpeggio in crome, un'ottava sopra, con piccole variazioni di dinamica
    arp = sorted(notes)[1:] + [sorted(notes)[0] + 12, sorted(notes)[2] + 12]
    pattern = [0, 2, 1, 3, 4, 3, 1, 2]
    for j in range(int(SPAN / (BEAT / 2))):
        if (k * 16 + j) % 16 in (13,):  # una pausa ogni tanto
            continue
        ts = t0 + j * BEAT / 2
        a0 = int(ts * SR); ln = min(int(1.8 * SR), N - a0)
        if ln <= 0: break
        tt = np.arange(ln) / SR
        f = hz(arp[pattern[j % 8] % len(arp)] + 12)
        v = 0.055 * (1.0 if j % 2 == 0 else 0.7) * rng.uniform(0.8, 1.05)
        note = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.08 * np.sin(6 * np.pi * f * tt))
        mix_arp[a0:a0 + ln] += note * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.004) * v
    t0 += SPAN; k += 1

lp = lambda x, fc: sosfilt(butter(2, fc, 'low', fs=SR, output='sos'), x)
pad = lp(mix_pad, 1400)
arp = lp(mix_arp, 5000)
# l'arpeggio entra dopo l'introduzione
arp *= np.clip((np.arange(N) / SR - BAR * 2) / BAR, 0, 1)
dry = pad + arp + lp(mix_bass, 300)

# riverbero: risposta all'impulso sintetica (rumore che decade in 2,8 s)
ir_n = int(2.8 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.4)
ir = lp(ir, 6000); ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(dry, ir)[:N]
out = 0.72 * dry + 0.45 * wet
# stereo leggero: ritardo minimo sul canale destro
d = int(0.012 * SR)
L = out; R = np.concatenate([np.zeros(d), out[:-d]]) * 0.98 + 0.02 * out
st = np.stack([L, R], 1)
fade = np.ones(N); fi = int(2.5 * SR); fo = int(4 * SR)
fade[:fi] = np.linspace(0, 1, fi) ** 2; fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
st *= fade[:, None]
st /= np.max(np.abs(st)) / 0.8
wavfile.write(OUT, SR, (st * 32767).astype(np.int16))
print("ok", OUT, DUR)
