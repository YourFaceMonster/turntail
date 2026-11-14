import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import TileFace from '../app/components/TileFace';
import TileBack from '../app/components/TileBack';
import {StageVisuals} from '../app/components/StageVisuals';
import TableSurface from '../app/components/TableSurface';
import {StageDestinationDialog} from '../app/components/StageChallenge';
import HighScores from '../app/components/HighScores';
import {stagePalette} from '../lib/stage-presentation';
import TableCollection from '../app/components/TableCollection';
import {APP_VERSION} from '../lib/version';
const noop=()=>{},backgrounds=new Set(),surfaces=new Set();
assert.match(APP_VERSION,/^0\.\d+\.\d+$/);assert.equal(JSON.parse(readFileSync('package.json','utf8')).version,APP_VERSION);
for(let stage=1;stage<=10;stage++){
 const render=(small=false)=>renderToStaticMarkup(<StageVisuals stage={stage}><TileFace tile={{id:51,n:13,s:3}} small={small}/></StageVisuals>);
 const resting=render(),moving=render(true);
 for(const art of [resting,moving,renderToStaticMarkup(<StageVisuals stage={stage}><TileBack/></StageVisuals>)]){assert.ok(art.includes('viewBox="0 0 100 132"')&&!art.includes('data-prism="solid"'),'the approved flat silhouette is shared across every region');}
 // The compact prop changes no face art: number, suit, material and prism are shared.
 const normalize=(s:string)=>s.replace(/class="[^"]*"/g,'').replace(/_R_[a-zA-Z0-9_]+/g,'ID');assert.equal(normalize(resting),normalize(moving));
 const surface=renderToStaticMarkup(<StageVisuals stage={stage}><TableSurface/></StageVisuals>);assert.ok(surface.includes(`data-surface-stage="${stage}"`)&&!surface.includes('turntale-stage-materials-v2.webp'));surfaces.add(surface);
 const popup=renderToStaticMarkup(<StageDestinationDialog stage={stage} active={null} start={noop} resume={noop} advance={noop} abandon={noop} close={noop}/>);assert.ok(popup.includes(`--stage-base:${stagePalette(stage).base}`));backgrounds.add(stagePalette(stage).base);
}
assert.equal(backgrounds.size,10);assert.equal(surfaces.size,10);
const global=renderToStaticMarkup(<HighScores close={noop} personal={[]} profileToken="test" name="test" openHistory={noop}/>);assert.ok(global.includes('highscore-modal')&&global.includes('score-results'),'ranking content keeps a dedicated stable region');
const basic=renderToStaticMarkup(<TileFace tile={{id:25,n:7,s:2}}/>),regional=renderToStaticMarkup(<StageVisuals stage={1}><TileFace tile={{id:25,n:7,s:2}}/></StageVisuals>);assert.ok(basic.includes('classic-tile-ornament')&&basic.includes('#ee8b23')&&basic.includes('#8c3e08'));assert.ok(regional.includes('classic-tile-ornament'),'stage materials share the classic suit ornament since 2026-10-27');
const collection=renderToStaticMarkup(<TableCollection selected={0} unlocked={[0]} choose={noop}/>);assert.equal((collection.match(/class="collection-set /g)||[]).length,1);assert.equal((collection.match(/disabled=""/g)||[]).length,0);
console.log('PASS: 0.5.5 version alignment, restored flat resting/moving faces, separate native-size/vector floors, 10 destination palettes and a stable ranking content region.');
