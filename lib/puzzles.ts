import {beats,combo,sorted,type Tile} from './game';
import {tr} from './i18n/index.ts';

/**
 * 한 수 퍼즐 (turntail_claude.md 6.1): fixed, verified puzzle states on the real card rules (`beats`/`combo`).
 * One opponent with a face-up hand answers by a fixed rule: the weakest play that beats mine, otherwise pass.
 * Goal: empty my hand within `moves` plays. No drawing from the floor and no red-two special (not used here).
 */
export const pt=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
export type Puzzle={id:string,title:string,hint:string,moves:number,mine:Tile[],theirs:Tile[],/** Opponent's play I must answer first (empty = I lead). */table:Tile[],lesson:string};
export type PuzzleState={mine:Tile[],theirs:Tile[],table:Tile[],used:number,status:'playing'|'won'|'lost',/** Why it was lost, or what the opponent just did. */note:string,lastReply:Tile[]|null};

const keyCmp=(a:number[],b:number[])=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;};
function subsets(hand:Tile[],size:number):Tile[][]{const out:Tile[][]=[];const pick=(start:number,acc:Tile[])=>{if(acc.length===size){out.push(acc);return;}for(let i=start;i<hand.length;i++)pick(i+1,[...acc,hand[i]]);};pick(0,[]);return out;}
/** Every legal play from a hand against the current table (any combo when leading). */
export function legalPlays(hand:Tile[],table:Tile[]):Tile[][]{
 const sizes=table.length?[table.length]:[1,2,3,5];
 return sizes.flatMap(size=>size>hand.length?[]:subsets(hand,size)).filter(play=>beats(play,table));
}
/** The fixed opponent rule: weakest beating play, or null to pass. */
export function opponentReply(theirs:Tile[],table:Tile[]):Tile[]|null{
 const options=legalPlays(theirs,table);if(!options.length)return null;
 return options.sort((a,b)=>keyCmp(combo(a)!.key,combo(b)!.key))[0];
}
export function startPuzzle(p:Puzzle):PuzzleState{return {mine:sorted(p.mine),theirs:sorted(p.theirs),table:[...p.table],used:0,status:'playing',note:'',lastReply:null};}
const without=(hand:Tile[],play:Tile[])=>hand.filter(tile=>!play.some(p=>p.id===tile.id));
export function playPuzzle(p:Puzzle,state:PuzzleState,play:Tile[]):PuzzleState{
 if(state.status!=='playing')throw Error(tr('퍼즐이 끝났어요. 처음부터 다시 해 주세요.'));
 if(!play.length||!play.every(tile=>state.mine.some(m=>m.id===tile.id)))throw Error(tr('내 손패에서 골라 주세요.'));
 if(!beats(play,state.table))throw Error(state.table.length?tr('바닥의 패를 이길 수 있는 조합을 골라 주세요.'):tr('낼 수 있는 조합이 아니에요.'));
 const mine=without(state.mine,play),used=state.used+1;
 if(!mine.length)return {...state,mine,table:play,used,status:'won',note:tr('손패를 모두 비웠어요!'),lastReply:null};
 const reply=opponentReply(state.theirs,play);
 if(!reply){
  const next={...state,mine,table:[],used,lastReply:null,note:tr('상대가 받지 못하고 넘겼어요. 다시 내가 선이에요.')};
  return used>=p.moves?{...next,status:'lost',note:tr('{0}수 안에 비우지 못했어요.',{0:p.moves})}:next;
 }
 const theirs=without(state.theirs,reply);
 if(!theirs.length)return {...state,mine,theirs,table:reply,used,status:'lost',lastReply:reply,note:tr('상대가 먼저 손패를 비웠어요.')};
 if(used>=p.moves)return {...state,mine,theirs,table:reply,used,status:'lost',lastReply:reply,note:tr('{0}수 안에 비우지 못했어요.',{0:p.moves})};
 if(!legalPlays(mine,reply).length)return {...state,mine,theirs,table:reply,used,status:'lost',lastReply:reply,note:tr('상대의 패를 받을 수 있는 조합이 남지 않았어요.')};
 return {...state,mine,theirs,table:reply,used,lastReply:reply,note:tr('상대가 {0}로 받았어요.',{0:tr(combo(reply)!.label)})};
}
/** Winning first plays (exhaustive search); used by tests to prove each puzzle is solvable and has one answer. */
export function winningFirstPlays(p:Puzzle):Tile[][]{
 const wins=(state:PuzzleState):boolean=>state.status==='won'||state.status==='playing'&&legalPlays(state.mine,state.table).some(play=>wins(playPuzzle(p,state,play)));
 const start=startPuzzle(p);return legalPlays(start.mine,start.table).filter(play=>wins(playPuzzle(p,start,play)));
}

