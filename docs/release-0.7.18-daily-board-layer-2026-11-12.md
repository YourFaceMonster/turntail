# 0.7.18 · 결과 화면에서 오늘의 판 순위표가 안 열리던 문제 (2026-11-12)

테스터 피드백(PC): 한 판 끝난 화면에서 "오늘의 판 순위 보기"에 마우스를 올리면 모양은 바뀌는데 클릭이 안 됨.
사용자 요청: "그렇게 해서 커밋해줘" → "커밋하고 푸쉬해줘". GitHub main push → Cloudflare 자동 배포.

## 원인
- 순위표 창(`.modal-shade`, z-index 30)이 결과 화면(`.result-shade`, z-index 38) 뒤에 열렸다. 버튼은 눌리고 창도 열렸지만 가려져 반응이 없는 것처럼 보였다. 오늘의 판이 처음 생긴 0.7.13부터 있던 문제로 보인다.

## 변경
- `app/components/daily-board.css`: `.modal-shade:has(>.daily-board){z-index:45}`. 다른 팝업은 그대로.
- 버전 0.7.18 (package.json, lib/version.ts).

## 이번 검증 (PC 로컬)
- 로컬 dev에서 순위표를 연 뒤 같은 `main` 안에 결과 화면 층을 겹쳐 가운데 요소 확인: 예전 값 30이면 결과 화면이 위, 수정 후 순위표가 위.
- 커밋 대상만 HEAD에 얹은 별도 작업 폴더에서 TypeScript·전체 테스트 실행(결과는 배포 절).
- 실제로 한 판을 끝내고 결과 화면에서 버튼을 누르는 확인은 하지 못함(브라우저 창이 숨겨져 입장 연출이 멈춤). 실제 휴대폰·공개 사이트 플레이는 하지 않음.

## 커밋에서 뺀 것
- 같은 PC 다른 세션의 미커밋 그림 작업(README, `docs/story-keepsake-art-guide.md`, `lib/rpg-story-card-art.ts`, 관련 테스트·문서, special-v2/v3 그림)은 포함하지 않음.
