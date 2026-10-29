/** Keep decoded item art alive across new-game and resume entrances. */
export const ITEM_SCENE_IMAGES=[
 '/rpg-items-v1/consumables/scout-lens.webp','/rpg-items-v1/consumables/swapped-fate.webp',
 '/rpg-items-v1/consumables/ward-seal-v3.webp','/rpg-items-v1/consumables/ember-bomb-v2.webp',
 '/rpg-items-v1/consumables/emergency-herb-v2.webp','/rpg-items-v1/consumables/whisper-eye-v2.webp',
 '/rpg-items-v1/effects/ember-impact-v1.webp',
 '/item-battle-v1/skills/rogue-ambush-0650.webp',
] as const;
const prepared=new Map<string,{image:HTMLImageElement,promise:Promise<void>}>();
function prepare(src:string){
 const cached=prepared.get(src);if(cached)return cached.promise;
 const image=new Image();image.decoding='sync';image.fetchPriority='high';
 const promise=new Promise<void>((resolve,reject)=>{
  let finished=false;
  const fail=()=>{if(finished)return;finished=true;clearTimeout(timer);prepared.delete(src);reject(Error('아이템 이미지를 불러오지 못했어요. 다시 시도해 주세요.'));};
  const timer=setTimeout(fail,10000);
  image.onload=()=>{void image.decode().then(()=>{if(finished)return;finished=true;clearTimeout(timer);resolve();},fail);};image.onerror=fail;image.src=src;
 });
 prepared.set(src,{image,promise});return promise;
}
/** Await before consuming an item or starting its shared flight/impact clock. */
export async function prepareItemSceneAssets(){if(typeof Image==='undefined')return;await Promise.all(ITEM_SCENE_IMAGES.map(prepare));}
