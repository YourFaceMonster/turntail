import json, shutil, hashlib
from pathlib import Path
from PIL import Image,ImageDraw

folder=Path(__file__).resolve().parent
items=json.loads((folder/'scene-manifest.json').read_text(encoding='utf-8'))
report=[]
for x in items:
    src,generated,dst=map(Path,[x['source'],x['generated'],x['output']])
    with Image.open(src) as original, Image.open(generated) as img:
        generated_size=img.size
        if img.size!=original.size: img=img.resize(original.size,Image.Resampling.LANCZOS)
        if dst.exists():
            with Image.open(dst) as existing:
                assert existing.size==img.size and existing.convert('RGB').tobytes()==img.convert('RGB').tobytes(),dst
        elif original.size==generated_size: shutil.copy2(generated,dst)
        else: img.save(dst,'PNG')
        webp=dst.with_suffix('.webp')
        if not webp.exists(): img.convert('RGB').save(webp,'WEBP',quality=85,method=6)
        with Image.open(webp) as compressed: assert compressed.size==original.size
        report.append({'index':x['i'],'original':str(src),'original_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':str(dst),'size':list(original.size),'generated_size':list(generated_size),'png_bytes':dst.stat().st_size,'webp_bytes':webp.stat().st_size})
(folder/'scene-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for start in range(0,len(items),6):
    subset=items[start:start+6];sheet=Image.new('RGB',(1200,400*len(subset)),'#282a30');draw=ImageDraw.Draw(sheet)
    for row,x in enumerate(subset):
        draw.text((5,row*400+3),f"{x['i']:02} {Path(x['output']).name} | original / special",fill='white')
        for col,key in enumerate(['source','output']):
            with Image.open(x[key]) as img:
                img.thumbnail((590,365));sheet.paste(img,(col*600+(600-img.width)//2,row*400+27))
    sheet.save(folder/f'comparison-{start//6+1}.jpg',quality=93)
phone=Image.new('RGB',(390*4,844),'#24262b');draw=ImageDraw.Draw(phone)
for col,i in enumerate([0,12,14,17]):
    with Image.open(Path(items[i]['output']).with_suffix('.webp')) as img:
        img.thumbnail((390,814));phone.paste(img,(col*390+(390-img.width)//2,30));draw.text((col*390+5,5),f'{i:02} 390x844',fill='white')
phone.save(folder/'phone-preview.jpg',quality=94)
print(json.dumps({'scenes':len(report),'dimensions_match_original':True,'resized':[{'i':x['index'],'from':x['generated_size'],'to':x['size']} for x in report if x['size']!=x['generated_size']]}))
