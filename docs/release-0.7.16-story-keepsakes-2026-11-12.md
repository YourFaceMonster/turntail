# 0.7.16 · 승인 이야기 패·컷씬 이미지젠 반영

사용자 요청: 이미지젠으로 만든 그림과 적용 작업을 커밋하고 GitHub main에 푸시한다. 기존 main push → Cloudflare 자동 배포 경로를 사용한다.

## 변경

- 승인된 특별 이야기 패 앞면 4종, 뒷면 4종, ST3 확대용 철문 앞면 투명 분리본.
- 프롤로그·ST3·성화/열쇠 앞뒤 발견·엔딩 컷씬 21장과 도감 연결. 일반 대결 패와 특별 이야기 패를 구별한다.
- 앞선 색상 수정본 17장도 생성 이력으로 보존하되 앱에는 연결하지 않는다. 이번 이미지젠 산출물 총 47쌍(PNG/WebP) 보존.
- 승인 기준·전체 프롬프트·참조·원본·검증 기록을 함께 관리한다. [관리 기준](story-keepsake-art-guide.md), [컷씬 적용 상세](local-story-keepsakes-scenes-2026-11-12.md).
- package.json과 lib/version.ts를 0.7.16으로 올려 공통 APP_VERSION을 사용하는 앱 표시도 일치시킨다. pnpm@11.25.0·잠금 파일 유지.

## 이번 검증 (PC 로컬)

- 작업 전 git pull --ff-only origin main: Already up to date, 시작 HEAD 6004cb6.
- 푸시 전 공개 홈페이지 HTTP 200·0.7.15 표시 확인.
- 버전 변경 후 관련·버전 검사 33개 통과 / 실패 0. [로그](../artifacts/story-keepsakes-scenes-2026-11-12/push-tests.log).
- TypeScript --noEmit 통과. diff 공백 검사 및 커밋 대상 확인.
- 앞선 이미지 검증: 승인 원본 4종 보존, 원본 컷씬 19개가 Git HEAD 바이트와 일치, 새 컷씬 21쌍 해상도 일치, 뒷면/철문 분리본 alpha, 비교 시트·390×844 정적 미리보기 시각 확인.
- 기존 가로 화면 관련 app/page.tsx·tests/landscape-stacked.test.ts 로컬 작업, .claude/ 및 별도 artifacts는 이번 커밋 범위에서 제외한다.
- 로컬 운영 빌드는 별도로 실행하지 않는다. 원격 main push에 따른 Cloudflare 자동 빌드·공개 반영을 확인한다. 실제 브라우저 플레이·실기기 검증은 이번 범위에 포함하지 않았다.

## 배포 확인

2026-11-12 PC 로컬에서 소스 커밋 `756e460`을 GitHub main에 push했다(`6004cb6..756e460`). 이후 공개 사이트의 실제 응답을 확인했다.

- 공개 홈페이지 HTTP 200, `title-version` 표시 0.7.16.
- 이번 승인 패·앞뒤·컷씬 WebP 30개 HTTP 200 / image/webp, 로컬 파일과 바이트 및 SHA-256 일치.
- 현재 홈페이지가 참조하는 배포 JS 4개를 읽어 승인 앞면 4종·철문 분리본·성화/열쇠 뒷면·ST3 연결과 special-v1 참조 확인.
- [실시간 확인 결과 JSON](../artifacts/story-keepsakes-scenes-2026-11-12/public-verification-0.7.16.json), [재확인 스크립트](../artifacts/story-keepsakes-scenes-2026-11-12/verify-public.py).
- Cloudflare 빌드 대시보드의 상태/빌드 로그는 직접 조회하지 않았다. 위 성공 표기는 공개 사이트와 파일 응답의 실제 확인을 뜻한다. 실제 브라우저 플레이·실기기 확인은 하지 않았다.

이 공개 확인 결과와 README 상태를 별도 기록 커밋으로 GitHub main에 함께 보존한다.
