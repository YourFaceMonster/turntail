/** Provisional stage aliases; their true names and origin remain unrevealed. */
export const RPG_TWINS=[
 {name:'첫째',avatar:'rpg-twin:0',title:'이끼 돌계단의 쌍둥이'},
 {name:'둘째',avatar:'rpg-twin:1',title:'이끼 돌계단의 쌍둥이'},
] as const;
export function twinIndex(avatar:string|undefined){
 if(avatar==='rpg-twin:0')return 0;
 if(avatar==='rpg-twin:1')return 1;
 return null;
}
