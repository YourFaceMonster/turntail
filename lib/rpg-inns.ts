import {RELIC_GRADES,RELIC_RECIPES,RPG_REWORK_RELICS,learnRecipes,rpgMaxHp,activateRpgRelics,isPassiveRelic,type RelicGrade} from './rpg-rework';
import {rpgRelicSlots} from './rpg-trials';
import {DICE_RELIC_ID} from './rpg-dice-den.ts';
import {withRelicActivations} from './rpg-relic-feedback.ts';
import type {RpgRun} from './rpg.ts';

/**
 * 2026-11-13 region inns (user design): Mor's siblings keep an inn in the flame (ST4~6) and key (ST7~9)
 * regions. Each inn has the same four services with its own flavour: the owner's rumour, a regular's
 * forging recipe, an offering (give up a bag relic to heal) and a short house game. Normal play only.
 */
export type InnRegion=2|3;
export type InnNode='inn-2'|'inn-3';
export type InnGame='high-low'|'memory';
export type InnState={met?:boolean,rumor?:boolean,recipe?:string,recipeExtra?:string,recipeDone?:boolean,gameWon?:boolean,gameBest?:number,gameRelic?:string,offered?:string[]};
export const INN_REGIONS:readonly InnRegion[]=[2,3];
export const innNode=(region:InnRegion):InnNode=>`inn-${region}`;
export const isInnNode=(id:unknown):id is InnNode=>id==='inn-2'||id==='inn-3';
export const innRegionOf=(id:InnNode):InnRegion=>id==='inn-2'?2:3;
/** Inn paintings: add the region here once /story/inn-<region>-portrait-v1.webp exists. Until then the region's crossing painting (no faces to mistake for the owner). */
export const INN_ART_READY=new Set<InnRegion>([2,3]);
export function innArt(region:InnRegion){if(INN_ART_READY.has(region))return {landscape:`/story/inn-${region}-wide-v1.webp`,portrait:`/story/inn-${region}-portrait-v1.webp`};const path=region===2?'/story/cross-4-border-portrait-v1.webp':'/story/cross-7-border-portrait-v1.webp';return {landscape:path,portrait:path};}

/** Offering heal per relic grade (user approved: common 15 · rare 25 · legendary 40). */
export const OFFERING_HEAL:Record<RelicGrade,number>={common:15,rare:25,legendary:40};
export const offeringHeal=(id:string)=>OFFERING_HEAL[RELIC_GRADES[id]||'common'];
/** House games: High-Low pays from a streak of 4; Memory pays at 20 flips or fewer (6 pairs, perfect = 12). */
export const HIGH_LOW_GOAL=4,MEMORY_PAIRS=6,MEMORY_GOAL=20;

type Line=readonly [speaker:string,line:string];
export type InnDef={region:InnRegion,node:InnNode,name:string,owner:string,ownerTitle:string,pet:string,regular:string,regularTitle:string,game:InnGame,gameName:string,gameHost:string,
 arrival:(letterDone:boolean,visitedOther:boolean)=>Line[],welcomeBack:Line[],rumorTitle:string,rumor:Line[],rumorNote:string,
 recipeIntro:Line[],recipeNone:Line[],offerIntro:Line[],offerThanks:(heal:number)=>Line[],offerLabel:string,gameIntro:Line[],gameWin:Line[],gameMiss:Line[]};

