export function TwinPortrait({index}:{index:0|1}){
 return <span className="stage-portrait portrait twin-portrait" data-twin={index} role="img" aria-label={index===0?'첫째 쌍둥이 초상화':'둘째 쌍둥이 초상화'}/>;
}
