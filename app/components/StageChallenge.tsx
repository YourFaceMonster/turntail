"use client";
import {useState,useEffect,useLayoutEffect,useRef,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {stagePalette} from '../../lib/stage-presentation';
import {stageTheme,STAGE_THEMES,stageOpponents} from '../../lib/stage-theme';
import {StageBackArt} from './StageVisuals';
import {StagePortrait} from './StagePortrait';
import type {Game,view} from '../../lib/game';
import {stageConfig,type StageRecord} from '../../lib/stage-challenge';
import TileFace from './TileFace';
import MapAtmosphere from './MapAtmosphere';
import ResultStandings from './ResultStandings';
import {stageMapScrollTop,STAGE_ROUTE_SEGMENTS,stageRoutePoints} from '../../lib/stage-map';
import StageProgressSummary from './StageProgressSummary';
import StageClearReveal from './StageClearReveal';
type View=ReturnType<typeof view>;
const number=(n:number)=>n.toLocaleString('ko-KR');
const signed=(n:number)=>`${n>0?'+':''}${number(n)}`;
const statusName={playing:'진행 중','stage-clear':'스테이지 클리어','game-over':'게임 오버',complete:'10스테이지 완료',abandoned:'도전 포기'};
export function StageDestinationDialog({stage,active,error='',start,resume,advance,abandon,close}:{stage:number,active:Game|null,error?:string,start:()=>void,resume:()=>void,advance:()=>void,abandon:()=>void,close:()=>void}){
 const dialog=useRef<HTMLElement>(null),onClose=useRef(close);onClose.current=close;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,node=dialog.current;node?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose.current();}if(e.key==='Tab'&&node){const elements=Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled),summary,[tabindex="0"]')).filter(el=>el.getClientRects().length);if(!elements.length){e.preventDefault();return;}const first=elements[0],last=elements.at(-1)!;if(e.shiftKey&&(document.activeElement===first||document.activeElement===node)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===node)){e.preventDefault();first.focus();}}};
  document.addEventListener('keydown',key,true);return()=>{document.removeEventListener('keydown',key,true);previous?.focus();};
 },[]);
 const run=active?.stageRun,next=run?.status==='stage-clear'?Math.min(10,run.stage+1):run?.stage||1,theme=stageTheme(stage),current=stage===run?.stage,enterable=stage===next;
 const go=(action:()=>void)=>{close();action();};
 return <div className="modal-shade journey-popup-shade" onClick={close}><section ref={dialog} tabIndex={-1} className="modal journey-destination journey-popup" role="dialog" aria-modal="true" aria-labelledby="destination-title" onClick={e=>e.stopPropagation()} data-region={stage} style={{'--stage-accent':stagePalette(stage).accent,'--stage-base':stagePalette(stage).base,'--stage-light':stagePalette(stage).light,'--destination-image':`url('/environments/stage-${stage}-055.webp')`} as CSSProperties}>
 <button className="close" onClick={close} aria-label="스테이지 정보 닫기">×</button><span className="eyebrow">{stage===10?'THE FINAL TABLE':`DESTINATION ${String(stage).padStart(2,'0')}`} · {stage>next?'미개방':stage<next?'돌파한 거점':'다음 여정'}</span><h3 id="destination-title">{theme.name}</h3><p className="destination-story">{theme.short}</p>
 <div className="destination-material"><span>이번 테이블의 패</span><strong>{theme.material}</strong><div className={`material-preview material-${stage}`} aria-hidden="true"><StageBackArt stage={stage}/></div></div>
 <div className="destination-opponents">{stageOpponents(stage).map(p=><div key={p.name}><StagePortrait index={p.portrait}/><strong>{p.name}<small>{p.title}</small></strong></div>)}</div><p className="destination-quote">“{theme.opponents[0].quote}”</p><div className="destination-objective"><span>클리어 목표</span><strong>{number(stageConfig(stage).target)}점</strong><small>또는 AI 한 명 0점 이하 · AI 시작 각 200점</small></div>
 {error&&<p role="alert" className="stage-error">{error}</p>}
 {!run?<button className="primary full" disabled={stage!==1||!!error} onClick={()=>go(start)}>{stage===1?'별빛 관문 · 첫 여정 시작 →':'앞선 거점부터 차례로 열려요'}</button>:<button className="primary full" disabled={!enterable&&!current||!!error} onClick={()=>go(run.status==='stage-clear'&&stage===next?advance:resume)}>{run.status==='stage-clear'&&stage===next?'이 거점으로 출발 →':current?'저장된 승부 이어하기 →':stage<next?'이미 지나온 거점이에요':'앞선 거점을 돌파해 주세요'}</button>}
 <details className="destination-lore"><summary>장소 이야기 · 여정 규칙</summary><p>{theme.intro}</p><p>200점으로 시작 · 내 점수가 0점 미만이면 종료. 다음 스테이지에도 내 점수는 이어지고 AI 2명은 새로 시작해요.</p>{run&&<button className="text-btn" onClick={()=>go(abandon)}>현재 도전 포기</button>}</details>
 <button className="text-btn full destination-return" onClick={close}>← 지도로 돌아가기</button></section></div>;
}
export function StageHub({active,start,resume,advance,records,abandon,close,error=''}:{active:Game|null,start:()=>void,resume:()=>void,advance:()=>void,records:()=>void,abandon:()=>void,close:()=>void,error?:string}){
 const run=active?.stageRun,next=run?.status==='stage-clear'?Math.min(10,run.stage+1):run?.stage||1;
 const [selected,setSelected]=useState(next),[infoOpen,setInfoOpen]=useState(false),theme=stageTheme(selected);
 const viewport=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const el=viewport.current;if(!el)return;let frame=0,key='';
  const center=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const node=el.querySelector<HTMLElement>(`[data-stage-node="${next}"]`);if(!node)return;
   const size=`${el.clientWidth}:${el.clientHeight}:${el.scrollHeight}`;if(size===key||!el.clientHeight)return;key=size;
   el.scrollTop=stageMapScrollTop(node.offsetTop+node.offsetHeight/2,el.clientHeight,el.scrollHeight);
  });};
  center();const observer=new ResizeObserver(center);observer.observe(el);const map=el.querySelector('.journey-map');if(map)observer.observe(map);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[next]);
 const open=(stage:number)=>{if(stage>next)return;setSelected(stage);setInfoOpen(true);};
 return <><div className="modal-shade stage-map-shade" onClick={close}><section className="modal stage-hub stage-map-hub" role="dialog" aria-modal={!infoOpen} aria-labelledby="stage-map-title" onClick={e=>e.stopPropagation()} inert={infoOpen} style={{'--stage-accent':theme.accent} as CSSProperties}>
  <header className="stage-map-header"><div><span className="eyebrow">THE FLOATING ISLES · STAGE CHALLENGE</span><h2 id="stage-map-title">공중섬의 열 가지 이야기</h2><p>{run?`저장된 여정 · ${run.score.toLocaleString()}점 · ${run.cleared}개 거점 돌파`:'별빛 관문에서 붉은 세계수까지, 한 수씩 오르는 여정.'}</p></div><button className="close" aria-label="도전 모드 닫기" onClick={close}>×</button></header>
  <div className="stage-map-layout"><div className="journey-map-viewport" ref={viewport}><div className="journey-map" style={{'--current-x':`${stageTheme(next).position[0]}%`,'--current-y':`${stageTheme(next).position[1]}%`} as CSSProperties}><img src="/turntale-stage-map-0515.webp" alt="별빛 관문에서 야영지와 폭포, 고목과 성소를 거쳐 붉은 세계수로 오르는 공중섬 지도" width="1024" height="1536"/><MapAtmosphere paused={infoOpen}/><div className="map-unopened-shade" aria-hidden="true"/><svg className="journey-route" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">{STAGE_ROUTE_SEGMENTS.map((_,i)=><polyline key={i} data-route={`${i+1}-${i+2}`} className={(run?.cleared||0)>i?'route-cleared':undefined} points={stageRoutePoints(i)}/>)}</svg>
  {STAGE_THEMES.map(t=>{const cleared=!!run&&t.stage<=run.cleared,locked=t.stage>next;return <button key={t.stage} type="button" data-stage-node={t.stage} disabled={locked} className={`journey-node ${cleared?'cleared':''} ${t.stage===next?'available':''} ${selected===t.stage?'selected':''} ${locked?'locked':''}`} style={{left:`${t.position[0]}%`,top:`${t.position[1]}%`}} aria-label={`${t.stage}스테이지 ${t.name} · ${cleared?'클리어':locked?'미개방':'진행 가능'}`} aria-haspopup="dialog" aria-pressed={selected===t.stage} onClick={()=>open(t.stage)}><span>{cleared?'✓':t.stage}</span><small>{t.name}</small>{t.stage===next&&<b className="map-current-badge">{run?'현재 여정':'여기서 시작'}</b>}{locked&&<i aria-hidden="true">·</i>}</button>;})}</div></div>
  <aside className="journey-map-guide"><span className="eyebrow">YOUR NEXT DESTINATION</span><h3>{stageTheme(next).name}</h3><p className="map-current-hint">{next}스테이지부터 {run?'여정을 이어가세요.':'시작하세요.'}<br/>다음 지역은 차례로 열려요.</p><button className="primary full" onClick={()=>open(next)}>{run?'현재 여정 열기 →':'첫 거점 살펴보기 →'}</button>{error&&<p role="alert" className="stage-error">{error}</p>}<button className="secondary full" onClick={records}>도전 전적</button>{run&&<button className="text-btn full" onClick={start}>1스테이지부터 새로 시작</button>}<small>진행은 자동 저장돼요.<br/>일반모드의 저장·전적과 따로 유지해요.</small></aside></div>
 </section></div>{infoOpen&&typeof document!=='undefined'&&createPortal(<StageDestinationDialog stage={selected} active={active} error={error} start={start} resume={resume} advance={advance} abandon={abandon} close={()=>setInfoOpen(false)}/>,document.body)}</>;
}
export function StageRecords({records,close}:{records:StageRecord[],close:()=>void}){
 const best=records[0];
 return <div className="modal-shade" onClick={close}><section className="modal stage-records" role="dialog" aria-modal="true" aria-label="스테이지 도전 전적" onClick={e=>e.stopPropagation()}><button className="close" onClick={close} aria-label="도전 전적 닫기">×</button><span className="eyebrow">STAGE CHALLENGE RECORDS</span><h2>도전의 발자취</h2><p>한 번의 도전, 하나의 기록.</p><div className="stage-record-summary"><div><strong>{best?`${best.stage}/10`:'—'}</strong><span>최고 도달 스테이지</span></div><div><strong>{number(Math.max(0,...records.map(r=>r.peakScore)))}</strong><span>최고 보유 점수</span></div><div><strong>{records.filter(r=>r.status==='complete').length}</strong><span>전체 돌파</span></div></div>
  {!records.length?<p className="empty-history">아직 도전 기록이 없어요.<br/>첫 스테이지부터 시작해 보세요.</p>:<ol className="stage-history">{records.map(r=><li key={r.id}><div><strong>{r.name} · STAGE {r.stage}</strong><span>{statusName[r.status]} · {r.cleared}단계 클리어 · {r.rounds}판</span><small>{new Date(r.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</small></div><div><b>{number(r.peakScore)}<small>최고 점수</small></b><span>현재·종료 {number(r.score)}점</span></div></li>)}</ol>}<p className="foot muted">일반 전적 및 전체 하이스코어에는 합산하지 않아요. 이 브라우저의 데이터 삭제 시 도전 저장·전적도 사라집니다.</p></section></div>;
}
export function StageResult({game,busy,next,newRun,records,exit,abandon}:{game:View,busy:boolean,next:()=>void,newRun:()=>void,records:()=>void,exit:()=>void,abandon:()=>void}){
 const run=game.stageRun;if(!run)return null;const config=stageConfig(run.stage),clear=run.clears.at(-1),terminal=['game-over','complete','abandoned'].includes(run.status),cleared=run.status==='stage-clear'||run.status==='complete';
 const reason=clear?.stage===run.stage?clear.reason==='target'?`보유 점수 ${number(config.target)}점 목표를 달성했어요.`:clear.reason==='both'?`목표 점수 달성 · ${clear.bankrupt.join(', ')} 파산`:`${clear.bankrupt.join(', ')}의 점수가 0점 이하가 되었어요.`:'';
 return <div className={`modal-shade result-shade ${cleared?'is-victory':'is-defeat'}`}><section className={`modal result stage-result ${cleared?'victory stage-clear-result':''}`} role="dialog" aria-modal="true" aria-label="스테이지 도전 판 결과">{cleared?<StageClearReveal stage={run.stage} reason={reason} complete={run.status==='complete'}/>:<><span className="eyebrow">STAGE {run.stage} / 10 · {run.stageRounds}번째 판</span><span className="trophy">{cleared?'✹':run.status==='game-over'?'☂':'✧'}</span><h2>{run.status==='complete'?'10스테이지 돌파!':run.status==='stage-clear'?`${run.stage}스테이지 클리어!`:run.status==='game-over'?'이번 도전은 여기까지':game.winner===game.me?'이번 판, 승리!':'다음 한 수를 준비해요'}</h2><p className="outcome-message">{cleared?reason:run.status==='game-over'?'보유 점수가 0점 미만이 되어 도전이 끝났어요.':`${game.players[game.winner??0].name}님이 손패를 모두 비웠어요. 같은 스테이지를 이어갑니다.`}</p></>}<StageProgressSummary run={run}/>{terminal&&run.status!=='complete'&&<p className="stage-result-score">{number(run.score)}<small>종료 점수</small></p>}<p className="stage-result-target">최고 {number(run.peakScore)}점 · {run.cleared}단계 클리어 · 총 {run.rounds}판</p>
  <ResultStandings players={game.result?.players||[]} final={cleared||terminal}/>
  <details className="stage-leftovers"><summary>남아 있던 패와 정산 보기</summary>{game.players.map(p=><div key={p.id}><h4>{p.name} · {p.count}장</h4><div className="stage-leftover-tiles">{p.hand?.map(t=><TileFace key={t.id} tile={t}/>)}</div></div>)}{game.result?.transfers.map((t,i)=><p key={i}>{game.players[t.from].name} → {game.players[t.to].name} · {t.points}점</p>)}</details>
  {!terminal?<button className="primary full" disabled={busy} onClick={next}>{run.status==='stage-clear'?`${run.stage+1}스테이지로 →`:'같은 스테이지 · 다음 판 →'}</button>:<button className="primary full" onClick={newRun}>1스테이지부터 새 도전 →</button>}
  <div className="result-actions"><button className="text-btn" onClick={records}>도전 전적</button><button className="text-btn" onClick={exit}>{terminal?'홈으로':'저장하고 나가기'}</button>{!terminal&&<button className="text-btn" onClick={abandon}>도전 포기</button>}</div><p className="foot muted">일반 전적·하이스코어와 분리하여 자동 저장했어요.</p>
 </section></div>;
}
export function StageAbandon({confirm,cancel}:{confirm:()=>void,cancel:()=>void}){return <div className="modal-shade stage-confirm-shade"><section className="modal stage-confirm" role="alertdialog" aria-modal="true" aria-labelledby="stage-abandon-title"><span className="eyebrow">END THIS CHALLENGE</span><h2 id="stage-abandon-title">이번 도전을 포기할까요?</h2><p>현재 도전은 종료되고 도전 전적에 남습니다.<br/>다음 도전은 <b>1스테이지 · 200점</b>부터 시작해요.</p><button className="primary full" onClick={cancel}>계속 도전하기</button><button className="secondary full" onClick={confirm}>이번 도전 포기</button></section></div>;}
