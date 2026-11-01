'use client';
import {createPortal} from 'react-dom';
import type {RpgPreviewMode,RpgPreviewScreen} from '../../lib/rpg-preview';

type Props={mode:RpgPreviewMode,exit:()=>void,screen?:(target:RpgPreviewScreen)=>void,busy?:boolean};
export function RpgPreviewLabel({mode,exit,screen,busy=false}:Props){
 return <aside className="rpg-preview-tools" aria-label="RPG 테스트 진행"><span><b>TEST · {mode==='one-round'?'한 판 통과':'전투 없이 화면 확인'}</b><small>{mode==='one-round'?'한 판 후 자동 통과 · 보상은 주화로 처리':'화면 바로가기 · 저장·전적에 반영하지 않아요'}</small></span><button type="button" onClick={exit}>테스트 종료</button>{mode==='screens'&&screen&&<select aria-label="테스트 화면 바로가기" value="" disabled={busy} onChange={event=>screen(event.target.value as RpgPreviewScreen)}><option value="" disabled>화면 바로가기</option><option value="tavern">주점 바로 보기</option><option value="map">지도 보기</option><option value="prologue">프롤로그 다시 보기</option><option value="battle-1">ST1 전투 화면</option><option value="battle-2">ST2 전투 화면</option><option value="battle-3">ST3 전투 화면</option></select>}</aside>;
}
export default function RpgPreviewTools(props:Props){
 return typeof document==='undefined'?null:createPortal(<RpgPreviewLabel {...props}/>,document.body);
}
