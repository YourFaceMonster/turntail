export const KOREAN_OPPONENTS=[
 {name:'청돌',title:'느긋한 청도깨비',portrait:0,src:'/monsters/blue-0513.webp',crop:{x:265,y:65,size:550}},
 {name:'불찬',title:'장난꾸러기 불도깨비',portrait:1,src:'/monsters/red-0513.webp',crop:{x:175,y:30,size:680}},
 {name:'돌해',title:'묵직한 해태 수호자',portrait:2,src:'/monsters/haetae-0513.webp',crop:{x:175,y:10,size:680}}
] as const;
/** Sample without replacement and avoid the previous table where possible. */
export function chooseKoreanOpponents(count:number,previous:readonly string[]=[],random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
 if(!Number.isInteger(count)||count<1||count>3)throw Error('Choose one to three opponents');
 const shuffle=(list:typeof KOREAN_OPPONENTS[number][])=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[a[i],a[j]]=[a[j],a[i]];}return a;};
 return [...shuffle(KOREAN_OPPONENTS.filter(p=>!previous.includes(p.name))),...shuffle(KOREAN_OPPONENTS.filter(p=>previous.includes(p.name)))].slice(0,count).map(p=>({...p,avatar:`korean-monster:${p.portrait}`}));
}
export function monsterCharacter(index:number){return KOREAN_OPPONENTS[Math.max(0,Math.min(2,Number.isInteger(index)?index:0))];}
/** Change identities only; callers retain every saved hand, score and table cell. */
export function restoreMonsterOpponents(players:readonly {name:string,avatar?:string}[]){
 const used=new Set<number>(),chosen=players.map(p=>{const n=p.avatar?.startsWith('korean-monster:')?Number(p.avatar.split(':')[1]):-1;if(n>=0&&n<3&&Number.isInteger(n)&&!used.has(n)){used.add(n);return n;}return -1;});
 return chosen.map(n=>{if(n<0){n=[0,1,2].find(i=>!used.has(i))??0;used.add(n);}return {...monsterCharacter(n),avatar:`korean-monster:${n}`};});
}
