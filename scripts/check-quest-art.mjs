import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {QUEST_ART_KEYS,questArt} from '../lib/rpg-quest-art.ts';
let count=0;
for(const key of QUEST_ART_KEYS){
 for(const [orientation,url] of Object.entries(questArt(key))){
  const bytes=readFileSync(new URL(`../public${url}`,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',url);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert(width>=900&&height>=900,`resolution: ${url}`);
  assert(orientation==='landscape'?width/height>1.6:width/height<.72,`orientation: ${url}`);
  if(process.argv.includes('--local')){const response=await fetch(`http://127.0.0.1:5173${url}`);assert.equal(response.status,200,url);assert(response.headers.get('content-type')?.includes('image/png'),url);assert.equal((await response.arrayBuffer()).byteLength,bytes.length,url);}
  count++;
 }
}
console.log(`${count} quest images: PNG signatures, sizes, responsive orientation${process.argv.includes('--local')?', local HTTP content':''} OK`);
