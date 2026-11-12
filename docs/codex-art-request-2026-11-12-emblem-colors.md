# Codex 그림 요청 · 컷씬 속 문양(인장) 색 통일 (2026-11-12)

사용자 확정(2026-11-12): **컷씬에 나오는 모든 문양의 색을 실제 게임 패의 색과 맞춘다.** 성화뿐 아니라 네 문양 전부.
이 문서는 Claude가 현재 사용 중인 컷씬 원본(PNG) 70장을 직접 열어 보고 쓴 요청서다. 가로(wide) 판은 세로와 같은 내용인 것만 확인했고 따로 다 열어 보지는 않았다.

## 1. 기준 색 (실제 게임 패 = `app/globals.css`의 `--suit-band`)

| 문양 | 색 | 값 | 숫자 색 |
|---|---|---|---|
| 왕관 | 빨강 | `#ce203a` | 문양과 같은 빨강 |
| 비밀의 열쇠 | 초록 | `#007b3e` | 문양과 같은 초록 |
| 성화 | 주황 | `#ee8b23` | 문양과 같은 주황 |
| 철문 | 검남색 | `#263547` (진한 잉크 `#0b1521`) | 문양과 같은 검남색 |

- 색 견본으로 볼 그림: `public/prologue/wager-playing-portrait-v1.png`, `public/prologue/tile-front-portrait-crown-v1.png`, `public/turntale-room-symbols-portrait-v1.png`. 이 세 장은 이미 기준 색과 맞다.
- 패 앞면은 **숫자와 문양이 같은 색**이다. 숫자만 다른 색으로 칠하지 않는다.
- 밤·횃불 조명 때문에 색이 조금 어두워지거나 따뜻해지는 것은 괜찮다. 다만 네 문양이 서로 구별되어야 한다(빨강/초록/주황/검남색).

## 2. 작업 원칙

1. **부분 수정만 한다.** 인물·배경·구도·조명·패의 위치와 크기는 그대로 두고, 패 위의 숫자·문양과 아래에 적은 문양만 다시 칠한다.
2. 문양의 **모양은 바꾸지 않는다.** 이번 요청은 색만이다(모양 통일은 6번 "이번에는 하지 않는 것" 참고).
3. 패 **뒷면**(갈색 바탕에 금색 선 문양)은 지금 그대로 둔다.
4. 화풍은 기존 그대로: 굵은 손그림 윤곽선, 단순한 명암의 2D 카툰 판타지. `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md` 적용.
5. 글자·숫자가 새로 생기거나 뭉개지지 않게 한다. 수정 뒤 숫자 2와 문양을 확대해서 확인한다.

## 3. 수정 목록

### A. 패 앞면 (반드시)

| # | 파일 (`public/` 아래, 원본 PNG) | 지금 | 바꿀 것 |
|---|---|---|---|
| A1 | `story-cards/iron-gate-two-front-v1` | 숫자 2와 철문이 갈색빛 검정 단색 | 숫자와 철문을 검남색 `#263547`로. 지금과 거의 같아 보여도 갈색 기를 빼고 기준 색으로 |
| A2 | `story-cards/sacred-flame-two-front-v1` | 숫자 2와 성화가 검정 단색 | 숫자와 성화를 주황 `#ee8b23`으로 |
| A3 | `story-cards/secret-key-two-front-v1` | 숫자 2와 열쇠가 검정 단색 | 숫자와 열쇠를 초록 `#007b3e`로 |
| A4 | `story/st6-flame-two-portrait-v1` | 제단 위 패의 2와 성화가 검정 | 주황으로 (A2와 같은 패로 보이게) |
| A5 | `story/st9-key-two-portrait-v1` | 제단 위 패의 2와 열쇠가 검정 | 초록으로 (A3과 같은 패로 보이게) |
| A6 | `story/st6-before-portrait-v1` | 돌 탁자 위 패 네 장(왕관·철문·성화·열쇠)이 모두 갈색 단색 | 왕관 빨강, 철문 검남색, 성화 주황, 열쇠 초록 |
| A7 | `story/true-ending-record-portrait-v1` | 책 앞의 패 네 장이 모두 갈색 단색 | 위와 같은 네 색 |
| A8 | `story/true-ending-village-portrait-v1` | 탁자 위 패 여덟 장과 손에 든 왕관 패가 모두 갈색 단색 | 문양별 네 색 |
| A9 | `prologue/square-mila-portrait-night-symbols-v5`, `prologue/square-poko-portrait-night-symbols-v5` + 같은 이름의 `-wide-` 두 장 | "2 + 철문" 패에서 숫자 2가 빨강, 철문은 검정 | 숫자 2도 철문과 같은 검남색으로. 탁자 위 다른 패(왕관 빨강, 열쇠 초록, 성화 주황)는 맞으니 그대로 |

### B. 패가 아닌 물건에 그려진 문양 (우선)

