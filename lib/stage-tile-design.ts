export type StageTileDesign={name:string,x:number,y:number,size:number,font:string,suit:{x:number,y:number,scale:number},panel:string};
/** Each region has its own large silhouette and number layout, shared by every renderer. */
export const STAGE_TILE_DESIGNS:readonly StageTileDesign[]=[
 {name:'별빛 관문 · 아치',x:50,y:66,size:56,font:'Trebuchet MS,Arial,sans-serif',suit:{x:74,y:109,scale:.57},panel:'M17 86V40Q17 12 50 10Q83 12 83 40V86H71V35Q50 17 29 35V86Z'},
 {name:'등불 야영지 · 직조 마름모',x:49,y:64,size:53,font:'Arial,sans-serif',suit:{x:73,y:109,scale:.59},panel:'M49 6L92 48L49 92L7 48ZM49 16L82 48L49 82L17 48Z'},
 {name:'숲의 쉼터 · 잎맥',x:48,y:65,size:54,font:'Georgia,serif',suit:{x:74,y:108,scale:.56},panel:'M11 84Q6 22 81 7Q96 65 54 87Q31 98 11 84ZM18 77Q22 36 74 17Q82 61 50 78Q34 87 18 77Z'},
 {name:'폭포 테라스 · 물결 수정',x:52,y:62,size:51,font:'Trebuchet MS,Arial,sans-serif',suit:{x:26,y:108,scale:.62},panel:'M52 7L91 47L52 91L13 47ZM52 17L81 47L52 80L23 47Z'},
 {name:'구름다리 · 매듭 팔각',x:57,y:70,size:52,font:'Arial,sans-serif',suit:{x:25,y:105,scale:.59},panel:'M31 14H79L94 29V80L79 96H31L16 80V29ZM36 23L25 34V75L36 87H74L85 75V34L74 23Z'},
 {name:'수호자의 회랑 · 방패',x:50,y:64,size:54,font:'Georgia,serif',suit:{x:50,y:113,scale:.44},panel:'M12 14L50 6L88 14V60Q85 84 50 100Q15 84 12 60ZM21 23V59Q24 78 50 89Q76 78 79 59V23L50 16Z'},
 {name:'달빛 고목 · 열린 초승달',x:56,y:67,size:54,font:'Georgia,serif',suit:{x:24,y:109,scale:.57},panel:'M67 8Q8 3 7 51Q8 99 66 95Q24 84 24 51Q23 21 67 8Z'},
 {name:'별빛 성소 · 천구 성반',x:50,y:65,size:53,font:'Georgia,serif',suit:{x:75,y:110,scale:.53},panel:'M50 4L59 17L75 11L78 28L94 34L84 49L93 65L77 72L74 90L58 84L50 98L41 84L25 90L22 73L6 65L16 50L7 34L23 28L25 11L41 17Z'},
 {name:'잿불 제단 · 흑요석 절단면',x:47,y:67,size:53,font:'Arial,sans-serif',suit:{x:74,y:112,scale:.53},panel:'M17 14L75 7L93 40L80 91L34 101L7 68ZM24 23L69 17L83 43L72 83L37 91L17 65Z'},
 {name:'붉은 세계수 · 용의 환문',x:50,y:69,size:55,font:'Georgia,serif',suit:{x:50,y:113,scale:.48},panel:'M16 83Q1 53 16 25L12 9L31 15Q50 1 69 15L88 9L84 25Q99 53 84 83L71 96L66 85Q90 54 74 29Q50 10 26 29Q10 54 34 85L29 96Z'}
];
export function stageTileDesign(stage:number){return STAGE_TILE_DESIGNS[Math.max(0,Math.min(9,stage-1))];}
