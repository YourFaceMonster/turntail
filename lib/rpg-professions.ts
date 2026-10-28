/** Handoff prototype values, enabled for newly created profession matches without mana or levels. */
export const RPG_PROFESSIONS=[
 {id:'swordsman',name:'검사',passive:{label:'페어',damage:1,heal:0,reveal:0,exchange:false},active:{label:'스트레이트',damage:3,heal:0,reveal:0,exchange:false}},
 {id:'rogue',name:'도적',passive:{label:'싱글',damage:0,heal:0,reveal:1,exchange:false},active:{label:'트리플',damage:0,heal:0,reveal:2,exchange:true}},
 {id:'cleric',name:'성직자',passive:{label:'페어',damage:0,heal:1,reveal:0,exchange:false},active:{label:'풀하우스',damage:0,heal:5,reveal:0,exchange:false}},
 {id:'mage',name:'마법사',passive:{label:'트리플',damage:2,heal:0,reveal:0,exchange:false},active:{label:'포카드',damage:6,heal:0,reveal:0,exchange:false}},
] as const;
export type RpgProfessionId=typeof RPG_PROFESSIONS[number]['id'];
export function isRpgProfessionId(id:unknown):id is RpgProfessionId{return RPG_PROFESSIONS.some(profession=>profession.id===id);}
export function rpgProfession(id:RpgProfessionId){return RPG_PROFESSIONS.find(profession=>profession.id===id)!;}
/** Only a resolved fight winner may request these effects; playing a matching combo alone is insufficient. */
export function rpgProfessionTriggers(id:RpgProfessionId,winningLabel:string,activeUsed:boolean){
 const profession=rpgProfession(id);
 return {passive:profession.passive.label===winningLabel?profession.passive:null,active:(id==='mage'||!activeUsed)&&profession.active.label===winningLabel?profession.active:null};
}
export function rpgProfessionHeal(hp:number,healing:number){return Math.max(0,Math.min(100,hp+Math.max(0,healing)));}
