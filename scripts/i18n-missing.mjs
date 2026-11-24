// English version helper (2026-11-20): prints the exact tr('…') keys that have no English entry yet, per file.
// Usage: node scripts/i18n-missing.mjs [--skip=regex] [--only=regex] [--json out.json]
import {readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const root=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const arg=k=>process.argv.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
const skip=arg('skip')?new RegExp(arg('skip')):null,only=arg('only')?new RegExp(arg('only')):null;
const jsonOut=process.argv.includes('--json')?process.argv[process.argv.indexOf('--json')+1]:null;
const {EN}=await import('file:///'+join(root,'lib/i18n/en.ts').replace(/\\/g,'/')).catch(()=>({EN:null}));
const enKeys=EN?new Set(Object.keys(EN)):new Set([...readFileSync(join(root,'lib/i18n/en.ts'),'utf8').matchAll(/^\s*'((?:[^'\\]|\\.)*)'\s*:/gm)].map(m=>m[1].replace(/\\'/g,"'").replace(/\\\\/g,'\\')));
const walk=dir=>readdirSync(dir).flatMap(n=>{const p=join(dir,n);return statSync(p).isDirectory()?walk(p):/\.(ts|tsx)$/.test(n)?[p]:[];});
const out={};let count=0;const seen=new Set();
for(const f of [...walk(join(root,'app')),...walk(join(root,'lib'))]){
 const rel=relative(root,f).replace(/\\/g,'/');if(/\/i18n\//.test(rel)||(skip&&skip.test(rel))||(only&&!only.test(rel)))continue;
 const src=readFileSync(f,'utf8');if(!src.includes('tr('))continue;
 const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const keys=[];
 const v=n=>{if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&n.expression.text==='tr'){const a=n.arguments[0];if(a&&(ts.isStringLiteral(a)||ts.isNoSubstitutionTemplateLiteral(a))&&!enKeys.has(a.text)&&!seen.has(a.text)){seen.add(a.text);keys.push(a.text);}}ts.forEachChild(n,v);};
 v(sf);if(keys.length){out[rel]=keys;count+=keys.length;}
}
if(jsonOut)writeFileSync(jsonOut,JSON.stringify(out,null,1),'utf8');
else for(const [f,keys] of Object.entries(out)){console.log(`## ${f} (${keys.length})`);for(const k of keys)console.log(JSON.stringify(k));}
console.error(`missing unique keys: ${count}`);
