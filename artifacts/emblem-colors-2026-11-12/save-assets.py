import json, shutil, hashlib
from pathlib import Path
from PIL import Image, ImageDraw

folder = Path(__file__).resolve().parent
items = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
report = []
for item in items:
    source, generated, output = map(Path, [item['original'], item['generated'], item['output']])
    with Image.open(source) as old, Image.open(generated) as new:
        generated_size = new.size
        if old.size != new.size:
            new = new.resize(old.size, Image.Resampling.LANCZOS)
        if output.exists():
            with Image.open(output) as existing:
                if existing.size != new.size or existing.convert('RGB').tobytes() != new.convert('RGB').tobytes():
                    raise RuntimeError(f'Refusing to overwrite different output: {output}')
        if not output.exists():
            if old.size == generated_size:
                shutil.copy2(generated, output)
            else:
                new.save(output, 'PNG')
        webp = output.with_suffix('.webp')
        if not webp.exists():
            new.convert('RGB').save(webp, 'WEBP', quality=85, method=6)
        with Image.open(webp) as encoded:
            assert encoded.size == old.size
        report.append({'index':item['i'], 'source':str(source), 'output':str(output), 'webp':str(webp), 'size':list(old.size), 'generated_size':list(generated_size), 'png_bytes':output.stat().st_size, 'webp_bytes':webp.stat().st_size, 'original_sha256':hashlib.sha256(source.read_bytes()).hexdigest()})

(folder / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
for start in range(0,len(items),6):
    subset=items[start:start+6]
    sheet=Image.new('RGB',(960,360*len(subset)), '#24262b')
    draw=ImageDraw.Draw(sheet)
    for row,item in enumerate(subset):
        draw.text((8,row*360+5), f"{item['i']:02d} {Path(item['output']).name}", fill='white')
        for col,key in enumerate(['original','output']):
            with Image.open(item[key]) as img:
                img.thumbnail((470,325))
                sheet.paste(img, (col*480+(480-img.width)//2,row*360+30))
    sheet.save(folder / f'comparison-{start//6+1}.jpg',quality=90)
print(json.dumps({'saved':len(report),'dimensions_match':True,'webp_quality':85}))
