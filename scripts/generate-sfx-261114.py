"""TURNTALE 2026-11-14 heavier UI/story cues: original procedural synthesis (numpy only, no samples).

User feedback 2026-11-14: the 11-08 UI/story cues sound light and frivolous ("경박"). These candidates use low,
short, dry sounds of wood, felt, leather, stone and dull metal instead of bright bells and arpeggios.
Usage: python scripts/generate-sfx-261114.py <out-dir>  (writes <key>-<A|B|C>.wav + manifest.json)
"""
import numpy as np, wave, json, sys
from pathlib import Path

SR = 44100
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1114)

def T(d): return np.arange(max(1, int(d * SR))) / SR
def hz(n): return 440 * 2 ** ((n - 69) / 12)
NOTE = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
def nt(s): name, octv = s[:-1], int(s[-1]); return hz(12 * (octv + 1) + NOTE[name])

def fade(x, ms=10):
    f = min(len(x), int(ms / 1000 * SR))
    if f > 1: x[-f:] *= np.linspace(1, 0, f)
    return x
def env(d, a=.003, decay=8.0):
    t = T(d); e = np.exp(-t * decay)
    if a > 0: e = e * np.minimum(1, t / a)
    return fade(e)
def phase(freq, d):
    n = len(T(d)); f = np.broadcast_to(np.asarray(freq, float), (n,)); return 2 * np.pi * np.cumsum(f) / SR
def osc(freq, d, kind='sine'):
    ph = phase(freq, d)
    if kind == 'sine': return np.sin(ph)
    if kind == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == 'saw': return sum(np.sin(k * ph) / k for k in range(1, 14)) * .6
    raise ValueError(kind)
def sweep(f0, f1, d): t = T(d); return f0 * (f1 / f0) ** (t / d)
def noise(d): return rng.uniform(-1, 1, len(T(d)))

def biquad(x, kind, f, q=.7):
    """Fixed-frequency biquad via direct form (vectorised per block is unnecessary for cues this short)."""
    n = len(x); w = 2 * np.pi * min(max(f, 20), SR * .45) / SR; cw = np.cos(w); al = np.sin(w) / (2 * q)
    if kind == 'lp': b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
    elif kind == 'hp': b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
    else: b = [al, 0.0, -al]
    a0 = 1 + al; a1 = -2 * cw / a0; a2 = (1 - al) / a0; b = [v / a0 for v in b]
    y = np.zeros(n); x1 = x2 = y1 = y2 = 0.0; xs = x.tolist(); ys = [0.0] * n
    for i in range(n):
        xi = xs[i]; yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, xi, y1, yi; ys[i] = yi
    return np.array(ys)

def modal(f, partials, d, a=.002):
    t = T(d); out = np.zeros(len(t))
    for ratio, amp, dec in partials:
        if f * ratio < SR * .45: out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return fade(out * np.minimum(1, t / a))
def nburst(d, kind, f, q=.7, decay=30, a=.002): return biquad(noise(d), kind, f, q) * env(d, a, decay)

class Mix:
    def __init__(self, d): self.buf = np.zeros(int(d * SR))
    def add(self, x, at=0.0, g=1.0):
        i = int(at * SR); j = min(len(self.buf), i + len(x)); self.buf[i:j] += x[:j - i] * g; return self

def room(x, mix=.12, size=.5):
    """Small dark wooden room, not a hall: keeps cues dry and close."""
    t = T(size); ir = biquad(noise(size), 'lp', 1800) * np.exp(-t * 6.9 / size)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = len(x) + len(ir); N = 1 << (n - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n]
    return fade(np.concatenate([x, np.zeros(len(ir))]) * (1 - mix) + wet * mix * .5, 60)
def finish(x, peak=.89):
    idx = np.nonzero(np.abs(x) > 1e-4)[0]
    if len(idx): x = x[: int(idx[-1] + SR * .02)]
    return fade(x / (np.max(np.abs(x)) + 1e-9) * peak, 15)

# Material building blocks
def wood(f=420, d=.12, damp=1.0):  # dull wooden knock
    return Mix(d).add(modal(f, [(1, 1, 38 * damp), (2.3, .35, 60 * damp), (3.9, .12, 90 * damp)], d)).add(nburst(min(d, .03), 'lp', f * 3, .8, 160), 0, .35).buf
