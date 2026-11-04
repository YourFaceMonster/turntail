/** Display-only identities. Suit IDs and rule strength remain in lib/game. */
export const SUIT_MOTIF_KEYS=['iron-gate','secret-key','sacred-flame','crown'] as const;
export default function SuitMotif({s}:{s:number}){
 if(s===0)return <g data-suit-symbol="iron-gate" stroke="#eadfc7" strokeWidth="1.5" paintOrder="stroke fill" strokeLinejoin="round"><path fillRule="evenodd" d="M-32 32V-10Q0-48 32-10V32ZM-25 25H25V-7Q0-36-25-7Z"/><path d="M-23 23V-5Q-15-16-3-20V23ZM3 23V-20Q15-16 23-5V23Z"/><path d="M-15-5V16M15-5V16" fill="none" strokeWidth="2.5"/><path d="M-9 0H9V17H-9Z"/><path d="M-5 0V-5A5 5 0 0 1 5-5V0" fill="none" strokeWidth="3"/><path d="M0 5A2 2 0 1 0 0 9A2 2 0 1 0 0 5ZM-2 9H2L3 13H-3Z" fill="#eadfc7" stroke="none"/></g>;
 if(s===1)return <g data-suit-symbol="secret-key"><path fillRule="evenodd" d="M-14-36H10Q20-36 20-26V-9Q20 1 10 1H-14Q-24 1-24-9V-26Q-24-36-14-36ZM-13-27Q-15-27-15-24V-11Q-15-8-12-8H8Q11-8 11-11V-24Q11-27 8-27Z"/><path d="M-7-3H3V13H15V21H3V26H11V33H3V38H-7Z"/></g>;
 if(s===2)return <g data-suit-symbol="sacred-flame"><path d="M0-35C4-22 21-20 17-7C15 2 7 7 0 7C-14 7-23-5-17-17C-16-8-9-7-8-15C-8-23-1-25 0-35Z"/><path d="M-18 9H18L12 18H5V32H-5V18H-12Z"/></g>;
 return <g data-suit-symbol="crown"><path d="M-33-23L-16-9L0-33L16-9L33-23L26 22H-26ZM-26 26H26V34H-26Z"/><path d="M-18 11H18" fill="none" stroke="#fff2cd" strokeOpacity=".55" strokeWidth="2.5"/></g>;
}
