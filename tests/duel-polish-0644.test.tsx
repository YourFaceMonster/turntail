import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame,readHpItemArchive,saveHpItemGame,HP_ITEM_SHOP_STORAGE_KEY} from '../lib/hp-item-mode';
import {beginHpItemRound,buyHpItemLoadout} from '../lib/hp-item-shop';
import {itemBattleVisualStage,newItemBattleVisualStage,validItemBattleStage,mageSpellPresentation,PROFESSION_SKILL_IMAGES} from '../lib/item-battle-visuals';
import {publicBattleRelicIds} from '../lib/item-battle-public-relics';
import {resolveHpItemBattle} from '../lib/hp-item-battle';
import {analyzeItemBattleTurn} from '../lib/item-battle-plan';
import {view,type Tile} from '../lib/game';
import {floorCoinReward} from '../lib/floor-coins';
import {PROFESSION_ACTIVES} from '../lib/profession-actives';
import {CoinNoticeBody} from '../app/components/FloorCoins';
import {MageSpellImpact} from '../app/components/ProfessionActives';
import {RpgHpBar} from '../app/components/RpgHpBar';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);}};
const g=createHpItemGame('검증','',1000,2,'toto','swordsman');buyHpItemLoadout(g,[]);
assert.ok(validItemBattleStage(g.hpItemMatch!.visualStage));
for(const value of [undefined,0,11,NaN,1.5,'2'])assert.equal(validItemBattleStage(value),false);
for(let i=0;i<100;i++)assert.ok(validItemBattleStage(newItemBattleVisualStage()));
assert.deepEqual(new Set(Array.from({length:1000},(_,i)=>itemBattleVisualStage('old-save-'+i))),new Set([1,2,3,4,5,6,7,8,9,10]));
g.hpItemMatch!.visualStage=9;const progression=g.rpgRun!.stage,opponents=g.players.slice(1).map(p=>p.name);
saveHpItemGame(storage,g);assert.equal(readHpItemArchive(storage,2).active!.hpItemMatch!.visualStage,9);
beginHpItemRound(g);assert.equal(g.hpItemMatch!.visualStage,9);assert.equal(g.rpgRun!.stage,progression);assert.deepEqual(g.players.slice(1).map(p=>p.name),opponents);
const legacy=structuredClone(g);delete legacy.hpItemMatch;values.set(HP_ITEM_SHOP_STORAGE_KEY,JSON.stringify({version:1,active:legacy,records:[]}));
const legacyStage=readHpItemArchive(storage,2).active!.hpItemMatch!.visualStage;assert.equal(legacyStage,itemBattleVisualStage(g.rpgRun!.id));assert.equal(readHpItemArchive(storage,2).active!.hpItemMatch!.visualStage,legacyStage);
for(const amount of [1,3,5,6,8]){
 const html=renderToStaticMarkup(<CoinNoticeBody event={{id:'coin',round:1,who:1,index:0,layer:1,amount,kind:'random',at:1000}} players={[{name:'나'},{name:'로웬'}]}/>);
 assert.ok(html.includes('주화 발견'));assert.ok(html.includes('로웬'));assert.ok(html.includes('+'+amount+'P'));assert.ok(html.includes('coin-gold-v1.png'));
}
const discovery=renderToStaticMarkup(<CoinNoticeBody event={{id:'discovery',round:1,index:0,at:1000}} players={[{name:'나'}]}/>);assert.ok(!discovery.includes('coin-reward-owner'));
assert.equal(floorCoinReward('rogue'),1);assert.equal(floorCoinReward('mage'),3);
for(const [spent,kind,name] of [[1,'ball','파이어볼'],[2,'ball','파이어볼'],[3,'wave','화염 파동'],[4,'wave','화염 파동'],[5,'wall','파이어월']] as const){
 assert.deepEqual(mageSpellPresentation(spent),{kind,name});assert.ok(renderToStaticMarkup(<MageSpellImpact spent={spent}/>).includes(`data-mage-spell="${kind}"`));
}
assert.deepEqual(PROFESSION_ACTIVES.mage.values,[0,1,2,3,4,6]);
for(const role of ['swordsman','mage','cleric'] as const)assert.ok(PROFESSION_SKILL_IMAGES[role].endsWith('.png'));
const hp=renderToStaticMarkup(<RpgHpBar hp={10} identity={<b>검증</b>} persistentChange change={<em>−2</em>}/>);assert.match(hp,/<small class="hp-maximum">\/100<span class="hp-change-float hp-change-pinned/);
// Relic knowledge starts empty, even though the other player owns a relic.
g.rpgRun!.equipped=['crimson-fang'];assert.deepEqual(publicBattleRelicIds(g.hpItemMatch,0),[]);
g.lastBy=0;g.trick=[tile(2,3)];g.rpgRun!.hp=[100,100,100];g.turnReadyAt=0;
const event=resolveHpItemBattle(g,10000)!;assert.ok(event.relics?.some(effect=>effect.relicId==='crimson-fang'));
assert.deepEqual(publicBattleRelicIds(g.hpItemMatch,0),['crimson-fang']);
beginHpItemRound(g);assert.deepEqual(publicBattleRelicIds(g.hpItemMatch,0),['crimson-fang'],'public observation survives the next round');
saveHpItemGame(storage,g);assert.deepEqual(publicBattleRelicIds(readHpItemArchive(storage,2).active!.hpItemMatch,0),['crimson-fang']);
g.turn=1;g.lastBy=0;g.trick=[tile(2,3)];g.rpgRun!.hp=[50,10,50];g.rpgRun!.combat!.actives!.gauge=[0,0,0];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.hpItemMatch!.points=[0,0,0];g.hpItemMatch!.battleTiles=[4,0,0];g.completedBattles=1;
const publicPosition=view(g,g.players[1].token),expected=analyzeItemBattleTurn(publicPosition,{auxiliary:false});
const hidden=structuredClone(publicPosition);hidden.rpgRun!.equipped=['sun-sigil','warrior-crest'];hidden.players[0].hand=[tile(1),tile(2)];
assert.deepEqual(analyzeItemBattleTurn(hidden,{auxiliary:false}),expected,'unrevealed opponent equipment and hands do not affect planning');
const forgotten=structuredClone(publicPosition);forgotten.hpItemMatch!.publicRelicIntel={};assert.notEqual(analyzeItemBattleTurn(forgotten,{auxiliary:false}).score,expected.score,'observed public relic affects expected incoming damage');
console.log('PASS: stable random visual stages, old-save migration, combined coin rewards, mage tiers without new levels, HP number anchor, public-only relic memory and fair AI forecasts.');
