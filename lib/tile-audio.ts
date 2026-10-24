import {effectOutput} from './audio-mixer';
export const TILE_ACTION_GAIN=5;
export type TileSoundKind='tap'|'submit'|'play'|'slam'|'draw';
export type TileSoundDetail={count?:number,concealed?:boolean,seed?:string};
export type TileSoundVoice={source:'tone'|'noise',at:number,duration:number,gain:number,frequency:number,endFrequency:number,wave?:OscillatorType};
/** Public action texture only; no hidden tile value or suit is an input. */
export function tileSoundPlan(kind:TileSoundKind,variant:number,detail:TileSoundDetail={}):TileSoundVoice[]{
 const v=((variant%5)+5)%5,tune=[.88,1.04,.96,1.12,1][v],voices:TileSoundVoice[]=[];
 const tone=(at:number,duration:number,gain:number,frequency:number,endFrequency:number,wave:OscillatorType='sine')=>voices.push({source:'tone',at,duration,gain,frequency:frequency*tune,endFrequency:endFrequency*tune,wave});
 const noise=(at:number,duration:number,gain:number,frequency:number)=>voices.push({source:'noise',at,duration,gain,frequency:frequency*tune,endFrequency:frequency*.7*tune});
 if(kind==='draw'){
  noise(0,.06,.065,detail.concealed?950:1250);tone(.02,.07,.055,520,230,'triangle');noise(.055,.15,.045,650+v*60);tone(.18,.15,.095,220+v*12,95);return voices;
 }
 if(kind==='tap'||kind==='submit'){tone(0,.035,kind==='tap'?.018:.026,1100,650,'triangle');noise(.002,.025,.015,1900);return voices;}
 const count=Math.min(5,Math.max(1,detail.count||1)),heavy=kind==='slam';
 for(let i=0;i<count;i++){
  const at=i*.025;noise(at,.04,heavy?.095:.065,1000+v*85);tone(at,heavy?.23:.16,heavy?.18:.125,heavy?155:240+v*12,heavy?62:95);
  tone(at+.002,.09,.06,680+v*40,320,'triangle');
 }
 if(v===1||v===4)tone(.085+count*.018,.05,.018,820,460);
 if(heavy){noise(.02,.1,.026,430);tone(.02,.25,.09,105,48);}
 return voices;
}
const cachedNoise=new WeakMap<AudioContext,AudioBuffer>(),lastVariant=new WeakMap<AudioContext,Map<string,number>>();
export function playTileSound(ctx:AudioContext,kind:TileSoundKind,detail:TileSoundDetail={}){
 if(ctx.state!=='running')return;
 let history=lastVariant.get(ctx);if(!history){history=new Map();lastVariant.set(ctx,history);}
 let hash=0;for(const c of detail.seed||String(ctx.currentTime))hash=(hash*31+c.charCodeAt(0))>>>0;
 let variant=hash%5;if(variant===history.get(kind))variant=(variant+1)%5;history.set(kind,variant);
 const plan=tileSoundPlan(kind,variant,detail),master=ctx.createGain();master.gain.value=(kind==='tap'?2:TILE_ACTION_GAIN)*.95/Math.sqrt(kind==='play'||kind==='slam'?Math.min(5,Math.max(1,detail.count||1)):1);master.connect(effectOutput(ctx));let playing=plan.length;
 let buffer=cachedNoise.get(ctx);if(!buffer){buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.5),ctx.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.72;cachedNoise.set(ctx,buffer);}
 for(const voice of plan){
  const at=ctx.currentTime+.008+voice.at,gain=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type=voice.source==='noise'?'bandpass':'lowpass';filter.Q.value=voice.source==='noise'?.7:.45;filter.frequency.setValueAtTime(voice.source==='noise'?voice.frequency:4200,at);
  let source:OscillatorNode|AudioBufferSourceNode;
  if(voice.source==='noise'){const noise=ctx.createBufferSource();noise.buffer=buffer;source=noise;}
  else{const oscillator=ctx.createOscillator();oscillator.type=voice.wave||'sine';oscillator.frequency.setValueAtTime(voice.frequency,at);oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency,at+voice.duration);source=oscillator;}
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(voice.gain,at+.003);gain.gain.exponentialRampToValueAtTime(.0001,at+voice.duration);
  source.connect(filter);filter.connect(gain);gain.connect(master);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(--playing===0)master.disconnect();};source.start(at);source.stop(at+voice.duration+.005);
 }
}
