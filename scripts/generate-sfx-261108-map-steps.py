"""Light footstep variants for the journey map move (round 2)."""
import sys, json
from pathlib import Path
out = Path(sys.argv[1]); sys.argv = [sys.argv[0], str(out / '_base')]
sys.path.insert(0, str(Path(__file__).parent))
import make_sfx as m
import numpy as np

def light_step(g=1.0, pitch=1.0):
    """Soft heel-toe on packed earth: a bright scuff and a tiny low tap, no boom."""
    return (m.Mix(.14)
        .add(m.nburst(.07, 'bp', 2600 * pitch, .9, 55, .003), 0, .8)
        .add(m.nburst(.05, 'hp', 4200 * pitch, .7, 80), .012, .25)
        .add(m.modal(190 * pitch, [(1, 1, 55), (2.3, .3, 80)], .08), .004, .35)).buf * g

def step_a():  # two light steps
    return m.Mix(.4).add(light_step(1, 1)).add(light_step(.8, 1.08), .17).buf

def grass(g=1.0, pitch=1.0):
    return (m.Mix(.12)
        .add(m.nburst(.09, 'bp', 3600 * pitch, .8, 40, .006), 0, .9)
        .add(m.modal(320 * pitch, [(1, 1, 70)], .05), 0, .2)).buf * g

def step_b():  # three quick tiptoe steps on grass
    return m.Mix(.45).add(grass(1, 1)).add(grass(.8, 1.1), .12).add(grass(.65, .95), .24).buf

def step_c():  # two light steps with a tiny pack jingle
    mix = m.Mix(.55).add(light_step(1, 1)).add(light_step(.85, 1.06), .18)
    for at, f in [(.03, 3950), (.075, 4710), (.2, 4180)]:
        mix.add(m.modal(f, [(1, 1, 30), (1.52, .4, 42)], .25), at, .09)
    return mix.buf

items = []
for tag, fn in (('A', step_a), ('B', step_b), ('C', step_c)):
    x = m.finish(fn(), .8); name = f'map_step2-{tag}.wav'; m.write(out / name, x)
    items.append({'tag': tag, 'file': name, 'seconds': round(len(x) / m.SR, 2)})
(out / 'map_steps.json').write_text(json.dumps(items), encoding='utf-8'); print(items)
