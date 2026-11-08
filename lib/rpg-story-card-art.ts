import type {StoryCardId} from './rpg-story-cards.ts';
/** Story-only artwork; never used as combat tiles or equipment. */
export const STORY_CARD_ART:Record<StoryCardId,{front:string,back:string}>={
 'crown-two':{front:'/prologue/tile-front-portrait-crown-v1.png',back:'/prologue/tile-back-portrait-v1.png'},
 'iron-gate-two':{front:'/story-cards/iron-gate-two-front-v1.png',back:'/story-cards/iron-gate-two-back-v1.png'},
 // Placeholders until the generated cards arrive: /story-cards/{id}-front-v1.png and -back-v1.png.
 'sacred-flame-two':{front:'/story-cards/iron-gate-two-front-v1.png',back:'/story-cards/iron-gate-two-back-v1.png'},
 'secret-key-two':{front:'/story-cards/iron-gate-two-front-v1.png',back:'/story-cards/iron-gate-two-back-v1.png'},
};
