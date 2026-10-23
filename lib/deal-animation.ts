import type {Tile} from './game';
export type DealView={me:number,players:{count:number,hand?:Tile[]}[],stacks:{lowerPresent:boolean,upper:boolean,lower?:Tile|null}[],trick?:Tile[]};
export type DealItem={key:string,kind:'own'|'opponent'|'lower'|'upper',selector:string,boundsSelector?:string,tile?:Tile};
/** Only the local player's faces are allowed in the animation plan. */
export function dealPlan(game:DealView):DealItem[]{
 const items:DealItem[]=[];
 const rounds=Math.max(...game.players.map(p=>p.count));
 for(let n=0;n<rounds;n++)for(let seat=0;seat<game.players.length;seat++){
  const p=game.players[seat];if(n>=p.count)continue;
  if(seat===game.me){const t=p.hand?.[n];if(!t)throw Error('내 손패 위치를 확인하지 못했어요.');items.push({key:`own-${t.id}`,kind:'own',selector:`[data-hand="${t.id}"] .tile.face`,tile:t});}
  else items.push({key:`opponent-${seat}-${n}`,kind:'opponent',selector:`[data-seat="${seat}"] .remaining-tile`});
 }
 for(const layer of ['lower','upper'] as const)game.stacks.forEach((s,i)=>{if(layer==='lower'?s.lowerPresent:s.upper)items.push({key:`${layer}-${i}`,kind:layer,selector:`[data-stack="${i}"] .${layer}-tile .tile`,...(layer==='lower'?{boundsSelector:`[data-stack="${i}"]`}:{})});});
 if(items.length!==60)throw Error('처음 배분할 패는 60개여야 해요.');return items;
}
export type DealTarget={x:number,y:number,width:number,height:number,angle:number};
type DealRect={left:number,top:number,width:number,height:number};
type MeasuredTile={rect:DealRect,finish:Record<string,string>};
/** Covered lower tiles are display:none. Their full-size stack is the same landing box. */
export function measureDealLayout(game:DealView,rotation:number,read:(selector:string)=>MeasuredTile|null){
 return dealPlan(game).map(item=>{
  const tile=read(item.selector);let rect=tile?.rect;
  if((!rect||rect.width<=0||rect.height<=0)&&item.boundsSelector)rect=read(item.boundsSelector)?.rect;
  if(!tile||!rect||rect.width<=0||rect.height<=0)throw Error(`Layout pending: ${item.key}`);
  return {item,target:dealTarget(rect,rotation),finish:tile.finish};
 });
}
/** Viewport coordinates, including the app's rotated portrait/landscape stages. */
export function dealTarget(rect:{left:number,top:number,width:number,height:number},angle:number):DealTarget{
 const swap=Math.abs(angle)%180===90;
 return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:swap?rect.height:rect.width,height:swap?rect.width:rect.height,angle};
}
export function shuffleTileSize(kind:DealItem['kind'],target:DealTarget,own:DealTarget){
 // The opponent endpoint is a count badge, not the size of a physical tile.
 const source=kind==='opponent'?own:target;
 return {width:source.width,height:source.height};
}
