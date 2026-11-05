# 0.6.71 봇 AI·손패 표시 — 로컬 운영 빌드 완료

사용자 요청: 앞선 업데이트를 모두 반영해 빌드. GitHub push 및 Cloudflare 업로드는 이번 요청에 명시되지 않아 수행하지 않았다.

- 봇 AI: 탐색 Worker 재사용, 동시 요청/취소 격리, 여정 미니게임 전송 제외·복원, 시간 초과/오류 시 일반전의 가벼운 판단. 상세 `local-bot-worker-reuse-2026-11-05.md`.
- 손패: 강제 backface 지정·CSS 흐림 제거, SVG 내부 회색 면, 문양 색 보존, 선택 패 흐림 해제. 상세 `local-tile-muted-gpu-2026-11-05.md`.
- package.json과 lib/version.ts를 `0.6.71`로 올렸다. 앱의 메뉴/헤더/푸터는 APP_VERSION을 사용한다. 기존 pnpm 잠금 파일과 `pnpm@11.25.0` 유지.

## 이번 실행 결과

- `pnpm build`: 운영 빌드 5단계 통과. 로그 `../../artifacts/release-0.6.71-build.log`.
- 봇·Worker·비공개 정보·손패·문양·선택/제스처 관련 14개 테스트 파일, 15개 검사 모두 통과. 로그 `../../artifacts/release-0.6.71-tests.log`.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false` 통과.
- `git diff --check` 통과.
- 클라이언트 빌드 산출물에서 0.6.71, 회색 SVG 면, 여정 데이터 제외를 포함한 Worker 참조 및 별도 Worker JS 출력을 확인했다. 파일 SHA-256과 결과는 `build-0.6.71-2026-11-05.json`에 보관했다.
- 빌드는 완료됐으며 vinext의 라우트 정적 분류 한계 안내가 출력됐다.

## 검증 범위

앞선 로컬 작업에서 기존 HP 아이템 검사 2개 및 문양/스테이지 UI 검사 2개 실패를 수정 전 HEAD에서도 재현했다. 이번에는 그 비교를 재실행하지 않았으며, 해당 결과는 위 로컬 기록을 따른다. 이번 15개 통과를 전체 테스트 통과로 표현하지 않는다.

Work 브라우저 제어 비활성은 앞선 작업에서 확인한 제한이다. 이번 실제 브라우저·Android 실기기·GPU 레이어·공개 사이트 검증은 수행하지 않았다. 손패 글리치의 실기기 해결 여부는 미확정이다.

로컬 운영 빌드: `dist/client`, `dist/server`. 커밋·push·Cloudflare 배포 없음. 운영 사이트의 버전이 0.6.71로 변경됐다는 의미가 아니다.
