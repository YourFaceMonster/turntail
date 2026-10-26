import {effectOutput} from './audio-mixer';
/** Soft, inharmonic metallic overtones; follows the shared effects volume. */
export function playGuardChime(ctx:AudioContext,strength=1){
 if(ctx.state!=='running')return;
 const now=ctx.currentTime;
 [0,.065,.14].forEach((offset,index)=>[1,1.43,2.09].forEach((ratio,partial)=>{
  const osc=ctx.createOscillator(),gain=ctx.createGain(),at=now+offset;osc.type='sine';osc.frequency.setValueAtTime((1480+index*270)*ratio,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.045*strength/(partial+1),at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+.46);osc.connect(gain);gain.connect(effectOutput(ctx));osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.48);
 }));
}
export function playItemImpact(ctx:AudioContext,small=false){
 if(ctx.state!=='running')return;
 const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=small?'sine':'triangle';osc.frequency.setValueAtTime(small?240:120,now);osc.frequency.exponentialRampToValueAtTime(small?95:34,now+(small?.10:.22));gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(small?.055:.16,now+(small?.006:.009));gain.gain.exponentialRampToValueAtTime(.0001,now+(small?.17:.42));osc.connect(gain);gain.connect(effectOutput(ctx));osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(now);osc.stop(now+(small?.20:.45));
}
