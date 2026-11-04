/** Shared catalog emphasis; display only, never alters item mechanics. */
export default function EffectText({text}:{text:string}){
 const token=/(HP\s*[+−-]\s*\d+|HP\s*\d+\s*회복|피해\s*\d+\s*(?:방어|감소)|\d+\s*(?:회복|방어)|(?:회복량?|방어|피해|포인트|주화)\s*[+−-]?\s*\d+)/g;
 return <>{text.split(token).map((part,index)=>{if(!part||!new RegExp('^'+token.source+'$').test(part))return part;const benefit=/회복|방어|감소/.test(part)||/^HP/.test(part)&&!/[−-]/.test(part),harm=!benefit&&(/피해/.test(part)||/^HP/.test(part)&&/[−-]/.test(part));return <strong key={index} className={benefit?'shop-effect-gain':harm?'shop-effect-harm':'shop-effect-value'}>{part}</strong>;})}</>;
}
