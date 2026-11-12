import json
from pathlib import Path
from PIL import Image, ImageDraw
folder=Path(__file__).resolve().parent
items=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
regions=[(0.2,.1,.8,.88)]*3+[(.4,.34,.6,.51),(.36,.29,.67,.54),(.25,.5,.74,.57),(.2,.27,.9,.76),(.23,.37,.73,.62),(.44,.65,.55,.7),(.08,.6,.62,.83),(.54,.77,.61,.86),(.26,.65,.66,.93),(.4,.43,.64,.53),(.34,.39,.45,.44),(.59,.53,.72,.58),(.37,.69,.64,.77),(.28,.55,.74,.65)]
sheet=Image.new('RGB',(1050,330*6),'#24262b')
draw=ImageDraw.Draw(sheet)
for item,box in zip(items,regions):
    i=item['i']; x=(i%3)*350; y=(i//3)*330
    draw.text((x+5,y+4),f'{i:02d} symbol detail',fill='white')
    with Image.open(Path(item['output']).with_suffix('.webp')) as img:
        w,h=img.size
        crop=img.crop(tuple(round(v*(w if n%2==0 else h)) for n,v in enumerate(box)))
        crop.thumbnail((340,300))
        sheet.paste(crop,(x+(350-crop.width)//2,y+25))
sheet.save(folder/'details.jpg',quality=94)
phone=Image.new('RGB',(390*5,844),'#16181d')
draw=ImageDraw.Draw(phone)
for col,i in enumerate([3,5,6,8,16]):
    with Image.open(Path(items[i]['output']).with_suffix('.webp')) as img:
        img.thumbnail((390,814))
        phone.paste(img,(col*390+(390-img.width)//2,30))
        draw.text((col*390+5,5),f'{i:02d} 390 x 844',fill='white')
phone.save(folder/'phone-preview.jpg',quality=94)
