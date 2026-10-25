'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {eventBanter,idleBanter,type Banter,type BanterTable} from '../../lib/character-banter';
import {seatAccent} from '../../lib/seat-presentation';
import {twinIndex} from '../../lib/rpg-twins';

/** Purely decorative conversation: it never delays a turn or captures a tap. */
export default function CharacterBanter({game,enabled,landscape=false}:{game:BanterTable,enabled:boolean,landscape?:boolean}){
 const previous=useRef(game),latest=useRef(game);latest.current=game;
 const queue=useRef<Banter[]>([]),current=useRef<Banter|null>(null),lastShown=useRef(0),idleSaid=useRef(''),recent=useRef(new Map<string,number>());
 const twinLines=useRef(new Map<string,number>());
 const [line,setLine]=useState<Banter|null>(null),[host,setHost]=useState<Element|null>(null);
 useEffect(()=>{
  const before=previous.current;previous.current=game;
  if(!enabled){queue.current=[];current.current=null;setLine(null);return;}
  const additions=eventBanter(before,game).filter(l=>!['confident','draw'].includes(l.kind)||Date.now()-(recent.current.get(`${l.who}:${l.kind}`)||0)>15000);if(additions.length)queue.current=additions.slice(-2);
 },[game,enabled]);
 useEffect(()=>{
  if(!enabled)return;
  let started=Date.now(),turnKey='',turnAt=Date.now();
  const tick=()=>{
   const now=Date.now(),g=latest.current,key=`${g.code}:${g.round}:${g.lastEvent?.id}:${g.turn}`;
   if(key!==turnKey){turnKey=key;turnAt=now;}
   if(current.current&&now-lastShown.current<2800)return;
   if(current.current){current.current=null;setLine(null);return;}
   if(now-lastShown.current<3700)return;
   let next=queue.current.shift();
   if(!next&&now-started>=18000&&idleSaid.current!==key){const idle=idleBanter(g,now-turnAt);if(idle){next=idle;idleSaid.current=key;}}
   if(next&&twinIndex(g.players[next.who]?.avatar)!==null){const scene=`${g.code}:${g.round}`,count=twinLines.current.get(scene)||0;if(count>=4)next=undefined;else twinLines.current.set(scene,count+1);}
   if(next){current.current=next;lastShown.current=now;recent.current.set(`${next.who}:${next.kind}`,now);setLine(next);}
  };
  const timer=setInterval(tick,250);return()=>{clearInterval(timer);queue.current=[];current.current=null;setLine(null);};
 },[enabled,game.code,game.round]);
 useEffect(()=>{setHost(line?document.querySelector(`[data-seat-dialogue="${line.who}"]`):null);},[line,landscape]);
 if(!enabled||!line||!host)return null;
 return createPortal(<div className="seat-banter" data-speaker-seat={line.who} data-banter-kind={line.kind} data-long-banter={line.text.length>24} style={{borderColor:seatAccent(line.who)}} role="status" aria-live="polite" title={line.text} key={line.id}>{landscape&&<b className="banter-speaker">{game.players[line.who]?.name} · </b>}{line.text}</div>,host);
}
