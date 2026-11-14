import {effectOutput} from './audio-mixer';

/** 2026-11-14 heavier wood cues, user picked all A (docs/assets/sound-261114.json; 11-08 set kept in public/audio/sfx-261108). Gain is the target peak. */
export const CUE_ASSETS={
 click:{src:'/audio/sfx-261114/ui-click-A.mp3',gain:.3},
 confirm:{src:'/audio/sfx-261114/ui-confirm-A.mp3',gain:.38},
 back:{src:'/audio/sfx-261114/ui-back-A.mp3',gain:.35},
 dialogue:{src:'/audio/sfx-261114/dialogue-next-A.mp3',gain:.28},
 step:{src:'/audio/sfx-261114/map-step-A.mp3',gain:.4},
 pass:{src:'/audio/sfx-261114/pass-A.mp3',gain:.42},
 hit:{src:'/audio/sfx-261114/hp-hit-A.mp3',gain:.62},
 heal:{src:'/audio/sfx-261114/hp-heal-A.mp3',gain:.48},
 item:{src:'/audio/sfx-261114/item-use-A.mp3',gain:.5},
 guard:{src:'/audio/sfx-261114/guard-A.mp3',gain:.5},
 relic:{src:'/audio/sfx-261114/relic-get-A.mp3',gain:.5},
 storyCard:{src:'/audio/sfx-261114/story-card-get-A.mp3',gain:.55},
 clear:{src:'/audio/sfx-261114/stage-clear-A.mp3',gain:.58},
 fail:{src:'/audio/sfx-261114/stage-fail-A.mp3',gain:.52},
} as const;
export type CueKind=keyof typeof CUE_ASSETS;
export function isCueKind(kind:string):kind is CueKind{return Object.prototype.hasOwnProperty.call(CUE_ASSETS,kind);}

const decoded=new WeakMap<AudioContext,Map<CueKind,{buffer:AudioBuffer,gain:number}>>();
const loading=new WeakMap<AudioContext,Promise<void>>();

/** Decode once per context on a user gesture; a missing file only silences that cue. */
export function preloadCues(ctx:AudioContext):Promise<void>{
 if(typeof fetch!=='function'||typeof ctx.decodeAudioData!=='function')return Promise.resolve();
 const pending=loading.get(ctx);if(pending)return pending;
 const buffers=new Map<CueKind,{buffer:AudioBuffer,gain:number}>();decoded.set(ctx,buffers);
 const ready=Promise.all((Object.keys(CUE_ASSETS) as CueKind[]).map(async kind=>{
  try{
   const response=await fetch(CUE_ASSETS[kind].src);if(!response.ok)return;
   const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
   let peak=0;for(let c=0;c<buffer.numberOfChannels;c++){const s=buffer.getChannelData(c);for(let i=0;i<s.length;i++)peak=Math.max(peak,Math.abs(s[i]));}
   if(peak>0)buffers.set(kind,{buffer,gain:Math.min(24,CUE_ASSETS[kind].gain/peak)});
  }catch{/* keep other cues */}
 })).then(()=>{});
 loading.set(ctx,ready);return ready;
}

/** Plays immediately or not at all (never queued late). Returns whether it played. */
export function playCue(ctx:AudioContext,kind:CueKind,delay=0):boolean{
 if(ctx.state!=='running')return false;
 const asset=decoded.get(ctx)?.get(kind);if(!asset)return false;
 try{
  const source=ctx.createBufferSource(),gain=ctx.createGain();
  source.buffer=asset.buffer;gain.gain.value=asset.gain;source.connect(gain);gain.connect(effectOutput(ctx));
  source.onended=()=>{source.disconnect();gain.disconnect();};source.start(ctx.currentTime+Math.max(0,delay));return true;
 }catch{return false;}
}

/** Components cue sounds without prop drilling; the page registers the player (it owns mute/volume). */
let player:((kind:CueKind,delay:number)=>void)|null=null;
export function setCuePlayer(next:typeof player){player=next;}
export function cue(kind:CueKind,delay=0){try{player?.(kind,delay);}catch{}}
const played=new Set<string>();
/** A remounted result screen must not replay its fanfare. */
export function cueOnce(key:string,kind:CueKind,delay=0){if(played.has(key))return;played.add(key);if(played.size>200)played.clear();cue(kind,delay);}
