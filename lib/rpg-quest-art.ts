/** Quest-specific generated paintings. Each responsive pair belongs to one narrative moment. */
export const QUEST_ART_KEYS=['mor-request','mor-letter','alley-thief','alley-thief-spin','traveler-injured','traveler-aided','watchtower-arrival','blue-glass-discovery'] as const;
export type QuestArtKey=typeof QUEST_ART_KEYS[number];
// Approved portrait revisions and matching landscape adaptations.
const PORTRAIT_VERSION:Record<QuestArtKey,number>={'mor-request':1,'mor-letter':1,'alley-thief':5,'alley-thief-spin':2,'traveler-injured':3,'traveler-aided':4,'watchtower-arrival':4,'blue-glass-discovery':3};
const LANDSCAPE_VERSION:Record<QuestArtKey,number>={'mor-request':1,'mor-letter':1,'alley-thief':4,'alley-thief-spin':2,'traveler-injured':3,'traveler-aided':4,'watchtower-arrival':4,'blue-glass-discovery':2};
export function questArt(key:QuestArtKey){return {landscape:`/quests/${key}-wide-v${LANDSCAPE_VERSION[key]}.png`,portrait:`/quests/${key}-portrait-v${PORTRAIT_VERSION[key]}.png`};}

/** The stolen letter is in Mor's hands only after the actual return. */
export function morQuestPainting(quest?:{step:string}):QuestArtKey{return quest?.step==='complete'?'mor-letter':'mor-request';}
