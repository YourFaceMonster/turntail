# 0.7.21 · ST4~10 이야기 보강, 참여형 이벤트, 선견지명 조정 (2026-11-13)

사용자 요청: "코덱스에서 이미지 생성했어 연결하고 커밋하고 푸쉬해줘". GitHub main push 후 Cloudflare가 자동 배포한다.

## 변경
- ST4~10·두 엔딩 대사와 연출: `docs/story-st4-10-analysis-2026-11-13.md`(사용자 승인), 구현 기록 `docs/story-st4-10-implementation-2026-11-13.md`.
- 참여형 이벤트 5종(ST4 기록 조각, ST5 매듭, ST7 장부, ST8 성소, ST9 문양). 다시 하기·건너뛰기 가능, 보상 없음, 결과는 `journey.story.events`에 저장.
- Codex 그림 4장 연결(요청서 `docs/codex-art-request-2026-11-13-story-events.md`, 생성 기록 `artifacts/story-events-2026-11-13/`):
  - ST4 젖은 기록 조각 3장 `/story-events/st4-fragment-1~3.webp`: 조각 버튼 배경. 글자는 앱이 위에 쓴다.
  - ST7 장부 `/story-events/st7-ledger-page.webp`: 그림의 칸(가로 98~800, 세로 205~895 / 900×1100)에 표를 맞춰 올렸다.
  - PNG 원본은 public에 그대로 둔다.
- 라운드 1등 선견지명: 바닥 3장 → 1장. 멈춘 모래시계 +1장, 합성 승부사의 모래시계 +2장.
- 버전 0.7.21 (package.json, lib/version.ts).

## 포함하지 않은 것
- 다른 세션의 프롤로그·ST3 special-v2 그림(로컬 미게시 상태 유지).

## 이번 검증 (PC 로컬)
- 로컬 개발 서버 375×812에서 ST4 조각·ST7 장부 그림 위치 확인. 조각이 패널 밖으로 넘치던 것을 고쳤다(`.story-puzzle>*{min-width:0}`).
- 배포 파일만 복사한 깨끗한 작업 폴더(db55ac0 기준)에서:
  - TypeScript 통과.
  - 전체 테스트 430개: 412 통과 · 0 실패 · 18 건너뜀(은퇴 테스트).
  - 빌드 성공.
