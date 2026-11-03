// Test-only TS/TSX and extensionless imports; browser style imports have no SSR effect.
import {registerHooks} from 'node:module';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
registerHooks({
 resolve(specifier,context,next){
  if(specifier.startsWith('.')&&context.parentURL&&!/\.[a-z]+$/i.test(specifier)){
   for(const ext of ['.ts','.tsx','.js']){const url=new URL(specifier+ext,context.parentURL);if(existsSync(url))return next(url.href,context);}
  }
  return next(specifier,context);
 },
 load(url,context,next){
  if(url.endsWith('.css'))return {format:'module',source:'export {};',shortCircuit:true};
  if(url.startsWith('file:')&&/\.tsx?$/.test(url)&&!url.includes('/node_modules/')){
   return {format:'module',source:ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{fileName:fileURLToPath(url),compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,shortCircuit:true};
  }
  return next(url,context);
 }
});
