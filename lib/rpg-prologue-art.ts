import type {PrologueCut} from './rpg-prologue.ts';

const frame=(landscape:string,portrait:string)=>({landscape:`/prologue/${landscape}.png`,portrait:`/prologue/${portrait}.png`});
export const PROLOGUE_ART={
 snow:frame('snow-traveler-v1','snow-traveler-portrait-v1'),
 inn:frame('snow-inn-v3','snow-inn-portrait-v1'),
 room:frame('tavern-interior-v2','tavern-interior-portrait-v1'),
 table:frame('wager-rest-wide-v3','wager-rest-portrait-v3'),
 cardFront:frame('tile-front-landscape-v1','tile-front-portrait-v1'),
 cardBack:frame('tile-back-landscape-v1','tile-back-portrait-v1'),
 road:frame('dawn-castle-road-v2','dawn-castle-road-portrait-v2'),
 stone:frame('stone-revelation-landscape-v1','stone-revelation-portrait-v1'),
 gate:frame('moon-village-distant-wide-v1','moon-village-distant-portrait-v1'),
};
export function prologueArt(cut:PrologueCut){
 if(cut.poseArt)return cut.poseArt;
 if(cut.art)return cut.art;
 if(cut.scene==='dark')return null;
 return PROLOGUE_ART[cut.scene==='card'?(cut.back?'cardBack':'cardFront'):cut.scene];
}
export function prologueArtSources(portrait:boolean){
 return [...new Set(Object.values(PROLOGUE_ART).map(frame=>portrait?frame.portrait:frame.landscape))];
}
export function prologueSceneSources(cuts:readonly PrologueCut[],portrait:boolean){
 return [...new Set(cuts.flatMap(cut=>{const art=prologueArt(cut);return art?[portrait?art.portrait:art.landscape]:[];}))];
}

/** Consecutive captions over one painting share a single mounted picture and camera. */
export function prologueSceneGroup(cuts:readonly PrologueCut[],index:number){
 const identity=(cut:PrologueCut)=>{const art=prologueArt({...cut,poseArt:undefined});return art?JSON.stringify([art.landscape,art.portrait,cut.focus||'']):'dark';};
 if(!cuts[index])throw Error('이야기 장면을 찾을 수 없어요.');
 const visual=identity(cuts[index]);let start=index,end=index;
 while(start>0&&identity(cuts[start-1])===visual)start--;
 while(end+1<cuts.length&&identity(cuts[end+1])===visual)end++;
 return {key:`${start}:${visual}`,start,end,duration:cuts.slice(start,end+1).reduce((sum,cut)=>sum+cut.duration,0)};
}

export function storyPictureKey(cut:PrologueCut){const art=prologueArt(cut);return JSON.stringify([cut.scene,art?.landscape,art?.portrait,cut.focus||'']);}
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
