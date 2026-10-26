"use client";
import type {SaveSlot} from '../../lib/save-slots';
export function SinglePlayerMenu({normal,items,rpg,close}:{normal:()=>void,items?:()=>void,rpg:()=>void,close:()=>void}){
 return <div className="modal-shade" onClick={close}><section className="modal single-mode-menu compact-single-menu" role="dialog" aria-modal="true" aria-labelledby="single-mode-title" onClick={event=>event.stopPropagation()}>
  <button className="close" onClick={close} aria-label="닫기">×</button><h2 id="single-mode-title">싱글플레이</h2>
  <div className="single-mode-options"><button type="button" onClick={normal}>일반모드</button>{items&&<button type="button" onClick={items}>아이템전</button>}<button type="button" className="single-mode-rpg" onClick={rpg}>RPG모드</button></div>
 </section></div>;
}
export function ResumePicker({slots,errors,choose,close}:{slots:SaveSlot[],errors:string[],choose:(mode:SaveSlot['mode'])=>void,close:()=>void}){
 const available=slots.filter(slot=>slot.mode!=='stage'&&slot.mode!=='item'&&!slot.game?.challenge&&!slot.game?.stageRun);
 return <div className="modal-shade" onClick={close}><section className="modal resume-picker" role="dialog" aria-modal="true" aria-labelledby="resume-picker-title" onClick={e=>e.stopPropagation()}><button className="close" aria-label="닫기" onClick={close}>×</button><span className="eyebrow">YOUR SAVED TABLES</span><h2 id="resume-picker-title">어떤 게임을 이어갈까요?</h2><p>마지막으로 하던 모드와 관계없이 선택할 수 있어요.</p><div className="save-slot-list">{available.map(slot=><button key={slot.mode} onClick={()=>choose(slot.mode)}><span aria-hidden="true">{slot.mode==='multi'?'♧':'✦'}</span><div><strong>{slot.title}</strong><small>{slot.detail}</small></div><b>이어서 하기 →</b></button>)}</div>{!available.length&&<p>이어갈 게임이 없어요.</p>}{errors.map(error=><p className="stage-error" role="alert" key={error}>{error}</p>)}<p className="foot muted">선택하지 않은 모드의 저장은 그대로 남아요.</p></section></div>;
}
export function NewGameConfirm({mode,detail,confirm,cancel}:{mode:'single'|'rpg'|'hp-item',detail:string,confirm:()=>void,cancel:()=>void}){
 return <div className="modal-shade stage-confirm-shade"><section className="modal new-game-confirm" role="alertdialog" aria-modal="true" aria-labelledby="new-game-title" aria-describedby="new-game-description"><span className="eyebrow">A SAVED GAME EXISTS</span><h2 id="new-game-title">저장된 진행이 있어요.<br/>새로 시작할까요?</h2><p id="new-game-description"><b>{mode==='rpg'?'RPG 여정':mode==='hp-item'?'아이템전':'일반모드'}</b> · {detail}<br/>새로 시작하면 이 모드의 진행을 이어갈 수 없어요.{mode==='rpg'&&<> 지금까지의 여정은 전적에 남아요.</>}</p><button className="primary full" onClick={cancel}>취소 · 저장된 진행 유지</button><button className="secondary full" onClick={confirm}>새로 시작하기</button></section></div>;
}
