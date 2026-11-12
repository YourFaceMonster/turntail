# 특별 패 가로·세로 비율 교정 · 2026-11-12 (로컬 미게시)

## 요청과 결과

사용자 확인: 프롤로그·이야기 컷씬의 특별 패가 가로·세로에서 크기와 형태가 다르게 보임. 원인 보고 뒤 사용자가 수정을 승인했다.

- 문제 원인: 승인 패를 기존 원화의 제각각인 외곽에 맞추면서 가로 그림의 패가 짧고 넓게 남았고, 캔버스 크기 확인과 대비 검수에서 패 자체의 비율 차이를 놓쳤다.
- 프롤로그·ST3의 가로/세로 **7쌍, 14장**을 내장 image_gen으로 부분 수정. 왕관 앞면 확대·뒷면 확대·주점 제안 기본/말하는 자세·돌기둥 비교·철문 전달·두 패 뒷면 비교.
- 승인 원본의 황동 몸통 폭:높이 약 0.63:1을 기준으로 패를 길쭉하게 교정. 인접 손/엄지에 대한 짧은 변 크기와 잡는 지점을 기준으로 긴 변을 늘렸다. 가로 화면이라고 패를 넓게 눌러 그리지 않는다. 이 수치는 제작 참조 기준이며 모든 원근 투영의 픽셀 측정값이 정확히 같다는 뜻은 아니다.
- 승인 문양·프레임·색 유지. 패 자체 디자인은 새로 만들지 않았다. 손가락 가림과 장면 조명에 맞춰 적용했다. 생성 편집으로 장면의 일부 선·질감은 원본과 픽셀 단위로 동일하지 않을 수 있다.
- 새 파일은 `*-special-v2.png` 및 WebP(quality85/method6). v1과 승인 패 원본을 보존한다. 전체 그림을 가로/세로로 늘여 고친 것이 아니다.
- 앱의 공통 `prologue` 그림 경로만 v2로 연결했다(`lib/rpg-story-card-art.ts`). 도감의 승인 원본·ST3 독립 확대 패·ST4~10 동일 세로 그림은 유지한다. ST4~10은 양 방향에 같은 원화를 쓰므로 별도 가로 원화의 패 왜곡 교정 대상이 아니다.
- 관련 그림 목록의 고정 경로 회귀 기대값(`tests/rpg-story-continuity.test.ts`)도 v2로 갱신했다.
- [디자인 관리 기준](story-keepsake-art-guide.md)과 루트 AGENTS.md에 패 자체 비율·손 대비 크기·잘못된 기존 외곽을 승계하지 않는 원칙을 추가했다.

## 이번 검증

- 관련·버전 검사 **33 통과 / 실패0**, TypeScript --noEmit 통과, diff 공백 검사 통과. [테스트 로그](../artifacts/story-tile-proportions-2026-11-12/tests.log).
- **실제 ProloguePicture 컴포넌트와 프로젝트 CSS**를 SSR하여 로컬 임시 HTTP 서버에서 headless Edge로 렌더. 세로390×844·가로844×390 각각7장, 총14캡처. 방향별 currentSrc가 새 v2이고 이미지가 로드됐는지 및 object-fit:cover 확인. 애니메이션은 비교를 위해 멈추고 대화 UI는 숨겼다. 실제 게임 전체 진행/실기기 조작 검증은 아니다. 서버와 브라우저는 완료 후 종료.
- 패·손 확대 전후 비교 4장과 가로/세로 브라우저 비교7장을 직접 검토. 화면 픽셀 크기 자체를 일치시킨 것이 아니라, 원근·카메라 구도 안에서 같은 물건으로 보이는 비율과 손 대비 크기를 확인했다.
- 원본 컷씬14장·승인 앞/뒷면 원본8장, 총22개 PNG가 Git HEAD 바이트/SHA-256과 일치. PNG/WebP14쌍 모두 기존 캔버스 크기 일치. 생성 크기가 1픽셀 차이인 출력7장은 원본 크기로 미세 리샘플링(목록은 validation).
- [검증 요약](../artifacts/story-tile-proportions-2026-11-12/verification-summary.json), [해상도·원본 해시](../artifacts/story-tile-proportions-2026-11-12/validation.json), [브라우저 실제 이미지 선택·크기 기록](../artifacts/story-tile-proportions-2026-11-12/browser-report.json).
- [최종 프롬프트·참조·새 경로](../artifacts/story-tile-proportions-2026-11-12/manifest.json). 가로 왕관 확대 첫 생성은 길이 교정이 부족해 제외하고, 모서리 위치와 교정된 세로 참조를 함께 주어 재생성한 결과를 사용했다.

## 비교 보기

