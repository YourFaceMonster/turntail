import {tableViewportOrigin,nativeTableMaterial} from '../../lib/table-material';
import TableMaterialGrain from './TableMaterialGrain';
/** Render only the visible surface at device resolution, outside the 3D camera's raster layer. */
export default function TableSurfaceViewport({circle,width,height,stage,className=''}:{circle:{cx:number,cy:number,diameter:number},width:number,height:number,stage:number,className?:string}){
 if(!nativeTableMaterial(stage)||!width||!height)return null;
 return <div className={`table-surface-viewport ${stage===0?'viewport-walnut':'viewport-sandstone'} ${className}`} data-native-surface={stage} aria-hidden="true"><TableMaterialGrain stage={stage} view={{...tableViewportOrigin(circle,stage),width,height}}/><div className="viewport-surface-light"/></div>;
}
