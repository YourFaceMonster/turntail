'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {eventBanter,idleBanter,type Banter,type BanterTable} from '../../lib/character-banter';

/** Purely decorative conversation: it never delays a turn or captures a tap. */
export default function CharacterBanter({game,enabled}:{game:BanterTable,enabled:boolean}){
 const previous=useRef(game),latest=useRef(game);latest.current=game;
 const queue=useRef<Banter[]>([]),current=useRef<Banter|null>(null),lastShown=useRef(0),idleSaid=useRef(''),recent=useRef(new Map<string,number>());
 const [line,setLine]=useState<Banter|null>(null),[position,setPosition]=useState<{left:number,top:number,width:number}|null>(null);
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
   if(current.current&&now-lastShown.current<3200)return;
   if(current.current){current.current=null;setLine(null);return;}
   if(now-lastShown.current<3700)return;
   let next=queue.current.shift();
   if(!next&&now-started>=18000&&idleSaid.current!==key){const idle=idleBanter(g,now-turnAt);if(idle){next=idle;idleSaid.current=key;}}
   if(next){current.current=next;lastShown.current=now;recent.current.set(`${next.who}:${next.kind}`,now);setLine(next);}
  };
  const timer=setInterval(tick,250);return()=>{clearInterval(timer);queue.current=[];current.current=null;setLine(null);};
 },[enabled,game.code,game.round]);
 useEffect(()=>{
  if(!line)return;const update=()=>{const r=document.querySelector(`.opponents [data-seat="${line.who}"] .seat-card`)?.getBoundingClientRect();if(r){const width=Math.min(230,window.innerWidth-24),left=Math.max(12,Math.min(window.innerWidth-width-12,r.left+r.width/2-width/2));setPosition({left,top:r.bottom+5,width});}};
  update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);
 },[line]);
 if(!enabled||!line||!position||typeof document==='undefined')return null;
 return createPortal(<div className="character-banter" data-banter-kind={line.kind} style={position} role="status" aria-live="polite" key={line.id}><small>{game.players[line.who].name}</small><span>{line.text}</span></div>,document.body);
}