export const INNS:Record<InnRegion,InnDef>={
 2:{region:2,node:'inn-2',name:'안개 나루 주점',owner:'모란',ownerTitle:'모르의 누나',pet:'수달',regular:'도칸',regularTitle:'화로 대장장이',game:'high-low',gameName:'높을까 낮을까',gameHost:'모란',
  arrival:(letterDone,visitedOther)=>[
   ['','폭포 아래 나루터. 낡은 배 한 척이 통째로 주점이 되어 있었다. 뱃전의 등불이 물안개에 번졌다.'],
   ['모란','어서 와! 젖은 옷은 화로 앞에 걸어 두고. …그 표정, 노르문에서 왔구나?'],
   letterDone?['모란','우리 둘째 편지를 찾아 준 게 너지? 모르가 고맙다는 말은 했어? 안 했겠지. 그 녀석은 원래 그래.']:['모란','까마귀 주점의 모르, 우리 둘째야. 여전히 무뚝뚝하지? 그래도 속은 따뜻한 녀석이야.'],
   ['모란','우리 삼남매는 영역마다 주점을 하나씩 열었어. 길손이 쉬어 갈 자리 하나는 있어야 한다는 게 아버지 말씀이었거든.'],
   visitedOther?['모란','막내네도 들렀어? 걔는 손님 발소리까지 적어 둔다니까.']:['모란','막내는 더 위쪽, 달빛 고목 아래에 있어. 언젠가 들러 줘.'],
  ],
  welcomeBack:[['모란','또 왔네! 화로는 늘 켜 둬. 뭐 마실래?']],
  rumorTitle:'뱃사람들의 소문',rumor:[['모란','뱃사람들 말로는 구름다리 매듭이 꼭 한쪽만 끊어진대. 반대쪽은 몇 해째 멀쩡하고.'],['모란','회랑의 기사들은 누굴 지키는지도 모르면서 자리를 안 떠난다더라. 의리라고 해야 하나, 고집이라고 해야 하나.']],
  rumorNote:'구름다리 매듭은 늘 한쪽만 끊어진다. 회랑의 기사들은 누구를 지키는지도 모른 채 자리를 지킨다.',
  recipeIntro:[['도칸','불 앞에서는 쇠도 유물도 정직해지지. 하나 알려 주마.']],recipeNone:[['도칸','내가 아는 조합은 다 알려 줬어. 이제 네 손으로 두드려 봐.']],
  offerIntro:[['모란','쓰지 않는 유물이 있으면 화로에 넣어 봐. 오래된 유물일수록 좋은 불이 나거든. 그 온기로 몸을 녹이고 가.']],
  offerThanks:heal=>[['','유물이 화로 속에서 천천히 녹아내렸다. 따뜻한 증기가 몸을 감쌌다.'],['모란',`좋은 불이네. HP ${heal}만큼 몸이 풀렸을 거야.`]],offerLabel:'화로에 넣기',
  gameIntro:[['모란','뱃사람 놀이 한 판 어때? 다음 패가 지금 패보다 셀지 약할지만 맞히면 돼.'],['모란',`${HIGH_LOW_GOAL}번 연속으로 맞히면 내가 아끼는 걸 하나 줄게. 처음 한 번만이야!`]],
  gameWin:[['모란','하하! 뱃사람들도 그렇게는 못 맞혀. 약속한 거, 가져가.']],gameMiss:[['모란','아깝다! 물때가 안 좋았네. 언제든 다시 해.']],
 },
 3:{region:3,node:'inn-3',name:'달빛 등불 주점',owner:'모로',ownerTitle:'모르의 막내',pet:'검은 고양이',regular:'리네',regularTitle:'별지기',game:'memory',gameName:'기록 맞추기',gameHost:'모로',
  arrival:(letterDone,visitedOther)=>[
   ['','고목 뿌리 사이로 난 굴 안, 천장 가득 등불이 매달려 있었다. 장부 위에서 검은 고양이가 눈을 떴다.'],
   ['모로','…손님이군요. 발소리를 기록해 두겠습니다. 막내 모로입니다.'],
   letterDone?['모로','둘째 형의 편지를 되찾아 주셨다고요. 형은 그 일을 아무에게도 말하지 않았지만, 기록은 남아 있습니다.']:['모로','둘째 형 모르는 아직도 말을 아끼던가요. 우리 집안 내력입니다. 누나만 빼고요.'],
   visitedOther?['모로','누나 주점에도 들르셨군요. 화로 냄새가 납니다.']:['모로','누나는 아래쪽 안개 나루에서 배를 주점으로 쓰고 있습니다. 시끄러운 곳이지요.'],
   ['모로','이 주점에는 지나간 여행자들이 남긴 쪽지를 모아 둡니다. 이름은 지워져도, 쪽지는 남으니까요.'],
  ],
  welcomeBack:[['모로','다시 오셨군요. 방문 기록에 한 줄 더 적어 두겠습니다.']],
  rumorTitle:'모로의 기록 상자',rumor:[['모로','기록 상자의 쪽지 한 장입니다. “숫자 2를 높이 친 사람은 지지 않으려던 게 아니다. 잊지 않으려던 것이다.”'],['모로','쓴 사람의 이름은 지워져 있습니다. 성소의 엘라 할머니라면 무언가 아실지도 모릅니다.']],
  rumorNote:'“숫자 2를 높이 친 사람은 지지 않으려던 게 아니다. 잊지 않으려던 것이다.” 이름이 지워진 여행자의 쪽지. 성소의 엘라가 무언가 알지도 모른다.',
  recipeIntro:[['리네','별자리는 거짓말을 안 해. 오늘 밤 별이 이어 준 조합을 알려 줄게.']],recipeNone:[['리네','오늘 밤 별은 더 할 말이 없대. 네가 아는 걸로 충분하다는 뜻이야.']],
  offerIntro:[['모로','쓰지 않는 유물은 기록 상자에 보관해 드립니다. 대신 등불 아래에서 한숨 주무시지요.']],
  offerThanks:heal=>[['','유물을 기록 상자에 넣자, 모로가 장부에 한 줄을 적었다. 등불 아래에서 잠깐 눈을 붙였다.'],['모로',`잘 주무셨습니다. HP ${heal}만큼 회복하셨을 겁니다.`]],offerLabel:'기록 상자에 맡기기',
  gameIntro:[['모로','기록 맞추기 한 판 하시겠습니까. 엎어 둔 패에서 같은 짝을 찾으시면 됩니다.'],['모로',`${MEMORY_GOAL}번 안에 모두 찾으시면 보관해 둔 유물을 하나 드리지요. 처음 한 번만입니다.`]],
  gameWin:[['모로','훌륭한 기억력입니다. 기록해 두겠습니다. 약속한 유물입니다.']],gameMiss:[['모로','기록은 반복할수록 선명해집니다. 언제든 다시 오십시오.']],
 },
};

