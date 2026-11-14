# 가로 화면·프로필·오늘의 판 이미지 47장 · 2026-11-14 (로컬 미게시)

요청서: `codex-art-request-2026-11-14-landscape.md`(44장), `codex-art-request-2026-11-14-daily-result.md`(3장).

PC 로컬에서 Git 상태·버전 0.7.25 확인 후 `git pull --ff-only origin main` 실행(Already up to date). 기존 Claude 미커밋 수정·삭제 파일을 보존하고, 이번 작업은 이미지와 인계 기록만 추가했다. built-in `image_gen`과 승인된 TURNTALE 카툰 판타지 스킬을 사용했다.

## 결과와 규격

- 스테이지·엔딩 16장, 지도 3장, 서브퀘스트·장소 8장, 영역 이동 6장, 특별 패 장면 7장: 총 40장. `public/story/`, PNG·WebP 모두 1672×941.
- 기본 프로필 4장: `public/avatars/fox-v1`, `owl-v1`, `tiger-v1`, `panda-v1`. PNG 512×512, 앱용 WebP 256×256.
- 오늘의 판 결과 3장: `public/ui/daily-result-win-v1`, `daily-result-mid-v1`, `daily-result-practice-v1`. PNG·WebP 모두 1600×640.
- 총 PNG 47개 + WebP 47개, 94개 파일. 전체 파일 목록·크기·해시: `artifacts/landscape-2026-11-14/validation.json`. 요청 이름 누락 0개, 해상도 검사 전체 통과.

## 이번 시각 검수

세로 원본을 보고 같은 장면을 가로로 새로 그렸다. 기존 그림의 단순 가로 늘리기·잘라 쓰기·액자 배치는 사용하지 않았다. 인물 수·종족·복장·소품·시간대와 하단 대사 공간을 비교했다. 소스별 나란히 비교본을 저장했다. 마지막 인물·동물 프로필과 특별 패 확대본까지 직접 확인했다.

오늘의 판은 같은 주점·탁자·빈 칠판·창문 배치를 유지하고 승리/일반/연습 분위기를 달리했다. 초기 그림보다 소품을 위로 올리고 아래 45%를 어둡고 단순하게 비우는 보정을 했다. 사람 얼굴·글자·숫자는 넣지 않았다.

왕관 영역 지도 초안에 참조용 마을 건물이 섞여 제거했다. 최종은 붉은 세계수·두 왕좌·탁자·계단 길만 남겼다. 지도 위치는 생성상 오차가 있어 아래 실제 중심 좌표를 Claude 연결 기준으로 제공한다.

## 지도 실제 중심 좌표

왼쪽 위를 기준으로 가로%·세로%. 그림을 보고 지정한 아이콘 권장 중심이다. `map-centers.json`과 각 `*-centers.jpg`에 좌표를 표시했다.

| 지도 | 장소 | 가로% | 세로% |
|---|---|---:|---:|
| region-2-map-wide-v1 | ST4 물안개 폭포 | 38 | 78 |
| region-2-map-wide-v1 | ST5 구름다리 쉼터 | 54 | 49 |
| region-2-map-wide-v1 | ST6 수호자의 회랑 | 58 | 24 |
| region-2-map-wide-v1 | quest-4 물에 젖은 기록 | 24 | 62 |
| region-2-map-wide-v1 | quest-5 끊긴 매듭 | 72 | 62 |
| region-2-map-wide-v1 | quest-6 잊힌 맹세 | 27 | 31 |
| region-2-map-wide-v1 | dice-den 안개 나루 주사위판 | 84 | 38 |
| region-2-map-wide-v1 | inn-2 안개 나루 주점 | 15 | 79 |
| region-3-map-wide-v1 | ST7 달빛 고목 | 41 | 81 |
| region-3-map-wide-v1 | ST8 별빛 성소 | 59 | 45 |
| region-3-map-wide-v1 | ST9 잿불 제단 | 59 | 17 |
| region-3-map-wide-v1 | quest-8 전해지지 못한 편지 | 81 | 58 |
| region-3-map-wide-v1 | quest-9 마지막 불씨 | 28 | 32 |
| region-3-map-wide-v1 | inn-3 달빛 등불 주점 | 22 | 78 |
| region-4-map-wide-v1 | ST10 붉은 세계수 | 52 | 39 |

## 특별 패 검수

승인된 `public/story-cards/*-front-special-v1.png` 또는 짝 뒷면을 생성 참조로 넣었다. 얇은 실물 카드 크기와 몸통 폭:높이 약0.72를 기준으로 했다. 성화 앞뒤·열쇠 앞뒤·엔딩 전달은 좁게 나온 초안의 카드 폭을 보정했다. 손가락 가림과 잡는 위치를 확인했다. 일반 패에 특별 프레임을 적용하지 않았다. 일반 글자·숫자는 제외했으며, 승인된 특별 패 앞면의 숫자2는 유지했다.

