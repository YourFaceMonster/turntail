# 컷씬 묶음 2·3 전달 · 2026-11-17 (로컬 미게시)

기준 요청서: [codex-art-request-2026-11-16-cutscene-tiles.md](codex-art-request-2026-11-16-cutscene-tiles.md).
예전 `turntail_claude.md`는 이번 제작 지시로 사용하지 않았다.

## 이번 산출물과 상태

- 묶음 2: ST4~10 섞기 7장면 × 세로·가로 = 14장.
- 묶음 3: ST4~10 결과 7장면 × 세로·가로 = 14장.
- 합계 28장, 원본 PNG + 앱용 WebP **56파일**을 `public/story/`에 새 이름으로 저장했다.
- PC 로컬에서 작업. 시작 `git pull --ff-only origin main`: Already up to date. 현재 앱 버전 `0.7.33` 유지.
- 기존 그림·코드·미커밋 작업 보존. **앱 연결·빌드·커밋·push·배포 없음.**
- 실제 앱·모바일 화면 확인은 하지 않았다. 아래 검수는 이미지 파일 자체에 대한 것이다.
- 생성 도구: built-in image_gen. `imagegen` 및 `turntale-cartoon-fantasy` 스킬 적용.
- 사용자 후속 확정: 묶음 4는 요청서 인물별 표 전체 기준 **37표정 × 2 = 74장**. 요청서 본문의 34표정/68장 합계 오기를 따른 수량이 아니다. 이 전달 이후 묶음 4도 완료했고 [별도 전달 기록](codex-art-delivery-2026-11-17-cutscene-tiles-batch4.md)에 정리했다.

## 저장·검수 기록

- 최종 크기: 세로 1024×1536, 가로 1672×941. 원시 생성 크기가 다른 경우 Lanczos로 요청 크기에 맞췄다. 원시 생성 PNG도 별도 보존.
- 원시 생성본·프롬프트·참고 그림·출력 파일 매핑: `artifacts/cutscene-tiles-2026-11-17-batch2-3/manifest.json`.
- 크기·디코딩·SHA-256: 같은 폴더의 `validation.json`.
- 비교용 모음: 같은 폴더의 `contact-1.jpg` ~ `contact-4.jpg`.
- 앞면은 큰 숫자 위·작은 문양 아래. 결과 장면의 읽히는 앞면은 빨강 9/왕관, 초록 7/열쇠로 정했고 같은 숫자·문양 조합을 장면 안에 중복하지 않았다. 이야기 특별 패는 추가하거나 수정하지 않았다.
- 뒷면: ST4 푸른 수정/마름모, ST5 규화목 나이테/둥근 새김, ST6 짙은 현무암/방패·초록 테, ST7 남색 월장석/흰 나무, ST8 호박석/별, ST9 흑요석/불꽃, ST10 붉은 세계수 목재/나무.
- 생성본을 기준 장면·인게임 패 화면과 육안 대조했다. 인물·복장·주요 장소와 조명, 패 앞뒤·숫자·문양·색 짝, 아래 자막 영역을 확인했다.
- ST6 결과에서 카르덴은 서 있으며 투구를 유지한다. ST9 결과는 마지막 패를 덮고 제단 불씨가 잦아든다. ST10 결과는 첫 번째 수호자(왼쪽)의 놀람과 마지막 패를 보여 주며 책·기록은 넣지 않았다.
- 새 동작의 생성 그림이므로 기준 그림과 픽셀 단위로 동일하지 않다. 실제 화면에서 자막 가림·축소 판독성·가로 크롭은 Claude 연결 후 별도 확인이 필요하다.
- Python/Pillow는 생성 후 크기·포맷 변환, 해시·디코딩 검사 및 검수용 모음에만 사용했다.

## Claude 연결 목록

아래 WebP와 같은 이름의 PNG가 함께 있다. `public/` 기준 경로이며 **아직 연결하지 않았다**.

| 스테이지 | 연결 위치 | 방향 | 새 앱용 파일 |
|---|---|---|---|
| ST4 | before 중간 줄 · 섞기 | 세로 | `story/st4-shuffle-portrait-v1.webp` |
| ST4 | before 중간 줄 · 섞기 | 가로 | `story/st4-shuffle-wide-v1.webp` |
| ST4 | after 첫 줄 · 결과 | 세로 | `story/st4-result-portrait-v1.webp` |
| ST4 | after 첫 줄 · 결과 | 가로 | `story/st4-result-wide-v1.webp` |
| ST5 | before 중간 줄 · 섞기 | 세로 | `story/st5-shuffle-portrait-v1.webp` |
| ST5 | before 중간 줄 · 섞기 | 가로 | `story/st5-shuffle-wide-v1.webp` |
| ST5 | after 첫 줄 · 결과 | 세로 | `story/st5-result-portrait-v1.webp` |
| ST5 | after 첫 줄 · 결과 | 가로 | `story/st5-result-wide-v1.webp` |
| ST6 | before 중간 줄 · 섞기 | 세로 | `story/st6-shuffle-portrait-v1.webp` |
| ST6 | before 중간 줄 · 섞기 | 가로 | `story/st6-shuffle-wide-v1.webp` |
| ST6 | after 첫 줄 · 결과 | 세로 | `story/st6-result-portrait-v1.webp` |
| ST6 | after 첫 줄 · 결과 | 가로 | `story/st6-result-wide-v1.webp` |
| ST7 | before 중간 줄 · 섞기 | 세로 | `story/st7-shuffle-portrait-v1.webp` |
| ST7 | before 중간 줄 · 섞기 | 가로 | `story/st7-shuffle-wide-v1.webp` |
| ST7 | after 첫 줄 · 결과 | 세로 | `story/st7-result-portrait-v1.webp` |
| ST7 | after 첫 줄 · 결과 | 가로 | `story/st7-result-wide-v1.webp` |
| ST8 | before 중간 줄 · 섞기 | 세로 | `story/st8-shuffle-portrait-v1.webp` |
| ST8 | before 중간 줄 · 섞기 | 가로 | `story/st8-shuffle-wide-v1.webp` |
| ST8 | after 첫 줄 · 결과 | 세로 | `story/st8-result-portrait-v1.webp` |
| ST8 | after 첫 줄 · 결과 | 가로 | `story/st8-result-wide-v1.webp` |
| ST9 | before 중간 줄 · 섞기 | 세로 | `story/st9-shuffle-portrait-v1.webp` |
| ST9 | before 중간 줄 · 섞기 | 가로 | `story/st9-shuffle-wide-v1.webp` |
| ST9 | after 첫 줄 · 결과 | 세로 | `story/st9-result-portrait-v1.webp` |
| ST9 | after 첫 줄 · 결과 | 가로 | `story/st9-result-wide-v1.webp` |
| ST10 | before 중간 줄 · 섞기 | 세로 | `story/st10-shuffle-portrait-v1.webp` |
| ST10 | before 중간 줄 · 섞기 | 가로 | `story/st10-shuffle-wide-v1.webp` |
| ST10 | after 첫 줄 · 결과 | 세로 | `story/st10-result-portrait-v1.webp` |
| ST10 | after 첫 줄 · 결과 | 가로 | `story/st10-result-wide-v1.webp` |

## 연결 시 유지할 사항

`lib/rpg-chapter-scenes.ts`에서 before 가운데 줄에 shuffle, after 첫 줄에 result를 연결한다. 기존 대사는 그대로 두며 ST6·ST9 특별 패 장면 순서를 바꾸지 않는다. preload와 실제 세로/가로 화면 확인은 연결 담당 작업이다. 이 문서는 연결·배포 완료 기록이 아니다.

