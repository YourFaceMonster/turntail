import MonsterPortrait from './MonsterPortrait';
/** A featured rival is available without changing the player's table size. */
export default function OpponentPicker({featured,choose}:{featured:boolean,choose:(featured:boolean)=>void}){
 return <section className="opponent-picker" aria-label="AI 상대 선택">
  <span className="opponent-picker-label">이번 판 상대</span>
  <div className="segmented"><button type="button" className={!featured?'chosen':''} aria-pressed={!featured} onClick={()=>choose(false)}>랜덤 상대</button><button type="button" className={featured?'chosen':''} aria-pressed={featured} onClick={()=>choose(true)}>히보링지와 대결</button></div>
  {featured&&<div className="featured-rival"><MonsterPortrait index={3}/><div><strong>히보링지 <small>고수 · 급발진형</small></strong><p>초반 계산은 날카롭다. 판이 길어지면 열받아서 패를 막 쓴다.</p><q>히히. 빨리 끝내자. 나 성질 더럽다?</q></div></div>}
 </section>;
}
