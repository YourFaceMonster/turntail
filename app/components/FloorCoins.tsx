'use client';
import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {view} from '../../lib/game.ts';
import type {FloorCoinPickup,FloorCoinDiscovery} from '../../lib/floor-coins.ts';
import {COIN_DISCOVERY_MS,COIN_COLLECT_MS,COIN_CREDIT_MS,COIN_PRESENTATION_MS} from '../../lib/pickup-presentation.ts';
type View=ReturnType<typeof view>;
export type CoinWalletPresentation={id:string,before:number};
type Scene={event:FloorCoinPickup|FloorCoinDiscovery,pickup:boolean,from:{x:number,y:number},to:{x:number,y:number},center:{x:number,y:number}};
const isPickup=(event:FloorCoinPickup|FloorCoinDiscovery):event is FloorCoinPickup=>'who' in event;
export function CoinArtwork(){return <img className="turntale-coin-art" src="/item-battle-v1/coin-gold-v1.png" alt="" draggable={false}/>;}
export function CoinNoticeBody({event,players}:{event:FloorCoinPickup|FloorCoinDiscovery,players:readonly {name:string}[]}){const coin=isPickup(event)?event:null;return <><CoinArtwork/><strong>주화 발견</strong>{coin?<span className="coin-reward-line"><b className="coin-reward-owner">{players[coin.who].name}</b><b className="coin-reward-value">+{coin.amount}P</b></span>:<span>이 패를 가져가면 주화를 얻어요</span>}{coin&&coin.kind!=='random'&&<small className="coin-last-note">마지막 패 보너스 포함</small>}</>;}
export function FloorCoinMarker({amount=0}:{amount?:number}){return amount>0?<span className="floor-coin-marker" aria-label={`획득 주화 ${amount}P`} title={`가져오면 +${amount}P`}><CoinArtwork/><b>{amount}</b></span>:null;}
export function FloorCoinEffects({game,onWalletPresentation}:{game:View,onWalletPresentation?:(value:CoinWalletPresentation|null)=>void}){
 const pickup=game.floorCoins?.events.at(-1),discovery=game.floorCoins?.lastDiscovery,event=pickup&&(!discovery||pickup.at>=discovery.at)?pickup:discovery;
 const seen=useRef(event?.id),callback=useRef(onWalletPresentation);callback.current=onWalletPresentation;
 const [scene,setScene]=useState<Scene|null>(null),[clock,setClock]=useState(Date.now());
 useLayoutEffect(()=>{
  if(!event){setScene(null);callback.current?.(null);return;}if(seen.current===event.id)return;seen.current=event.id;
  const collecting=isPickup(event),duration=collecting?COIN_PRESENTATION_MS:COIN_DISCOVERY_MS;if(Date.now()>event.at+duration)return;
  const source=document.querySelector(`[data-stack="${event.index}"]`)?.getBoundingClientRect(),board=document.querySelector('.floor-stage')?.getBoundingClientRect();if(!source||!board)return;
  const target=collecting?document.querySelector(event.who===game.me?'.own-wallet':`.opponents [data-seat="${event.who}"] .seat-card`)?.getBoundingClientRect():null;
  const center={x:Math.max(115,Math.min(innerWidth-115,board.left+board.width/2)),y:Math.max(75,Math.min(innerHeight-75,board.top+board.height/2))};
  setScene({event,pickup:collecting,from:{x:source.left+source.width/2,y:source.top+source.height/2},to:target?{x:target.left+target.width/2,y:target.top+target.height/2}:center,center});setClock(Date.now());
  if(collecting&&event.who===game.me&&event.moneyBefore!==undefined)callback.current?.({id:event.id,before:event.moneyBefore});
  const tick=setInterval(()=>setClock(Date.now()),70),credit=setTimeout(()=>callback.current?.(null),Math.max(0,event.at+COIN_CREDIT_MS-Date.now())),done=setTimeout(()=>{setScene(null);callback.current?.(null);},Math.max(0,event.at+duration-Date.now()));
  return()=>{clearInterval(tick);clearTimeout(credit);clearTimeout(done);callback.current?.(null);};
 },[event?.id,game.me]);
 if(!scene||clock<scene.event.at)return null;
 const elapsed=clock-scene.event.at,collecting=scene.pickup&&elapsed>=1100,credited=scene.pickup&&elapsed>=COIN_CREDIT_MS,coin=scene.pickup?scene.event as FloorCoinPickup:null;
 const phase=credited?'credited':collecting?'collecting':'discovered';
 return createPortal(<div className="coin-presentation" data-coin-phase={phase}>
  <span className="coin-source-halo" style={{left:scene.from.x,top:scene.from.y}} aria-hidden="true"><CoinArtwork/></span>
  <div className="coin-discovery-card" style={{left:scene.center.x,top:scene.center.y}} role="status" aria-live="polite" aria-atomic="true">
   <CoinNoticeBody event={scene.event} players={game.players}/>
  </div>
  {coin&&elapsed>=COIN_COLLECT_MS&&elapsed<COIN_CREDIT_MS&&<span className="coin-slow-flight" style={{'--coin-from-x':`${scene.center.x}px`,'--coin-from-y':`${scene.center.y}px`,'--coin-to-x':`${scene.to.x}px`,'--coin-to-y':`${scene.to.y}px`,'--coin-flight-ms':`${COIN_CREDIT_MS-COIN_COLLECT_MS}ms`} as CSSProperties} aria-hidden="true"><CoinArtwork/></span>}
  {coin&&credited&&<strong className="coin-wallet-credit" style={{left:Math.max(40,Math.min(innerWidth-40,scene.to.x)),top:Math.max(14,scene.to.y-25)}}>+{coin.amount}P</strong>}
 </div>,document.body);
}
