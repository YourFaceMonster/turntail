import {hpLimit} from '../../lib/hp-limit';
import type {RpgRun} from '../../lib/rpg.ts';
import {tr} from '../../lib/i18n/index.ts';

export default function RpgHeaderStats({run,itemMode=false}:{run:RpgRun,itemMode?:boolean}){
 return <div className="compact-score rpg-header-stats"><span className="rpg-header-hp"><small>HP</small> <b>{run.hp[0]}</b>/{hpLimit(run)}</span>{!itemMode&&!run.rework&&<span className="rpg-header-resources">{run.phaseOne?<span>{tr('스테이지')} <b>{run.stage}/3</b></span>:<span>{tr('운명')} <b>{run.fate}</b></span>}<span>{tr('주화')} <b>{run.coins}</b></span>{!run.phaseOne&&<span>{tr('포인트')} <b>{run.points}</b></span>}</span>}</div>;
}
