import {createRoot} from 'react-dom/client';
import './styles';
declare const __TURNTALE_TARGET__:string;

// Load the store bridge before importing the game. A missing SDK must not break local previews.
async function boot(){
 let start:(()=>Promise<void>)|undefined;
 if(__TURNTALE_TARGET__==='onestore'){
  const bridge=await import('./onestore');
  // The SDK may be unreachable offline; continue the no-ad preview after 4 seconds.
  await Promise.race([bridge.initializeOneStore(),new Promise(resolve=>setTimeout(resolve,4000))]);
  start=bridge.startOneStore;
 }
 const {default:Game}=await import('../app/page');
 createRoot(document.getElementById('root')!).render(<Game/>);
 await start?.();
}
void boot().catch(()=>{document.getElementById('root')!.textContent='게임을 불러오지 못했어요. 새로고침해 주세요.';});
