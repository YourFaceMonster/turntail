'use client';
import {useState,type ReactNode} from 'react';
import type {view} from '../../lib/game';
import {rpgMaxHp,reworkRelic} from '../../lib/rpg-rework';
import type {RpgStageReward} from '../../lib/rpg-phase-one';
import {relicImage} from '../../lib/item-battle-relics';
import {pendingStageStory,storySceneKey} from '../../lib/rpg-story-cards';
import {RPG_CONNECTION_SCENES} from '../../lib/rpg-connection-scenes';
import {JourneyStoryChrome} from './RpgJourneyScene';
import RpgPrologue from './RpgPrologue';
import StoryCardCollection from './StoryCardCollection';
import TileFace from './TileFace';

export default function RpgReworkResult({game,busy,choose,next,newRun,exit,markSeen,equip}:{
 game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean,id?:string)=>void,
 next:()=>void,newRun:()=>void,exit:()=>void,markSeen?:(id:string)=>void,equip?:(id:string,replace?:string)=>void,playerAvatar?:ReactNode}){
 const run=game.rpgRun!,clear=run.phaseOne?.clear,report=run.roundHealth;
 const [selected,setSelected]=useState(''),[seen,setSeen]=useState(false),[replay,setReplay]=useState(false);
 const seats=run.rework!.settledSeats||game.result?.players.flatMap((p,i)=>p.place>0?[i]:[])||[];
 const failed=run.status==='game-over',complete=run.status==='complete',offers=clear?.relicOffers||[];
 const story=replay||!seen&&pendingStageStory(run);
 return <><div className="modal-shade result-shade"><section className="modal rpg-result rpg-stage-result" role="dialog" aria-modal="true" aria-label="RPG 판 정산">
  <span className="eyebrow">RPG · STAGE {run.stage} · {game.round}판</span><h2>이번 판 정산</h2>
  <p>{failed?'HP가 0이 되어 여정이 끝났어요.':complete?'노르문의 여정을 마쳤어요.':run.status==='allocation'?`스테이지 ${run.stage} 클리어!`:'남은 패수로 HP를 정산했어요.'}</p>
  <div className="hp-settlement">{seats.slice().sort((a,b)=>(game.result?.players[a].place||0)-(game.result?.players[b].place||0)).map(seat=>{
   const row=game.result?.players[seat],before=report?.before[seat]??run.hp[seat],delta=row?.delta||0;
   const tied=game.result?.players.some((other,i)=>i!==seat&&other.place===row?.place&&other.place>0);
   return <article key={seat}><h3>{game.players[seat].name} · {tied?'공동 ':''}{row?.place}등</h3><p>남은 패 {row?.count}장 · 패 정산 {delta>=0?'+':''}{delta} HP</p><p>HP {before} → <b>{run.hp[seat]}/{rpgMaxHp(run,seat)}</b></p><small>실제 획득 +{report?.healing[seat]||0} / 손실 −{report?.damage[seat]||0} · 상한·유물 회복 포함</small>{run.hp[seat]===0&&<p>탈락 · 다음 판 분배 제외</p>}</article>;
  })}</div>
  {run.status==='playing'&&<><p>{run.hp.filter(hp=>hp>0).length===2?'다음 판은 손패 12장씩 · 바닥 36장으로 겨뤄요.':'다음 판은 손패 10장씩 · 바닥 30장으로 겨뤄요.'}</p><button className="primary full" disabled={busy} onClick={next}>다음 판 →</button></>}
  {run.status==='allocation'&&<><h3>{[3,6,9].includes(run.stage)?'다음 챕터 시작 유물':'유물 보상'} · {offers.length}개 중 1개</h3><div className="rpg-relic-offers">{offers.map(id=>{const relic=reworkRelic(id)!;return <button key={id} className={selected===id?'chosen':''} disabled={busy} aria-pressed={selected===id} onClick={()=>setSelected(id)}><img src={relicImage(id)} alt=""/><strong>{relic.name}</strong><small>{relic.effect}</small></button>;})}</div><button className="primary full" disabled={busy||offers.length>0&&!offers.includes(selected)} onClick={()=>choose('relic',undefined,!offers.length,selected||undefined)}>{offers.length?'선택한 유물 받기':'보상 확인'}</button></>}
  <details className="result-details"><summary>남은 손패 보기</summary>{seats.map(seat=><section className="result-hand-row" key={seat}><h3>{game.players[seat].name}</h3><div>{game.players[seat].hand?.map(tile=><TileFace tile={tile} key={tile.id}/>)}</div></section>)}</details>
  {run.status==='ready'&&<button className="primary full" disabled={busy} onClick={next}>다음 스테이지 →</button>}
  {complete&&<StoryCardCollection cards={run.storyCards}/>}
  {(failed||complete)&&<button className="primary full" disabled={busy} onClick={newRun}>새 여정 시작</button>}
  {clear&&!failed&&<button className="text-btn full" onClick={()=>setReplay(true)}>승리 이야기 다시 보기</button>}
  <button className="text-btn full" disabled={busy} onClick={exit}>저장하고 나가기</button>
 </section></div>{story&&<RpgPrologue cuts={RPG_CONNECTION_SCENES[String(run.stage)]?.after||[]} chrome={<JourneyStoryChrome run={run} busy={busy} error="" action={(action,extra)=>{if(action==='rpg-journey-equip')equip?.(String(extra?.id),extra?.replace as string|undefined);}} exit={exit} playerName={game.players[0].name}/>} label="스테이지 승리 후 장면" enter={()=>{if(replay)setReplay(false);else{setSeen(true);markSeen?.(storySceneKey(run.stage));}}}/>}</>;
}
