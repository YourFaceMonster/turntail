import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FIRST_PROLOGUE,SECOND_PROLOGUE,PrologueClock,prologueCuts} from '../lib/rpg-prologue.ts';
import {ProloguePicture,StoryTile} from '../app/components/RpgPrologue.tsx';
import {createRpgJourneyGame,enterJourneyNode} from '../lib/rpg-game.ts';
import {saveRpgGame,readRpgArchive} from '../lib/rpg-storage.ts';
import {prologueAmbience} from '../lib/rpg-prologue-audio.ts';
import {prologueArt,prologueArtSources} from '../lib/rpg-prologue-art.ts';
import {readFileSync} from 'node:fs';

test('first run follows the ordinary wanderer story in 68 seconds; second run requires both real prerequisites',()=>{
 assert.equal(FIRST_PROLOGUE.reduce((n,c)=>n+c.duration,0),68000);
 assert.deepEqual(FIRST_PROLOGUE.map(c=>c.scene),['dark','snow','inn','room','table','card','card','road','stone','gate']);
 assert.equal(prologueCuts(),FIRST_PROLOGUE);
 assert.equal(prologueCuts({normalEndingCleared:false,handoffSceneReady:true}),FIRST_PROLOGUE);
 assert.equal(prologueCuts({normalEndingCleared:true,handoffSceneReady:false}),FIRST_PROLOGUE);
 assert.equal(prologueCuts({normalEndingCleared:true,handoffSceneReady:true}),SECOND_PROLOGUE);
 assert.ok(!SECOND_PROLOGUE.some(c=>c.line.includes('약속대로')));
 assert.equal(new Set(FIRST_PROLOGUE.map(c=>c.id)).size,FIRST_PROLOGUE.length);
});
test('no input completes once; skip and late taps cannot re-enter or write a second save',()=>{
 const game=createRpgJourneyGame('프롤로그 검증'),before=JSON.stringify(game),memory=new Map<string,string>();let writes=0,enters=0;
 const storage={getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>{writes++;memory.set(key,value);}};
 const player=new PrologueClock(FIRST_PROLOGUE,()=>{enters++;saveRpgGame(storage,game);});
 let now=0;while(!player.completed){player.tick(now);now+=100;}
 player.complete();player.next();player.tick(now+100000);
 assert.equal(enters,1);assert.equal(writes,1);assert.equal(JSON.stringify(game),before);
 const restored=readRpgArchive(storage).active!;assert.equal(restored.rpgRun!.journey!.location,'map');
 assert.equal(restored.rpgRun!.stage,1);enterJourneyNode(restored,'battle-1');assert.equal(restored.phase,'playing');
 assert.deepEqual(restored.players.map(p=>p.hand),game.players.map(p=>p.hand),'the first deal is preserved');
 for(let i=0;i<FIRST_PROLOGUE.length;i++){
  let calls=0;const skipped=new PrologueClock(FIRST_PROLOGUE,()=>calls++);for(let j=0;j<i;j++)skipped.next();skipped.complete();skipped.complete();skipped.next();assert.equal(calls,1);
 }
});
test('background and lock pause the current beat without accumulating hidden time',()=>{
 let enters=0;const player=new PrologueClock(FIRST_PROLOGUE,()=>enters++);player.tick(0);player.tick(200);const elapsed=player.elapsed;
 player.pause(true);player.tick(100000);player.next();assert.equal(player.index,0);assert.equal(player.elapsed,elapsed);
 player.pause(false);player.tick(200000);assert.equal(player.elapsed,elapsed);player.tick(200100);assert.equal(player.elapsed,elapsed+100);assert.equal(enters,0);
 player.tick(999999);assert.equal(player.elapsed,elapsed+350,'a stalled frame cannot skip whole scenes');
});
test('every visible story beat has finished landscape and portrait paintings, including both tile faces and the matching stone',()=>{
 for(const cut of FIRST_PROLOGUE){
  const html=renderToStaticMarkup(h(ProloguePicture,{cut}));assert.ok(html.includes(`scene-${cut.scene}`));
  const art=prologueArt(cut);if(!art){assert.equal(cut.scene,'dark');continue;}
  assert.ok(html.includes(art.landscape));assert.ok(html.includes(art.portrait));
  for(const [orientation,src] of Object.entries(art)){
   const png=readFileSync(new URL(`../public${src}`,import.meta.url));assert.equal(png.toString('ascii',1,4),'PNG');
   const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.ok(orientation==='portrait'?height>width:width>height,`${src}: incorrect orientation`);
  }
  assert.ok(!html.includes('prologue-hand'),'finished paintings replace temporary prop geometry');
 }
 assert.notDeepEqual(prologueArt(FIRST_PROLOGUE[5]),prologueArt(FIRST_PROLOGUE[6]),'front and back have distinct rendered paintings');
 assert.equal(prologueArtSources(true).length,9);assert.equal(prologueArtSources(false).length,9);
 const tile=renderToStaticMarkup(h(StoryTile,{back:true}));assert.ok(tile.includes('is-back'));assert.ok(tile.includes('prologue-tile-scratch'));assert.ok(tile.includes('>2<'));
});
test('muting both buses creates no sources; music-only and effects-only stay independent and cleanup is idempotent',()=>{
 let created=0,stopped=0,disconnected=0;
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({gain:param(),frequency:param(),connect(){},disconnect(){disconnected++;},start(){},stop(){stopped++;}});
 const ctx={sampleRate:100,currentTime:0,destination:{},createGain:node,createOscillator:()=>{created++;return node();},createBufferSource:()=>{created++;return node();},createBiquadFilter:node,createBuffer:()=>({getChannelData:()=>new Float32Array(300)})} as unknown as AudioContext;
 const cut=FIRST_PROLOGUE[3];prologueAmbience(ctx,cut,false,0,false)();assert.equal(created,0);
 const musicStop=prologueAmbience(ctx,cut,true,40,false);assert.ok(created>0);musicStop();assert.ok(stopped>0);assert.ok(disconnected>0);
 const prior=created,stop=prologueAmbience(ctx,cut,false,40,true);assert.equal(created-prior,1);stop();stop();
 assert.doesNotThrow(()=>prologueAmbience({createBuffer(){throw Error('audio blocked');}} as unknown as AudioContext,cut,true,40)());
});
