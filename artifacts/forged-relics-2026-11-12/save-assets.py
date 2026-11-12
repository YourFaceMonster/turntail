import json
from pathlib import Path
from PIL import Image

record_dir = Path(__file__).resolve().parent
root = record_dir.parent.parent
manifest = json.loads((record_dir / 'manifest.json').read_text(encoding='utf-8'))
results = []
for asset in manifest['assets']:
    source = Path(asset['generated_original'])
    archived = record_dir / asset['archived_original']
    if not archived.exists():
        archived.write_bytes(source.read_bytes())
    im = Image.open(archived).convert('RGBA')
    original_size = im.size
    if im.size != (1254, 1254):
        im = im.resize((1254, 1254), Image.Resampling.LANCZOS)
    for kind in ('png', 'webp'):
        destination = root / asset[kind]
        if destination.exists():
            raise FileExistsError(destination)
        if kind == 'png':
            im.save(destination)
        else:
            im.save(destination, 'WEBP', lossless=True, method=6)
        verified = Image.open(destination)
        verified.load()
        assert verified.size == (1254, 1254)
        assert verified.mode == 'RGBA'
        assert verified.getchannel('A').getextrema() == (0, 255)
    results.append({'id': asset['id'], 'generated_size': original_size, 'final_size': im.size, 'alpha_extrema': im.getchannel('A').getextrema(), 'alpha_bbox': im.getchannel('A').getbbox(), 'png_bytes': (root / asset['png']).stat().st_size, 'webp_bytes': (root / asset['webp']).stat().st_size})
(record_dir / 'validation.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(json.dumps(results, indent=2))