function innContext(run:RpgRun,region:InnRegion){
 const j=run.journey;if(!j||j.location!=='inn'||j.currentNode!==innNode(region)||run.status!=='ready')throw Error(`${INNS[region].name}에서 할 수 있어요.`);
 return {j,inn:j.inns?.[region]||{}};
}
const withInn=(run:RpgRun,region:InnRegion,patch:InnState,extra:Partial<RpgRun>={}):RpgRun=>{
 const j=run.journey!;return {...run,...extra,journey:{...j,...(extra.journey||{}),inns:{...j.inns,[region]:{...j.inns?.[region],met:true,...patch}}},updatedAt:Date.now()};
};
export const innRumorId=(region:InnRegion)=>`inn-rumor-${region}`;
export function innRumorNotes(run:RpgRun){const heard=run.journey?.rumors||[];return INN_REGIONS.filter(region=>heard.includes(innRumorId(region))).map(region=>({id:innRumorId(region),title:INNS[region].rumorTitle,text:INNS[region].rumorNote}));}

export function meetInn(run:RpgRun,region:InnRegion):RpgRun{const {inn}=innContext(run,region);return inn.met?run:withInn(run,region,{met:true});}
export function hearInnRumor(run:RpgRun,region:InnRegion):RpgRun{
 const {j,inn}=innContext(run,region);if(inn.rumor)return run;
 return withInn(run,region,{rumor:true},{journey:{...j,rumors:[...new Set([...j.rumors,innRumorId(region)])]}});
}
/** The regular teaches one unknown forging recipe, once per inn (new RPG only). */
export function learnInnRecipe(run:RpgRun,region:InnRegion):RpgRun{
 const {inn}=innContext(run,region);if(inn.recipeDone)return run;
 if(!run.rework)return withInn(run,region,{recipeDone:true});
 // Mor's quill (a family keepsake) makes each sibling's regular share one more recipe.
 const quill=run.relics.includes('mor-quill'),taught=learnRecipes(run,quill?2:1);
 const next=withInn(taught.run,region,{recipeDone:true,...(taught.learned[0]?{recipe:taught.learned[0]}:{}),...(taught.learned[1]?{recipeExtra:taught.learned[1]}:{})});
 return quill&&taught.learned.length>1?withRelicActivations(next,[{relicId:'mor-quill',message:'조합법 하나 더 듣기'}]):next;
}
export function innRecipeLine(id?:string){return RELIC_RECIPES.find(recipe=>recipe.id===id)?.pio;}
/** Bag relics only: an equipped relic must be taken off first so a key relic is never lost by a mis-tap. */
export function offerableRelics(run:RpgRun){return run.relics.filter(id=>!run.equipped.includes(id));}
export function offerRelic(run:RpgRun,region:InnRegion,id:unknown):RpgRun{
 const {inn}=innContext(run,region);
 if(typeof id!=='string'||!run.relics.includes(id))throw Error('바칠 유물을 가방에서 골라 주세요.');
 if(run.equipped.includes(id))throw Error('장착한 유물은 바칠 수 없어요. 먼저 장착을 해제해 주세요.');
 const max=run.rework?rpgMaxHp(run):100;if(run.hp[0]>=max)throw Error('HP가 이미 가득 찼어요.');
 const hp=[Math.min(max,run.hp[0]+offeringHeal(id)),...run.hp.slice(1)];
 return activateRpgRelics(withInn(run,region,{offered:[...(inn.offered||[]),id]},{hp,relics:run.relics.filter(relic=>relic!==id)}));
}
/** First qualifying result pays one relic (new RPG); later plays are practice. score = streak (high-low) or flips (memory). */
export function settleInnGame(run:RpgRun,region:InnRegion,score:unknown):RpgRun{
 const {inn}=innContext(run,region),def=INNS[region];
 if(typeof score!=='number'||!Number.isInteger(score)||score<0||score>200)throw Error('미니게임 결과가 올바르지 않아요.');
 const better=def.game==='high-low'?score>(inn.gameBest??-1):score<(inn.gameBest??Infinity);
 const won=def.game==='high-low'?score>=HIGH_LOW_GOAL:score>=MEMORY_PAIRS*2&&score<=MEMORY_GOAL;
 const patch:InnState={...(better?{gameBest:score}:{})};
 if(!won||inn.gameWon)return withInn(run,region,patch);
 const prize=run.rework?innPrize(run,region):undefined;
 if(!prize)return withInn(run,region,{...patch,gameWon:true});
 const relics=[...run.relics,prize],equipped=!isPassiveRelic(prize)&&run.equipped.length<rpgRelicSlots(run)?[...run.equipped,prize]:run.equipped;
 return activateRpgRelics(withInn(run,region,{...patch,gameWon:true,gameRelic:prize},{relics,equipped,discovered:[...new Set([...run.discovered,prize])]}));
}
/** A reward-pool relic the player does not hold (never legendary or a quest relic); seeded so a reload pays the same. */
export function innPrize(run:RpgRun,region:InnRegion){
 const quest=new Set(['watchkeepers-blue-glass',DICE_RELIC_ID]);
 const pool=RPG_REWORK_RELICS.filter(r=>r.grade!=='legendary'&&!quest.has(r.id)&&!run.relics.includes(r.id)).map(r=>r.id);
 if(!pool.length)return undefined;
 let seed=2166136261;for(const char of `${run.id}:inn:${region}`)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 return pool[seed%pool.length];
}
/** One page action ('rpg-inn') for every inn service; the region comes from the inn the player stands in. */
export function innAction(run:RpgRun,extra:Record<string,unknown>):RpgRun{
 const node=run.journey?.currentNode;if(!isInnNode(node))throw Error('주점 안에서 할 수 있어요.');
 const region=innRegionOf(node);
 switch(extra.op){
  case 'meet':return meetInn(run,region);
  case 'rumor':return hearInnRumor(run,region);
  case 'recipe':return learnInnRecipe(run,region);
  case 'offer':return offerRelic(run,region,extra.id);
  case 'game':return settleInnGame(run,region,extra.score);
  default:throw Error('알 수 없는 주점 행동이에요.');
 }
}
export function validInnState(value:unknown){
 if(value===undefined)return true;if(!value||typeof value!=='object')return false;
 return Object.entries(value).every(([key,inn])=>{
  if(key!=='2'&&key!=='3'||!inn||typeof inn!=='object')return false;const s=inn as InnState;
  const bool=(v:unknown)=>v===undefined||typeof v==='boolean',str=(v:unknown)=>v===undefined||typeof v==='string';
  return bool(s.met)&&bool(s.rumor)&&bool(s.recipeDone)&&bool(s.gameWon)&&str(s.recipe)&&str(s.recipeExtra)&&str(s.gameRelic)&&(s.gameBest===undefined||Number.isInteger(s.gameBest)&&s.gameBest>=0)&&(s.offered===undefined||Array.isArray(s.offered)&&s.offered.every(id=>typeof id==='string'));
 });
}
