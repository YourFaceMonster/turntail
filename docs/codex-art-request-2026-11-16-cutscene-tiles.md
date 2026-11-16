# Codex 그림 요청 · 컷씬 패 다시 그리기 + 컷씬 보강 (2026-11-16)

사용자 지시: "1에서 4까지 전부하다 / 코덱스md서줘". 컷씬 속 게임 장면에 패는 있는데 숫자·문양이 없거나, 인게임 패와 다르게 생긴 그림이 있다. Claude가 컷씬 그림 67장을 점검했고 그 결과로 4가지를 요청한다.

| 묶음 | 내용 | 장수 (세로+가로) | 우선순위 |
|---|---|---|---|
| 1 | 패가 잘못 그려진 장면 다시 그리기 | 16장면 × 2 = 32 | 가장 먼저 |
| 2 | 스테이지별 패 섞기·나누기 장면 추가 (ST4~10) | 7 × 2 = 14 | 두 번째 |
| 3 | 스테이지별 승부 결과 장면 추가 (ST4~10) | 7 × 2 = 14 | 두 번째 |
| 4 | 인물 표정 장면 (대화 중 그 사람만 크게) | 34 × 2 = 68 | 마지막, 나눠서 |

한 번에 다 하지 않아도 된다. 묶음 하나가 끝날 때마다 넘겨 주면 Claude가 그 묶음부터 연결한다.

## 공통 스타일
- `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`를 읽고 그대로 적용한다(굵은 손그림 윤곽선, 단순한 명암의 2D 카툰 판타지).
- 크기: 세로 1024×1536, 가로 1672×941. PNG 원본 + 앱용 WebP(같은 이름). 기존 파일은 덮어쓰지 않고 **새 버전 이름**으로 저장한다.
- 아래 22%는 자막 자리라 어둡고 단순하게.
- 패에 들어가는 숫자 말고는 글자·워터마크 없음.
- 이야기 특별 패(왕관2·철문2·성화2·열쇠2, `story-cards/*-special-*`)는 이번 대상이 아니다. 특별 패가 나오는 장면에서는 그 패를 건드리지 않는다.

## 인게임 패 기준 (모든 묶음 공통)
참고 화면: `artifacts/cutscene-tile-audit-2026-11-16/ingame-st01.jpg` ~ `ingame-st10.jpg` (375×812 실제 대결 화면). 재질 그림 모음: `public/turntale-stage-materials-v2.webp`.

**앞면** (패를 보여 줄 때)
- 패 모양: 세로로 긴 둥근 사각형, 얇은 테두리, 납작한 그림자. 3D로 두껍게 만들지 않는다.
- 위쪽 가운데에 큰 숫자(1~15), 아래쪽 가운데에 작은 문양 하나.
- 문양과 숫자 색은 같은 짝으로 맞춘다.
  - 왕관: 빨강, 작은 왕관.
  - 열쇠: 초록, 고리가 위인 열쇠.
  - 성화: 주황, 불꽃.
  - 철문: 남색, 아치형 철문(창살).
- 패 바탕은 그 스테이지 재질이다(아래 표). ST1만 크림색에 가깝다.

**뒷면** (엎어 둔 패, 바닥 패 더미, 손에 쥔 패의 등)
- 그 스테이지 재질 바탕에 문양 하나를 새긴 모양이다. 크림색 빈 패로 그리지 않는다.

| 스테이지 | 재질 | 앞면 바탕 | 뒷면 |
|---|---|---|---|
| ST1 | 뼈 | 크림·연회색 | 회색 돌빛, 남색 아치 새김 |
| ST2 | 호두나무 | 밝은 나뭇결 | 갈색 나무, 호리병 새김 |
| ST3 | 옥 | 연한 옥빛 | 초록 옥, 잎 새김 |
| ST4 | 수정 | 얼음빛 하늘색 | 푸른 수정, 마름모 새김 |
| ST5 | 규화목 | 회갈색 나뭇결 | 나이테 나무, 둥근 새김 |
| ST6 | 현무암 | 거친 회색 돌 | 짙은 회색, 방패 새김 + 초록 테 |
| ST7 | 월장석 | 흰빛·하늘빛 얼룩 | 남색, 흰 나무 새김 |
| ST8 | 호박석 | 주황 호박 | 호박빛, 별 새김 |
| ST9 | 흑요석 | 연기 낀 검정 | 검정, 불꽃 새김 |
| ST10 | 세계수 목재 | 붉은 나뭇결 | 붉은 갈색, 나무 새김 |

