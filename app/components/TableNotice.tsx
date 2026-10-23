"use client";
export default function TableNotice({title,detail,seconds,leader}:{title:string,detail:string,seconds?:number,leader?:string}){
 return <div className={`table-notice ${leader?'table-notice-lead':''}`} role="status" aria-live="polite">{leader?<><span className="notice-lead-label">선</span><strong className="notice-leader-name">{leader}</strong></>:<strong>{title}</strong>}{seconds!==undefined&&<span className="notice-count">{seconds}</span>}<p>{detail}</p></div>;
}
