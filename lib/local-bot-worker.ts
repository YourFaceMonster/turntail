import {botMove,type Game} from './game';
const scope=self as unknown as {onmessage:((e:MessageEvent<Game>)=>void)|null,postMessage:(result:{game:Game}|{error:string})=>void};
scope.onmessage=({data})=>{try{botMove(data);scope.postMessage({game:data});}catch(e){scope.postMessage({error:e instanceof Error?e.message:'AI 진행을 확인해 주세요.'});}};