숫자는 장면에 맞게 아무 수나 써도 되지만, 한 장면에 **같은 숫자·같은 문양 패가 두 장 나오지 않게** 한다.

---

## 묶음 1 · 패가 잘못 그려진 장면 다시 그리기
인물·옷·배경·구도·조명은 **그대로** 두고, 패만 위 기준으로 고친다. 원본 PNG를 참고 그림으로 넣는다. 세로 원본만 점검했으니 같은 장면의 가로 그림도 같이 보고 패가 같은 문제면 함께 고친다(문제가 없으면 가로는 건너뛰고 알려 준다).

### A. 패에 숫자·문양이 없음 (빈 패)
| 장면 | 원본 (세로 / 가로) | 새 이름 (세로 / 가로) | 문제 |
|---|---|---|---|
| ST4 승부 전 | `story/st4-before-portrait-v1` / `st4-before-wide-v1` | `st4-before-portrait-v2` / `st4-before-wide-v2` | 탁자 위 패 10장이 빈 패 |
| ST5 승부 전 | `story/st5-before-portrait-v1` / `-wide-v1` | `st5-before-portrait-v2` / `-wide-v2` | 빈 패 3장 |
| ST7 승부 전 | `story/st7-before-portrait-v1` / `-wide-v1` | `st7-before-portrait-v2` / `-wide-v2` | 빈 패 4장 |
| ST8 승부 전 | `story/st8-before-portrait-v1` / `-wide-v1` | `st8-before-portrait-v2` / `-wide-v2` | 빈 패 3장 |
| ST9 승부 전 | `story/st9-before-portrait-v1` / `-wide-v1` | `st9-before-portrait-v2` / `-wide-v2` | 빈 패 3장 + 손에 쥔 패 |

### B. 문양만 있고 숫자가 없음
| 장면 | 원본 | 새 이름 | 문제 |
|---|---|---|---|
| 프롤로그 주점 내기 | `prologue/wager-playing-portrait-v1` / `-wide-v1` | `wager-playing-portrait-v2` / `-wide-v2` | 문양만, 숫자 없음 |
| ST6 승부 전 | `story/st6-before-portrait-v2` / `-wide-v1` | `st6-before-portrait-v3` / `-wide-v2` | 문양만, 숫자 없음 |
| ST9 승부 후 | `story/st9-after-portrait-v3` / `-wide-v1` | `st9-after-portrait-v4` / `-wide-v2` | 문양만, 숫자 없음 |

### C. 뒷면이 인게임과 다름
| 장면 | 원본 | 새 이름 | 문제 |
|---|---|---|---|
| ST4~10 승부 직전 클로즈업 (7장면) | `story/st{N}-duel-portrait-v1` / `-wide-v1` | `st{N}-duel-portrait-v2` / `-wide-v2` | 엎어 내려놓는 패가 크림색 빈 패. 그 스테이지 뒷면 재질로 |
| ST10 승부 후 | `story/st10-after-portrait-v1` / `-wide-v1` | `st10-after-portrait-v2` / `-wide-v2` | 뒷면이 갈색 무늬. ST10 세계수 뒷면으로 |

### 문제없음 (손대지 않음)
`square-poko-portrait-night-symbols-v6`, `true-ending-village-portrait-special-v2`, `wager-rest/speaking-*-symbols-special-v3`, 특별 패 장면 전부.

### 프롬프트 (묶음 1 공통)
```
Repaint only the game tiles in the attached scene. Keep every character, pose, face, clothing, prop, background, lighting and composition exactly as in the reference. Face-up tiles: tall rounded rectangle, thin edge, flat shadow, the stage's material as the face colour; a large number at the top centre and one small suit emblem at the bottom centre, number and emblem in the suit colour (crown red, key green, flame orange, arched iron gate navy). Face-down tiles: the stage's material back with one carved emblem, as in the attached in-game screenshot. No duplicate number+suit pair in one scene. Bold hand-drawn outlines, simple cel shading, 2D cartoon fantasy. Bottom 22% dark and calm for subtitles.
```
참고 그림: 원본 장면 PNG + `ingame-st{N}.jpg` (프롤로그는 ST1).

