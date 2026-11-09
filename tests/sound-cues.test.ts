import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CUE_ASSETS,preloadCues,playCue,setCuePlayer,cue,cueOnce,isCueKind,type CueKind} from '../lib/sound-cues';
import {effectOutput} from '../lib/audio-mixer';

test('picked cue files match the recorded manifest',()=>{
 const manifest=JSON.parse(readFileSync('docs/assets/sound-261108.json','utf8'));
 assert.deepEqual(Object.entries(CUE_ASSETS).map(([kind,a])=>`${kind}:${a.src}`).sort(),manifest.files.map((f:{kind:string,src:string})=>`${f.kind}:${f.src}`).sort());
 for(const file of manifest.files){
  const bytes=readFileSync(`public${file.src}`);
  assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');
 }
});

test('cues decode once, play through the shared effects bus and never replay a result fanfare',async()=>{
 class Node{gain={value:0};buffer:unknown=null;onended:(()=>void)|null=null;output:unknown;started=-1;disconnected=false;connect(o:unknown){this.output=o;}disconnect(){this.disconnected=true;}start(at:number){this.started=at;}}
 const sources:Node[]=[];let fetches=0;
 const ctx={state:'running',currentTime:2,destination:{},createGain:()=>new Node(),createBufferSource:()=>{const n=new Node();sources.push(n);return n;},
  decodeAudioData:async()=>({numberOfChannels:1,getChannelData:()=>new Float32Array([.5,-.25])})} as unknown as AudioContext;
 const original=globalThis.fetch;globalThis.fetch=(async()=>{fetches++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)} as Response;}) as typeof fetch;
 try{
  assert.equal(playCue(ctx,'clear'),false,'cold cue stays silent instead of playing late');
  await Promise.all([preloadCues(ctx),preloadCues(ctx)]);
  assert.equal(fetches,Object.keys(CUE_ASSETS).length);
  for(const kind of Object.keys(CUE_ASSETS) as CueKind[]){
   assert.equal(playCue(ctx,kind),true);const s=sources.at(-1)!,g=s.output as Node;
   assert.equal(g.gain.value,CUE_ASSETS[kind].gain/.5);assert.equal(g.output,effectOutput(ctx));
   s.onended?.();assert.ok(s.disconnected&&g.disconnected);
  }
  playCue(ctx,'storyCard',1.4);assert.equal(sources.at(-1)!.started,3.4,'delayed cue is scheduled on the audio clock');
  const heard:string[]=[];setCuePlayer(kind=>heard.push(kind));
  cue('dialogue');cueOnce('result:a','clear');cueOnce('result:a','clear');cueOnce('result:b','fail');
  assert.deepEqual(heard,['dialogue','clear','fail']);setCuePlayer(null);cue('click');assert.equal(heard.length,3);
  assert.ok(isCueKind('relic')&&!isCueKind('tap')&&!isCueKind('toString'));
 }finally{globalThis.fetch=original;}
});
