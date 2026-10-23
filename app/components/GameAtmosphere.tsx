"use client";
export default function GameAtmosphere({level}:{level:0|1|2}){
 return <div className="endgame-atmosphere" data-level={level} aria-hidden="true"><div className="endgame-vignette"/><div className="endgame-warm-light"/><div className="endgame-cool-light"/><div className="endgame-cast-shadows"><i/><i/><i/></div></div>;
}