---

## 묶음 2 · 패 섞기·나누기 장면 (ST4~10)
승부 전 대화 가운데 줄에 들어갈 그림이다. 지금은 대화 내내 같은 그림이라 단조롭다.

- 이름: `story/st{N}-shuffle-portrait-v1` / `st{N}-shuffle-wide-v1`
- 구도: 탁자 위를 내려다보는 중간 거리. 상대 한 명이 패를 섞거나 세 자리에 나눠 준다. 엎어진 패는 그 스테이지 뒷면, 가운데 바닥 패 더미도 뒷면.
- 인물·옷·탁자·조명은 같은 스테이지 승부 전 그림(묶음 1의 새 버전이 있으면 그것)과 같게.

| 스테이지 | 패를 다루는 사람 | 분위기 |
|---|---|---|
| ST4 물안개 폭포 | 수리 | 젖은 탁자, 물보라 속에서 느긋하게 섞음 |
| ST5 구름다리 쉼터 | 하온 | 바람에 패가 날리지 않게 손으로 누르며 나눔 |
| ST6 수호자의 회랑 | 카르덴 | 예법대로 한 장씩 똑바로 놓음, 세라가 지켜봄 |
| ST7 달빛 고목 | 루엔 | 장부 옆에서 패를 섞음, 시온이 들여다봄 |
| ST8 별빛 성소 | 아스텔 | 장난스럽게 패를 부채꼴로 펼침 |
| ST9 잿불 제단 | 재온 | 불씨가 떠도는 제단 위에서 담담하게 나눔 |
| ST10 붉은 세계수 | 두 번째 수호자 | 두 수호자가 마주 보고 패를 나눔, 붉은 잎 |

```
Mid-shot of the game table from the attached reference scene. The named character shuffles / deals tiles face down to three seats; the draw pile sits in the middle. All face-down tiles show this stage's material back with one carved emblem (see the in-game screenshot). Same characters, clothes, table, light and palette as the reference. Bold hand-drawn outlines, simple cel shading, 2D cartoon fantasy. Bottom 22% dark and calm for subtitles. No text.
```

---

## 묶음 3 · 승부 결과 장면 (ST4~10)
승부 후 대화 첫 줄에 들어갈 그림이다. 진 상대가 마지막 패를 내려놓거나 손을 펴는 순간.

- 이름: `story/st{N}-result-portrait-v1` / `st{N}-result-wide-v1`
- 탁자 위에 마지막으로 낸 패 1~3장이 **앞면**으로 보인다(숫자·문양 기준 그대로, 그 스테이지 재질). 상대의 손에는 남은 패가 없거나 한두 장.

| 스테이지 | 인물 | 표정 |
|---|---|---|
| ST4 | 수리 | 웃으며 패를 내려놓음, 약속을 지키는 얼굴 |
| ST5 | 하온 | 아쉽지만 인정하는 얼굴, 타래가 뒤에서 매듭을 잡음 |
| ST6 | 카르덴 | 무릎을 꿇지 않고 꼿꼿이 패를 내려놓음, 무거운 존중 |
| ST7 | 루엔 | 장부에 결과를 적으려는 손, 담담한 미소 |
| ST8 | 아스텔 | 깜짝 놀란 뒤 웃음, 별자리 두루마리를 꺼내려 함 |
| ST9 | 재온 | 불씨가 잦아든 제단, 마지막 패를 조용히 덮음 |
| ST10 | 첫 번째 수호자 | 두건 아래 놀람, 마지막 패가 탁자에 놓임 (진엔딩 장면과 겹치지 않게 기록·책은 넣지 않음) |

```
The moment the match ends at the attached reference table. The named opponent lays down their last tile; one to three face-up tiles on the table show a large number at the top and one suit emblem at the bottom in the suit colour, on this stage's material. Expression as described. Same characters, clothes, table, light and palette as the reference. Bold hand-drawn outlines, simple cel shading, 2D cartoon fantasy. Bottom 22% dark and calm for subtitles.
```

