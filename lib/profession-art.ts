import type {RpgProfessionId} from './rpg-professions';

/** Keep picture selection separate from saved profession identity and game rules. */
export const PROFESSION_PORTRAITS={
 swordsman:{src:'/item-battle-v1/professions/swordsman-cartoon-v4.webp',width:1024,height:1536,faceWidth:340,eyeX:528,eyeY:431},
 rogue:{src:'/item-battle-v1/professions/rogue-cartoon-v4.webp',width:1024,height:1536,faceWidth:370,eyeX:543,eyeY:422},
 cleric:{src:'/item-battle-v1/professions/cleric-cartoon-v4.webp',width:1024,height:1536,faceWidth:330,eyeX:530,eyeY:369},
 mage:{src:'/item-battle-v1/professions/mage-cartoon-v4.webp',width:1024,height:1536,faceWidth:330,eyeX:516,eyeY:550},
} as const;

export const RPG_PROFESSION_PORTRAITS={
 swordsman:{src:'/item-battle-v1/professions/swordsman-front-r61.png'},
 mage:{src:'/item-battle-v1/professions/mage-front-r61.png'},
 cleric:{src:'/item-battle-v1/professions/cleric-front-r61.png'},
 rogue:{src:'/item-battle-v1/professions/rogue-front-r61.png'},
} as const;

/** Scale each visible face equally and line up the eyes, independently of hats. */
export function professionPortraitStyle(id:RpgProfessionId){
 const art=PROFESSION_PORTRAITS[id];
 return {'--portrait-width-factor':art.width/art.faceWidth,'--portrait-eye-x':art.eyeX/art.faceWidth,'--portrait-eye-y':art.eyeY/art.faceWidth};
}
