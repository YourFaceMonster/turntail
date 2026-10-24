const cloud=[
 'M-31 8Q-42-3-30-15Q-19-22-9-16Q-9-38 9-30Q24-30 25-15Q45-17 35 5Q31 13 15 11H-25Z',
 'M-33 9Q-47-5-30-11Q-30-28-12-19Q-2-39 12-23Q33-33 33-13Q47-5 34 10Z',
 'M-33 10Q-41-12-23-13Q-26-34-6-25Q10-37 23-21Q42-20 35 2L25 12Z',
 'M-35 9Q-45-5-28-9Q-17-10-14-23Q-5-42 11-26Q15-15 32-14Q47-6 35 8Q23 23 5 8Q-13 20-35 9Z',
 'M-33 9L-35-7Q-30-23-15-16L-10-28L10-28L17-17Q35-25 36-7L32 9Z',
 'M-35 10V-8L-23-18H-11L-6-31H11L18-18H29L37-7L34 10Z',
 'M-35 11Q-36-17-16-13Q-16-35 2-28Q21-34 23-14Q43-17 37 8L19 12L3 8L-14 13Z',
 'M-33 10Q-48-7-26-13Q-26-31-9-24Q3-41 17-24Q37-30 34-11Q49 0 32 12L4 9Z',
 'M-37 9L-34-9L-19-20L-8-18L0-33L18-25L23-13L37-7L39 9L17 13L0 9L-19 14Z',
 'M-38 8Q-48-9-27-12L-25-23L-11-16Q-3-40 12-28L22-19L31-27L31-12Q49-5 37 10L12 12L1 7L-18 13Z'
];
/** The outline pass only paints silhouettes; engraved details stay fine and legible. */
export default function RegionalSuit({stage,s,outline}:{stage:number,s:number,outline?:{color:string,width:number}}){
 const stroke=outline?.color||'currentColor',detail=!outline,k=stage-1;
 if(s===0)return <g data-regional-suit={`${stage}:${s}`}><path d={cloud[k]}/>{detail&&<><path d={`M-26 2Q-9-${9+stage} 0 0T28-1M-14 18Q0 ${11+stage} 15 18`} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round"/><circle cx={15-stage} cy="-15" r="2" fill="#fff4d2" opacity=".6"/></>}</g>;
 if(s===1){const points=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?11+k*.35:29+k*.35;return `${i?'L':'M'}${Math.cos(a)*r} ${Math.sin(a)*r}`;}).join('')+'Z';return <g data-regional-suit={`${stage}:${s}`}><path d={points}/>{detail&&<><path d={points} transform={`scale(${.59+k*.016})`} fill="none" stroke="#fff3cf" strokeWidth="2" opacity=".7"/><path d={`M${25-k} -27l3 -7l3 7l7 3l-7 3l-3 7l-3 -7l-7-3Z`}/><path d="M-23 28l-2 6m7-7l2 7" fill="none" stroke={stroke} strokeWidth="2"/></>}</g>;}
 if(s===2)return <g data-regional-suit={`${stage}:${s}`} transform="scale(.87)"><path d={stage===6||stage===9?`M12-32L-10-${25+k}L-30-7L-27 17L-5 32L18 24L30 10L8 17L-8 2L-5-17Z`:`M${12+k*.5}-32C-30-${39+k}-44 16-13 30Q12 ${44-k} 31 11C-4 ${29-k}-24-13 ${12+k*.5}-32Z`}/>{detail&&<><path d="M-26-18Q-39 19-7 34" fill="none" stroke={stroke} strokeWidth="1.6"/><path d={`M${18+k*.5} -10l3-7l3 7l7 3l-7 3l-3 7l-3 -7l-7-3Z`}/><circle cx="10" cy="37" r="2"/><circle cx="-1" cy="39" r="1.5"/></>}</g>;
 return <g data-regional-suit={`${stage}:${s}`}><circle r={17+stage%3}/>{Array.from({length:10+stage%5},(_,i)=><path key={i} transform={`rotate(${i*360/(10+stage%5)})`} d={stage%3===0?'M-3-25L-1-40L4-29L4-23Z':stage%3===1?'M-3-24Q-12-34 1-43Q-3-32 5-27Z':'M-3-25L0-39L4-25Z'}/>)}{detail&&<><circle r="13" fill="none" stroke="#fff2ce" strokeWidth="1.5" opacity=".7"/><circle r="22" fill="none" stroke={stroke} strokeWidth="1"/><path d="M-13 35Q0 45 14 35" fill="none" stroke={stroke} strokeWidth="1.5"/></>}</g>;
}
