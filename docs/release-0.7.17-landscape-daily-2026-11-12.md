# 0.7.17 · 가로 화면 배치·오늘의 판 휴대폰 실행 (2026-11-12)

사용자 요청: "푸쉬하고 커밋해줘". GitHub main push → Cloudflare 자동 배포.

## 변경

### 가로 화면 (사용자 요청·B안 선택)
- 배치: 왼쪽 = 바닥패 + 낸 패, 오른쪽 = 내 패 (`LANDSCAPE_PLAYED_ABOVE_HAND=false`, `app/page.tsx`). 2026-11-09의 "낸 패를 내 패 위에" 배치는 스위치로 남겨 둠.
- 바닥패 키우기(B안): 낸 패를 바닥패와 같은 크기로(`LANDSCAPE_PLAYED_SCALE=1`), 상대 정보 줄 62→42px(대사는 그 상대 칸 아래쪽 위에 약 3초 겹쳐 표시), 스토리모드 바닥패를 막던 계산 해제 (`lib/layout.ts` `sideLandscape`, `app/landscape-stacked.css`).
- 844×390 기준 바닥패: 일반 53→62px, 스토리 50→58px.

### 오늘의 판 (사용자 선택 C)
- 원인: 오늘의 판은 수마다 서버를 거쳐 느렸고(읽기 1회 약 270~380ms 측정), 사용자 화면에서 서버가 HTML 오류 페이지를 돌려줘 `Unexpected token '<'` 오류로 판이 끊김(원인 자체는 Cloudflare 로그 미확인).
- 이제 일반모드처럼 휴대폰 안에서 진행. 서버는 `dailyClaim`(순위 판 자리 예약)과 `dailyFinish`(끝난 점수 기록)만 처리 (`lib/daily-server.ts` `dailyFinishRequest`, `app/api/game/route.ts`).
- 사용자가 감수한 점: 휴대폰이 보낸 점수를 받으므로 조작 가능. 서버는 자리 코드·done=0·점수 범위(±120)만 확인.
- 이어받기 규칙(끝나지 않은 순위 판은 다음 판이 이어받음)과 끝난 뒤 연습판 규칙 유지. 오늘의 판은 이어하기 저장을 하지 않아 일반모드 저장을 덮지 않음. 연결 실패 시 연습판으로 시작.
- 예전 서버 방식(`create`+`daily`) 처리는 진행 중인 방을 위해 남겨 둠.
- 서버 AI 연습 방에서 내 패를 서버 답 전에 먼저 날리는 처리(`lib/optimistic-play.ts`)도 포함. 오늘의 판에는 더 이상 쓰이지 않음.

### 기타
- 0.7.16 그림 파일 이름 변경에 맞춰 그림 테스트 정규식 완화 (`tests/journey-polish.test.tsx`).
- 버전 0.7.17 (package.json, lib/version.ts).

## 커밋에서 뺀 것
- 같은 PC의 다른 세션이 진행 중인 미커밋 그림 작업(README, `docs/story-keepsake-art-guide.md`, `lib/rpg-story-card-art.ts`, `tests/rpg-story-continuity.test.ts`, `docs/local-story-tile-proportions-2026-11-12.md`, `public/prologue/*special-v2*`)은 포함하지 않음. README 기록도 그 작업과 겹쳐 이 문서로 대신함.

## 이번 검증 (PC 로컬)
- 커밋 대상 파일만 HEAD에 얹은 별도 작업 폴더에서 TypeScript `--noEmit`·전체 테스트 실행(결과는 아래 배포 절에 기록).
- 로컬 dev 화면 844×390: 일반·스토리 가로 배치 크기 측정, 대사 겹침 위치, 오늘의 판 시작→끝→순위표 기록(로컬 DB)·서버 호출 3회 확인.
- 실제 휴대폰·공개 사이트 플레이는 하지 않음.
