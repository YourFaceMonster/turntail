import assert from 'node:assert/strict';
import {effectOutput} from '../lib/audio-mixer';
import {shuffleSound} from '../lib/atmosphere-audio';
const original={setTimeout,clearTimeout};let serial=0;const timeouts=new Map<number,()=>void>();
(globalThis as any).setTimeout=(fn:()=>void)=>{const id=++serial;timeouts.set(id,fn);return id;};
(globalThis as any).clearTimeout=(id:number)=>timeouts.delete(id);
class Param{value=0;setValueAtTime(){}exponentialRampToValueAtTime(){}}
class Node{gain=new Param();frequency=new Param();stops=0;disconnected=false;connect(){}disconnect(){this.disconnected=true;}start(){}stop(){this.stops++;}}
const made:Node[]=[],make=()=>{const n=new Node();made.push(n);return n;};
const ctx={currentTime:0,state:'running',destination:{},createGain:make,createOscillator:make} as unknown as AudioContext;
try{const stop=shuffleSound(ctx);assert.ok(made.some(n=>n.stops===1));stop();assert.equal(timeouts.size,0);assert.ok(made.filter(n=>(n as unknown)!==effectOutput(ctx)).every(n=>n.disconnected));console.log('PASS: scheduled shuffle sounds cancel/disconnect while the shared effects bus persists.');}finally{Object.assign(globalThis,original);}
