# TURNTALE BGM 남은 작업 · Suno 프롬프트 (2026-11-13)

## 지금 연결된 음악 (0.7.24 기준)

| 장면 | 파일 | 비고 |
|---|---|---|
| 메인 메뉴 | `menu-suno-0632.mp3` | 주점·골목·여행자·파수탑·서브퀘스트·주사위판에서도 이 곡을 씀 |
| 일반 대결 | `table-suno-0631.mp3` | 오늘의 판 포함 |
| RPG 여정 지도 | `map-suno-0710.mp3` | ST1~10 모든 영역이 같은 곡 |
| RPG 대결 | `duel-suno-0710.mp3` | 보스(ST3·6·9)와 최종(ST10)도 같은 곡 |
| 결과 화면 | `SOUND_ASSETS.victory` | 예전 합성 음원 |
| 컷씬 | 없음 | 일부러 음악을 끄고 환경음만 남겨 둔 상태 |

**확인된 버그:** 0.7.24에서 새로 만든 주점(`inn`)이 음악 장면 목록에 빠져 있어요. 그래서 주점 안에서는 대결 곡이나 결과 곡이 나올 수 있어요. 새 곡을 연결할 때 함께 고칠게요.

## 공통 설정 (모든 곡)

- **Instrumental**을 켠다. 가사는 넣지 않는다.
- 길이는 2:00~3:00으로 한다. 반복 재생되므로 끝을 갑자기 끊지 말고, 첫 마디로 자연스럽게 돌아가게 만든다.
- **Exclude styles**(공통): `vocals, lyrics, choir words, EDM, dubstep, trap, modern pop, heavy distortion, synth lead`
- 톤 기준은 지금 쓰는 지도 곡과 대결 곡이다. 중세 판타지 포크와 손그림 카툰 분위기에 맞춘다.
- MP3로 보내 주면 Claude가 `public/audio/<장면>-suno-<번호>.mp3`로 넣고 연결한다.

---

## 1순위 · 새 장소와 보스

### ① 눈길의 주점 (ST1~3 거점)
지금은 메인 메뉴 곡을 같이 쓰고 있어서 주점만의 분위기가 없다.
```
cozy medieval fantasy tavern, warm acoustic lute, fiddle, soft frame drum, crackling hearth warmth, snowy night, relaxed folk, 90 bpm, seamless loop, instrumental
```

### ② 안개 나루 주점 (모란 · 배 주점)
호탕한 누나가 운영하는 시끌벅적한 나루터 주점이다.
```
lively riverside fantasy tavern on an old boat, accordion, tin whistle, upright bass, sea shanty swing, clinking mugs, cheerful and boisterous, 112 bpm, seamless loop, instrumental
```

### ③ 달빛 등불 주점 (모로 · 고목 아래 기록 주점)
조용한 기록광 막내가 운영하는, 등불 가득한 굴 주점이다.
```
quiet moonlit fantasy tavern inside ancient tree roots, celesta, harp, soft pizzicato strings, music box, gentle mystery, calm and cozy, 72 bpm, seamless loop, instrumental
```

### ④ 보스 대결 (ST3 쌍둥이 · ST6 카르덴 · ST9 재온)
일반 대결 곡보다 긴장감이 높아야 한다.
```
tense fantasy card duel boss theme, driving taiko and frame drums, low string ostinato, brass stabs, dark medieval folk, rising tension, 140 bpm, seamless loop, instrumental
```

---

## 2순위 · 여정의 정점

### ⑤ 최종 대결 (ST10 붉은 세계수 · 두 수호자)
```
epic final duel beneath a giant red world tree, wordless choir pads, full orchestra, war drums, solemn opening then intense climax, bittersweet heroic, 128 bpm, seamless loop, instrumental
```

### ⑥ 엔딩 (일반 엔딩: 왕관 2를 다음 방랑자에게 건넴)
반복하지 않는다. 한 번 흐르는 곡이다.
```
bittersweet fantasy ending theme, solo violin and acoustic guitar, warm strings swell, hopeful resolution, tavern by the fire, 76 bpm, 2 minutes, gentle fade out, instrumental
```

