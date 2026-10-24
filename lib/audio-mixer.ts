/** All effects share one persistent gain, including scheduled/ambient sounds. */
const mixers=new WeakMap<AudioContext,GainNode>();
export function effectOutput(ctx:AudioContext){
 let output=mixers.get(ctx);if(!output){output=ctx.createGain();output.gain.value=.8;output.connect(ctx.destination);mixers.set(ctx,output);}return output;
}
export function setEffectVolume(ctx:AudioContext,percent:number,enabled=true){
 const gain=effectOutput(ctx).gain,value=enabled?Math.max(0,Math.min(100,percent))/100:0;
 gain.cancelScheduledValues(ctx.currentTime);gain.setTargetAtTime(value,ctx.currentTime,.015);
}
export function readVolume(value:string|null,fallback:number){const n=value===null?NaN:Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):fallback;}
