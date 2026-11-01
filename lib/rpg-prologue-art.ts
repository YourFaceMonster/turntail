import type {PrologueCut} from './rpg-prologue.ts';

const frame=(landscape:string,portrait:string)=>({landscape:`/prologue/${landscape}.png`,portrait:`/prologue/${portrait}.png`});
export const PROLOGUE_ART={
 snow:frame('snow-traveler-v1','snow-traveler-portrait-v1'),
 inn:frame('snow-inn-v3','snow-inn-portrait-v1'),
 room:frame('tavern-interior-v2','tavern-interior-portrait-v1'),
 table:frame('tavern-wager-v1','tavern-wager-portrait-v1'),
 cardFront:frame('tile-front-landscape-v1','tile-front-portrait-v1'),
 cardBack:frame('tile-back-landscape-v1','tile-back-portrait-v1'),
 road:frame('dawn-road-v1','dawn-road-portrait-v1'),
 stone:frame('stone-revelation-landscape-v1','stone-revelation-portrait-v1'),
 gate:frame('moon-gate-v1','moon-gate-portrait-v1'),
};
export function prologueArt(cut:PrologueCut){
 if(cut.scene==='dark')return null;
 return PROLOGUE_ART[cut.scene==='card'?(cut.back?'cardBack':'cardFront'):cut.scene];
}
export function prologueArtSources(portrait:boolean){
 return [...new Set(Object.values(PROLOGUE_ART).map(frame=>portrait?frame.portrait:frame.landscape))];
}
