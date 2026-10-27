import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {StageHub,StageDestinationDialog} from '../app/components/StageChallenge';
import {SinglePlayerMenu,ResumePicker,NewGameConfirm} from '../app/components/SinglePlayer';
import {StageVisuals} from '../app/components/StageVisuals';
import TileFace from '../app/components/TileFace';
import TileBack from '../app/components/TileBack';
import {createStageGame,startStageRound} from '../lib/stage-game';
import {materialTextureCell} from '../lib/stage-texture';
import {BACK_PALETTES} from '../app/components/StageVisuals';
import {stageTheme,STAGE_THEMES} from '../lib/stage-theme';
const noop=()=>{},game=createStageGame('점검');
const currentMap=renderToStaticMarkup(<StageHub active={game} start={noop} resume={noop} advance={noop} records={noop} abandon={noop} close={noop}/>);
assert.equal((currentMap.match(/disabled=""/g)||[]).length,9,'only the first destination is open in a fresh run');
assert.ok(currentMap.includes('map-current-badge')&&currentMap.includes('1스테이지부터'));
const mode=renderToStaticMarkup(<SinglePlayerMenu normal={noop} items={noop} rpg={noop} close={noop}/>);assert.ok(mode.includes('일반모드')&&mode.includes('아이템전')&&mode.includes('RPG 모드')&&!mode.includes('도전'));
const resume=renderToStaticMarkup(<ResumePicker slots={['single','stage'].map(mode=>({mode:mode as 'single'|'stage',title:mode,detail:'저장 상태',session:{code:mode,token:mode}}))} errors={[]} choose={noop} close={noop}/>);assert.equal((resume.match(/이어서 하기/g)||[]).length,1);
const confirm=renderToStaticMarkup(<NewGameConfirm mode="rpg" detail="STAGE 5 · HP 80" confirm={noop} cancel={noop}/>);assert.ok(confirm.includes('role="alertdialog"')&&confirm.includes('STAGE 5')&&confirm.includes('취소 · 저장된 진행 유지'));
const luminance=(hex:string)=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
for(const [base,ink] of BACK_PALETTES){const a=luminance(base),b=luminance(ink);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>8,'back seal has strong contrast against its central field');}
const locked=renderToStaticMarkup(<StageDestinationDialog stage={5} active={game} start={noop} resume={noop} advance={noop} abandon={noop} close={noop}/>);assert.ok(locked.includes('disabled=""')&&locked.includes('앞선 거점을 돌파해 주세요'),'inspecting a locked destination does not permit entry');
const appearances=new Set<string>(),names=new Set<string>(),backs=new Set<string>();
for(let stage=1;stage<=10;stage++){
 const theme=stageTheme(stage);assert.equal(theme.stage,stage);theme.opponents.forEach(p=>names.add(p.name));
 const hub=renderToStaticMarkup(<StageHub active={game} start={noop} resume={noop} advance={noop} records={noop} abandon={noop} close={noop}/>);assert.equal((hub.match(/class="journey-node /g)||[]).length,10);assert.ok(hub.includes('/turntale-stage-map-0515.webp'));
 const face=renderToStaticMarkup(<StageVisuals stage={stage}><TileFace tile={{id:34,n:9,s:2}}/></StageVisuals>);appearances.add(face);assert.ok(face.includes('data-number="9"')&&face.includes('viewBox="0 0 100 132"'));assert.ok(face.includes('x="45" y="65"')&&face.includes('#ee8b23'));
 const popup=renderToStaticMarkup(<StageDestinationDialog stage={stage} active={game} start={noop} resume={noop} advance={noop} abandon={noop} close={noop}/>);assert.ok(popup.includes('role="dialog"')&&popup.includes('journey-popup')&&popup.includes(theme.name)&&popup.includes('id="destination-title"'));theme.opponents.slice(0,2).forEach(p=>assert.ok(popup.includes(p.name)));
 assert.ok(face.includes('/turntale-stage-materials-v2.webp'),'real material texture is part of the tile body');assert.ok(face.includes('stroke="#111720" stroke-width="2.7"'),'numbers have a dark edge');assert.ok(face.includes('scale(.58)'),'regular suits are enlarged');
 const cell=materialTextureCell(stage,2000,800);assert.ok(cell.x>=0&&cell.x+cell.width<=2000&&cell.y>=0&&cell.y+cell.height<=800);assert.equal(cell.width,400);assert.equal(cell.height,400);
 const back=renderToStaticMarkup(<StageVisuals stage={stage}><TileBack/></StageVisuals>);backs.add(back);assert.ok(back.includes(`data-back-design="${stage}"`)&&back.includes(BACK_PALETTES[stage-1][1]));assert.ok(!back.includes('data-number')&&!back.includes('data-suit'),'backs do not carry hidden information');
 assert.deepEqual(game.players.slice(1).map(p=>p.name),theme.opponents.slice(0,2).map(p=>p.name));assert.deepEqual(game.players.slice(1).map(p=>p.avatar),theme.opponents.slice(0,2).map(p=>`stage-portrait:${p.portrait}`));
 if(stage<10){game.phase='ended';game.stageRun!.status='stage-clear';game.stageRun!.cleared=stage;game.players[0].points=250+stage;const balance=game.players[0].points;startStageRound(game);assert.equal(game.players[0].points,balance);assert.equal(game.stageRun!.stage,stage+1);}
}
assert.equal(names.size,30);assert.equal(appearances.size,10);assert.equal(backs.size,10);assert.equal(new Set(STAGE_THEMES.map(t=>t.material)).size,10);
const classic=renderToStaticMarkup(<TileFace tile={{id:1,n:9,s:2}}/>);assert.ok(!classic.includes('stage-material-tile'));
console.log('PASS: 10 destination popups and map nodes, locked-stage entry guard, texture crops, outlined numbers, enlarged suits, 10 high-contrast secret-neutral backs, mode/save selection and approved classic layout and unchanged progression.');
