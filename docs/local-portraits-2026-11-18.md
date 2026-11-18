# 쌍둥이·하로 얼굴 생성 (로컬)

- 기준: 0.7.35 / GitHub main과 일치한 로컬 체크아웃. 사용자 요청에 따라 built-in image_gen으로 생성.
- 요청서: `docs/codex-art-request-2026-11-17-twin-portraits.md`.
- 쌍둥이: `public/rpg-twins-v2.png`, `public/rpg-twins-v2.webp` (1024×512). 왼쪽 첫째, 오른쪽 둘째. ST3 기존 장면의 인물과 승인된 카툰 화풍을 참조. 초기 원형 바깥 검은 영역은 최종 생성에서 회랑 배경으로 교체.
- 하로: `public/avatars/haro-v1.png`, `public/avatars/haro-v1.webp` (512×512). 주사위 창고 장면의 인물과 의상을 참조.
- 기존 쌍둥이 원본 보존. 생성 원본과 프롬프트: `artifacts/portraits-2026-11-18/`. 이미지 내용은 image_gen으로 제작, 크기 조정과 PNG/WebP 출력은 sharp 사용.
- 연결: `app/globals.css`의 쌍둥이 공통 얼굴, `app/components/YachtDiceTable.tsx`의 하로 임시 얼굴 교체.
- 시각 확인: 최종 생성물 및 48px·58px·160px 원형 크롭 미리보기 직접 확인 (`avatar-crops.png`). 실제 모바일 화면 조작은 미실시.
- 이번 검증: `tsc --noEmit --incremental false` 통과, `git diff --check` 통과. PNG·WebP 출력 크기 확인.
- 빌드·버전 변경·커밋·push·배포 없음.

최종 프롬프트 전문은 `artifacts/portraits-2026-11-18/prompts.json`에 보존.

## Claude 확인 (2026-11-18)
- 그림 2장과 원형 크롭 미리보기를 직접 봄: 쌍둥이(왼쪽 첫째 수염·풀어 내린 머리, 오른쪽 둘째 묶은 머리)는 ST3 장면과 같은 인물, 하로는 주사위 창고 장면과 같은 모자·목도리·웃음.
- 쌍둥이 CSS를 확인하는 기존 테스트(tests/josa-faces-2026-11-17.test.tsx)를 v2 주소로 고침. 전체 테스트 433개·타입 검사 통과.
- 브라우저 실제 화면 확인은 못 함(점검 브라우저 창이 숨겨져 열리지 않음).
- 미배포. 배포 시 0.7.36.
