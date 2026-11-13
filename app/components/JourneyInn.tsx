'use client';
import {useState,type CSSProperties,type ReactNode} from 'react';
import QuestCutscene from './QuestCutscene';
import {HighLowGame,MemoryGame} from './InnGames';
import {INNS,innArt,innRegionOf,isInnNode,innRecipeLine,offerableRelics,offeringHeal,HIGH_LOW_GOAL,MEMORY_GOAL,type InnRegion} from '../../lib/rpg-inns';
import {RELIC_GRADES,reworkRelic,rpgMaxHp} from '../../lib/rpg-rework';
import {gameRelic,relicImage} from '../../lib/item-battle-relics';
import type {RpgRun} from '../../lib/rpg';
import './journey-inn.css';

type Props={run:RpgRun,busy:boolean,error:string,action:(action:string,extra?:Record<string,unknown>)=>void};
type Mode='arrival'|'menu'|'rumor'|'recipe'|'offer'|'intro'|'game'|'result';
const GRADE_NAME={common:'일반',rare:'희귀',legendary:'전설'} as const;

/** Menu card faces (Codex 2026-11-13, 512px WebP). */
const PORTRAIT_KEYS:Record<string,string>={모란:'moran',도칸:'dokan',모로:'moro',리네:'rine'};
const innPortrait=(name:string)=>`/story/inn-portrait-${PORTRAIT_KEYS[name]}-v1.webp`;
const relicName=(id:string)=>reworkRelic(id)?.name||gameRelic(id)?.name||id;

