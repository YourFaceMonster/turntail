'use client';
import {useState} from 'react';
import type {view} from '../../lib/game.ts';
import {gameRelic,relicImage} from '../../lib/item-battle-relics.ts';
import {RPG_PHASE_ONE,rpgSynergies,type RpgStageReward} from '../../lib/rpg-phase-one.ts';
import {currentRpgShop,RPG_CONSUMABLES} from '../../lib/rpg.ts';
import {itemImage} from '../../lib/rpg-items.ts';

export function RpgStageResult({game,busy,choose,buy,next,newRun,exit}:{game:ReturnType<typeof view>,busy:boolean,choose:(choice:RpgStageReward,replace?:string,decline?:boolean)=>void,buy:(id:string)=>void,next:()=>void,newRun:()=>void,exit:()=>void}){
 const run=game.rpgRun!,clear=run.phaseOne!.clear;
 const [replacement,setReplacement]=useState(''),[selectingRelic,setSelectingRelic]=useState(false);
 const failed=run.status==='game-over',complete=run.status==='complete',relic=gameRelic(clear?.relicId||''),full=run.relics.length>=RPG_PHASE_ONE.relicLimit;
 return <div className="modal-shade result-shade"><section className="modal rpg-result rpg-stage-result" role="dialog" aria-modal="true" aria-label="RPG 스테이지 결과">
  <span className="eyebrow">RPG · STAGE {run.stage}/3</span><h2>{failed?'여정 실패':complete?'1차 개발 구간 완료!':run.status==='playing'?'다음 카드 판을 준비하세요':`스테이지 ${run.stage} 클리어!`}</h2>
  <div className="rpg-stats"><span>HP <b>{run.hp[0]}/100</b></span><span>주화 <b>{run.coins}</b></span><span>유물 <b>{run.relics.length}/6</b></span></div>
  {failed?<p>HP가 0이 되어 여정이 끝났어요. 이번 여정의 유물은 사라지고, 발견 기록은 유지됩니다.</p>:run.status==='playing'?<p>손패가 소진되어 카드 판이 끝났어요. 적의 남은 HP와 퇴장 상태를 유지하고 새 패로 이어갑니다.</p>:<><p>적 두 명을 모두 쓰러뜨렸어요.</p>{clear&&<p className="rpg-clear-heal">클리어 HP {clear.hpBefore} → {clear.hpBefore+clear.baseHeal+clear.relicHeal+clear.synergyHeal} · 기본 회복 +{clear.baseHeal}{clear.relicHeal?` · 등불 +${clear.relicHeal}`:''}{clear.synergyHeal?` · 조합 +${clear.synergyHeal}`:''}</p>}</>}
  {run.status==='allocation'&&clear&&<div><h3>보상 3종 중 하나를 선택하세요</h3><p>기본 회복 후 적용됩니다. 선택해야 다음으로 진행할 수 있어요.</p><div className="rpg-stage-rewards">
   <button className={`secondary ${selectingRelic?'chosen':''}`} disabled={busy||!relic} onClick={()=>{if(full)setSelectingRelic(true);else choose('relic');}}>{relic&&<img src={relicImage(relic.id)} alt=""/>}<strong>유물 · {relic?.name||'후보 없음'}</strong><small>{relic?.effect}</small></button>
   <button className="secondary" disabled={busy} onClick={()=>choose('coins')}><strong>주화 +{RPG_PHASE_ONE.rewardCoins}</strong><small>RPG 전용 주화 · 준비 상점에서 사용</small></button>
   <button className="secondary" disabled={busy} onClick={()=>choose('heal')}><strong>추가 HP +{RPG_PHASE_ONE.rewardHeal}</strong><small>최대 100 · 실제 +{Math.min(100-run.hp[0],RPG_PHASE_ONE.rewardHeal)}</small></button>
  </div>{selectingRelic&&full&&<div className="rpg-relic-replacement"><label>가방이 가득 찼어요 · 교체할 유물<select value={replacement} onChange={event=>setReplacement(event.target.value)}><option value="">기존 유물을 선택하세요</option>{run.relics.map(id=><option key={id} value={id}>{gameRelic(id)?.name||id}</option>)}</select></label><button className="primary" disabled={busy||!replacement} onClick={()=>choose('relic',replacement)}>선택한 유물 교체</button><button className="secondary" disabled={busy} onClick={()=>choose('relic',undefined,true)}>새 유물 획득 포기</button></div>}</div>}
  {!!rpgSynergies(run).length&&<p className="rpg-synergy" role="status">조합 활성 · {rpgSynergies(run).map(effect=>`${effect.name} (클리어 회복 +${effect.clearHeal})`).join(' · ')}</p>}
  {clear?.chosen&&<p>선택 완료 · {clear.chosen==='coins'?`주화 +${RPG_PHASE_ONE.rewardCoins}`:clear.chosen==='heal'?'추가 회복':clear.declined?'유물 획득 포기':`유물 ${relic?.name}`}</p>}
  {run.status==='ready'&&<><h3>다음 스테이지 준비</h3><div className="rpg-shop-items">{currentRpgShop(run)?.stock.map(entry=>{const item=RPG_CONSUMABLES.find(item=>item.id===entry.id);return <div key={entry.id}><img src={itemImage(entry.id)} alt=""/><span><strong>{item?.name}</strong><small>{item?.effect.replace(' · 최소 HP 1',' · HP 0이면 퇴장')}</small></span><button className="secondary" disabled={busy||entry.quantity<1||run.coins<entry.price||run.consumables.length>=3} onClick={()=>buy(entry.id)}>{entry.quantity<1?'품절':`${entry.price}주화`}</button></div>;})}</div><p>보유 아이템 {run.consumables.length}/3 · 주화와 장비는 다음 스테이지로 이어져요.</p><button className="primary full" disabled={busy} onClick={next}>스테이지 {run.stage+1} 시작 →</button></>}
  {run.status==='playing'&&<button className="primary full" disabled={busy} onClick={next}>다음 카드 판 시작 →</button>}
  {(failed||complete)&&<><p>{complete?'1~3스테이지 여정을 마쳤어요. 다음 구간은 아직 열리지 않았습니다.':''}</p><button className="primary full" disabled={busy} onClick={newRun}>1스테이지부터 새 여정 →</button></>}
  <button className="text-btn full" disabled={busy} onClick={exit}>{failed||complete?'메인으로':'저장하고 나가기'}</button>
 </section></div>;
}
