import {effectOutput} from './audio-mixer';
import {playTileSound} from './tile-audio';
import type {PrologueCut} from './rpg-prologue';

export type PrologueBed='wind'|'hearth'|'quiet';
/** Which continuous bed a cut sits in; consecutive cuts with the same bed share one sound so it never restarts between cuts. */
export const prologueBedOf=(cut:PrologueCut):PrologueBed=>cut.audio==='wind'?'wind':cut.audio==='quiet'?'quiet':'hearth';

const FADE_IN=.6,FADE_OUT=.5;

/** Fills a loop buffer whose last samples cross-fade into its first, so the loop point has no click. */
function fillSeamless(samples:Float32Array,next:(i:number)=>number){
 const fade=Math.min(Math.floor(samples.length/4),Math.max(1,Math.floor(samples.length*.12)));
 const tail=new Float32Array(fade);
 for(let i=0;i<samples.length;i++)samples[i]=next(i);
 for(let i=0;i<fade;i++)tail[i]=next(samples.length+i);
 for(let i=0;i<fade;i++){const t=i/fade,w=Math.sin(t*Math.PI/2);samples[i]=samples[i]*w+tail[i]*Math.cos(t*Math.PI/2);}
}

/** Continuous original ambient bed (wind or hearth crackle). Fades in, loops seamlessly, fades out on stop. */
export function prologueBed(ctx:AudioContext,bed:PrologueBed,sound=true){
 const nodes:AudioNode[]=[],sources:(AudioBufferSourceNode|OscillatorNode)[]=[];
 const remember=<T extends AudioNode>(node:T)=>{nodes.push(node);return node;};
 let master:GainNode|null=null,stopped=false;
 const stop=()=>{if(stopped)return;stopped=true;const end=ctx.currentTime+FADE_OUT;
  try{if(master){master.gain.setValueAtTime(master.gain.value,ctx.currentTime);master.gain.linearRampToValueAtTime(0,end);}}catch{}
  for(const source of sources){try{source.stop(end+.05);}catch{}}
  setTimeout(()=>{for(const node of nodes){try{node.disconnect();}catch{}}},(FADE_OUT+.15)*1000);};
 if(!sound||bed==='quiet')return stop;
 try{
  const at=ctx.currentTime;master=remember(ctx.createGain());master.gain.setValueAtTime(0,at);master.connect(effectOutput(ctx));
  if(bed==='wind'){
   master.gain.linearRampToValueAtTime(1,at+FADE_IN);
   // 7 s of brown-ish noise, seam cross-faded.
   const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*7),ctx.sampleRate),samples=buffer.getChannelData(0);
   let smooth=0;fillSeamless(samples,()=>{smooth=(smooth+Math.random()*.04-.02)/1.02;return smooth*7;});
   // Low body: steady rumble that breathes slowly.
   const low=remember(ctx.createBufferSource()),lowFilter=remember(ctx.createBiquadFilter()),lowGain=remember(ctx.createGain());
   low.buffer=buffer;low.loop=true;lowFilter.type='lowpass';lowFilter.frequency.value=520;lowGain.gain.value=.17;
   low.connect(lowFilter);lowFilter.connect(lowGain);lowGain.connect(master);
   // Gusts: a band of the same noise whose level and pitch drift on slow, unrelated LFOs.
   const high=remember(ctx.createBufferSource()),band=remember(ctx.createBiquadFilter()),gust=remember(ctx.createGain());
   high.buffer=buffer;high.loop=true;band.type='bandpass';band.frequency.value=780;band.Q.value=.9;gust.gain.value=.07;
   high.connect(band);band.connect(gust);gust.connect(master);
   const lfo=(hz:number,depth:number,target:AudioParam)=>{const osc=remember(ctx.createOscillator()),amount=remember(ctx.createGain());osc.type='sine';osc.frequency.value=hz;amount.gain.value=depth;osc.connect(amount);amount.connect(target);osc.start(at);sources.push(osc);};
   lfo(.071,.06,gust.gain);lfo(.043,.05,lowGain.gain);lfo(.097,260,band.frequency);lfo(.053,120,lowFilter.frequency);
   low.start(at);high.start(at,3.3);sources.push(low,high);
  }else{
   master.gain.linearRampToValueAtTime(.16,at+FADE_IN);
   const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),samples=buffer.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=i%3400<25?(Math.random()-.5)*.6:0;
   const source=remember(ctx.createBufferSource()),filter=remember(ctx.createBiquadFilter());
   source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1200;
   source.connect(filter);filter.connect(master);source.start(at);sources.push(source);
  }
 }catch{stop();}
 return stop;
}

/** Per-cut extras (tile sound, optional tavern motif). With `bed` true it also plays the cut's bed itself (standalone use). */
export function prologueAmbience(ctx:AudioContext,cut:PrologueCut,music:boolean,volume:number,sound=true,bed=true){
 const nodes:AudioNode[]=[],sources:(AudioBufferSourceNode|OscillatorNode)[]=[];
 const remember=<T extends AudioNode>(node:T)=>{nodes.push(node);return node;};
 let stopBed=()=>{};
 const stop=()=>{stopBed();for(const source of sources){try{source.stop();}catch{}}for(const node of nodes)node.disconnect();};
 try{
  const inside=['hearth','tile'].includes(cut.audio),at=ctx.currentTime;
  if(bed&&sound&&cut.audio!=='quiet')stopBed=prologueBed(ctx,prologueBedOf(cut),sound);
  // A restrained original tavern motif, distinct from the menu/game tracks.
  if(inside&&music&&volume>0){
   const bus=remember(ctx.createGain());bus.gain.value=Math.max(0,Math.min(100,volume))/100*.065;bus.connect(ctx.destination);
   const notes=[196,246.94,293.66,246.94,220,261.63,329.63,293.66];
   for(let i=0;i<Math.ceil(cut.duration/1300);i++){
    const tone=remember(ctx.createOscillator()),gain=remember(ctx.createGain()),start=at+i*1.3;
    tone.type='sine';tone.frequency.value=notes[i%notes.length];gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.65,start+.18);gain.gain.exponentialRampToValueAtTime(.001,start+1.8);tone.connect(gain);gain.connect(bus);tone.start(start);tone.stop(start+1.9);sources.push(tone);
   }
  }
  if(sound&&cut.audio==='tile')playTileSound(ctx,'play',{count:1,seed:cut.id});
 }catch{stop();}
 return stop;
}
