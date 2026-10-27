import type {Game} from './game.ts';
/** Remove retired equipment once; unused darts return their purchase currency. */
export function retireLegacyLoadout(game:Game){
 const run=game.rpgRun;if(!run)return;
 if(game.hpItemMatch)delete game.hpItemMatch.skills;
 const remove=(items:string[],seat:number)=>{
  const count=items.filter(id=>id==='spark-dart').length;if(!count)return items;
  if(game.hpItemMode&&game.hpItemMatch)game.hpItemMatch.points[seat]+=count*4;
  else if(seat===0)run.coins+=count*20;
  return items.filter(id=>id!=='spark-dart');
 };
 run.consumables=remove(run.consumables,0);
 for(const [seat,items] of Object.entries(run.enemyConsumables||{}))run.enemyConsumables![Number(seat)]=remove(items,Number(seat));
 run.shops=(run.shops||[]).map(shop=>({...shop,stock:shop.stock.filter(item=>item.id!=='spark-dart')}));
 if(run.lastItem?.itemId==='spark-dart')delete run.lastItem;
}
