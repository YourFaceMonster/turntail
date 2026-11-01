/** Read-only presentation adapter. The Bomb engine remains the source of truth. */
import {view,type Game,type GameEvent,type LegalOption} from './game';
import {bombCombo,bombOptions,bombBeats,type BombState,type BombAction,type Tile} from './bomb-market';
export type BombPublic=Pick<BombState,'revision'|'phase'|'round'|'pot'|'reaction'> & {players:{place:number|null;out:boolean}[]};
export type BombClassicView=ReturnType<typeof view>&{bombMarket:BombPublic};
export function bombClassicOptions(hand:Tile[],trick:Tile[],reaction=false):LegalOption[]{return bombOptions(hand,trick,reaction).map(tiles=>{const c=bombCombo(tiles)!;return {id:tiles.map(t=>t.id).sort((a,b)=>a-b).join(','),label:c.label,tiles,key:[Number(c.bomb),c.size,c.high,c.suit]};}).sort((a,b)=>b.tiles.length-a.tiles.length||a.key[0]-b.key[0]||a.key[2]-b.key[2]||a.id.localeCompare(b.id));}
export function bombCanAct(state:BombPublic|null|undefined,turn:number,now:number){return !!state&&state.phase==='playing'&&state.players[0].place===null&&!state.players[0].out&&(state.reaction?now<state.reaction.deadline:turn===0);}
export function bombCanBuy(state:BombPublic|null|undefined,turn:number,score:number,trick:Tile[]){return !!state&&state.phase==='playing'&&!state.reaction&&turn===0&&state.players[0].place===null&&!state.players[0].out&&score>=3&&trick.length>0;}
export function bombClassicProjection(state:BombState,avatar='',previous?:Game,event?:GameEvent):{source:Game;display:BombClassicView}{
 state=structuredClone(state);
 const canBuy=bombCanBuy(state,state.turn,state.players[0].score,state.trick),result=state.results.at(-1),ended=state.phase!=='playing';
 const source:Game={code:`BOMB-${state.id}`,phase:ended?'ended':'playing',players:state.players.map((p,i)=>({id:`${state.id}:${i}`,token:`bomb-display:${i}`,name:p.name,hand:[...p.hand],points:p.score,bot:i>0,avatar:i?`korean-monster:${i-1}`:avatar,wins:state.results.filter(r=>r.places[i]===1).length,losses:state.results.filter(r=>r.places[i]!==1).length,games:state.results.length})),stacks:Array.from({length:15},(_,i)=>[state.market[i]??null,null]),turn:state.turn,lastBy:state.lastBy,trick:[...state.trick],tablePlay:state.trick.length?{id:`${state.id}:${state.revision}`,tiles:[...state.trick],who:state.lastBy!}:null,log:[...state.log],winner:ended?state.players.findIndex(p=>p.place===1):null,round:state.round,practice:true,capacity:3,cols:5,rows:3,matchMode:'unlimited',matchWinner:null,matchNo:1,rally:0,roundActions:state.revision,turnReadyAt:state.reaction?.deadline||(event?.type==='deal'?(event.at||0)+3000:0),turnDeadline:0,playedTiles:[...state.discard,...state.trick],revealedHands:[],lastEvent:event??previous?.lastEvent??{id:`${state.id}:deal:${state.round}`,type:'deal',who:state.turn,at:0},result:ended&&result?{id:`${state.id}:bomb:${state.round}`,at:0,round:state.round,players:state.players.map((p,i)=>({id:`${state.id}:${i}`,name:p.name,count:p.hand.length,place:result.places[i],delta:result.deltas[i],total:p.score,winner:result.places[i]===1})),transfers:[]}:null};
 const display=view(source,'bomb-display:0');display.stacks.forEach((s,i)=>s.available=canBuy&&!!state.market[i]);
 return {source,display:{...display,bombMarket:{revision:state.revision,phase:state.phase,round:state.round,pot:state.pot,reaction:state.reaction?{...state.reaction}:null,players:state.players.map(p=>({place:p.place,out:p.out}))}}};
}
export function bombClassicEvent(before:BombState,after:BombState,who:number,action:BombAction,now:number):GameEvent|undefined{
 const id=`${after.id}:${after.revision}`;
 if(action.type==='play'){const tiles=before.players[who].hand.filter(t=>action.ids.includes(t.id));return {id,type:'play',who,tiles,label:bombCombo(tiles)!.label,at:now,rally:1,concealed:false,showNotice:true,reviewMs:3000};}
 if(action.type==='buy')return {id,type:'draw',who,index:before.market.findIndex(t=>t.id===action.id),tiles:[before.market.find(t=>t.id===action.id)!],at:now,concealed:false};
 if(action.type==='next')return {id,type:'deal',who:after.turn,at:now};
 return undefined;
}
/** Keep the classic trick area's overall height for runs longer than five cards. */
export function bombPlayedSizing(base:{height:number;width:number},count:number){const rows=Math.ceil(Math.max(1,count)/5),height=Math.max(1,(base.height-2*(rows-1))/rows);return {height,width:base.width*(height/base.height)};}
export function bombLegalSelection(tiles:Tile[],trick:Tile[],reaction:boolean){return bombBeats(tiles,trick)&&(!reaction||!!bombCombo(tiles)?.bomb);}
