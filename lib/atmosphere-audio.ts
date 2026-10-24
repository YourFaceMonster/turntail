import {effectOutput} from './audio-mixer';
/** Quiet, original synthesized room hush and heartbeat; no sampled dialogue. */
export function tensionSound(ctx:AudioContext,level:1|2){
 const sources:AudioScheduledSourceNode[]=[],nodes:AudioNode[]=[];let stopped=false;
 const master=ctx.createGain();master.gain.setValueAtTime(0,ctx.currentTime);master.gain.linearRampToValueAtTime(1,ctx.currentTime+1.2);master.connect(effectOutput(ctx));nodes.push(master);
 const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);
 let smooth=0;for(let i=0;i<data.length;i++){smooth=smooth*.93+(Math.random()*2-1)*.07;data[i]=smooth;}
 const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
 const band=ctx.createBiquadFilter();band.type='bandpass';band.frequency.value=level===2?420:310;band.Q.value=.65;
 const hush=ctx.createGain();hush.gain.value=level===2?.12:.075;noise.connect(band);band.connect(hush);hush.connect(master);
 const sway=ctx.createOscillator(),swayAmount=ctx.createGain();sway.frequency.value=.23;swayAmount.gain.value=.025;sway.connect(swayAmount);swayAmount.connect(hush.gain);
 noise.start();sway.start();sources.push(noise,sway);nodes.push(noise,band,hush,sway,swayAmount);
 function beat(){if(stopped||ctx.state!=='running')return;for(const delay of [0,.2]){
  const o=ctx.createOscillator(),g=ctx.createGain(),at=ctx.currentTime+delay;o.frequency.setValueAtTime(62,at);o.frequency.exponentialRampToValueAtTime(39,at+.16);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(delay?.026:.042,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+.24);o.connect(g);g.connect(master);o.start(at);o.stop(at+.26);o.onended=()=>{o.disconnect();g.disconnect();};
 }}
 const timer=level===2?setInterval(beat,2100):null;if(level===2)beat();
 return ()=>{if(stopped)return;stopped=true;if(timer)clearInterval(timer);const now=ctx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(0,now,.08);for(const source of sources){try{source.stop(now+.35);}catch{}}setTimeout(()=>nodes.forEach(n=>n.disconnect()),400);};
}
/** Short wooden/ivory ticks timed to the decorative shuffle; returns a cancellation hook. */
export function shuffleSound(ctx:AudioContext){
 const nodes:AudioNode[]=[],sources:OscillatorNode[]=[];
 for(let i=0;i<10;i++){
  const o=ctx.createOscillator(),g=ctx.createGain(),at=ctx.currentTime+i*.085;o.type='triangle';o.frequency.setValueAtTime(780+(i%4)*145,at);o.frequency.exponentialRampToValueAtTime(240,at+.045);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.026,at+.003);g.gain.exponentialRampToValueAtTime(.0001,at+.07);o.connect(g);g.connect(effectOutput(ctx));o.start(at);o.stop(at+.08);sources.push(o);nodes.push(o,g);
 }
 const cleanup=setTimeout(()=>nodes.forEach(n=>n.disconnect()),1100);
 return ()=>{clearTimeout(cleanup);sources.forEach(n=>{try{n.stop();}catch{}});nodes.forEach(n=>n.disconnect());};
}
