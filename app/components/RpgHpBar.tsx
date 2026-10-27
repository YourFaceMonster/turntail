import type {CSSProperties,ReactNode} from 'react';

export function RpgHpBar({hp,owner='상대',compact=false,identity,change,detail}:{hp:number,owner?:string,compact?:boolean,identity?:ReactNode,change?:ReactNode,detail?:ReactNode}){
 const value=Math.max(0,Math.min(100,hp));
 const danger=value<=25?'critical':value<=50?'wounded':'healthy';
 return <div className={`rpg-hp-bar ${compact?'compact':''} ${identity?'has-identity':''} ${danger}`} role="meter" aria-label={`${owner} 체력`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} style={{'--hp-percent':`${value}%`} as CSSProperties}>
  <span className="rpg-hp-fill"/>{identity?<><span className="hp-bar-identity">{identity}{detail&&<small>{detail}</small>}</span><span className="hp-bar-current"><small>HP</small><span className={`hp-value ${change?'has-hp-change':''}`}><b>{value}</b>{change&&<span className="hp-change-float" aria-hidden="true">{change}</span>}</span><small className="hp-maximum">/100</small></span></>:<strong>HP {value}<small>/100</small></strong>}
 </div>;
}
