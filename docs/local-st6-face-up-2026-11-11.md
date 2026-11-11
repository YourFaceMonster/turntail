# ST6 대결 전 패 앞면 문양 · 로컬 수정

2026-11-11 Claude 후속 검수의 민짜 패 지적에 대해 사용자가 왕관·철문·성화·열쇠 네 문양 적용을 승인했다. PC 체크아웃에서 `git pull --ff-only origin main`은 Already up to date. 버전 0.7.12와 다른 미커밋 작업을 보존했다.

- built-in image_gen으로 ST6 대결 전 그림의 패 윗면만 수정했다. 왼쪽 뒤 왕관, 왼쪽 앞 철문, 오른쪽 뒤 성화, 오른쪽 앞 열쇠다. 두꺼운 크림색 돌 패 4장, 철갑 수호자·은발 깃발지기·배경·원+십자 장식을 유지했다.
- 문양 기준은 이미 승인된 `true-ending-village-portrait-v1.png`다. `public/story/st6-before-portrait-v1.png/.webp` 경로에 적용해 기존 장면에서 사용한다. 코드 수정 없음.
- 교체 전 PNG·WebP와 생성 원본 v3·프롬프트는 `artifacts/st6-face-up-2026-11-11/`에 보존했다. 생성본 941×1671의 높이 1px만 941×1672로 맞췄고 WebP quality 86으로 저장했다.
- 이번 검증: 생성 그림 직접 확인, 적용 PNG·WebP 941×1672 디코딩 확인, 관련 `tests/rpg-chapters.test.tsx` 8개 모두 통과. 로그는 같은 artifacts 폴더의 `tests.log`. 전체 테스트·타입 검사·브라우저 화면 검사는 이번에 실행하지 않았다.

로컬 저장만 했다. 빌드·버전 올림·커밋·push·배포 없음.
