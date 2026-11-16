# 컷씬 패 교정 1묶음 전달 · 2026-11-16 (로컬 미게시)

요청서: `codex-art-request-2026-11-16-cutscene-tiles.md`.
사용자 요청에 따라 1묶음 16장면 × 세로/가로 = **32장**을 built-in image_gen으로 생성했다. 원본 PNG와 앱용 WebP 총64파일을 새 버전 이름으로 저장했다.
요청서의 "묶음 하나가 끝날 때마다 넘겨 주면 Claude가 그 묶음부터 연결" 지시에 맞춰 이 묶음을 전달한다.

## 상태

- PC 로컬 `site-publish-checkout/`에서 작업. 시작 `git pull --ff-only origin main`: Already up to date. package.json과 lib/version.ts는 0.7.31.
- 기존 Claude 코드 변경 4파일과 기존 미추적 작업은 유지. 이번에는 그림과 생성/검수 기록만 추가.
- 기존 v1/v2/v3 원본 및 이야기 특별 패 파일을 덮어쓰거나 삭제하지 않았다.
- **앱 경로 연결은 아직 하지 않았다.** 요청서 마지막의 Claude 연결 작업을 진행하면 된다.
- 빌드·커밋·push·배포 없음. 실제 앱/모바일 확인 없음.
- 2묶음 섞기14장, 3묶음 결과14장, 4묶음 표정68장은 **미생성**.

## 저장과 검수

- 세로 PNG/WebP 각각 1024×1536, 가로 각각1672×941. 원시 생성 크기가 다른 결과는 Lanczos로 요청 크기에 리사이즈했다. 원시 생성본도 artifacts에 보존.
- PNG·WebP64개를 열어 크기와 디코딩을 검사. 수치/해시는 `artifacts/cutscene-tiles-2026-11-16/validation.json`.
- 원본/인게임 스크린샷과 생성본을 육안 대조. 숫자 위·문양 아래, 색 짝, 중복 패, 스테이지 재질과 뒷면 새김, 인물과 배경 구도 확인.
- ST7 before 세로/가로 숫자 색 불일치, ST9 after 세로13누락은 재생성해 교정. 첫 시안은 artifacts의 `*-generated.png`, 채택본은 해당3개의 `*-corrected-generated.png`.
- 생성 편집 특성상 픽셀 단위로 원본과 같지는 않다. 가로는 작게 보이는 패의 실제 화면 판독성, 세로는 원본 비율에서 요청 크기로 변환된 구도를 앱 연결 후 확인해야 한다.
- ST7 duel 세로/가로는 손 아래 패뿐 아니라 장부 앞에 있던 빈 패4장도 같은 월장석 뒷면으로 교정했다.
- 특별 패 장면과 테이블 앞면 이야기 문양은 변경 대상에서 제외했다.
- 각 파일의 원본·생성 경로·최종 경로와 **최종 프롬프트 전체**는 `artifacts/cutscene-tiles-2026-11-16/manifest.json`. 재시도3건은 `correction_prompt`가 최종 프롬프트다.
- 생성 도구: built-in image_gen. Python/Pillow는 생성 후 크기·포맷 변환 및 검수용 모음에만 사용.

## Claude 연결 목록

아래 확장자 없는 경로는 `public/` 기준이며 PNG와WebP 둘 다 있다. 앱은 WebP를 참조한다.

| 기존 | 새 파일 |
|---|---|
| story/st4-before-portrait-v1 | story/st4-before-portrait-v2 |
| story/st4-before-wide-v1 | story/st4-before-wide-v2 |
| story/st5-before-portrait-v1 | story/st5-before-portrait-v2 |
| story/st5-before-wide-v1 | story/st5-before-wide-v2 |
| story/st7-before-portrait-v1 | story/st7-before-portrait-v2 |
| story/st7-before-wide-v1 | story/st7-before-wide-v2 |
| story/st8-before-portrait-v1 | story/st8-before-portrait-v2 |
| story/st8-before-wide-v1 | story/st8-before-wide-v2 |
| story/st9-before-portrait-v1 | story/st9-before-portrait-v2 |
| story/st9-before-wide-v1 | story/st9-before-wide-v2 |
| prologue/wager-playing-portrait-v1 | prologue/wager-playing-portrait-v2 |
| prologue/wager-playing-wide-v1 | prologue/wager-playing-wide-v2 |
| story/st6-before-portrait-v2 | story/st6-before-portrait-v3 |
| story/st6-before-wide-v1 | story/st6-before-wide-v2 |
| story/st9-after-portrait-v3 | story/st9-after-portrait-v4 |
| story/st9-after-wide-v1 | story/st9-after-wide-v2 |
| story/st4-duel-portrait-v1 | story/st4-duel-portrait-v2 |
| story/st4-duel-wide-v1 | story/st4-duel-wide-v2 |
| story/st5-duel-portrait-v1 | story/st5-duel-portrait-v2 |
| story/st5-duel-wide-v1 | story/st5-duel-wide-v2 |
| story/st6-duel-portrait-v1 | story/st6-duel-portrait-v2 |
| story/st6-duel-wide-v1 | story/st6-duel-wide-v2 |
| story/st7-duel-portrait-v1 | story/st7-duel-portrait-v2 |
| story/st7-duel-wide-v1 | story/st7-duel-wide-v2 |
| story/st8-duel-portrait-v1 | story/st8-duel-portrait-v2 |
| story/st8-duel-wide-v1 | story/st8-duel-wide-v2 |
| story/st9-duel-portrait-v1 | story/st9-duel-portrait-v2 |
| story/st9-duel-wide-v1 | story/st9-duel-wide-v2 |
| story/st10-duel-portrait-v1 | story/st10-duel-portrait-v2 |
| story/st10-duel-wide-v1 | story/st10-duel-wide-v2 |
| story/st10-after-portrait-v1 | story/st10-after-portrait-v2 |
| story/st10-after-wide-v1 | story/st10-after-wide-v2 |

before/after 버전 표, 가로 버전 표, duel·프롤로그 경로 및 preload를 요청서대로 연결한다. 이 문서의 이미지 파일 생성 검증은 앱 연결 테스트·브라우저 검증을 뜻하지 않는다.

