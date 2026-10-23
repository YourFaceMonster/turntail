'use client';
import {useLayoutEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {tableCircle} from '../../lib/table-world';
import TableSurface from './TableSurface';
import EntranceEnvironment from './EntranceEnvironment';
/** This stays mounted under the controls when the entrance layer leaves. */
export default function LiveTableScene({tableSet,rotation,stage}:{tableSet:number,rotation:number,stage?:number}){
 const [circle,setCircle]=useState<ReturnType<typeof tableCircle>|null>(null);
 useLayoutEffect(()=>{
  const el=document.querySelector('.active-table .play-column');if(!el)return;
  const update=()=>{const rect=el.getBoundingClientRect();setCircle(tableCircle(rect,window.innerWidth,window.innerHeight));};
  update();const observer=new ResizeObserver(update);observer.observe(el);window.addEventListener('resize',update);
  return()=>{observer.disconnect();window.removeEventListener('resize',update);};
 },[tableSet,rotation]);
 if(!circle||typeof document==='undefined')return null;
 return createPortal(<div className="live-table-scene" aria-hidden="true"><EntranceEnvironment stage={stage}/><div className="live-round-table" style={{left:circle.cx-circle.diameter/2,top:circle.cy-circle.diameter/2,width:circle.diameter,height:circle.diameter}}><TableSurface stage={tableSet||undefined} withRim/></div></div>,document.body);
}
