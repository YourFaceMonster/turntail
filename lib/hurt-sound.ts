import {effectOutput} from './audio-mixer';
/** A brief voiced grunt, synthesized locally; no speech service or audio download. */
export function playHurtGrunt(ctx:AudioContext,seat=0){
 if(ctx.state!=='running')return;
 const now=ctx.currentTime+.008,duration=.34,osc=ctx.createOscillator(),envelope=ctx.createGain();
 osc.type='sawtooth';osc.frequency.setValueAtTime(seat%2?126:174,now);osc.frequency.exponentialRampToValueAtTime(seat%2?82:112,now+.24);
 envelope.gain.setValueAtTime(.0001,now);envelope.gain.exponentialRampToValueAtTime(.14,now+.025);envelope.gain.setValueAtTime(.095,now+.10);envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);envelope.connect(effectOutput(ctx));
 const filters=[{frequency:410,q:5,level:1},{frequency:1050,q:8,level:.44},{frequency:2400,q:7,level:.18}].map(formant=>{
  const filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='bandpass';filter.frequency.setValueAtTime(formant.frequency,now);filter.frequency.exponentialRampToValueAtTime(formant.frequency*.83,now+.25);filter.Q.value=formant.q;gain.gain.value=formant.level;osc.connect(filter);filter.connect(gain);gain.connect(envelope);return {filter,gain};
 });
 const rasp=ctx.createOscillator(),roughness=ctx.createGain();rasp.frequency.value=36;roughness.gain.value=.024;rasp.connect(roughness);roughness.connect(envelope.gain);rasp.start(now);rasp.stop(now+duration);
 osc.onended=()=>{osc.disconnect();rasp.disconnect();roughness.disconnect();filters.forEach(({filter,gain})=>{filter.disconnect();gain.disconnect();});envelope.disconnect();};osc.start(now);osc.stop(now+duration+.015);
}
