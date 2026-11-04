/** Display-only identities. Suit IDs and rule strength remain in lib/game. */
export const SUIT_MOTIF_KEYS=['iron-gate','secret-key','sacred-flame','crown'] as const;
export default function SuitMotif({s}:{s:number}){
 if(s===0)return <g data-suit-symbol="iron-gate" stroke="#eadfc7" strokeWidth="1.4" paintOrder="stroke fill" strokeLinejoin="round"><path fillRule="evenodd" d="M-32-32H32V32H-32ZM-23-23V23H-18V-23ZM-10-23V23H-5V-23ZM5-23V23H10V-23ZM18-23V23H23V-23Z"/><path d="M-9-7H9V10H-9Z"/><path d="M-4-7V-12A4 4 0 0 1 4-12V-7" fill="none" stroke="currentColor" strokeWidth="4"/></g>;
 if(s===1)return <g data-suit-symbol="secret-key"><path fillRule="evenodd" d="M-7-32A20 20 0 1 0-7 8A20 20 0 1 0-7-32ZM-7-22A10 10 0 1 1-7-2A10 10 0 1 1-7-22Z"/><path d="M-4 1H5V13H17V23H5V32H-5Z"/></g>;
 if(s===2)return <g data-suit-symbol="sacred-flame"><path d="M0-35C4-22 21-20 17-7C15 2 7 7 0 7C-14 7-23-5-17-17C-16-8-9-7-8-15C-8-23-1-25 0-35Z"/><path d="M-18 9H18L12 18H5V32H-5V18H-12Z"/></g>;
 return <g data-suit-symbol="crown"><path d="M-33-23L-16-9L0-33L16-9L33-23L26 22H-26ZM-26 26H26V34H-26Z"/><path d="M-18 11H18" fill="none" stroke="#fff2cd" strokeOpacity=".55" strokeWidth="2.5"/></g>;
}
