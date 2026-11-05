import {FIRST_PROLOGUE,type PrologueCut} from './rpg-prologue.ts';
// Dialogue follows the 2026-11-02 handoff; original prologue assets are preserved.
export const RPG_CONNECTION_SCENES:Record<string,{before:readonly PrologueCut[];after:readonly PrologueCut[]}>={
 "1": {
  "before": [
   {
    "id": "ST1_PRE_1",
    "scene": "gate",
    "duration": 5000,
    "line": "멈춰라. 낯선 얼굴이군.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%",
    "speaker": "로웬"
   },
   {
    "id": "ST1_PRE_2",
    "scene": "gate",
    "duration": 5000,
    "line": "이 관문을 지나려면 나와 승부해야 한다.",
    "speaker": "로웬",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   },
   {
    "id": "ST1_PRE_3",
    "scene": "gate",
    "duration": 5000,
    "line": "여기선 이름도, 신분도 소용없어. 패로 증명해라.",
    "speaker": "로웬",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   },
   {
    "id": "ST1_PRE_4",
    "scene": "gate",
    "duration": 5000,
    "line": "준비됐다면 시작하지.",
    "speaker": "로웬",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   }
  ],
  "after": [
   {
    "id": "ST1_POST_1",
    "scene": "gate",
    "duration": 5000,
    "line": "흠. 말보다 패가 확실하군.",
    "speaker": "로웬",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   },
   {
    "id": "ST1_POST_2",
    "scene": "gate",
    "duration": 5000,
    "line": "좋아. 통과를 허락하지. 마을까지 안내해 주겠다.",
    "speaker": "로웬",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   },
   {
    "id": "ST1_POST_3",
    "scene": "gate",
    "duration": 5000,
    "line": "굳게 닫혔던 관문이 천천히 열렸다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   }
  ]
 },
 "2": {
  "before": [
   {
    "id": "ST2_PRE_1",
    "scene": "road",
    "duration": 5000,
    "line": "야, 밀라! 저 사람 아니야? 로웬을 이겼다는 사람!",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%",
    "speaker": "포코"
   },
   {
    "id": "ST2_PRE_2",
    "scene": "road",
    "duration": 5000,
    "line": "목소리 좀 낮춰. 아직 실력을 본 것도 아니잖아.",
    "speaker": "밀라",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_PRE_3",
    "scene": "road",
    "duration": 5000,
    "line": "그러니까 직접 확인해 보자는 거지!",
    "speaker": "포코",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_PRE_4",
    "scene": "road",
    "duration": 5000,
    "line": "좋아. 소문이 진짜인지 보여 줘.",
    "speaker": "밀라",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   }
  ],
  "after": [
   {
    "id": "ST2_POST_1",
    "scene": "road",
    "duration": 5000,
    "line": "와, 진짜였네! 로웬 아저씨가 질 만했어!",
    "speaker": "포코",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_POST_2",
    "scene": "road",
    "duration": 5000,
    "line": "운이 좋았던 것만은 아니네. 인정할게.",
    "speaker": "밀라",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_POST_3",
    "scene": "road",
    "duration": 5000,
    "line": "다음은 북쪽 성채야. 거기 쌍둥이가 좀 이상하긴 한데…",
    "speaker": "포코",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_POST_4",
    "scene": "road",
    "duration": 5000,
    "line": "포코. 쓸데없는 소리 하지 마. 직접 만나 보면 알겠지.",
    "speaker": "밀라",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   }
  ]
 },
 "3": {
  "before": [
   {
    "id": "ST3_PRE_1",
    "scene": "stone",
    "duration": 6000,
    "line": "형, 또 왔어. 이번엔 꽤 멀리 온 사람인데?",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%",
    "speaker": "둘째"
   },
   {
    "id": "ST3_PRE_2",
    "scene": "stone",
    "duration": 6000,
    "line": "보인다. 그런데… 그 패는 어디서 났지?",
    "speaker": "첫째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_PRE_3",
    "scene": "stone",
    "duration": 6000,
    "line": "왜? 설마 기억 안 나?",
    "speaker": "둘째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_PRE_4",
    "scene": "stone",
    "duration": 6000,
    "line": "……쓸데없는 소리 마라.",
    "speaker": "첫째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_PRE_5",
    "scene": "stone",
    "duration": 6000,
    "line": "하하! 좋아. 어디 한번 보여 줘. 네가 어디까지 갈 수 있는지.",
    "speaker": "둘째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   }
  ],
  "after": [
   {
    "id": "ST3_POST_1",
    "scene": "stone",
    "duration": 6250,
    "line": "하하! 형, 봤어? 이번엔 진짜라니까!",
    "speaker": "둘째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_POST_2",
    "scene": "stone",
    "duration": 6250,
    "line": "…아직은 모른다.",
    "speaker": "첫째",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_POST_3",
    "scene": "stone",
    "duration": 6250,
    "line": "늘 그렇게 말하더라. 이번에도.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%",
    "speaker": "둘째"
   },
   {
    "id": "ST3_POST_4",
    "scene": "stone",
    "duration": 6250,
    "line": "길은 열어 주겠다. 하지만 명심해라.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%",
    "speaker": "첫째"
   },
   {
    "id": "ST3_POST_5",
    "scene": "stone",
    "duration": 6250,
    "line": "모든 승부가 이기는 것으로 끝나지는 않는다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%",
    "speaker": "첫째"
   },
   {
    "id": "ST3_POST_6",
    "scene": "stone",
    "duration": 6250,
    "line": "철문의 영역 너머, 구름에 둘러싸인 다음 길이 모습을 드러냈다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_POST_7",
    "scene": "stone",
    "duration": 6250,
    "line": "새로운 영역을 향해, 다시 한 걸음을 내디뎠다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   }
  ]
 }
};

// Reviewed distinct before/after paintings and dedicated portrait art.
const sceneFrame=(wide:string,tall:string)=>({landscape:'/prologue/'+wide+'.png',portrait:'/prologue/'+tall+'.png'});
const ironFrame=(wide:string,tall:string)=>sceneFrame(wide+'-iron-v1',tall+'-iron-v1');
for(const [stage,sequence] of Object.entries(RPG_CONNECTION_SCENES)){
 for(const [phase,cuts] of Object.entries(sequence)){
  const art=stage==='1'?ironFrame('gate-'+phase+'-r61','gate-'+phase+'-portrait-r61'):
   stage==='2'?ironFrame('square-poko-wide-night-v4','square-poko-portrait-night-v4'):
   ironFrame(phase==='before'?'connection-twins-v3':'twins-after-r61',phase==='before'?'twins-before-portrait-r61':'twins-after-portrait-r61');
  for(const cut of cuts){cut.art=art;cut.focus='50% 40%';cut.location=`STAGE ${stage} · ${['','마을 관문','마을 광장','북쪽 성채'][Number(stage)]}`;}
 }
}
RPG_CONNECTION_SCENES[3].after.at(-1)!.art=sceneFrame('iron-gate-village-map-wide-v3','iron-gate-village-map-portrait-v3');
RPG_CONNECTION_SCENES[3].after.at(-1)!.focus='57% 18%';

// Pose changes retain the same mounted camera and background group.
RPG_CONNECTION_SCENES[1].before[2].poseArt=ironFrame('gate-reply-wide-v1','gate-reply-portrait-v1');
RPG_CONNECTION_SCENES[1].after[1].poseArt=ironFrame('gate-after-reply-wide-v1','gate-after-reply-portrait-v1');
for(const phase of ['before','after'] as const){
 for(const cut of RPG_CONNECTION_SCENES[2][phase]){
  if(cut.speaker==='밀라')cut.poseArt=ironFrame('square-mila-wide-night-v4','square-mila-portrait-night-v4');
 }
}
RPG_CONNECTION_SCENES[3].before[2].poseArt=ironFrame('twins-reply-wide-v1','twins-reply-portrait-v1');
RPG_CONNECTION_SCENES[3].after[1].poseArt=ironFrame('twins-after-reply-wide-v1','twins-after-reply-portrait-v1');

/** Viewing only: no combat, save, settlement or reward callbacks are part of this reel. */
export const RPG_STORY_REEL:readonly PrologueCut[]=[...FIRST_PROLOGUE,...[1,2,3].flatMap(stage=>[...RPG_CONNECTION_SCENES[stage].before,...RPG_CONNECTION_SCENES[stage].after])];
