# 지역 지도 v2 이미지 생성 · 2026-11-11

- 요청: `codex-art-request-2026-11-11-region-maps-9x14.md`.
- 내장 image_gen으로 지역별 1장씩 생성. 기존 지역 지도 v1을 각각 참고 이미지로 제공하고 승인된 TURNTALE 2D 카툰 스타일 적용.
- 결과: `public/story/region-{2,3,4}-map-portrait-v2.png`와 같은 이름의 `.webp` (각 1024×1600).
- v1 보존. 이번 작업은 이미지 파일 생성만 수행. 앱 연결·좌표·CSS 수정, 빌드·커밋·push·배포 없음. 작업 시작 git pull: Already up to date, package.json 0.7.13. 기존 미커밋 소스 보존.
- 생성 원본은 1003×1568. 가로세로 같은 비율로 폭 1024에 맞춘 뒤 높이 1600으로 중앙 크롭. 비율 왜곡 없음. WebP quality 88 / effort 6.
- 시각 확인: 3장 모두 밤 분위기·기존 장소·연결된 길 유지, 문자·마커·눈 없음. 생성 모델의 장소 위치는 요청 좌표와 완전히 일치하지 않음. 앱 연결 때 실제 그림 기준 좌표 보정과 휴대폰 화면 검증 필요. 특히 왕관 지역 탁자는 요청 y44%보다 아래(y48% 부근).
- 이번 검증: PNG·WebP 6개 파일 디코딩과 1024×1600 크기 확인. 앱 실행·타입 검사·전체 테스트는 이미지 생성 범위에서 수행하지 않음.

## 최종 프롬프트

전체 실제 전달 프롬프트는 `art-generation-region-maps-v2-2026-11-11.json`에 보존한다.

공통: hand-drawn 2D cartoon fantasy game map; expressive irregular black ink outlines; two or three clear cel-shading values; restrained painted texture; readable indigo night, slate stone, moss and small amber lights. Compact portrait 1024×1600. Original architecture and connected paths preserved. No text, labels, markers, watermarks, people or snow. Important landmarks within x10–90%, y7–93%; crop-safe clouds/rocks/trees around edges.

- Region 2: waterfall table (69,60), drying papers (14,61), bridge rest table (49,40), rope knot post (86,33), colonnade/purple banners (61,14), ruined archive (15,18), boathouse (78,84). Continuous waterfall → bridge → colonnade path with short branches.
- Region 3: silver ancient tree/blue lanterns (50,84), letter archive (85,54), white-pillared sanctuary/golden trees (59,32), last-ember ruin (15,21), ash altar (56,11). Continuous tree → sanctuary → altar path. Remove snow from all terrain and structures.
- Region 4: enormous red world tree, round meeting table/plaza, braziers, continuous winding stair approach. Destination requested at (50,44). Remove snow throughout.
