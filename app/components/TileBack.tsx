"use client";
import {useStageVisual,StageBackArt} from "./StageVisuals";
import {memo} from 'react';
function TileBack({flat=false}:{flat?:boolean}){const stage=useStageVisual();if(stage)return <span className="tile back stage-material-tile"><StageBackArt stage={stage}/></span>;if(flat)return <span className="tile back tile-back-shared"><span className="entry-back-art"/></span>;return <span className="tile back tile-back-shared"><svg viewBox="0 0 100 132" preserveAspectRatio="none" aria-hidden="true"><rect x="6" y="6" width="88" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="11" y="11" width="78" height="110" rx="7" fill="none" stroke="currentColor" strokeWidth=".8"/>{Array.from({length:16},(_,i)=><path key={i} transform={`translate(50 66) rotate(${i*22.5})`} d="M0-4L-2-20L0-38L2-20Z" fill="currentColor"/>)}<path d="M50 22L53 27L50 32L47 27ZM50 100L53 105L50 110L47 105Z" fill="currentColor"/></svg></span>;}
export default memo(TileBack);
