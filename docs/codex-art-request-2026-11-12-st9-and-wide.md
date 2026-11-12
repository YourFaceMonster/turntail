# Codex 그림 요청 · ST9 빈 패 다시 그리기 + ST4~10 가로 그림 (2026-11-12)

공통 원칙
- 스타일: `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md` (굵은 손그림 윤곽선, 단순한 명암의 2D 카툰 판타지).
- 원본 PNG와 WebP를 함께 만든다. 기존 파일은 덮어쓰지 않고 새 버전 이름으로 저장한다.
- 문양 색은 실제 게임 패(`app/globals.css`의 `--suit-band`)와 같게 한다. 숫자도 문양과 같은 색이다.
  - 왕관 빨강 `#ce203a`
  - 철문 검남색 `#263547`
  - 성화 주황 `#ee8b23`
  - 열쇠 초록 `#007b3e`
- 일반 승부 패는 상아색 몸통에 문양과 숫자 하나가 있는 형태다. 이야기 특별 패(금테·장식)는 `docs/story-keepsake-art-guide.md` 기준을 따르고, 일반 패에 그 장식을 퍼뜨리지 않는다.
- 앱 연결은 Claude가 한다. 그림만 만들고 생성 기록(프롬프트·참조·탈락본)은 `artifacts/` 아래에 남긴다.

## 1. ST9 승리 후 · 제단 위 빈 패 4장 (필수)

- 원본: `public/story/st9-after-portrait-v2.png` (941×1672). 문양 색을 고친 v2이며 앱에 연결돼 있다.
- 문제: 돌 제단 위의 일반 패 4장이 하얀 빈 패다. 문양도 숫자도 없다.
- 바꿀 것: 4장을 왕관·철문·성화·열쇠 각 1장으로 그린다. 위 기준 색을 쓰고 숫자는 넣지 않거나 작게 넣는다.
- 그대로 둘 것: 인물 2명, 제단 앞면의 빨강 왕관·검남색 철문 새김, 붉은 세계수, 구도.
- 저장 이름: `public/story/st9-after-portrait-v3.png` / `.webp`

## 2. ST4~10 가로(와이드) 그림 (선택 · 사용자 결정 후)

- 지금 가로 화면에서는 세로 그림을 가운데에 놓고, 뒤에 같은 그림을 흐리게 깔아 보여 준다.
- 0.7.12 기록 기준: "세로로 써 본 뒤 가로 그림 여부를 정한다". 사용자가 진행하라고 할 때만 만든다.
- 규격: 1672×941. 프롤로그 가로 그림과 같은 비율이다.
- 같은 장면의 세로 그림을 참조로 쓴다. 인물·소품·문양 색·시간대를 같게 하고, 가로 폭에 맞춰 배경만 넓힌다. 세로 그림을 늘이거나 잘라 붙이지 않는다.
- 저장 이름:
  - 일반 장면: `public/story/<key>-wide-v1.png` / `.webp`
  - 이야기 특별 패 장면: `public/story/<key>-wide-special-v1.png` / `.webp`
- 특별 패 크기는 일반 트럼프 카드 실물 크기를 따른다(약 63×88mm, 폭:높이 약 0.72). 가로 캔버스라고 패를 넓적하게 만들지 않는다.

**우선순위 A · 이야기 핵심 (7장, 특별 패 장면)**

| key | 세로 참조 | 장면 |
|---|---|---|
| st6-flame-two | `st6-flame-two-portrait-special-v2` | 달빛 받침대 위 성화 2 |
| st6-flame-two-back | `st6-flame-two-back-portrait-special-v2` | 같은 장면, 뒷면 |
| st9-key-two | `st9-key-two-portrait-special-v2` | 그을린 받침대 속 열쇠 2 |
| st9-key-two-back | `st9-key-two-back-portrait-special-v2` | 같은 장면, 뒷면 |
| true-ending-record | `true-ending-record-portrait-special-v2` | 책과 패 4장 |
| true-ending-village | `true-ending-village-portrait-special-v2` | 주점에서 이야기 전하기 |
| ending-handoff | `ending-handoff-portrait-special-v2` | 왕관 2 건네기 |

**우선순위 B · 엔딩 (2장)**: `ending-thrones`, `ending-kings` (세로 참조: `<key>-portrait-v1`)

**우선순위 C · 스테이지 전후·서브퀘스트 (20장)**
- 세로 참조는 `<key>-portrait-v2`가 있으면 v2, 없으면 v1.
- 대상:
  - `st4-before`, `st4-after`, `st5-before`, `st5-after`, `st6-before`, `st6-after`, `st7-before`, `st7-after`, `st8-before`, `st8-after`, `st9-before`, `st9-after`(1번 v3 완료 후), `st10-before`, `st10-after`
  - `quest-4`, `quest-5`, `quest-6`, `quest-8`, `quest-9`, `dice-den`
- 지역 지도(`region-2/3/4-map`)는 세로 전용이라 대상이 아니다.

## 3. 이번에 Claude가 로컬에서 처리한 것 (참고 · 그림 요청 아님)

- 문양 색 v2 그림 연결:
  - ST4·ST7·ST8·ST9 승리 후, ST6 승부 전, 마지막 불씨(`quest-9`)
  - 밀라·포코 광장 v6. 대화창 얼굴 자르기 좌표가 v6에서도 맞는지 확인했다.
- 패가 작게 보이는 문제: ST6 성화 2와 ST9 열쇠 2에 ST3처럼 확대 장면(앞면 → 뒷면)을 붙였다. 패 그림을 다시 그릴 필요는 없다.
