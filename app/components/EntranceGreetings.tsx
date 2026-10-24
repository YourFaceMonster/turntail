import {useLayoutEffect,useRef,type CSSProperties} from 'react';
import {ENTRANCE_MS} from '../../lib/atmosphere';
import {openingGreeting,type EntranceCompany} from './EntranceSeats';
import {entranceSeatLayout,greetingPlacement,type CompanyViewport} from '../../lib/entrance-company';
export default function EntranceGreetings({company,diameter=1900,cx=681,cy=468,stage=0,viewport={width:1363,height:936,overview:.38}}:{company:EntranceCompany,diameter?:number,cx?:number,cy?:number,stage?:number,viewport?:CompanyViewport}){
 const nodes=useRef<(HTMLDivElement|null)[]>([]);
 useLayoutEffect(()=>{
  for(const [i,node] of nodes.current.entries()){
   if(!node)continue;const figure=document.querySelector<HTMLElement>(`.entry-world-seat[data-world-seat="${i}"] .stage-painted-model`);if(!figure)continue;
   const box=figure.getBoundingClientRect();let speech=node.getBoundingClientRect(),top=box.top-speech.height-28;
   if(top<8){
    // Short landscape viewports use the outer margin instead of covering a face.
    const sideSpace=i<company.length/2?box.left-24:viewport.width-box.right-24;node.style.width=`${Math.max(96,Math.min(210,sideSpace,viewport.width-24))}px`;node.style.fontSize=sideSpace<140?'11px':'12px';speech=node.getBoundingClientRect();
    const preferred=i<company.length/2?box.left-speech.width-12:box.right+12,left=Math.max(12,Math.min(viewport.width-speech.width-12,preferred));
    node.style.left=`${left}px`;node.style.setProperty('--bubble-tail',`${Math.max(20,Math.min(speech.width-20,box.left+box.width/2-left))}px`);top=8;
   }
   node.style.top=`${Math.max(8,top)}px`;
  }
 },[company,diameter,cx,cy,stage,viewport.width,viewport.height]);
 return <div className="entrance-greetings">{company.map((p,i)=>{
 const seat=entranceSeatLayout(diameter,cx,cy,i,company.length,!!p.avatar?.startsWith('korean-monster:')||!!p.avatar?.startsWith('stage-portrait:'),stage,viewport,p.avatar?.startsWith('stage-portrait:')?Number(p.avatar.split(':')[1]):undefined),bubble=greetingPlacement(seat.head,viewport,i,company.length,openingGreeting(p.avatar,p.name));
 return <div ref={node=>{nodes.current[i]=node;}} className="intro-speech" data-speaker={p.name} key={p.name+i} style={{left:bubble.left,top:bubble.top,width:bubble.width,'--bubble-tail':`${bubble.tail}px`,'--tail-angle':`${bubble.headX>bubble.left+bubble.tail?60:-60}deg`,'--greeting-delay':`${i*ENTRANCE_MS.shuffle/company.length}ms`,'--greeting-ms':`${ENTRANCE_MS.shuffle/company.length}ms`} as CSSProperties}><span>{openingGreeting(p.avatar,p.name)}</span></div>;
 })}</div>;
}
