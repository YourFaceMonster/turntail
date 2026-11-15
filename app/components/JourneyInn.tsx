'use client';
import {useState,type CSSProperties,type ReactNode} from 'react';
import QuestCutscene from './QuestCutscene';
import {HighLowGame,MemoryGame} from './InnGames';
import {INNS,innArt,innRegionOf,isInnNode,innRecipeLine,offerableRelics,offeringHeal,HIGH_LOW_GOAL,MEMORY_GOAL,type InnRegion} from '../../lib/rpg-inns';
import {RELIC_GRADES,reworkRelic,rpgMaxHp} from '../../lib/rpg-rework';
import {gameRelic,relicImage} from '../../lib/item-battle-relics';
import type {RpgRun} from '../../lib/rpg';
import {INN_TOURNAMENT,TOURNAMENT_TITLE} from '../../lib/inn-tournament';
import SeatPortrait from './SeatPortrait';
import './journey-inn.css';

type Props={run:RpgRun,busy:boolean,error:string,action:(action:string,extra?:Record<string,unknown>)=>void};
type Mode='arrival'|'menu'|'rumor'|'recipe'|'offer'|'intro'|'game'|'result'|'cup'|'owner'|'regular';
const GRADE_NAME={common:'일반',rare:'희귀',legendary:'전설'} as const;

/** Menu card faces (Codex 2026-11-13, 512px WebP). */
const PORTRAIT_KEYS:Record<string,string>={모란:'moran',도칸:'dokan',모로:'moro',리네:'rine'};
const innPortrait=(name:string)=>`/story/inn-portrait-${PORTRAIT_KEYS[name]}-v1.webp`;
/** Conversation paintings (Codex 2026-11-15): the speaker alone, large, with the bottom kept dark for the dialogue box. */
const innTalk=(name:string)=>({landscape:`/story/inn-talk-${PORTRAIT_KEYS[name]}-wide-v1.webp`,portrait:`/story/inn-talk-${PORTRAIT_KEYS[name]}-portrait-v1.webp`});
const relicName=(id:string)=>reworkRelic(id)?.name||gameRelic(id)?.name||id;

export default function JourneyInnView({run,busy,error,action}:Props){
 const j=run.journey!,node=j.currentNode;const [mode,setMode]=useState<Mode>(()=>j.inns?.[node==='inn-3'?3:2]?.met?'menu':'arrival'),[last,setLast]=useState<{kind:'offer',heal:number}|{kind:'game',score:number,before?:string}|null>(null);
 if(!isInnNode(node))return null;
 const region=innRegionOf(node),def=INNS[region],inn=j.inns?.[region]||{},art=innArt(region);
 const other=region===2?3:2,visitedOther=!!j.inns?.[other]?.met,letterDone=j.letterQuest?.step==='complete';
 const back=()=>{setMode('menu');setLast(null);};
 const meet=()=>{if(!inn.met)action('rpg-inn',{op:'meet'});};
 const scene=(key:string,pairs:readonly (readonly [string,string])[],choices:{label:string,choose:()=>void,disabled?:boolean}[],details?:ReactNode)=>
  <QuestCutscene key={key} title={def.name} speaker={def.owner} speakers={pairs.map(p=>p[0])} lines={pairs.map(p=>p[1])} scene="room" art={art} busts={{[def.owner]:innPortrait(def.owner),[def.regular]:innPortrait(def.regular)}} speakerArt={{[def.owner]:innTalk(def.owner),[def.regular]:innTalk(def.regular)}} busy={busy} error={error} close={()=>{meet();back();}} choices={choices} details={details}/>;
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
 if(mode==='cup'){
  const cup=j.tournament,ready=run.status==='ready';
  // 2026-11-15 feedback: a poster-like bracket instead of a text list, and the buttons always visible.
  return <section className="inn-cup-screen" aria-label="여관 토너먼트" style={{'--inn-art':`url('${art.portrait}')`} as CSSProperties}>
   <div className="inn-cup-board">
    <header className="inn-cup-head"><small>INN CUP · {def.name}</small><h3>여관 토너먼트</h3><p>세 판 중 <b>두 판을 1등</b>으로 마치면 우승</p></header>
    <ol className="inn-cup-bracket">{INN_TOURNAMENT.map((c,i)=>{const won=cup?.finished&&cup.wins.includes(i+1),goal=cup?.finished&&cup.goals.includes(i+1);return <li key={c.name} data-won={won||undefined}>
     <span className="inn-cup-round">{i+1}판</span><span className="inn-cup-face"><SeatPortrait avatar={c.avatar} seat={1}/></span><strong>{c.name}</strong><small>{c.title}</small>
     <p className="inn-cup-goal"><span aria-hidden="true">{goal?'★':'☆'}</span>{c.goal}</p>
    </li>;})}</ol>
    <p className="inn-cup-rules">일반 대결 규칙 · HP·유물·주화는 그대로 · 우승하면 칭호 <b>{TOURNAMENT_TITLE}</b></p>
    {cup?.finished&&<p className="inn-cup-last">지난 도전 · {cup.champion?'🏆 우승':'우승 못 함'} · 1등 {cup.wins.length}판 · 특별 목표 {cup.goals.length}/3</p>}
    {error&&<p role="alert" className="inn-error">{error}</p>}
   </div>
   <footer className="inn-cup-actions"><button className="primary" disabled={busy||!ready} onClick={()=>action('rpg-tournament-start')}>{cup?.finished?'다시 도전':'토너먼트 시작'}</button><button className="secondary" onClick={back}>주점 안을 둘러본다</button></footer>
  </section>;
 }
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
 if(mode==='arrival')return scene('arrival',def.arrival(letterDone,visitedOther),[{label:'주점 안으로 들어간다',choose:()=>{meet();setMode('menu');}}]);
 if(mode==='owner')return scene('owner',def.welcomeBack,[{label:`${def.owner}의 소문 듣기`,choose:()=>{if(!inn.rumor)action('rpg-inn',{op:'rumor'});setMode('rumor');}},{label:'대화를 마친다',choose:back}]);
 if(mode==='regular')return scene('regular',[[def.regular,`${def.regularTitle}라네. 합성 조합법이 궁금한가?`]],[{label:inn.recipeDone?'조합법 다시 듣기':'조합법 듣기',choose:()=>{if(!inn.recipeDone)action('rpg-inn',{op:'recipe'});setMode('recipe');}},toMenu]);
 return <InnRoom region={region} busy={busy} error={error} choose={setMode} leave={()=>action('rpg-journey-map')} champion={!!j.tournament?.champion} gameWon={!!inn.gameWon}/>;
}

