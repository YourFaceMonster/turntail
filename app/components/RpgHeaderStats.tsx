import type {RpgRun} from '../../lib/rpg.ts';

export default function RpgHeaderStats({run,itemMode=false}:{run:RpgRun,itemMode?:boolean}){
 return <div className="compact-score rpg-header-stats"><span className="rpg-header-hp"><small>HP</small> <b>{run.hp[0]}</b>/100</span>{!itemMode&&<span className="rpg-header-resources"><span>운명 <b>{run.fate}</b></span><span>주화 <b>{run.coins}</b></span><span>포인트 <b>{run.points}</b></span></span>}</div>;
}
