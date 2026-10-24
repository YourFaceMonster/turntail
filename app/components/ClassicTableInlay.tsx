/** Fine boxwood stringing and an ebonised border, scaled with the actual round top. */
export default function ClassicTableInlay({view,diameter}:{view?:{x:number,y:number,width:number,height:number},diameter?:number}){
 const d=diameter||1000;
 return <svg className="classic-table-inlay" viewBox={view?`${view.x} ${view.y} ${view.width} ${view.height}`:'0 0 1000 1000'} preserveAspectRatio="none" aria-hidden="true"><g transform={view?`scale(${d/1000})`:undefined} fill="none">
  <circle cx="500" cy="500" r="481" stroke="#160d0a" strokeWidth="25" opacity=".72"/>
  <circle cx="500" cy="500" r="470" stroke="#bd935b" strokeWidth="2.3" opacity=".74"/>
  <circle cx="500" cy="500" r="464" stroke="#d9b878" strokeWidth=".8" opacity=".56"/>
  <circle cx="500" cy="500" r="457" stroke="#24130b" strokeWidth="8" opacity=".58"/>
  <circle cx="500" cy="500" r="452" stroke="#d8ac6c" strokeWidth="1.2" opacity=".58"/>
  {[0,90,180,270].map(angle=><g key={angle} transform={`rotate(${angle} 500 500)`} stroke="#d1aa6b" opacity=".34" strokeWidth="1.05"><path d="M480 58Q489 69 500 59Q511 69 520 58M488 59Q500 44 512 59M496 59L500 68L504 59"/><path d="M474 59L468 57M526 59L532 57"/></g>)}
 </g></svg>;
}
