# Codex 그림 요청 · 영역 이동 컷씬 6장 + 오늘의 판 배너 1장 (2026-11-13)

근거: 2026-11-13 사용자 요청("맵과 맵 사이 이동할 때 컷씬, 개연성 포인트", "오늘의 판이 밋밋하다").

컷씬과 화면은 이미 코드로 연결되어 있다. 지금은 **기존 영역 지도를 임시 그림**으로 쓰고 있어서, 아래 그림이 없어도 진행은 막히지 않는다. 그림이 오면 Claude가 연결만 바꾼다.

## 공통 규격

- 스타일: `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`를 기본 적용한다. 굵은 손그림 윤곽선과 단순한 명암을 쓴다.
- 톤 기준: 야외 장면은 `public/prologue/snow-inn-v3.png`의 중간 밝기, 실내 장면은 `public/prologue/tavern-interior-v2.png`의 어두운 실내.
- 영역 색: 철문 = 남색, 성화 = 주황, 열쇠 = 초록, 왕관 = 빨강. 각 영역 문양은 이 색을 따른다. 이 기준은 `codex-art-request-2026-11-12-emblem-colors.md`와 같다.
- **그림에 글자·숫자·이름을 넣지 않는다.** 대사와 장소 이름은 앱이 위에 쓴다.
- 아래쪽 25%에는 대사 상자가 올라간다. 이 자리는 어둡고 단순하게 둔다. 중요한 물체를 두지 않는다.
- 방랑자는 **뒷모습이나 작은 실루엣**으로 그린다. 얼굴은 그리지 않는다. 손에 패를 들지 않는다. 품속에 넣은 것으로 한다.
- PNG 원본과 WebP를 함께 만든다. 기존 파일은 덮어쓰지 않는다.
- 생성 기록(프롬프트·참조·탈락본)은 `artifacts/region-crossings-2026-11-13/`에 남긴다.

## 컷씬 6장 (세로 1024×1600)

크기는 영역 지도 v2(`public/story/region-*-map-portrait-v2.png`)와 같은 비율이다. 가로 화면에서는 이 세로 그림을 테두리 안에 넣어 보여 준다. 기존 ST4~10 그림과 같은 방식이다.

저장 경로: `public/story/<키>-portrait-v1.png` (+ `.webp`)

| 키 | 장면 | 참조 | 화면 위 대사 |
|---|---|---|---|
| `cross-4-depart` | **철문의 영역을 떠나는 길.** 산길 위에서 뒤돌아본 시점이다. 멀리 북쪽 성채의 성벽, 그 아래로 눈 덮인 노르문 마을의 지붕이 작게 보인다. 남색 철문 깃발이 있다. 저녁 무렵이다. | `public/prologue/iron-gate-village-map-portrait-v3.png`, `public/prologue/twins-after-portrait-r61-iron-v1.png` | "성채의 성벽이 등 뒤로 멀어졌다…", 왕관 2·철문 2 회상 |
| `cross-4-border` | **물안개 경계.** 물소리가 나는 바위 협곡에 짙은 안개가 벽처럼 서 있다. 안개 너머로 폭포, 구름다리, 오래된 회랑의 윤곽이 희미하게 보인다. 경계 바위에 주황 성화 문양이 은은하게 빛난다. 방랑자는 안개 앞에 선 작은 뒷모습이다. | `public/story/region-2-map-portrait-v2.png`, `public/story/st4-before-portrait-v1.png` | 안개를 지나자 상처가 아물고 유물 하나만 남는다 |
| `cross-7-depart` | **회랑을 나서는 길.** 무너진 회랑 기둥 사이로 나온 시점이다. 달빛 아래 폭포와 구름다리가 멀어진다. 회랑 문 곁에 카르덴(기사)이 작게 서서 배웅한다. 꺼지지 않는 주황 불꽃 하나가 받침대에 있다. | `public/story/region-2-map-portrait-v2.png`, `public/story/st6-after-portrait-v1.png` | 성화 2는 아직 따뜻했다, "뒤에 남은 자에게 맡긴다" |
| `cross-7-border` | **달빛 경계.** 숲길 끝에 달빛이 길게 떨어진다. 앞쪽에 고목, 그 뒤 언덕에 별빛 성소, 가장 멀리 잿불 제단의 붉은 빛이 보인다. 경계 돌기둥에 초록 열쇠 문양이 있다. | `public/story/region-3-map-portrait-v2.png`, `public/story/st7-before-portrait-v1.png` | 고목·성소·제단, "남은 문양은 하나" |
| `cross-10-depart` | **잿불이 잦아든 제단을 떠나는 길.** 꺼져 가는 제단 불씨를 뒤로하고 구름 위 돌계단을 오른다. 아래로 고목과 성소가 구름 속에 가라앉는다. | `public/story/region-3-map-portrait-v2.png`, `public/story/st9-after-portrait-v3.png` | 네 장의 패, "가장 약한 숫자만 골라 흩어 놓은 사람" |
| `cross-10-border` | **구름 위 마지막 경계.** 구름 바다 위에 하나뿐인 길이 붉은 세계수까지 이어진다. 세계수 뿌리 사이에 빈 원형 테이블이 작게 보인다. 경계에 빨간 왕관 문양이 있다. 가장 장엄한 장면이다. | `public/story/region-4-map-portrait-v2.png`, `public/story/st10-before-portrait-v1.png` | 마지막 경계, "빈 테이블 하나가 누군가를 기다리고 있었다" |

**떠나는 장면(depart)과 경계 장면(border)의 차이:** depart는 *지나온 영역을 돌아보는* 쓸쓸한 분위기다. border는 *새 영역이 처음 드러나는* 설레는 분위기다. 빛의 방향을 다르게 한다. depart는 뒤쪽에서 지는 빛, border는 앞쪽에서 비치는 빛이다.

## 오늘의 판 배너 1장 (가로 1600×640)

- 용도: "오늘의 판" 순위 창 맨 위 그림. 지금은 프롤로그 그림 `wager-playing-wide-v1`을 빌려 쓰고 있다.
- 내용: 노르문 주점 구석의 **오늘의 판 전용 탁자**. 탁자 위에 똑같은 패 세 벌이 나란히 놓여 있다. "모두가 같은 패"라는 뜻이다. 뒤쪽 벽에 순위가 적힌 칠판이 있고, 칠판 칸은 비워 둔다. 촛불과 금화 몇 개도 놓는다. 인물은 없거나 아주 작게 그린다. 매일 봐도 질리지 않게 한다.
- 아래 25%는 패널 색(#221a13)으로 자연스럽게 어두워지게 한다. 제목 글자가 그 위에 올라간다.
- 참조: `public/prologue/tavern-interior-v2.png`, `public/prologue/wager-playing-wide-v1.png`
- 저장: `public/ui/daily-table-banner-v1.png` (+ `.webp`)

## 연결 방법 (Claude가 한다)

1. 컷씬: `lib/rpg-chapter-scenes.ts`의 `CROSSING_ART_READY`에 키를 넣는다. 그러면 임시 지도 대신 새 그림이 나온다.
2. 배너: `app/components/DailyBoard.tsx`의 `daily-hero` 이미지 경로를 바꾼다.
3. `tests/region-crossings.test.tsx`는 연결된 그림 파일이 실제로 있는지 검사한다.
