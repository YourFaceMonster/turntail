"""TURNTALE audition SFX: original procedural synthesis (numpy only, no samples)."""
import numpy as np, wave, json, sys
from pathlib import Path

SR = 44100
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)

def T(d): return np.arange(max(1, int(d * SR))) / SR
def hz(n): return 440 * 2 ** ((n - 69) / 12)
NOTE = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
def nt(s):  # 'C5' -> hz
    name, octv = s[:-1], int(s[-1]); return hz(12 * (octv + 1) + NOTE[name])

def fade(x, ms=10):
    f = min(len(x), int(ms / 1000 * SR))
    if f > 1: x[-f:] *= np.linspace(1, 0, f)
    return x

def env(d, a=.003, decay=8.0):
    t = T(d); e = np.exp(-t * decay)
    if a > 0: e *= np.minimum(1, t / a)
    return fade(e)

def phase(freq, d):
    n = len(T(d)); f = np.broadcast_to(np.asarray(freq, float), (n,))
    return 2 * np.pi * np.cumsum(f) / SR

def osc(freq, d, wave='sine'):
    ph = phase(freq, d)
    if wave == 'sine': return np.sin(ph)
    if wave == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if wave == 'saw': return sum(np.sin(k * ph) / k for k in range(1, 14)) * .6
    raise ValueError(wave)

def sweep(f0, f1, d):
    t = T(d); return f0 * (f1 / f0) ** (t / d)

def noise(d): return rng.uniform(-1, 1, len(T(d)))

def biquad(x, kind, f, q=.7):
    n = len(x); f = np.broadcast_to(np.asarray(f, float), (n,))
    w = 2 * np.pi * np.clip(f, 20, SR * .45) / SR; cw = np.cos(w); al = np.sin(w) / (2 * q)
    if kind == 'lp': b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0
    elif kind == 'hp': b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0
    else: b0 = al; b1 = 0 * cw; b2 = -al
    a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al
    B0, B1, B2, A1, A2 = [np.broadcast_to(v / a0, (n,)).tolist() for v in (b0, b1, b2, a1, a2)]
    xs = x.tolist(); y = [0.0] * n; x1 = x2 = y1 = y2 = 0.0
    for i in range(n):
        xi = xs[i]; yi = B0[i] * xi + B1[i] * x1 + B2[i] * x2 - A1[i] * y1 - A2[i] * y2
        x2, x1, y2, y1 = x1, xi, y1, yi; y[i] = yi
    return np.array(y)

def modal(f, partials, d, a=.002):
    t = T(d); out = np.zeros(len(t))
    for ratio, amp, dec in partials:
        if f * ratio < SR * .45: out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return fade(out * np.minimum(1, t / a))

def pluck(f, d=.6, bright=1.0):
    return modal(f, [(1, 1, 7), (2, .5 * bright, 12), (3, .28 * bright, 18), (4, .14 * bright, 25), (5, .07 * bright, 32)], d)

def bell(f, d=1.2, dec=4):
    return modal(f, [(1, 1, dec), (2.76, .42, dec * 1.6), (5.40, .2, dec * 2.4), (8.93, .08, dec * 3.5)], d)

def nburst(d, kind, f, q=.7, decay=30, a=.002):
    return biquad(noise(d), kind, f, q) * env(d, a, decay)

class Mix:
    def __init__(self, d): self.buf = np.zeros(int(d * SR))
    def add(self, x, at=0.0, g=1.0):
        i = int(at * SR); j = min(len(self.buf), i + len(x)); self.buf[i:j] += x[:j - i] * g; return self

def reverb(x, mix=.2, size=1.2):
    t = T(size); ir = biquad(noise(size), 'lp', 3500) * np.exp(-t * 6.9 / size)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    n = len(x) + len(ir); N = 1 << (n - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n]
    dry = np.concatenate([x, np.zeros(len(ir))])
    return fade(dry * (1 - mix) + wet * mix * .55, 60)

def finish(x, peak=.89):
    x = x[: int(np.max(np.nonzero(np.abs(x) > 1e-4)[0]) + SR * .02)] if np.any(np.abs(x) > 1e-4) else x
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    return fade(x, 15)

# ---------------------------------------------------------------- cues
def ui_click_a():
    return Mix(.12).add(modal(1850, [(1, 1, 90), (2.3, .4, 140), (3.9, .15, 200)], .1)).add(nburst(.03, 'bp', 3200, 2, 300), 0, .35).buf