실제 확대 측정 자료: `artifacts/landscape-2026-11-14/card-measurements.json`·`.jpg`. 정면에 가까운 성화·열쇠·전달 패의 투영 가장자리 비율은 약0.70~0.73이다. 탁자에 누운 카드와 부채꼴로 잡힌 카드는 원근·가림 때문에 화면 비율이 다르며, 그 측정값을 실물 비율이라고 단정하지 않았다. 원본·확대본에 근거한 수동 꼭짓점 추정이다.

## 생성·검증 기록

- `artifacts/landscape-2026-11-14/manifest.json`: 최종 프롬프트, 참조, 생성 원본 경로, 보정 이력. `jobs/`는 최초 완료별 기록, `corrections/`는 최종 우선 적용 기록이다.
- 같은 폴더 `*-generated.png`: 도구가 만든 원본. 보정 전 원본·중간본도 `*-initial-generated.png` 및 `*-rejected-*`로 보존.
- `compare-*.jpg`: 세로 원본과 최종 가로 그림 비교. `contact-story-1~5.jpg`, `contact-avatar-1.jpg`, `all-47-preview.jpg`: 모아보기.
- `map-centers.json`·`*-centers.jpg`: 지도 연결용 좌표와 위치 표시.
- `card-measurements.json`·`.jpg`: 특별 패 확대와 투영 비율 추정.
- `validation.json`, `final-validation.json`: 파일 크기·해시·47장 규격과 누락 검사.
- `artifacts/daily-result-2026-11-14/`: 결과 화면 3장의 프롬프트·검증·원본·기준 비교·`contact-daily-1.jpg`.

## Claude 후속 연결

요청서대로 앱 연결은 Claude가 담당한다. 앱 참조는 WebP를 쓴다. 가로 스테이지·퀘스트·이동·지도 경로, `STORY_CARD_CHAPTER_ART`의 가로 경로, 동물 기본 프로필, 오늘의 판 결과 이미지 선택을 연결한다. 지도 좌표는 위 실제 좌표표를 사용하고 CSS object-fit/표시 영역에 맞춰 실제 앱에서 확인한다.

이번 작업에서 앱 코드·버전은 변경하지 않았고, 앱 테스트·빌드·커밋·push·배포는 실행하지 않았다. 이미지 파일과 비교 검증만 수행했으며 실제 앱 화면 검수는 연결 후 Claude가 진행해야 한다.

## 전체 파일 목록

| 이름 | 저장 폴더 |
|---|---|
| `cross-10-border-wide-v1` | `public/story/` |
| `cross-10-depart-wide-v1` | `public/story/` |
| `cross-4-border-wide-v1` | `public/story/` |
| `cross-4-depart-wide-v1` | `public/story/` |
| `cross-7-border-wide-v1` | `public/story/` |
| `cross-7-depart-wide-v1` | `public/story/` |
| `daily-result-mid-v1` | `public/ui/` |
| `daily-result-practice-v1` | `public/ui/` |
| `daily-result-win-v1` | `public/ui/` |
| `dice-den-wide-v1` | `public/story/` |
| `ending-handoff-wide-special-v1` | `public/story/` |
| `ending-kings-wide-v1` | `public/story/` |
| `ending-thrones-wide-v1` | `public/story/` |
| `fox-v1` | `public/avatars/` |
| `inn-2-wide-v1` | `public/story/` |
| `inn-3-wide-v1` | `public/story/` |
| `owl-v1` | `public/avatars/` |
| `panda-v1` | `public/avatars/` |
| `quest-4-wide-v1` | `public/story/` |
| `quest-5-wide-v1` | `public/story/` |
| `quest-6-wide-v1` | `public/story/` |
| `quest-8-wide-v1` | `public/story/` |
| `quest-9-wide-v1` | `public/story/` |
| `region-2-map-wide-v1` | `public/story/` |
| `region-3-map-wide-v1` | `public/story/` |
| `region-4-map-wide-v1` | `public/story/` |
| `st10-after-wide-v1` | `public/story/` |
| `st10-before-wide-v1` | `public/story/` |
| `st4-after-wide-v1` | `public/story/` |
| `st4-before-wide-v1` | `public/story/` |
| `st5-after-wide-v1` | `public/story/` |
| `st5-before-wide-v1` | `public/story/` |
| `st6-after-wide-v1` | `public/story/` |
| `st6-before-wide-v1` | `public/story/` |
| `st6-flame-two-back-wide-special-v1` | `public/story/` |
| `st6-flame-two-wide-special-v1` | `public/story/` |
| `st7-after-wide-v1` | `public/story/` |
| `st7-before-wide-v1` | `public/story/` |
| `st8-after-wide-v1` | `public/story/` |
| `st8-before-wide-v1` | `public/story/` |
| `st9-after-wide-v1` | `public/story/` |
| `st9-before-wide-v1` | `public/story/` |
| `st9-key-two-back-wide-special-v1` | `public/story/` |
| `st9-key-two-wide-special-v1` | `public/story/` |
| `tiger-v1` | `public/avatars/` |
| `true-ending-record-wide-special-v1` | `public/story/` |
| `true-ending-village-wide-special-v1` | `public/story/` |
