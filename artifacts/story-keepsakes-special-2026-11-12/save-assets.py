import json, shutil
from pathlib import Path
from PIL import Image

folder=Path(__file__).resolve().parent
items=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
preview=Image.new('RGB',(1200,450),'#24262b')
small=Image.new('RGB',(480,180),'#24262b')
report=[]
for col,item in enumerate(items):
    generated=Path(item['generated']); output=Path(item['output'])
    if output.exists() and output.read_bytes()!=generated.read_bytes():
        raise RuntimeError(f'Refusing to overwrite {output}')
    if not output.exists(): shutil.copy2(generated,output)
    with Image.open(output) as img:
        assert img.size==(1024,1536), (output,img.size)
        webp=output.with_suffix('.webp')
        if not webp.exists(): img.convert('RGB').save(webp,'WEBP',quality=85,method=6)
    with Image.open(webp) as img:
        assert img.size==(1024,1536)
        img.thumbnail((300,450)); preview.paste(img,(col*300,0))
        img.thumbnail((120,180)); small.paste(img,(col*120,0))
    report.append({'output':str(output),'webp':str(webp),'size':[1024,1536],'png_bytes':output.stat().st_size,'webp_bytes':webp.stat().st_size})
preview.save(folder/'four-story-tiles-preview.jpg',quality=94)
small.save(folder/'small-size-preview.jpg',quality=94)
(folder/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'saved':len(report),'size':[1024,1536],'webp_quality':85}))
