import {STAGE_THEMES} from './stage-theme.ts';

export const HP_CHARACTERS=[
 {id:'toto',name:'토토',avatar:'stage-portrait:2',role:'공격형',skill:'전력 질주',effect:'다음 싸움에서 이기면 다른 두 명에게 주는 피해 +1',kind:'attack'},
 {id:'rowen',name:'로웬',avatar:'stage-portrait:0',role:'수비형',skill:'관문의 수호',effect:'다음 싸움에서 자신이 받는 싸움 피해 2 감소',kind:'guard'},
 {id:'lumi',name:'루미',avatar:'stage-portrait:1',role:'운영형',skill:'길잡이의 보상',effect:'다음 싸움에서 이기면 즉시 돈 2P 획득',kind:'money'},
] as const;

// Distinct character identities share the three existing, equally strong skill effects.
const RESIDENTS=[
 {id:'poco',portrait:3,kind:'money',skill:'행상의 이익'},
 {id:'mila',portrait:4,kind:'guard',skill:'따뜻한 한 상'},
 {id:'dodam',portrait:5,kind:'guard',skill:'든든한 짐꾼'},
 {id:'moru',portrait:6,kind:'guard',skill:'이끼 돌갑옷'},
 {id:'duri',portrait:7,kind:'attack',skill:'석공의 한 수'},
 {id:'ion',portrait:8,kind:'money',skill:'고사리의 선물'},
 {id:'suri',portrait:9,kind:'money',skill:'기다림의 수확'},
 {id:'nea',portrait:10,kind:'attack',skill:'물길 돌파'},
 {id:'bangul',portrait:11,kind:'guard',skill:'물방울 장막'},
 {id:'tarae',portrait:12,kind:'attack',skill:'재빠른 매듭'},
 {id:'haon',portrait:13,kind:'money',skill:'나침반의 발견'},
 {id:'bram',portrait:14,kind:'guard',skill:'흔들림 없는 파수'},
 {id:'karden',portrait:15,kind:'guard',skill:'현무암의 맹세'},
 {id:'sera',portrait:16,kind:'attack',skill:'진격의 깃발'},
 {id:'taeyeop',portrait:17,kind:'money',skill:'정확한 기록'},
 {id:'ruen',portrait:18,kind:'money',skill:'학자의 통찰'},
 {id:'sion',portrait:19,kind:'guard',skill:'달등의 가호'},
 {id:'nabir',portrait:20,kind:'money',skill:'달빛의 선물'},
 {id:'astel',portrait:21,kind:'money',skill:'별자리의 인도'},
 {id:'orbi',portrait:22,kind:'guard',skill:'성소의 결계'},
 {id:'ella',portrait:23,kind:'money',skill:'기록자의 보상'},
 {id:'onik',portrait:24,kind:'attack',skill:'흑요석의 날'},
 {id:'jaeon',portrait:25,kind:'attack',skill:'남은 불씨'},
 {id:'bes',portrait:26,kind:'attack',skill:'연기 속 기습'},
 {id:'arden',portrait:27,kind:'attack',skill:'태고의 위엄'},
 {id:'nox',portrait:28,kind:'guard',skill:'별날개 수호'},
 {id:'rosea',portrait:29,kind:'attack',skill:'홍련의 날갯짓'},
] as const;

export const HP_BATTLE_CHARACTERS=[...HP_CHARACTERS,...RESIDENTS.map(resident=>{
 const person=STAGE_THEMES.flatMap(stage=>stage.opponents).find(person=>person.portrait===resident.portrait)!;
 const baseline=HP_CHARACTERS.find(character=>character.kind===resident.kind)!;
 return {...resident,name:person.name,avatar:`stage-portrait:${person.portrait}`,role:baseline.role,effect:baseline.effect};
})];
export type HpCharacterId=typeof HP_BATTLE_CHARACTERS[number]['id'];
export function hpCharacter(id:unknown){return HP_BATTLE_CHARACTERS.find(character=>character.id===id)||HP_CHARACTERS[0];}
export function isHpCharacterId(id:unknown):id is HpCharacterId{return HP_BATTLE_CHARACTERS.some(character=>character.id===id);}
function secureIndex(max:number){
 const value=new Uint32Array(1),limit=Math.floor(0x100000000/max)*max;
 do{crypto.getRandomValues(value);}while(value[0]>=limit);
 return value[0]%max;
}
/** Draw once per new match, without replacement and without the selected player character. */
export function pickHpOpponents(exclude?:HpCharacterId,randomIndex:(max:number)=>number=secureIndex):HpCharacterId[]{
 const available=HP_BATTLE_CHARACTERS.filter(character=>character.id!==exclude).map(character=>character.id);
 return Array.from({length:2},()=>available.splice(randomIndex(available.length),1)[0]);
}
