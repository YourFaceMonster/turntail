import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {furnitureGeometry,projectedFurniture} from '../lib/entrance-furniture';
import TableSurface from '../app/components/TableSurface';
import {nativeTableMaterial} from '../lib/table-material';
for(const diameter of [500,1200,1900,3000]){
 const g=furnitureGeometry(diameter,600,440,0),parts=new Set(g.faces.map(f=>f.part));
 assert.ok(parts.has('classic-turned-pedestal')&&parts.has('classic-carved-apron')&&parts.has('classic-bullnose'));
 assert.equal([...parts].filter(p=>p.startsWith('classic-splayed-foot-')).length,4);assert.equal([...parts].filter(p=>p.startsWith('classic-turned-leg-')).length,4);assert.ok(!g.faces.some(f=>f.part.startsWith('leg-')));
 assert.ok(g.depth>=54);assert.ok(g.faces.every(f=>f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.z<0&&p.z>=-g.height-.001)));
 for(const tilt of [0,.3,.8,1.117]){const projected=projectedFurniture(diameter,600,440,0,{width:1200,height:880,tilt,scale:.4});assert.ok(projected.faces.length<g.faces.length,'hidden turned faces are culled');assert.ok(projected.faces.every(f=>f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))));}
}
const html=renderToStaticMarkup(<TableSurface stage={0} withRim/>);assert.ok(html.includes('classic-table-inlay')&&html.includes(nativeTableMaterial(0)!));
assert.ok(!furnitureGeometry(1900,600,440,2).faces.some(f=>f.part.startsWith('classic-')),'regional furniture retains its own structure');
console.log('PASS: heavy turned pedestal, four broad splayed feet, carved apron, thick rounded rim and restrained inlay; finite bounded geometry with back-face culling, and independent challenge furniture.');
