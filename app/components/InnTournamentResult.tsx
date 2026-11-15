'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import type {view} from '../../lib/game';
import {INN_TOURNAMENT,TOURNAMENT_TITLE,noteTournament,tournamentGoalMet,tournamentMatchWon,type TournamentState} from '../../lib/inn-tournament';
import SeatPortrait from './SeatPortrait';

type View=ReturnType<typeof view>;
/** Result panel after each inn-tournament match; the last one crowns (or not) and stores the device record once. */
export default function InnTournamentResult({game,cup,busy,next,back,playerAvatar}:{game:View,cup?:TournamentState,busy:boolean,next:()=>void,back:()=>void,playerAvatar?:ReactNode}){
 const round=game.rpgMini!.roundIndex,challenger=INN_TOURNAMENT[round-1],result=game.result,final=round===INN_TOURNAMENT.length;
 const won=!!result&&tournamentMatchWon(result),goal=!!result&&tournamentGoalMet(round,result),champion=!!cup?.champion;
 const noted=useRef(false);
 useEffect(()=>{if(final&&cup?.finished&&!noted.current){noted.current=true;try{noteTournament(localStorage,cup);}catch{}}},[final,cup]);
 const places=(result?.players||[]).map((p,seat)=>({...p,seat})).sort((a,b)=>a.place-b.place);
 return <div className="modal-shade result-shade journey-match-result-shade"><section className="modal rpg-result journey-mini-result-panel inn-cup-result" role="dialog" aria-modal="true" aria-label="여관 토너먼트 결과">
  <span className="eyebrow">INN CUP · {round}/{INN_TOURNAMENT.length}</span>
  <h2>{final?(champion?`우승 · ${TOURNAMENT_TITLE}`:'토너먼트 종료'):`${round}판 · ${challenger.name}와의 승부`}</h2>
  <ol className="inn-cup-places">{places.map(p=><li key={p.id}><span className="inn-cup-face">{p.seat===game.me&&playerAvatar?playerAvatar:<SeatPortrait avatar={game.players[p.seat]?.avatar} seat={p.seat}/>}</span><b>{p.place}등</b><span>{p.name}</span><small>남은 패 {p.count}장</small></li>)}</ol>
  <blockquote className="journey-speech"><SeatPortrait avatar={challenger.avatar} seat={1}/><strong>{challenger.name}</strong><p>{won?challenger.win:challenger.lose}</p></blockquote>
  <p className={`inn-cup-goal-line ${goal?'is-met':''}`}>특별 목표 · {challenger.goal} · <b>{goal?'달성 ★':'실패'}</b></p>
  <p className="inn-cup-tally">지금까지 1등 <b>{cup?.wins.length||0}</b>판 · 특별 목표 <b>{cup?.goals.length||0}</b>/3</p>
  {final?<>
   <p className="inn-cup-final">{champion?`세 판 중 ${cup?.wins.length}판을 1등으로 마쳤어요. 장부에 “${TOURNAMENT_TITLE}”로 이름이 남았어요.`:'두 판 이상 1등을 하지 못했어요. 주점에서 언제든 다시 도전할 수 있어요.'}</p>
   <button className="primary full" disabled={busy} onClick={back}>주점으로 돌아가기</button>
  </>:<>
   <p className="inn-cup-next">다음 상대 · <b>{INN_TOURNAMENT[round].name}</b> ({INN_TOURNAMENT[round].title}) — “{INN_TOURNAMENT[round].intro[0]}”</p>
   <button className="primary full" disabled={busy} onClick={next}>다음 판 · {round+1}/{INN_TOURNAMENT.length} →</button>
   <button className="secondary full" disabled={busy} onClick={back}>토너먼트 그만두기</button>
  </>}
 </section></div>;
}
