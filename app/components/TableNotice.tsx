"use client";
export default function TableNotice({title,detail,seconds}:{title:string,detail:string,seconds?:number}){
 return <div className="table-notice" role="status" aria-live="polite"><strong>{title}</strong>{seconds!==undefined&&<span className="notice-count">{seconds}</span>}<p>{detail}</p></div>;
}
