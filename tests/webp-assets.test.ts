import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {questArt,type QuestArtKey} from '../lib/rpg-quest-art';
import {RPG_STORY_REEL} from '../lib/rpg-connection-scenes';
import {FIRST_PROLOGUE} from '../lib/rpg-prologue';
import {prologueArt} from '../lib/rpg-prologue-art';

/** 2026-11-09: every served PNG got a .webp twin; the app references the webp (PNG originals stay in public). */
const sources=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sources(join(dir,e.name)):/\.(tsx?|css)$/.test(e.name)?[join(dir,e.name)]:[]);
test('literal image paths in app/lib point at existing files and no served PNG remains',()=>{
 const missing:string[]=[],png:string[]=[];
 for(const file of [...sources('app'),...sources('lib')]){
  const text=readFileSync(file,'utf8');
  for(const [,path] of text.matchAll(/['"`(](\/[A-Za-z0-9_\-./]+\.(?:webp|png))(?=['"`)\s?#])/g)){
   if(!existsSync('public'+path))missing.push(`${file}: ${path}`);
   if(path.endsWith('.png'))png.push(`${file}: ${path}`);
  }
 }
 assert.deepEqual(missing,[]);assert.deepEqual(png,[]);
});
test('template-built art (quests, prologue, story reel) resolves to webp files',()=>{
 const keys=readFileSync('lib/rpg-quest-art.ts','utf8').match(/LANDSCAPE_VERSION[^{]*\{([^}]*)\}/)?.[1].match(/'([\w-]+)'|([\w-]+):/g)?.map(k=>k.replace(/['":]/g,''))||[];
 assert.ok(keys.length>3,'quest art keys found');
 for(const key of keys){const art=questArt(key as QuestArtKey);for(const p of [art.landscape,art.portrait]){assert.ok(p.endsWith('.webp'),p);assert.ok(existsSync('public'+p),p);}}
 for(const cut of [...RPG_STORY_REEL,...FIRST_PROLOGUE]){const art=prologueArt(cut as never)||(cut as {art?:{landscape:string,portrait:string}}).art;if(!art)continue;for(const p of [art.landscape,art.portrait]){assert.ok(existsSync('public'+p),p);}}
});
