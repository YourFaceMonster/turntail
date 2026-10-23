import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {StageHub} from '../app/components/StageChallenge';
import {SinglePlayerMenu,ResumePicker,NewGameConfirm} from '../app/components/SinglePlayer';
import {StageVisuals} from '../app/components/StageVisuals';
import TileFace from '../app/components/TileFace';
import TileBack from '../app/components/TileBack';
import {createStageGame,startStageRound} from '../lib/stage-game';
import {stageTheme,STAGE_THEMES} from '../lib/stage-theme';
const noop=()=>{},game=createStageGame('점검');
const mode=renderToStaticMarkup(<SinglePlayerMenu normal={noop} challenge={noop} close={noop}/>);assert.ok(mode.includes('일반모드')&&mode.includes('도전모드'));
const resume=renderToStaticMarkup(<ResumePicker slots={['single','stage'].map(mode=>({mode:mode as 'single'|'stage',title:mode,detail:'저장 상태',session:{code:mode,token:mode}}))} errors={[]} choose={noop} close={noop}/>);assert.equal((resume.match(/이어서 하기/g)||[]).length,2);
const confirm=renderToStaticMarkup(<NewGameConfirm mode="stage" detail="STAGE 5 · 1200점" confirm={noop} cancel={noop}/>);assert.ok(confirm.includes('role="alertdialog"')&&confirm.includes('STAGE 5')&&confirm.includes('취소 · 저장된 진행 유지'));
const appearances=new Set<string>(),names=new Set<string>(),backs=new Set<string>();
for(let stage=1;stage<=10;stage++){
 const theme=stageTheme(stage);assert.equal(theme.stage,stage);theme.opponents.forEach(p=>names.add(p.name));
 const hub=renderToStaticMarkup(<StageHub active={game} start={noop} resume={noop} advance={noop} records={noop} abandon={noop} close={noop}/>);assert.equal((hub.match(/class="journey-node /g)||[]).length,10);assert.ok(hub.includes('/turntale-stage-map.png'));
 const face=renderToStaticMarkup(<StageVisuals stage={stage}><TileFace tile={{id:34,n:9,s:2}}/></StageVisuals>);appearances.add(face);assert.ok(face.includes('data-number="9"')&&face.includes('viewBox="0 0 100 132"'));assert.ok(face.includes('x="49" y="79"')&&face.includes('#d4a000'));
 const back=renderToStaticMarkup(<StageVisuals stage={stage}><TileBack/></StageVisuals>);backs.add(back);assert.ok(!back.includes('data-number')&&!back.includes('data-suit'),'backs do not carry hidden information');
 assert.deepEqual(game.players.slice(1).map(p=>p.name),theme.opponents.map(p=>p.name));assert.deepEqual(game.players.slice(1).map(p=>p.avatar),theme.opponents.map(p=>`stage-portrait:${p.portrait}`));
 if(stage<10){game.phase='ended';game.stageRun!.status='stage-clear';game.stageRun!.cleared=stage;game.players[0].points=250+stage;const balance=game.players[0].points;startStageRound(game);assert.equal(game.players[0].points,balance);assert.equal(game.stageRun!.stage,stage+1);}
}
assert.equal(names.size,30);assert.equal(appearances.size,10);assert.equal(backs.size,10);assert.equal(new Set(STAGE_THEMES.map(t=>t.material)).size,10);
const classic=renderToStaticMarkup(<TileFace tile={{id:1,n:9,s:2}}/>);assert.ok(!classic.includes('stage-material-tile'));
console.log('PASS: two mode choices and save choices, explicit replacement dialog, 10 map nodes, 10 material sets, fixed readable faces, secret-neutral backs, 30 stage opponents, score-preserving progression and classic art isolation.');