def felt(d=.1, f=500):  # padded thump on felt
    return nburst(d, 'lp', f, .7, 45, .004) + modal(f * .25, [(1, 1, 40)], d) * .5
def thud(f0=90, f1=40, d=.3, dec=14):  # low body
    return osc(sweep(f0, f1, d), d) * env(d, .003, dec)
def cloth(d=.18, f0=700, f1=1600):  # short cloth / paper swish, bandpass sweep approximated by two layers
    s = np.sin(np.pi * T(d) / d) ** 2
    return (biquad(noise(d), 'bp', f0, 1.0) * .6 + biquad(noise(d), 'bp', f1, 1.2) * .4) * s
def stone(f=180, d=.25):
    return Mix(d).add(modal(f, [(1, 1, 22), (1.73, .5, 30), (2.9, .25, 45)], d)).add(nburst(min(d, .05), 'lp', 900, .7, 60), 0, .5).buf
def dull_bell(f, d=1.4, dec=3.0):  # low, warm, few overtones
    return modal(f, [(1, 1, dec), (2.0, .25, dec * 1.8), (2.76, .12, dec * 2.6)], d, .006)
def low_chord(notes, d=1.6, attack=.18, rel=2.2, cutoff=900):
    t = T(d); sw = np.minimum(1, t / attack) * np.exp(-np.maximum(0, t - attack) * rel)
    pad = sum(biquad(osc(nt(n) * det, d, 'saw'), 'lp', cutoff, .6) for n in notes for det in (.997, 1.003))
    return fade(pad * sw / (2 * len(notes)))

# ---------------------------------------------------------------- cues: A wood · B felt/leather · C stone/dull metal
def click_a(): return wood(620, .09, 1.4)
def click_b(): return Mix(.1).add(felt(.08, 900)).add(wood(800, .05, 2.2), 0, .25).buf
def click_c(): return Mix(.1).add(modal(520, [(1, 1, 55), (1.6, .3, 80)], .08)).add(nburst(.012, 'bp', 2400, 1.2, 300), 0, .15).buf

def confirm_a(): return room(Mix(.4).add(wood(300, .2, .8)).add(wood(260, .25, .7), .09, .9).add(thud(110, 60, .2, 18), .09, .5).buf)
def confirm_b(): return room(Mix(.45).add(felt(.16, 420), 0, .9).add(dull_bell(nt('G3'), .4, 9), .01, .45).buf)
def confirm_c(): return room(Mix(.6).add(stone(160, .3)).add(dull_bell(nt('D3'), .5, 6), .02, .5).buf, .15, .6)

def back_a(): return Mix(.25).add(cloth(.14, 500, 1100), 0, .5).add(wood(240, .15, .9), .08, .8).buf
def back_b(): return Mix(.2).add(felt(.14, 350)).buf
def back_c(): return Mix(.3).add(thud(140, 70, .2, 20), 0, .8).add(nburst(.04, 'lp', 700, .7, 70), 0, .4).buf

def dialogue_a(): return cloth(.11, 900, 2200) * .9  # paper page
def dialogue_b(): return Mix(.08).add(modal(380, [(1, 1, 70), (2.4, .2, 110)], .07)).add(nburst(.01, 'lp', 1400, .7, 300), 0, .2).buf
def dialogue_c(): return Mix(.12).add(cloth(.07, 700, 1500), 0, .6).add(felt(.06, 600), .02, .5).buf

def step_a():
    def s(g, f): return Mix(.2).add(thud(f, 45, .18, 22)).add(nburst(.1, 'lp', 700, .8, 38, .004), 0, .8).buf * g
    return Mix(.5).add(s(1, 110)).add(s(.8, 95), .24).buf
def step_b():
    def s(g): return Mix(.2).add(nburst(.14, 'lp', 520, .8, 30, .005)).add(nburst(.05, 'bp', 1600, 1, 80), .01, .25).buf * g
    return Mix(.5).add(s(1)).add(s(.8), .23).buf
def step_c():
    def s(g, f): return Mix(.25).add(stone(f, .2), 0, .7).add(nburst(.08, 'lp', 900, .8, 45), 0, .6).buf * g
    return Mix(.55).add(s(1, 150)).add(s(.8, 135), .25).buf

