import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SOUND_ASSETS,preloadSoundAssets,playSoundAsset,type SoundAssetKind} from '../lib/sound-assets';
import {effectOutput,setEffectVolume} from '../lib/audio-mixer';
import {playTileSound} from '../lib/tile-audio';

const manifest=JSON.parse(readFileSync('docs/assets/sound-261028.json','utf8'));
assert.equal(manifest.files.length,9);
assert.deepEqual(Object.values(SOUND_ASSETS).map(asset=>asset.src).sort(),manifest.files.map((file:{src:string})=>file.src).sort());
for(const file of manifest.files){
 const bytes=readFileSync(`public${file.src}`);
 assert.equal(bytes.length,file.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
}
class Param{value=0;cancelScheduledValues(){}setTargetAtTime(value:number){this.value=value;}}
class Node{
 gain=new Param();buffer:AudioBuffer|null=null;onended:(()=>void)|null=null;
 output:unknown;disconnected=false;started=false;
 connect(output:unknown){this.output=output;}disconnect(){this.disconnected=true;}
 start(){this.started=true;}
}
function context(level=.5){
 const sources:Node[]=[],gains:Node[]=[];let decodes=0;
 const ctx={state:'running',currentTime:1,destination:{},
  createGain(){const node=new Node();gains.push(node);return node;},
  createBufferSource(){const node=new Node();sources.push(node);return node;},
  async decodeAudioData(){decodes++;return {duration:.4,numberOfChannels:1,getChannelData:()=>new Float32Array([level,-level/2])} as unknown as AudioBuffer;},
 };
 return {ctx:ctx as unknown as AudioContext,raw:ctx,sources,gains,decodes:()=>decodes};
}
const originalFetch=globalThis.fetch;let fetches=0;
globalThis.fetch=(async ()=>{fetches++;return {ok:true,arrayBuffer:async ()=>new ArrayBuffer(4)} as Response;}) as typeof fetch;
try{
 const c=context();
 playTileSound(c.ctx,'draw');assert.equal(c.sources.length,0,'cold draw/flip is silent, without synth fallback');
 assert.equal(playSoundAsset(c.ctx,'tap'),false,'cold playback uses synth instead of a delayed cue');
 await Promise.all([preloadSoundAssets(c.ctx),preloadSoundAssets(c.ctx)]);
 assert.equal(fetches,9);assert.equal(c.decodes(),9,'concurrent gestures share decoding');
 await preloadSoundAssets(c.ctx);assert.equal(fetches,9,'decoded cues are cached');
 for(const kind of Object.keys(SOUND_ASSETS) as SoundAssetKind[]){
  assert.equal(playSoundAsset(c.ctx,kind),true);
  const source=c.sources.at(-1)!;assert.equal(source.started,true);
  const gain=source.output as Node;
  assert.equal(gain.gain.value,SOUND_ASSETS[kind].gain/.5,'normalize source peak once at decode');
  assert.equal(gain.output,effectOutput(c.ctx),'recordings share the synth volume/mute bus');
  source.onended?.();assert.ok(source.disconnected&&gain.disconnected);
 }
 const first=c.sources[0];playTileSound(c.ctx,'tap');
 assert.equal(c.sources.length,10,'tile playback uses one recording, no parallel synth');
 assert.equal(c.sources.at(-1)!.buffer,first.buffer,'repeat playback reuses buffer');
 playTileSound(c.ctx,'draw');assert.equal(c.sources.length,10,'decoded draw recording also stays silent');
 setEffectVolume(c.ctx,25);assert.equal(effectOutput(c.ctx).gain.value,.25);
 setEffectVolume(c.ctx,25,false);assert.equal(effectOutput(c.ctx).gain.value,0);
 c.raw.state='suspended';assert.equal(playSoundAsset(c.ctx,'victory'),false);assert.equal(c.sources.length,10);
 const broken=context();globalThis.fetch=(async ()=>{throw Error('offline');}) as typeof fetch;
 await preloadSoundAssets(broken.ctx);assert.equal(playSoundAsset(broken.ctx,'play'),false);
 const partial=context();globalThis.fetch=(async (url:unknown)=>({ok:!String(url).includes('09-red-two'),arrayBuffer:async ()=>new ArrayBuffer(4)}) as Response) as typeof fetch;
 await preloadSoundAssets(partial.ctx);assert.equal(playSoundAsset(partial.ctx,'redTwo'),false);assert.equal(playSoundAsset(partial.ctx,'victory'),true);
 globalThis.fetch=(async ()=>({ok:true,arrayBuffer:async ()=>new ArrayBuffer(4)}) as Response) as typeof fetch;
 const quiet=context(.001);await preloadSoundAssets(quiet.ctx);assert.equal(playSoundAsset(quiet.ctx,'tap'),true);assert.equal((quiet.sources[0].output as Node).gain.value,24,'amplification has a ceiling');
 const silent=context(0);await preloadSoundAssets(silent.ctx);assert.equal(playSoundAsset(silent.ctx,'tap'),false,'silent decoded files retain synth fallback');
}finally{globalThis.fetch=originalFetch;}
console.log('PASS: nine source hashes/mappings, decode/cache reuse, recorded tile routing, shared volume/mute, cleanup, suspended context and per-file failure fallback.');
