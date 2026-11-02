import {writeFileSync} from 'node:fs';
import {contours,hearth,bag} from './tavern-contour-paths.mjs';
const figures=[{id:'mor',name:'모르',role:'까마귀 주점 주인 · 이야기'},{id:'pio',name:'피오',role:'여우 여행자 · 이야기'},{id:'serin',name:'세린',role:'은발 승부사 · 3판 승부'}].map(person=>({...person,wide:contours[person.id].wide,tall:contours[person.id].tall}));
function normalize(d,width,height){let coordinate=0;return d.replace(/-?\d+(?:\.\d+)?/g,value=>String(Number((Number(value)/(coordinate++%2===0?width:height)).toFixed(6))));}
const data=figures.map(({wide,tall,...person})=>({...person,wide:normalize(wide,1672,941),portrait:normalize(tall,941,1672)}));
const hearthData={wide:normalize(hearth.wide,1672,941),portrait:normalize(hearth.portrait,941,1672)};
const bagData={wide:normalize(bag.wide,1672,941),portrait:normalize(bag.portrait,941,1672)};
const component=`'use client';
const hearth=${JSON.stringify(hearthData)};
const bag=${JSON.stringify(bagData)};
const characters=${JSON.stringify(data,null,1)} as const;
type Props={busy:boolean,selected:string|null,choose:(id:string)=>void};
/** Source-aligned visible silhouettes. Transparent interiors preserve every original face and material. */
export default function TavernCharacters({busy,selected,choose}:Props){
 return <div className="tavern-character-layer"><svg className="tavern-character-contours" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">{characters.map(person=><g key={person.id} className={\x60tavern-character-hit hit-\x24{person.id} \x24{selected===person.id?'is-selected':''}\x60} onClick={()=>{if(!busy)choose(person.id);}}><path className="character-wide" d={person.wide}/><path className="character-portrait" d={person.portrait}/></g>)}<g className={\`tavern-hearth-hit \${selected==='fire'?'is-selected':''}\`} onClick={()=>{if(!busy)choose('fire');}}><path className="character-wide" d={hearth.wide}/><path className="character-portrait" d={hearth.portrait}/></g><g className={\`tavern-bag-hit \${selected==='bag'?'is-selected':''}\`} onClick={()=>{if(!busy)choose('bag');}}><path className="character-wide" d={bag.wide}/><path className="character-portrait" d={bag.portrait}/></g></svg>{characters.map(person=><button type="button" key={person.id} className={\x60tavern-character-label label-\x24{person.id}\x60} disabled={busy} onClick={()=>choose(person.id)} aria-label={\x60\x24{person.name} · \x24{person.role}\x60} aria-haspopup="dialog" aria-expanded={selected===person.id}>{person.name}<small>대화</small></button>)}</div>;
}
`;
writeFileSync('app/components/TavernCharacters.tsx',component);

