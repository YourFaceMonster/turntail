import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {ACHIEVEMENTS,COMPLETION_ACHIEVEMENT,ACHIEVEMENTS_KEY,emptyAchievements,observeAchievements,readAchievements,achievementValue,orderedAchievements} from '../lib/achievements';
import Achievements from '../app/components/Achievements';
import MainMenu from '../app/components/MainMenu';
import {act,room,player,start,view} from '../lib/game';
const bases=ACHIEVEMENTS.filter(a=>!a.completion),meta=ACHIEVEMENTS.at(-1)!;
assert.equal(bases.length,17);assert.equal(meta.id,COMPLETION_ACHIEVEMENT);assert.equal(meta.goal,17);
const state=emptyAchievements();state.unlocked['full-house']=100;state.unlocked['first-round']=200;state.unlocked['secret-sun']=300;
const ordered=orderedAchievements(state);assert.deepEqual(ordered.slice(0,3).map(a=>a.id),['secret-sun','first-round','full-house']);assert.equal(ordered.at(-1)!.id,COMPLETION_ACHIEVEMENT);assert.equal(achievementValue(meta,state),3);
const copy=structuredClone(state);orderedAchievements(state);assert.deepEqual(state,copy,'ordering cannot modify saved progress');
let partial=emptyAchievements();for(const a of bases)if(a.id!=='first-win')partial.unlocked[a.id]=100;
const store=new Map<string,string>([[ACHIEVEMENTS_KEY,JSON.stringify(partial)]]),storage={getItem:(k:string)=>store.get(k)||null,setItem:(k:string,v:string)=>{store.set(k,v);}};
assert.ok(!readAchievements(storage).unlocked[COMPLETION_ACHIEVEMENT],'16 of 17 never unlocks the final medal');
const g=room('LAST-ACHIEVEMENT',player('나'),true,3);g.players.push(player('AI1',true),player('AI2',true));start(g,0);g.turn=0;g.turnReadyAt=0;g.trick=[];g.players[0].hand=[{id:4,n:2,s:0}];act(g,0,'play',[4],-1,0);
const won=observeAchievements(partial,view(g,g.players[0].token));assert.deepEqual(won.earned.map(a=>a.id),['first-win',COMPLETION_ACHIEVEMENT]);assert.equal(achievementValue(meta,won.state),17);assert.equal(orderedAchievements(won.state)[0].id,COMPLETION_ACHIEVEMENT);assert.equal(observeAchievements(won.state,view(g,g.players[0].token)).earned.length,0);
// The new final award is reconciled for players who already earned the original twenty.
partial=emptyAchievements();for(const a of bases)partial.unlocked[a.id]=100;storage.setItem(ACHIEVEMENTS_KEY,JSON.stringify(partial));const reconciled=readAchievements(storage);assert.equal(reconciled.unlocked[COMPLETION_ACHIEVEMENT],100);assert.equal(JSON.parse(store.get(ACHIEVEMENTS_KEY)!).unlocked[COMPLETION_ACHIEVEMENT],100);
const empty=renderToStaticMarkup(<Achievements state={emptyAchievements()} close={()=>{}}/>),earned=renderToStaticMarkup(<Achievements state={state} close={()=>{}}/>);
assert.ok(empty.includes('aria-label="업적"')&&!empty.includes('업적 수첩'));assert.ok(!empty.includes('<nav')&&!empty.includes('achievement-filters'),'a single list without category tabs');assert.equal((empty.match(/data-achievement=/g)||[]).length,18);assert.ok(earned.indexOf('data-achievement="secret-sun"')<earned.indexOf('data-achievement="first-round"'));
for(const a of bases.filter(a=>a.hidden)){assert.ok(!empty.includes(a.title)&&!empty.includes(a.description));}
assert.ok(empty.includes('data-medal="sealed"'));for(const a of bases.filter(a=>!a.hidden))assert.ok(empty.includes(`data-medal="${a.id}"`));
const noop=()=>{},menu=renderToStaticMarkup(<MainMenu single={noop} multi={noop} tutorial={noop} scores={noop} achievements={noop} settings={noop} profile={noop} resume={noop} canResume={false} name="나" avatar=""/>);assert.ok(menu.includes('menu-tool-label">업적')&&!menu.includes('업적 수첩'));
const css=readFileSync('app/globals.css','utf8');assert.ok(css.includes('height:min(720px,calc(var(--stage-height,100dvh) - 24px))!important'));assert.ok(css.includes('.achievements-modal .achievement-list{display:grid'));assert.ok(css.includes("'Noto Serif KR','Batang',Georgia,serif!important"));
console.log('PASS: earned-first stable ordering, fixed achievement cabinet, 18 illustrated entries, no filters, concealed hidden conditions, final-award unlock/deduplication and preservation of pre-existing twenty-award saves.');