export default function JourneyInnView({run,busy,error,action}:Props){
 const j=run.journey!,node=j.currentNode;const [mode,setMode]=useState<Mode>(()=>j.inns?.[node==='inn-3'?3:2]?.met?'menu':'arrival'),[last,setLast]=useState<{kind:'offer',heal:number}|{kind:'game',score:number,before?:string}|null>(null);
 if(!isInnNode(node))return null;
 const region=innRegionOf(node),def=INNS[region],inn=j.inns?.[region]||{},art=innArt(region);
 const other=region===2?3:2,visitedOther=!!j.inns?.[other]?.met,letterDone=j.letterQuest?.step==='complete';
 const back=()=>{setMode('menu');setLast(null);};
 const meet=()=>{if(!inn.met)action('rpg-inn',{op:'meet'});};
 const scene=(key:string,pairs:readonly (readonly [string,string])[],choices:{label:string,choose:()=>void,disabled?:boolean}[],details?:ReactNode)=>
  <QuestCutscene key={key} title={def.name} speaker={def.owner} speakers={pairs.map(p=>p[0])} lines={pairs.map(p=>p[1])} scene="room" art={art} busy={busy} error={error} close={()=>action('rpg-journey-map')} choices={choices} details={details}/>;
 const toMenu={label:'주점 안을 둘러본다',choose:back};

 if(mode==='result'&&last?.kind==='game'){
  const prize=!last.before&&inn.gameRelic,won=def.game==='high-low'?last.score>=HIGH_LOW_GOAL:last.score>0&&last.score<=MEMORY_GOAL;
  const lines:[string,string][]=[...(won?def.gameWin:def.gameMiss).map(p=>[...p] as [string,string]),...(won&&prize?[['',`${relicName(prize)}을(를) 받았어요.`] as [string,string]]:won&&inn.gameWon&&last.before?[[def.gameHost,'보상은 처음 한 번뿐입니다. 그래도 좋은 판이었어요.'] as [string,string]]:[])];
  return scene(`result-${inn.gameRelic||'none'}-${last.score}`,lines,[{label:'한 판 더',choose:()=>setMode('game')},toMenu],prize?<p className="inn-prize"><img src={relicImage(prize)} alt=""/><span><b>{relicName(prize)}</b><small>{reworkRelic(prize)?.effect}</small></span></p>:undefined);
 }
 if(mode==='intro')return scene('intro',def.gameIntro,[{label:inn.gameWon?'연습 한 판 시작':'한 판 시작',choose:()=>setMode('game')},toMenu]);
 if(mode==='rumor')return scene('rumor',def.rumor,[toMenu]);
 if(mode==='recipe'){
  const line=innRecipeLine(inn.recipe),extra=innRecipeLine(inn.recipeExtra),pairs=inn.recipeDone&&line?[...def.recipeIntro,[def.regular,line] as const,...(extra?[[def.regular,'그 깃펜, 모르 집안 물건이지? 그럼 하나 더 알려 주지.'] as const,[def.regular,extra] as const]:[]),['','소문 수첩에 조합법을 적어 두었어요.'] as const]:inn.recipeDone?def.recipeNone:def.recipeIntro;
  return scene(`recipe-${inn.recipeDone?'done':'wait'}`,pairs,[toMenu]);
 }
 /** Menu and offering are panels over the inn painting: the cutscene box is sized for two choices only. */
 const panel=(label:string,body:ReactNode)=><section className="journey-inn-panel" aria-label={label} style={{'--inn-art':`url('${art.portrait}')`} as CSSProperties}><div className="journey-inn-card"><header><small>{label===def.name?'모르 삼남매의 주점':def.name}</small><h3>{label}</h3></header>{body}</div></section>;
 if(mode==='game')return panel(def.gameName,def.game==='high-low'?<HighLowGame finish={score=>{setLast({kind:'game',score,before:inn.gameRelic});action('rpg-inn',{op:'game',score});setMode('result');}} quit={back}/>:<MemoryGame finish={score=>{setLast({kind:'game',score,before:inn.gameRelic});action('rpg-inn',{op:'game',score});setMode('result');}} quit={back}/>);
 if(mode==='offer'){
  const max=run.rework?rpgMaxHp(run):100,full=run.hp[0]>=max,list=offerableRelics(run);
  const pairs=last?.kind==='offer'?def.offerThanks(last.heal):def.offerIntro;
  return panel(`유물 바치기 · ${def.offerLabel}`,<div className="inn-offer">
   {pairs.map(([who,line],i)=><p key={i} className="inn-line">{who&&<b>{who}</b>}{line}</p>)}
   <p className="inn-offer-hp">현재 HP <b>{run.hp[0]}</b>/{max}{full&&' · 가득 찼어요'}</p>
   {list.length?<ul>{list.map(id=>{const heal=offeringHeal(id),grade=RELIC_GRADES[id]||'common';return <li key={id}><img src={relicImage(id)} alt=""/><span><b>{relicName(id)}</b><small>{GRADE_NAME[grade]} · HP +{Math.min(heal,max-run.hp[0])}</small></span><button className="secondary" disabled={busy||full} onClick={()=>{setLast({kind:'offer',heal:Math.min(heal,max-run.hp[0])});action('rpg-inn',{op:'offer',id});}}>{def.offerLabel}</button></li>;})}</ul>
    :<p className="inn-offer-empty">바칠 수 있는 유물이 없어요. 장착한 유물은 여행 가방에서 장착을 해제해야 바칠 수 있어요.</p>}
   <p className="inn-offer-note">바친 유물은 돌아오지 않아요. 등급이 높을수록 많이 회복해요(일반 15 · 희귀 25 · 전설 40).</p>
   {error&&<p role="alert" className="inn-error">{error}</p>}
   <button className="primary full" onClick={back}>주점 안을 둘러본다</button>
  </div>);
 }
 if(mode==='arrival')return scene('arrival',def.arrival(letterDone,visitedOther),[{label:'주점 안으로 들어간다',choose:()=>{meet();setMode('menu');}}]); const [owner,line]=def.welcomeBack[0];
 return panel(def.name,<div className="inn-menu">
  <p className="inn-line"><b>{owner}</b>{line}</p>
  <ul className="inn-people"><li><img src={innPortrait(def.owner)} alt=""/><span><b>{def.owner}</b><small>{def.ownerTitle} · {def.pet}</small></span></li><li><img src={innPortrait(def.regular)} alt=""/><span><b>{def.regular}</b><small>{def.regularTitle}</small></span></li></ul>
  <div className="inn-menu-actions">
   <button className="secondary" onClick={()=>{if(!inn.rumor)action('rpg-inn',{op:'rumor'});setMode('rumor');}}><b>{def.owner}의 소문</b><small>{inn.rumor?'다시 듣기':'소문 수첩에 적어요'}</small></button>
   <button className="secondary" onClick={()=>{if(!inn.recipeDone)action('rpg-inn',{op:'recipe'});setMode('recipe');}}><b>{def.regular}의 조합법</b><small>{inn.recipeDone?'다시 듣기':'합성 조합법 1개'}</small></button>
   <button className="secondary" onClick={()=>setMode('offer')}><b>유물 바치기</b><small>{def.offerLabel} · HP 회복</small></button>
   <button className="secondary" onClick={()=>setMode('intro')}><b>{def.gameName}</b><small>{inn.gameWon?'연습 · 보상은 받았어요':'처음 달성하면 유물 1개'}</small></button>
  </div>
  <button className="primary full" onClick={()=>action('rpg-journey-map')}>지도로 돌아간다</button>
 </div>);
}
/** "이야기 다시 보기": replays an inn's first-visit lines (read-only, nothing is recorded). */
export function InnArrivalReplay({run,node,close}:{run:RpgRun,node:'inn-2'|'inn-3',close:()=>void}){
 const region=innRegionOf(node),def=INNS[region],j=run.journey!,other=region===2?3:2;
 const pairs=def.arrival(j.letterQuest?.step==='complete',!!j.inns?.[other]?.met);
 return <QuestCutscene title={`${def.name} · 다시 보기`} speaker={def.owner} speakers={pairs.map(p=>p[0])} lines={pairs.map(p=>p[1])} scene="room" art={innArt(region)} busy={false} close={close} choices={[{label:'다시 보기 닫기',choose:close}]}/>;
}