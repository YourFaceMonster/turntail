# 특별한 이야기 패 컷씬 적용 · 2026-11-12 (로컬)

## 결과

사용자가 승인한 특별한 이야기 패 4종을 기준으로 앞뒤 그림과 등장 컷씬을 연결했다. 기존 일반 패와 구별되는 황동 테두리·문양·색을 유지한다. 버전은 0.7.15 그대로이며 빌드·커밋·push·배포 없이 PC 로컬에 저장했다.

- 사용자 확정 기준: [이야기 패 디자인 관리](story-keepsake-art-guide.md).
- 시작 상태: main / HEAD `6004cb6`, `git pull --ff-only origin main` → Already up to date. 기존 `app/page.tsx`, `tests/landscape-stacked.test.ts` 수정과 `.claude/`, 기존 artifacts·생성본 보존.
- 이번 생성: 컷씬 21장(프롤로그·ST3 7쌍 = 14장, ST6/ST9 앞뒤 발견 4장, 엔딩 3장), 뒷면 4종, 철문 앞면 투명 분리 1장. 각각 PNG와 WebP를 함께 저장(총 26쌍). 이전에 승인한 앞면 4종은 그대로 보존.
- 내장 `image_gen` 사용. 편집 대상 장면과 승인 패 PNG를 함께 참조. CLI/API 대체 사용 없음. [컷씬 최종 프롬프트·입력·출력](../artifacts/story-keepsakes-scenes-2026-11-12/scene-manifest.json), [뒷면·투명 앞면 프롬프트](../artifacts/story-keepsakes-scenes-2026-11-12/back-manifest.json).
- 진엔딩 마을의 첫 생성은 특별 왕관 중복·특별 철문 누락으로 제외하고 재생성. 최종본은 손에 든 왕관 2, 탁자 위 철문 2·성화 2·열쇠 2를 한 장씩만 표시하고 나머지 일반 패는 소박하게 유지.
- 엔딩 전달 컷의 기존 초승달은 승인된 왕관 2로 교체해 실제 대사·아이템 정의와 맞춤.
- 성화·열쇠를 뒤집는 대사는 각각 `st6-flame-two-back`, `st9-key-two-back` 새 그림으로 전환. 대사 내용·저장 규칙·게임 규칙 변경 없음.

## 연결 위치

- `lib/rpg-story-card-art.ts`: 이야기 패 앞뒤, 프롤로그·ST3 그림 쌍, ST6/ST9·엔딩 그림 경로 공통 목록.
- `lib/rpg-prologue-art.ts`, `lib/rpg-prologue.ts`: 기본 그림·대사 자세·앞뒤·돌기둥 비교·그림 예열.
- `lib/rpg-connection-scenes.ts`: ST3 수령·앞뒤 확대·나란한 뒷면 비교. 앞선 쌍둥이 대사·기록 컷 유지.
- `lib/rpg-chapters.ts`, `lib/rpg-chapter-scenes.ts`: 발견·뒤집기·엔딩. ST4~10의 기존 가로 화면 정책(세로 그림을 프레임에 표시) 유지.
- 도감은 기존 `StoryCardCollection`이 공통 목록을 사용해 앞뒤 모두 변경됨. 철문 앞뒤는 기존 ST3 확대 연출을 위한 alpha 유지.
- 루트 `AGENTS.md`에 승인 참조·차별화 원칙·관리 문서 위치 기록. 사이트 README에 이번 로컬 상태 링크.
- 앞선 단순 색 수정 17장은 생성 이력으로 보존하고 이번 적용에는 연결하지 않음. 일반 승부 패·깃발·문서 문양에 특별 패 장식을 퍼뜨리지 않음.

## 이번 검증

