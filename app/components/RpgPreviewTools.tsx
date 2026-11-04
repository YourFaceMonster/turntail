'use client';
import {createPortal} from 'react-dom';
import type {RpgPreviewMode,RpgPreviewScreen} from '../../lib/rpg-preview';

type Props={mode:RpgPreviewMode,exit:()=>void,screen?:(target:RpgPreviewScreen)=>void,busy?:boolean};
export function RpgPreviewLabel({mode,exit,screen,busy=false}:Props){
 return <details className="rpg-preview-tools" aria-label="RPG 테스트 진행"><summary aria-label="테스트 도구 열기">TEST</summary><div className="rpg-preview-popover"><span><b>{mode==='one-round'?'한 판 통과':'화면 테스트'}</b><small>{mode==='one-round'?'한 판 후 자동 통과 · 저장하지 않아요':'진행은 저장되지 않아요'}</small></span><button type="button" onClick={exit}>테스트 종료</button>{mode==='screens'&&screen&&<select aria-label="테스트 화면 바로가기" value="" disabled={busy} onChange={event=>{screen(event.target.value as RpgPreviewScreen);event.currentTarget.closest('details')?.removeAttribute('open');}}><option value="" disabled>화면 바로가기</option><option value="tavern">주점 바로 보기</option><option value="map">지도 보기</option><option value="prologue">프롤로그 다시 보기</option><option value="battle-1">ST1 전투 화면</option><option value="battle-2">ST2 전투 화면</option><option value="battle-3">ST3 전투 화면</option><option value="reward-1">ST1 클리어·보상</option><option value="reward-2">ST2 클리어·보상</option><option value="reward-3">ST3 클리어·보상</option><option value="mini-round">세린 · 이번 판 결과</option><option value="mini-final">세린 · 3판 최종 결과</option><option value="failed">여정 실패</option></select>}</div></details>;
}
export default function RpgPreviewTools(props:Props){
 return typeof document==='undefined'?null:createPortal(<RpgPreviewLabel {...props}/>,document.body);
}
