// English version helper (2026-11-20): wraps data names shown directly in JSX ({p.name}, {combo?.label}, {x.title})
// in trv(…), so names and labels that stay Korean in game data appear in the current language.
// Usage: node scripts/i18n-names.mjs [--dry] file...
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,relative,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const args=process.argv.slice(2),dry=args.includes('--dry'),files=args.filter(a=>!a.startsWith('--'));
const NAMES=new Set(['name','label','title']);
const root=resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
for(const file of files){
 const path=resolve(file),src=readFileSync(path,'utf8');
 const sf=ts.createSourceFile(path,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const edits=[];
 const visit=n=>{
  if(ts.isJsxExpression(n)&&n.expression&&ts.isPropertyAccessExpression(n.expression)&&NAMES.has(n.expression.name.text)&&ts.isJsxElement(n.parent)){
   const e=n.expression;edits.push([e.getStart(sf),e.end,`trv(${e.getText(sf)})`]);
  }
  ts.forEachChild(n,visit);
 };
 visit(sf);
 if(!edits.length)continue;
 edits.sort((a,b)=>b[0]-a[0]);let out=src;for(const [s,e,t] of edits)out=out.slice(0,s)+t+out.slice(e);
 const m=out.match(/import\s*\{([^}]*)\}\s*from\s*(['"][^'"]*i18n(?:\/index(?:\.ts)?)?['"]);?/);
 if(m){if(!/\btrv\b/.test(m[1]))out=out.replace(m[0],m[0].replace(m[1],m[1].trim()+',trv'));}
 else{let rel=relative(dirname(path),resolve(root,'lib/i18n/index.ts')).replace(/\\/g,'/');if(!rel.startsWith('.'))rel='./'+rel;const im=[...out.matchAll(/^import[^\n]*\n/gm)],at=im.length?im[im.length-1].index+im[im.length-1][0].length:0;out=out.slice(0,at)+`import {trv} from '${rel}';\n`+out.slice(at);}
 console.log(`${relative(root,path)}: ${edits.length} wrapped`);
 if(!dry)writeFileSync(path,out,'utf8');
}