def pass_a(): return Mix(.35).add(wood(210, .14, .9)).add(wood(200, .14, .9), .13, .7).buf
def pass_b(): return Mix(.25).add(felt(.14, 380)).add(felt(.12, 340), .12, .7).buf
def pass_c(): return Mix(.3).add(wood(170, .2, .7), 0, .9).add(thud(90, 55, .18, 20), 0, .5).buf

def hit_a(): return np.tanh(Mix(.45).add(thud(95, 38, .4, 9)).add(nburst(.07, 'lp', 1100, .8, 55), 0, .7).buf * 1.8) / np.tanh(1.8)
def hit_b(): return Mix(.4).add(thud(80, 42, .35, 11), 0, .9).add(felt(.1, 700), 0, .8).add(nburst(.03, 'bp', 1800, 1, 120), .002, .3).buf
def hit_c(): return Mix(.6).add(thud(70, 32, .55, 7)).add(stone(120, .25), .004, .5).buf

def heal_a(): return room(low_chord(['C3', 'G3', 'E4'], 1.5, .3, 2.4, 800), .2, .9)
def heal_b(): return room(Mix(1.5).add(low_chord(['A2', 'E3', 'C#4'], 1.4, .35, 2.6, 700)).add(dull_bell(nt('A3'), 1.2, 3.5), .25, .35).buf, .2, .9)
def heal_c(): return room(Mix(1.5).add(cloth(.6, 300, 700), 0, .35).add(low_chord(['D3', 'A3', 'F#4'], 1.3, .4, 2.8, 650), .1).buf, .2, .9)

def item_a(): return Mix(.4).add(cloth(.18, 400, 900), 0, .7).add(wood(330, .15, .9), .15).buf  # pouch + clack
def item_b(): return Mix(.45).add(felt(.12, 450)).add(dull_bell(nt('E4'), .35, 10), .05, .4).buf
def item_c(): return room(Mix(.5).add(stone(220, .25)).add(cloth(.12, 500, 1100), .02, .4).buf, .1, .5)

def guard_a(): return room(Mix(.55).add(wood(150, .35, .5)).add(thud(120, 60, .25, 14), 0, .7).buf, .12, .6)
def guard_b(): return room(Mix(.8).add(modal(240, [(1, 1, 9), (2.4, .35, 14), (3.9, .12, 20)], .6), 0, .6).add(thud(110, 55, .2, 18)).buf, .15, .7)
def guard_c(): return room(Mix(.6).add(stone(110, .45)).add(nburst(.05, 'lp', 1200, .7, 60), 0, .5).buf, .12, .6)

def relic_a(): return room(Mix(1.8).add(dull_bell(nt('C4'), 1.6, 2.6)).add(dull_bell(nt('G4'), 1.3, 3.4), .12, .45).add(low_chord(['C3', 'G3'], 1.6, .4, 2.2, 600), 0, .5).buf, .22, 1.0)
def relic_b(): return room(Mix(1.4).add(stone(140, .4), 0, .6).add(dull_bell(nt('A3'), 1.3, 3.0), .1).buf, .2, 1.0)
def relic_c(): return room(Mix(1.6).add(cloth(.3, 300, 800), 0, .4).add(dull_bell(nt('D4'), 1.4, 2.8), .2).add(dull_bell(nt('A3'), 1.4, 2.8), .2, .5).buf, .22, 1.0)

def card_a(): return room(Mix(2.4).add(modal(nt('C3'), [(1, 1, 1.4), (2.0, .4, 2.2), (2.76, .2, 3.2), (4.2, .08, 4.5)], 2.3, .01)).add(low_chord(['C3', 'G3', 'C4'], 2.2, .5, 1.8, 700), 0, .55).buf, .25, 1.4)
def card_b(): return room(Mix(2.2).add(thud(70, 40, .5, 6), 0, .7).add(low_chord(['A2', 'E3', 'A3', 'C#4'], 2.0, .25, 1.8, 800), .05).buf, .25, 1.4)
def card_c(): return room(Mix(2.2).add(stone(90, .6), 0, .7).add(dull_bell(nt('E3'), 2.0, 1.8)).add(dull_bell(nt('B3'), 1.8, 2.2), .08, .4).buf, .25, 1.4)

