import concurrent.futures, datetime, hashlib, json, re, urllib.request
from pathlib import Path

root=Path(__file__).resolve().parents[2]
folder=Path(__file__).resolve().parent
base='https://turntail.yousexybaby.workers.dev'
def get(path):
    request=urllib.request.Request(base+path,headers={'Cache-Control':'no-cache','User-Agent':'TURNTALE-release-verification'})
    with urllib.request.urlopen(request,timeout=25) as response:
        return response.status,response.headers.get('Content-Type',''),response.read()
status,content_type,body=get('/')
html=body.decode('utf-8')
version_tag=re.search(r'class="title-version"[^>]*>(.*?)</small>',html,re.DOTALL)
versions=re.findall(r'0\.7\.\d+',version_tag.group(1) if version_tag else '')
if '0.7.16' not in versions:
    print(json.dumps({'status':'pending','http':status,'versions':versions}));raise SystemExit(2)
paths=set()
for relative in ['artifacts/story-keepsakes-special-2026-11-12/manifest.json','artifacts/story-keepsakes-scenes-2026-11-12/back-manifest.json','artifacts/story-keepsakes-scenes-2026-11-12/scene-manifest.json']:
    for item in json.loads((root/relative).read_text(encoding='utf-8')):
        paths.add(Path(item['output']).with_suffix('.webp').relative_to(root/'public').as_posix())
def verify(path):
    try:
        status,kind,data=get('/'+path)
        local=(root/'public'/path).read_bytes()
        assert status==200 and 'image/webp' in kind and data==local,'response differs from local WebP'
        return {'path':'/'+path,'http':status,'content_type':kind,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    except Exception as error:
        return {'path':'/'+path,'error':str(error)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    images=list(pool.map(verify,sorted(paths)))
failures=[img for img in images if 'error' in img]
entry=next(p for p in re.findall(r'<script[^>]+src="([^"]+)"',html) if '/index-' in p)
_,_,entry_data=get(entry)
imports=re.findall(r'["\']([^"\']+\.js)["\']',entry_data.decode('utf-8'))
bundles=sorted({'/'+p.lstrip('/') for p in imports if p.startswith('_next/') and ('/page-' in p or '/rpg-connection-scenes-' in p)})
bundle_text='\n'.join(get(path)[2].decode('utf-8') for path in bundles)
tokens=['crown-two-front-special-v1.webp','iron-gate-two-front-special-cutout-v1.webp','sacred-flame-two-front-special-v1.webp','secret-key-two-front-special-v1.webp','st6-flame-two-back','st9-key-two-back','st3-keepsake-handoff-wide','-special-v1.webp']
assert all(token in bundle_text for token in tokens),'deployed bundle missing approved story artwork references'
report={'checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'homepage':{'url':base+'/','http':status,'versions':versions},'images_matching_local':len(images)-len(failures),'images':images,'failures':failures,'bundles_checked':bundles,'approved_artwork_tokens_verified':tokens,'browser_playthrough':False,'cloudflare_build_dashboard_checked':False}
(folder/'public-verification-0.7.16.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'status':'failed' if failures else 'verified','version':'0.7.16','images_matching_local':len(images)-len(failures),'failures':failures}))
raise SystemExit(1 if failures else 0)