/** Hotspots on the inn painting, in % of the image (portrait 1024×1600 / wide 1672×941), like 눈길의 주점. */
type Spot={id:'owner'|'regular'|'offer'|'game'|'cup',x:number,y:number};
const INN_SPOTS:Record<InnRegion,{portrait:Spot[],wide:Spot[]}>={
 2:{portrait:[{id:'owner',x:60,y:19},{id:'regular',x:84,y:29},{id:'offer',x:46,y:57},{id:'game',x:27,y:39},{id:'cup',x:19,y:53}],
    wide:[{id:'owner',x:54,y:19},{id:'regular',x:74,y:37},{id:'offer',x:48,y:62},{id:'game',x:32,y:41},{id:'cup',x:18,y:52}]},
 3:{portrait:[{id:'owner',x:20,y:23},{id:'regular',x:80,y:24},{id:'offer',x:41,y:53},{id:'game',x:45,y:31},{id:'cup',x:19,y:57}],
    wide:[{id:'owner',x:25,y:27},{id:'regular',x:73,y:29},{id:'offer',x:51,y:65},{id:'game',x:46,y:29},{id:'cup',x:12,y:62}]},
};
function InnRoom({region,busy,error,choose,leave,champion,gameWon}:{region:InnRegion,busy:boolean,error:string,choose:(mode:Mode)=>void,leave:()=>void,champion:boolean,gameWon:boolean}){
 const def=INNS[region],art=innArt(region);
 const label=(id:Spot['id'])=>id==='owner'?{name:def.owner,small:`${def.ownerTitle} · 소문`,mode:'owner' as Mode}
  :id==='regular'?{name:def.regular,small:`${def.regularTitle} · 조합법`,mode:'regular' as Mode}
  :id==='game'?{name:region===2?'카운터':'장부 서랍',small:gameWon?`${def.gameName} · 연습`:def.gameName,mode:'intro' as Mode}
  :id==='offer'?{name:region===2?'화로':'기록 상자',small:'유물 바치기',mode:'offer' as Mode}
  :{name:'승부 탁자',small:champion?TOURNAMENT_TITLE:'여관 토너먼트',mode:'cup' as Mode};
 const layer=(kind:'portrait'|'wide')=><div className={`inn-room-art inn-room-${kind}`} style={{'--inn-room-art':`url('${kind==='wide'?art.landscape:art.portrait}')`} as CSSProperties}>
  {INN_SPOTS[region][kind].map(spot=>{const l=label(spot.id),person=spot.id==='owner'||spot.id==='regular';return <button key={spot.id} type="button" className={`inn-spot ${person?'is-person':'is-object'}`} style={{left:`${spot.x}%`,top:`${spot.y}%`}} disabled={busy} onClick={()=>choose(l.mode)} aria-label={`${l.name} · ${l.small}`}><strong>{l.name}</strong>{!person&&<small>{l.small}</small>}</button>;})}
 </div>;
 return <section className="inn-room" role="group" aria-label={`${def.name} · 사람이나 사물을 눌러 보세요`} style={{'--inn-room-fill':`url('${art.portrait}')`} as CSSProperties}>
  {layer('portrait')}{layer('wide')}
  <button className="tavern-door inn-room-door" disabled={busy} onClick={leave}>문 밖으로 →<small>여정 지도로 돌아가기</small></button>
  <p className="tavern-invitation inn-room-invitation">사람이나 사물을 눌러 보세요</p>
  {error&&<p className="journey-error" role="alert">{error}</p>}
 </section>;
}
/** "이야기 다시 보기": replays an inn's first-visit lines (read-only, nothing is recorded). */
export function InnArrivalReplay({run,node,close}:{run:RpgRun,node:'inn-2'|'inn-3',close:()=>void}){
 const region=innRegionOf(node),def=INNS[region],j=run.journey!,other=region===2?3:2;
 const pairs=def.arrival(j.letterQuest?.step==='complete',!!j.inns?.[other]?.met);
 return <QuestCutscene title={`${def.name} · 다시 보기`} speaker={def.owner} speakers={pairs.map(p=>p[0])} lines={pairs.map(p=>p[1])} scene="room" art={innArt(region)} busy={false} close={close} choices={[{label:'다시 보기 닫기',choose:close}]}/>;
}