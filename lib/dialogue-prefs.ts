/**
 * Dialogue auto-advance preference, shared by story cutscenes and quest conversations.
 * Story cutscenes have always run on a timer, so "auto" defaults to on there; quest conversations
 * default to manual. A player who turns one off keeps it off for both until they turn it back on.
 */
const KEY='turntale-dialogue-auto';
type Listener=()=>void;
const listeners=new Set<Listener>();
let memory:boolean|null=null;
function stored():boolean|null{
 try{const value=localStorage.getItem(KEY);return value==='1'?true:value==='0'?false:null;}catch{return memory;}
}
/** null = the player never chose; each screen then uses its own default. */
export function dialogueAutoChoice():boolean|null{return stored()??memory;}
export function setDialogueAuto(value:boolean){
 memory=value;try{localStorage.setItem(KEY,value?'1':'0');}catch{}
 listeners.forEach(listener=>listener());
}
export function subscribeDialogueAuto(listener:Listener){listeners.add(listener);return()=>{listeners.delete(listener);};}
/** Reading time for one page of quest dialogue: a short base plus a little per visible character. */
export function autoPageDelay(text:string){const length=text.replace(/\s/gu,'').length;return Math.min(9000,1800+length*90);}
