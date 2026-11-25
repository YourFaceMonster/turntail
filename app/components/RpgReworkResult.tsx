'use client';
import {useEffect,useState,type CSSProperties,type ReactNode} from 'react';
import type {view} from '../../lib/game';
import {hasRewardPreview,previewRewardOffers,relicRecipe,reworkChapterRange,rpgMaxHp,reworkRelic} from '../../lib/rpg-rework';
import type {RpgStageReward} from '../../lib/rpg-phase-one';
import {relicImage} from '../../lib/item-battle-relics';
import {pendingStageStory,storySceneKey} from '../../lib/rpg-story-cards';
import {journeyScenes} from '../../lib/rpg-chapter-scenes';
import RpgPrologue from './RpgPrologue';
import StoryCardCollection from './StoryCardCollection';
import TileFace from './TileFace';
import {cue,cueOnce} from '../../lib/sound-cues';
import SeatPortrait from './SeatPortrait';
import {RpgHpBar} from './RpgHpBar';
import {seatPanelTheme} from '../../lib/seat-presentation';
import {tr,trv} from '../../lib/i18n/index.ts';

// Ending BGM after ST10. The true ending (second journey) reuses the normal ending track until its own arrives.
function endingTrack(run:{journey?:{story?:{runNumber?:number}}}){return (run.journey?.story?.runNumber||1)>=2?'/audio/true-ending-suno-0736.mp3':'/audio/ending-suno-0726.mp3';}

