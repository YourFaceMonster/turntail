// English version progress (2026-11-20). Lists Korean text in app/ and lib/ that has no English entry yet.
// Usage: node scripts/i18n-report.mjs [--files]   (--files prints every missing sentence per file)
// Counts quoted Korean strings and Korean JSX text. Template strings with ${…} are counted but need a
// t('…{name}…',{name}) rewrite before they can match the table.
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
const root=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const enSource=readFileSync(join(root,'lib/i18n/en.ts'),'utf8');
const keys=new Set([...enSource.matchAll(/^\s*'((?:[^'\\]|\\.)*)'\s*:/gm)].map(m=>m[1].replace(/\\'/g,"'")));
const hangul=/[가-힣]/;
const walk=dir=>readdirSync(dir).flatMap(name=>{const p=join(dir,name);return statSync(p).isDirectory()?walk(p):/\.(ts|tsx)$/.test(name)?[p]:[];});
const files=[...walk(join(root,'app')),...walk(join(root,'lib'))].filter(p=>!/[\\/]i18n[\\/]/.test(p));
let total=0,done=0;const rows=[];
for(const file of files){
 const src=readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`])\/\/.*$/gm,'$1');
 const found=[];
 for(const m of src.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g))if(hangul.test(m[2]))found.push(m[2]);
 for(const m of src.matchAll(/>([^<>{}\n]*[가-힣][^<>{}\n]*)</g))found.push(m[1].trim());
 if(!found.length)continue;
 const missing=found.filter(s=>!keys.has(s));total+=found.length;done+=found.length-missing.length;
 rows.push({file:relative(root,file),count:found.length,missing});
}
rows.sort((a,b)=>b.missing.length-a.missing.length);
console.log(`English entries: ${keys.size}. Korean text spots: ${total}, matched: ${done} (${total?Math.round(done/total*100):0}%).`);
for(const r of rows)if(r.missing.length){console.log(`${String(r.missing.length).padStart(5)}  ${r.file}`);if(process.argv.includes('--files'))for(const s of r.missing)console.log('       '+s);}