| 장면 | 원화 전후·양 방향 | 실제 컴포넌트 양 방향 캡처 |
|---|---|---|
| 왕관 앞면 | [비교 1](../artifacts/story-tile-proportions-2026-11-12/pair-1.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-crownFront.jpg) |
| 왕관 뒷면 | [비교 2](../artifacts/story-tile-proportions-2026-11-12/pair-2.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-crownBack.jpg) |
| 주점 제안 | [비교 3](../artifacts/story-tile-proportions-2026-11-12/pair-3.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-wagerRest.jpg) |
| 주점 말하는 자세 | [비교 4](../artifacts/story-tile-proportions-2026-11-12/pair-4.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-wagerSpeaking.jpg) |
| 돌기둥 비교 | [비교 5](../artifacts/story-tile-proportions-2026-11-12/pair-5.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-stoneComparison.jpg) |
| 철문 전달 | [비교 6](../artifacts/story-tile-proportions-2026-11-12/pair-6.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-ironHandoff.jpg) |
| 두 패 비교 | [비교 7](../artifacts/story-tile-proportions-2026-11-12/pair-7.jpg) | [브라우저](../artifacts/story-tile-proportions-2026-11-12/browser-pair-ironComparison.jpg) |

패와 손 확대: [앞뒤 확대](../artifacts/story-tile-proportions-2026-11-12/grip-details-1.jpg), [주점](../artifacts/story-tile-proportions-2026-11-12/grip-details-2.jpg), [돌기둥·전달](../artifacts/story-tile-proportions-2026-11-12/grip-details-3.jpg), [두 패](../artifacts/story-tile-proportions-2026-11-12/grip-details-4.jpg).

## 새 파일

| 장면 | PNG | WebP |
|---|---|---|
| crownFrontPortrait | [prologue/tile-front-portrait-crown-special-v2.png](../public/prologue/tile-front-portrait-crown-special-v2.png) | [WebP](../public/prologue/tile-front-portrait-crown-special-v2.webp) |
| crownFrontWide | [prologue/tile-front-landscape-crown-special-v2.png](../public/prologue/tile-front-landscape-crown-special-v2.png) | [WebP](../public/prologue/tile-front-landscape-crown-special-v2.webp) |
| crownBackPortrait | [prologue/tile-back-portrait-special-v2.png](../public/prologue/tile-back-portrait-special-v2.png) | [WebP](../public/prologue/tile-back-portrait-special-v2.webp) |
| crownBackWide | [prologue/tile-back-landscape-special-v2.png](../public/prologue/tile-back-landscape-special-v2.png) | [WebP](../public/prologue/tile-back-landscape-special-v2.webp) |
| wagerRestPortrait | [prologue/wager-rest-portrait-symbols-special-v2.png](../public/prologue/wager-rest-portrait-symbols-special-v2.png) | [WebP](../public/prologue/wager-rest-portrait-symbols-special-v2.webp) |
| wagerRestWide | [prologue/wager-rest-wide-symbols-special-v2.png](../public/prologue/wager-rest-wide-symbols-special-v2.png) | [WebP](../public/prologue/wager-rest-wide-symbols-special-v2.webp) |
| wagerSpeakingPortrait | [prologue/wager-speaking-portrait-symbols-special-v2.png](../public/prologue/wager-speaking-portrait-symbols-special-v2.png) | [WebP](../public/prologue/wager-speaking-portrait-symbols-special-v2.webp) |
| wagerSpeakingWide | [prologue/wager-speaking-wide-symbols-special-v2.png](../public/prologue/wager-speaking-wide-symbols-special-v2.png) | [WebP](../public/prologue/wager-speaking-wide-symbols-special-v2.webp) |
| stonePortrait | [prologue/stone-revelation-portrait-special-v2.png](../public/prologue/stone-revelation-portrait-special-v2.png) | [WebP](../public/prologue/stone-revelation-portrait-special-v2.webp) |
| stoneWide | [prologue/stone-revelation-landscape-special-v2.png](../public/prologue/stone-revelation-landscape-special-v2.png) | [WebP](../public/prologue/stone-revelation-landscape-special-v2.webp) |
| ironHandoffPortrait | [prologue/st3-keepsake-handoff-portrait-special-v2.png](../public/prologue/st3-keepsake-handoff-portrait-special-v2.png) | [WebP](../public/prologue/st3-keepsake-handoff-portrait-special-v2.webp) |
| ironHandoffWide | [prologue/st3-keepsake-handoff-wide-special-v2.png](../public/prologue/st3-keepsake-handoff-wide-special-v2.png) | [WebP](../public/prologue/st3-keepsake-handoff-wide-special-v2.webp) |
| ironComparisonPortrait | [prologue/st3-keepsake-compare-portrait-special-v2.png](../public/prologue/st3-keepsake-compare-portrait-special-v2.png) | [WebP](../public/prologue/st3-keepsake-compare-portrait-special-v2.webp) |
| ironComparisonWide | [prologue/st3-keepsake-compare-wide-special-v2.png](../public/prologue/st3-keepsake-compare-wide-special-v2.png) | [WebP](../public/prologue/st3-keepsake-compare-wide-special-v2.webp) |

## 저장 범위

시작 main / HEAD81cf8b7, git pull --ff-only origin main → Already up to date. 버전0.7.16 유지. 빌드·커밋·push·배포 없음. 기존 가로 대결 화면 관련 app/landscape-stacked.css·app/page.tsx·lib/layout.ts와 tests/journey-polish.test.tsx·tests/landscape-stacked.test.ts·tests/ui-ux-minimal-fix.test.tsx의 로컬 작업은 건드리지 않았다.
