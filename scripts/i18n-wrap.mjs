// English version helper (2026-11-20): wraps Korean screen text in tr('…') using the TypeScript AST.
// Usage: node scripts/i18n-wrap.mjs [--all] [--dry] file...
//   default: JSX text, text attributes (aria-label, title, placeholder, alt, label), and strings/template
//            strings inside JSX {…} expressions.
//   --all:   every Korean string in the file (for data files such as stage text), with the same exclusions.
//   --props=a,b: in data files, only strings that are the value of those property names (title:'…', text:'…'),
//            including strings inside arrays or ternaries under that property.
// Never wrapped: comparisons (=== !== == !=, case, includes/startsWith/…), object keys, import paths,
// type positions, strings already inside tr(…), and text with JSX entities.
// In Korean mode tr() returns the Korean text unchanged, so wrapping cannot change the Korean game.
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,relative,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const args=process.argv.slice(2),all=args.includes('--all'),dry=args.includes('--dry'),files=args.filter(a=>!a.startsWith('--'));
// --attrs-all: every Korean JSX string attribute (component props such as speaker=, nextLabel=) except these.
const attrsAll=args.includes('--attrs-all'),NON_TEXT_ATTRS=new Set(['className','key','id','src','href','role','type','name','value','htmlFor','scene','background','kind','mode','variant']);
const props=new Set((args.find(a=>a.startsWith('--props='))||'').slice(8).split(',').filter(Boolean));
function underProp(node){for(let p=node.parent;p;p=p.parent){if(ts.isPropertyAssignment(p))return ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)?props.has(p.name.text):false;if(ts.isCallExpression(p)||ts.isStatement(p)||ts.isFunctionLike(p))return false;}return false;}
const inScope=node=>all||(props.size?underProp(node):insideJsxExpression(node));
const HANGUL=/[가-힣]/,TEXT_ATTRS=new Set(['aria-label','title','placeholder','alt','label','aria-description','aria-roledescription']);
const COMPARE_CALLS=new Set(['includes','startsWith','endsWith','indexOf','lastIndexOf','localeCompare','test','split','replace','replaceAll','match','search','has','get','delete','getItem','setItem','removeItem','querySelector','querySelectorAll','closest','matches','josa']);
const quote=s=>"'"+s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n')+"'";
const root=resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');

function insideJsxExpression(node){for(let p=node.parent;p;p=p.parent){if(ts.isJsxExpression(p))return true;if(ts.isFunctionLike(p)&&!ts.isArrowFunction(p))return false;}return false;}
function insideTr(node){for(let p=node.parent;p;p=p.parent){if(ts.isCallExpression(p)&&ts.isIdentifier(p.expression)&&p.expression.text==='tr')return true;if(ts.isStatement(p))return false;}return false;}
function excluded(node){
 const p=node.parent;if(!p)return true;
 if(ts.isImportDeclaration(p)||ts.isExportDeclaration(p)||ts.isExternalModuleReference(p)||ts.isImportTypeNode?.(p))return true;
 if(ts.isLiteralTypeNode(p))return true;
 if((ts.isPropertyAssignment(p)||ts.isPropertySignature(p)||ts.isPropertyDeclaration(p)||ts.isMethodDeclaration(p))&&p.name===node)return true;
 if(ts.isElementAccessExpression(p)&&p.argumentExpression===node)return true;
 if(ts.isCaseClause(p))return true;
 if(ts.isBinaryExpression(p)&&[ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken,ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken,ts.SyntaxKind.InKeyword].includes(p.operatorToken.kind))return true;
 if(ts.isCallExpression(p)&&p.arguments.includes(node)){const callee=p.expression;const name=ts.isPropertyAccessExpression(callee)?callee.name.text:ts.isIdentifier(callee)?callee.text:'';if(COMPARE_CALLS.has(name))return true;}
 if(ts.isJsxAttribute(p))return true;
 if(insideTr(node))return true;
 // Speaker names double as portrait keys (speakerArt[speaker]); they are translated where shown (trv).
 for(let q=p;q&&!ts.isStatement(q);q=q.parent){if((ts.isPropertyAssignment(q)&&/^(speaker|speakers)$/.test(q.name.getText()))||(ts.isJsxAttribute(q)&&/^(speaker|speakers)$/.test(q.name.getText())))return true;}
 return false;
}

