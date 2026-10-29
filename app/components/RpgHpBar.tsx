import type {CSSProperties,ReactNode} from 'react';

export function RpgHpBar({hp,maxHp=100,owner='상대',compact=false,identity,change,detail,summary,persistentChange=false}:{hp:number,maxHp?:number,owner?:string,compact?:boolean,identity?:ReactNode,change?:ReactNode,detail?:ReactNode,summary?:ReactNode,persistentChange?:boolean}){
 const value=Math.max(0,Math.min(maxHp,hp));
 const danger=value<=25?'critical':value<=50?'wounded':'healthy';
 return <div className={`rpg-hp-bar ${compact?'compact':''} ${identity?'has-identity':''} ${persistentChange?'keeps-hp-change':''} ${danger}`} role="meter" aria-label={`${owner} 체력`} aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={value} style={{'--hp-percent':`${value/maxHp*100}%`} as CSSProperties}>
  <span className="rpg-hp-fill"/>{identity?<><span className="hp-bar-identity">{identity}{detail&&<small>{detail}</small>}</span><span className={`hp-bar-current ${summary?'has-round-summary':''}`}>{summary&&<span className="hp-round-summary">{summary}</span>}<small>HP</small><span className={`hp-value ${change&&!persistentChange?'has-hp-change':''}`}><b>{value}</b>{change&&!persistentChange&&<span className="hp-change-float" aria-hidden="true">{change}</span>}</span><small className="hp-maximum">/{maxHp}{change&&persistentChange&&<span className="hp-change-float hp-change-pinned" aria-hidden="true">{change}</span>}</small></span></>:<strong>HP {value}<small>/{maxHp}</small></strong>}
 </div>;
}