def ui_click_b():
    return Mix(.15).add(modal(2637, [(1, 1, 45), (2.01, .25, 70)], .14)).add(nburst(.01, 'hp', 5000, .7, 500), 0, .2).buf

def ui_confirm_a():
    return reverb(Mix(.6).add(pluck(nt('G5'), .45)).add(pluck(nt('D6'), .5), .07).buf, .15, .8)
def ui_confirm_b():
    return reverb(Mix(.9).add(bell(nt('E6'), .8, 6)).add(bell(nt('B6'), .6, 8), .05, .35).buf, .25, 1.0)

def ui_back_a():
    return reverb(Mix(.6).add(pluck(nt('D6'), .4), 0, .8).add(pluck(nt('G5'), .45), .07, .8).buf, .12, .7)
def ui_back_b():
    return Mix(.25).add(modal(420, [(1, 1, 30), (2.6, .3, 60), (4.1, .1, 90)], .2)).add(nburst(.05, 'lp', 800, .7, 60), 0, .5).buf

def map_step_a():
    def step(cut, g):
        return Mix(.18).add(nburst(.15, 'lp', cut, .8, 32, .004)).add(nburst(.06, 'bp', 2400, 1.2, 70), .005, .35).buf * g
    return Mix(.5).add(step(650, 1)).add(step(560, .85), .22).buf
def map_step_b():
    d = .28; w = biquad(noise(d), 'bp', sweep(600, 2600, d), 1.4) * np.sin(np.pi * T(d) / d) ** 2
    return Mix(.5).add(w, 0, .7).add(modal(900, [(1, 1, 35), (2.4, .35, 55)], .2), .22).buf

def dialogue_next_a():
    d = .09; f = biquad(noise(d), 'bp', sweep(2800, 6000, d), 1.2) * env(d, .004, 40)
    return Mix(.2).add(f).add(nburst(.06, 'bp', 4200, 1.5, 70), .05, .3).buf
def dialogue_next_b():
    return Mix(.1).add(modal(3200, [(1, 1, 120), (1.7, .5, 160)], .06)).add(modal(1200, [(1, 1, 80)], .06), 0, .3).buf

def hp_hit_a():
    d = .32
    body = osc(sweep(170, 45, d), d) * env(d, .002, 12)
    return Mix(.4).add(body).add(nburst(.08, 'bp', 1800, 1, 60), 0, .5).add(nburst(.15, 'lp', 300, .7, 25), 0, .4).buf
def hp_hit_b():
    d = .28
    body = osc(sweep(120, 60, d), d) * env(d, .002, 18)
    x = Mix(.3).add(nburst(.1, 'bp', 1200, 1, 45), 0, .9).add(body, .004).buf
    return np.tanh(x * 2.2) / np.tanh(2.2)

def hp_heal_a():
    m = Mix(1.1)
    for i, n in enumerate(['C6', 'D6', 'E6', 'G6', 'A6', 'C7']):
        m.add(bell(nt(n), .7, 7), i * .06, .5 + i * .06)
    return reverb(m.buf, .35, 1.4)
def hp_heal_b():
    d = 1.1; t = T(d); sw = np.minimum(1, t / .25) * np.exp(-np.maximum(0, t - .25) * 3.2)
    pad = sum(osc(nt(n) * det, d) for n in ['C5', 'E5', 'G5'] for det in (.997, 1.003)) * sw / 6
    m = Mix(1.2).add(fade(pad))
    for i, n in enumerate(['G6', 'C7', 'E7']): m.add(bell(nt(n), .5, 9), .18 + i * .09, .25)
    return reverb(m.buf, .3, 1.2)

def stage_clear_a():
    m = Mix(2.0)
    for i, n in enumerate(['C5', 'E5', 'G5']): m.add(pluck(nt(n), .4), i * .11, .7)
    for n in ['C5', 'E5', 'G5', 'C6']:
        m.add(modal(nt(n), [(1, 1, 2.5), (2, .45, 4), (3, .2, 6), (4, .1, 8)], 1.6), .36, .5)
    m.add(bell(nt('C7'), 1.2, 4), .36, .3)
    return reverb(m.buf, .25, 1.6)
def stage_clear_b():
    m = Mix(2.0)
    for i, n in enumerate(['G5', 'C6', 'E6', 'G6', 'C7']): m.add(bell(nt(n), .6, 6), i * .05, .45)
    for n in ['C6', 'E6', 'G6']: m.add(bell(nt(n), 1.6, 2.2), .32, .45)
    return reverb(m.buf, .3, 1.8)

