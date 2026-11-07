import type {RpgRework} from './rpg-rework';
import {activateRpgRelics} from './rpg-rework';
import {isRpgDemo,demoShop} from './rpg-demo-catalog.ts';
import {emergencyHerbHealing} from './blue-glass.ts';
import type {StoryCardId} from './rpg-story-cards.ts';
import type {RpgRoundHealth} from './rpg-round-health';
import {BLUE_GLASS_ID} from './blue-glass.ts';
import type {RpgJourneyState} from './rpg-journey.ts';
import {withRelicActivations,type RpgRelicActivation,type RpgRelicEffect} from './rpg-relic-feedback.ts';
import type {RpgExchangeEvent,RpgItemEvent,RpgTacticalState} from './rpg-items.ts';
import type {RpgPhaseOneState} from './rpg-phase-one.ts';
import type {RpgProfessionCombat} from './rpg-profession-combat.ts';
import {ITEM_BATTLE_RELICS} from './item-battle-relic-catalog.ts';
/** The RPG journey is deliberately separate from the older score based stage run. */
export type RpgStatus='playing'|'allocation'|'relic'|'ready'|'complete'|'game-over'|'abandoned';
export type RpgResult={id:string,at:number,players:{count:number,delta:number,total?:number}[]};
export type RpgReward={stage:number,rank:number,counts:number[],hpAfterSettlement:number[],coins:number,points:number,nextStage:number,offers:string[],retry:boolean,special?:boolean,reason:'clear'|'fate'|'end'};
export type RpgShop={area:number,stock:{id:string,kind:'relic'|'consumable',price:number,quantity:number}[]};
export type RpgRun={pendingRework?:boolean,rework?:RpgRework,storyCards?:StoryCardId[],roundHealth?:RpgRoundHealth,journey?:RpgJourneyState,phaseOne?:RpgPhaseOneState,maxHp?:number,combat?:RpgProfessionCombat,itemGuards?:Record<number,boolean>,tactics?:Record<number,RpgTacticalState>,enemyConsumables?:Record<number,string[]>,protectedCounts?:number[],lastItem?:RpgItemEvent,version:1,id:string,stage:number,status:RpgStatus,hp:number[],fate:number,coins:number,points:number,rounds:number,roundIds:string[],gloveRoundIds:string[],startedAt:number,updatedAt:number,reward:RpgReward|null,relics:string[],equipped:string[],consumables:string[],shops:RpgShop[],scaleUsed:number[],pendingSoup:boolean,pendingBandage:boolean,shield:number,bossCoinPaid:number[],crackedHeartUsed:number[],discovered:string[],unlocked:string[],relicActivations?:RpgRelicActivation[],lastExchange?:RpgExchangeEvent,tacticalRound?:number,tacticalUsed?:number,tacticalTurn?:number,tacticalPeeks?:{round:number,index:number,tile:{id:number,n:number,s:number}}[],tacticalPeek?:{round:number,index:number,tile:{id:number,n:number,s:number}}};
export const RPG_BOSSES=[3,6,9,10];
export const RPG_TEST_ROUNDS=5;
export const RPG_RELIC_REWARD_STAGES=[1,2,4,5,7,8];
export const RPG_RELICS=[
 {id:BLUE_GLASS_ID,name:'파수꾼의 푸른 유리',grade:'common',effect:'장착 중 응급 약초 회복량 +5 (10 → 15)'},
 {id:'recovery-lantern',name:'회복의 등불',grade:'common',effect:'기본 완료 회복 +5'},
 {id:'cracked-heart',name:'금이 간 심장',grade:'common',effect:'스테이지 첫 HP 피해 8 감소'},
 {id:'final-knot',name:'마지막 매듭',grade:'rare',effect:'운명 구제 HP 50 → 60'},
 {id:'second-heart',name:'두 번째 심장',grade:'rare',effect:'HP 배분 5포인트마다 HP +1'},
 {id:'second-ring',name:'두 번째 반지',grade:'rare',effect:'2등 기본 주화 +15'},
 {id:'stopped-hourglass',name:'멈춘 모래시계',grade:'legendary',effect:'카드 한 판 승리 시 포인트 +5'},
 {id:'two-sided-coin',name:'양면의 동전',grade:'common',effect:'주화 배분 10마다 주화 +1'},
 {id:'gamblers-gloves',name:'승부사의 장갑',grade:'common',effect:'첫 5장 족보 제출 시 포인트 +2'},
 {id:'mor-quill',name:'모르의 깃펜',grade:'common',effect:'영역당 미발견 소문 1개 추가 열람'},
 {id:'merchants-scales',name:'상인의 저울',grade:'rare',effect:'영역 첫 상품 구매 20주화 할인'},
 {id:'twin-needle-compass',name:'쌍침 나침반',grade:'common',effect:'갈림길 보상 종류 미리 보기'},
 {id:'split-mirror',name:'갈라진 거울',grade:'legendary',effect:'갈림길 이벤트 후보 2개 제시'},
] as const;
export const RPG_CONSUMABLES=[
 {id:'whisper-eye',name:'엿보는 눈',price:30,effect:'선택한 상대 손패 무작위 1장 확인 · 사용한 사람만 공개'},
 {id:'ember-bomb',name:'작열탄',price:45,effect:'선택한 상대에게 즉시 HP 8 피해 · 최소 HP 1'},
 {id:'emergency-herb',name:'응급 약초',price:30,effect:'전투 중 자신의 HP 10 회복 · 최대 HP 100'},
 {id:'ward-seal',name:'수호의 봉인',price:40,effect:'비공개 방패 준비 · 다음 공격 또는 패 교환 아이템 1회 완전 방어'},
 {id:'red-vial',name:'붉은 약병',price:30,effect:'준비 중 즉시 HP 20 회복'},
 {id:'moonlight-soup',name:'달빛 수프',price:35,effect:'다음 기본 완료 회복 +20'},
 {id:'guardian-bandage',name:'수호의 붕대',price:40,effect:'다음 스테이지 피해 15 방어'},
 {id:'swapped-fate',name:'뒤바뀐 운명',price:45,effect:'내 손패 1장 ↔ 상대 무작위 1장 · 양쪽 손패 4장 이상 · 1·2 교환 제외'},
 {id:'fates-scales',name:'운명의 저울',price:75,effect:'내 손패 2장 ↔ 상대 무작위 2장 · 양쪽 손패 5장 이상'},
 {id:'scout-lens',name:'정찰 렌즈',price:45,effect:'원하는 2층 패 1장 투시 · 안쪽 패도 선택 가능'},
] as const;
const RPG_MARKET_RELICS=[...RPG_RELICS,...ITEM_BATTLE_RELICS];
const rewardCoins=[30,20,10];
export function newRpgRun(id:string,now=Date.now()):RpgRun{return {version:1,id,stage:1,status:'playing',hp:[100,100,100],fate:3,coins:0,points:0,rounds:0,roundIds:[],gloveRoundIds:[],startedAt:now,updatedAt:now,reward:null,relics:[],equipped:[],consumables:[],shops:[],scaleUsed:[],pendingSoup:false,pendingBandage:false,shield:0,bossCoinPaid:[],crackedHeartUsed:[],discovered:[],unlocked:[]};}
export function rpgArea(stage:number){return stage===10?10:stage>=7?7:stage>=4?4:1;}
function catalogShopStock(run:RpgRun,shop:RpgShop):RpgShop{
 const old=new Map(shop.stock.map(entry=>[entry.id,entry]));
 const consumables=RPG_CONSUMABLES.map(item=>({...old.get(item.id),id:item.id,kind:'consumable' as const,price:old.get(item.id)?.price??item.price,quantity:1}));
 const relics=RPG_MARKET_RELICS.map(item=>old.get(item.id)||{id:item.id,kind:'relic' as const,price:item.grade==='legendary'?230:item.grade==='rare'?150:90,quantity:item.id===BLUE_GLASS_ID&&!run.unlocked?.includes(BLUE_GLASS_ID)||run.relics.includes(item.id)||item.id==='second-heart'&&!run.unlocked?.includes('second-heart')||shop.area<4&&['mor-quill','twin-needle-compass','split-mirror'].includes(item.id)?0:1});
 return {...shop,stock:[...consumables,...relics]};
}
export function currentRpgShop(run:RpgRun){if(run.rework)return undefined;const shop=(run.shops||[]).find(item=>item.area===rpgArea(run.reward?.nextStage||run.stage));return shop?(isRpgDemo(run)?demoShop(run,catalogShopStock(run,shop)):catalogShopStock(run,shop)):undefined;}
function makeShop(run:RpgRun,area:number,seed:string):RpgShop{
 void seed;
 const shop={area,stock:[] as RpgShop['stock']};
 return catalogShopStock(run,shop);
}
export function rpgRanks(hp:number[],counts:number[]){return hp.map((value,i)=>1+hp.filter((other,j)=>other>value||other===value&&counts[j]<counts[i]).length);}
function offers(run:RpgRun,seed:string,count:number,grade?:string){let hash=2166136261;for(const c of seed)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;const pool=RPG_RELICS.filter(r=>(r.id!==BLUE_GLASS_ID||run.unlocked?.includes(BLUE_GLASS_ID))&&(r.id!=='second-heart'||run.unlocked?.includes('second-heart'))&&(run.stage>3||!['mor-quill','twin-needle-compass','split-mirror'].includes(r.id))&&!run.relics.includes(r.id)&&(!grade||r.grade===grade));const chosen:string[]=[];while(pool.length&&chosen.length<count){const index=hash%pool.length;chosen.push(pool.splice(index,1)[0].id);hash=Math.imul(hash^chosen.length,16777619)>>>0;}return chosen;}
export function settleRpgRound(run:RpgRun,result:RpgResult,winner:number,testMode=false,hpItemMode=false):RpgRun{
 if(run.status!=='playing'||run.roundIds.includes(result.id))return run;
 if(result.players.length!==3)throw Error('RPG 여정은 나와 AI 2명의 3인전이에요.');
 const hp=[...run.hp],counts=result.players.map(p=>p.count),effects:RpgRelicEffect[]=[];let points=run.points,shield=run.shield||0;
 result.players.forEach((p,i)=>{
  if(p.delta>=0){if(i===0)points+=p.delta;return;}
  if(run.combat)return;
  let damage=-p.delta;
  if(i===0&&run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)){const blocked=Math.min(8,damage);damage-=blocked;effects.push({relicId:'cracked-heart',message:`피해 ${blocked} 방어`});}
  if(i===0&&shield>0){const blocked=Math.min(shield,damage);damage-=blocked;shield-=blocked;}
  hp[i]-=damage;
 });
 const crackedHeartUsed=!run.combat&&result.players[0].delta<0&&run.equipped.includes('cracked-heart')&&!run.crackedHeartUsed.includes(run.stage)?[...run.crackedHeartUsed,run.stage]:run.crackedHeartUsed;
 if(winner===0&&run.equipped.includes('stopped-hourglass')){points+=5;effects.push({relicId:'stopped-hourglass',message:'포인트 +5'});}
 const base=withRelicActivations({...run,hp,points,shield,crackedHeartUsed,rounds:run.rounds+1,roundIds:[...run.roundIds,result.id],updatedAt:result.at},effects,result.at);
 if(hpItemMode)return {...base,hp:hp.map(value=>Math.max(0,value)),status:hp.some(value=>value<=0)?'complete':'playing',reward:null};
 const rewardEffects:RpgRelicEffect[]=[];
 if(!hp.some(value=>value<=0))return base;
 const rank=rpgRanks(hp,counts)[0],boss=RPG_BOSSES.includes(run.stage),retry=boss&&rank===3;
 const special=run.stage===3&&rank<=2&&hp[1]<=0&&hp[2]<=0;
 let fate=run.fate;if(rank===3)fate--;
 if(fate<=0)return {...base,fate:0,status:'game-over',points:0,reward:null};
 const nextStage=retry?run.stage:Math.min(10,run.stage+1),regionChange=!retry&&[4,7,10].includes(nextStage),complete=run.stage===3&&!retry&&!testMode;
 const settledHp=[...hp];
 if(regionChange){settledHp[0]=100;fate=3;}
 else if(rank===3){settledHp[0]=run.equipped.includes('final-knot')?60:50;if(run.equipped.includes('final-knot'))rewardEffects.push({relicId:'final-knot',message:'구제 HP 60'});}
 else settledHp[0]=Math.min(100,Math.max(0,settledHp[0])+(run.equipped.includes('recovery-lantern')?15:10)+(run.pendingSoup?20:0));
 const lanternBonus=settledHp[0]-Math.min(100,Math.max(0,hp[0])+10+(run.pendingSoup?20:0));
 if(!regionChange&&rank<=2&&run.equipped.includes('recovery-lantern')&&lanternBonus>0)rewardEffects.push({relicId:'recovery-lantern',message:`추가 회복 +${lanternBonus} HP`});
 const firstBossPayment=!boss||!run.bossCoinPaid.includes(run.stage);
 if(firstBossPayment&&rank===2&&run.equipped.includes('second-ring'))rewardEffects.push({relicId:'second-ring',message:'2등 주화 +15'});
 const relicStage=!retry&&(RPG_RELIC_REWARD_STAGES.includes(run.stage)||[3,6,9].includes(run.stage));
 const relicOffers=relicStage?offers(run,result.id,boss?2:3,boss?run.stage===9?'legendary':'rare':undefined):[];
 const fallback=relicStage&&!relicOffers.length?20:0;
 const coins=(firstBossPayment?rewardCoins[rank-1]+(rank===2&&run.equipped.includes('second-ring')?15:0):0)+fallback;
 const reward:RpgReward={stage:run.stage,rank,counts,hpAfterSettlement:settledHp,coins,points,nextStage,offers:relicOffers,retry,special,reason:complete?'end':rank===3?'fate':'clear'};
 const shopArea=run.stage===9?10:[1,4,7].includes(run.stage)?run.stage:0;
 const shops=shopArea&&!retry&&!(run.shops||[]).some(shop=>shop.area===shopArea)?[...(run.shops||[]),makeShop(run,shopArea,result.id)]:run.shops||[];
 return withRelicActivations({...base,hp:settledHp,fate,coins:run.coins+coins,shops,shield:0,pendingSoup:regionChange||rank===3?run.pendingSoup:false,bossCoinPaid:boss&&firstBossPayment?[...run.bossCoinPaid,run.stage]:run.bossCoinPaid,unlocked:special?[...new Set([...(run.unlocked||[]),'second-heart'])]:run.unlocked||[],status:'allocation',reward},rewardEffects,result.at);
}
export function allocateRpgPoints(run:RpgRun,heal:number):RpgRun{
 if(run.status!=='allocation'||!run.reward)throw Error('배분할 보상이 없어요.');
 if(!Number.isInteger(heal)||heal<0||heal>run.points)throw Error('회복할 포인트를 확인해 주세요.');
 const extra=run.equipped.includes('second-heart')?Math.floor(heal/5):0;
 if(heal&&run.hp[0]+heal+extra>100)throw Error('최대 HP를 넘어서 회복할 수 없어요.');
 const coins=run.points-heal,coinBonus=run.equipped.includes('two-sided-coin')?Math.floor(coins/10):0;
 const effects:RpgRelicEffect[]=[];
 if(extra>0)effects.push({relicId:'second-heart',message:`추가 회복 +${extra} HP`});
 if(coinBonus>0)effects.push({relicId:'two-sided-coin',message:`추가 주화 +${coinBonus}`});
 return withRelicActivations({...run,hp:[Math.min(100,run.hp[0]+heal+extra),run.hp[1],run.hp[2]],coins:run.coins+coins+coinBonus,points:0,status:run.reward.offers.length?'relic':run.reward.reason==='end'?'complete':'ready',updatedAt:Date.now()},effects);
}
export function chooseRpgRelic(run:RpgRun,id:string|null,replace:string|null=null):RpgRun{
 if(run.journey)replace=null;
 if(run.status!=='relic'||!run.reward)throw Error('선택할 유물 보상이 없어요.');
 if(id!==null&&!run.reward.offers.includes(id))throw Error('제시된 유물 중에서 선택해 주세요.');
 if(id===null)return {...run,coins:run.coins+20,status:run.reward.reason==='end'?'complete':'ready',updatedAt:Date.now()};
 if(run.relics.includes(id))throw Error('같은 유물은 중복으로 보유할 수 없어요.');
 const relics=replace?run.relics.filter(item=>item!==replace):[...run.relics],equipped=run.equipped.filter(item=>item!==replace);
 relics.push(id);if(equipped.length<3)equipped.push(id);
 return {...run,relics,equipped,discovered:[...new Set([...run.discovered,id])],status:run.reward.reason==='end'?'complete':'ready',updatedAt:Date.now()};
}
export function equipRpgRelic(run:RpgRun,id:string,replace:string|null=null):RpgRun{
 if(run.status!=='ready')throw Error('유물은 전투 준비 중에만 바꿀 수 있어요.');
 if(!run.relics.includes(id))throw Error('보유하지 않은 유물이에요.');
 if(run.equipped.includes(id))return activateRpgRelics({...run,equipped:run.equipped.filter(item=>item!==id)});
 if(run.equipped.length>=3&&(!replace||!run.equipped.includes(replace)))throw Error('장착 자리가 가득 찼어요. 교체할 유물을 고르세요.');
 return activateRpgRelics({...run,equipped:[...run.equipped.filter(item=>item!==replace),id]});
}
export function advanceRpgStage(run:RpgRun):RpgRun{
 if(run.status!=='ready'||!run.reward)throw Error('보상 선택을 마친 뒤 다음 승부로 갈 수 있어요.');
 const stage=run.reward.nextStage;
 return {...run,stage,status:'playing',hp:[run.hp[0],100,100],shield:run.pendingBandage?15:0,pendingBandage:false,reward:null,updatedAt:Date.now()};
}
export function buyRpgItem(run:RpgRun,id:string):RpgRun{
 if(run.rework)throw Error('새 RPG에서는 소모품·주화·상점을 사용하지 않아요.');
 if(id==='spark-dart')throw Error('바늘탄은 현재 상점에서 판매하지 않아요.');
 if(run.status!=='ready')throw Error('전투 준비 중에만 구매할 수 있어요.');
 const shop=currentRpgShop(run),entry=shop?.stock.find(item=>item.id===id);
 if(!shop||!entry||entry.quantity<1)throw Error('상점에서 구매할 수 없는 물품이에요.');
 if(entry.kind==='relic'&&run.relics.includes(id))throw Error('같은 유물은 1개만 보유할 수 있어요.');
 const discounted=run.equipped.includes('merchants-scales')&&!(run.scaleUsed||[]).includes(shop.area);
 const price=Math.max(0,entry.price-(discounted?20:0));
 if(run.coins<price)throw Error(`주화 ${price}개가 필요해요.`);
 return withRelicActivations({...run,coins:run.coins-price,relics:entry.kind==='relic'?[...run.relics,id]:run.relics,consumables:entry.kind==='consumable'?[...run.consumables,id]:run.consumables,discovered:entry.kind==='relic'?[...new Set([...run.discovered,id])]:run.discovered,scaleUsed:discounted?[...(run.scaleUsed||[]),shop.area]:run.scaleUsed||[],shops:(run.shops||[]).map(item=>item.area===shop.area?{...shop,stock:shop.stock.map(product=>product.id===id?{...product,quantity:product.kind==='consumable'?product.quantity:product.quantity-1}:product)}:item),updatedAt:Date.now()},discounted&&entry.price>price?[{relicId:'merchants-scales',message:`주화 ${entry.price-price} 절약`}]:[]);
}
export function sellRpgRelic(run:RpgRun,id:string):RpgRun{
 if(run.rework)throw Error('새 RPG에서는 소모품·주화·상점을 사용하지 않아요.');
 if(run.status!=='ready'||!currentRpgShop(run))throw Error('상점이 열린 전투 준비 중에만 판매할 수 있어요.');
 if(!run.relics.includes(id))throw Error('보유하지 않은 유물이에요.');
 const grade=RPG_RELICS.find(item=>item.id===id)?.grade,price=grade==='legendary'?80:grade==='rare'?50:30;
 return {...run,coins:run.coins+price,relics:run.relics.filter(item=>item!==id),equipped:run.equipped.filter(item=>item!==id),updatedAt:Date.now()};
}
export function restRpg(run:RpgRun,kind:'light'|'deep'):RpgRun{
 if(run.rework)throw Error('새 RPG에서는 소모품·주화·상점을 사용하지 않아요.');
 if(run.status!=='ready')throw Error('전투 준비 중에만 휴식할 수 있어요.');
 const price=kind==='light'?40:80,heal=kind==='light'?20:45;
 if(run.coins<price||run.hp[0]>=100)throw Error('주화가 부족하거나 HP가 이미 가득 찼어요.');
 return {...run,coins:run.coins-price,hp:[Math.min(100,run.hp[0]+heal),run.hp[1],run.hp[2]],updatedAt:Date.now()};
}
export function useRpgConsumable(run:RpgRun,id:string):RpgRun{
 if(run.rework)throw Error('새 RPG에서는 소모품·주화·상점을 사용하지 않아요.');
 if(run.status!=='ready')throw Error('이 소모품은 전투 준비 중에 사용해 주세요.');
 if(!run.consumables.includes(id))throw Error('보유하지 않은 소모품이에요.');
 const herb=id==='emergency-herb'&&isRpgDemo(run);
 if((id==='red-vial'||herb)&&run.hp[0]>=100)throw Error('HP가 이미 가득 찼어요.');
 if(id==='moonlight-soup'&&run.pendingSoup)throw Error('달빛 수프 효과가 이미 대기 중이에요.');
 if(id==='guardian-bandage'&&run.pendingBandage)throw Error('붕대 보호가 이미 대기 중이에요.');
 if(!herb&&!['red-vial','moonlight-soup','guardian-bandage'].includes(id))throw Error('전술 아이템은 카드 승부 중 내 차례에 사용해 주세요.');
 const index=run.consumables.indexOf(id);
 return {...run,hp:id==='red-vial'||herb?[Math.min(100,run.hp[0]+(herb?emergencyHerbHealing(run.equipped):20)),run.hp[1],run.hp[2]]:run.hp,pendingSoup:run.pendingSoup||id==='moonlight-soup',pendingBandage:run.pendingBandage||id==='guardian-bandage',consumables:run.consumables.filter((_,i)=>i!==index),updatedAt:Date.now()};
}
