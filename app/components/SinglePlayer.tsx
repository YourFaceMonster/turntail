"use client";
import {useState} from 'react';
import {Compass} from 'lucide-react';
import MenuTableArt from './MenuTableArt';
const MENU_PIPS:Record<number,number[]>={1:[4],2:[0,8],3:[0,4,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function MenuDice({value}:{value:number}){return <span className="menu-yacht-die">{Array.from({length:9},(_,i)=><i key={i} className={MENU_PIPS[value].includes(i)?(value===1?'is-ace':'is-pip'):''}/>)}</span>;}
import type {SaveSlot} from '../../lib/save-slots';
/** Item battle (HP ITEM MATCH) left the menu on 2026-11-09; Yacht Dice took its card. Its code is removed at the final release.
 * Bomb Market (폭탄시장전) left the menu on 2026-11-17 (user: rules hard to follow). The /bomb-market route, its saves and
 * records stay; the code is removed later if the mode is not revived. */
import './daily-board.css';
import './resume-plain.css';
import {tr,trv} from '../../lib/i18n/index.ts';
export function SinglePlayerMenu({normal,yacht,rpg,daily,close}:{normal:()=>void,yacht?:()=>void,rpg:()=>void,daily?:()=>void,close:()=>void}){
 return <div className="modal-shade" onClick={close}><section className="modal single-mode-menu menu-surface menu-theme-single" role="dialog" aria-modal="true" aria-labelledby="single-mode-title" onClick={e=>e.stopPropagation()}><button className="close" onClick={close} aria-label={tr('닫기')}>×</button><h2 id="single-mode-title">{tr('싱글플레이')}</h2><div className="single-mode-cards"><button aria-label={tr('스토리모드')} onClick={rpg} className="mode-rpg"><span className="menu-mode-scene is-rpg" aria-hidden="true"><Compass/></span><strong>{tr('스토리모드')}</strong><p>{tr('1~10스테이지 · 패싸움 · 유물')}<br/>{tr('별도로 저장되는 새 여정')}</p></button>{yacht&&<button aria-label={tr('요트다이스')} onClick={yacht} className="mode-hp-items mode-yacht"><span className="menu-mode-scene is-yacht" aria-hidden="true"><MenuDice value={5}/><MenuDice value={1}/><MenuDice value={3}/><MenuDice value={6}/><MenuDice value={2}/></span><strong>{tr('요트다이스')}</strong><p>{tr('노름꾼 하로와 1:1')}<br/>{tr('12칸 점수판 · 조커룰')}</p></button>}<button aria-label={tr('일반모드')} onClick={normal} className="mode-normal"><span className="menu-mode-scene" aria-hidden="true"><MenuTableArt/></span><strong>{tr('일반모드')}</strong><p>{tr('주점 손님과 3·4인 대전')}<br/>{tr('원하는 만큼 이어지는 대전')}</p></button></div>{daily&&<button className="single-daily-strip" onClick={daily} aria-label={tr('오늘의 판')}><span aria-hidden="true">☀</span><span><strong>{tr('오늘의 판')}</strong><small>{tr('모두 같은 패로 한 판 · 오늘 순위')}</small></span></button>}</section></div>;
}
export function ResumePicker({slots,errors,choose,close,remove}:{slots:SaveSlot[],errors:string[],choose:(mode:SaveSlot['mode'])=>void,close:()=>void,remove?:(modes:SaveSlot['mode'][])=>boolean}){
 const [deleting,setDeleting]=useState(false),[checked,setChecked]=useState<SaveSlot['mode'][]>([]);
 const available=slots.filter(slot=>slot.mode!=='stage'&&slot.mode!=='item'&&slot.mode!=='hp-item'&&slot.mode!=='hp-item-2'&&!slot.game?.challenge&&!slot.game?.stageRun),selected=available.filter(slot=>checked.includes(slot.mode));
 const cancel=()=>{setDeleting(false);setChecked([]);};
 // 2026-11-25 user request ("너무 AI 같다"): one plain list, no filler lines, no nested boxes, deleting tucked away.
 const toggle=(mode:SaveSlot['mode'],on:boolean)=>setChecked(old=>on?[...old,mode]:old.filter(item=>item!==mode));
 return <div className="modal-shade" onClick={close}><section className="modal resume-picker resume-plain" role="dialog" aria-modal="true" aria-labelledby="resume-picker-title" onClick={e=>e.stopPropagation()}><button className="close" aria-label={tr('닫기')} onClick={close}>×</button><h2 id="resume-picker-title">{deleting?tr('지울 저장을 고르세요'):tr('이어서 하기')}</h2>{deleting&&<p className="resume-note">{tr('진행만 지워요. 업적·해금·설정은 남아요.')}</p>}
  <ul className="resume-rows">{available.map(slot=><li key={slot.mode}>{deleting?<label className={`resume-row ${checked.includes(slot.mode)?'is-checked':''}`}><input type="checkbox" checked={checked.includes(slot.mode)} onChange={event=>toggle(slot.mode,event.target.checked)}/><span><strong>{trv(slot.title)}</strong><small>{slot.detail}</small></span></label>
   :<button type="button" className="resume-row" onClick={()=>choose(slot.mode)}><span><strong>{trv(slot.title)}</strong><small>{slot.detail}</small></span><b aria-hidden="true">▶</b></button>}</li>)}</ul>
  {!available.length&&<p className="resume-note">{tr('이어갈 게임이 없어요.')}</p>}{errors.map(error=><p className="stage-error" role="alert" key={error}>{error}</p>)}
  {remove&&available.length>0&&<div className="resume-foot">{deleting?<><button type="button" className="resume-text-button" onClick={cancel}>{tr('취소')}</button><button type="button" className="resume-delete" disabled={!selected.length} onClick={()=>{if(remove(selected.map(slot=>slot.mode)))cancel();}}>{selected.length?tr('{0}개 지우기',{0:selected.length}):tr('지우기')}</button></>:<button type="button" className="resume-text-button" onClick={()=>setDeleting(true)}>{tr('저장 지우기')}</button>}</div>}
 </section></div>;
}
export function NewGameConfirm({mode,detail,confirm,cancel}:{mode:'single'|'rpg',detail:string,confirm:()=>void,cancel:()=>void}){
 return <div className="modal-shade stage-confirm-shade"><section className="modal new-game-confirm" role="alertdialog" aria-modal="true" aria-labelledby="new-game-title" aria-describedby="new-game-description"><h2 id="new-game-title">{tr('저장된 진행이 있어요.')}<br/>{tr('새로 시작할까요?')}</h2><p id="new-game-description"><b>{mode==='rpg'?tr('스토리모드'):tr('일반모드')}</b> · {detail}<br/>{tr('새로 시작하면 이 모드의 진행을 이어갈 수 없어요.')}{mode==='rpg'&&<> {tr('지금까지의 여정은 전적에 남아요.')}</>}</p><button className="primary full" onClick={cancel}>{tr('취소 · 저장된 진행 유지')}</button><button className="secondary full" onClick={confirm}>{tr('새로 시작하기')}</button></section></div>;
}
