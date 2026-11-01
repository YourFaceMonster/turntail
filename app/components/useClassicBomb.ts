"use client";
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {Game} from '../../lib/game';
import {BOMB_REACTION_MS,createBombGame,transitionBomb,bombView,type BombState,type BombAction} from '../../lib/bomb-market';
import {chooseBombAction} from '../../lib/bomb-market-ai';
import {BOMB_SAVE_KEY,readBombSave,saveBombGame,recordBombGame,readBombRecords,type BombRecord} from '../../lib/bomb-market-storage';
import {bombClassicEvent,bombClassicProjection,type BombClassicView} from '../../lib/bomb-classic';
export type BombPresentation={state:BombState;source:Game;display:BombClassicView};
export default function useClassicBomb(enabled:boolean,running:boolean,avatar:string,onChange:(next:BombPresentation)=>void){
 const current=useRef<BombPresentation|null>(null),[presentation,setPresentation]=useState<BombPresentation|null>(null),[saved,setSaved]=useState(false),[records,setRecords]=useState<BombRecord[]>([]),[error,setError]=useState(''),wakeReaction=useRef(false),listener=useRef(onChange);
 useLayoutEffect(()=>{listener.current=onChange;},[onChange]);
 useEffect(()=>{if(!enabled)return;let active=true;void Promise.resolve().then(()=>{if(!active)return;try{setSaved(!!localStorage.getItem(BOMB_SAVE_KEY));setRecords(readBombRecords(localStorage));const loaded=readBombSave(localStorage);if(loaded.error)setError(loaded.error);}catch(e){setError(String(e));}});return()=>{active=false;};},[enabled]);
 const install=useCallback((state:BombState,event?:Parameters<typeof bombClassicProjection>[3],photo=avatar)=>{
  saveBombGame(localStorage,state);const projected=bombClassicProjection(state,photo,current.current?.source,event),next={state,...projected};current.current=next;setPresentation(next);setSaved(true);setError('');listener.current(next);
  try{recordBombGame(localStorage,state);if(state.phase==='complete')setRecords(readBombRecords(localStorage));}catch(e){setError(e instanceof Error?e.message:String(e));}
  return next;
 },[avatar]);
 const dispatch=useCallback((action:BombAction,who=0,expected?:number)=>{const old=current.current;if(!old)throw Error('폭탄시장전을 먼저 시작해 주세요.');const now=Date.now(),next=transitionBomb(old.state,who,action,expected??old.state.revision,now);if(next!==old.state)install(next,bombClassicEvent(old.state,next,who,action,now));},[install]);
 const start=useCallback((name:string)=>{wakeReaction.current=true;current.current=null;return install(createBombGame(name));},[install]);
 const resume=useCallback(()=>{const loaded=readBombSave(localStorage);if(!loaded.game)throw Error(loaded.error||'이어갈 폭탄시장전이 없어요.');wakeReaction.current=true;current.current=null;return install(loaded.game);},[install]);
 const reviewOpening=useCallback(()=>{const old=current.current;if(old)install(old.state,{id:`${old.state.id}:opening:${old.state.round}`,type:'deal',who:old.state.turn,at:Date.now()});},[install]);
 const rename=useCallback((name:string,photo:string)=>{const old=current.current;if(!old)return;const state=structuredClone(old.state);state.players[0].name=name;state.revision++;if(state.reaction)state.reaction.id=state.revision;install(state,undefined,photo);},[install]);
 const leave=useCallback(()=>{current.current=null;setPresentation(null);},[]);
 useEffect(()=>{
  if(!enabled||!running||!presentation||presentation.state.phase!=='playing'){if(!running)wakeReaction.current=true;return;}
  if(wakeReaction.current){if(presentation.state.reaction){const resume=setTimeout(()=>{if(current.current?.state.revision!==presentation.state.revision)return;wakeReaction.current=false;const state=structuredClone(presentation.state),now=Date.now();state.revision++;state.reaction={id:state.revision,startedAt:now,deadline:now+BOMB_REACTION_MS};try{install(state);}catch(e){setError(String(e));}},0);return()=>clearTimeout(resume);}wakeReaction.current=false;}
  const captured=presentation.state,started=Date.now(),considered=new Set<number>();
  const timer=setInterval(()=>{if(current.current?.state.revision!==captured.revision)return;const now=Date.now();try{if(captured.reaction){if(now>=captured.reaction.deadline){dispatch({type:'tick'},0,captured.revision);return;}for(let seat=1;seat<3;seat++){if(considered.has(seat)||now<captured.reaction.startedAt+650+seat*170)continue;considered.add(seat);const action=chooseBombAction(bombView(captured,seat),now);if(action){dispatch(action,seat,captured.revision);return;}}}else if(captured.turn!==0&&now>=Math.max(started+650,presentation.source.turnReadyAt||0)){const action=chooseBombAction(bombView(captured,captured.turn),now);if(action)dispatch(action,captured.turn,captured.revision);}}catch(e){setError(e instanceof Error?e.message:String(e));}},80);
  return()=>clearInterval(timer);
 },[enabled,running,presentation,dispatch,install]);
 return {presentation,saved,records,error,start,resume,leave,dispatch,reviewOpening,rename};
}
