'use client';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {prepareStageScene,warmStageScenes} from '../../lib/scene-assets';
import {stageTheme,STAGE_THEMES} from '../../lib/stage-theme';
import {platformGeometry} from '../../lib/stage-setting';
import {stagePreviewLayout} from '../../lib/stage-preview-layout';
import {cameraTransform} from '../../lib/entrance-camera';
import {StageVisuals} from './StageVisuals';
import EntranceSeats from './EntranceSeats';
import EntranceFurniture from './EntranceFurniture';
import EntranceEnvironment from './EntranceEnvironment';
import TableSurface from './TableSurface';
import TileFace from './TileFace';
import Back from './TileBack';
/** Every region can be inspected with the production materials/figures; no game or save is created. */
export default function StageScenePreview({initialStage,close}:{initialStage:number,close:()=>void}){
 const [stage,setStage]=useState(initialStage),[requested,setRequested]=useState(initialStage),[retry,setRetry]=useState(0),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[above,setAbove]=useState(false),[size,setSize]=useState({width:0,height:0}),frame=useRef<HTMLDivElement>(null),button=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null),closed=useRef(close);closed.current=close;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null,resize=()=>{const r=frame.current?.getBoundingClientRect();if(r)setSize({width:r.width,height:r.height});},key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();closed.current();}if(e.key==='Tab'){const nodes=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};resize();const observer=new ResizeObserver(resize);if(frame.current)observer.observe(frame.current);button.current?.focus();window.addEventListener('resize',resize);document.addEventListener('keydown',key);return()=>{observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('keydown',key);previous?.focus();};},[]);
 useEffect(()=>{let cancelled=false;void warmStageScenes(initialStage,()=>cancelled);return()=>{cancelled=true;};},[initialStage]);
 useEffect(()=>{let cancelled=false;setLoading(true);setLoadError('');void prepareStageScene(requested).then(()=>{if(!cancelled){setStage(requested);setLoading(false);}},()=>{if(!cancelled){setLoadError('배경을 불러오지 못했어요. 다시 선택해 주세요.');setLoading(false);}});return()=>{cancelled=true;};},[requested,retry]);
 function chooseStage(next:number){if(next===requested){if(loadError)setRetry(n=>n+1);}else setRequested(next);}
 const theme=stageTheme(stage),layout=useMemo(()=>stagePreviewLayout(size.width,size.height,above),[size.width,size.height,above]),{diameter:D,cx,cy,overview,camera,shift}=layout;
 const company=theme.opponents.slice(0,2).map(p=>({name:p.name,avatar:`stage-portrait:${p.portrait}`,count:10,points:200}));
 if(typeof document==='undefined')return null;
 return createPortal(<StageVisuals stage={stage}><section ref={dialog} className="stage-scene-preview" role="dialog" aria-modal="true" aria-label="도전 테이블 둘러보기" style={{'--stage-accent':theme.accent} as CSSProperties}>
  <div ref={frame} className="scene-preview-frame"><div className="table-entrance entry-approach scene-preview-world" data-stage={stage} data-view={above?'above':'seated'} data-world-kind={platformGeometry(D,stage).setting.kind} data-curtain="clear"><div className="entry-room"><EntranceEnvironment stage={stage}/></div><div className="scene-preview-geometry" style={{transform:`translate(${shift.x}px,${shift.y}px)`}}><div className="entry-view-rig"><div className="entry-camera" style={{transform:cameraTransform(camera)}}>
   <EntranceSeats company={company} diameter={D} cx={cx} cy={cy} stage={stage} viewport={{...size,overview}}/>
   <div className="entry-table" style={{left:cx-D/2,top:cy-D/2,width:D,height:D,borderRadius:'50%',clipPath:platformGeometry(D,stage).clip}}><TableSurface stage={stage}/></div>
   {Array.from({length:15},(_,i)=><div key={i} className="scene-table-tile" style={{left:cx-195+i%5*80,top:cy-125+Math.floor(i/5)*103,width:65,height:86,transform:`translateZ(20px) rotate(${i%3*3-3}deg)`}}><Back/></div>)}
  </div></div><EntranceFurniture diameter={D} cx={cx} cy={cy} stage={stage} width={size.width} height={size.height} overview={overview} phase="approach" visible={true} cameraOverride={camera}/></div></div></div>
  <header className="scene-preview-header"><div><span className="eyebrow">도전 테이블 둘러보기 · {stage}/10</span><h2>{theme.name}</h2><p>{theme.material} · {company.map(p=>p.name).join(' / ')}</p></div><div className="scene-preview-actions"><button onClick={()=>setAbove(v=>!v)}>{above?'앉은 시점':'위에서 보기'}</button><button ref={button} onClick={close} aria-label="테이블 둘러보기 닫기">닫기 ×</button></div></header>
  <div className="scene-preview-foot"><div className="scene-preview-cards" aria-label="지역별 패 미리보기">{[0,1,2,3].map(s=><TileFace key={`${stage}:${s}`} tile={{id:28+s,n:8,s}}/>)}</div><nav className="scene-preview-regions" aria-label="둘러볼 스테이지">{STAGE_THEMES.map(t=><button key={t.stage} aria-pressed={requested===t.stage} aria-label={`${t.stage}스테이지 ${t.name} 둘러보기`} onPointerEnter={()=>void prepareStageScene(t.stage).catch(()=>{})} onFocus={()=>void prepareStageScene(t.stage).catch(()=>{})} onClick={()=>chooseStage(t.stage)}>{t.stage}</button>)}</nav><span className="scene-preview-loading" role="status" aria-live="polite">{loading?`${requested}번 지역 준비 중…`:loadError}</span><small>진행·점수·저장에는 영향 없이 10개 지역을 볼 수 있어요.</small></div>
 </section></StageVisuals>,document.body);
}
