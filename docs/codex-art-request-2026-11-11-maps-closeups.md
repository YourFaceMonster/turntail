# Codex 그림 생성 요청 (2026-11-11 저녁)

작성: Claude · 대상 버전: 0.7.12 이후 로컬

2026-11-11 Codex 처리: A 지도 재생성·PNG/WebP·좌표·점선 경로 로컬 반영. [작업 및 검증 기록](local-region-2-map-paths-2026-11-11.md). 2차 검수 6장은 앞선 로컬 작업에서 완료했으므로 재생성하지 않았다. 선택 B 클로즈업은 보류. 빌드·배포 없음.
같이 넘길 문서: [rpg-st4-10-art-feedback.md](rpg-st4-10-art-feedback.md)의 **2차 검수**(다시 뽑을 장면 6장: `st6-before`, `st6-after`, `dice-den`, `st5-before`, `true-ending-village`, `quest-9`)

> 작업 원칙(AGENTS.md): PC 로컬 `site-publish-checkout/`, 시작 시 `git pull --ff-only origin main`. 빌드·배포 요청이 없으면 로컬 저장까지만. 원본 PNG는 지우지 않고 `artifacts/`에 새 번호(`-v2`, `-v3`)로 보존한다. 앱은 WebP만 참조한다.
> 스타일 기준: `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`, 공통 스타일 문장은 [rpg-st4-10-art-prompts.md](rpg-st4-10-art-prompts.md) 그대로.

## A. 성화의 영역 지도 다시 그리기 (필수)

### 문제
지금 `region-2-map-portrait-v1`은 장소들이 그림 속 길 순서대로 이어지지 않는다. 특히 **ST5 구름다리 쉼터 → ST6 수호자의 회랑**으로 가는 길이 없다. 그림의 계단은 구름다리 오른쪽 끝에서 **오른쪽 위 폐허**로 올라가는데, ST6 회랑은 **가운데 위**에 있다. 앱은 장소 사이를 점선으로 잇기 때문에 점선이 허공을 가로지른다.

### 그릴 길 (이 순서가 그림 속에서 한 줄로 이어져야 함)
본길: **ST4 폭포 탁자 → ST5 구름다리 쉼터 → ST6 회랑**. 곁길 4곳은 본길에서 갈라지는 짧은 샛길.

| 장소 | 화면 위치(가로%, 세로%) — 지금 앱 좌표 그대로 | 그림 속 모습 | 길 |
|---|---|---|---|
| ST4 물안개 폭포 | (70, 59) | 폭포 옆 바위 턱 위 파란 돌 탁자 | 본길 시작. 여기서 위로 돌계단이 올라간다 |
| 퀘스트 4 물에 젖은 기록 | (12, 59) | 왼쪽 물가, 바위에 말리는 젖은 종이 | ST4에서 왼쪽으로 갈라지는 물가 샛길 |
| ST5 구름다리 쉼터 | (48, 37) | 긴 구름다리 한가운데 작은 나무 쉼터와 탁자 | ST4에서 올라온 계단이 다리 **왼쪽(또는 아래쪽) 끝**에 닿는다 |
| 퀘스트 5 끊긴 매듭 | (88.5, 31) | 다리 오른쪽 끝의 굵은 밧줄 매듭 기둥 | 다리 오른쪽 끝에 붙은 짧은 곁길 |
| ST6 수호자의 회랑 | (61, 12) | 무너진 돌 열주와 바랜 보라 깃발 | 다리 **오른쪽 끝에서 위로 꺾여 가운데 위 회랑까지** 계단이 이어진다 |
| 퀘스트 6 잊힌 맹세 | (14, 18) | 작은 무너진 돌 기록실 | 회랑에서 왼쪽으로 갈라지는 샛길 |
| 안개 나루 주사위판 | (78, 82) | 아래 오른쪽 안개 속 낡은 나룻배 창고 | ST4에서 오른쪽 아래로 내려가는 나무 계단 샛길 |

### 프롬프트 (지도 1 형식 참고 그림 `public/prologue/iron-gate-village-map-portrait-v3.png` + 지금 그림 `public/story/region-2-map-portrait-v1.png` 첨부)

```
Redraw the attached region map with the same places, style and colors, but fix the paths so they connect in this exact order as one continuous, clearly drawn trail:
1) Start at the blue stone table beside the waterfall (right of center, slightly below the middle, about 70% across and 59% down).
2) From there a stone stairway climbs up-left to the LEFT end of the long rope-and-plank sky bridge. The small wooden rest platform with a table sits in the middle of the bridge (about 48% across, 37% down).
3) From the RIGHT end of the bridge, a stairway turns upward and climbs to the collapsed stone colonnade with faded purple banners at the top center (about 61% across, 12% down). This must be one visible connected path, not a gap.
Short side paths branching off the main trail: a riverbank path to the left (soaked papers drying on rocks, about 12% across, 59% down); a thick rope knot anchor post right at the bridge's right end (about 88% across, 31% down); a small ruined stone archive room branching left from the colonnade (about 14% across, 18% down); a wooden stair down to a small boathouse in the mist at the lower right (about 78% across, 82% down).
Keep each place exactly at the given position. No labels, no markers, no text, no snow.
```

