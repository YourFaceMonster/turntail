import {planShuffle,type ShuffleSize,type ShuffleScene} from './shuffle-motion';
type Request={seed:number,width:number,height:number,sizes:ShuffleSize[]};
const scope=self as unknown as {onmessage:((e:MessageEvent<Request>)=>void)|null,postMessage:(result:{scene:ShuffleScene}|{error:string})=>void};
scope.onmessage=({data})=>{
 try{const planner=planShuffle(data.seed,data.width,data.height,data.sizes);let result=planner.next();while(!result.done)result=planner.next();scope.postMessage({scene:result.value});}
 catch(error){scope.postMessage({error:error instanceof Error?error.message:'Unable to prepare shuffle'});}
};
