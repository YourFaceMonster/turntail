'use client';
import EffectText from './EffectText';
import {JourneyStoryChrome} from './RpgJourneyScene';
import {PROFESSION_PORTRAITS} from '../../lib/profession-art';
import {HpItemResult} from './HpItemMatch';
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {gameRelic,relicImage} from '../../lib/item-battle-relics.ts';
import {RPG_PHASE_ONE,rpgSynergies,type RpgStageReward} from '../../lib/rpg-phase-one.ts';
import {currentRpgShop,RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {itemImage} from '../../lib/rpg-items.ts';
import RpgPrologue from './RpgPrologue';
import {RPG_CONNECTION_SCENES} from '../../lib/rpg-connection-scenes.ts';

export function RpgStageResult({game,busy,choose,buy,next,newRun,exit,markSeen}:{game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean)=>void,buy:(id:string)=>void,next:()=>void,newRun:()=>void,exit:()=>void,markSeen?:(id:string)=>void}){
 const run=game.rpgRun!,clear=run.phaseOne!.clear;
 const [replacement,setReplacement]=useState(''),[selectingRelic,setSelectingRelic]=useState(false),[storyDone,setStoryDone]=useState(false),[replaying,setReplaying]=useState(false);
 const victory=RPG_CONNECTION_SCENES[String(run.stage)]?.after[0]?.art;
 const failed=run.status==='game-over',complete=run.status==='complete',relic=gameRelic(clear?.relicId||''),full=!run.journey&&run.relics.length>=RPG_PHASE_ONE.relicLimit;
 if(run.status==='playing')return <HpItemResult rpg game={game} busy={busy} next={next} restart={newRun} exit={exit}/>;
 return <><div className={`modal-shade result-shade stage-clear-shade ${failed?'is-failed':''}`}>{victory&&<picture className="stage-clear-background" aria-hidden="true"><source media="(max-aspect-ratio:1/1)" srcSet={victory.portrait}/><img src={victory.landscape} alt=""/></picture>}<section className="modal rpg-result rpg-stage-result" role="dialog" aria-modal="true" aria-label="RPG 스테이지 결과">
  <header className="stage-clear-header"><span className="eyebrow">RPG · STAGE {run.stage}/3</span><h2>{failed?'여정 실패':complete?'1차 개발 구간 완료!':`스테이지 ${run.stage} 클리어!`}</h2><p>{failed?'세 번의 운명이 모두 소진됐어요. 다음 여정에서 다시 만나요.':run.status==='allocation'?'승리 보상 하나를 골라 여정을 이어가세요.':'선택한 보상과 함께 다음 길로 나아가세요.'}</p></header>
  {failed&&<img className="journey-failure-hero" src={PROFESSION_PORTRAITS[run.combat?.professions[0]||'swordsman'].src} alt="나의 직업"/>}<div className="rpg-stats"><span>운명력 <b>{run.fate}/3</b></span><span>HP <b>{run.hp[0]}/100</b></span><span>주화 <b>{run.coins}</b></span><span>유물 <b>{run.relics.length}개</b></span></div>
  {failed?<p>운명력이 0이 되어 이번 여정이 끝났어요. 발견 기록과 해금은 다음 여정에도 남습니다.</p>:<>{clear&&<details className="stage-clear-recovery"><summary>클리어 회복 +{clear.baseHeal+clear.relicHeal+clear.synergyHeal} HP · 자세히</summary><p className="rpg-clear-heal">클리어 HP {clear.hpBefore} → {clear.hpBefore+clear.baseHeal+clear.relicHeal+clear.synergyHeal} · 기본 회복 +{clear.baseHeal}{clear.relicHeal?` · 등불 +${clear.relicHeal}`:''}{clear.synergyHeal?` · 조합 +${clear.synergyHeal}`:''}</p></details>}</>}
  {run.status==='allocation'&&clear&&<div className="stage-clear-choice"><h3><small>보상 선택</small>하나를 가져가세요</h3><div className="rpg-stage-rewards">
   <button className={`secondary ${selectingRelic?'chosen':''}`} disabled={busy||!relic} onClick={()=>{if(full)setSelectingRelic(true);else choose('relic');}}>{relic&&<img src={relicImage(relic.id)} alt=""/>}<strong>유물 · {relic?.name||'후보 없음'}</strong><small><EffectText text={relic?.effect||''}/></small></button>
   <button className="secondary" aria-label={`주화 +${RPG_PHASE_ONE.rewardCoins} 보상 선택`} disabled={busy} onClick={()=>choose('coins')}><span className="stage-reward-number" aria-hidden="true">+{RPG_PHASE_ONE.rewardCoins}</span><strong>주화</strong><small>잡화점에서 아이템·유물 구매</small></button>
   <button className="secondary" aria-label={`추가 HP +${RPG_PHASE_ONE.rewardHeal} 보상 선택`} disabled={busy} onClick={()=>choose('heal')}><span className="stage-reward-number is-heal" aria-hidden="true">+{Math.min(100-run.hp[0],RPG_PHASE_ONE.rewardHeal)}</span><strong>HP 회복</strong><small>최대 100 · 실제 +{Math.min(100-run.hp[0],RPG_PHASE_ONE.rewardHeal)}</small></button>
  </div>{selectingRelic&&full&&<div className="rpg-relic-replacement"><label>가방이 가득 찼어요 · 교체할 유물<select value={replacement} onChange={event=>setReplacement(event.target.value)}><option value="">기존 유물을 선택하세요</option>{run.relics.map(id=><option key={id} value={id}>{gameRelic(id)?.name||id}</option>)}</select></label><button className="primary" disabled={busy||!replacement} onClick={()=>choose('relic',replacement)}>선택한 유물 교체</button><button className="secondary" disabled={busy} onClick={()=>choose('relic',undefined,true)}>새 유물 획득 포기</button></div>}</div>}
  {!!rpgSynergies(run).length&&<p className="rpg-synergy" role="status">조합 활성 · {rpgSynergies(run).map(effect=>`${effect.name} (클리어 회복 +${effect.clearHeal})`).join(' · ')}</p>}
  {clear?.chosen&&<p>선택 완료 · {clear.chosen==='coins'?`주화 +${RPG_PHASE_ONE.rewardCoins}`:clear.chosen==='heal'?'추가 회복':clear.declined?'유물 획득 포기':`유물 ${relic?.name}`}</p>}
  {run.status==='ready'&&<><h3>다음 스테이지 준비</h3><div className="rpg-shop-items">{currentRpgShop(run)?.stock.map(entry=>{const item=RPG_CONSUMABLES.find(item=>item.id===entry.id);return <div key={entry.id}><img src={itemImage(entry.id)} alt=""/><span><strong>{item?.name}</strong><small>{item?.effect.replace(' · 최소 HP 1',' · HP 0이면 퇴장')}</small></span><button className="secondary" disabled={busy||entry.quantity<1||run.coins<entry.price} onClick={()=>buy(entry.id)}>{entry.quantity<1?'품절':`${entry.price}주화`}</button></div>;})}</div><p>보유 아이템 {run.consumables.length}개 · 주화와 장비는 다음 스테이지로 이어져요.</p><button className="primary full" disabled={busy} onClick={next}>스테이지 {run.stage+1} 시작 →</button></>}

  {(failed||complete)&&<><p>{complete?'1~3스테이지 여정을 마쳤어요. 다음 구간은 아직 열리지 않았습니다.':''}</p><button className="primary full" disabled={busy} onClick={newRun}>1스테이지부터 새 여정 →</button></>}
  {clear&&!failed&&<button className="text-btn full" disabled={busy} onClick={()=>setReplaying(true)}>승리 이야기 다시 보기</button>}
  <button className="text-btn full" disabled={busy} onClick={exit}>{failed||complete?'메인으로':'저장하고 나가기'}</button>
 </section></div>{(replaying||run.status==='allocation'&&!storyDone&&!run.journey?.seenScenes?.includes(`ST${run.stage}_POST`))&&<RpgPrologue key={`post-${run.stage}`} cuts={RPG_CONNECTION_SCENES[String(run.stage)]?.after||[]} chrome={<JourneyStoryChrome run={run} busy={busy} error="" action={()=>{}} exit={exit} playerName={game.players[game.me]?.name}/>} label="스테이지 승리 후 장면" enter={()=>{if(replaying){setReplaying(false);return;}setStoryDone(true);markSeen?.(`ST${run.stage}_POST`);}}/>}</>;
}
