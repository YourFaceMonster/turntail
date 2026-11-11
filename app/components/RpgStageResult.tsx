'use client';
import RpgReworkResult from './RpgReworkResult';
import {storySceneKey,pendingStageStory} from '../../lib/rpg-story-cards.ts';
import StoryCardCollection from './StoryCardCollection';
import EffectText from './EffectText';
import {JourneyStoryChrome} from './RpgJourneyScene';
import type {ReactNode} from 'react';
import {HpItemResult} from './HpItemMatch';
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {gameRelic,relicImage} from '../../lib/item-battle-relics.ts';
import {RPG_PHASE_ONE,rpgSynergies,type RpgStageReward} from '../../lib/rpg-phase-one.ts';
import {currentRpgShop,RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {itemImage} from '../../lib/rpg-items.ts';
import RpgPrologue from './RpgPrologue';
import {RPG_CONNECTION_SCENES} from '../../lib/rpg-connection-scenes.ts';

export function RpgStageResult({game,busy,choose,buy,next,newRun,exit,markSeen,playerAvatar,equip}:{equip?:(id:string,replace?:string)=>void,playerAvatar?:ReactNode,game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean,relicId?:string)=>void,buy:(id:string)=>void,next:()=>void,newRun:()=>void,exit:()=>void,markSeen?:(id:string)=>void}){
 const run=game.rpgRun!,clear=run.phaseOne!.clear,storyKey=storySceneKey(run.stage);
 const [selectedRelic,setSelectedRelic]=useState(''),[replacement,setReplacement]=useState(''),[selectingRelic,setSelectingRelic]=useState(false),[storyDone,setStoryDone]=useState(false),[replaying,setReplaying]=useState(false);
 const relicOptions=clear?.relicOffers||[],needsRelicChoice=run.stage===2&&relicOptions.length>1;
 const failed=run.status==='game-over',complete=run.status==='complete',relic=gameRelic(needsRelicChoice?selectedRelic:clear?.relicId||''),full=!run.journey&&run.relics.length>=RPG_PHASE_ONE.relicLimit;
 if(run.rework)return <RpgReworkResult game={game} busy={busy} choose={choose} next={next} newRun={newRun} exit={exit} markSeen={markSeen} equip={equip}/>;
 if(run.status==='playing')return <HpItemResult rpg game={game} busy={busy} next={next} restart={newRun} exit={exit}/>;
 return <><div className={`modal-shade result-shade stage-clear-shade ${failed?'is-failed':''}`}><img className="journey-result-backdrop" src={failed?'/ui/results/journey-failure-v1.webp':'/ui/results/journey-rewards-v3.webp'} alt="" aria-hidden="true"/><section className="modal rpg-result rpg-stage-result" role="dialog" aria-modal="true" aria-label="스토리 스테이지 결과">
  <header className="stage-clear-header"><span className="eyebrow">STORY · STAGE {run.stage}/3</span><h2>{failed?'여정 실패':complete?'노르문의 여정을 마쳤어요':`스테이지 ${run.stage} 클리어!`}</h2><p>{failed?'세 번의 운명이 모두 소진됐어요. 다음 여정에서 다시 만나요.':run.status==='allocation'?'승리 보상을 모두 받고 여정을 이어가세요.':'획득한 보상과 함께 다음 길로 나아가세요.'}</p></header>
  {failed&&<><div className="journey-failure-profile"><div className="journey-failure-avatar">{playerAvatar||<span aria-label="내 아바타">🦊</span>}</div><strong>{game.players[game.me]?.name||'여행자'}</strong><small>길은 여기서 잠시 멈춥니다.</small></div><div className="rpg-stats"><span>운명력 <b>{run.fate}/3</b></span><span>HP <b>{run.hp[0]}/100</b></span><span>주화 <b>{run.coins}</b></span><span>유물 <b>{run.relics.length}개</b></span></div></>}
  {failed&&<p>운명력이 0이 되어 이번 여정이 끝났어요. 발견 기록과 해금은 다음 여정에도 남습니다.</p>}
  {run.status==='allocation'&&clear&&<div className="stage-clear-choice">{needsRelicChoice&&<div className="rpg-relic-offers" role="group" aria-label="스테이지 2 유물 후보">{relicOptions.map(id=>{const option=gameRelic(id)!;return <button type="button" className={selectedRelic===id?'chosen':''} aria-pressed={selectedRelic===id} disabled={busy} onClick={()=>setSelectedRelic(id)} key={id}><img src={relicImage(id)} alt=""/><strong>{option.name}</strong><small><EffectText text={option.effect}/></small></button>;})}</div>}<h3><small>스테이지 클리어 보상</small>세 가지 보상을 모두 드려요</h3><div className="rpg-stage-rewards">
   <button className={`secondary ${selectingRelic?'chosen':''}`} disabled aria-label={relic?`획득 유물 ${relic.name}`:'새 유물 후보 없음'}>{relic&&<img src={relicImage(relic.id)} alt=""/>}<strong>유물 · {relic?.name||(needsRelicChoice?'후보를 선택하세요':'후보 없음')}</strong><small><EffectText text={relic?.effect||''}/></small></button>
   <button className="secondary" aria-label={`획득 주화 ${RPG_PHASE_ONE.rewardCoins}`} disabled><img className="stage-reward-icon" src="/item-battle-v1/coin-gold-v1.webp" alt=""/><span className="stage-reward-number" aria-hidden="true">{RPG_PHASE_ONE.rewardCoins}</span><strong>주화</strong><small>아이템·유물 구매</small></button>
   <button className="secondary" aria-label={`HP ${RPG_PHASE_ONE.rewardHeal} 회복`} disabled><img className="stage-reward-icon" src="/rpg-items-v1/consumables/red-vial.webp" alt=""/><span className="stage-reward-number is-heal" aria-hidden="true">{RPG_PHASE_ONE.rewardHeal}</span><strong>HP 회복</strong><small>HP 회복 · 최대 100</small></button>
  </div><button className="primary full stage-rewards-claim" disabled={busy||needsRelicChoice&&!selectedRelic} onClick={()=>{if(full&&relic)setSelectingRelic(true);else choose('all',undefined,false,selectedRelic||undefined);}}>보상 모두 받기</button>{selectingRelic&&full&&<div className="rpg-relic-replacement"><label>가방이 가득 찼어요 · 교체할 유물<select value={replacement} onChange={event=>setReplacement(event.target.value)}><option value="">기존 유물을 선택하세요</option>{run.relics.map(id=><option key={id} value={id}>{gameRelic(id)?.name||id}</option>)}</select></label><button className="primary" disabled={busy||!replacement} onClick={()=>choose('all',replacement)}>선택한 유물 교체</button><button className="secondary" disabled={busy} onClick={()=>choose('all',undefined,true)}>새 유물 획득 포기</button></div>}</div>}
  {!!rpgSynergies(run).length&&<p className="rpg-synergy" role="status">조합 활성 · {rpgSynergies(run).map(effect=>`${effect.name} (클리어 회복 ${effect.clearHeal})`).join(' · ')}</p>}
  {clear?.chosen&&<p>보상 확인 · {clear.chosen==='all'?'스테이지 보상 획득 완료':clear.chosen==='coins'?`주화 ${RPG_PHASE_ONE.rewardCoins}`:clear.chosen==='heal'?'추가 회복':clear.declined?'유물 획득 포기':`유물 ${relic?.name}`}</p>}
  {run.status==='ready'&&<><h3>다음 스테이지 준비</h3><div className="rpg-shop-items">{currentRpgShop(run)?.stock.map(entry=>{const item=RPG_CONSUMABLES.find(item=>item.id===entry.id);return <div key={entry.id}><img src={itemImage(entry.id)} alt=""/><span><strong>{item?.name}</strong><small>{item?.effect.replace(' · 최소 HP 1',' · HP 0이면 퇴장')}</small></span><button className="secondary" disabled={busy||entry.quantity<1||run.coins<entry.price} onClick={()=>buy(entry.id)}>{entry.quantity<1?'품절':`${entry.price}주화`}</button></div>;})}</div><p>보유 아이템 {run.consumables.length}개 · 주화와 장비는 다음 스테이지로 이어져요.</p><button className="primary full" disabled={busy} onClick={next}>스테이지 {run.stage+1} 시작 →</button></>}

  {complete&&<StoryCardCollection cards={run.storyCards}/>}
  {(failed||complete)&&<><p>{complete?'왕관과 철문의 패는 어떤 이야기를 나누고 있을까요? 다음 여정은 성화의 영역에 남은 기록에서 이어집니다.':''}</p><button className="primary full" disabled={busy} onClick={newRun}>1스테이지부터 새 여정 →</button></>}
  {clear&&!failed&&<button className="text-btn full" disabled={busy} onClick={()=>setReplaying(true)}>승리 이야기 다시 보기</button>}
  <button className="text-btn full" disabled={busy} onClick={exit}>{failed||complete?'메인으로':'저장하고 나가기'}</button>
 </section></div>{(replaying||!storyDone&&pendingStageStory(run))&&<RpgPrologue key={`post-${run.stage}`} cuts={RPG_CONNECTION_SCENES[String(run.stage)]?.after||[]} chrome={<JourneyStoryChrome run={run} busy={busy} error="" action={(action,extra)=>{if(action==='rpg-journey-equip')equip?.(String(extra?.id),extra?.replace as string|undefined);}} exit={exit} playerName={game.players[game.me]?.name}/>} label="스테이지 승리 후 장면" enter={()=>{if(replaying){setReplaying(false);return;}setStoryDone(true);markSeen?.(storyKey);}}/>}</>;
}
