/** All effects share one persistent gain, including scheduled/ambient sounds. */
const mixers=new WeakMap<AudioContext,GainNode>();
export function effectOutput(ctx:AudioContext){
 let output=mixers.get(ctx);if(!output){output=ctx.createGain();output.gain.value=.8;if(typeof ctx.createDynamicsCompressor==='function'){const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=10;limiter.ratio.value=6;limiter.attack.value=.002;limiter.release.value=.12;output.connect(limiter);limiter.connect(ctx.destination);}else output.connect(ctx.destination);mixers.set(ctx,output);}return output;
}
export function setEffectVolume(ctx:AudioContext,percent:number,enabled=true){
 const gain=effectOutput(ctx).gain,value=enabled?Math.max(0,Math.min(100,percent))/100:0;
 gain.cancelScheduledValues(ctx.currentTime);gain.setTargetAtTime(value,ctx.currentTime,.015);
}
export function readVolume(value:string|null,fallback:number){const n=value===null?NaN:Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):fallback;}