def stage_fail_a():
    m = Mix(1.4)
    for i, n in enumerate(['E4', 'C4', 'A3']):
        d = .28 if i < 2 else .7; t = T(d)
        tone = biquad(osc(nt(n) * (1 + .004 * np.sin(2 * np.pi * 5 * t)), d, 'saw'), 'lp', 1100, .7)
        m.add(tone * np.minimum(1, t / .02) * np.exp(-t * (4 if i < 2 else 3.2)), i * .24, .55)
    m.add(osc(sweep(90, 45, .4), .4) * env(.4, .003, 9), .48, .7)
    return reverb(m.buf, .2, 1.2)
def stage_fail_b():
    g = modal(98, [(1, 1, 1.6), (1.47, .6, 2.2), (2.09, .45, 3), (2.56, .3, 3.5), (3.1, .2, 4.5), (4.2, .1, 6)], 2.4, .008)
    return reverb(Mix(2.5).add(g).add(nburst(.05, 'lp', 600, .7, 50), 0, .5).buf, .25, 1.8)

def relic_get_a():
    m = Mix(1.2).add(bell(nt('A6'), .9, 5), 0, .6)
    pent = ['C7', 'D7', 'E7', 'G7', 'A7', 'C8']
    for i in range(14):
        n = pent[int(rng.integers(0, len(pent)))]
        m.add(modal(nt(n), [(1, 1, 22)], .15), .03 + i * .035 + float(rng.uniform(0, .015)), .25 * (1 - i / 18))
    return reverb(m.buf, .35, 1.4)
def relic_get_b():
    m = Mix(1.6)
    for i, n in enumerate(['G#6', 'B6', 'E7']):
        m.add(modal(nt(n), [(1, 1, 4.5), (2.32, .4, 7), (4.25, .2, 10), (6.8, .08, 14)], 1.2), i * .03, .5)
    return reverb(m.buf, .3, 1.5)

def story_card_a():
    d = 2.2; t = T(d)
    pad = sum(biquad(osc(nt(n) * det, d, 'saw'), 'lp', 1200, .6) for n in ['C4', 'G4', 'C5'] for det in (.996, 1.004))
    pad = pad * np.minimum(1, t / .4) * np.exp(-np.maximum(0, t - .5) * 2.0) / 6
    m = Mix(2.6).add(modal(nt('C4'), [(1, 1, 1.5), (2.76, .5, 2.4), (5.4, .25, 3.6), (8.93, .1, 5)], 2.2), 0, .8).add(fade(pad), 0, .6)
    return reverb(m.buf, .4, 2.0)
def story_card_b():
    m = Mix(2.0); seq = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7']
    for i, n in enumerate(seq): m.add(pluck(nt(n), .9, .7), i * .035, .45)
    for n in ['C6', 'E6', 'G6']: m.add(pluck(nt(n), 1.4, .6), len(seq) * .035 + .05, .35)
    return reverb(m.buf, .35, 1.6)

def item_use_a():
    d = .3; w = biquad(noise(d), 'bp', sweep(400, 3000, d), 1.3) * np.sin(np.pi * T(d) / d) ** 1.5
    hit = osc(sweep(150, 50, .25), .25) * env(.25, .002, 14)
    return Mix(.6).add(w, 0, .8).add(hit, .25).add(nburst(.06, 'bp', 1500, 1, 60), .25, .4).buf
def item_use_b():
    d = .38; t = T(d); f = sweep(1800, 300, d) * (1 + .03 * np.sin(2 * np.pi * 28 * t))
    z = osc(f, d) * env(d, .004, 7) + .3 * osc(f * 1.5, d, 'tri') * env(d, .004, 9)
    m = Mix(.6).add(z, 0, .7)
    for i, n in enumerate(['E7', 'B7']): m.add(modal(nt(n), [(1, 1, 18)], .2), .02 + i * .06, .25)
    return reverb(m.buf, .2, .9)

def guard_a():
    c = modal(620, [(1, 1, 7), (2.76, .6, 10), (5.4, .35, 14), (8.93, .2, 20)], 1.0, .001)
    return reverb(Mix(1.1).add(c).add(nburst(.04, 'hp', 3000, .7, 90), 0, .5).buf, .2, 1.0)
def guard_b():
    th = osc(sweep(140, 70, .2), .2) * env(.2, .002, 25)
    ring = modal(880, [(1, .6, 12), (2.4, .3, 18), (3.9, .15, 26)], .5)
    return Mix(.6).add(th).add(ring, .003).add(nburst(.05, 'bp', 2000, 1, 70), 0, .4).buf

