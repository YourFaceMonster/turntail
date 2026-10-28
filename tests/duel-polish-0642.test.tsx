import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createHpItemGame} from '../lib/hp-item-mode';
import {buyHpItemLoadout,beginHpItemRound,HP_ITEM_ROUND_ALLOWANCE} from '../lib/hp-item-shop';
import {act,view,chooseBotAction,type Tile} from '../lib/game';
import {rpgItemAvailability,rpgItemsUnlocked,useRpgTacticalItem} from '../lib/rpg-items';
import {resolveHpItemBattle,HP_BATTLE_REVIEW_MS} from '../lib/hp-item-battle';
import {battleTablePresentation} from '../lib/table-play';
import {announcedPlayDuration,comboCaptionDuration,QUICK_PLAY_MS} from '../lib/play-notices';
import {DuelResultBody} from '../app/components/HpBattleReview';
import {RpgHpBar} from '../app/components/RpgHpBar';
import {SwordsmanSlash} from '../app/components/ProfessionActives';
const tile=(n:number,s=0):Tile=>({id:(n-1)*4+s,n,s});
function fresh(){const g=createHpItemGame('검증','',1000,2,'toto','swordsman');buyHpItemLoadout(g,[]);g.turn=0;g.turnReadyAt=0;g.rpgRun!.equipped=[];g.rpgRun!.consumables=[];g.rpgRun!.enemyConsumables={1:[],2:[]};g.floorCoins!.randomTileId=null;return g;}
const wallet=fresh();wallet.hpItemMatch!.points=[31,4,0];wallet.round=3;beginHpItemRound(wallet);assert.deepEqual(wallet.hpItemMatch!.points,[31,4,0]);assert.equal(HP_ITEM_ROUND_ALLOWANCE,0);
for(const round of [1,2,5])for(const seat of [0,1,2]){
 const g=fresh();g.round=round;g.hpItemMatch!.shopRound=round;g.completedBattles=0;g.roundActions=20;g.turn=seat;g.rpgRun!.hp[seat]=70;
 if(seat===0)g.rpgRun!.consumables=['emergency-herb'];else g.rpgRun!.enemyConsumables![seat]=['emergency-herb'];
 assert.equal(rpgItemsUnlocked(g),false);assert.equal(rpgItemAvailability(view(g,g.players[seat].token),'emergency-herb',true).usable,false);
 const before=JSON.stringify(g);assert.throws(()=>useRpgTacticalItem(g,'emergency-herb',undefined,[],seat),/첫 결투/);assert.equal(JSON.stringify(g),before);
 g.completedBattles=1;assert.equal(rpgItemAvailability(view(g,g.players[seat].token),'emergency-herb',true).usable,true);
}
const game=fresh();game.players[0].hand=[tile(3),tile(10)];game.players[1].hand=[tile(4)];game.players[2].hand=[tile(5)];game.trick=[tile(6),tile(6,1)];game.lastBy=1;game.rpgRun!.combat!.professions=['swordsman','rogue','mage'];game.rpgRun!.hp=[90,30,100];
const event=resolveHpItemBattle(game,10000)!;assert.equal(event.actor,1);assert.equal(event.ordinal,1);assert.deepEqual(event.winningTiles,[tile(6),tile(6,1)]);assert.notEqual(event.winningTiles,game.trick);assert.notEqual(event.winningTiles![0],game.trick[0]);
game.trick=[];game.lastBy=null;
assert.deepEqual(battleTablePresentation(game,event,event.at)!.tiles,event.winningTiles);
assert.equal(battleTablePresentation(game,event,event.at+HP_BATTLE_REVIEW_MS),null);
assert.ok(battleTablePresentation(game,event,event.at+100000,true));
assert.equal(battleTablePresentation({...game,round:game.round+1},event,event.at,true),null);
assert.equal(battleTablePresentation(game,{...event,winningTiles:undefined},event.at,true),null);
game.trick=[tile(7)];game.lastBy=2;assert.deepEqual(battleTablePresentation(game,event,event.at,true)!.tiles,[tile(7)]);
const html=renderToStaticMarkup(<DuelResultBody event={{...event,ordinal:7}} players={view(game,game.players[0].token).players}/>);
assert.ok(html.indexOf('7번째 결투')<html.indexOf('data-duel-role="winner"'));
assert.ok(html.indexOf('data-duel-seat="1"')<html.indexOf('페어 전투'));
assert.ok(html.indexOf('페어 전투')<html.indexOf('data-duel-role="loser"'));
assert.equal((html.match(/data-duel-role="loser"/g)||[]).length,2);assert.ok(!html.includes('1등'));
const hp=renderToStaticMarkup(<RpgHpBar hp={10} identity={<strong>검증</strong>} persistentChange change={<em className="negative">−7</em>}/>);
assert.ok(hp.indexOf('/100')<hp.indexOf('hp-change-pinned'));assert.ok(hp.includes('−7'));
assert.ok(renderToStaticMarkup(<SwordsmanSlash impact/>).includes('slash-core'));
assert.equal(announcedPlayDuration(2),2000);assert.equal(announcedPlayDuration(5),3400);assert.equal(comboCaptionDuration('페어'),1100);assert.equal(comboCaptionDuration('풀하우스'),2250);assert.equal(QUICK_PLAY_MS,650);
const decisions=[];
for(const hand of [[tile(3),tile(3,1),tile(9)], [tile(3),tile(3,1),tile(3,2),tile(9)], [3,4,5,6,7,12].map(n=>tile(n))]){
 const g=fresh();g.completedBattles=1;g.trick=[];g.lastBy=null;g.players[0].hand=hand;const position=view(g,g.players[0].token),t=performance.now(),decision=chooseBotAction(position);decisions.push({hand:hand.length,decision,ms:performance.now()-t});assert.equal(decision.type,'play');if(decision.type==='play')assert.ok(decision.tiles.length>1,'leading AI preserves and uses a multi-card group');
 const injected=structuredClone(position);injected.players[1].hand=[tile(2),tile(2,1)];injected.players[2].hand=[tile(15)];(injected.stacks[0] as unknown as {secret:Tile}).secret=tile(1);assert.deepEqual(chooseBotAction(injected),decision,'non-public opponent hands and floor data cannot affect choice');
}
const follow=fresh();follow.players[0].hand=[tile(3),tile(3,1),tile(9)];follow.trick=[tile(1)];follow.lastBy=1;const response=chooseBotAction(view(follow,follow.players[0].token));if(response.type==='play')assert.equal(response.tiles.length,1,'a single trick requires a single response');else assert.equal(response.type,'draw','strategic draws remain legal');
const final=fresh();final.players[0].hand=[tile(7)];final.trick=[];final.lastBy=null;act(final,0,'play',[tile(7).id],-1,20000);assert.equal(final.phase,'ended');assert.deepEqual(final.hpItemMatch!.lastBattle!.winningTiles,[tile(7)]);
console.log('PASS: winner-first ordinal layout, retained public winning tiles, no round allowance, all-round item lock, pinned HP changes, faster small captions and legal multi-card AI without hidden information.');
console.log(JSON.stringify({decisions}));
