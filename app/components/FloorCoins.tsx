'use client';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game';
import {isCoinPickup,publicCoinEvents,queueCoinPresentation,type PublicCoinEvent} from '../../lib/coin-presentation';
import {COIN_AFTER_PICKUP_MS,COIN_DISCOVERY_AFTER_MS,COIN_COLLECT_MS,COIN_CREDIT_MS} from '../../lib/pickup-presentation';
type View=ReturnType<typeof view>;
export type CoinWalletPresentation={id:string,before:number};
type Scene={event:PublicCoinEvent,start:number,end:number,from:{x:number,y:number},to:{x:number,y:number},center:{x:number,y:number}};
let coinPreloaded=false;
export function preloadCoinArtwork(){if(coinPreloaded||typeof Image==='undefined')return;coinPreloaded=true;const img=new Image();img.src='/item-battle-v1/coin-gold-v1.png';}
export function CoinArtwork(){const [loaded,setLoaded]=useState(false);return <span className="turntale-coin-art" data-image-ready={loaded}><span className="coin-art-fallback" aria-hidden="true">☀</span><img src="/item-battle-v1/coin-gold-v1.png" alt="" draggable={false} loading="eager" decoding="async" onLoad={()=>setLoaded(true)}/></span>;}
export function CoinNoticeBody({event,players}:{event:PublicCoinEvent,players:readonly {name:string}[]}){const coin=isCoinPickup(event)?event:null;return <><CoinArtwork/><strong>주화 발견</strong>{coin?<span className="coin-reward-line"><b className="coin-reward-owner">{players[coin.who].name}</b><b className="coin-reward-value">+{coin.amount}P</b></span>:<span>아래층에 드러난 주화</span>}<small className="coin-source-note">{coin?coin.kind==='overlap'?'랜덤 주화 + 마지막 패 보너스':coin.kind==='last'?'마지막 패 보너스':`${coin.layer}층 패에서 획득`:'이 패를 가져가는 사람이 획득해요'}</small></>;}
export function FloorCoinMarker({amount=0}:{amount?:number}){return amount>0?<span className="floor-coin-marker" aria-label={`획득 주화 ${amount}P`} title={`가져오면 +${amount}P`}><CoinArtwork/><b>{amount}</b></span>:null;}
function CoinFlight({scene}:{scene:Scene}){const [delay]=useState(()=>-Math.max(0,Date.now()-scene.start-COIN_COLLECT_MS));return <span className="coin-slow-flight" style={{'--coin-from-x':`${scene.center.x}px`,'--coin-from-y':`${scene.center.y-36}px`,'--coin-to-x':`${scene.to.x}px`,'--coin-to-y':`${scene.to.y}px`,'--coin-flight-ms':`${COIN_CREDIT_MS-COIN_COLLECT_MS}ms`,animationDelay:`${delay}ms`} as CSSProperties} aria-hidden="true"><CoinArtwork/></span>;}
export function FloorCoinEffects({game,onWalletPresentation,onPresentationChange}:{game:View,onWalletPresentation?:(value:CoinWalletPresentation|null)=>void,onPresentationChange?:(pending:boolean)=>void}){
 const events=publicCoinEvents(game.floorCoins),signature=events.map(event=>event.id).join('|'),seen=useRef(new Set(events.map(event=>event.id))),queue=useRef<Scene[]>([]),releaseAt=useRef(0),busy=useRef(false),walletKey=useRef(''),callbacks=useRef({onWalletPresentation,onPresentationChange});callbacks.current={onWalletPresentation,onPresentationChange};
 const [frame,setFrame]=useState<{scene:Scene,now:number}|null>(null);
 useEffect(()=>{preloadCoinArtwork();return()=>{callbacks.current.onWalletPresentation?.(null);callbacks.current.onPresentationChange?.(false);};},[]);
 useLayoutEffect(()=>{
  const fresh=events.filter(event=>!seen.current.has(event.id));
  for(const event of fresh){seen.current.add(event.id);if(event.round!==game.round)continue;const source=document.querySelector(`[data-stack="${event.index}"]`)?.getBoundingClientRect(),board=document.querySelector('.floor-stage')?.getBoundingClientRect();if(!board)continue;
   const target=isCoinPickup(event)?document.querySelector(event.who===game.me?'.own-wallet':`.opponents [data-seat="${event.who}"] .seat-card`)?.getBoundingClientRect():null,center={x:Math.max(100,Math.min(innerWidth-100,board.left+board.width/2)),y:Math.max(90,Math.min(innerHeight-90,board.top+board.height/2))},timing=queueCoinPresentation(event,Math.max(Date.now(),releaseAt.current),queue.current.at(-1)?.end);
   const scene:Scene={event,...timing,center,from:source?{x:source.left+source.width/2,y:source.top+source.height/2}:center,to:target?{x:target.left+target.width/2,y:target.top+target.height/2}:center};queue.current.push(scene);releaseAt.current=Math.max(releaseAt.current,scene.end+(isCoinPickup(event)?COIN_AFTER_PICKUP_MS:COIN_DISCOVERY_AFTER_MS));
  }
  if(!queue.current.length&&Date.now()>=releaseAt.current)return;
  if(!busy.current){busy.current=true;callbacks.current.onPresentationChange?.(true);}
  const holdWallet=(value:CoinWalletPresentation|null)=>{const key=value?.id||'';if(walletKey.current===key)return;walletKey.current=key;callbacks.current.onWalletPresentation?.(value);};
  const tick=()=>{const now=Date.now();while(queue.current.length&&queue.current[0].end<=now)queue.current.shift();const scene=queue.current[0];setFrame(scene&&now>=scene.start?{scene,now}:null);const coin=scene&&isCoinPickup(scene.event)?scene.event:null;holdWallet(coin&&coin.who===game.me&&coin.moneyBefore!==undefined&&now<scene!.start+COIN_CREDIT_MS?{id:coin.id,before:coin.moneyBefore}:null);if(!scene&&now>=releaseAt.current){if(busy.current){busy.current=false;callbacks.current.onPresentationChange?.(false);}return true;}return false;};
  tick();const timer=setInterval(()=>{if(tick())clearInterval(timer);},50);return()=>clearInterval(timer);
 },[signature,game.round,game.me]);
 if(!frame)return null;const {scene,now}=frame,elapsed=now-scene.start,coin=isCoinPickup(scene.event)?scene.event:null,phase=coin&&elapsed>=COIN_CREDIT_MS?'credited':coin&&elapsed>=COIN_COLLECT_MS?'collecting':'discovered';
 return createPortal(<div className="coin-presentation" data-coin-phase={phase} data-coin-event={scene.event.id}>
  {phase==='discovered'&&<span className="coin-source-halo" style={{left:scene.from.x,top:scene.from.y}} aria-hidden="true"/>}
  <div className="coin-discovery-card" style={{left:scene.center.x,top:scene.center.y}} role="status" aria-live="polite" aria-atomic="true"><CoinNoticeBody event={scene.event} players={game.players}/></div>
  {coin&&phase==='collecting'&&<CoinFlight scene={scene}/>}
  {coin&&phase==='credited'&&<strong className="coin-wallet-credit" style={{left:Math.max(40,Math.min(innerWidth-40,scene.to.x)),top:Math.max(14,scene.to.y-25)}}>+{coin.amount}P</strong>}
 </div>,document.body);
}