def clear_a(): return room(Mix(2.2).add(thud(80, 45, .5, 6), 0, .8).add(low_chord(['C3', 'G3', 'C4', 'E4'], 2.0, .12, 1.6, 1100), .02).buf, .22, 1.2)
def clear_b():
    m = Mix(2.4).add(wood(180, .3, .6), 0, .8).add(wood(180, .3, .6), .22, .8)
    return room(m.add(low_chord(['D3', 'A3', 'D4', 'F#4'], 1.9, .1, 1.6, 1100), .44).add(thud(75, 40, .5, 6), .44, .8).buf, .22, 1.2)
def clear_c(): return room(Mix(2.4).add(dull_bell(nt('C3'), 2.2, 1.6), 0, .9).add(dull_bell(nt('G3'), 2.0, 1.8), .1, .6).add(dull_bell(nt('C4'), 1.8, 2.0), .2, .45).buf, .25, 1.4)

def fail_a():
    d = 1.4; t = T(d); f = nt('A2') * (1 - .06 * np.minimum(1, t / d))
    tone = biquad(osc(f, d, 'saw'), 'lp', 600, .6) * np.minimum(1, t / .08) * np.exp(-t * 2.4)
    return room(Mix(1.6).add(thud(70, 35, .5, 7)).add(fade(tone), .03, .7).buf, .2, 1.0)
def fail_b(): return room(Mix(1.6).add(low_chord(['A2', 'E3', 'C4'], 1.4, .15, 2.4, 650)).add(thud(65, 35, .5, 7), 0, .7).buf, .2, 1.0)
def fail_c(): return room(Mix(1.2).add(stone(100, .5)).add(dull_bell(nt('D3'), 1.0, 3.2), .05, .6).buf, .2, 1.0)

CUES = [
    ('click', '버튼 클릭', '메뉴·지도·일반 버튼', 'ui-click-A', (click_a, click_b, click_c)),
    ('confirm', '확인·시작', '출발, 승부 시작, 선택 확정', 'ui-confirm-B', (confirm_a, confirm_b, confirm_c)),
    ('back', '취소·닫기', '창 닫기, 돌아가기', 'ui-back-B', (back_a, back_b, back_c)),
    ('dialogue', '대사 넘김', '컷신·서브퀘스트 대사 넘기기', 'dialogue-next-A', (dialogue_a, dialogue_b, dialogue_c)),
    ('step', '지도 이동', '여정 지도에서 다음 장소로 이동', 'map-step-B', (step_a, step_b, step_c)),
    ('pass', '패스', '내지 않고 넘길 때', 'pass-B', (pass_a, pass_b, pass_c)),
    ('hit', 'HP 피해', 'HP가 깎일 때', 'hp-hit-A', (hit_a, hit_b, hit_c)),
    ('heal', 'HP 회복', 'HP 회복', 'hp-heal-A', (heal_a, heal_b, heal_c)),
    ('item', '아이템 사용', '아이템·유물 발동', 'item-use-B', (item_a, item_b, item_c)),
    ('guard', '방어', '피해를 막을 때', 'guard-B', (guard_a, guard_b, guard_c)),
    ('relic', '유물 획득', '유물을 얻을 때', 'relic-get-A', (relic_a, relic_b, relic_c)),
    ('storyCard', '이야기 패 획득', '성화·열쇠·왕관 같은 이야기 패를 얻을 때', 'story-card-get-A', (card_a, card_b, card_c)),
    ('clear', '스테이지 클리어', '스테이지 승리', 'stage-clear-A', (clear_a, clear_b, clear_c)),
    ('fail', '스테이지 실패', '스테이지 패배', 'stage-fail-A', (fail_a, fail_b, fail_c)),
]
MATERIAL = {'A': '나무', 'B': '천·가죽', 'C': '돌·둔한 쇠'}

def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

manifest = []
for key, label, use, current, fns in CUES:
    item = {'key': key, 'label': label, 'use': use, 'current': f'/audio/sfx-261108/{current}.mp3', 'files': []}
    for tag, fn in zip('ABC', fns):
        x = finish(fn()); name = f'{key}-{tag}.wav'; write(OUT / name, x)
        item['files'].append({'tag': tag, 'material': MATERIAL[tag], 'file': name, 'seconds': round(len(x) / SR, 2)})
    manifest.append(item)
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(manifest), 'cues', sum(len(m['files']) for m in manifest), 'files')
