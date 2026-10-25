import type {CSSProperties,ReactNode} from 'react';
import KoreanPortrait from './KoreanPortrait';
import {StagePortrait} from './StagePortrait';
import {TwinPortrait} from './TwinPortrait';
import {twinIndex} from '../../lib/rpg-twins';
const clothes=[['#7b3e4d','#dfbd89','#928b80'],['#344e68','#b19b73','#292b2e'],['#748779','#e8dbba','#252a2b'],['#507c61','#d0b88d','#302b27'],['#a96535','#dfc095','#302720'],['#3d7182','#decaab','#38322d'],['#63506c','#c4b697','#a5a19b'],['#407c7b','#dab580','#2d2827']];
function Volume({part,children}:{part:string,children?:ReactNode}){
 return <div className={`figure-volume figure-${part}`}><i className="volume-front">{children}</i><i className="volume-left"/><i className="volume-right"/><i className="volume-top"/></div>;
}
/** Small static solid figures share the existing face atlas; no extra scene engine. */
export default function SeatedCharacter({name,avatar='',index}:{name:string,avatar?:string,index:number}){
 const portrait=Number(avatar.split(':')[1]),n=Number.isInteger(portrait)?portrait:index,[coat,trim,hair]=clothes[((n%8)+8)%8];
 const twin=twinIndex(avatar),face=twin!==null?<TwinPortrait index={twin}/>:avatar.startsWith('stage-portrait:')?<StagePortrait index={portrait}/>:avatar.startsWith('korean-portrait:')?<KoreanPortrait index={portrait}/>:avatar?<img src={avatar} alt=""/>:<span className="figure-emoji">{['🦉','🐯','🐼'][index%3]}</span>;
 return <div className="seated-figure" data-character-model={name} data-build={n===0||n===4?'broad':'regular'} style={{'--figure-coat':coat,'--figure-trim':trim,'--figure-hair':hair,'--figure-skin':n===0||n===6?'#cba284':'#d7ae8d'} as CSSProperties}>
  <Volume part="chair-back"><span className="chair-carving"/></Volume><Volume part="chair-seat"/>
  <Volume part="chair-leg left"/><Volume part="chair-leg right"/>
  <Volume part="shin left"/><Volume part="shin right"/>
  <Volume part="knee left"/><Volume part="knee right"/>
  <Volume part="torso"><span className="figure-collar"/><span className="figure-lapel"/><span className="figure-sash"/><span className="figure-folds"/></Volume>
  <Volume part="neck"/>
  <Volume part="upper-arm left"/><Volume part="upper-arm right"/>
  <Volume part="forearm left"/><Volume part="forearm right"/>
  <Volume part="hand left"><b className="figure-fingers"/></Volume><Volume part="hand right"><b className="figure-fingers"/></Volume>
  <Volume part="head">{face}</Volume>
 </div>;
}