- 관련 6개 파일 **32검사 통과 / 실패 0**. 도감 렌더, ST3 앞뒤 예열·alpha·화면비, 장면 전환, 여정 회귀 검증 포함. 이번 추가 회귀 검사는 ST6/ST9 ‘뒤집기’ 대사에서 실제 뒷면 그림으로 전환하고 동일 장소에서 겹쳐 전환하는지 확인.
- 최종 타입 검사 `tsc --noEmit` 통과. `git diff --check` 통과.
- 기존 컷씬 원본 19개는 Git HEAD의 파일 바이트와 SHA-256 일치 확인. 새 컷씬 21쌍 모두 원본과 최종 PNG/WebP 크기 일치. 뒷면 4종·철문 앞면 분리의 PNG/WebP alpha 확인.
- 생성 크기에서 1픽셀 작은 다섯 출력(돌기둥 세로/가로, 성화 발견 앞/뒤, 열쇠 발견 뒤)은 원본 크기로 리샘플링. 상세는 [파일 검증](../artifacts/story-keepsakes-scenes-2026-11-12/scene-validation.json).
- 생성 결과 전체·원본/수정본 비교 시트 4장·대표 장면 390×844 정적 미리보기를 직접 검토. 실제 앱 브라우저 클릭·실기기 플레이는 이번에 하지 않음. 이전 테스트/배포 결과를 이번 검증으로 사용하지 않음.
- [테스트 로그](../artifacts/story-keepsakes-scenes-2026-11-12/tests.log), [검증 요약](../artifacts/story-keepsakes-scenes-2026-11-12/verification-summary.json).
- [비교 1](../artifacts/story-keepsakes-scenes-2026-11-12/comparison-1.jpg), [비교 2](../artifacts/story-keepsakes-scenes-2026-11-12/comparison-2.jpg), [비교 3](../artifacts/story-keepsakes-scenes-2026-11-12/comparison-3.jpg), [비교 4](../artifacts/story-keepsakes-scenes-2026-11-12/comparison-4.jpg), [휴대폰 크기 미리보기](../artifacts/story-keepsakes-scenes-2026-11-12/phone-preview.jpg).

## 컷씬 파일 목록

