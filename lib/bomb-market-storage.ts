import {BOMB_REACTION_MS,bombCombo,bombStandings,type BombState,type Tile} from './bomb-market';
export const BOMB_SAVE_KEY='turntale.bomb-market.save.v1',BOMB_RECORD_KEY='turntale.bomb-market.records.v1';
export type BombStore=Pick<Storage,'getItem'|'setItem'>;
export type BombRecord={id:string;at:number;rounds:number;standings:ReturnType<typeof bombStandings>};
const integer=(n:unknown)=>Number.isSafeInteger(n);
export function validateBombSave(value:unknown):asserts value is BombState{
 const g=value as BombState;
 if(!g||g.schema!==1||g.mode!=='bomb-market'||typeof g.id!=='string'||!g.id||!integer(g.revision)||g.revision<0||!integer(g.round)||g.round<1||g.round>5||!['playing','round-end','complete'].includes(g.phase)||!Array.isArray(g.players)||![3,4].includes(g.players.length))throw Error('폭탄시장전 저장 형식을 확인할 수 없어요. 원본은 보존했어요.');
 const seats=g.players.length;
 if(g.players.some(p=>typeof p.name!=='string'||!integer(p.score)||typeof p.out!=='boolean'||!(p.place===null||Array.from({length:seats},(_,i)=>i+1).includes(p.place))||!Array.isArray(p.hand)))throw Error('참가자 저장 정보가 올바르지 않아요.');
 if(!Array.isArray(g.market)||!Array.isArray(g.discard)||!Array.isArray(g.trick))throw Error('패 저장 정보가 없어요.');
 const tiles:Tile[]=[...g.players.flatMap(p=>p.hand),...g.market.filter((t):t is Tile=>!!t),...g.discard,...g.trick];
 if(tiles.length!==60||new Set(tiles.map(t=>t?.id)).size!==60||tiles.some(t=>!t||!integer(t.id)||t.id<0||t.id>59||t.n!==Math.floor(t.id/4)+1||t.s!==t.id%4)||g.market.length>(seats===4?16:15)||g.trick.length>0&&!bombCombo(g.trick))throw Error('저장된 패에 중복 또는 누락이 있어요.');
 const places=g.players.flatMap(p=>p.place===null?[]:[p.place]);
 const totalPoints=seats*50;if(new Set(places).size!==places.length||!integer(g.turn)||g.turn<0||g.turn>=seats||!integer(g.trickId)||g.trickId<1||!integer(g.pot)||g.pot<0||g.players.reduce((sum,p)=>sum+p.score,g.pot)!==totalPoints||!Array.isArray(g.passed)||new Set(g.passed).size!==g.passed.length||g.passed.some(i=>!integer(i)||i<0||i>=seats)||!(g.lastBy===null||Array.from({length:seats},(_,i)=>i).includes(g.lastBy))||!!g.trick.length!==(g.lastBy!==null))throw Error('트릭 또는 점수 저장 정보가 올바르지 않아요.');
 if(g.reaction&&(!g.trick.length||g.phase!=='playing'||g.reaction.id!==g.revision||!Number.isFinite(g.reaction.startedAt)||g.reaction.deadline-g.reaction.startedAt!==BOMB_REACTION_MS))throw Error('폭탄 반응 저장 정보가 올바르지 않아요.');
 if(!Array.isArray(g.roundStart)||g.roundStart.length!==seats||g.roundStart.some(n=>!integer(n))||g.roundStart.reduce((a,b)=>a+b,0)!==totalPoints||!Array.isArray(g.transfers)||!Array.isArray(g.results)||!Array.isArray(g.log)||g.log.some(s=>typeof s!=='string'))throw Error('정산 저장 정보가 올바르지 않아요.');
 const done=g.phase!=='playing';if((done&&places.length!==seats)||(!done&&(places.length>seats-2||g.players.some(p=>(p.place===null&&p.hand.length===0)||(p.place===1&&p.hand.length!==0))))||g.results.length!==g.round-(done?0:1)||(g.phase==='complete')!==(g.round===5&&done))throw Error('진행 단계 저장 정보가 올바르지 않아요.');
 for(const [i,r] of g.results.entries())if(!r||r.round!==i+1||!Array.isArray(r.places)||r.places.length!==seats||new Set(r.places).size!==seats||r.places.some(n=>!Array.from({length:seats},(_,j)=>j+1).includes(n))||!Array.isArray(r.scores)||r.scores.length!==seats||r.scores.some(n=>!integer(n))||r.scores.reduce((a,b)=>a+b,0)!==totalPoints||!Array.isArray(r.deltas)||r.deltas.length!==seats||r.deltas.some(n=>!integer(n))||!Array.isArray(r.counts)||r.counts.length!==seats||r.counts.some(n=>!integer(n)||n<0)||!Array.isArray(r.transfers))throw Error('판별 정산 기록이 올바르지 않아요.');
}
export function readBombSave(store:BombStore,now=Date.now()):{game:BombState|null;error:string|null}{
 try{const raw=store.getItem(BOMB_SAVE_KEY);if(!raw)return {game:null,error:null};const game:unknown=JSON.parse(raw);validateBombSave(game);const g=structuredClone(game);if(g.reaction){g.revision++;g.reaction={id:g.revision,startedAt:now,deadline:now+BOMB_REACTION_MS};}return {game:g,error:null};}catch(error){return {game:null,error:`${error instanceof Error?error.message:'저장을 읽지 못했어요.'} 저장 원본을 덮어쓰지 않았어요.`};}
}
export function saveBombGame(store:BombStore,g:BombState){validateBombSave(g);store.setItem(BOMB_SAVE_KEY,JSON.stringify(g));}
export function readBombRecords(store:BombStore):BombRecord[]{
 const raw=store.getItem(BOMB_RECORD_KEY);if(!raw)return [];const records:BombRecord[]=JSON.parse(raw);if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||!Number.isFinite(r.at)||r.rounds!==5||!Array.isArray(r.standings)||![3,4].includes(r.standings.length)||r.standings.some(p=>!p||typeof p.name!=='string'||!integer(p.score)||![1,2,3,4].includes(p.place))))throw Error('폭탄시장전 전적을 읽지 못했어요. 원본을 보존했어요.');return records;
}
export function recordBombGame(store:BombStore,g:BombState){if(g.phase!=='complete')return;const records=readBombRecords(store);if(records.some(r=>r.id===g.id))return;store.setItem(BOMB_RECORD_KEY,JSON.stringify([{id:g.id,at:Date.now(),rounds:5,standings:bombStandings(g)},...records]));}
