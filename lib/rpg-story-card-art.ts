import type {StoryCardId} from './rpg-story-cards.ts';
/** Story-only artwork; never used as combat tiles or equipment. */
export const STORY_CARD_ART:Record<StoryCardId,{front:string,back:string}>={
 'crown-two':{front:'/prologue/tile-front-portrait-crown-v1.webp',back:'/prologue/tile-back-portrait-v1.webp'},
 'iron-gate-two':{front:'/story-cards/iron-gate-two-front-v1.webp',back:'/story-cards/iron-gate-two-back-v1.webp'},
 // Placeholders until the generated cards arrive: point these at /story-cards/{id}-front-v1.webp and -back-v1.webp
 // (keep the generated PNG beside them as the original, like iron-gate-two).
 'sacred-flame-two':{front:'/story-cards/iron-gate-two-front-v1.webp',back:'/story-cards/iron-gate-two-back-v1.webp'},
 'secret-key-two':{front:'/story-cards/iron-gate-two-front-v1.webp',back:'/story-cards/iron-gate-two-back-v1.webp'},
};
