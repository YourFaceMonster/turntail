import {effectOutput} from './audio-mixer';
import {playTileSound} from './tile-audio';
import type {PrologueCut} from './rpg-prologue';

/** Small original ambient bed. No media downloads, autoplay dependency or save state. */
export function prologueAmbience(ctx:AudioContext,cut:PrologueCut,music:boolean,volume:number,sound=true){
 const nodes:AudioNode[]=[],sources:(AudioBufferSourceNode|OscillatorNode)[]=[];
 const remember=<T extends AudioNode>(node:T)=>{nodes.push(node);return node;};
 const stop=()=>{for(const source of sources){try{source.stop();}catch{}}for(const node of nodes)node.disconnect();};
 try{
  const inside=['hearth','tile'].includes(cut.audio),at=ctx.currentTime;
  if(sound&&cut.audio!=='quiet'){
   const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),samples=buffer.getChannelData(0);
   let smooth=0;for(let i=0;i<samples.length;i++){smooth=(smooth+Math.random()*.04-.02)/1.02;samples[i]=inside?(i%3400<25?(Math.random()-.5)*.6:0):smooth*7;}
   const source=remember(ctx.createBufferSource()),filter=remember(ctx.createBiquadFilter()),gain=remember(ctx.createGain());
   source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=inside?1200:550;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(inside?.16:.24,at+.6);
   source.connect(filter);filter.connect(gain);gain.connect(effectOutput(ctx));source.start();sources.push(source);
  }
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
