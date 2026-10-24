export const KOREAN_OPPONENTS=[
 {name:'김복례',title:'장터의 큰손',portrait:0},
 {name:'박만수',title:'느긋한 뱃사공',portrait:1},
 {name:'서도윤',title:'바둑 두는 선비',portrait:2},
 {name:'윤하늬',title:'산골 약초꾼',portrait:3},
 {name:'강태오',title:'씨름판 장사',portrait:4},
 {name:'정다솜',title:'마을 도공',portrait:5},
 {name:'이문수',title:'서당 훈장',portrait:6},
 {name:'홍소리',title:'풍류 악사',portrait:7}
] as const;
/** Sample without replacement and avoid the previous table where possible. */
export function chooseKoreanOpponents(count:number,previous:readonly string[]=[],random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
 if(!Number.isInteger(count)||count<1||count>3)throw Error('Choose one to three opponents');
 const fresh=KOREAN_OPPONENTS.filter(p=>!previous.includes(p.name)),pool=[...(fresh.length>=count?fresh:KOREAN_OPPONENTS)];
 for(let i=pool.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,count).map(p=>({...p,avatar:`korean-portrait:${p.portrait}`}));
}
