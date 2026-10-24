/** Match the four persona borders used by the character panels. */
export const SEAT_ACCENTS=['#ffa48b','#8de2ff','#f4cf73','#d0b0ff'] as const;
export function seatAccent(seat:number|null){return seat===null?'#a99c82':SEAT_ACCENTS[((seat%4)+4)%4];}
