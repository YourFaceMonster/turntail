'use client';
import {useEffect,useRef,useState} from 'react';
import './quest-cutscene.css';
import {CrossfadePicture} from './RpgPrologue';
import type {PrologueCut} from '../../lib/rpg-prologue';
import {gameRelic,relicImage} from '../../lib/item-battle-relics';
import {questArt,type QuestArtKey} from '../../lib/rpg-quest-art';
type Choice={label:string,choose:()=>void,disabled?:boolean};
export default function QuestCutscene({title,speaker,speakers,lines,scene,choices,close,busy,error,focus,paintings,reward}:{title:string,speaker:string,speakers?:readonly string[],lines:string[],scene:PrologueCut['scene'],choices:Choice[],close:()=>void,busy:boolean,error?:string,focus?:string,paintings?:readonly QuestArtKey[],reward?:{id:string,status:string}}){
 const script=lines.join('\u0000'),[page,setPage]=useState({script,index:0});
 if(page.script!==script)setPage({script,index:0});
 const index=page.index,last=index===lines.length-1,root=useRef<HTMLElement>(null);
 useEffect(()=>{const previous=document.activeElement;root.current?.focus();return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};},[]);
 const advance=()=>{if(!busy&&!last)setPage({script,index:index+1});};
 const painting=paintings?.[Math.min(index,paintings.length-1)];
 const cut:PrologueCut={id:`quest-${title}`,scene,duration:18000,line:lines[index],speaker:speakers?.[index]??speaker,audio:'quiet',focus,art:painting?questArt(painting):undefined};
 return <section ref={root} tabIndex={-1} className="rpg-prologue quest-cutscene" role="dialog" aria-modal="true" aria-label={title} data-painting={painting} onClick={event=>{if(!(event.target as HTMLElement).closest('button'))advance();}} onKeyDown={event=>{event.stopPropagation();if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){event.preventDefault();advance();}if(event.key==='Escape'){if(!busy)close();}if(event.key==='Tab'){const nodes=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]),first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){event.preventDefault();end?.focus();}else if(!event.shiftKey&&(document.activeElement===end||document.activeElement===root.current)){event.preventDefault();first?.focus();}}}}>
  <CrossfadePicture cut={cut} hiddenLight={painting==='watchtower-arrival'||painting==='blue-glass-discovery'}/><div className="quest-scene-title"><small>여정의 이야기</small><h2>{title}</h2></div>
  <div className="quest-dialogue"><button className="quest-dialogue-text" disabled={busy||last} onClick={advance} aria-label={last?'마지막 대사':'대사를 읽고 다음 장면으로'}>{cut.speaker&&<small>{cut.speaker}</small>}<p key={index}>{lines[index]}</p></button>
  {last&&reward&&<div className="quest-relic-reward"><img src={relicImage(reward.id)} alt=""/><div><strong>{gameRelic(reward.id)?.name}</strong><p>{gameRelic(reward.id)?.effect}</p><small>{reward.status}</small></div></div>}
  {last&&<div className="quest-scene-choices">{choices.map(choice=><button key={choice.label} className="secondary" disabled={busy||choice.disabled} onClick={choice.choose}>{choice.label}</button>)}</div>}{error&&<p role="alert">{error}</p>}</div>
  <button className="prologue-skip" disabled={busy} onClick={close}>돌아가기 ↗</button>
 </section>;
}