// Korean strings the code compares against or uses as keys anywhere in app/ and lib/. --all and --props never
// wrap these (translating one side of a comparison would break English mode); show them with tr(value) instead.
import {readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const SUBSTR=new Set();
function collectIdentities(){
 const set=new Set();SUBSTR.clear();const walk=dir=>readdirSync(dir).flatMap(n=>{const q=join(dir,n);return statSync(q).isDirectory()?walk(q):/\.(ts|tsx)$/.test(n)?[q]:[];});
 for(const f of [...walk(join(root,'app')),...walk(join(root,'lib'))]){
  if(/[\\/]i18n[\\/]/.test(f))continue;
  const text=readFileSync(f,'utf8');if(!HANGUL.test(text))continue;
  const sf=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true,f.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const v=n=>{if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))&&HANGUL.test(n.text)&&!insideTr(n)){const p=n.parent;
   const key=(ts.isPropertyAssignment(p)&&p.name===n)||ts.isLiteralTypeNode(p);
   if(key||(excluded(n)&&!ts.isJsxAttribute(p)&&!ts.isImportDeclaration(p)))set.add(n.text);
   // Searched inside other text (logs, notes): any sentence containing it must stay Korean.
   if(ts.isCallExpression(p)&&p.arguments.includes(n)){const c=p.expression,name=ts.isPropertyAccessExpression(c)?c.name.text:'';if(['includes','startsWith','endsWith','indexOf','lastIndexOf'].includes(name)&&n.text.length>=2)SUBSTR.add(n.text);}}
   ts.forEachChild(n,v);};
  v(sf);
 }
 return set;
}
const IDENTITIES=(all||props.size)?collectIdentities():new Set();
if(args.includes('--show-identities')){console.log([...IDENTITIES].join('\n'));console.log('--- searched inside text:');console.log([...SUBSTR].join('\n'));process.exit(0);}
// Every text search in the code checks how a sentence starts (startsWith), so only sentences starting with one stay.
const keepKorean=text=>IDENTITIES.has(text)||[...SUBSTR].some(id=>text.trimStart().startsWith(id));
for(const file of files){
 const path=resolve(file),src=readFileSync(path,'utf8');
 const sf=ts.createSourceFile(path,src,ts.ScriptTarget.Latest,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const edits=[],skipped=[];
 const visit=node=>{
  if(ts.isJsxText(node)&&HANGUL.test(node.text)){
   const raw=node.getText(sf);
   if(/[&{}<>]/.test(raw)){skipped.push(raw.trim());}
   else{const lead=raw.match(/^\s*/)[0],trail=raw.match(/\s*$/)[0],body=raw.slice(lead.length,raw.length-trail.length).replace(/\s*\n\s*/g,' ');edits.push([node.getStart(sf),node.end,`${lead}{tr(${quote(body)})}${trail}`]);}
  }else if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)&&HANGUL.test(node.initializer.text)){
   const name=node.name.getText(sf);if(TEXT_ATTRS.has(name)||(attrsAll&&!NON_TEXT_ATTRS.has(name)&&!name.startsWith('data-')))edits.push([node.initializer.getStart(sf),node.initializer.end,`{tr(${quote(node.initializer.text)})}`]);
  }else if((ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))&&HANGUL.test(node.text)&&inScope(node)&&!excluded(node)&&!keepKorean(node.text)){
   edits.push([node.getStart(sf),node.end,`tr(${quote(node.text)})`]);
  }else if(ts.isTemplateExpression(node)&&(HANGUL.test(node.head.text)||node.templateSpans.some(s=>HANGUL.test(s.literal.text)))&&inScope(node)&&!excluded(node)&&!keepKorean(node.head.text+node.templateSpans.map(s=>' '+s.literal.text).join(''))){
   let key=node.head.text;const vars=[];
   node.templateSpans.forEach((span,i)=>{key+=`{${i}}`+span.literal.text;vars.push(`${i}:${span.expression.getText(sf)}`);});
   edits.push([node.getStart(sf),node.end,`tr(${quote(key)},{${vars.join(',')}})`]);return; // inner templates stay as the variable expressions
  }
  ts.forEachChild(node,visit);
 };
 visit(sf);
 if(!edits.length){console.log(`${relative(root,path)}: nothing to wrap`);continue;}
 edits.sort((a,b)=>b[0]-a[0]);
 let out=src;for(const [s,e,text] of edits)out=out.slice(0,s)+text+out.slice(e);
 if(!/import\s*\{[^}]*\btr\b[^}]*\}\s*from\s*['"][^'"]*i18n(\/index(\.ts)?)?['"]/.test(out)){
  let rel=relative(dirname(path),resolve(root,'lib/i18n/index.ts')).replace(/\\/g,'/');if(!rel.startsWith('.'))rel='./'+rel;
  const imports=[...out.matchAll(/^import[^\n]*\n/gm)],at=imports.length?imports[imports.length-1].index+imports[imports.length-1][0].length:(out.startsWith("'use client'")||out.startsWith('"use client"')?out.indexOf('\n')+1:0);
  out=out.slice(0,at)+`import {tr} from '${rel}';\n`+out.slice(at);
 }
 console.log(`${relative(root,path)}: ${edits.length} wrapped${skipped.length?`, ${skipped.length} left for hand edits: ${skipped.map(s=>JSON.stringify(s.slice(0,30))).join(', ')}`:''}`);
 if(!dry)writeFileSync(path,out,'utf8');
}
