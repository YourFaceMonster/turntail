import RpgCastPortrait from './RpgCastPortrait';
import SuitMotif from './SuitMotif';
import {TwinPortrait} from './TwinPortrait';
import {stageOpponents} from '../../lib/stage-theme.ts';
import {JOURNEY_REGIONS,JOURNEY_STAGE_NAMES,chapterArt,rpgStageCast,stageRegion,RPG_GUARDIANS,RPG_GUARDIAN_ART} from '../../lib/rpg-chapters.ts';
import './journey-destination.css';

/** ST1~3 keep their approved connection paintings; ST4~10 use the stage's "before" painting. */
const EARLY_ART:Record<number,string>={1:'/prologue/gate-before-portrait-r61-iron-v1.webp',2:'/prologue/square-poko-portrait-night-symbols-v6.webp',3:'/prologue/twins-before-portrait-r61-iron-v1.webp'};
const REGION_MAP:Record<number,string>={1:'/prologue/iron-gate-village-map-portrait-v3.webp'};
/** Region emblem = the suit its keepsake carries (iron gate, sacred flame, secret key, crown). */
const REGION_SUIT:Record<number,number>={1:0,2:2,3:1,4:3};
const Sigil=({region}:{region:number})=><svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" fill="currentColor"><g transform="translate(50 50)"><SuitMotif s={REGION_SUIT[region]}/></g></svg>;
/** 2026-11-17: ST1~3 show the same faces as their duel seats (painted crops for ST1·2, twin portraits for ST3). */
const EARLY_CAST:Record<number,readonly {name:string,portrait?:number,twin?:0|1}[]>={
 1:[{name:'문지기 로웬',portrait:stageOpponents(1)[0].portrait},{name:'루미',portrait:stageOpponents(1)[1].portrait}],
 2:stageOpponents(2).map(p=>({name:p.name,portrait:p.portrait})),
 3:[{name:'첫째',twin:0},{name:'둘째',twin:1}],
};
export const isRegionGate=(stage:number)=>stage===4||stage===7||stage===10;

function stageArt(stage:number){return EARLY_ART[stage]||chapterArt(`st${stage}-before`).portrait;}
function regionArt(region:number){return REGION_MAP[region]||chapterArt(`region-${region}-map`).portrait;}

/**
 * 2026-11-13: dressed header for the "next battle" dialog. Every stage shows its painting and its rivals;
 * the first stage of a region (ST4·7·10) becomes a region gate with the region map, a ribbon and the road ahead.
 */
export default function JourneyDestinationHead({stage,title}:{stage:number,title:string}){
 const region=stageRegion(stage),gate=isRegionGate(stage),info=JOURNEY_REGIONS[region as keyof typeof JOURNEY_REGIONS];
 type Cast={name:string,art?:string,portrait?:number,twin?:0|1};
 const cast:Cast[]=stage===10?RPG_GUARDIANS.map(g=>({name:g.name,art:RPG_GUARDIAN_ART})):
  (rpgStageCast(stage)?.map(p=>({name:p.name,portrait:p.portrait}))??[...(EARLY_CAST[stage]||[])]);
 return <>
  <div className="destination-hero" data-gate={gate||undefined} aria-hidden="true">
   <img src={gate?regionArt(region):stageArt(stage)} alt="" decoding="async"/>
   {gate&&<span className="destination-ribbon"><i data-region={region}><Sigil region={region}/></i>새 영역 · {info.name}</span>}
   <span className="destination-stage-no">STAGE {stage}</span>
  </div>
  <h3 className="destination-title">{title}</h3>
  {gate&&<ol className="destination-road" aria-label={`${info.name}의 길`}>{info.stages.map((s,i)=><li key={s} data-here={s===stage||undefined}><b>ST{s}</b><span>{JOURNEY_STAGE_NAMES[s]}</span>{i<info.stages.length-1&&<em aria-hidden="true">›</em>}</li>)}</ol>}
  {!!cast.length&&<ul className="destination-cast" aria-label="상대">{cast.map((p,i)=><li key={i}><span className="destination-face">{p.art?<img src={p.art} alt=""/>:p.twin!==undefined?<TwinPortrait index={p.twin}/>:p.portrait!==undefined?<RpgCastPortrait index={p.portrait}/>:<span>{p.name.slice(0,1)}</span>}</span><small>{p.name}</small></li>)}</ul>}
 </>;
}
