import {effectOutput} from './audio-mixer';

/** User-supplied cues. Gain is the target peak before the shared effects bus. */
export const SOUND_ASSETS={
 tap:{src:'/audio/sfx-261028/01-tile-select.mp3',gain:.35},
 submit:{src:'/audio/sfx-261028/02-tile-submit.mp3',gain:.42},
 play:{src:'/audio/sfx-261028/03-tile-land.mp3',gain:.6},
 slam:{src:'/audio/sfx-261028/04-tile-slam.mp3',gain:.75},
 draw:{src:'/audio/sfx-261028/05-tile-draw.mp3',gain:.55},
 turn:{src:'/audio/sfx-261028/06-your-turn.mp3',gain:.42},
 win:{src:'/audio/sfx-261028/07-round-finish.mp3',gain:.6},
 redTwo:{src:'/audio/sfx-261028/09-red-two.mp3',gain:.55},
 victory:{src:'/audio/sfx-261028/15-victory.mp3',gain:.65},
} as const;
export type SoundAssetKind=keyof typeof SOUND_ASSETS;
const decoded=new WeakMap<AudioContext,Map<SoundAssetKind,{buffer:AudioBuffer,gain:number}>>();
const loading=new WeakMap<AudioContext,Promise<void>>();

/** Decode once per context, starting on a user gesture; never delay a game event. */
export function preloadSoundAssets(ctx:AudioContext):Promise<void>{
 if(typeof fetch!=='function'||typeof ctx.decodeAudioData!=='function')return Promise.resolve();
 const pending=loading.get(ctx);if(pending)return pending;
 const buffers=new Map<SoundAssetKind,{buffer:AudioBuffer,gain:number}>();decoded.set(ctx,buffers);
 const ready=Promise.all((Object.keys(SOUND_ASSETS) as SoundAssetKind[]).map(async kind=>{
  try{
   const response=await fetch(SOUND_ASSETS[kind].src);
   if(!response.ok)return;
   const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
   let peak=0;
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel);
    for(let i=0;i<samples.length;i++)peak=Math.max(peak,Math.abs(samples[i]));
   }
   if(peak>0)buffers.set(kind,{buffer,gain:Math.min(24,SOUND_ASSETS[kind].gain/peak)});
  }catch{/* Missing/unsupported audio keeps the existing synthesized cue available. */}
 })).then(()=>{});
 loading.set(ctx,ready);return ready;
}

/** False means the caller should use its existing synth; no late sounds are queued. */
export function playSoundAsset(ctx:AudioContext,kind:SoundAssetKind):boolean{
 if(ctx.state!=='running')return false;
 const asset=decoded.get(ctx)?.get(kind);if(!asset)return false;
 let source:AudioBufferSourceNode|undefined,gain:GainNode|undefined;
 try{
  source=ctx.createBufferSource();gain=ctx.createGain();
  source.buffer=asset.buffer;gain.gain.value=asset.gain;
  source.connect(gain);gain.connect(effectOutput(ctx));
  const playingSource=source,playingGain=gain;
  source.onended=()=>{playingSource.disconnect();playingGain.disconnect();};
  source.start(ctx.currentTime);return true;
 }catch{source?.disconnect();gain?.disconnect();return false;}
}
