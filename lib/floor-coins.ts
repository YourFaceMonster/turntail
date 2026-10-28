import type {Game,Tile} from './game.ts';
import {COIN_DISCOVERY_MS,COIN_PRESENTATION_MS} from './pickup-presentation.ts';

export type FloorCoinPickup={id:string,round:number,who:number,index:number,layer:1|2,amount:number,kind:'random'|'last'|'overlap',at:number,moneyBefore?:number,moneyAfter?:number};
export type FloorCoinDiscovery={id:string,round:number,index:number,at:number};
/** This object is persisted with the game, never sent directly to a player or AI. */
export type FloorCoinState={version:1,round:number,randomTileId:number|null,lastAwarded:boolean,earned:number[],events:FloorCoinPickup[],lastDiscovery?:FloorCoinDiscovery};
export function hasFloorCoins(game:Pick<Game,'hpItemMode'|'hpItemVariant'|'hpItemRules'|'rpgRun'>){return !!game.hpItemMode&&game.hpItemVariant===2&&game.hpItemRules===4&&!!game.rpgRun?.combat?.itemBattle;}
export function floorCoinReward(profession?:string){return profession==='rogue'?1:3;}
/** Called after the final deal/pioneer swap, or once when resuming a pre-coin save. */
export function prepareFloorCoins(game:Game){
 if(!hasFloorCoins(game)||game.phase!=='playing'||game.floorCoins?.round===game.round)return false;
 const tiles=game.stacks.flat().filter((tile):tile is Tile=>!!tile),random=new Uint32Array(1);if(tiles.length)crypto.getRandomValues(random);
 game.floorCoins={version:1,round:game.round,randomTileId:tiles.length?tiles[random[0]%tiles.length].id:null,lastAwarded:false,earned:game.players.map(()=>0),events:[]};return true;
}
/** No hidden tile ID, location, layer or remaining-coin flag crosses the view boundary. */
export function floorCoinsView(game:Game,who?:number){
 const state=game.floorCoins;if(!hasFloorCoins(game)||state?.round!==game.round)return undefined;
 return {version:state.version,round:state.round,earned:[...state.earned],events:state.events.map(({moneyBefore,moneyAfter,...event})=>({...event,...(event.who===who?{moneyBefore,moneyAfter}:{})})),lastDiscovery:state.lastDiscovery?{...state.lastDiscovery}:undefined};
}
/** Only removing its cover can announce the lower coin. This public event contains no tile identity. */
export function revealFloorCoin(game:Game,index:number,now:number){
 const state=game.floorCoins,stack=game.stacks[index];if(!hasFloorCoins(game)||state?.round!==game.round||stack?.[1]||!stack?.[0]||stack[0].id!==state.randomTileId||state.lastDiscovery)return null;
 const event:FloorCoinDiscovery={id:`${game.lastEvent?.id}:coin-discovery`,round:game.round,index,at:now};state.lastDiscovery=event;
 game.turnReadyAt=Math.max(game.turnReadyAt||0,now+COIN_DISCOVERY_MS);return event;
}
/** A covered lower coin and every upper coin stay hidden, including during scouting. */
export function publicFloorCoinAmount(game:Game,index:number,who:number){
 const state=game.floorCoins,stack=game.stacks[index];if(!hasFloorCoins(game)||state?.round!==game.round||!stack||!stack.some(Boolean))return 0;
 const visibleRandom=!stack[1]&&!!stack[0]&&stack[0].id===state.randomTileId,last=!state.lastAwarded&&game.stacks.reduce((sum,tiles)=>sum+tiles.filter(Boolean).length,0)===1;
 if(last)return 5+(visibleRandom?floorCoinReward(game.rpgRun?.combat?.professions[who]):0);
 return visibleRandom?floorCoinReward(game.rpgRun?.combat?.professions[who]):0;
}
/** The tile has already left the floor. Credit before traps, even on a fatal pickup. */
export function claimFloorCoin(game:Game,who:number,index:number,tile:Tile,layer:1|2,now:number){
 const state=game.floorCoins,wallet=game.hpItemMatch;if(!hasFloorCoins(game)||state?.round!==game.round||!wallet)return null;
 const random=state.randomTileId===tile.id,last=!state.lastAwarded&&!game.stacks.some(tiles=>tiles.some(Boolean));if(!random&&!last)return null;
 const amount=(last?5:0)+(random?floorCoinReward(game.rpgRun?.combat?.professions[who]):0);
 if(random)state.randomTileId=null;if(last)state.lastAwarded=true;
 const moneyBefore=wallet.points[who];wallet.points[who]+=amount;state.earned[who]=(state.earned[who]||0)+amount;
 const event:FloorCoinPickup={id:`${game.lastEvent?.id||game.code+':'+game.round+':'+index}:coin`,round:game.round,who,index,layer,amount,kind:last?random?'overlap':'last':'random',at:now,moneyBefore,moneyAfter:wallet.points[who]};state.events.push(event);game.rpgRun!.updatedAt=now;game.turnReadyAt=Math.max(game.turnReadyAt||0,now+COIN_PRESENTATION_MS);
 game.log=[`${game.players[who].name} · ${last?'마지막 바닥 주화':'바닥 주화'} +${amount}P`,...game.log].slice(0,40);return event;
}
/** A small draw preference uses public rewards and own-hand matches only. */
export function choosePublicCoinDraw(position:{me:number,players:{hand?:Tile[]}[],stacks:{lower:Tile|null,available:boolean,coinAmount?:number}[]},preferred:number,knownTrap:(index:number)=>boolean=()=>false){
 const hand=position.players[position.me]?.hand||[],score=(index:number)=>{const stack=position.stacks[index];return !stack?.available||knownTrap(index)?-Infinity:(stack.coinAmount||0)+(stack.lower?hand.filter(tile=>tile.n===stack.lower!.n).length*3+(stack.lower.n===2?6:0):0);};
 let best=preferred,bestScore=score(preferred);position.stacks.forEach((stack,index)=>{if((stack.coinAmount||0)>0&&score(index)>bestScore){best=index;bestScore=score(index);}});return best;
}
