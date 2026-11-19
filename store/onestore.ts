import {adPlacement} from '../lib/distribution';
import {setInterstitialProvider} from '../lib/distribution-ads';
import {setStorePaused} from '../lib/store-lifecycle';
type InitResult={err?:string,ringerSilent?:boolean};
type SDK={on:(event:string,handler:()=>void)=>void,initializeAsync:()=>Promise<InitResult>,setLoadingProgress:(value:number)=>void,startGameAsync:()=>Promise<InitResult>,
 ads:{isSupported:(type:'interstitial')=>boolean,loadInterstitial:(input:{placementId:string})=>void,isReadyAsync:(type:'interstitial',id:string)=>Promise<boolean>,showInterstitialAsync:(input:{placementId:string})=>Promise<{status:string}>}};
let sdk:SDK|null=null;
let startRequested=false;
/** Official SDK v1.2.0. Outside the ONE store Android host, the same build is a no-ad preview. */
export async function initializeOneStore(){
 try{
  const url='https://h5sdk.onestore.net/lib/v1.2.0/onestore-h5-sdk.min.js';
  const module=await import(/* @vite-ignore */ url) as {createSDK:()=>SDK};
  const instance=module.createSDK();
  instance.on('pause',()=>setStorePaused(true));instance.on('resume',()=>setStorePaused(false));
  // Game mutations already save synchronously. Flush the latest view on host exit as well.
  instance.on('exit',()=>window.dispatchEvent(new Event('turntale-store-exit')));
  const info=await instance.initializeAsync();if(info.err)return;
  sdk=instance;instance.setLoadingProgress(100);if(startRequested)await startOneStore();
 }catch{sdk=null;}
}
export async function startOneStore(){
 startRequested=true;
 if(!sdk)return;
 try{
  const result=await sdk.startGameAsync();if(result.err)return;
  if(!adPlacement||!sdk.ads.isSupported('interstitial'))return;
  const ads=sdk.ads,id=adPlacement;
  setInterstitialProvider({ready:()=>ads.isReadyAsync('interstitial',id),show:()=>ads.showInterstitialAsync({placementId:id}),preload:()=>ads.loadInterstitial({placementId:id})});
  ads.loadInterstitial({placementId:id});
 }catch{setInterstitialProvider(null);}
}