| # | 원본 (public/) | 새 PNG (public/) | 앱용 WebP |
|---|---|---|---|
| 1 | `prologue/tile-front-portrait-crown-v1.png` | [prologue/tile-front-portrait-crown-special-v1.png](../public/prologue/tile-front-portrait-crown-special-v1.png) | [WebP](../public/prologue/tile-front-portrait-crown-special-v1.webp) |
| 2 | `prologue/tile-front-landscape-crown-v1.png` | [prologue/tile-front-landscape-crown-special-v1.png](../public/prologue/tile-front-landscape-crown-special-v1.png) | [WebP](../public/prologue/tile-front-landscape-crown-special-v1.webp) |
| 3 | `prologue/tile-back-portrait-v1.png` | [prologue/tile-back-portrait-special-v1.png](../public/prologue/tile-back-portrait-special-v1.png) | [WebP](../public/prologue/tile-back-portrait-special-v1.webp) |
| 4 | `prologue/tile-back-landscape-v1.png` | [prologue/tile-back-landscape-special-v1.png](../public/prologue/tile-back-landscape-special-v1.png) | [WebP](../public/prologue/tile-back-landscape-special-v1.webp) |
| 5 | `prologue/wager-rest-portrait-symbols-v1.png` | [prologue/wager-rest-portrait-symbols-special-v1.png](../public/prologue/wager-rest-portrait-symbols-special-v1.png) | [WebP](../public/prologue/wager-rest-portrait-symbols-special-v1.webp) |
| 6 | `prologue/wager-rest-wide-symbols-v1.png` | [prologue/wager-rest-wide-symbols-special-v1.png](../public/prologue/wager-rest-wide-symbols-special-v1.png) | [WebP](../public/prologue/wager-rest-wide-symbols-special-v1.webp) |
| 7 | `prologue/wager-speaking-portrait-symbols-v1.png` | [prologue/wager-speaking-portrait-symbols-special-v1.png](../public/prologue/wager-speaking-portrait-symbols-special-v1.png) | [WebP](../public/prologue/wager-speaking-portrait-symbols-special-v1.webp) |
| 8 | `prologue/wager-speaking-wide-symbols-v1.png` | [prologue/wager-speaking-wide-symbols-special-v1.png](../public/prologue/wager-speaking-wide-symbols-special-v1.png) | [WebP](../public/prologue/wager-speaking-wide-symbols-special-v1.webp) |
| 9 | `prologue/stone-revelation-portrait-v1.png` | [prologue/stone-revelation-portrait-special-v1.png](../public/prologue/stone-revelation-portrait-special-v1.png) | [WebP](../public/prologue/stone-revelation-portrait-special-v1.webp) |
| 10 | `prologue/stone-revelation-landscape-v1.png` | [prologue/stone-revelation-landscape-special-v1.png](../public/prologue/stone-revelation-landscape-special-v1.png) | [WebP](../public/prologue/stone-revelation-landscape-special-v1.webp) |
| 11 | `prologue/st3-keepsake-handoff-portrait-v1.png` | [prologue/st3-keepsake-handoff-portrait-special-v1.png](../public/prologue/st3-keepsake-handoff-portrait-special-v1.png) | [WebP](../public/prologue/st3-keepsake-handoff-portrait-special-v1.webp) |
| 12 | `prologue/st3-keepsake-handoff-wide-v1.png` | [prologue/st3-keepsake-handoff-wide-special-v1.png](../public/prologue/st3-keepsake-handoff-wide-special-v1.png) | [WebP](../public/prologue/st3-keepsake-handoff-wide-special-v1.webp) |
| 13 | `prologue/st3-keepsake-compare-portrait-v1.png` | [prologue/st3-keepsake-compare-portrait-special-v1.png](../public/prologue/st3-keepsake-compare-portrait-special-v1.png) | [WebP](../public/prologue/st3-keepsake-compare-portrait-special-v1.webp) |
| 14 | `prologue/st3-keepsake-compare-wide-v1.png` | [prologue/st3-keepsake-compare-wide-special-v1.png](../public/prologue/st3-keepsake-compare-wide-special-v1.png) | [WebP](../public/prologue/st3-keepsake-compare-wide-special-v1.webp) |
| 15 | `story/st6-flame-two-portrait-v1.png` | [story/st6-flame-two-portrait-special-v1.png](../public/story/st6-flame-two-portrait-special-v1.png) | [WebP](../public/story/st6-flame-two-portrait-special-v1.webp) |
| 16 | `story/st9-key-two-portrait-v1.png` | [story/st9-key-two-portrait-special-v1.png](../public/story/st9-key-two-portrait-special-v1.png) | [WebP](../public/story/st9-key-two-portrait-special-v1.webp) |
| 17 | `story/true-ending-record-portrait-v1.png` | [story/true-ending-record-portrait-special-v1.png](../public/story/true-ending-record-portrait-special-v1.png) | [WebP](../public/story/true-ending-record-portrait-special-v1.webp) |
| 18 | `story/true-ending-village-portrait-v1.png` | [story/true-ending-village-portrait-special-v1.png](../public/story/true-ending-village-portrait-special-v1.png) | [WebP](../public/story/true-ending-village-portrait-special-v1.webp) |
| 19 | `story/ending-handoff-portrait-v1.png` | [story/ending-handoff-portrait-special-v1.png](../public/story/ending-handoff-portrait-special-v1.png) | [WebP](../public/story/ending-handoff-portrait-special-v1.webp) |
| 20 | `story/st6-flame-two-portrait-v1.png` | [story/st6-flame-two-back-portrait-special-v1.png](../public/story/st6-flame-two-back-portrait-special-v1.png) | [WebP](../public/story/st6-flame-two-back-portrait-special-v1.webp) |
| 21 | `story/st9-key-two-portrait-v1.png` | [story/st9-key-two-back-portrait-special-v1.png](../public/story/st9-key-two-back-portrait-special-v1.png) | [WebP](../public/story/st9-key-two-back-portrait-special-v1.webp) |
