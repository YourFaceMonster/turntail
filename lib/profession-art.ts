import type {RpgProfessionId} from './rpg-professions';

/** Keep picture selection separate from saved profession identity and game rules. */
export const PROFESSION_PORTRAITS={
 swordsman:{src:'/item-battle-v1/professions/swordsman-turntale-v5.png',width:1024,height:1536,faceWidth:310,eyeX:558,eyeY:310},
 rogue:{src:'/item-battle-v1/professions/rogue-turntale-v5.png',width:1024,height:1536,faceWidth:280,eyeX:588,eyeY:310},
 cleric:{src:'/item-battle-v1/professions/cleric-turntale-v5.png',width:1073,height:1465,faceWidth:300,eyeX:550,eyeY:190},
 mage:{src:'/item-battle-v1/professions/mage-turntale-v5.png',width:1024,height:1536,faceWidth:280,eyeX:556,eyeY:345},
} as const;

export const RPG_PROFESSION_PORTRAITS={
 swordsman:{src:'/item-battle-v1/professions/swordsman-turntale-v5.png'},
 mage:{src:'/item-battle-v1/professions/mage-turntale-v5.png'},
 cleric:{src:'/item-battle-v1/professions/cleric-turntale-v5.png'},
 rogue:{src:'/item-battle-v1/professions/rogue-turntale-v5.png'},
} as const;

/** Scale each visible face equally and line up the eyes, independently of hats. */
export function professionPortraitStyle(id:RpgProfessionId){
 const art=PROFESSION_PORTRAITS[id];
 return {'--portrait-width-factor':art.width/art.faceWidth,'--portrait-eye-x':art.eyeX/art.faceWidth,'--portrait-eye-y':art.eyeY/art.faceWidth};
}
