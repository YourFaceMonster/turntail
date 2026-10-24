import type {FurnitureFace,WorldPoint} from './entrance-furniture';
/** Turned walnut supports, a central baluster and broad cross braces carry the round top. */
export function classicTableFaces(diameter:number,cx:number,cy:number,height:number,depth:number){
 const faces:FurnitureFace[]=[],D=diameter,H=height;
 type Ring={z:number,r:number,color?:string,metal?:boolean};
 const lathe=(rings:Ring[],part:string,segments=32,ox=cx,oy=cy)=>{
  for(let k=1;k<rings.length;k++)for(let i=0;i<segments;i++){
   const a=i/segments*Math.PI*2-Math.PI/2,b=(i+1)/segments*Math.PI*2-Math.PI/2,p=rings[k-1],q=rings[k],point=(angle:number,ring:Ring):WorldPoint=>({x:ox+Math.cos(angle)*ring.r,y:oy+Math.sin(angle)*ring.r,z:ring.z});
   const radial=p.z-q.z,dz=q.r-p.r,length=Math.hypot(radial,dz),angle=(a+b)/2;
   const light=.36+.5*Math.max(0,(radial*(Math.cos(angle)*-.5+Math.sin(angle)*.6)+dz*.65)/Math.max(1,length));
   faces.push({part,color:q.color||'#493021',light,material:q.metal?'brass':'wood',cull:true,points:[point(a,p),point(b,p),point(b,q),point(a,q)]});
  }
 };
 lathe([{z:-.5,r:D*.5},{z:-H*.025,r:D*.504,color:'#69452d'},{z:-depth*.38,r:D*.504},{z:-depth*.76,r:D*.493},{z:-depth*.86,r:D*.488,color:'#947a4d',metal:true},{z:-depth,r:D*.483}], 'classic-bullnose',48);
 lathe([{z:-depth,r:D*.452},{z:-depth-H*.018,r:D*.46},{z:-Math.max(depth+H*.07,H*.28),r:D*.445},{z:-Math.max(depth+H*.085,H*.295),r:D*.452,color:'#65442b'}], 'classic-carved-apron',48);
 lathe([{z:-depth,r:D*.205},{z:-H*.29,r:D*.185},{z:-H*.34,r:D*.118},{z:-H*.39,r:D*.092},{z:-H*.46,r:D*.125},{z:-H*.56,r:D*.114},{z:-H*.66,r:D*.081},{z:-H*.71,r:D*.104},{z:-H*.75,r:D*.108},{z:-H*.79,r:D*.122},{z:-H*.86,r:D*.128},{z:-H*.9,r:D*.112}], 'classic-turned-pedestal',24);
 let leg=0;
 for(const sx of [-1,1])for(const sy of [-1,1])lathe([{z:-depth,r:D*.052},{z:-H*.36,r:D*.052},{z:-H*.44,r:D*.067},{z:-H*.55,r:D*.061},{z:-H*.65,r:D*.041},{z:-H*.86,r:D*.038},{z:-H*.94,r:D*.052},{z:-H,r:D*.054,color:'#735538'}],`classic-turned-leg-${leg++}`,24,cx+sx*D*.29,cy+sy*D*.29);
 for(let foot=0;foot<4;foot++){
  const angle=Math.PI/4+foot*Math.PI/2,along={x:Math.cos(angle),y:Math.sin(angle)},across={x:-Math.sin(angle),y:Math.cos(angle)};
  const stations=[{r:.065,w:.075,z:.76,t:.1},{r:.18,w:.087,z:.86,t:.09},{r:.31,w:.09,z:.93,t:.06},{r:.41,w:.09,z:.954,t:.046}];
  const corner=(s:typeof stations[number],side:number,bottom=false):WorldPoint=>({x:cx+along.x*D*s.r+across.x*D*s.w/2*side,y:cy+along.y*D*s.r+across.y*D*s.w/2*side,z:-(s.z+(bottom?s.t:0))*H});
  for(let k=1;k<stations.length;k++){
   const a=stations[k-1],b=stations[k],part=`classic-splayed-foot-${foot}`;
   faces.push({part,color:'#543723',light:.82,points:[corner(a,-1),corner(b,-1),corner(b,1),corner(a,1)]});
   for(const side of [-1,1])faces.push({part,color:side===1?'#301e16':'#5c3a26',light:side===1?.55:.78,points:[corner(a,side),corner(b,side),corner(b,side,true),corner(a,side,true)]});
  }
  const toe=stations.at(-1)!;faces.push({part:`classic-brass-toe-${foot}`,color:'#8a7347',light:.76,material:'brass',points:[corner(toe,-1),corner(toe,1),corner(toe,1,true),corner(toe,-1,true)]});
 }
 return faces;
}
