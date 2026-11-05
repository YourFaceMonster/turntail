'use client';
import {useEffect,useRef,useState} from 'react';
import './quest-cutscene.css';
import EffectText from './EffectText';
import DialogueText,{QuestItemText} from './DialogueText';
import {useDialoguePages} from './useDialoguePages';
import {dialoguePageAt} from '../../lib/quest-dialogue-pages';
import type {ReactNode} from 'react';
import {CrossfadePicture} from './RpgPrologue';
import type {PrologueCut} from '../../lib/rpg-prologue';
import {gameRelic,relicImage} from '../../lib/item-battle-relics';
import {questArt,type QuestArtKey} from '../../lib/rpg-quest-art';
type Choice={label:string,choose:()=>void,disabled?:boolean};
export default function QuestCutscene({title,speaker,speakers,lines,scene,choices,close,busy,error,focus,paintings,reward,background='painting',nextLabel,details}:{title:string,speaker:string,speakers?:readonly string[],lines:string[],scene:PrologueCut['scene'],choices:Choice[],close:()=>void,busy:boolean,error?:string,focus?:string,paintings?:readonly QuestArtKey[],reward?:{id:string,status:string},background?:'painting'|'current',nextLabel?:string,details?:ReactNode}){
 const [rewardOpen,setRewardOpen]=useState(false);
 const text=useRef<HTMLParagraphElement>(null),script=lines.join('\u0000'),pages=useDialoguePages(lines,text),[page,setPage]=useState({script,sourceIndex:0,offset:0});
 if(page.script!==script)setPage({script,sourceIndex:0,offset:0});
 const index=dialoguePageAt(pages,page.sourceIndex,page.offset),sourceIndex=pages[index]?.sourceIndex||0,last=index===pages.length-1,root=useRef<HTMLElement>(null);
 useEffect(()=>{const previous=document.activeElement;root.current?.focus();return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};},[]);
 useEffect(()=>{root.current?.focus({preventScroll:true});},[index]);
 const advance=()=>{if(!busy&&!last){const next=pages[index+1];setPage({script,sourceIndex:next.sourceIndex,offset:pages.slice(0,index+1).filter(p=>p.sourceIndex===next.sourceIndex).reduce((sum,p)=>sum+p.text.replace(/\s/gu,'').length,0)});}};
 const painting=paintings?.[Math.min(sourceIndex,paintings.length-1)];
 const cut:PrologueCut={id:`quest-${title}`,scene,duration:18000,line:pages[index]?.text||'',speaker:speakers?.[sourceIndex]??speaker,audio:'quiet',focus,art:painting?questArt(painting):undefined};
 return <section ref={root} tabIndex={-1} className={`rpg-prologue quest-cutscene ${background==='current'?'is-tavern-conversation':''}`}  role="dialog" aria-modal="true" aria-label={title} data-painting={painting} onClick={event=>{if(!(event.target as HTMLElement).closest('button'))advance();}} onKeyDown={event=>{event.stopPropagation();if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){event.preventDefault();advance();}if(event.key==='Escape'){if(!busy)close();}if(event.key==='Tab'){const nodes=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]),first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){event.preventDefault();end?.focus();}else if(!event.shiftKey&&(document.activeElement===end||document.activeElement===root.current)){event.preventDefault();first?.focus();}}}}>
  {background==='painting'&&<CrossfadePicture cut={cut} hiddenLight={painting==='watchtower-arrival'||painting==='blue-glass-discovery'}/>}<div className="quest-scene-title"><small>여정의 이야기</small><h2>{title}</h2></div>
  <div className={`quest-dialogue ${last?'has-choices':''}`} data-dialogue-page={index+1} data-dialogue-pages={pages.length}><span className="quest-page-count" aria-label="대화 진행">{index+1} / {pages.length}</span>{cut.speaker&&<small className="quest-dialogue-speaker">{cut.speaker}</small>}<button className="quest-dialogue-text" disabled={busy||last} onClick={advance} aria-label={last?'마지막 대사':'대사를 읽고 다음 장면으로'}><p ref={text}><DialogueText text={cut.line} questItems/></p></button>
  <div className="npc-dialogue-details">{last&&details}</div>
  {last&&<div className="quest-scene-choices">{reward?<><button className="secondary" disabled={busy} onClick={()=>setRewardOpen(true)}>푸른 유리 · 유물 확인</button><button className="secondary" disabled={busy} onClick={close}>지도로 돌아간다</button></>:choices.map(choice=><button key={choice.label} className="secondary" disabled={busy||choice.disabled} onClick={choice.choose}><QuestItemText text={choice.label}/></button>)}</div>}{error&&<p role="alert">{error}</p>}</div>
  {last&&reward&&rewardOpen&&<QuestRewardPopup reward={reward} choices={choices} busy={busy} close={()=>setRewardOpen(false)}/>}


 </section>;
}

function QuestRewardPopup({reward,choices,busy,close}:{reward:{id:string,status:string},choices:Choice[],busy:boolean,close:()=>void}){
 const dialog=useRef<HTMLElement>(null);
 useEffect(()=>{const previous=document.activeElement;dialog.current?.focus();return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus();};},[]);
 return <div className="quest-reward-overlay" onClick={event=>event.stopPropagation()}><section ref={dialog} tabIndex={-1} className="quest-reward-popup" role="dialog" aria-modal="true" aria-label="발견한 유물" onKeyDown={event=>{event.stopPropagation();if(event.key==='Escape'&&!busy)close();if(event.key==='Tab'){const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]),first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){event.preventDefault();first?.focus();}}}}><button className="close" aria-label="유물 확인 닫기" disabled={busy} onClick={close}>×</button><small>발견한 유물</small><img src={relicImage(reward.id)} alt=""/><h3>{gameRelic(reward.id)?.name}</h3><p><EffectText text={gameRelic(reward.id)?.effect||''}/></p><p className="quest-reward-status">{reward.status}</p><div>{choices.map(choice=><button key={choice.label} className="secondary" disabled={busy||choice.disabled} onClick={choice.choose}>{choice.label}</button>)}</div></section></div>;
}
