type Spot=[number,number,number,number];
function flow(spots:Spot[]){return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="g"><stop stop-color="#80df80"/><stop offset=".5" stop-color="#80aa80"/><stop offset="1" stop-color="#808080"/></radialGradient></defs><rect width="100" height="100" fill="#808080"/>${spots.map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#g)"/>`).join('')}</svg>`);}
/** Continuous local deformation of the original painting: no cutout patches or duplicated faces. */
export default function SceneMotion({kind='tavern',speaker='',scene=''}:{kind?:'tavern'|'story',speaker?:string,scene?:string}){
 let wide:Spot[]=[[47,32,10,17],[28,43,12,18],[81,46,13,22]],tall:Spot[]=[[51,28,15,10],[20,38,22,13],[84,45,19,18]];
 if(kind==='story'){
  const right=/밀라|둘째|루미/.test(speaker);
  if(scene.startsWith('ST2')){wide=right?[[53,53,7,9],[46,72,9,7]]:[[26,54,8,10],[32,74,8,6]];tall=right?[[54,59,9,6],[68,67,10,7]]:[[25,57,12,7],[17,64,12,8]];}
  else if(scene.startsWith('ST1')){wide=[[55,48,9,10],[44,66,12,10]];tall=[[58,54,9,6],[43,61,12,8]];}
  else if(scene.startsWith('ST3')){wide=[[right?69:30,49,10,14],[right?68:33,71,12,10]];tall=[[right?70:30,48,14,10],[right?68:33,69,15,10]];}
  else{wide=[[58,33,8,10],[44,63,11,9]];tall=[[59,28,12,7],[44,50,15,10]];}
 }
 return <svg className="scene-motion-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>{[['wide',wide],['portrait',tall]].map(([view,spots])=><filter key={String(view)} id={`${kind}-motion-${view}`} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB"><feImage href={flow(spots as Spot[])} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="flow"/><feDisplacementMap in="SourceGraphic" in2="flow" xChannelSelector="R" yChannelSelector="G" scale="0"><animate attributeName="scale" values={kind==='story'?'0;4;1;3;0':'0;2.4;0;-.8;0'} dur={kind==='story'?'2.1s':'7.2s'} repeatCount="indefinite"/></feDisplacementMap></filter>)}</defs></svg>;
}
