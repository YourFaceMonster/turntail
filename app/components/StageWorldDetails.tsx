import type {CSSProperties} from 'react';
import {stagePalette} from '../../lib/stage-presentation';
const names=['관문의 석등','야영지의 천막','숲의 고사리','폭포의 갈대','쉼터의 밧줄 기둥','회랑의 깃발','고목의 달등','성소의 천구의','제단의 화로','세계수의 금빛 뿌리'];
function Prop({stage}:{stage:number}){
 switch(stage){
 case 1:return <><path d="M35 178H125L116 162H44ZM47 162V96H113V162ZM40 96L30 80L80 44L130 80L120 96ZM58 107H102V147H58Z" fillRule="evenodd"/><path d="M80 147V107M58 127H102M80 44V27"/><path d="M77 142Q60 125 80 111Q96 130 85 142Z" className="world-prop-light"/></>;
 case 2:return <><path d="M10 175L70 48L148 168L98 179L70 84L45 179Z"/><path d="M70 48L98 179M70 48L130 65L148 168M18 175L4 187M148 168L157 188"/><path d="M30 151L45 138L58 154L45 160Z" className="world-prop-light"/></>;
 case 3:return <><path d="M80 181Q73 110 24 55M80 160Q97 101 142 72M79 134Q64 80 83 30" fill="none"/>{[0,1,2,3,4].map(i=><g key={i} transform={`translate(0 ${i*21})`}><path d="M75 145Q24 113 21 75Q66 87 75 145ZM86 152Q137 127 143 96Q101 99 86 152Z" transform={`translate(0 ${-i*30}) scale(${1-i*.1})`}/></g>)}</>;
 case 4:return <><path d="M47 182Q49 99 28 45M77 184Q78 95 87 27M109 182Q105 113 137 62M65 180Q43 131 12 116M97 180Q119 143 148 139" fill="none"/><path d="M24 39L25 67L35 67L34 39ZM82 22V60H92V22ZM134 57L124 85L133 88L143 60Z"/><path d="M12 187Q67 172 149 185M25 196Q88 183 136 195" fill="none" className="world-prop-light"/></>;
 case 5:return <><path d="M29 184L35 47H52L58 184ZM106 184L111 26H129L136 184Z"/><path d="M42 71Q83 121 120 51M43 91Q83 141 120 71" fill="none" strokeWidth="8"/><path d="M34 52L53 59M34 63L53 70M110 32L130 39M110 44L130 51"/></>;
 case 6:return <><path d="M27 184V31H38V184ZM38 40H132L119 128L83 143L47 123Z"/><path d="M47 49H119L108 117L83 130L58 113Z" fill="none"/><path d="M83 64L89 83L109 85L94 98L97 117L83 108L68 117L72 98L57 85L77 83Z" className="world-prop-light"/><path d="M18 184H49M33 31V19"/></>;
 case 7:return <><path d="M20 184Q42 99 91 26L117 18M40 173Q54 98 92 57" fill="none" strokeWidth="9"/><path d="M104 24V63M86 71L104 59L124 72L120 119L104 134L88 119Z"/><path d="M113 77Q83 86 106 116Q90 119 92 96Q90 80 113 77Z" className="world-prop-light"/></>;
 case 8:return <><path d="M47 184H116L104 173H59ZM76 172V119H87V172Z"/><g fill="none"><ellipse cx="81" cy="83" rx="55" ry="48"/><ellipse cx="81" cy="83" rx="22" ry="54" transform="rotate(30 81 83)"/><path d="M24 84H137M81 26V140M43 48L122 118"/></g><path d="M81 56L88 74L108 77L92 90L96 110L81 99L64 110L69 90L53 77L74 74Z" className="world-prop-light"/></>;
 case 9:return <><path d="M31 111H130L114 143H48ZM51 145L40 181H55L65 146M102 145L115 181H129L115 144M48 184H118"/><path d="M56 106Q31 81 69 53Q62 75 80 72Q99 62 91 25Q138 76 107 107Z" className="world-prop-light"/><path d="M79 110Q67 91 86 80Q81 96 96 107" fill="none"/></>;
 default:return <><path d="M8 184Q57 154 52 78L64 33L82 18L70 82Q78 112 107 82L144 40L127 94Q103 132 81 135L108 165L151 183L109 184L62 145L47 183Z"/><path d="M24 179Q69 146 64 89M73 121Q103 118 129 83M64 142L114 177" fill="none" className="world-prop-light"/><path d="M100 34L107 20L114 34L107 48ZM123 128L129 116L135 128L129 140Z" className="world-prop-light"/></>;
 }
}
/** Regional silhouettes flank the company; the playable surface stays clear. */
export default function StageWorldDetails({stage,diameter,cx,cy}:{stage:number,diameter:number,cx:number,cy:number}){
 if(!stage)return null;const height=diameter*(stage===10?.31:stage===6?.29:.24),width=height*.8;
 return <div className="stage-world-details" data-region-props={names[stage-1]} aria-hidden="true" style={{'--prop-ink':stagePalette(stage).accent} as CSSProperties}>{[-1,1].map((side,i)=><div className={`stage-world-prop prop-${stage}`} key={side} style={{left:cx+side*diameter*(stage===5?.59:.54)-width/2,top:cy-diameter*(i?.2:.28)-height,width,height,transform:`translateZ(-${diameter*.18}px) rotateX(-90deg) scaleX(${side})`}}><svg viewBox="0 0 160 210" fill="currentColor" stroke="#1a2024" strokeWidth="3" strokeLinejoin="round"><ellipse cx="80" cy="184" rx="70" ry="12" fill="#09101666" stroke="none"/><Prop stage={stage}/></svg></div>)}</div>;
}