### ⑦ 진엔딩 (최초의 승부사 기록)
```
melancholic revelation theme, solo cello, music box melody, soft piano, distant wordless choir, memory and loss, slow build to warm major key, 66 bpm, gentle fade out, instrumental
```

### ⑧ 영역별 지도 (선택: 지금은 한 곡으로 모든 영역을 씀)
- 성화의 영역 (폭포·구름다리·회랑)
```
misty waterfall cliffs fantasy exploration, flowing harp arpeggios, warm low whistle, light hand percussion, sense of adventure, 96 bpm, seamless loop, instrumental
```
- 열쇠의 영역 (달빛 고목·별빛 성소·잿불 제단)
```
moonlit ancient forest fantasy exploration, celesta, soft strings, wooden flute, mysterious starry night, slow and wondrous, 84 bpm, seamless loop, instrumental
```

---

- 왕관의 영역 (구름 위 붉은 세계수 · ST10 직전 지도) — 2026-11-13 추가
```
sacred approach to a giant red world tree above the clouds, slow strings, soft horns, wind chimes, solemn awe and anticipation, 78 bpm, seamless loop, instrumental
```

### ⑬ 일반 대결 추가 3곡 (2026-11-14 추가 · 기존 `duel-suno-0710`과 돌려 씀)
보스가 아닌 스테이지(ST1·2·4·5·7·8)에서 스테이지마다 정해진 곡이 나온다. 같은 스테이지는 다시 해도 같은 곡이다.
- 대결 B · 성화의 영역 느낌 (ST4·5)
```
upbeat fantasy card duel, fast celtic fiddle and bodhran, plucked harp, playful rivalry, bright and energetic, 128 bpm, seamless loop, instrumental
```
- 대결 C · 열쇠의 영역 느낌 (ST7·8)
```
mysterious fantasy card duel, staccato strings, hammered dulcimer, low hand drums, sly and focused, minor key, 116 bpm, seamless loop, instrumental
```
- 대결 D · 눈길·초반 느낌 (ST2)
```
lively tavern card game duel, bouncy lute and accordion, frame drum, friendly competitive tension, medieval folk, 124 bpm, seamless loop, instrumental
```

## 3순위 · 분위기 보강

### ⑫ 결과 화면 (판·스테이지가 끝난 뒤 정산) — 2026-11-13 추가
지금은 예전 합성 음원을 쓰고 있다. 짧게 한 번 흐르는 곡이다.
```
warm victory jingle for a fantasy card game round result, lute and fiddle flourish, light hand drums, satisfied and cozy, 20 seconds, gentle ending, no loop, instrumental
```

### ⑨ 컷씬 배경 (지금은 무음 · 넣을지 결정 필요)
대사를 가리지 않도록 아주 작고 단순해야 한다.
```
gentle storytelling underscore, sparse solo cello and harp, soft piano notes, melancholic fantasy, very minimal, 64 bpm, ambient, seamless loop, instrumental
```

### ⑩ 미니게임 (주사위판 · 높을까 낮을까 · 기록 맞추기)
```
playful gambling jig, plucked mandolin, fiddle, spoons and tambourine, mischievous and light, 120 bpm, seamless loop, instrumental
```

### ⑪ 스테이지 클리어 짧은 팡파르 (5~8초)
```
short triumphant medieval fanfare, brass and timpani, bright folk flourish, 6 seconds, no loop, instrumental
```

---

## 연결 계획 (Claude)

- `app/page.tsx`의 `musicScene`에 장면을 추가한다: `tavern`, `inn-2`, `inn-3`, `boss`, `final`, `ending`, `minigame`, 지도 영역별 장면.
- 곡이 없는 장면은 지금처럼 기존 곡을 그대로 쓰므로, 곡을 하나씩 받는 대로 연결할 수 있다.
- 컷씬 음악(⑨)은 지금 일부러 꺼 둔 상태라서, 넣을지 사용자가 정한 뒤에 연결한다.
