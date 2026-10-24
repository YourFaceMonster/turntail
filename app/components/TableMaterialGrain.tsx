import {useId} from 'react';
import {nativeTableMaterial,TABLE_GRAIN_PITCH} from '../../lib/table-material';
/** Mirrored native-size grain shares its world origin in the moving and final table. */
export default function TableMaterialGrain({stage,view}:{stage:number,view?:{x:number,y:number,width:number,height:number}}){
 const id=useId().replace(/:/g,''),src=nativeTableMaterial(stage),p=TABLE_GRAIN_PITCH;
 if(!src)return null;
 return <svg className="table-surface-material table-native-grain" viewBox={view?`${view.x} ${view.y} ${view.width} ${view.height}`:undefined} preserveAspectRatio="none" data-grain-stage={stage} data-grain-pitch={p}>
  <defs><pattern id={`${id}-native-grain`} patternUnits="userSpaceOnUse" width={p*2} height={p*2}>{['',`translate(${p*2} 0) scale(-1 1)`,`translate(0 ${p*2}) scale(1 -1)`,`translate(${p*2} ${p*2}) scale(-1 -1)`].map((transform,i)=><image key={i} href={src} width={p} height={p} transform={transform||undefined}/>)}</pattern></defs>
  <rect x={view?.x??0} y={view?.y??0} width="100%" height="100%" fill={`url(#${id}-native-grain)`}/>
 </svg>;
}
