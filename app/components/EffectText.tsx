/** Shared emphasis for catalog copy; never changes the underlying item effect. */
export default function EffectText({text}:{text:string}){
 return <>{text.split(/((?:HP|회복량?|피해|포인트|주화)\s*[+−-]\s*\d+)/g).map((part,index)=>/^(?:HP|회복량?|피해|포인트|주화)\s*[+−-]/.test(part)?<strong key={index} className={/^(HP|회복)/.test(part)&&!/[−-]/.test(part)?'shop-effect-gain':'shop-effect-value'}>{part}</strong>:part)}</>;
}
