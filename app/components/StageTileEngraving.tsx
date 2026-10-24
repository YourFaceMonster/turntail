import {stageTileDesign} from '../../lib/stage-tile-design';
function RegionLines({stage}:{stage:number}){
 switch(stage){
 case 1:return <><path d="M12 87H36M64 87H89M32 26V14M68 26V14M44 12L50 5L56 12L50 21Z"/><path d="M21 44H28M72 44H79M21 64H28M72 64H79"/></>;
 case 2:return <><path d="M8 30L28 10M6 64L30 89M68 9L91 32M70 88L92 65M17 25L27 35M17 72L28 61M69 25L80 35M69 72L80 61"/><path d="M33 99L44 110L56 99M33 111L44 122L56 111"/></>;
 case 3:return <><path d="M12 96L29 76M16 62L26 65M24 39L33 45M48 18L48 28M65 13L64 24M59 81L54 72M77 62L68 58M83 41L72 42"/><path d="M16 108Q32 100 44 109Q37 119 21 119Q29 109 41 109"/></>;
 case 4:return <><path d="M52 7V19M13 47H24M80 47H91M52 81V91M69 31L76 23M30 69L23 77"/><path d="M59 97Q68 90 75 97T92 97M53 105Q64 98 73 105T92 105M58 114Q68 107 78 114"/></>;
 case 5:return <><path d="M13 30L25 18L35 29M79 11L91 23L80 34M96 77L84 91L74 79M32 101L20 89L32 78"/><path d="M37 19H74M90 38V73M73 91H38M21 73V38" strokeDasharray="3 4"/></>;
 case 6:return <><path d="M15 17L25 27M85 17L75 27M50 7V18M26 72L18 80M74 72L82 80M35 91L32 99M65 91L68 99"/><path d="M33 107L23 111L31 121M67 107L77 111L69 121"/></>;
 case 7:return <><path d="M72 15Q93 28 91 51Q94 71 78 88M79 23Q86 33 85 42M85 63Q85 75 77 81"/><path d="M80 8L82 15L89 17L82 19L80 26L78 19L71 17ZM43 104L48 99L53 104L48 109ZM70 119L74 113L78 119L74 125Z"/></>;
 case 8:return <><circle cx="50" cy="51" r="32"/><circle cx="50" cy="51" r="37" strokeWidth=".65"/><path d="M50 4V17M94 34L81 39M93 65L80 62M50 98V85M6 65L19 61M7 34L19 39M19 110H49M25 116H44"/></>;
 case 9:return <><path d="M17 14L29 30L7 68M75 7L66 27L93 40M80 91L66 74L34 101M29 30L66 27M66 74L83 44M17 65L34 82"/><path d="M15 111L22 102L34 107L31 120L19 124ZM43 111L48 105L54 113L49 121Z"/></>;
 default:return <><path d="M19 30L9 24L13 14L26 21M81 30L91 24L87 14L74 21M21 45L9 39M79 45L91 39M24 66L13 74M76 66L87 74M34 89L40 99M66 89L60 99"/><path d="M36 20Q50 7 64 20M33 29L40 23M67 29L60 23M15 107L24 102L33 107L24 112ZM67 107L76 102L85 107L76 112Z"/></>;
 }
}
const TWO_CRESTS=[
 'M9 118V48Q8 18 52 9Q92 22 91 47V118L74 126H25Z',
 'M8 48L53 7L93 48V112L52 128L8 111ZM17 55L52 22L84 55',
 'M9 119Q3 67 24 37Q49 13 87 8Q102 70 78 109L54 128Z',
 'M9 115L17 55L56 7L93 50L87 117L53 129ZM25 54L56 22L83 53',
 'M8 48L21 18L77 8L93 38V111L77 127H23L8 111ZM17 53L28 28H77L85 51',
 'M9 46L54 9L92 24V84Q87 112 52 129Q17 112 9 88Z',
 'M16 47Q30 6 78 10Q49 24 40 43M86 23Q105 79 64 121L48 129L22 117Q3 90 8 61',
 'M9 46L52 7L91 44L86 119L52 129L15 120ZM22 48L53 22L80 49',
 'M8 54L28 14L76 7L94 45L84 116L46 129L12 110ZM22 57L35 28L74 19L84 49',
 'M9 48L14 18L33 25L53 7L73 25L90 18L94 49L86 116L70 127L53 120L35 128L17 117Z'
];
/** Ordinary faces and the ceremonial number-two faces share their regional material only. */
export default function StageTileEngraving({stage,s,special=false}:{stage:number,s:number,special?:boolean}){
 const design=stageTileDesign(stage,special),dark=[2,6,9,10].includes(stage),inlay=['#c7d5eb','#86d8ab','#f7bd70','#ff91a0'][s];
 if(special)return <g data-region-engraving={`${stage}:${s}`} data-special-two={stage} data-number-geometry={design.name} style={dark?{color:inlay}:undefined} stroke="currentColor" strokeLinejoin="round">
  <path d={TWO_CRESTS[stage-1]} fill="currentColor" fillOpacity=".12" strokeWidth="1.8"/>
  <path d="M14 113Q52 137 88 113M63 20L68 29L78 27L75 16M68 29L88 32M19 121L25 113M79 121L74 113" fill="none" strokeWidth="1.35"/>
  <circle cx="26" cy="27" r="19" fill="#fff4d8" fillOpacity={dark?.27:.48} strokeWidth="1.4"/><circle cx="26" cy="27" r="16.5" fill="none" strokeWidth=".65"/>
  <path d="M51 46L56 40L61 46M19 70L13 77L19 84M83 70L89 77L83 84M45 123L51 117L57 123" fill="none" strokeWidth="1.4"/>
 </g>;
 return <g data-region-engraving={`${stage}:${s}`} data-number-geometry={design.name} style={dark?{color:inlay}:undefined} stroke="currentColor" strokeLinejoin="round">
  <path d={design.panel} fill="currentColor" fillRule="evenodd" fillOpacity={stage===7?.64:.26} strokeWidth="1.25"/>
  <g fill="none" strokeWidth="1.4" opacity=".9"><RegionLines stage={stage}/></g>
  <g fill="currentColor" stroke="none" opacity=".68">{Array.from({length:s+1},(_,i)=><circle key={i} cx={10+i*4} cy="128" r=".8"/>)}</g>
 </g>;
}