const P=(id:string,title:string,lesson:string,hint:string,moves:number,mine:[number,number][],theirs:[number,number][],table:[number,number][]=[]):Puzzle=>
 ({id,title,lesson,hint,moves,mine:mine.map(([n,s])=>pt(n,s)),theirs:theirs.map(([n,s])=>pt(n,s)),table:table.map(([n,s])=>pt(n,s))});
/** Suits: 0 철문, 1 열쇠, 2 성화, 3 왕관 (strength 왕관 > 열쇠 > 성화 > 철문). Every puzzle is checked in tests/puzzles.test.ts. */
export const PUZZLES:readonly Puzzle[]=[
 P('p1',tr('큰 패로 선 잡기'),tr('상대가 받지 못할 패를 먼저 내면 다시 내가 선이에요.'),tr('상대는 한 장뿐이에요. 약한 패를 먼저 내면 상대가 받고 끝내 버려요.'),2,[[4,0],[1,3]],[[8,2]]),
 P('p2',tr('페어로 흐름 끊기'),tr('상대에게 없는 조합을 내면 상대는 넘길 수밖에 없어요.'),tr('상대 손패에는 같은 숫자가 없어요.'),2,[[6,0],[6,2],[12,1]],[[9,0],[13,0]]),
 P('p3',tr('같은 숫자는 문양으로'),tr('숫자가 같으면 왕관 > 열쇠 > 성화 > 철문 순서로 이겨요.'),tr('성화 11을 이기는 11은 하나뿐이에요.'),2,[[11,1],[5,0],[5,2]],[[7,3]],[[11,2]]),
 P('p4',tr('5장 족보 한 방'),tr('풀하우스는 스트레이트보다 강해요. 5장 족보는 5장 족보로만 받을 수 있어요.'),tr('상대의 스트레이트로는 풀하우스를 못 받아요.'),2,[[7,0],[7,2],[7,1],[10,0],[10,2],[3,0]],[[8,0],[9,2],[10,1],[11,0],[12,2],[4,2]]),
 P('p5',tr('트리플 깨뜨리기'),tr('상대가 트리플 하나로 끝내려 할 때는 한 장을 먼저 빼 오게 만들어요.'),tr('내 트리플 3을 바로 내면 상대 트리플 6이 받고 끝나요.'),3,[[3,0],[3,1],[3,3],[4,2],[11,1]],[[6,0],[6,2],[6,1]]),
 P('p6',tr('같은 숫자로 꺼내 오기'),tr('상대는 가장 약하게 이길 수 있는 패로 받아요. 그 버릇을 이용해요.'),tr('상대가 가진 9 세 장 중 하나를 싱글로 꺼내게 해 보세요.'),3,[[8,0],[8,2],[8,1],[9,0],[2,2]],[[9,2],[9,1],[9,3],[14,2]]),
 P('p7',tr('약한 페어가 미끼'),tr('약한 페어로 상대 페어를 끌어낸 뒤, 강한 페어로 받아요.'),tr('강한 페어를 먼저 쓰면 나중에 받을 패가 없어요.'),3,[[4,1],[6,0],[6,2],[10,0],[10,2]],[[8,0],[9,0],[9,1],[9,3]]),
 P('p8',tr('2 페어는 받을 때'),tr('가장 강한 패는 상대의 강한 패를 받을 때까지 아껴요.'),tr('상대의 1 페어를 받을 수 있는 건 2 페어뿐이에요.'),4,[[3,0],[3,2],[9,2],[9,1],[14,3],[2,0],[2,2]],[[8,0],[8,2],[1,0],[1,3]]),
 P('p9',tr('풀하우스 짜기'),tr('여러 페어와 트리플이 있으면 어떤 풀하우스를 만들지가 승부예요.'),tr('상대는 2 페어를 쥐고 있어요. 페어 싸움은 피하는 게 좋아요.'),4,[[4,0],[4,1],[7,3],[11,2],[11,3],[15,0],[15,2],[15,1]],[[8,2],[11,1],[2,0],[2,2]]),
 P('p10',tr('마지막 한 수'),tr('남길 패를 먼저 정하고, 나머지로 족보를 만들어요.'),tr('1 두 장은 따로 남겨 두세요.'),4,[[4,0],[9,0],[9,2],[13,0],[13,1],[13,3],[1,0],[1,1]],[[7,0],[7,2],[1,2],[1,3]]),
];
export function puzzleById(id:string){return PUZZLES.find(p=>p.id===id);}