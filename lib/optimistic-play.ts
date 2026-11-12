import {beats,combo,uid,RECENT_TRICK_PLAYS,type view} from './game';
import {announcedPlayDuration,QUICK_PLAY_MS} from './play-notices';

type View=ReturnType<typeof view>;
/** Prefix of a play event the browser shows before the server answers (server rooms only). */
export const OPTIMISTIC_PREFIX='optimistic:';
export const isOptimisticEvent=(id?:string|null)=>!!id&&id.startsWith(OPTIMISTIC_PREFIX);

/**
 * 2026-11-12: a server-held practice room (오늘의 판) waited one server round trip (~0.3~0.7s) before the
 * player's own tiles moved. This builds the table the server will answer with, so the tiles fly at once.
 * Plain tables only: story/item/stage rules, a play that ends the round and anything the client cannot
 * check on its own (it never sees other hands) are left to the server. The server stays authoritative:
 * the answer replaces this view, and a refusal restores the previous one.
 * `seenSizes` = combo sizes already announced this round (no mutation here).
 */
export function optimisticPlay(g:View,ids:number[],seenSizes:ReadonlySet<number>,now=Date.now()):View|null{
 if(!g.practice||g.phase!=='playing'||g.turn!==g.me||g.rpgRun||g.hpItemMode||g.stageRun||g.challenge||g.rpgMini||g.items)return null;
 const me=g.players[g.me],hand=me?.hand;if(!hand||!ids.length||new Set(ids).size!==ids.length)return null;
 const tiles=ids.map(id=>hand.find(t=>t.id===id));if(tiles.some(t=>!t))return null;
 const played=tiles as NonNullable<typeof tiles[number]>[],label=combo(played)?.label;
 if(!label||!beats(played,g.trick)||hand.length===played.length)return null;
 const showNotice=played.length>3||!seenSizes.has(played.length),reviewMs=showNotice?announcedPlayDuration(played.length):QUICK_PLAY_MS;
 const rally=(g.rally||0)+1,id=OPTIMISTIC_PREFIX+uid(),tablePlay={tiles:played.map(t=>({...t})),who:g.me,id};
 const players=g.players.map((p,i)=>i===g.me?{...p,count:p.count-played.length,hand:hand.filter(t=>!ids.includes(t.id))}:p);
 return {...g,players,trick:played,lastBy:g.me,rally,roundActions:(g.roundActions||0)+1,played:[...(g.played||[]),...played],
  tablePlay,trickPlays:[...(g.trickPlays||[]),tablePlay].slice(-RECENT_TRICK_PLAYS),turn:(g.me+1)%g.players.length,turnReadyAt:now+reviewMs,
  lastEvent:{id,type:'play',who:g.me,tiles:played,label,at:now,rally,showNotice,reviewMs},log:[`${me.name} · ${label} ${played.length}개 제출`,...g.log].slice(0,40)} as View;
}
/** The server's answer to an optimistic play: same player, same tiles. */
export function confirmsOptimistic(pending:{who:number,ids:number[]},event?:{type?:string,who?:number,tiles?:{id:number}[]}|null){
 if(event?.type!=='play'||event.who!==pending.who||event.tiles?.length!==pending.ids.length)return false;
 return event.tiles.every(t=>pending.ids.includes(t.id));
}
