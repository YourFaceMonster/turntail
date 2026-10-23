import assert from 'node:assert/strict';
import {tensionSound,shuffleSound} from '../lib/atmosphere-audio.ts';
const original={setInterval,clearInterval,setTimeout,clearTimeout};
let serial=0;const intervals=new Map<number,()=>void>(),timeouts=new Map<number,()=>void>();
(globalThis as any).setInterval=(fn:()=>void)=>{const id=++serial;intervals.set(id,fn);return id;};
(globalThis as any).clearInterval=(id:number)=>intervals.delete(id);
(globalThis as any).setTimeout=(fn:()=>void)=>{const id=++serial;timeouts.set(id,fn);return id;};
(globalThis as any).clearTimeout=(id:number)=>timeouts.delete(id);
class Param{value=0;targets:number[]=[];setValueAtTime(n:number){this.value=n;}linearRampToValueAtTime(n:number){this.value=n;}exponentialRampToValueAtTime(n:number){this.value=n;}cancelScheduledValues(){}setTargetAtTime(n:number){this.targets.push(n);}}
class Node{gain=new Param();frequency=new Param();Q=new Param();stops=0;disconnected=false;onended:(()=>void)|null=null;connect(){}disconnect(){this.disconnected=true;}start(){}stop(){this.stops++;this.onended?.();}}
const made:Node[]=[];const make=()=>{const n=new Node();made.push(n);return n;};
const fake={currentTime:0,sampleRate:8000,state:'running',destination:{},createGain:make,createOscillator:make,createBufferSource:make,createBiquadFilter:make,createBuffer:(_channels:number,length:number)=>({getChannelData:()=>new Float32Array(length)})};
const ctx=fake as unknown as AudioContext;
try{
 const stopQuiet=tensionSound(ctx,1);assert.equal(intervals.size,0,'three remaining tiles do not start a heartbeat loop');stopQuiet();stopQuiet();assert.deepEqual(made[0].gain.targets,[0],'mute fades once');
 for(const fn of timeouts.values())fn();timeouts.clear();assert.ok(made.every(n=>n.disconnected));made.length=0;
 const stopCritical=tensionSound(ctx,2);assert.equal(intervals.size,1);const before=made.length;for(const fn of intervals.values())fn();assert.ok(made.length>before,'critical state produces periodic beats');
 fake.state='suspended';const suspendedCount=made.length;for(const fn of intervals.values())fn();assert.equal(made.length,suspendedCount,'no new beats while audio context is suspended');
 stopCritical();assert.equal(intervals.size,0,'leaving/muting stops the heartbeat scheduler');for(const fn of timeouts.values())fn();timeouts.clear();assert.equal(made[0].disconnected,true,'room mix disconnects after fade');
 made.length=0;fake.state='running';const stopShuffle=shuffleSound(ctx);assert.ok(made.some(n=>n.stops===1));stopShuffle();assert.equal(timeouts.size,0);assert.ok(made.every(n=>n.disconnected),'muting cancels future shuffle ticks');
 console.log('PASS: quiet/critical sound lifecycle, heartbeat cancellation, suspended context, fade-out teardown, shuffle cancellation.');
}finally{Object.assign(globalThis,original);}
