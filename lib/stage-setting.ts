export type StageSetting={kind:'table'|'stone'|'rock'|'stump'|'altar',name:string,height:number,depth:number,edges:number,color:string,wood:boolean};
const SETTINGS:StageSetting[]=[
 {kind:'table',name:'달빛 서재의 원탁',height:240,depth:25,edges:40,color:'#68442e',wood:true},
 {kind:'stone',name:'관문의 석조 승부대',height:145,depth:145,edges:12,color:'#ada591',wood:false},
 {kind:'table',name:'야영지 통나무 판',height:205,depth:38,edges:28,color:'#735039',wood:true},
 {kind:'rock',name:'이끼 바위 평상',height:92,depth:92,edges:13,color:'#526a5e',wood:false},
 {kind:'rock',name:'폭포의 젖은 너럭바위',height:76,depth:76,edges:14,color:'#45616d',wood:false},
 {kind:'stump',name:'규화목 받침',height:155,depth:155,edges:18,color:'#8c8170',wood:true},
 {kind:'altar',name:'현무암 제단',height:185,depth:185,edges:8,color:'#34353e',wood:false},
 {kind:'stump',name:'고목의 뿌리 받침',height:185,depth:185,edges:22,color:'#74838b',wood:true},
 {kind:'altar',name:'성소의 석제 단상',height:150,depth:150,edges:12,color:'#a59e84',wood:false},
 {kind:'altar',name:'흑요석 제단',height:112,depth:112,edges:10,color:'#292e39',wood:false},
 {kind:'stump',name:'세계수 그루터기',height:245,depth:245,edges:24,color:'#422a2c',wood:true}
];
export function stageSetting(stage=0){return SETTINGS[Math.max(0,Math.min(10,stage))];}
/** Every side joins the exact same edge used by the top silhouette. */
export function platformGeometry(diameter:number,stage=0){
 const setting=stageSetting(stage),n=setting.edges,r=diameter/2;
 const vertices=Array.from({length:n},(_,i)=>{const a=(i/n*2-.5)*Math.PI,organic=setting.kind==='rock'||setting.kind==='stump';const radius=r*(organic?.955+.025*Math.sin(i*2.73+stage):1);return {x:Math.cos(a)*radius,y:Math.sin(a)*radius};});
 const sides=vertices.map((a,i)=>{const b=vertices[(i+1)%n],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);return {...a,width:len,angle:Math.atan2(dy,dx)*180/Math.PI,light:.63+.3*Math.max(0,(-dy*.6+dx*.8)/len)};});
 const clip=stage?`polygon(${vertices.map(p=>`${(p.x/r+1)*50}% ${(p.y/r+1)*50}%`).join(',')})`:'none';
 return {setting,vertices,sides,clip};
}
