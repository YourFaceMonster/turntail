import {STORY_CARD_ART,STORY_CARD_SCENE_ART} from './rpg-story-card-art.ts';
import type {PrologueCut} from './rpg-prologue.ts';

const frame=(landscape:string,portrait:string)=>({landscape:`/prologue/${landscape}.webp`,portrait:`/prologue/${portrait}.webp`});
export const PROLOGUE_ART={
 snow:frame('snow-traveler-v1','snow-traveler-portrait-v1'),
 inn:frame('snow-inn-v3','snow-inn-portrait-v1'),
 room:frame('tavern-interior-v2','tavern-interior-portrait-v1'),
 table:STORY_CARD_SCENE_ART.wagerRest,
 cardFront:STORY_CARD_SCENE_ART.crownFront,
 cardBack:STORY_CARD_SCENE_ART.crownBack,
 road:frame('dawn-castle-road-v2','dawn-castle-road-portrait-v2'),
 stone:STORY_CARD_SCENE_ART.stoneComparison,
 gate:frame('normun-village-distant-wide-v2','normun-village-distant-portrait-v2'),
};
export function prologueArt(cut:PrologueCut){
 if(cut.poseArt)return cut.poseArt;
 if(cut.art)return cut.art;
 if(cut.scene==='dark')return null;
 return PROLOGUE_ART[cut.scene==='card'?(cut.back?'cardBack':'cardFront'):cut.scene];
}
/** Closeup of a story keepsake laid over the dimmed painting (ST3 iron gate, ST6 flame, ST9 key). */
export function keepsakeSource(cut:PrologueCut){return cut.keepsakeFace?STORY_CARD_ART[cut.keepsakeCard||'iron-gate-two'][cut.keepsakeFace]:undefined;}
export function prologueArtSources(portrait:boolean){
 return [...new Set(Object.values(PROLOGUE_ART).map(frame=>portrait?frame.portrait:frame.landscape))];
}
export function prologueSceneSources(cuts:readonly PrologueCut[],portrait:boolean){
 return [...new Set(cuts.flatMap(cut=>{const art=prologueArt(cut);return [...(art?[portrait?art.portrait:art.landscape]:[]),...(cut.keepsakeFace?[keepsakeSource(cut)!]:[])];}))];
}

/** Consecutive captions over one painting share a single mounted picture and camera. */
export function prologueSceneGroup(cuts:readonly PrologueCut[],index:number){
 const identity=(cut:PrologueCut)=>{const art=prologueArt({...cut,poseArt:undefined});return art?JSON.stringify([art.landscape,art.portrait,cut.focus||'',keepsakeSource(cut)||'']):'dark';};
 if(!cuts[index])throw Error('이야기 장면을 찾을 수 없어요.');
 const visual=identity(cuts[index]);let start=index,end=index;
 while(start>0&&identity(cuts[start-1])===visual)start--;
 while(end+1<cuts.length&&identity(cuts[end+1])===visual)end++;
 return {key:`${start}:${visual}`,start,end,duration:cuts.slice(start,end+1).reduce((sum,cut)=>sum+cut.duration,0)};
}

export function storyPictureKey(cut:PrologueCut){const art=prologueArt(cut);return JSON.stringify([cut.scene,art?.landscape,art?.portrait,cut.focus||'',keepsakeSource(cut)||'']);}
function storyPlace(cut:PrologueCut){
 if(cut.location)return cut.location;
 if(cut.id.startsWith('quest-'))return cut.id;
 return ['room','table','card'].includes(cut.scene)?'prologue-tavern':cut.scene;
}
/** Dialogue has no picture transition; pose changes overlap; a new place fades through dark. */
export function storyPictureTransition(before:PrologueCut,after:PrologueCut):'none'|'overlap'|'fade'{
 if(storyPictureKey(before)===storyPictureKey(after))return 'none';
 return storyPlace(before)===storyPlace(after)?'overlap':'fade';
}
