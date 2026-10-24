import {effectOutput} from './audio-mixer';
/** Short wooden/ivory ticks timed to the decorative shuffle; returns a cancellation hook. */
export function shuffleSound(ctx:AudioContext){
 const nodes:AudioNode[]=[],sources:OscillatorNode[]=[];
 for(let i=0;i<10;i++){
  const o=ctx.createOscillator(),g=ctx.createGain(),at=ctx.currentTime+i*.085;o.type='triangle';o.frequency.setValueAtTime(780+(i%4)*145,at);o.frequency.exponentialRampToValueAtTime(240,at+.045);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.026,at+.003);g.gain.exponentialRampToValueAtTime(.0001,at+.07);o.connect(g);g.connect(effectOutput(ctx));o.start(at);o.stop(at+.08);sources.push(o);nodes.push(o,g);
 }
 const cleanup=setTimeout(()=>nodes.forEach(n=>n.disconnect()),1100);
 return ()=>{clearTimeout(cleanup);sources.forEach(n=>{try{n.stop();}catch{}});nodes.forEach(n=>n.disconnect());};
}