---

## 묶음 4 · 인물 표정 장면
대화할 때 그 사람만 크게 나오는 그림이다. 주점 대화(`story/inn-talk-moran-portrait-v1.png` 등 0.7.31)와 **같은 구도**: 상반신이 화면 위쪽 2/3을 채우고, 배경은 그 스테이지 장소를 흐리게, 아래 22%는 어둡게.

- 이름: `story/talk-{인물키}-{표정}-portrait-v1` / `-wide-v1`
- 표정 키: `calm`(기본), `smile`(웃음·여유), `serious`(진지·긴장). 상대 두 명과 보스는 3가지, 나머지는 2가지.
- 같은 인물은 세 표정에서 옷·머리·소품·조명이 같아야 한다. 참고: 그 인물이 나오는 승부 전·후 그림.

| 스테이지 | 인물 (키) | 표정 |
|---|---|---|
| ST4 | 네아 (`nea`) | calm, smile |
| ST4 | 수리 (`suri`) | calm, smile, serious |
| ST5 | 타래 (`tarae`) | calm, serious |
| ST5 | 하온 (`haon`) | calm, smile, serious |
| ST6 | 카르덴 (`karden`) | calm, serious, smile(드문 엷은 미소) |
| ST6 | 세라 (`sera`) | calm, serious |
| ST6 | 태엽 (`taeyeop`) | calm, serious(눈빛만 바뀌는 기계 인물) |
| ST7 | 루엔 (`ruen`) | calm, smile, serious |
| ST7 | 시온 (`sion`) | calm, smile |
| ST8 | 엘라 (`ella`) | calm, smile |
| ST8 | 아스텔 (`astel`) | calm, smile, serious |
| ST9 | 재온 (`jaeon`) | calm, serious, smile |
| ST9 | 오닉 (`onik`) | calm, serious |
| ST10 | 첫 번째 수호자 (`guardian-1`) | calm, serious, smile |
| ST10 | 두 번째 수호자 (`guardian-2`) | calm, serious |

합계 34표정 × 세로·가로 = 68장. 순서: 보스(카르덴·재온·수호자 둘) → 각 스테이지 상대 → 나머지.

```
Upper-body portrait of the named character alone, filling the top two thirds of the frame, the stage location softly blurred behind. Expression: <calm | smile | serious>. Same face, hair, clothes and props as the attached reference scene. Bold hand-drawn outlines, simple cel shading, 2D cartoon fantasy. Bottom 22% dark and plain for the dialogue box. No text.
```

---

## 넘기기 전 검수
- 패 앞면: 숫자 위·문양 아래, 같은 색 짝, 같은 패 두 장 없음.
- 패 뒷면: 그 스테이지 재질과 새김(`ingame-st{N}.jpg`와 나란히 놓고 비교).
- 묶음 1: 원본과 나란히 놓고 인물·배경이 바뀌지 않았는지.
- 크기(1024×1536 / 1672×941), 아래 22% 어두움, PNG + WebP.
- 저장: 프롤로그는 `public/prologue/`, 나머지는 `public/story/`. 기존 파일은 지우거나 덮어쓰지 않는다.

## Claude가 할 연결 (그림이 오면)
- 묶음 1: `lib/rpg-chapters.ts`의 `ART_VERSION`과 듀얼·프롤로그 그림 경로를 새 버전으로 올린다. 가로 그림은 지금 `-wide-v1` 고정이라 가로 버전 표도 추가한다.
- 묶음 2: `lib/rpg-chapter-scenes.ts` 각 스테이지 `before`의 가운데 줄에 `st{N}-shuffle`을 붙인다(대사 문구는 그대로).
- 묶음 3: 각 스테이지 `after` 첫 줄에 `st{N}-result`를 붙인다. ST6·ST9 특별 패 장면 순서는 바꾸지 않는다.
- 묶음 4: 화자별 표정 그림 표를 만들고, 대사마다 표정을 고르는 값(`mood`)을 붙인다. 주점 대화처럼 그 줄만 그 사람 그림으로 바뀐다.
- 미리 불러오기 포함, 테스트 추가, 375×812·844×390 화면 확인. 배포는 사용자 요청이 있을 때만.