| # | 파일 | 지금 | 바꿀 것 |
|---|---|---|---|
| B1 | `story/st4-after-portrait-v1` | 젖은 책에 흐린 갈색 왕관 | 물에 번진 느낌은 살리고 빨강 기가 보이게 |
| B2 | `story/st7-after-portrait-v1` | 기록부의 왕관과 방패 문양이 갈색 | 왕관은 빨강 잉크로 |
| B3 | `story/st8-after-portrait-v1` | 편지 상자 앞면 왕관이 금색. 봉랍의 왕관은 빨강(맞음) | 상자의 왕관을 빨강으로 |
| B4 | `story/st9-after-portrait-v1`, `story/quest-9-portrait-v1` | 돌 제단에 새긴 왕관과 철문이 둘 다 주황빛으로 빛남 | 왕관은 붉은 빛, 철문은 검남색(빛 없이 어두운 새김 또는 차가운 푸른 기) |
| B5 | `story/true-ending-record-portrait-v1` | 책 속 네 문양이 갈색 | 문양별 네 색 잉크 |

이미 맞아서 **손대지 않는 것**: `prologue/st3-record-portrait-v1`(책의 성화가 주황), `quests/mor-letter-portrait-v1`·`quests/alley-thief-portrait-v5`의 붉은 봉랍, `quests/alley-thief-portrait-v5`·`alley-thief-spin-portrait-v2`의 패 세 장.

### C. 깃발의 문양 (낮은 우선순위 · 사용자 확인 후)

깃발은 지금 "천 색 + 금색 자수" 방식이다. 사용자 지시는 "모든 인장"이므로 목록에 넣되, A·B를 먼저 끝낸 뒤 시안 1장을 보고 계속할지 정한다.

| # | 파일 | 지금 | 바꿀 것(시안) |
|---|---|---|---|
| C1 | `story/st5-before-portrait-v1`, `story/st5-after-portrait-v1` | 자주색 천에 금색 왕관 | 왕관을 빨강으로, 천은 어두운 색으로 낮춰 왕관이 보이게 |
| C2 | `story/st8-after-portrait-v1` | 남색 천에 금색 철문 | 철문 깃발은 남색 천이 이미 철문 색이라 유지 권장 |
| C3 | ST1~3 철문 깃발 (`prologue/gate-*`, `prologue/st3-*`, `prologue/iron-gate-village-map-*`, `quests/traveler-*`) | 남색 천에 금색 선 철문 | 유지 권장 |
| C4 | `story/st9-before-portrait-v1`, `story/st9-after-portrait-v1`, `story/quest-9-portrait-v1` | 붉은 천에 주황 성화 | 이미 맞음. 유지 |

원 안의 십자 문양(세계 공통 문장)은 네 문양이 아니므로 대상이 아니다.

### D. 확인이 필요한 한 장

- `story/ending-handoff-portrait-v1`: 건네는 패가 **빨간 숫자 2 + 빨간 초승달**이다. 이야기 패 목록(`lib/rpg-story-cards.ts`)에는 초승달 패가 없고 "붉은 왕관 2"가 있다. 왕관이어야 하는지 사용자 확인 후 진행한다. **확인 전에는 고치지 않는다.**

## 4. 납품 형식

- 크기·비율은 원본과 똑같이.
- 원본을 덮어쓰지 말고 **버전을 하나 올린 새 파일**로: `...-v1` → `...-v2`, `...-v5` → `...-v6`. 예: `public/story/st6-before-portrait-v2.png`.
- PNG와 WebP를 함께 만든다(앱은 WebP만 참조). WebP 품질은 기존 파일과 비슷하게.
- 생성 기록(프롬프트, 원본 경로, 새 경로)을 `docs/art-generation-emblem-colors-2026-11-12.md`에 남긴다.
- 코드 연결(`lib/rpg-chapters.ts`의 그림 버전, 프롤로그·퀘스트 경로)과 빌드·배포는 하지 않는다. 연결은 Claude가 한다.

## 5. 검수 기준 (Claude가 받아서 확인)

- A 목록의 모든 패에서 문양과 숫자가 기준 네 색으로 구별된다.
- 같은 이야기 패(성화 2, 열쇠 2, 철문 2)가 이야기 패 그림과 컷씬에서 같은 색이다.
- 인물·배경·구도가 원본과 달라지지 않았다(나란히 놓고 비교).
- 휴대폰 세로 화면(390×844)에서 문양 색이 읽힌다.

## 6. 이번에는 하지 않는 것 (다음 요청 후보)

- **문양 모양 통일**: 성화가 그릇 불꽃(이야기 패·ST6)과 횃불(프롤로그·게임 패) 두 가지로 그려져 있고, 열쇠도 장식 열쇠와 단순 열쇠가 섞여 있다.
- **숫자 없는 패**: ST6 탁자·진엔딩 컷씬의 패에는 숫자가 없다.
- **빈 패**: ST4·5·7·8·9 컷씬 탁자 위 패는 아무것도 없는 크림색이다. 뒷면(갈색+금색 문양)으로 그릴지 정해야 한다.
- 가로 화면용 ST4~10 그림.
