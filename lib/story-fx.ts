/**
 * 2026-11-16 cutscene presentation boost (user: "연출만 보강해보자"): a one-shot effect on entering a cut.
 * tile: a tile is laid on the table (soft knock + tiny bump). slam: a decisive tile (heavy knock + shake).
 * shake: the ground or bridge trembles. zoom: a quick push toward the speaker. flash: something is revealed.
 * Effects move only the painting, never the dialogue box, and are skipped with reduced motion.
 */
export type StoryFx='tile'|'slam'|'shake'|'zoom'|'flash';
export const STORY_FX:readonly StoryFx[]=['tile','slam','shake','zoom','flash'];

/** Table sound for an effect, reusing the in-match tile sounds (`lib/sound-assets.ts`). */
export function storyFxSound(fx:StoryFx|undefined):'play'|'slam'|null{return fx==='tile'?'play':fx==='slam'?'slam':null;}

/** Keyframes for the painting stack; `null` when the effect has no motion (flash is an overlay). */
export function storyFxMotion(fx:StoryFx|undefined):{frames:Keyframe[],options:KeyframeAnimationOptions}|null{
 switch(fx){
  case 'tile':return {frames:[{translate:'0 0'},{translate:'0 3px'},{translate:'0 -1px'},{translate:'0 0'}],options:{duration:260,easing:'ease-out'}};
  case 'slam':return {frames:[{translate:'0 0',scale:'1'},{translate:'-6px 5px',scale:'1.015'},{translate:'5px -4px'},{translate:'-3px 2px'},{translate:'2px -1px'},{translate:'0 0',scale:'1'}],options:{duration:420,easing:'ease-out'}};
  case 'shake':return {frames:[{translate:'0 0'},{translate:'-4px 1px'},{translate:'4px -1px'},{translate:'-3px 0'},{translate:'3px 1px'},{translate:'-1px 0'},{translate:'0 0'}],options:{duration:700,easing:'ease-in-out'}};
  case 'zoom':return {frames:[{scale:'1'},{scale:'1.07'},{scale:'1.05'}],options:{duration:520,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'}};
  default:return null;
 }
}
