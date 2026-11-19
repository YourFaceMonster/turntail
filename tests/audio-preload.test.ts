import test from 'node:test';
import assert from 'node:assert/strict';
import {preloadSoundAssets,SOUND_ASSETS} from '../lib/sound-assets';
import {preloadCues,CUE_ASSETS} from '../lib/sound-cues';
test('menu sound subset does not download battle cues and later warming reuses cached files',async()=>{
 const prior=globalThis.fetch,urls:string[]=[],ctx={decodeAudioData:async()=>({numberOfChannels:1,getChannelData:()=>new Float32Array([.5])})} as unknown as AudioContext;
 globalThis.fetch=(async input=>{urls.push(String(input));return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)} as Response;}) as typeof fetch;
 try{
  await Promise.all([preloadSoundAssets(ctx,['tap']),preloadCues(ctx,['click','confirm','back','dialogue'])]);
  assert.equal(urls.length,5);assert.ok(!urls.some(url=>url.includes('fanfare')||url.includes('hp-hit')));
  await Promise.all([preloadSoundAssets(ctx),preloadCues(ctx)]);
  assert.equal(urls.length,Object.keys(SOUND_ASSETS).length+Object.keys(CUE_ASSETS).length);
  assert.equal(new Set(urls).size,urls.length);
 }finally{globalThis.fetch=prior;}
});
