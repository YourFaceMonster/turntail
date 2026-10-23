/** The same wooden tabletop is used by the entrance and the live game. */
export default function TableSurface({withRim=false}:{withRim?:boolean}){
 return <div className="table-surface" aria-hidden="true">{withRim&&<div className="table-surface-rim"/>}<div className="table-surface-light"/></div>;
}
