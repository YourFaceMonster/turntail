import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {stagePreviewLayout} from '../lib/stage-preview-layout';
import {entranceSeatLayout} from '../lib/entrance-company';
import {STAGE_THEMES} from '../lib/stage-theme';
import {stageModel} from '../lib/stage-models';
import EntranceSeats from '../app/components/EntranceSeats';
import {projectEntrancePoint} from '../lib/entrance-gpu';
for(const [width,height] of [[320,340],[390,540],[570,230],[844,550],[1200,650]])for(const above of [false,true]){
 const layout=stagePreviewLayout(width,height,above),{camera,shift,diameter,cx,cy,overview}=layout,b=layout.bounds;
 assert.ok(b.left>=layout.padding-1e-5&&b.top>=layout.padding-1e-5&&b.right<=width-layout.padding+1e-5&&b.bottom<=height-layout.padding+1e-5,'all table supports and figures fit inside the dedicated viewport');
 const heights:number[]=[];
 for(const theme of STAGE_THEMES)for(const [index,p] of theme.opponents.slice(0,2).entries()){
  const seat=entranceSeatLayout(diameter,cx,cy,index,2,true,theme.stage,{width,height,overview},p.portrait),model=stageModel(p.portrait);heights.push(seat.height);assert.ok(Math.abs(seat.width/seat.height-model.rect[2]/model.rect[3])<1e-9,'sprite retains its original proportions');
  if(!above)for(const x of [seat.left,seat.left+seat.width])for(const z of [-seat.support,seat.height-seat.support]){const point=projectEntrancePoint(x,seat.top+seat.height,z,{width,height,...camera});assert.ok(point.x+shift.x>=layout.padding-1e-5&&point.x+shift.x<=width-layout.padding+1e-5&&point.y+shift.y>=layout.padding-1e-5&&point.y+shift.y<=height-layout.padding+1e-5);}
 }
 assert.ok(heights.every(h=>Math.abs(h-heights[0])<1e-9),'all twenty region characters use one body height independent of the table material');
}
for(const theme of STAGE_THEMES){
 const company=theme.opponents.slice(0,2).map(p=>({name:p.name,avatar:`stage-portrait:${p.portrait}`,count:10,points:200})),html=renderToStaticMarkup(<EntranceSeats company={company} diameter={1200} cx={640} cy={360} stage={theme.stage}/>);
 assert.equal((html.match(/data-facing="left"/g)||[]).length,1);assert.equal((html.match(/data-facing="right"/g)||[]).length,1);assert.equal((html.match(/scaleX\(-1\)/g)||[]).length,1);assert.ok(html.includes('preserveAspectRatio="xMidYMax meet"'));assert.ok(company.every(p=>html.includes(p.name)));
}
console.log('PASS: twenty equal-height unstretched figures, image-only right-hand mirroring, and complete table/cast bounds across portrait, landscape and overhead previews.');
