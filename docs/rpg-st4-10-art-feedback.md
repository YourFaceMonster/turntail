# RPG ST4~10 그림 검수 피드백 (2026-11-11)

검수: Claude · 대상: `D:\CHATGPT_CODEX\17_Turntail\artifacts\` (저장소 밖 상위 폴더)의 PNG 40장, 미리보기 `st4-10-art-preview-1~3.jpg`, 묶음 `turntale-st4-10-art.zip`
기준 문서: [rpg-st4-10-art-prompts.md](rpg-st4-10-art-prompts.md)(프롬프트·파일 이름·반영 방법), [rpg-st4-10-art-requests.md](rpg-st4-10-art-requests.md)(장면 목록)

> 작업 원칙(AGENTS.md): PC 로컬 `site-publish-checkout/`에서 작업, 시작 시 `git pull --ff-only origin main`. 빌드·배포 요청이 없으면 **로컬 저장까지만** 한다. 원본 PNG는 지우지 않는다.

## 1. 결과 요약

- 프롬프트표의 36장이 모두 있다. v2가 있는 장면: `st6-after`, `quest-9`, `st6-flame-two`, `st9-key-two` (총 40장).
- 톤·밝기·윤곽선은 프롤로그 승인본과 잘 맞는다. 그림 안 글자 없음(패의 숫자 2·문양은 의도대로).
- 내용이 대사와 맞는 장면: ST7 승부 후(두 번째 줄 이름 없이 왕관 표식), 두 왕 엔딩(위 철문의 형·아래 불꽃의 아우), 진엔딩 기록(왕관·철문·성화·열쇠 패 4장), 패 건네기 엔딩(프롤로그 주점과 같은 구도·같은 초승달 2 패), 이야기 패 앞·뒷면 4장(철문 2와 같은 테두리), 상아 주사위 아이콘(투명 배경, 1254×1254 RGBA).

## 2. 다시 뽑아야 할 그림

### A. 프롤로그 배경 요소가 그대로 복사됨 (원본 크기로 확인)

참고 그림 `snow-inn-v3.png`의 **고리 구멍 난 돌기둥(원+십자 문양)**과 **눈 덮인 주점 건물**이 다른 지역 장면에 그대로 들어갔다. 플레이어가 아직 노르문 마을에 있는 것처럼 보인다.

| 파일 | 들어간 요소 |
|---|---|
| `st4-before-portrait-v1.png` | 폭포 위 절벽에 돌기둥 + 주점 |
| `st4-after-portrait-v1.png` | 폭포 위 절벽에 돌기둥 + 주점 |
| `st5-before-portrait-v1.png` | 왼쪽 위 돌기둥, 오른쪽 위 주점 |
| `quest-4-portrait-v1.png` | 왼쪽 위 돌기둥, 오른쪽 위 주점(눈 덮임) |
| `quest-5-portrait-v1.png` | 왼쪽 위 돌기둥, 오른쪽 위 주점(눈 덮임) |
| `st9-before-portrait-v1.png` | 왼쪽 돌기둥 |
| `ending-thrones-portrait-v1.png` | 왼쪽 돌기둥 |

미리보기로만 본 장면(원본으로 다시 확인 필요): `st9-after`, `st10-before`, `st10-after`, `st5-after`.

다시 뽑을 때 공통 스타일 바로 뒤에 아래 문장을 추가한다.

```
Use the attached reference ONLY for brightness, palette and rendering style. Do not copy any object from it: no standing stone with a ring hole, no circle-and-cross symbol, no snowy inn or tavern building, no village houses. This place is far from the starting village.
```

- 지역 2(ST4·ST5·퀘스트 4·5)는 폭포·구름다리 지역이고 지역 2 지도에 눈이 없다. 이 장면들에 `No snow.`를 추가한다.
- 지역 3·4의 눈은 지도와도 맞아서 그대로 둬도 된다.

### B. 대결 탁자에 패가 아닌 다른 말이 놓임

이 게임은 흰 직사각형 돌 패로 승부한다. ST4·ST7 시작 장면은 맞게 그려졌다(흰 패가 놓여 있음).

| 파일 | 지금 | 고칠 점 |
|---|---|---|
| `st5-before-portrait-v1.png` | 체커 판과 둥근 말 | 흰 직사각형 패 몇 장 |
| `st8-before-portrait-v1.png` | 바둑알 같은 둥근 말 | 흰 직사각형 패 몇 장 |
| `st9-before-portrait-v1.png` | 원뿔 모양 말 | 흰 직사각형 패 몇 장 |

프롬프트 추가 문장:

```
On the table lie a few blank cream-white rectangular stone game tiles (like domino-shaped tiles), face down. No chess pieces, no checkers, no round stones, no cones, no game board grid.
```

`st5-before`와 `st9-before`는 A도 해당하므로 한 번에 같이 고친다.

## 3. 사용자 결정 필요 (Codex가 임의로 정하지 말고 사용자에게 묻는다)

| 항목 | 선택지 | Claude 추천 |
|---|---|---|
| v2가 있는 4장면 | v1 / v2 | v2 (미리보기 시트에 v2가 올라가 있음) |
| 가로 화면 처리 | ① 세로 그림을 가로 칸에도 임시로 사용(가운데 기준으로 잘림) ② 가로 그림이 올 때까지 기존 임시 그림 유지 | 사용자 결정 |
| 다시 뽑기 | 2-A·2-B 장면을 다시 뽑은 뒤 한꺼번에 반영 / 지금 있는 그림 먼저 반영하고 나중에 교체 | 사용자 결정 |
| 원+십자 문양 | ST8 탁자, ST9 제단, ST10 원탁·왕좌에 프롤로그 돌기둥 문양이 장식으로 반복됨. 이야기상 "낯익은 문양"으로 볼 수도 있음 | 사용자 결정(유지해도 큰 문제는 아님) |

## 4. 반영할 때 할 일 (결정 후)

1. **크기 맞추기:** 아래 7장은 981~982×1602로 9:16보다 넓다. 좌우를 똑같이 잘라 9:16(약 901×1602)으로 맞춘다. 주요 대상은 모두 가운데에 있어 잘리는 곳이 없다. 나머지는 940~941×1672로 그대로 쓴다(1px 차이는 무시).
   - `region-2-map`, `region-3-map`, `st4-before`, `st4-after`, `st5-after`, `st10-after`, `ending-handoff`
2. **복사·변환:** 장면은 `public/story/{키}-portrait-v1.png`, 패는 `public/story-cards/{id}-front/back-v1.png`에 원본으로 두고 같은 이름의 `.webp`를 만든다(앱은 WebP만 참조). v2를 쓰는 장면도 앱 경로 이름은 프롬프트표 규칙에 맞추고, 원본 v2 PNG는 보존한다.
3. **연결:**
   - 장면 키를 `lib/rpg-chapters.ts`의 `CHAPTER_ART_READY`에 추가한다.
   - 패 경로는 `lib/rpg-story-card-art.ts`에서 바꾼다.
   - 상아 주사위는 `lib/item-battle-relics.ts`의 `relicImage`(지금은 임시 SVG `haro-ivory-die-v1.svg`)를 바꾼다. 다른 유물처럼 정사각 WebP로 줄인다(기존 유물 WebP는 30KB 안팎).
   - ST10 수호자 초상은 `RPG_GUARDIANS` 아바타를 바꾼다.
4. **지도 좌표:** `lib/rpg-journey.ts`의 `JOURNEY_NODES`(가로·세로 %)를 그림 속 장소에 맞춘다. 화면에서 직접 확인하며 옮긴다.
   - 지역 2 지도에서 눈으로 잰 대략 위치(자르기 전 981×1602 기준이라 자른 뒤 다시 확인). 특히 주사위판은 지금 오른쪽 위(82, 32)인데 그림에서는 오른쪽 아래다.

     | 장소 | 그림 속 대략 위치(가로%, 세로%) | 지금 좌표 |
     |---|---|---|
     | ST4 폭포 옆 탁자 | (68, 59) | (40, 78) |
     | 퀘스트 4 젖은 기록 | (12, 59) | (22, 62) |
     | ST5 구름다리 쉼터 | (48, 37) | (56, 50) |
     | 퀘스트 5 매듭 기둥 | (88, 31) | (76, 60) |
     | 퀘스트 6 기록실 | (15, 18) | (28, 30) |
     | 주사위판 나룻배 창고 | (76, 82) | (82, 32) |
     | ST6 회랑 | (60, 9) | (58, 20) |

   - 지역 3·4 지도도 같은 방식으로 맞춘다. 지역 3은 고목(아래)·편지 보관함(오른쪽)·성소(가운데)·잿불 흔적(왼쪽 위)·제단(위), 지역 4는 세계수(가운데)다.
5. **확인:** 폰 세로(375·360), 폰 가로(812×375), PC에서 각 장면·지도·패를 띄워 본다. 아래쪽 자막에 그림 속 중요한 부분이 가리지 않는지도 본다. 전체 테스트(`scripts/register-tests.mjs` 로더)와 `tsc --noEmit`을 돌리고 결과를 기록한다.
6. **저장:** 로컬에만 저장한다. 버전 올림·커밋·push·배포는 사용자가 요청할 때만 한다.
