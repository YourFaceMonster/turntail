'use client';
import {createPortal} from 'react-dom';
import {RPG_PREVIEW_SCREENS,type RpgPreviewMode,type RpgPreviewScreen} from '../../lib/rpg-preview';
import {tr,trv} from '../../lib/i18n/index.ts';

type Props={mode:RpgPreviewMode,exit:()=>void,screen?:(target:RpgPreviewScreen)=>void,busy?:boolean};
export function RpgPreviewLabel({mode,exit,screen,busy=false}:Props){
 return <details className="rpg-preview-tools" aria-label={tr('RPG 테스트 진행')}><summary aria-label={tr('테스트 도구 열기')}>TEST</summary><div className="rpg-preview-popover"><span><b>{mode==='one-round'?tr('한 판 통과'):tr('화면 테스트')}</b><small>{mode==='one-round'?tr('한 판 후 자동 통과 · 저장하지 않아요'):tr('진행은 저장되지 않아요')}</small></span><button type="button" onClick={exit}>{tr('테스트 종료')}</button>{mode==='screens'&&screen&&<select aria-label={tr('테스트 화면 바로가기')} value="" disabled={busy} onChange={event=>{screen(event.target.value as RpgPreviewScreen);event.currentTarget.closest('details')?.removeAttribute('open');}}><option value="" disabled>{tr('화면 바로가기')}</option>{RPG_PREVIEW_SCREENS.map(screen=><option key={screen.id} value={screen.id}>{trv(screen.label)}</option>)}</select>}</div></details>;
}
export default function RpgPreviewTools(props:Props){
 return typeof document==='undefined'?null:createPortal(<RpgPreviewLabel {...props}/>,document.body);
}
