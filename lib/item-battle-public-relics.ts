import type {HpItemMatchState} from './hp-item-shop';
import type {HpBattleEvent} from './hp-item-battle';

/** Learn only activation messages already shown to every seat. Never inspect
 * the other player's equipment or infer an unrevealed relic from its absence. */
export function publicBattleRelicIds(state:Pick<HpItemMatchState,'publicRelicIntel'|'battles'>|undefined,seat:number):string[]{
 return [...new Set([...(state?.publicRelicIntel?.[seat]||[]),...(state?.battles||[]).filter(event=>event.actor===seat).flatMap(event=>(event.relics||[]).map(effect=>effect.relicId))])];
}
export function rememberPublicBattleRelics(state:HpItemMatchState,event:HpBattleEvent){
 const ids=[...new Set([...publicBattleRelicIds(state,event.actor),...(event.relics||[]).map(effect=>effect.relicId)])];
 if(ids.length)state.publicRelicIntel={...state.publicRelicIntel,[event.actor]:ids};
}
