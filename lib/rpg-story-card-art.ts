import type {StoryCardId} from './rpg-story-cards.ts';
/** Approved special keepsakes (2026-11-12); never ordinary combat tiles or equipment.
 * See docs/story-keepsake-art-guide.md. Iron faces retain alpha for the ST3 overlay.
 */
export const STORY_CARD_ART:Record<StoryCardId,{front:string,back:string}>={
 'crown-two':{front:'/story-cards/crown-two-front-special-v1.webp',back:'/story-cards/crown-two-back-special-v1.webp'},
 'iron-gate-two':{front:'/story-cards/iron-gate-two-front-special-cutout-v1.webp',back:'/story-cards/iron-gate-two-back-special-v1.webp'},
 'sacred-flame-two':{front:'/story-cards/sacred-flame-two-front-special-v1.webp',back:'/story-cards/sacred-flame-two-back-special-v1.webp'},
 'secret-key-two':{front:'/story-cards/secret-key-two-front-special-v1.webp',back:'/story-cards/secret-key-two-back-special-v1.webp'},
};

type StoryFrame={landscape:string,portrait:string};
const prologue=(landscape:string,portrait:string):StoryFrame=>({landscape:`/prologue/${landscape}-special-v1.webp`,portrait:`/prologue/${portrait}-special-v1.webp`});
/** Shared registry for the approved design across the prologue and ST3. */
export const STORY_CARD_SCENE_ART={
 crownFront:prologue('tile-front-landscape-crown','tile-front-portrait-crown'),
 crownBack:prologue('tile-back-landscape','tile-back-portrait'),
 wagerRest:prologue('wager-rest-wide-symbols','wager-rest-portrait-symbols'),
 wagerSpeaking:prologue('wager-speaking-wide-symbols','wager-speaking-portrait-symbols'),
 stoneComparison:prologue('stone-revelation-landscape','stone-revelation-portrait'),
 ironHandoff:prologue('st3-keepsake-handoff-wide','st3-keepsake-handoff-portrait'),
 ironComparison:prologue('st3-keepsake-compare-wide','st3-keepsake-compare-portrait'),
};
const chapter=(key:string):StoryFrame=>({landscape:`/story/${key}-portrait-special-v1.webp`,portrait:`/story/${key}-portrait-special-v1.webp`});
export const STORY_CARD_CHAPTER_ART:Partial<Record<string,StoryFrame>>=Object.fromEntries([
 'st6-flame-two','st6-flame-two-back','st9-key-two','st9-key-two-back','true-ending-record','true-ending-village','ending-handoff',
].map(key=>[key,chapter(key)]));
