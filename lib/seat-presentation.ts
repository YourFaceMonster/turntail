/** Match the four persona borders used by the character panels. */
export const SEAT_ACCENTS=['#ffa48b','#8de2ff','#f4cf73','#d0b0ff'] as const;
export function seatAccent(seat:number|null){return seat===null?'#a99c82':SEAT_ACCENTS[((seat%4)+4)%4];}
export function seatPanelTheme(seat:number){return [{light:'#ed393a',dark:'#a70819',border:'#ffa48b'},{light:'#5795ca',dark:'#28577f',border:'#8de2ff'},{light:'#d8a75c',dark:'#8c6032',border:'#f4cf73'},{light:'#a184cb',dark:'#624584',border:'#d0b0ff'}][seat%4];}
