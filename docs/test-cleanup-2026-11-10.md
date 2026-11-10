# 2026-11-10 · 오래 실패해 온 테스트 정리 (로컬, 미배포)

사용자 요청: 0.7.x 배포 기록에 "기존 실패 37개"로 남아 있던 테스트를 정리한다. 아이템전·직업 테스트는 건너뛰기로 표시하고, 옛 타일 그림 테스트는 현재 그림에 맞게 갱신한다(사용자 선택).

## 결과
- 이전: 380개 중 343개 통과, 37개 실패(31개 파일). 실패 대부분은 파일 앞쪽 검사가 멈추면서 뒤쪽 검사가 실행되지 않은 상태였다.
- 이후: 382개 중 364개 통과, 0개 실패, 18개 건너뜀. TypeScript 오류 0.
- 실행: `node --import ./scripts/register-tests.mjs --test tests/*.ts tests/*.tsx` (`.py` 테스트는 별도)

## 테스트 도구
`scripts/register-tests.mjs`를 두 군데 고쳤다.
- **inline source map:** `node --enable-source-maps`로 실행하면 실패 위치가 실제 테스트 줄로 표시된다. TSX 파일은 Node가 원본 줄을 읽지 못하므로 이 옵션 없이 실행한다.
- **확장자 보정은 프로젝트 파일에만 적용:** 패키지 내부의 `require('./dist/client/link')`까지 고쳐서 `next/link.js`를 불러오지 못하던 문제를 고쳤다. `bomb-market-ui`가 이 문제였다.

## 의도된 변경에 맞춘 테스트 (코드는 그대로)
| 파일 | 실제 변경 |
|---|---|
| pacing, turn-timeout | 낸 패 확인 시간이 고정 3.4초에서 족보·첫 등장 여부에 따른 가변 시간으로 바뀜(10월) |
| multiplayer | AI가 확인 시간을 기다리므로 테스트가 가상 시계를 진행 |
| online-timeout | 온라인 방이 3·4인만 가능(10-24). 도전모드 종료(410) 확인으로 교체 |
| scene-loading | 장면 이미지 이름 추측 대신 실제 필요한 이미지 목록으로 로드 |
| interaction-0635 | 받은 추가 피해 표기가 "−N"(10-28) |
| bomb-classic, bomb-market-ui | 폭탄시장 4인(11-03): 손패 11·시장 16·4열. 문양명 해→왕관(11-04). 폭탄을 낼 수 있을 때만 3초 반응(0.7.7) |
| stage-ui, stage-refinements-0522, regional-surfaces-0525, release-055, release-0518 | 타일 그림 재작업: 숫자 위치·외곽선, 특수 2 문양, 2스테이지 재질 농도 0.24, 공통 문양 장식(10-27), 문양 통일(11-04) |

## 2스테이지 타일 뒷면 색 (사용자 승인 후 변경)
- 10-24에 밝은 호두색 `#986b3b`(대비 4.1:1)로 바뀌어 있었다. 다른 스테이지는 10:1 이상이다.
- 사용자 승인으로 진한 호두색 `#5a391c`(대비 9.1:1)로 바꿨다. 무늬 색 `#fff0bd`는 그대로다.
- 테스트 기준도 원래의 8:1로 되돌렸다.

## 건너뛰기로 표시한 18개 파일
숨긴 아이템전·없앨 직업 시스템, 그리고 직업·주화를 쓰는 옛 RPG 1차 화면 테스트다. 파일은 남겨 두고 `RUN_RETIRED_TESTS=1`일 때만 실행한다. 해당 코드를 지울 때 함께 삭제한다.

- character-visuals-0635
- coin-tempo
- combat-feedback-0641
- combat-feedback
- duel-polish-0642
- duel-polish-0644
- feedback-polish-0645
- hp-item-0610
- hp-item-battle
- hp-item-mode
- interaction-polish-0650
- item-balance-0644
- item-battle-1033
- item-shop-0630
- items-0611
- pickup-0637
- turntale-0626
- rpg-stage-ui
