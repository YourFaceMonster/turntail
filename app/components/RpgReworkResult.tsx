'use client';
import {useEffect,useState,type CSSProperties,type ReactNode} from 'react';
import type {view} from '../../lib/game';
import {rpgMaxHp,reworkRelic} from '../../lib/rpg-rework';
import type {RpgStageReward} from '../../lib/rpg-phase-one';
import {relicImage} from '../../lib/item-battle-relics';
import {pendingStageStory,storySceneKey} from '../../lib/rpg-story-cards';
import {journeyScenes} from '../../lib/rpg-chapter-scenes';
import {JourneyStoryChrome} from './RpgJourneyScene';
import RpgPrologue from './RpgPrologue';
import StoryCardCollection from './StoryCardCollection';
import TileFace from './TileFace';
import {cue,cueOnce} from '../../lib/sound-cues';
import SeatPortrait from './SeatPortrait';
import {RpgHpBar} from './RpgHpBar';
import {seatPanelTheme} from '../../lib/seat-presentation';

export default function RpgReworkResult({game,busy,choose,next,newRun,exit,markSeen,equip}:{
 game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean,id?:string)=>void,
 next:()=>void,newRun:()=>void,exit:()=>void,markSeen?:(id:string)=>void,equip?:(id:string,replace?:string)=>void,playerAvatar?:ReactNode}){
 const run=game.rpgRun!,clear=run.phaseOne?.clear,report=run.roundHealth;
 const [selected,setSelected]=useState(''),[seen,setSeen]=useState(false),[replay,setReplay]=useState(false);
 const seats=run.rework!.settledSeats||game.result?.players.flatMap((p,i)=>p.place>0?[i]:[])||[];
 const failed=run.status==='game-over',complete=run.status==='complete',offers=clear?.relicOffers||[];
 const story=replay||!seen&&pendingStageStory(run);
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{
  const key=`result:${game.code}:${run.stage}:${game.round}`,mine=run.hp[game.me]-(report?.before[game.me]??run.hp[game.me]);
  if(failed)cueOnce(key,'fail');
  else if(complete||run.status==='allocation'||run.status==='ready'){cueOnce(key,'clear');if(run.status==='allocation'&&[3,6,9].includes(run.stage))cueOnce(`${key}:card`,'storyCard',1.4);}
  else if(mine<0)cueOnce(key,'hit');else if(mine>0)cueOnce(key,'heal');
 },[]);
 return <><div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result rpg-rework-result" role="dialog" aria-modal="true" aria-label="RPG 판 정산">
  <header className="settlement-header"><span className="eyebrow">RPG · STAGE {run.stage} · {game.round}판</span><h2>이번 판 정산</h2>
  <p>{failed?'HP가 0이 되어 여정이 끝났어요.':complete?'노르문의 여정을 마쳤어요.':run.status==='allocation'?`스테이지 ${run.stage} 클리어!`:'남은 패수로 HP를 정산했어요.'}</p></header>
  <div className="hp-settlement">{seats.slice().sort((a,b)=>(game.result?.players[a].place||0)-(game.result?.players[b].place||0)).map(seat=>{
   const player=game.players[seat],row=game.result?.players[seat],before=report?.before[seat]??run.hp[seat],delta=row?.delta||0,theme=seatPanelTheme(seat);
   const tied=game.result?.players.some((other,i)=>i!==seat&&other.place===row?.place&&other.place>0);
   const net=run.hp[seat]-before,netText=net>0?`+${net}`:net<0?`−${-net}`:'±0';
   return <article key={seat} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}>
    <RpgHpBar maxHp={rpgMaxHp(run,seat)} hp={reveal?run.hp[seat]:before} owner={player.name}
     summary={<span className="round-hp-totals" aria-label={`이번 판 손실 ${report?.damage[seat]||0}, 획득 ${report?.healing[seat]||0}, 최종 ${netText}`}><span className="hp-lost">손실 −{report?.damage[seat]||0}</span><span className="hp-recovered">획득 +{report?.healing[seat]||0}</span><b className={`hp-net ${net<0?'is-loss':net>0?'is-gain':'is-even'}`}>최종 {netText}</b></span>}
     identity={<><SeatPortrait avatar={player.avatar} seat={seat}/><strong>{player.name}<small>{tied?'공동 ':''}{row?.place}등</small></strong></>}/>
    <div className="compact-hp-breakdown"><p className="round-money-detail">남은 패 {row?.count}장 · <b className={delta>0?'hp-recovered':delta<0?'hp-lost':''}>{`패 정산 ${delta>0?'+':''}${delta} HP`}</b>{delta!==net&&<small> · 상한·유물 회복 반영</small>}</p>{run.hp[seat]===0&&<p>탈락 · 다음 판 분배 제외</p>}</div>
   </article>;
  })}</div>
  {run.status==='playing'&&<><p>다음 판은 손패 10장씩 · 바닥 30장으로 겨뤄요. 누구든 HP가 0이 되면 스테이지가 끝나요.</p><button className="primary full" disabled={busy} onClick={()=>{cue('confirm');next();}}>다음 판 →</button></>}
  {run.status==='allocation'&&<><h3>{[3,6,9].includes(run.stage)?'다음 챕터 시작 유물':'유물 보상'} · {offers.length}개 중 1개</h3><div className="rpg-relic-offers">{offers.map(id=>{const relic=reworkRelic(id)!;return <button key={id} className={selected===id?'chosen':''} disabled={busy} aria-pressed={selected===id} onClick={()=>{cue('click');setSelected(id);}}><img src={relicImage(id)} alt=""/><strong>{relic.name}</strong><small>{relic.effect}</small></button>;})}</div><button className="primary full" disabled={busy||offers.length>0&&!offers.includes(selected)} onClick={()=>choose('relic',undefined,!offers.length,selected||undefined)}>{offers.length?'선택한 유물 받기':'보상 확인'}</button></>}
  <details className="result-details"><summary>남은 손패 보기</summary>{seats.map(seat=>{const player=game.players[seat];return <section className="result-hand-row" key={seat}><h3><SeatPortrait avatar={player.avatar} seat={seat}/>{player.name}<small>{player.count}장</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?`남은 패 ${player.count}장`:'모두 냈어요.'}</small>}</div></section>;})}</details>
  {run.status==='ready'&&<button className="primary full" disabled={busy} onClick={()=>{cue([3,6,9].includes(run.stage)?'heal':'confirm');next();}}>다음 스테이지 →</button>}
  {complete&&<StoryCardCollection cards={run.storyCards}/>}
  {(failed||complete)&&<button className="primary full" disabled={busy} onClick={newRun}>새 여정 시작</button>}
  {clear&&!failed&&<button className="text-btn full" onClick={()=>setReplay(true)}>승리 이야기 다시 보기</button>}
  <button className="text-btn full" disabled={busy} onClick={()=>{cue('back');exit();}}>저장하고 나가기</button>
 </section></div>{story&&<RpgPrologue cuts={journeyScenes(run.stage,run).after} chrome={<JourneyStoryChrome run={run} busy={busy} error="" action={(action,extra)=>{if(action==='rpg-journey-equip')equip?.(String(extra?.id),extra?.replace as string|undefined);}} exit={exit} playerName={game.players[0].name}/>} label={run.stage===10?'여정의 끝':'스테이지 승리 후 장면'} enter={()=>{if(replay)setReplay(false);else{setSeen(true);markSeen?.(storySceneKey(run.stage));}}}/>}</>;
}
