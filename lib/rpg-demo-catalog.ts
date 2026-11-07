import type {RpgRun,RpgShop} from './rpg.ts';
import {BLUE_GLASS_ID} from './blue-glass.ts';

export const RPG_DEMO_PRICES:Record<string,number>={'emergency-herb':30,'ember-bomb':45,'ward-seal':40,'whisper-eye':30,'swapped-fate':45,'scout-lens':10};
export const RPG_DEMO_RELICS=['cracked-heart','recovery-lantern',BLUE_GLASS_ID,'wind-sigil','warrior-crest','life-sigil','sun-sigil','crimson-fang'] as const;
export const RPG_DEMO_REWARD_POOL=['wind-sigil','warrior-crest','life-sigil','sun-sigil','crimson-fang'] as const;
export function isRpgDemo(run:RpgRun){return !!run.journey&&!!run.phaseOne&&run.stage>=1&&run.stage<=3;}
/** Project old shop snapshots without deleting inventory, discovery or equipment. */
export function demoShop(run:RpgRun,shop:RpgShop):RpgShop{
 return {...shop,stock:shop.stock.filter(entry=>entry.kind==='consumable'?Object.hasOwn(RPG_DEMO_PRICES,entry.id):entry.id!==BLUE_GLASS_ID&&(RPG_DEMO_RELICS as readonly string[]).includes(entry.id)).map(entry=>entry.kind==='consumable'?{...entry,price:RPG_DEMO_PRICES[entry.id]}:entry)};
}
export function demoRelicOffers(run:RpgRun):string[]{
 if(run.stage===1)return run.relics.includes('recovery-lantern')?[]:['recovery-lantern'];
 const pool=RPG_DEMO_REWARD_POOL.filter(id=>!run.relics.includes(id));
 if(run.stage!==2)return pool.slice(0,1);
 let seed=2166136261;for(const c of `${run.id}:stage-2`)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const offers:string[]=[];while(pool.length&&offers.length<2){offers.push(pool.splice(seed%pool.length,1)[0]);seed=Math.imul(seed^offers.length,16777619)>>>0;}
 return offers;
}
/** Only unpaid demo offers migrate. Previously owned items and paid rewards stay intact. */
export function restoreDemoReward(run:RpgRun){
 const clear=run.phaseOne?.clear;if(run.rework||!isRpgDemo(run)||!clear||clear.chosen||run.status!=='allocation')return;
 if(clear.relicOffers!==undefined){if(!Array.isArray(clear.relicOffers)||clear.relicOffers.length>2||new Set(clear.relicOffers).size!==clear.relicOffers.length||clear.relicOffers.some(id=>typeof id!=='string'||!(RPG_DEMO_RELICS as readonly string[]).includes(id)||id===BLUE_GLASS_ID))throw Error('유물 보상 후보의 저장 형식이 올바르지 않아요.');return;}
 const offers=demoRelicOffers(run);clear.relicOffers=offers;clear.relicId=offers[0]||'';
}
