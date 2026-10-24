'use client';
import {useLayoutEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {tableCircle} from '../../lib/table-world';
import TableSurface from './TableSurface';
import EntranceEnvironment from './EntranceEnvironment';
import {platformGeometry,stageSetting} from '../../lib/stage-setting';
/** This stays mounted under the controls when the entrance layer leaves. */
export default function LiveTableScene({tableSet,rotation,stage,minimumDiameter=0}:{tableSet:number,rotation:number,stage?:number,minimumDiameter?:number}){
 const [circle,setCircle]=useState<ReturnType<typeof tableCircle>|null>(null);
 useLayoutEffect(()=>{
  const el=document.querySelector('.active-table .play-column');if(!el)return;
  const update=()=>{const rect=el.getBoundingClientRect();setCircle(tableCircle(rect,window.innerWidth,window.innerHeight,minimumDiameter));};
  update();const observer=new ResizeObserver(update);observer.observe(el);window.addEventListener('resize',update);
  return()=>{observer.disconnect();window.removeEventListener('resize',update);};
 },[tableSet,stage,rotation,minimumDiameter]);
 if(!circle||typeof document==='undefined')return null;
 const location=stage||0,geometry=platformGeometry(circle.diameter,location),surface=stage||tableSet;
 return createPortal(<div className="live-table-scene" data-scene-stage={location} data-world-kind={stageSetting(location).kind} aria-hidden="true"><EntranceEnvironment stage={stage}/><div className="live-platform-shadow" style={{left:circle.cx-circle.diameter*.54,top:circle.cy-circle.diameter*.48,width:circle.diameter*1.08,height:circle.diameter*1.03}}/><div className="live-round-table" style={{left:circle.cx-circle.diameter/2,top:circle.cy-circle.diameter/2,width:circle.diameter,height:circle.diameter,clipPath:geometry.clip}}><TableSurface stage={surface||undefined} withRim/></div></div>,document.body);
}
