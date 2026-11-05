# 낼 수 없는 손패 표시 보정 — 로컬 미게시

## 반영

- 사용자 첨부 `1-codex-handoff-tile-glitch.md`의 수정 요청을 반영했다. 모바일 GPU 원인은 첨부의 가설이며, 실기기에서 원인을 확정한 것은 아니다.
- 기준 버전은 package.json·lib/version.ts 모두 `0.6.70`. 앞선 봇 AI Worker 재사용 미커밋 수정은 보존했다.
- `duel-polish-0642.css`의 손패 SVG `backface-visibility:hidden`을 제거했다. 실제 뒤집기 연출의 앞/뒷면 스타일은 유지했다.
- `TileFace.tsx`의 일반/스테이지 패 모두 `muted`일 때 숫자·재질 위에 `CARTOON_TILE_PATH`, 회색 `#cfcfc8`, 불투명도 `.38`인 SVG 면을 그린다. 문양 그룹과 카툰 외곽선은 그 뒤에 그려 기존 색과 외곽선을 유지한다.
- 손패에 남아 있던 흐림/밝기 CSS filter와 `.tile-main-art` opacity 및 0642/0650/교환 화면의 불필요한 덮어쓰기를 제거했다. 문양 색 보호 규칙과 disabled 버튼이 전체적으로 흐려지지 않게 하는 기본 `opacity:1`은 유지했다.
- 선택한 손패에는 `muted`를 전달하지 않는다. 손패 컨테이너의 isolation/contain 및 선택·제출 판정은 유지했다.

## 이번 검증

- Node `v24.22.1`, 체크아웃 `scripts/register-tests.mjs` 사용.
- `node --import ./scripts/register-tests.mjs --test tests/tile-muted-gpu.test.tsx tests/tile-art-065.test.tsx tests/tile-original-ornament.test.tsx tests/interaction-polish-0650.test.tsx tests/stage-ui.test.tsx tests/tile-gestures.test.ts tests/selection.test.ts tests/stage-preview-framing.test.tsx tests/duel-polish-0642.test.tsx`: 총 10개 검사 중 8개 통과, 2개 기존 실패.
- 새 검사: 일반+10스테이지 × 4문양 × 숫자1/2/7/15 × 기본/작은 크기 = 352개 조합의 muted/일반 쌍을 렌더링했다. 흐림 면 유무·그림 순서·문양 보존 및 CSS 합성 유발 규칙 제거를 확인했다.
- `interaction-polish-0650.test.tsx`: 어두운 재질의 문양 color가 항상 기본 색과 같아야 한다는 기존 단언 실패. `stage-ui.test.tsx`: 뒷면 대비가 8보다 커야 한다는 기존 단언 실패.
- 위 2개는 `--import ../artifacts/baseline-head-loader-1104.mjs`로 HEAD 코드를 메모리에 로드한 비교 실행에서도 같은 위치/오류로 재현했다. 테스트 기대값은 바꾸지 않았다.
- TypeScript 검사와 `git diff --check` 통과.
- 컴퓨터 사용 도구로 확인한 현재 제한: `Local browser use is disabled in Work settings`. 실제 브라우저 화면·DevTools Layer borders·Android Chrome 실기기는 미검증이다. 글리치 해결 확정이나 실측 성능 개선으로 보고하지 않는다.

버전 `0.6.70` 유지. 로컬 저장만 수행했으며 빌드·커밋·push·배포 없음. 다음 변경 배포 시 버전은 `0.6.71` 이상으로 올린다.