export default function RpgReworkResult({game,busy,choose,next,newRun,exit,markSeen,equip,music,musicVolume}:{
 music?:boolean,musicVolume?:number,
 game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean,id?:string)=>void,
 next:()=>void,newRun:()=>void,exit:()=>void,markSeen?:(id:string)=>void,equip?:(id:string,replace?:string)=>void,playerAvatar?:ReactNode}){
 const run=game.rpgRun!,clear=run.phaseOne?.clear,report=run.roundHealth;
 const [selected,setSelected]=useState(''),[seen,setSeen]=useState(false),[replay,setReplay]=useState(false);
 const relicHeals=run.rework!.relicHeals||[],boss=[3,6,9].includes(run.stage),[chapterFrom,chapterTo]=reworkChapterRange(run.stage);
 const overflow=run.rework!.overflow,seats=run.rework!.settledSeats||game.result?.players.flatMap((p,i)=>p.place>0?[i]:[])||[];
 const failed=run.status==='game-over',complete=run.status==='complete',offers=clear?.relicOffers||[];
 /** A fall that spent one fate: bars show the HP at the fall, the run itself already holds the retry HP. */
 const retried=run.rework!.retried,shown=retried?.hp??run.hp;
 const story=replay||!seen&&pendingStageStory(run);
 const [reveal,setReveal]=useState(false);useEffect(()=>{const timer=setTimeout(()=>setReveal(true),120);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{
  const key=`result:${game.code}:${run.stage}:${game.round}`,mine=run.hp[game.me]-(report?.before[game.me]??run.hp[game.me]);
  if(failed||retried)cueOnce(key,'fail');
  else if(complete||run.status==='allocation'||run.status==='ready'){cueOnce(key,'clear');if(run.status==='allocation'&&[3,6,9].includes(run.stage))cueOnce(`${key}:card`,'storyCard',1.4);}
  else if(mine<0)cueOnce(key,'hit');else if(mine>0)cueOnce(key,'heal');
 },[]);
 return <><div className="modal-shade result-shade"><section className="modal hp-item-result compact-item-result rpg-rework-result" role="dialog" aria-modal="true" aria-label={tr('스토리 판 정산')}>
  <header className="settlement-header"><span className="eyebrow">{tr('스토리 · {0}스테이지 · {1}판',{0:run.stage,1:game.round})}</span><h2>{tr('이번 판 정산')}</h2>
  <p>{failed?(run.journey?tr('HP가 0이 되었고 남은 운명력이 없어 여정이 끝났어요.'):tr('HP가 0이 되어 여정이 끝났어요.')):retried?tr('HP가 0이 되었어요. 운명력 1개를 써서 이 스테이지에 다시 도전할 수 있어요.'):complete?tr('노르문의 여정을 마쳤어요.'):run.status==='allocation'?tr('스테이지 {0} 클리어!',{0:run.stage}):tr('남은 패수로 HP를 정산했어요.')}</p></header>
  <div className="hp-settlement">{seats.slice().sort((a,b)=>(game.result?.players[a].place||0)-(game.result?.players[b].place||0)).map(seat=>{
   const player=game.players[seat],row=game.result?.players[seat],before=report?.before[seat]??run.hp[seat],delta=row?.delta||0,theme=seatPanelTheme(seat);
   const tied=game.result?.players.some((other,i)=>i!==seat&&other.place===row?.place&&other.place>0);
   const net=shown[seat]-before,netText=net>0?`+${net}`:net<0?`−${-net}`:'±0';
   return <article key={seat} style={{'--result-light':theme.light,'--result-dark':theme.dark,'--result-border':theme.border} as CSSProperties}>
    <RpgHpBar maxHp={rpgMaxHp(run,seat)} hp={reveal?shown[seat]:before} owner={player.name}
     summary={<span className="round-hp-totals" aria-label={tr('이번 판 손실 {0}, 획득 {1}, 최종 {2}',{0:report?.damage[seat]||0,1:report?.healing[seat]||0,2:netText})}><span className="hp-lost">{tr('손실 −{0}',{0:report?.damage[seat]||0})}</span><span className="hp-recovered">{tr('획득 +{0}',{0:report?.healing[seat]||0})}</span><b className={`hp-net ${net<0?'is-loss':net>0?'is-gain':'is-even'}`}>{tr('최종 {0}',{0:netText})}</b></span>}
     identity={<><SeatPortrait avatar={player.avatar} seat={seat} guardian={!!run.journey&&run.stage===10&&seat!==game.me}/><strong>{trv(player.name)}<small>{tied?tr('공동 '):''}{row?.place}{tr('등')}</small></strong></>}/>
    <div className="compact-hp-breakdown"><p className="round-money-detail">{tr('남은 패 {0}장 ·',{0:row?.count??0})} <b className={delta>0?'hp-recovered':delta<0?'hp-lost':''}>{tr('패 정산 {0}{1} HP',{0:delta>0?'+':'',1:delta})}</b>{delta!==net&&<small> {tr('· 상한·유물 회복 반영')}</small>}</p>{overflow?.dealt[seat]?<p className="round-money-detail">{tr('넘친 회복 →')} <b className="hp-lost">{tr('상대 피해 {0}',{0:overflow.dealt[seat]})}</b></p>:null}{overflow?.taken[seat]?<p className="round-money-detail"><b className="hp-lost">{tr('넘친 회복 피해 −{0}',{0:overflow.taken[seat]})}</b></p>:null}{seat===game.me&&relicHeals.length>0&&<p className="round-money-detail rpg-relic-heal-line">{tr('유물 ·')} {relicHeals.map(heal=><b key={heal.relicId} className="hp-recovered">{trv(reworkRelic(heal.relicId)?.name)} HP +{heal.amount}</b>).reduce<ReactNode[]>((list,item,index)=>index?[...list,' · ',item]:[item],[])}</p>}{shown[seat]===0&&<p>{retried||failed||complete||run.status==='allocation'?tr('쓰러짐'):tr('탈락 · 다음 판 분배 제외')}</p>}</div>
   </article>;
  })}</div>
  {retried&&<div className="rpg-retry-box" role="status"><span className="rpg-retry-gems" aria-label={tr('남은 운명력 {0}개 / 3개',{0:retried.left})}>{[0,1,2].map(index=><img key={index} className={index<retried.left?'is-active':'is-spent'} src="/ui/fate-gem-v1.webp" alt="" aria-hidden="true"/>)}</span><p><b>{tr('운명력 1개 사용 · 남은 {0}개',{0:retried.left})}</b><br/>{tr('내 HP {0} · 상대 HP는 스테이지 처음으로 돌아가요. 운명력을 모두 쓰면 여정이 끝나요.',{0:run.hp[0]})}</p><button className="primary full" disabled={busy} onClick={()=>{cue('heal');next();}}>{tr('스테이지')} {retried.stage} {tr('다시 도전')}</button></div>}
  {run.status==='playing'&&!retried&&<><p>{tr('다음 판은 손패 10장씩 · 바닥 30장으로 겨뤄요. 누구든 HP가 0이 되면 스테이지가 끝나요.')}</p><button className="primary full" disabled={busy} onClick={()=>{cue('confirm');next();}}>{tr('다음 판')}</button></>}
  {run.status==='allocation'&&<><h3>{tr('{0} · {1}개 중 1개',{0:boss?tr('다음 챕터 시작 유물'):tr('유물 보상'),1:offers.length})}</h3>{offers.length>0&&<p className="rpg-reward-note">{boss?tr('고른 유물 1개만 다음 챕터로 이어져요. 지금 가진 유물은 챕터가 바뀌면 사라져요.'):tr('받은 유물은 이번 챕터(ST{0}~{1})가 끝날 때까지 유지돼요.',{0:chapterFrom,1:chapterTo})}{(run.relics.includes('split-mirror')||run.relics.includes('forked-mirror'))&&<b> · {trv(reworkRelic(run.relics.includes('forked-mirror')?'forked-mirror':'split-mirror')?.name)} {tr('효과로 후보 +1')}</b>}</p>}<div className="rpg-relic-offers">{offers.map(id=>{const relic=reworkRelic(id)!;return <button key={id} className={selected===id?'chosen':''} disabled={busy} aria-pressed={selected===id} onClick={()=>{cue('click');setSelected(id);}}><img src={relicImage(id)} alt=""/><strong>{trv(relic.name)}</strong><small>{relic.effect}</small>{relic.passive&&<em className="rpg-offer-passive">{tr('갖고만 있어도 적용')}</em>}</button>;})}</div><button className="primary full" disabled={busy||offers.length>0&&!offers.includes(selected)} onClick={()=>choose('relic',undefined,!offers.length,selected||undefined)}>{offers.length?tr('선택한 유물 받기'):tr('보상 확인')}</button></>}
  <details className="result-details"><summary>{tr('남은 손패 보기')}</summary>{seats.map(seat=>{const player=game.players[seat];return <section className="result-hand-row" key={seat}><h3><SeatPortrait avatar={player.avatar} seat={seat} guardian={!!run.journey&&run.stage===10&&seat!==game.me}/>{trv(player.name)}<small>{player.count}{tr('장')}</small></h3><div>{player.hand?.length?player.hand.map(tile=><TileFace tile={tile} key={tile.id}/>):<small>{player.count?tr('남은 패 {0}장',{0:player.count}):tr('모두 냈어요.')}</small>}</div></section>;})}</details>
  {run.status==='allocation'&&run.rework?.lastRecipe&&<p className="rpg-reward-note">{tr('보스가 남긴 쪽지 · 새 합성법')} <b>{trv(reworkRelic(run.rework.lastRecipe)?.name)}</b> {tr('({0}) · 소문 수첩에 적어 뒀어요.',{0:relicRecipe(run.rework.lastRecipe)?.materials.map(id=>reworkRelic(id)?.name).join(' + ')})}</p>}
  {run.status==='ready'&&hasRewardPreview(run)&&!boss&&run.stage<10&&<p className="rpg-reward-note">{trv(reworkRelic(run.relics.includes('forked-mirror')?'forked-mirror':'twin-needle-compass')?.name)} {tr('· 다음 클리어 보상 후보:')} {previewRewardOffers(run).map(id=>reworkRelic(id)?.name).join(' · ')||tr('후보 없음')}</p>}
  {run.status==='ready'&&<button className="primary full" disabled={busy} onClick={()=>{cue([3,6,9].includes(run.stage)?'heal':'confirm');next();}}>{tr('다음 스테이지')}</button>}
  {complete&&<StoryCardCollection cards={run.storyCards}/>}
  {(failed||complete)&&<button className="primary full" disabled={busy} onClick={newRun}>{tr('새 여정 시작')}</button>}
  {clear&&!failed&&<button className="text-btn full" onClick={()=>setReplay(true)}>{tr('승리 이야기 다시 보기')}</button>}
  <button className="text-btn full" disabled={busy} onClick={()=>{cue('back');exit();}}>{tr('저장하고 나가기')}</button>
 </section></div>{story&&<RpgPrologue cuts={journeyScenes(run.stage,run).after} label={run.stage===10?tr('여정의 끝'):tr('스테이지 승리 후 장면')} track={run.stage===10?endingTrack(run):undefined} music={music} musicVolume={musicVolume} enter={()=>{if(replay)setReplay(false);else{setSeen(true);markSeen?.(storySceneKey(run.stage));}}}/>}</>;
}