- 크기 941×1672(9:16). 넓게 나오면 좌우를 같은 폭으로 잘라 맞춘다(늘리지 않는다).
- 반영: `public/story/region-2-map-portrait-v1.png/.webp` 교체(이전 원본은 `artifacts/`에 보존). 그림이 좌표를 정확히 안 지키면 `lib/rpg-journey.ts`의 `JOURNEY_NODES` `portrait` 값을 그림에 맞춘다. 375×812에서 장소 버튼이 그림 속 건물 위에 오고 점선이 그림 속 길을 따라가는지 확인.
- 지역 3(열쇠의 영역)은 ST7 고목 → ST8 성소 → ST9 제단이 그림 속 길과 맞아서 그대로 둔다. 지역 4는 장소가 하나라 해당 없음.

## B. 대결 전 대화 중간 그림 (선택 · 컷씬을 더 풍성하게)

지금 ST4~10 대결 전 대화는 4~6줄 내내 같은 그림이다. 앱에서 천천히 움직이는 카메라와 지역 효과(물안개·바람·먼지·반딧불·금빛 낙엽·잿불·붉은 잎)는 이미 넣었다. 그림을 한 장 더 넣으면 대화 중간에 장면이 바뀌어 훨씬 덜 단조롭다.

각 스테이지에 **승부 직전 클로즈업 1장**(7장). 대화 마지막 줄("한 판 어때?", "패를 내라" 같은 줄)에서 이 그림으로 바뀐다.

공통: 위 공통 스타일 + 아래 문장. 참고 그림은 해당 `st{N}-before-portrait-v1.png`(같은 인물·탁자·색) + `public/prologue/tavern-wager-portrait-v2.png`(패 모양).

```
Close-up of the game table from the same scene as the attached reference, at the moment the match begins. In the foreground, one hand places a chunky cream-white stone game tile face down on the table (same tile as the tavern reference: palm-sized, thick like a small brick, rounded worn edges). Behind it, the opponent's face and hands are visible, lit by the scene's light, with a confident or tense expression. Keep the same characters, clothes and colors as the reference. Bottom quarter calm for subtitles. No text.
```

| 파일 이름 | 상대(인물 설명은 [rpg-st4-10-art-prompts.md](rpg-st4-10-art-prompts.md)의 같은 스테이지) | 분위기 |
|---|---|---|
| `st4-duel-portrait-v1.png` | 수달 낚시꾼 | 젖은 돌, 물보라 |
| `st5-duel-portrait-v1.png` | 붉은 다람쥐 다리 수리공 | 바람, 흔들리는 랜턴 |
| `st6-duel-portrait-v1.png` | 철갑 수호자(빈 갑옷, 투구 틈 호박빛) | 무겁고 조용함 |
| `st7-duel-portrait-v1.png` | 청록 사슴 학자 | 푸른 랜턴 빛 |
| `st8-duel-portrait-v1.png` | 백발 성소 기록관 | 따뜻한 호박빛 |
| `st9-duel-portrait-v1.png` | 잿불지기(붉은 두건) | 붉은 불씨 |
| `st10-duel-portrait-v1.png` | 두 수호자 중 하나(두건 그림자 속 얼굴) | 붉은 잎, 금빛 수액 |

- 반영: `public/story/st{N}-duel-portrait-v1.png/.webp`, `lib/rpg-chapters.ts`의 `CHAPTER_ART_READY`에 `st{N}-duel` 추가, `lib/rpg-chapter-scenes.ts`의 각 스테이지 `before` 대사 **마지막 줄**에 `'st{N}-duel'` 그림 키를 붙인다(`S('수리','그 전에 한 판 어때?…','st4-duel')`처럼). 대사 문구는 바꾸지 않는다.
- 이 B는 사용자가 원할 때만. A와 2차 검수 6장이 먼저다.

## C. 반영 후 확인
- 375×812, 360×800에서 지도 2와 각 컷씬을 띄워 본다(화면 테스트 메뉴: RPG → 프롤로그·화면 테스트 → TEST → 화면 바로가기).
- 전체 테스트(`scripts/register-tests.mjs` 로더)와 `tsc --noEmit`.
- 로컬 저장까지만.
