import type {RpgRun} from './rpg.ts';

/** Story keepsakes only. Never enter hands, shop stock, relics or combat effects. */
export const STORY_CARDS={
 'crown-two':{name:'붉은 왕관 2',back:'겹쳐진 두 왕관',source:'프롤로그'},
 'iron-gate-two':{name:'검은 철문 2',back:'두 철문',source:'스테이지 3'},
 'sacred-flame-two':{name:'성화 2',back:'꺼지지 않은 두 겹의 불꽃',source:'스테이지 6'},
 'secret-key-two':{name:'비밀의 열쇠 2',back:'하나로 포개지는 두 열쇠',source:'스테이지 9'},
} as const;
export type StoryCardId=keyof typeof STORY_CARDS;
export const ST3_STORY_KEY='ST3_POST_CARDS';
export function validateStoryCards(value:unknown):asserts value is StoryCardId[]{
 if(!Array.isArray(value)||value.some(id=>typeof id!=='string'||!Object.hasOwn(STORY_CARDS,id))||new Set(value).size!==value.length)throw Error('이야기 패 수집 기록을 읽지 못했어요. 기존 데이터는 보존했어요.');
}
export function storyCardsForRun(run:RpgRun):StoryCardId[]{
 if(run.storyCards!==undefined)validateStoryCards(run.storyCards);
 if(!run.journey)return run.storyCards||[];
 return [...new Set<StoryCardId>(['crown-two',...(run.storyCards||[]),...(run.phaseOne?.clearedStages.includes(3)?['iron-gate-two' as const]:[]),...(run.rework&&run.phaseOne?.clearedStages.includes(6)?['sacred-flame-two' as const]:[]),...(run.rework&&run.phaseOne?.clearedStages.includes(9)?['secret-key-two' as const]:[])])];
}
/** Missing fields in old journey saves are inferred from existing clear evidence only. */
export function restoreStoryCards(run:RpgRun){if(run.journey)run.storyCards=storyCardsForRun(run);else if(run.storyCards!==undefined)validateStoryCards(run.storyCards);}
export function storySceneKey(stage:number){return stage===3?ST3_STORY_KEY:`ST${stage}_POST`;}
export function pendingStageStory(run:RpgRun){return !!run.phaseOne?.clear&&(run.status==='allocation'||(run.stage===3||run.stage===10)&&run.status==='complete')&&!run.journey?.seenScenes?.includes(storySceneKey(run.stage));}
export function markStageStorySeen(run:RpgRun,id:unknown):RpgRun{
 const stage=typeof id==='string'&&(/^ST([1-9]|10)_POST$/.test(id)||id===ST3_STORY_KEY)?Number(/^ST(\d+)/.exec(id)![1]):0;
 if(!run.journey||!stage||!run.phaseOne?.clearedStages.includes(stage))return run;
 return {...run,journey:{...run.journey,seenScenes:[...new Set([...(run.journey.seenScenes||[]),id as string])]}};
}
