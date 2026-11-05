# 봇 AI Worker 재사용 — 로컬 미게시

- 기준: `main`, HEAD `0a9a637`, 앱/package 버전 `0.6.70`. 작업 시작 시 Git 작업 트리 깨끗함.
- 사용자 첨부 `1-local-bot.ts` 및 `2-local-bot-worker-reuse.patch`를 비교해 최신 `lib/local-bot.ts`에 반영. 첨부 원본 보존.
- 완료된 탐색 Worker를 다음 AI 턴에서 재사용한다. 동시에 요청되면 별도 임시 Worker를 사용하고 완료 후 해제한다.
- 전송할 RPG 여정의 `mini`/`letterMini` 테이블을 제외하고 응답에 원래 테이블을 복원한다. 호출 원본은 변경하지 않는다.
- 7초 시간 초과 또는 Worker 오류/지원 불가 시 Worker를 폐기하고 일반전은 공개 정보 기반 3단계 휴리스틱으로 진행한다. HP 아이템전의 기존 아이템/직업 판단 경로는 유지한다.
- 취소는 해당 요청 Worker만 종료하며, 이미 취소된 새 요청은 진행 중인 다른 요청을 종료하지 않는다. 종료 후 늦은 응답은 무시한다.
- 기존 Worker 회귀 검사의 기대값을 성공 후 재사용/취소 시 종료에 맞춰 수정하고, 재사용·미니게임 복원·동시 요청·취소·늦은 응답·시간 초과·오류 회귀 검사를 추가했다.

## 이번 검증

- Node `v24.22.1`, 체크아웃의 `scripts/register-tests.mjs` 사용. README의 이전 `source/tools/register-tests.mjs`는 실제로 없으며, 인계 폴더 `tools/` 및 체크아웃 `scripts/`에 로더가 존재한다.
- `node --import ./scripts/register-tests.mjs --test tests/local-bot-worker-reuse.test.ts tests/release-0516.test.tsx tests/hp-item-mode.test.ts tests/hp-item-battle.test.ts tests/item-battle-ai-0643.test.ts tests/bot-lookahead.test.ts tests/strategy.test.ts tests/visibility-and-rank.test.ts tests/stage-bot.test.ts`: 9개 중 7개 통과, 기존 HP 아이템 검사 2개 실패.
- `hp-item-mode.test.ts`: `패와 연출이 끝난 뒤 사용 가능`. `hp-item-battle.test.ts`: `보유한 전술 아이템을 확인해 주세요.`
- 두 실패는 기존 `artifacts/baseline-head-loader-1104.mjs`로 현재 HEAD 소스를 메모리에 로드해 동일 명령으로 비교했으며 동일 오류/위치에서 재현됐다. 작업 파일을 되돌리거나 기존 검사를 완화하지 않았다.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false` 및 `git diff --check` 통과.
- 실제 브라우저 실행/성능 측정은 수행하지 않았다. Worker 수명 주기 검증은 모의 Worker를 사용한다.

빌드·커밋·push·배포 없음. 로컬 버전 `0.6.70` 유지. 다음 변경 배포 시 `0.6.71` 이상으로 올려야 한다.
