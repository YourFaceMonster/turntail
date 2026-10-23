export const STAGE_PALETTES=[
 {base:'#152b45',light:'#304e6b',accent:'#e3c689',floor:'#203049'},
 {base:'#3f2418',light:'#72462b',accent:'#f0ad5f',floor:'#382318'},
 {base:'#123b31',light:'#37684d',accent:'#a1d3b0',floor:'#17372c'},
 {base:'#12354b',light:'#34758b',accent:'#bcecff',floor:'#14394b'},
 {base:'#34372a',light:'#66654a',accent:'#d1b98b',floor:'#37372d'},
 {base:'#292239',light:'#4e3d63',accent:'#c4a8e5',floor:'#20212a'},
 {base:'#152941',light:'#376184',accent:'#c5eaff',floor:'#243e55'},
 {base:'#472e16',light:'#87612d',accent:'#ffe09b',floor:'#503619'},
 {base:'#301d2a',light:'#5f343e',accent:'#ffb29b',floor:'#231b26'},
 {base:'#3c1521',light:'#722933',accent:'#ffd18c',floor:'#33151d'}
] as const;
export function stagePalette(stage:number){return STAGE_PALETTES[Math.max(0,Math.min(9,stage-1))];}
