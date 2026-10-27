import type {CSSProperties} from 'react';
import {itemImage} from '../../lib/rpg-items.ts';
// Visible alpha bounds, rather than source-canvas size, set the shared display scale.
const fit:Record<string,{scale:number,x:number,y:number}>={
 'scout-lens':{scale:1.018,x:-.79,y:1.72},'swapped-fate':{scale:.986,x:-1.41,y:-1.16},'ward-seal':{scale:.94,x:-1.47,y:-.12},
 'ember-bomb':{scale:1.014,x:-5.81,y:.13},'emergency-herb':{scale:.932,x:-1.82,y:.49},'whisper-eye':{scale:.937,x:-2.1,y:.18},
};
export default function RpgItemIcon({id}:{id:string}){const art=fit[id]||{scale:1,x:0,y:0};return <span className="rpg-item-icon" aria-hidden="true"><img src={itemImage(id)} alt="" draggable={false} style={{transform:`translate(${art.x}%,${art.y}%) scale(${art.scale})`} as CSSProperties}/></span>;}
