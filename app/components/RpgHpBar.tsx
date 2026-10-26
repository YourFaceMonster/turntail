import type {CSSProperties} from 'react';

export function RpgHpBar({hp,owner='상대',compact=false}:{hp:number,owner?:string,compact?:boolean}){
 const value=Math.max(0,Math.min(100,hp));
 const danger=value<=25?'critical':value<=50?'wounded':'healthy';
 return <div className={`rpg-hp-bar ${compact?'compact':''} ${danger}`} role="meter" aria-label={`${owner} 체력`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} style={{'--hp-percent':`${value}%`} as CSSProperties}>
  <span className="rpg-hp-fill"/><strong>HP {value}<small>/100</small></strong>
 </div>;
}