def region_enter_a():
    d = 2.6; t = T(d)
    drone = sum(biquad(osc(nt(n) * det, d, 'saw'), 'lp', 500, .6) for n in ['G2', 'D3'] for det in (.995, 1.005))
    drone = drone * np.minimum(1, t / 1.0) * np.exp(-np.maximum(0, t - 1.3) * 2.5) / 4
    g = modal(98, [(1, 1, 1.4), (1.47, .55, 2), (2.09, .4, 2.8), (2.56, .25, 3.3), (3.1, .15, 4)], 2.6, .008)
    return reverb(Mix(3.0).add(g, 0, .9).add(fade(drone), 0, .7).buf, .3, 2.0)
def region_enter_b():
    m = Mix(1.8)
    for at, n, d in [(0, 'D4', .45), (.42, 'A4', .95)]:
        t = T(d); f = nt(n) * (1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .3))
        h = biquad(osc(f, d, 'saw'), 'lp', 1400, .7) * np.minimum(1, t / .06) * np.exp(-np.maximum(0, t - d * .6) * 6)
        m.add(fade(h), at, .6)
    return reverb(m.buf, .35, 1.6)

def pass_a():
    def knock(g): return Mix(.15).add(modal(260, [(1, 1, 40), (2.2, .4, 60), (3.7, .15, 90)], .12)).add(nburst(.03, 'lp', 1200, .7, 90), 0, .5).buf * g
    return Mix(.35).add(knock(1)).add(knock(.75), .11).buf
def pass_b():
    tap = Mix(.12).add(modal(300, [(1, 1, 45), (2.4, .3, 70)], .1)).add(nburst(.02, 'lp', 1500, .7, 120), 0, .4).buf
    tone = osc(sweep(600, 400, .18), .18, 'tri') * env(.18, .01, 14)
    return Mix(.35).add(tap).add(tone, .06, .35).buf

CUES = [
    ('ui_click', '버튼 클릭', '메뉴·지도·일반 버튼 (지금은 모두 패 선택 소리)', ui_click_a, ui_click_b),
    ('ui_confirm', '확인·시작', '출발, 승부 시작, 선택 확정', ui_confirm_a, ui_confirm_b),
    ('ui_back', '취소·닫기', '창 닫기, 돌아가기', ui_back_a, ui_back_b),
    ('map_step', '지도 이동', '여정 지도에서 다음 장소로 이동', map_step_a, map_step_b),
    ('dialogue_next', '대사 넘김', '컷신·서브퀘스트 대사 넘기기', dialogue_next_a, dialogue_next_b),
    ('pass', '패스', '내지 않고 넘길 때', pass_a, pass_b),
    ('hp_hit', 'HP 피해', '정산 때 HP가 깎일 때', hp_hit_a, hp_hit_b),
    ('hp_heal', 'HP 회복', '챕터 시작 HP 100 회복', hp_heal_a, hp_heal_b),
    ('item_use', '아이템 사용', '아이템 발동 (지금은 단순 저음)', item_use_a, item_use_b),
    ('guard', '방어', '피해를 막을 때 (지금은 높은 차임)', guard_a, guard_b),
    ('relic_get', '유물 획득', '보상에서 유물을 고를 때', relic_get_a, relic_get_b),
    ('story_card_get', '이야기 패 획득', '성화·열쇠·왕관 같은 이야기 패를 얻을 때', story_card_a, story_card_b),
    ('stage_clear', '스테이지 클리어', 'RPG 스테이지 승리', stage_clear_a, stage_clear_b),
    ('stage_fail', '스테이지 실패', 'RPG 스테이지 패배', stage_fail_a, stage_fail_b),
    ('region_enter', '새 지역 진입', '성화·열쇠·왕관의 영역 도착', region_enter_a, region_enter_b),
]

def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

manifest = []
for key, label, use, fa, fb in CUES:
    item = {'key': key, 'label': label, 'use': use, 'files': []}
    for tag, fn in (('A', fa), ('B', fb)):
        x = finish(fn()); name = f'{key}-{tag}.wav'; write(OUT / name, x)
        item['files'].append({'tag': tag, 'file': name, 'seconds': round(len(x) / SR, 2)})
    manifest.append(item)
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(manifest), 'cues', sum(len(m['files']) for m in manifest), 'files')
