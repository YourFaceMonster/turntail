# 성화의 영역 지도 길 연결 · 로컬

2026-11-11 사용자 이미지 생성 요청으로 Claude의 `codex-art-request-2026-11-11-maps-closeups.md` A를 반영했다. 시작 시 PC 체크아웃에서 `git pull --ff-only origin main`: Already up to date. 버전 0.7.12와 기존 미커밋 작업을 보존했다.

- 2차 검수 6장은 `local-art-consistency-2026-11-11.md`에 이미 완료 기록이 있어 재생성하지 않았다. 선택 B의 클로즈업 7장도 생성하지 않았다.
- built-in image_gen으로 지역 2 세로 지도 1장을 다시 그렸다. 기존 지역 2 지도와 지역 1 지도를 참조했으며 승인된 2D 카툰 스타일을 적용했다.
- 폭포 탁자 → 왼쪽 계단 → 다리 중앙 쉼터 → 다리 오른쪽 → 위쪽 회랑으로 실제 그림 속 길을 연결했다. 기록실과 나룻배 창고에도 길을 연결했다.
- 원본 생성 크기는 941×1672다. 자르기나 늘리기 없이 PNG를 복사하고 WebP(quality 86)를 만들었다. 앱 경로는 `public/story/region-2-map-portrait-v1.png/.webp`를 유지한다.
- 교체 전 PNG·WebP는 `artifacts/region-2-map-paths-2026-11-11/before/`, 생성본은 같은 폴더의 `region-2-map-portrait-v2.png`에 보존했다. 프롬프트는 `generation.json`에 기록했다.
- 새 그림에 맞춰 `lib/rpg-journey.ts` 지역 2 세로 장소 좌표를 조정했다. `RpgJourneyScene.tsx`의 지역 2 세로 점선은 두 장소 사이 직선 대신 그림의 계단·다리 양 끝을 따라간다. 가로 액자 화면도 기존처럼 세로 경로를 사용한다.

이번 검증: 타입 검사 통과. 전체 테스트 397개 중 379 통과·실패 0·건너뜀 18, 같은 artifacts 폴더의 `tests.log`에 기록했다. `git diff --check` 통과(줄바꿈 경고만). 로컬 개발 서버의 새 WebP HTTP 200·image/webp·374130 bytes를 확인한 뒤 이번에 시작한 서버를 종료했다. UI 제어 도구의 브라우저 연결 목록이 비어 있어 375×812·360×800 실제 앱 화면 검증은 수행하지 못했다. 생성 그림은 직접 확인했다. 기존 6장 검증 기록을 이번 지도 화면 검증으로 간주하지 않는다.

버전 올림·빌드·커밋·push·배포 없음. 로컬 저장만 수행했다.
