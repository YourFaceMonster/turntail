# 설정·지도·주점·이벤트 그림 전달 · 2026-11-16

요청서: `codex-art-request-2026-11-16-settings-maps-inn-events.md`. 생성 도구: built-in image_gen. PC 로컬에서 그림만 추가하며 앱 연결은 요청서에 따라 Claude가 진행한다. 빌드·커밋·push·배포 없음. 시작 `git pull --ff-only origin main`: Already up to date. 로컬 버전 0.7.32. 기존 미커밋 코드/그림 유지.

## 완료: 29종 / PNG·WebP 58개

- B 지도 3장: `public/story/region-{2,3,4}-map-portrait-tall-v1.png`와 `.webp`, 각각 1024×1820. 원본을 y=220에 그대로 보존. PNG와 **lossless WebP 모두** 아래 1024×1600 영역이 원본과 픽셀 단위 동일함을 이번 비교로 확인. 원본 해시와 비교 결과는 아래 validation.json. 위쪽만 image_gen 결과 사용.
- C 프로필 2장: `public/story/inn-portrait-{otter,cat}-v1.png`와 `.webp`, 각각 512×512. 주점의 수달/검은 고양이를 참조한 선명한 프로필.
- D1: `public/story-events/st4-record-scene-{portrait,wide}-v1` PNG/WebP. 빈 가죽 칸 3개, 기존 `st4-fragment-1~3` 그대로 겹침.
- D2: `public/story-events/st5-knots-scene-{portrait,wide}-v1` PNG/WebP와 `st5-knot-{loose,tight}-v1` PNG/WebP(512×512, 투명). 배경에 매듭이 없으므로 상태별 sprite를 겹침.

- D3: `public/story-events/st8-sanctuary-scene-{portrait,wide}-v1` PNG/WebP, `st8-trace-{letters,stars,box}-v1` PNG/WebP(768×768). 편지함·별자리판·봉인 상자와 확대 단서 3장. 봉랍 왕관, 철문/성화, 쌍열쇠 문양을 확인했다.
- D4: `public/story-events/st9-altar-scene-{portrait,wide}-v1`, `st9-altar-lit-{portrait,wide}-v1` PNG/WebP. 빈 제단/완성 제단 4장. `st9-disc-{crown,gate}-v1` PNG/WebP(512×512, 투명) 2장. 완성 배경은 원판이 포함되어 있으므로 전환 시 앱의 원판 sprite는 숨긴다.
- A: `public/ui/settings-header-v1` PNG/WebP(1200×420), `settings-icon-{music,sound,screen,vibration,pace}-v1` PNG/WebP(256×256, 투명), `settings-panel-texture-v1` PNG/WebP(512×512). 총7종. 헤더 아래쪽은 어둡게 비웠고, 아이콘은 같은 나무 배지로 통일했다.

이벤트 장면 8장과 ST9 완성 장면 2장은 세로1024×1536 / 가로1672×941. 총합은 지도3·프로필2·이벤트17·설정7=29종이다. 파일 목록은 manifest.json/validation.json에 전부 있다.

## 클릭·배치 좌표 JSON

모두 전체 이미지 기준 %, 왼쪽 위 원점이다. 실제 화면에서 이미지에 적용한 object-fit·크롭 오프셋을 클릭 영역에도 동일하게 반영한다. 단순히 viewport의 %로 처리하면 안 된다.

- `docs/st4-record-v1-hit-areas.json`: 세로/가로 빈 칸3개. 조각은 기존900×280 비율을 유지해 칸 안에 contain으로 넣는다.
- `docs/st5-knots-v1-hit-areas.json`: 세로/가로 기둥3개 중심과 sprite 캔버스 크기. 두 매듭 상태는 같은512×512 캔버스를 유지하고 알파 영역에 맞춰 자동 자르지 않는다. 밧줄 연결점은 로컬y50%다.
- `docs/st8-sanctuary-v1-hit-areas.json`: 세로/가로 물건3개 클릭 범위와 확대 그림 경로.
- `docs/st9-altar-v1-hit-areas.json`: 세로/가로 홈2개 중심과 실제 원형 지름, 원판·완성 배경 경로. 원판 이미지에는 투명 여백이 있어 visible 지름 기준으로 배율을 정한다. 정확한 alpha_bbox_128은 validation.json에 있다(왕관26,29,484,492 / 철문26,28,484,491).

좌표를 그린 `*-hits.jpg` 8장과 매듭/원판을 실제 좌표에 겹친 `*-sprite-demo.jpg` 4장을 생성하고 그림과 대조했다. 375px 이미지 폭 기준 모든 지정 클릭 영역의 가로 폭은60px 이상이며, 실제 앱에서는 축소/크롭 후 최소 터치 크기를 다시 확보한다.

## 생성·검증 기록

- 전체 최종 프롬프트·참조·원시 생성 경로: `artifacts/settings-maps-inn-events-2026-11-16/manifest.json`.
- 원시 생성 PNG 보존: 같은 폴더의 `*-generated.png`.
- 저장/크기/투명도/원본 픽셀 보존 검사: 같은 폴더의 `validation.json`, 재실행 도구 `save-assets.py`.
- 이번 최종 검사: 29개 PNG +29개 WebP 디코딩·지정 크기 확인, 투명 요청9종의 PNG/WebP 알파 확인, 지도3종 PNG/WebP 원본 영역 비교 통과. 각 최종 파일 SHA-256과 크기/바이트도 기록했다. 원시 생성 크기가 다른 결과는 Lanczos로 지정 크기에 변환했다.
- 좌표 수치·실제 overlay 미리보기·아이콘28/48px·나무결2×2 반복 확인: `verify-delivery.py`, `qa-summary.json`, `story-events-contact.jpg`, `ui-contact.jpg`, `story-contact.jpg`, `settings-small-icons.png`, `texture-repeat.jpg`. 나무결은 매우 어둡지만 상하 경계가 수학적으로 동일한 타일은 아니다(평균 RGB 차이 약13.34/9.05/7.07, 0~255). 반복 시 어두운 판자 이음으로 보이는 정도를 확인했으며, 실제 설정창의 글자·배경 강도는 앱 연결 때 확인한다.
- 지도 경계 육안 확인: `map-seams.jpg`. 생성 그림 육안 검수 후 요청 해상도로 변환. 실제 앱 연결·터치·모바일 화면은 아직 확인하지 않음.
- 지도 위치 변환: 새 y% = (220 + 기존 y% × 16) / 18.2. x%는 그대로.

## Claude 연결 상태

앱 코드 경로 연결은 아직 하지 않았다. 요청서의 마지막 연결 작업(B 지도 배치/좌표, C 프로필 경로, D StoryPuzzle 화면, A 설정창)을 이 결과로 진행하면 된다. 테스트·빌드·커밋·push·Cloudflare 배포 없이 PC 로컬 저장만 했다. 기존 코드 변경6파일과 기존 원본/임시 그림은 수정·삭제하지 않았다. 이번 Git diff 공백 검사는 오류 없이 끝났으나 앱 동작·모바일 터치는 검증하지 않았다.
