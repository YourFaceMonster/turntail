import {FIRST_PROLOGUE,type PrologueCut} from './rpg-prologue.ts';
// Dialogue follows the 2026-11-02 handoff; original prologue assets are preserved.
export const RPG_CONNECTION_SCENES:Record<string,{before:readonly PrologueCut[];after:readonly PrologueCut[]}>={
 "1": {
  "before": [
   {
    "id": "ST1_PRE_1",
    "scene": "gate",
    "duration": 5000,
    "line": "마을로 향하는 관문 앞, 문지기가 길을 막아섰다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "18% 55%"
   },
   {
    "id": "ST1_PRE_2",
    "scene": "gate",
    "duration": 5000,
    "line": "이 관문을 지나려면, 먼저 나와 승부해야 한다.",
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
    "line": "네가 고른 패로 네 실력을 보여 봐.",
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
    "line": "준비됐다면, 시작하지.",
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
    "line": "좋아. 네 실력은 인정하겠다.",
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
    "line": "관문 너머가 마을이다. 길을 안내해 주지.",
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
    "line": "열린 관문 너머로 마을의 풍경이 드러났다.",
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
    "line": "마을 광장에 들어서자, 누군가 앞으로 나섰다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "50% 62%"
   },
   {
    "id": "ST2_PRE_2",
    "scene": "road",
    "duration": 5000,
    "line": "네가 로웬을 이겼다는 그 사람이야?",
    "speaker": "포코",
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
    "line": "그 소문이 사실인지, 직접 확인하고 싶어.",
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
    "line": "나와도 한 판 겨뤄 줘.",
    "speaker": "포코",
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
    "line": "소문이 괜히 난 건 아니었네.",
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
    "line": "다음 길은 북쪽 성채로 이어져. 그곳에 다음 관문이 있어.",
    "speaker": "포코",
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
    "line": "쌍둥이 수호자를 만나게 될 거야. 준비하고 가.",
    "speaker": "포코",
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
    "line": "북쪽 성채 깊숙한 곳, 쌍둥이가 기다리는 홀에 도착했다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_PRE_2",
    "scene": "stone",
    "duration": 6000,
    "line": "여기까지 어떤 패를 골라 왔지?",
    "speaker": "둘째",
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
    "line": "하나를 택한다는 건, 다른 하나를 놓는 일이기도 하지.",
    "speaker": "첫째",
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
    "line": "그 선택의 끝에서, 너는 무엇을 내어놓게 될까.",
    "speaker": "둘째",
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
    "line": "네 다음 선택을 보겠다.",
    "speaker": "첫째",
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
    "line": "이번 선택은 여기까지 너를 데려왔군.",
    "speaker": "첫째",
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
    "line": "하지만 길은 아직 끝나지 않았다.",
    "speaker": "둘째",
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
    "line": "달의 영역 너머, 구름에 둘러싸인 다음 길이 모습을 드러냈다.",
    "audio": "quiet",
    "art": {
     "landscape": "/prologue/moon-castle-map-v3.png",
     "portrait": "/prologue/moon-castle-map-v3.png"
    },
    "focus": "88% 30%"
   },
   {
    "id": "ST3_POST_4",
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
for(const [stage,sequence] of Object.entries(RPG_CONNECTION_SCENES)){
 for(const [phase,cuts] of Object.entries(sequence)){
  const art=stage==='1'?sceneFrame('gate-'+phase+'-r61','gate-'+phase+'-portrait-r61'):
   stage==='2'?sceneFrame('square-cast-wide-v2','square-cast-portrait-v2'):
   sceneFrame(phase==='before'?'connection-twins-v3':'twins-after-r61',phase==='before'?'twins-before-portrait-r61':'twins-after-portrait-r61');
  for(const cut of cuts){cut.art=art;cut.focus='50% 40%';cut.location=`STAGE ${stage} · ${['','마을 관문','마을 광장','북쪽 성채'][Number(stage)]}`;}
 }
}
RPG_CONNECTION_SCENES[3].after[3].art=sceneFrame('moon-castle-map-v3','moon-castle-map-portrait-v5');
RPG_CONNECTION_SCENES[3].after[3].focus='57% 18%';
RPG_CONNECTION_SCENES[2].before[0].line='낮의 광장에 들어서자, 두 도전자가 승부 자리로 불렀다.';
RPG_CONNECTION_SCENES[2].before[2].speaker='밀라';
RPG_CONNECTION_SCENES[2].before[3].line='우리 둘과 한 판 겨뤄 줘.';
RPG_CONNECTION_SCENES[2].after[0].speaker='밀라';
RPG_CONNECTION_SCENES[2].after[1].speaker='포코';
RPG_CONNECTION_SCENES[2].after[2].speaker='밀라';

/** Viewing only: no combat, save, settlement or reward callbacks are part of this reel. */
export const RPG_STORY_REEL:readonly PrologueCut[]=[...FIRST_PROLOGUE,...[1,2,3].flatMap(stage=>[...RPG_CONNECTION_SCENES[stage].before,...RPG_CONNECTION_SCENES[stage].after])];
