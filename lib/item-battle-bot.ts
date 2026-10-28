import {act,view,type Game} from './game';
import {analyzeItemBattleTurn,isItemBattleAI} from './item-battle-plan';
import {useProfessionActive} from './profession-actives';
import {useRpgTacticalItem} from './rpg-items';
import {hpItemShopPending} from './hp-item-shop';
import {itemTurnReadyAt} from './rpg-item-motion';

/** True means this mode owns the turn, including a still-locked turn. Every path
 * executes exactly one real action and preserves the existing presentation lock. */
export function runItemBattleBotTurn(game:Game,now=Date.now()){
 if(!game.hpItemMode||game.hpItemRules!==4||!game.rpgRun?.combat?.itemBattle)return false;
 const who=game.turn;if(!game.players[who]?.bot||game.phase!=='playing'||game.rpgRun.status!=='playing'||now<(game.turnReadyAt||0)||hpItemShopPending(game))return true;
 const position=view(game,game.players[who].token);if(!isItemBattleAI(position))return false;
 const {action}=analyzeItemBattleTurn(position,{now});
 if(action.type==='profession')useProfessionActive(game,who,action.target,now);
 else if(action.type==='item'){
  useRpgTacticalItem(game,action.id,action.target??-1,action.ids||[],who);
  if(game.rpgRun.lastItem)game.turnReadyAt=Math.max(game.turnReadyAt||0,itemTurnReadyAt(game.rpgRun.lastItem,0));
 }else act(game,who,action.type,action.type==='play'?action.tiles.map(tile=>tile.id):[],action.type==='draw'?action.index:-1,now,true);
 return true;
}
