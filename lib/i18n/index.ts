/**
 * English version (2026-11-20 user decision). Korean stays the source text: screen code wraps each Korean
 * sentence in tr('…'), and the Korean sentence itself is the key into the English table (lib/i18n/en.ts).
 * A sentence the table does not have yet shows in Korean, so a missed spot never breaks the screen.
 *
 * Language: the device language decides (Korean device → Korean, anything else → English), and the player can
 * change it in Settings (stored on this device). The language is fixed for a page load; changing it reloads.
 *
 * Until every step of docs/english-localization-plan-2026-11-20.md is done, English is only reachable with
 * ?lang=en (ENGLISH_READY=false), so players never see a half-translated game.
 */
import {EN} from './en.ts';

export type Lang='ko'|'en';
export const ENGLISH_READY=false;
const STORAGE_KEY='turntale-lang';

function readStored():Lang|null{try{const v=globalThis.localStorage?.getItem(STORAGE_KEY);return v==='ko'||v==='en'?v:null;}catch{return null;}}
function readQuery():Lang|null{try{const v=new URLSearchParams(globalThis.location?.search||'').get('lang');return v==='ko'||v==='en'?v:null;}catch{return null;}}
function deviceLang():Lang{const list=globalThis.navigator?.languages?.length?globalThis.navigator.languages:[globalThis.navigator?.language||'ko'];return list.some(l=>/^ko\b/i.test(l))?'ko':'en';}

/** Decide the language for this page load. Exported for tests. */
export function detectLang(input:{query:Lang|null,stored:Lang|null,device:Lang,ready:boolean,page?:boolean}):Lang{
 if(input.query)return input.query;
 // No page (game server, tests): always Korean, so server data and messages never change language.
 if(input.page===false)return 'ko';
 if(!input.ready)return 'ko';
 return input.stored||input.device;
}

let current:Lang=detectLang({query:readQuery(),stored:readStored(),device:deviceLang(),ready:ENGLISH_READY,page:typeof globalThis.document!=='undefined'});
try{if(globalThis.document)document.documentElement.lang=current;}catch{/* no DOM (server, tests) */}
export const lang=()=>current;
/** The language picker shows once English is complete, or while testing with ?lang=… in the address. */
export const langPickerVisible=()=>ENGLISH_READY||readQuery()!==null;
/** Tests only. */
export function setLangForTest(next:Lang){current=next;}

/** Save the choice and reload so every screen and data table is built again in that language. */
export function chooseLang(next:Lang){
 try{globalThis.localStorage?.setItem(STORAGE_KEY,next);}catch{/* private mode: still switch for this load */}
 try{const url=new URL(location.href);url.searchParams.delete('lang');location.replace(url.href);}catch{current=next;}
}

// A value that is itself Korean screen text (a combo name, a character name kept Korean because code compares it)
// is shown in the current language too.
const word=(v:unknown)=>typeof v==='string'&&current==='en'&&EN[v]!==undefined?EN[v]:String(v);
const fill=(text:string,vars?:Record<string|number,unknown>)=>vars?text.replace(/\{(\w+)\}/g,(m,k)=>k in vars?word(vars[k]):m):text;

/** Korean source sentence → the sentence for the current language. {name} placeholders are filled from vars. */
export function tr(ko:string,vars?:Record<string|number,unknown>):string{
 return fill(current==='en'&&EN[ko]!==undefined?EN[ko]:ko,vars);
}

/** Show a value from game data (a name, a combo label) in the current language; anything else is returned as is. */
export function trv<T>(value:T):T{return (typeof value==='string'&&current==='en'&&EN[value]!==undefined?EN[value]:value) as T;}
