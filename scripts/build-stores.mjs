import {build} from 'vite';
import {readdir,readFile,writeFile,copyFile,mkdir,stat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,relative,extname,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const JSZip=require('C:/Users/SONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip');
const root=process.cwd(),pkg=JSON.parse(await readFile('package.json','utf8'));
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),output=resolve(root,'outputs/stores',`${pkg.version}-${stamp}`);
async function walk(dir){const result=[];for(const item of await readdir(dir,{withFileTypes:true})){if(item.isSymbolicLink())continue;const path=join(dir,item.name);if(item.isDirectory())result.push(...await walk(path));else result.push(path);}return result;}
const publicRoot=resolve('public'),publicFiles=await walk(publicRoot),sources=[];
for(const dir of ['app','lib','components'])for(const path of await walk(resolve(dir)))if(/\.(tsx?|css)$/.test(path))sources.push(await readFile(path,'utf8'));
const pngReferences=new Set(['icon-512.png','apple-touch-icon.png']);
for(const source of sources)for(const match of source.matchAll(/["'`(]\/([^"'`\s)]+\.png)/g))pngReferences.add(match[1]);
const assets=publicFiles.filter(path=>['.webp','.mp3','.svg','.ico','.woff2','.woff','.ttf'].includes(extname(path))||pngReferences.has(relative(publicRoot,path).replaceAll('\\','/')));
const sourceBytes=(await Promise.all(publicFiles.map(path=>stat(path)))).reduce((n,s)=>n+s.size,0);
await mkdir(output,{recursive:true});
for(const target of ['itch','onestore']){
 process.env.TURNTALE_TARGET=target;
 const dir=join(output,target,'game');await mkdir(dir,{recursive:true});
 await build({configFile:resolve('vite.store.config.ts'),build:{outDir:dir,emptyOutDir:false}});
 for(const path of assets){const dest=join(dir,relative(publicRoot,path));await mkdir(dirname(dest),{recursive:true});await copyFile(path,dest);}
 const files=await walk(dir),zip=new JSZip(),manifest=[];
 for(const path of files){const name=relative(dir,path).replaceAll('\\','/'),bytes=await readFile(path);manifest.push({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});zip.file(name,bytes,{compression:/\.(webp|mp3|png|jpe?g|woff2)$/i.test(name)?'STORE':'DEFLATE'});}
 const bytes=manifest.reduce((n,f)=>n+f.bytes,0);
 if(files.length>1000||bytes>500_000_000||manifest.some(f=>f.bytes>200_000_000||f.path.length>240))throw Error(`${target}: exceeds itch HTML5 archive limits`);
 const archive=join(output,`TURNTALE-${pkg.version}-${target}-local.zip`);
 await writeFile(archive,await zip.generateAsync({type:'nodebuffer',compressionOptions:{level:6}}));
 const report={version:pkg.version,target,localPreview:true,apiOrigin:process.env.TURNTALE_API_ORIGIN||'https://turntail.yousexybaby.workers.dev',advertising:target==='itch'?'excluded':process.env.TURNTALE_ONESTORE_PLACEMENT?'configured-unverified':'disabled-missing-placement-id',sourcePublicBytes:sourceBytes,bytes,files:manifest.length,assets:manifest,blockers:['No store publication performed.','Cross-origin online APIs require deployment with exact allowed CDN/game origins.',...(target==='onestore'?['ONE store admission, placement ID and Android host verification required.']:[])]};
 await writeFile(join(output,target,'manifest.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`${target}: ${files.length} files, ${(bytes/1024/1024).toFixed(1)} MiB, ${archive}`);
}
await writeFile(join(output,'README.txt'),`TURNTALE ${pkg.version} local store previews\n\nitch: HTML5 ZIP, index.html at archive root; No payments; Mobile Friendly; click-to-play/fullscreen.\nonestore: Web product preview, not APK/AAB. Hosted HTTPS URL and ONE store registration are required.\n\nOriginal PNG/WAV/source files are preserved. PNG/WAV originals are excluded from these packages unless explicitly used.\nOnline APIs need exact CDN/game origins in TURNTALE_ALLOWED_ORIGINS on the server and deployment of the CORS change. This build does not deploy it.\nONE store real ads remain disabled until TURNTALE_ONESTORE_PLACEMENT is issued and set at build time. Browser previews cannot verify actual ads.\nLocal saves are origin-specific; existing website saves do not automatically transfer.\nUse HTTP to preview, not file://.\n`);
console.log(`OUTPUT=${output}`);
