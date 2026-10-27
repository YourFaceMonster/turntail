import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {act,assertTurnReady,view,type Tile} from '../lib/game.ts';
import {createHpItemGame} from '../lib/hp-item-mode.ts';
import {buyHpItemLoadout} from '../lib/hp-item-shop.ts';
import {HP_BATTLE_REVIEW_MS,resolveHpItemBattle} from '../lib/hp-item-battle.ts';
import {hpSkillAvailability} from '../lib/hp-item-skills.ts';
import {itemSceneTiming,itemScenePoints,itemProjectileFrames,dartFacingFrames} from '../lib/rpg-item-motion.ts';
import {HpItemResult} from '../app/components/HpItemMatch.tsx';

const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const now=Date.now(),g=createHpItemGame('나','',now,2);
buyHpItemLoadout(g,[]);g.turn=2;g.turnReadyAt=0;g.stacks=Array.from({length:15},()=>[null,null]);
g.players.forEach((p,i)=>{p.hand=[tile(3+i),tile(7+i)];});
g.lastBy=0;g.trick=[tile(12)];g.tablePlay={id:'review-fight',who:0,tiles:g.trick};g.rpgRun!.equipped=[];
act(g,2,'pass',[],undefined,now);
assert.equal(g.turn,0);assert.equal(g.completedBattles,1);assert.deepEqual(g.rpgRun!.hp,[100,99,99]);
assert.equal(g.turnReadyAt,now+HP_BATTLE_REVIEW_MS,'impact beat replaces the ordinary lead notice before manual review');
assert.throws(()=>assertTurnReady(g,now+HP_BATTLE_REVIEW_MS-1));
assert.equal(hpSkillAvailability(g,0,true,now+HP_BATTLE_REVIEW_MS-1).usable,false,'skills cannot interrupt damage review');
assert.doesNotThrow(()=>assertTurnReady(g,now+HP_BATTLE_REVIEW_MS));
const original=g.turnReadyAt;resolveHpItemBattle(g,now+500);assert.equal(g.turnReadyAt,original,'a cleared battle does not extend the pause');

const fatal=createHpItemGame('나','',now,2);buyHpItemLoadout(fatal,[]);fatal.players[0].hand=[tile(10)];fatal.turn=0;fatal.turnReadyAt=0;fatal.trick=[];fatal.lastBy=null;fatal.rpgRun!.hp[1]=1;fatal.rpgRun!.equipped=[];
act(fatal,0,'play',[tile(10).id],undefined,now);
assert.equal(fatal.rpgRun!.status,'complete');assert.ok(fatal.turnReadyAt>=now+HP_BATTLE_REVIEW_MS,'final-card KO has the same readable pause before the result');
const markup=renderToStaticMarkup(createElement(HpItemResult,{game:view(fatal,fatal.players[0].token),busy:false,next:()=>{},restart:()=>{},exit:()=>{}}));
assert.equal((markup.match(/has-identity/g)||[]).length,3,'each result meter contains player identity and total change');
assert.ok(markup.includes('hp-change-float'));assert.ok(!markup.includes('<header>'));

for(const itemId of ['ember-bomb','spark-dart'] as const)for(const [actor,target] of [[0,1],[1,2]]){
 const timing=itemSceneTiming({kind:'blocked',actor,target,itemId});
 assert.equal(timing.impact-timing.shield,80,'the barrier finishes forming at projectile contact for player and AI attacks');
 assert.ok(timing.duration>timing.impact+650,'shield recoil has time to finish');
}
const points=itemScenePoints(430,844,{left:10,top:620,width:210,height:48},{left:220,top:80,width:180,height:50},{left:10,top:160,width:410,height:400});
const frames=itemProjectileFrames(points,true);
assert.ok(String(frames[68].transform).includes(`${points.to.x}px,${points.to.y}px`),'shield contact stays at the exact seat centre');
assert.ok(frames.every(frame=>!String(frame.transform).includes('NaN')));
const facing=dartFacingFrames();
assert.equal(facing[0].transform,'scaleX(1)');assert.equal(facing[3].transform,'scaleX(-1)');
const largest=.10+.58/(2*.84);
assert.ok(Number(facing[1].offset)<largest&&Number(facing[2].offset)>largest,'horizontal flip straddles maximum projectile size without altering its path');

const swapTiming=itemSceneTiming({kind:'blocked',actor:0,target:1,itemId:'swapped-fate'});
assert.equal(swapTiming.impact,680,'a blocked swap still reaches the target quickly');
assert.ok(swapTiming.duration-swapTiming.impact>=900,'the shield and returning tile remain readable');
const swapped=itemProjectileFrames(points,true,true,{contact:swapTiming.impact/swapTiming.duration});
const contact=swapped.find(frame=>frame.offset===swapTiming.impact/swapTiming.duration)!;
assert.ok(String(contact.transform).includes(`${points.to.x}px,${points.to.y}px`),'blocked-swap contact is sampled exactly');
const dartFrames=itemProjectileFrames(points,true,false,{dart:true});
assert.ok(dartFrames.every(frame=>!String(frame.transform).includes('NaN')));
for(const index of [20,35,55,64]){
 const frame=dartFrames[index],next=dartFrames[index+1],coords=(value:Keyframe)=>String(value.transform).match(/translate3d\(([-.\d]+)px,([-.\d]+)px/)!;
 const a=coords(frame),b=coords(next),motion=Math.atan2(Number(b[2])-Number(a[2]),Number(b[1])-Number(a[1]))*180/Math.PI;
 const time=Number(frame.offset),peak=.10+.58/(2*.84),flip=Math.max(0,Math.min(1,(time-(peak-.035))/.07));
 const rotation=Number(String(frame.transform).match(/rotate\(([-.\d]+)deg/)![1]),tip=Math.atan2(-1,1-2*flip)*180/Math.PI+rotation;
 assert.ok(Math.abs(tip-motion)<5,'the needle tip follows its travel tangent');
}

for(const targetLeft of [20,280]){
 const path=itemScenePoints(430,844,{left:160,top:620,width:180,height:48},{left:targetLeft,top:90,width:100,height:50},{left:10,top:170,width:410,height:400});
 const precise=itemProjectileFrames(path,true,false,{dart:true});
 for(let i=12;i<67;i++){const angle=(frame:Keyframe)=>Number(String(frame.transform).match(/rotate\(([-.\d]+)deg/)![1]);assert.ok(Math.abs(angle(precise[i])-angle(precise[i-1]))<45,'a leftward apex cannot cause a spurious full rotation');}
}
console.log('PASS: impact delay, result identity, ward contact, readable swap recoil, tangent-aligned dart and continuous apex rotation');
