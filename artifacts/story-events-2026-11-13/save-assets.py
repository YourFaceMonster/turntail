import json, shutil, hashlib
from pathlib import Path
from PIL import Image

folder = Path(__file__).resolve().parent
root = folder.parent.parent
manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
report = []
for item in manifest['assets']:
    source = Path(item['generated'])
    raw = folder / (item['id'] + '-generated.png')
    target = root / item['output']
    webp = target.with_suffix('.webp')
    assert not target.exists() and not webp.exists(), f'Refusing overwrite: {target}'
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, raw)
    with Image.open(raw) as image:
        assert 'A' in image.getbands(), f'Missing alpha: {source}'
        original_size = image.size
        image = image.convert('RGBA').resize(tuple(item['size']), Image.Resampling.LANCZOS)
        assert image.getchannel('A').getextrema() == (0, 255)
        image.save(target, 'PNG')
        image.save(webp, 'WEBP', quality=88, method=6, exact=True)
    for output in [target, webp]:
        with Image.open(output) as saved:
            assert list(saved.size) == item['size']
            assert 'A' in saved.getbands()
            assert saved.getchannel('A').getextrema() == (0, 255)
            assert saved.getpixel((0, 0))[3] == 0
    report.append({'id': item['id'], 'generated_size': original_size, 'final_size': item['size'], 'png': str(target), 'webp': str(webp), 'png_bytes': target.stat().st_size, 'webp_bytes': webp.stat().st_size, 'transparent_alpha_verified': True, 'png_sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'webp_sha256': hashlib.sha256(webp.read_bytes()).hexdigest()})
(folder / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
