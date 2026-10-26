export default function TurntaleWordmark({className,plain=false}:{className?:string,plain?:boolean}){
 return <svg className={className} viewBox={plain?'488 208 1211 459':'489 54 1210 613'} width="1210" height={plain?459:613} aria-hidden="true">{plain&&<defs><clipPath id="turntale-ingame-letters"><path d="M488 208H881V238H1169V232H1284V208H1699V667H488Z"/></clipPath></defs>}<image href="/turntale-wordmark-v035.png" x="0" y="0" width="2172" height="724" clipPath={plain?'url(#turntale-ingame-letters)':undefined}/></svg>;
}
